
import React, { useState } from 'react';
import { NoteContent, User } from '../types.ts';
import { webSearchNotes } from '../services/groqService.ts';
import { Search, Sparkles, Loader2 } from 'lucide-react';

interface SearchModuleProps {
  user: User;
  onNoteGenerated: (note: NoteContent) => void;
}

const SearchModule: React.FC<SearchModuleProps> = ({ user, onNoteGenerated }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'Academic' | 'Latest' | 'Tutorials'>('Academic');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { notes } = await webSearchNotes(`${filter} focus: ${query}`);
      const historyKey = `edugenius_history_${user.id}`;
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      localStorage.setItem(historyKey, JSON.stringify([notes, ...history].slice(0, 20)));
      onNoteGenerated(notes);
    } catch (err) {
      alert("AI explorer encountered an error. Try a specific research query.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-14 py-10">
      <section className="text-center space-y-5 max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05] animate-fade-up" style={{ animationDelay: '0.1s' }}>
          Uncover Deep <br/>
          <span className="text-gradient">Grounding Truth.</span>
        </h2>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
          Explore high-density study materials generated from peer-reviewed journals and high-trust academic archives.
        </p>
      </section>

      <div className="bg-white dark:bg-slate-900/50 rounded-[4rem] p-4 sm:p-8 shadow-premium border border-slate-200/50 dark:border-white/5 max-w-4xl mx-auto backdrop-blur-3xl animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-5 items-center">
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-brand-600" />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are we researching today?"
              className="w-full bg-slate-50 dark:bg-slate-950/80 border-none rounded-[3rem] px-8 py-6 pl-16 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-bold text-base text-slate-900 dark:text-white shadow-inner"
            />
          </div>
          <button 
            type="submit"
            disabled={loading || !query}
            className="w-full sm:w-auto bg-gradient-to-br from-brand-600 to-indigo-600 hover:scale-105 text-white px-10 py-6 rounded-[3rem] font-black text-xs flex items-center justify-center gap-3 shadow-2xl shadow-brand-500/30 disabled:opacity-30 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate Insights
          </button>
        </form>
        
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          {['Academic', 'Latest', 'Tutorials'].map((f, i) => (
            <button 
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-wider transition-all ${
                filter === f 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-105' 
                : 'bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f} Focus
            </button>
          ))}
        </div>
      </div>

      {/* Removed hardcoded placeholder panels (Global Research Pulse / Grounded IQ). */}
    </div>
  );
};

export default SearchModule;
