// services/groqService.ts
import { NoteContent, Quiz, SourceCard, QuizResult } from "../types";

const GROQ_API_BASE = "https://api.groq.com/openai/v1";
const GROQ_API_URL = `${GROQ_API_BASE}/chat/completions`;
const GROQ_MODEL = "llama-3.1-8b-instant";
const API_KEY = import.meta.env.VITE_GROQ_API_KEY || ""; // Set this in your environment

async function groqRequest(messages: any[], max_tokens = 1024, temperature = 0.7) {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens,
      temperature,
    }),
  });
  if (!response.ok) throw new Error("Groq API request failed");
  const data = await response.json();
  return data.choices[0].message.content;
}

function parseJsonSafe(payload: string) {
  try {
    return JSON.parse(payload);
  } catch {
    const start = payload.indexOf("{");
    const end = payload.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(payload.slice(start, end + 1));
      } catch {
        return {};
      }
    }
    return {};
  }
}

function coerceString(value: any, fallback = ""): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(v => coerceString(v)).join("\n");
  if (value == null) return fallback;
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

function coerceStringArray(value: any): string[] {
  if (Array.isArray(value)) return value.map(v => coerceString(v)).filter(Boolean);
  if (typeof value === "string") return [value];
  return [];
}

function coerceCategory(value: any, fallback: NoteContent["category"] = "General"): NoteContent["category"] {
  const s = coerceString(value, fallback);
  if (s === "Business" || s === "Technical" || s === "Creative" || s === "General") return s;
  return fallback;
}

function coerceActionItems(value: any) {
  if (!Array.isArray(value)) return [];
  return value
    .map((a: any) => ({ task: coerceString(a?.task).trim() }))
    .filter((a: any) => a.task);
}

function toMarkdown(value: any, depth = 2): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  if (Array.isArray(value)) {
    const items = value
      .map((item) => {
        if (typeof item === "string") return `- ${item}`;
        if (item && typeof item === "object") {
          const heading = coerceString(item.heading || item.title || item.name);
          const text = coerceString(item.text || item.description || item.body);
          if (heading && text) return `### ${heading}\n\n${text}`;
          if (heading) return `### ${heading}`;
          if (text) return `- ${text}`;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n");
    return items;
  }
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, val]) => {
        const header = `${"#".repeat(Math.min(depth, 6))} ${key}`;
        const body = toMarkdown(val, depth + 1);
        return body ? `${header}\n\n${body}` : header;
      })
      .join("\n\n");
  }
  return coerceString(value);
}

function coerceStructuredNotes(value: any): string {
  if (typeof value === "string") return value;
  return toMarkdown(value);
}

function ensureStructuredMarkdown(value: string): string {
  if (!value) return value;
  if (value.includes("#")) return value;
  const lines = value.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length <= 1) return value;
  const out: string[] = [];
  for (const line of lines) {
    if (line.length <= 40 && /^[A-Za-z0-9 ].+$/.test(line) && !line.endsWith(".")) {
      out.push(`## ${line}`);
    } else {
      out.push(`- ${line.replace(/^[-*]\s+/, "")}`);
    }
  }
  return out.join("\n");
}

function coerceVisualData(value: any): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const candidate =
      value.mermaid_code ||
      value.mermaid ||
      value.diagram ||
      value.code ||
      value.visualData ||
      value.flowchart;
    if (typeof candidate === "string") return candidate;
  }
  return "";
}

async function groqJsonRequest(messages: any[], max_tokens = 1024, temperature = 0.3) {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "Return only a valid JSON object. No markdown, no extra text." },
        ...messages
      ],
      max_tokens,
      temperature,
      response_format: { type: "json_object" },
    }),
  });
  if (!response.ok) throw new Error("Groq API request failed");
  const data = await response.json();
  return data.choices[0].message.content;
}

export const webSearchNotes = async (query: string): Promise<{ notes: NoteContent, sources: SourceCard[] }> => {
  const prompt = `RESEARCH AND ANALYZE: "${query}". Contextualize for professional/personal mastery. Provide a deep dive into the subject matter.\n\nThen, synthesize the following:\n1. High-level Executive Synthesis\n2. Structured Insight Blocks (Markdown)\n3. Detailed Analysis (Markdown, multi-paragraph)\n4. Logical Architecture/Flow diagrams (Mermaid.js)\n5. Speculative "What-If" scenarios\n6. Action Items (checkbox style)\n\nReturn a JSON object with:\n- title (string)\n- category (string)\n- structuredNotes (Markdown string ONLY, use headings + bullet points; do not return raw paragraphs; include a \"## Modules\" section with 3–6 items like \"### Module 1: Name\" followed by a short description paragraph)\n- detailedAnalysis (Markdown string, multi-paragraph explanation)\n- summary (string)\n- keyTerms (string[])\n- visualData (Mermaid.js code string starting with \"graph TD\" or \"flowchart TD\")\n- whatIfScenarios (string[])\n- actionItems (array of {task})\n\nExample for structuredNotes:\n\"## Overview\\n- Point A\\n- Point B\\n\\n## Modules\\n### Module 1: Core Concepts\\nShort description.\\n\\n### Module 2: Workflow\\nShort description.\"`;
  const content = await groqJsonRequest([
    { role: "user", content: prompt }
  ]);
  const synthesis = parseJsonSafe(content || '{}');
  return {
    notes: {
      id: Math.random().toString(36).substr(2, 9),
      title: coerceString(synthesis.title, query) || query,
      category: coerceCategory(synthesis.category, "General"),
      structuredNotes: ensureStructuredMarkdown(coerceStructuredNotes(synthesis.structuredNotes)),
      detailedAnalysis: coerceStructuredNotes((synthesis as any).detailedAnalysis),
      summary: coerceString(synthesis.summary),
      keyTerms: coerceStringArray(synthesis.keyTerms),
      visualData: coerceVisualData(synthesis.visualData),
      sources: [],
      whatIfScenarios: coerceStringArray(synthesis.whatIfScenarios),
      actionItems: coerceActionItems(synthesis.actionItems).map((a: any) => ({ 
        id: Math.random().toString(36).substr(2, 5), 
        task: a.task, 
        completed: false 
      })) || [],
      createdAt: new Date().toISOString()
    },
    sources: []
  };
};

export const generateNotesFromText = async (text: string, options?: any): Promise<NoteContent> => {
  const prompt = `Analyze the following content and return a JSON object with:\n- title (string)\n- category (string)\n- structuredNotes (Markdown string ONLY, use headings + bullet points; do not return raw paragraphs; include a \"## Modules\" section with 3–6 items like \"### Module 1: Name\" followed by a short description paragraph)\n- detailedAnalysis (Markdown string, multi-paragraph explanation)\n- summary (string)\n- keyTerms (string[])\n- visualData (Mermaid.js code string starting with \"graph TD\" or \"flowchart TD\")\n- whatIfScenarios (string[])\n- actionItems (array of {task})\n\nExample for structuredNotes:\n\"## Overview\\n- Point A\\n- Point B\\n\\n## Modules\\n### Module 1: Core Concepts\\nShort description.\\n\\n### Module 2: Workflow\\nShort description.\"\n\nContent: ${text.substring(0, 20000)}`;
  const content = await groqJsonRequest([
    { role: "user", content: prompt }
  ]);
  const data = parseJsonSafe(content || '{}');
  return {
    id: Math.random().toString(36).substr(2, 9),
    title: coerceString(data.title, "Forged Document") || "Forged Document",
    category: coerceCategory(data.category, "General"),
    structuredNotes: ensureStructuredMarkdown(coerceStructuredNotes(data.structuredNotes)),
    detailedAnalysis: coerceStructuredNotes((data as any).detailedAnalysis),
    summary: coerceString(data.summary),
    keyTerms: coerceStringArray(data.keyTerms),
    visualData: coerceVisualData(data.visualData),
    sources: [],
    whatIfScenarios: coerceStringArray(data.whatIfScenarios),
    actionItems: coerceActionItems(data.actionItems).map((a: any) => ({ 
      id: Math.random().toString(36).substr(2, 5), 
      task: a.task, 
      completed: false 
    })) || [],
    createdAt: new Date().toISOString()
  };
};

export const generateArchitectureDocs = async (title: string, promptText: string): Promise<NoteContent> => {
  const prompt = `GENERATE TECHNICAL ARCHITECTURE FOR: "${title}". REQUIREMENT: ${promptText}.\n\nReturn a JSON object with:\n- title (string)\n- category (string)\n- structuredNotes (Markdown string ONLY, use headings + bullet points; do not return raw paragraphs; include a \"## Modules\" section with 3–6 items like \"### Module 1: Name\" followed by a short description paragraph)\n- detailedAnalysis (Markdown string, multi-paragraph explanation)\n- summary (string)\n- keyTerms (string[])\n- visualData (Mermaid.js code string starting with \"graph TD\" or \"flowchart TD\")\n- whatIfScenarios (string[])\n- actionItems (array of {task})\n\nExample for structuredNotes:\n\"## Architecture Overview\\n- Component A\\n- Component B\\n\\n## Modules\\n### Module 1: Core Concepts\\nShort description.\\n\\n### Module 2: Workflow\\nShort description.\"`;
  const content = await groqJsonRequest([
    { role: "user", content: prompt }
  ]);
  const data = parseJsonSafe(content || '{}');
  return {
    id: Math.random().toString(36).substr(2, 9),
    title: coerceString(data.title, title) || title,
    category: coerceCategory(data.category, "Technical"),
    structuredNotes: ensureStructuredMarkdown(coerceStructuredNotes(data.structuredNotes)),
    detailedAnalysis: coerceStructuredNotes((data as any).detailedAnalysis),
    summary: coerceString(data.summary),
    keyTerms: coerceStringArray(data.keyTerms),
    visualData: coerceVisualData(data.visualData),
    sources: [],
    whatIfScenarios: coerceStringArray(data.whatIfScenarios),
    actionItems: coerceActionItems(data.actionItems).map((a: any) => ({ id: Math.random().toString(36).substr(2, 5), task: a.task, completed: false })) || [],
    createdAt: new Date().toISOString()
  };
};

export const generateQuiz = async (text: string, title: string): Promise<Partial<Quiz>> => {
  const prompt = `BUILD INTERACTIVE ASSESSMENT FOR: "${title}". Use the following context: ${text.substring(0, 15000)}.\n\nReturn a JSON object with an array of questions (question, type [MCQ, SHORT, LONG], options, correctAnswer).`;
  const content = await groqJsonRequest([
    { role: "user", content: prompt }
  ]);
  const parsed = parseJsonSafe(content || '{"questions": []}');
  return { 
    id: Math.random().toString(36).substr(2, 6).toUpperCase(), 
    title, 
    questions: parsed.questions.map((q: any) => ({ 
      ...q, 
      id: Math.random().toString(36).substr(2, 9), 
      type: q.type?.toUpperCase() || "MCQ"
    }))
  };
};

export const evaluateAssessment = async (quiz: Quiz, userAnswers: Record<string, string>): Promise<Partial<QuizResult>> => {
  const prompt = `EVALUATE ASSESSMENT: ${quiz.title}. User Submission: ${JSON.stringify(userAnswers)}. Reference Answers: ${JSON.stringify(quiz.questions.map(q => ({ q: q.question, a: q.correctAnswer })))}.\n\nReturn a JSON object with: score, feedback.`;
  const content = await groqJsonRequest([
    { role: "user", content: prompt }
  ]);
  const evalData = parseJsonSafe(content || '{}');
  return {
    score: evalData.score || 0,
    totalQuestions: quiz.questions.length,
    percentage: ((evalData.score || 0) / quiz.questions.length) * 100,
    feedback: evalData.feedback || "Evaluation complete.",
    answers: userAnswers
  };
};

export const getAITutorExplanation = async (concept: string, level: string): Promise<string> => {
  const prompt = `Explain "${concept}" for a ${level} audience. Contextualize for real-world mastery. Use analogies and clear examples.`;
  return await groqRequest([
    { role: "user", content: prompt }
  ], 512, 0.7);
};

export const simulateWhatIfScenario = async (title: string, scenario: string, context?: string): Promise<string> => {
  const clippedContext = coerceString(context || "").slice(0, 15000);
  const prompt = `SIMULATE "WHAT-IF" SCENARIO for: "${title}".

Scenario: "${scenario}"

Context (may be empty):
${clippedContext}

Return a JSON object with:
- resultMarkdown (Markdown string)

Formatting requirements for resultMarkdown:
- Use headings and bullet points only (no raw paragraphs)
- Start with "## Overview" (2-4 bullets)
- Then "## Likely Changes" (5-8 bullets)
- Then "## Risks & Tradeoffs" (3-6 bullets)
- Then "## Actionable Takeaways" (3-5 bullets)
- Keep it concise and directly tied to the scenario`;

  const content = await groqJsonRequest([{ role: "user", content: prompt }], 700, 0.4);
  const data = parseJsonSafe(content || "{}");
  return coerceString((data as any).resultMarkdown || (data as any).result || (data as any).markdown).trim();
};
