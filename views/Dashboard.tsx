
import React, { useState, useEffect } from 'react';
import { User, NoteContent, Quiz } from '../types.ts';
import { webSearchNotes } from '../services/groqService.ts';
import { 
  Search, 
  FileText, 
  Clock, 
  ArrowRight,
  Loader2,
  Rocket,
  Briefcase,
  PenTool,
  Cpu,
  Trophy
} from 'lucide-react';

interface DashboardProps {
  user: User;
  onViewNote: (note: NoteContent) => void;
  onStartQuiz: (quiz: Quiz) => void;
  onSwitchTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onViewNote, onStartQuiz, onSwitchTab }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentWork, setRecentWork] = useState<NoteContent[]>([]);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem(`edugenius_history_${user.id}`) || '[]');
    setRecentWork(history.slice(0, 3));
  }, [user.id]);

  const handleSmartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { notes } = await webSearchNotes(query);
      const historyKey = `edugenius_history_${user.id}`;
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      localStorage.setItem(historyKey, JSON.stringify([notes, ...history].slice(0, 20)));
      onViewNote(notes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-8 sm:space-y-12 py-6 md:py-10">
      <section className="relative flex flex-col items-center text-center space-y-4 px-2 animate-fade-up">
        <div className="space-y-3 max-w-4xl w-full">
          <h1 className="font-black tracking-tight text-slate-900 dark:text-white leading-[0.95]">
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl block">Scale Your</span>
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-indigo-500 via-rose-500 to-emerald-500 bg-clip-text text-transparent">Greatest Mind.</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed px-2">
            The ultimate studio for synthesizing complex data into high-performance insights for business, engineering, and the creative arts.
          </p>
        </div>

        <div className="w-full max-w-4xl px-2">
          <div className="p-2 sm:p-3 bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[4rem] shadow-premium border border-slate-200/50 dark:border-white/5 backdrop-blur-2xl relative group transition-all hover:shadow-indigo-500/20">
            <form onSubmit={handleSmartSearch} className="relative flex items-center">
              <div className="absolute left-4 sm:left-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Search className="w-4 sm:w-5 h-4 sm:h-5" />
              </div>
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Synthesize any domain..."
                className="w-full bg-transparent border-none py-4 sm:py-6 pl-10 sm:pl-14 pr-16 sm:pr-24 text-sm sm:text-lg font-black outline-none placeholder:text-slate-300 dark:text-white transition-all"
              />
              <button 
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 w-10 sm:w-14 h-10 sm:h-14 bg-gradient-to-br from-indigo-600 to-rose-600 hover:scale-105 text-white rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-95 disabled:opacity-30"
              >
                {loading ? <Loader2 className="w-4 sm:w-6 h-4 sm:h-6 animate-spin" /> : <Rocket className="w-4 sm:w-6 h-4 sm:h-6" />}
              </button>
            </form>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2 px-1">
            {[
              { id: 'business', label: 'Business Strategy', icon: Briefcase },
              { id: 'tech', label: 'Technical Logic', icon: Cpu },
              { id: 'creative', label: 'Creative Design', icon: PenTool },
              { id: 'mastery', label: 'Universal Mastery', icon: Trophy }
            ].map(tool => (
              <button 
                key={tool.id}
                onClick={() => setQuery(`Synthesize ${tool.label} for: `)}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl flex items-center gap-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-900 dark:hover:text-white hover:border-slate-400 transition-all shadow-sm active:scale-95 whitespace-nowrap"
              >
                <tool.icon className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                {tool.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Removed hardcoded placeholder feature cards. */}

      {recentWork.length > 0 && (
        <section className="space-y-6 animate-fade-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-900 dark:bg-white rounded-xl text-white dark:text-slate-900 shadow-xl">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Active Synthesis Nodes</h3>
            </div>
            <button onClick={() => onSwitchTab('library')} className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline flex items-center gap-1">
              Vault <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {recentWork.map((note) => (
              <div key={note.id} onClick={() => onViewNote(note)} className="group p-5 sm:p-7 bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 dark:border-white/5 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="w-11 h-11 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate mb-2 tracking-tight">{note.title}</h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 font-medium leading-relaxed mb-6">{note.summary}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-white/5">
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                    note.category === 'Business' ? 'bg-emerald-500/10 text-emerald-500' :
                    note.category === 'Technical' ? 'bg-indigo-500/10 text-indigo-500' :
                    note.category === 'Creative' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-500/10 text-slate-500'
                  }`}>
                    {note.category}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-2 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
