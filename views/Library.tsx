import React, { useState, useEffect } from 'react';
import { NoteContent, User } from '../types.ts';
import { History, Bookmark, Trash2, ArrowRight, FileText, Search, Clock, Calendar } from 'lucide-react';

interface LibraryProps {
  user: User;
  onViewNote: (note: NoteContent) => void;
}

const Library: React.FC<LibraryProps> = ({ user, onViewNote }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'saved'>('history');
  const [history, setHistory] = useState<NoteContent[]>([]);
  const [saved, setSaved] = useState<NoteContent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadLibrary();
  }, [user.id]);

  const loadLibrary = () => {
    const h = JSON.parse(localStorage.getItem(`edugenius_history_${user.id}`) || '[]');
    const s = JSON.parse(localStorage.getItem(`edugenius_saved_${user.id}`) || '[]');
    setHistory(Array.isArray(h) ? h : []);
    setSaved(Array.isArray(s) ? s : []);
  };

  const removeItem = (type: 'history' | 'saved', id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = `edugenius_${type}_${user.id}`;
    const items = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = items.filter((item: any) => item.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
    if (type === 'history') setHistory(filtered);
    else setSaved(filtered);
  };

  const displayItems = (activeTab === 'history' ? history : saved).filter(item => {
    const matchesQuery = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (item.createdAt) {
      const itemDate = new Date(item.createdAt);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (itemDate < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (itemDate > end) matchesDate = false;
      }
    } else if (startDate || endDate) {
      // If filtering by date but item has no date, exclude it
      matchesDate = false;
    }

    return matchesQuery && matchesDate;
  });

  const EmptyState = ({ icon: Icon, title, desc }: any) => (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-up">
      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-slate-300">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">{desc}</p>
    </div>
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Unknown Date';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex p-1.5 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit">
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Recent Work
            </button>
            <button 
              onClick={() => setActiveTab('saved')}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'saved' ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Vault (Saved)
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search items..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-brand-500/10 outline-none transition-all dark:text-white"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-2xl border transition-all ${showFilters ? 'bg-brand-500 text-white border-brand-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'}`}
            >
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 animate-fade-up">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Start Date</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-brand-500/10 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">End Date</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-brand-500/10 dark:text-white"
              />
            </div>
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="sm:col-span-2 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline text-center mt-2"
              >
                Clear Date Filters
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {displayItems.length === 0 ? (
          <EmptyState 
            icon={activeTab === 'history' ? Clock : Bookmark} 
            title={searchQuery || startDate || endDate ? "No matches found" : `No ${activeTab} items yet`} 
            desc={searchQuery || startDate || endDate ? "Try refining your search terms or date range." : "Synthesized resources will appear here automatically."}
          />
        ) : (
          displayItems.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onViewNote(item)}
              className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-premium hover:shadow-2xl hover:border-brand-500/20 active:scale-[0.99] transition-all flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer animate-fade-up"
            >
              <div className="flex-1 overflow-hidden mr-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-lg font-black text-slate-900 dark:text-white truncate tracking-tight leading-tight">{item.title}</h4>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{formatDate(item.createdAt)}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 line-clamp-2 pl-12 leading-relaxed font-medium">{item.summary}</p>
              </div>
              
              <div className="flex items-center gap-6 mt-6 md:mt-0 pl-12 md:pl-0 shrink-0">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Concepts</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{(item.keyTerms?.length || 0)}</span>
                </div>
                <div className="h-10 w-[1px] bg-slate-100 dark:bg-slate-800" />
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => removeItem(activeTab, item.id, e)}
                    className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-2xl transition-all"
                    title="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-brand-50 dark:bg-brand-900/10 text-brand-600 rounded-2xl shadow-sm hover:bg-brand-100 transition-all">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Library;