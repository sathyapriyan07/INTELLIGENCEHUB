
import React, { useState } from 'react';
import { NoteContent, Quiz, User } from '../types.ts';
import { webSearchNotes } from '../services/groqService.ts';
import { Search, Sparkles, Globe, FileText, Loader2, ArrowRight, Zap, CheckCircle } from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  onViewNote: (note: NoteContent) => void;
  onStartQuiz: (quiz: Quiz) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onViewNote, onStartQuiz }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [readyNote, setReadyNote] = useState<NoteContent | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { notes } = await webSearchNotes(query);
      setReadyNote(notes);
    } catch (err) {
      alert("AI synthesis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-4 animate-subtle">
      <section className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-4xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">What are we learning?</h2>
          <form onSubmit={handleSearch} className="relative group">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Quantum Entanglement"
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-semibold text-slate-800 dark:text-white"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-brand-500" />
            <button 
              type="submit"
              disabled={loading || !query}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white disabled:opacity-30 transition-all active:scale-90 hover:bg-brand-600"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex flex-col items-start bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-3xl border border-indigo-100 dark:border-indigo-800 group active:scale-95 transition-all text-left">
            <Zap className="w-10 h-10 text-indigo-500 mb-3" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Quick Viva</h3>
          </button>
          <button className="flex flex-col items-start bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-800 group active:scale-95 transition-all text-left">
            <FileText className="w-10 h-10 text-emerald-500 mb-3" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Upload PDF</h3>
          </button>
        </div>
      </section>

      {readyNote && (
        <section className="animate-subtle">
          <div className="bg-slate-900 dark:bg-white rounded-3xl p-6 text-white dark:text-slate-900 flex items-center justify-between shadow-2xl">
            <h3 className="text-lg font-bold truncate flex-1">{readyNote.title}</h3>
            <button 
              onClick={() => onViewNote(readyNote)}
              className="px-5 py-2.5 bg-brand-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 ml-4 shrink-0 transition-all hover:bg-brand-600"
            >
              Open <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default StudentDashboard;
