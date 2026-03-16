
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, NoteContent, Quiz } from './types.ts';
import Auth from './views/Auth.tsx';
import Workspace from './views/Workspace.tsx';
import QuizSession from './views/QuizSession.tsx';
import Settings from './views/Settings.tsx';
import Library from './views/Library.tsx';
import SearchModule from './views/SearchModule.tsx';
import StudioModule from './views/StudioModule.tsx';
import LabModule from './views/LabModule.tsx';
import Dashboard from './views/Dashboard.tsx';
import StaffDashboard from './views/StaffDashboard.tsx';
import StudentDashboard from './views/StudentDashboard.tsx';
import { 
  LayoutDashboard, 
  Search, 
  Sparkles, 
  BrainCircuit, 
  User as UserIcon,
  Library as LibraryIcon,
  Bell,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Zap
} from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentNote, setCurrentNote] = useState<NoteContent | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentTab, setCurrentTab] = useState<'home' | 'search' | 'studio' | 'library' | 'lab' | 'settings'>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('edugenius_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.isEmailVerified) setUser(parsed);
    }
    
    const storedTheme = localStorage.getItem('edugenius_theme') || 'light';
    const dark = storedTheme === 'dark';
    setIsDarkMode(dark);
    document.documentElement.classList.toggle('dark', dark);

    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = useCallback(() => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('edugenius_theme', newMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('edugenius_user');
    setUser(null);
  }, []);

  const navigation = useMemo(() => [
    { id: 'home', icon: LayoutDashboard, label: 'Control Center' },
    { id: 'search', icon: Search, label: 'Research Explorer' },
    { id: 'studio', icon: Sparkles, label: 'Intelligence Studio' },
    { id: 'lab', icon: Zap, label: 'Assessment Lab' },
    { id: 'library', icon: LibraryIcon, label: 'The Vault' },
    { id: 'settings', icon: UserIcon, label: 'System Config' },
  ], []);

  const renderContent = () => {
    switch (currentTab) {
      case 'home': 
        if (user?.role === 'STAFF') {
          return <StaffDashboard user={user} onViewNote={setCurrentNote} onStartQuiz={setActiveQuiz} />;
        }
        return <Dashboard user={user!} onViewNote={setCurrentNote} onStartQuiz={setActiveQuiz} onSwitchTab={(tab: any) => setCurrentTab(tab)} />;
      case 'search': return <SearchModule user={user!} onNoteGenerated={setCurrentNote} />;
      case 'studio': return <StudioModule user={user!} onNoteGenerated={setCurrentNote} />;
      case 'lab': return <LabModule user={user!} onStartQuiz={setActiveQuiz} />;
      case 'library': return <Library user={user!} onViewNote={setCurrentNote} />;
      case 'settings': return <Settings user={user!} onUpdateUser={setUser} />;
      default: return null;
    }
  };

  if (!user || !user.isEmailVerified) return <Auth onLogin={setUser} />;
  if (activeQuiz) return <QuizSession quiz={activeQuiz} onFinish={() => setActiveQuiz(null)} />;
  if (currentNote) return <Workspace note={currentNote} user={user} onBack={() => setCurrentNote(null)} />;

  return (
    <div className="min-h-screen flex transition-colors duration-700 bg-slate-50 dark:bg-[#020617]">
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] sm:w-80 glass border-r border-white/20 transition-all duration-500 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6 sm:p-8">
          <div className="flex items-center justify-between mb-10 sm:mb-12">
            <div className="flex items-center gap-3 sm:gap-4">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Intelligence Hub</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"><X className="w-6 h-6" /></button>
          </div>

          <nav className="flex-1 space-y-1.5 sm:space-y-2 overflow-y-auto no-scrollbar">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id as any);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`w-full group flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 ${
                  currentTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${currentTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {item.label}
                </div>
                {currentTab === item.id && <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-6 pt-6 border-t border-black/5 dark:border-white/5">
            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-3 text-slate-400 hover:text-rose-500 font-bold text-xs sm:text-sm transition-colors group">
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Sign Out
            </button>
            <div className="p-4 sm:p-5 glass-intense rounded-3xl border border-white/20 shadow-premium">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black shrink-0 overflow-hidden">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 truncate uppercase tracking-widest">Synthesis Mode</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${isSidebarOpen ? 'lg:pl-80' : 'pl-0'}`}>
        <header className="h-20 sm:h-24 px-4 sm:px-12 flex items-center justify-between sticky top-0 z-40 glass-intense border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className={`p-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-500 transition-all lg:hidden ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}><Menu className="w-5 h-5" /></button>
            <div className="hidden xs:flex flex-col">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Universal Node</p>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Synthesis Studio</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl border border-black/5 dark:border-white/5">
              <button onClick={toggleTheme} className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-slate-500 dark:text-slate-400 hover:text-brand-500 hover:bg-white dark:hover:bg-slate-700 transition-all">{isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}</button>
            </div>
            <button onClick={() => setCurrentTab('studio')} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 sm:px-8 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Synthesize Knowledge</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-12 lg:p-16 overflow-x-hidden">
          <div className="max-w-7xl mx-auto animate-fade-up">
            {renderContent()}
          </div>
        </main>
      </div>
      {isSidebarOpen && window.innerWidth < 1024 && <div className="fixed inset-0 bg-black/40 backdrop-blur-[4px] z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

export default App;
