import React, { useState, useCallback } from 'react';
import { getAITutorExplanation } from '../services/groqService.ts';
import { Loader2, X, BrainCircuit, Sparkles, AlertCircle, RefreshCcw } from 'lucide-react';

interface TutorPopupProps {
  concept: string;
  onClose: () => void;
}

const TutorPopup: React.FC<TutorPopupProps> = ({ concept, onClose }) => {
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExplanation = useCallback(async (selectedLevel: 'Beginner' | 'Intermediate' | 'Advanced') => {
    setLoading(true);
    setError(null);
    setLevel(selectedLevel);
    try {
      const result = await getAITutorExplanation(concept, selectedLevel);
      if (!result || result === "Explanation unavailable.") {
        setError("The AI was unable to generate an explanation for this concept. This might be due to content safety filters or a temporary processing issue.");
      } else {
        setExplanation(result);
      }
    } catch (err: any) {
      console.error("Tutor explanation error:", err);
      if (err.message?.includes('API_KEY')) {
        setError("Invalid or missing API key. Please check your configuration.");
      } else if (!navigator.onLine) {
        setError("Connection lost. Please check your internet and try again.");
      } else {
        setError("NoteForge encountered a neural sync error. The Groq model may be experiencing high load.");
      }
    } finally {
      setLoading(false);
    }
  }, [concept]);

  React.useEffect(() => {
    fetchExplanation('Beginner');
  }, [fetchExplanation]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/5 animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-brand-600 to-accent-600 p-8 flex justify-between items-center text-white">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg uppercase tracking-tight">Neural Tutor</h2>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Adaptive Synthesis Mode</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-2xl transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Concept Focus</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{concept}</h3>
            </div>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-black/5 dark:border-white/5">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => fetchExplanation(lvl)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    level === lvl 
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  {lvl.charAt(0)}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-intense rounded-[2rem] border border-black/5 dark:border-white/5 min-h-[250px] max-h-[450px] overflow-y-auto no-scrollbar relative">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-400">
                <div className="relative">
                  <Loader2 className="w-12 h-12 animate-spin text-brand-600" />
                  <Sparkles className="w-4 h-4 text-amber-400 absolute top-0 right-0 animate-pulse" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Forging Explanation...</p>
              </div>
            ) : error ? (
              <div className="p-10 flex flex-col items-center justify-center text-center gap-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Synthesis Blocked</h4>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    {error}
                  </p>
                </div>
                <button 
                  onClick={() => fetchExplanation(level)}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  Attempt Re-Forge
                </button>
              </div>
            ) : (
              <div className="p-8 sm:p-10 prose prose-slate dark:prose-invert prose-sm max-w-none animate-in fade-in duration-500">
                <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-base">
                  {explanation}
                </div>
                <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5 flex items-center gap-2 text-brand-600 dark:text-brand-400">
                   <Sparkles className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-widest">AI Synthesis Verified</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">Powered by Groq Inference Engine</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorPopup;
