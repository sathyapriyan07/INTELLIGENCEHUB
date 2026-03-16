
import React, { useEffect, useMemo, useState } from 'react';
import { Maximize2, X, Minus, Plus, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';

declare const mermaid: any;

interface MermaidRendererProps {
  chart?: string;
  title?: string;
  structuredNotes?: string;
  detailedAnalysis?: string;
  keyTerms?: string[];
}

function sanitizeMermaidInput(raw: string): string {
  let text = (raw || "").trim();
  if (!text) return "";

  const fence = /```(?:mermaid)?\s*([\s\S]*?)```/i.exec(text);
  if (fence?.[1]) text = fence[1].trim();

  // If the model accidentally prepends explanation, slice from the first diagram directive.
  const directive = /(^|\n)\s*(flowchart|graph)\s+(TB|TD|BT|RL|LR)\b/i.exec(text);
  if (directive) {
    const start = directive.index + (directive[1]?.length ?? 0);
    text = text.slice(start).trimStart();
  }

  return text.trim();
}

function extractModulesFromMarkdown(markdown?: string): string[] {
  if (!markdown) return [];
  const modules: string[] = [];
  const re = /^###\s*Module\s*\d+\s*:\s*(.+)$/gim;
  let match: RegExpExecArray | null;
  while ((match = re.exec(markdown)) !== null) {
    const name = (match[1] || "").trim();
    if (name) modules.push(name);
  }
  return modules;
}

function extractConceptMap(markdown?: string): Array<{ title: string; items: string[] }> {
  if (!markdown) return [];
  const lines = markdown
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const sections: Array<{ title: string; items: string[] }> = [];
  let current: { title: string; items: string[] } | null = null;

  const pushCurrent = () => {
    if (!current) return;
    const title = current.title.trim();
    const items = current.items.map((i) => i.trim()).filter(Boolean);
    if (!title && items.length === 0) return;
    sections.push({ title: title || "Key Points", items });
  };

  for (const line of lines) {
    const h2 = /^##\s+(.+)$/.exec(line);
    const h3 = /^###\s+(.+)$/.exec(line);
    if (h2 || h3) {
      pushCurrent();
      current = { title: (h2?.[1] || h3?.[1] || "").trim(), items: [] };
      continue;
    }

    const bullet = /^[-*+]\s+(.+)$/.exec(line);
    const ordered = /^\d+\.\s+(.+)$/.exec(line);
    if (bullet || ordered) {
      if (!current) current = { title: "Key Points", items: [] };
      current.items.push((bullet?.[1] || ordered?.[1] || "").trim());
      continue;
    }

    // Treat short standalone lines as items if we're already in a section.
    if (current && line.length <= 160) {
      current.items.push(line);
    }
  }

  pushCurrent();
  return sections;
}

function escapeMermaidLabel(label: string): string {
  return (label || "")
    .replace(/\r?\n/g, " ")
    .replace(/"/g, "'")
    .trim();
}

function truncateMermaidLabel(label: string, maxLen = 64): string {
  const s = escapeMermaidLabel(label);
  if (s.length <= maxLen) return s;
  return `${s.slice(0, Math.max(0, maxLen - 3)).trimEnd()}...`;
}

function buildDerivedChartFromDetailedAnalysis(opts: { title?: string; detailedAnalysis?: string }): string | null {
  const sections = extractConceptMap(opts.detailedAnalysis)
    .map((s) => ({
      title: truncateMermaidLabel(s.title || "Key Points", 36),
      items: s.items.map((i) => truncateMermaidLabel(i, 72)).filter(Boolean),
    }))
    .filter((s) => s.title || s.items.length);

  if (sections.length === 0) return null;

  const lines: string[] = [];
  lines.push("flowchart TD");
  lines.push(`root["${truncateMermaidLabel(opts.title || "Concept", 42)}"]`);

  sections.slice(0, 6).forEach((section, i) => {
    const sectionId = `s${i + 1}`;
    lines.push(`${sectionId}["${section.title}"]`);
    lines.push(`root --> ${sectionId}`);

    section.items.slice(0, 4).forEach((item, j) => {
      const itemId = `${sectionId}_${j + 1}`;
      lines.push(`${itemId}["${item}"]`);
      lines.push(`${sectionId} --> ${itemId}`);
    });
  });

  return lines.join("\n");
}

function buildFallbackChart(opts: { title?: string; detailedAnalysis?: string; modules?: string[]; keyTerms?: string[] }): string {
  const title = escapeMermaidLabel(opts.title || "Concept");
  const modules = (opts.modules || []).map(escapeMermaidLabel).filter(Boolean);
  const terms = (opts.keyTerms || []).map(escapeMermaidLabel).filter(Boolean);

  const lines: string[] = [];
  lines.push("flowchart TD");
  lines.push(`root["${title}"]`);

  const children = (modules.length ? modules : terms).slice(0, 6);
  children.forEach((child, i) => {
    const id = `n${i + 1}`;
    lines.push(`${id}["${child}"]`);
    lines.push(`root --> ${id}`);
  });

  if (modules.length === 0 && terms.length === 0) {
    lines.push('n1["No diagram data available"]');
    lines.push("root --> n1");
  }

  return lines.join("\n");
}

async function tryRenderMermaid(code: string): Promise<string> {
  const normalized = sanitizeMermaidInput(code);
  if (!normalized) throw new Error("Empty Mermaid code");

  // `mermaid.parse` throws on invalid syntax (v10+); ensure we fail fast instead of showing Mermaid's own error SVG.
  if (typeof mermaid.parse === "function") {
    const parsed = mermaid.parse(normalized);
    if (parsed && typeof parsed.then === "function") {
      const awaited = await parsed;
      if (awaited === false) throw new Error("Mermaid parse failed");
    } else if (parsed === false) {
      throw new Error("Mermaid parse failed");
    }
  }

  const uniqueId = `mermaid-svg-${Math.random().toString(36).slice(2, 11)}`;
  const { svg: renderedSvg } = await mermaid.render(uniqueId, normalized);
  if (/(Syntax error in text|Parse error|Lexical error)/i.test(renderedSvg)) throw new Error("Mermaid syntax error");
  return renderedSvg;
}

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart, title, structuredNotes, detailedAnalysis, keyTerms }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const canFullscreen = Boolean(svg) && !rendering && !error;

  const svgWithResponsivePatch = useMemo(() => {
    if (!svg) return "";
    // Mermaid sometimes emits `max-width: 100%` / `width: 100%` which makes wide diagrams tiny.
    // We prefer natural sizing with scroll, and allow zoom in fullscreen.
    return svg
      .replace(/max-width:\s*100%;?/gi, "max-width: none;")
      .replace(/width:\s*100%;?/gi, "width: auto;");
  }, [svg]);

  useEffect(() => {
    if (typeof mermaid === 'undefined') return;
    const hasAnyInput =
      Boolean((chart || "").trim()) ||
      Boolean((detailedAnalysis || "").trim()) ||
      Boolean((structuredNotes || "").trim()) ||
      Boolean((keyTerms || []).length);
    if (!hasAnyInput) return;

    const renderChart = async () => {
      setRendering(true);
      setError(null);
      setSvg('');
      try {
        // Initialize with optimal settings for the current theme
        const isDark = document.documentElement.classList.contains('dark');
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'neutral',
          securityLevel: 'loose',
          fontFamily: 'Plus Jakarta Sans',
          flowchart: { useMaxWidth: false },
          themeVariables: {
            primaryColor: '#6366f1',
            primaryTextColor: isDark ? '#fff' : '#1e293b',
            lineColor: '#6366f1',
          }
        });

        // Prefer a derived diagram from Detailed Analysis (headings + bullet points). This keeps the diagram grounded
        // in the content even when the model returns an unrelated/invalid Mermaid chart.
        try {
          const derived = buildDerivedChartFromDetailedAnalysis({ title, detailedAnalysis });
          if (!derived) throw new Error("No derived diagram");
          const renderedSvg = await tryRenderMermaid(derived);
          setSvg(renderedSvg);
          return;
        } catch {
          // If there is no detailed analysis to derive from, try AI chart and then a deterministic fallback.
          try {
            if (!chart || !chart.trim()) throw new Error("No AI diagram");
            const renderedSvg = await tryRenderMermaid(chart);
            setSvg(renderedSvg);
            return;
          } catch {
            const fallback = buildFallbackChart({
              title,
              modules: extractModulesFromMarkdown(structuredNotes),
              keyTerms,
            });
            const renderedSvg = await tryRenderMermaid(fallback);
            setSvg(renderedSvg);
          }
        }
      } catch (err) {
        console.error("Mermaid rendering failed:", err);
        setError("Flowchart visualization could not be generated from the AI data.");
      } finally {
        setRendering(false);
      }
    };

    renderChart();
  }, [chart, title, structuredNotes, detailedAnalysis, keyTerms]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fullscreen]);

  if (
    !(chart || "").trim() &&
    !(detailedAnalysis || "").trim() &&
    !(structuredNotes || "").trim() &&
    !(keyTerms || []).length
  ) return null;

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 md:p-10 shadow-inner">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Conceptual Architecture</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Generated Logical Flow</p>
        </div>
        <div className="flex gap-2">
           <button
             type="button"
             onClick={() => {
               if (!canFullscreen) return;
               setZoom(1);
               setFullscreen(true);
             }}
             disabled={!canFullscreen}
             className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-brand-600 transition-all shadow-sm disabled:opacity-40 disabled:hover:text-slate-400"
             aria-label="Open fullscreen"
             title="Fullscreen"
           >
             <Maximize2 className="w-4 h-4" />
           </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-950 p-4 md:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-premium overflow-auto min-h-[360px]">
        {rendering ? (
          <div className="min-h-[340px] flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest">Synthesizing Visuals...</span>
          </div>
        ) : error ? (
          <div className="min-h-[340px] flex flex-col items-center justify-center gap-3 text-rose-500 text-center max-w-xs mx-auto">
            <AlertCircle className="w-8 h-8" />
            <span className="text-xs font-bold leading-relaxed">{error}</span>
          </div>
        ) : (
          <div 
            className="mermaid-container w-fit"
            style={{ transformOrigin: "top left" }}
            dangerouslySetInnerHTML={{ __html: svgWithResponsivePatch }} 
          />
        )}
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-[200]">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            onClick={() => setFullscreen(false)}
          />
          <div className="absolute inset-4 sm:inset-8 bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Conceptual Architecture</p>
                <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {title || "Diagram"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.6, Math.round((z - 0.1) * 10) / 10))}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900/60 transition-colors"
                  aria-label="Zoom out"
                  title="Zoom out"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(2.2, Math.round((z + 0.1) * 10) / 10))}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900/60 transition-colors"
                  aria-label="Zoom in"
                  title="Zoom in"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900/60 transition-colors"
                  aria-label="Reset zoom"
                  title="Reset zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {Math.round(zoom * 100)}%
                </div>
                <button
                  type="button"
                  onClick={() => setFullscreen(false)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors"
                  aria-label="Close fullscreen"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              <div
                className="w-fit"
                style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
                dangerouslySetInnerHTML={{ __html: svgWithResponsivePatch }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MermaidRenderer;
