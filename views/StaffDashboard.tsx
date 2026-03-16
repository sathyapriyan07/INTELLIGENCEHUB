
import React, { useState, useRef, useEffect } from 'react';
import { NoteContent, Quiz, User, SourceCard } from '../types.ts';
import { generateNotesFromText, webSearchNotes, generateQuiz } from '../services/groqService.ts';
import { 
  Plus, Users, Layout, FileText, Copy, Check, Loader2, 
  BarChart3, X, Sparkles, Clock, Shield, Globe, Upload, Search, 
  Mail, FileUp, Save 
} from 'lucide-react';

interface StaffDashboardProps {
  user: User;
  onViewNote: (note: NoteContent) => void;
  onStartQuiz: (quiz: Quiz) => void;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ user, onViewNote, onStartQuiz }) => {
  const [activeTab, setActiveTab] = useState<'manage' | 'search' | 'upload'>('manage');
  const [activeQuizzes, setActiveQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [uploadText, setUploadText] = useState('');
  const [readyNote, setReadyNote] = useState<NoteContent | null>(null);
  const [isEmailing, setIsEmailing] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [timeLimit, setTimeLimit] = useState(20);

  useEffect(() => {
    const allQuizzes = JSON.parse(localStorage.getItem('edugenius_global_quizzes') || '[]');
    const myQuizzes = allQuizzes.filter((q: Quiz) => q.createdBy === user.name);
    setActiveQuizzes(myQuizzes);
  }, [user.name]);

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !title.trim()) return;
    
    setLoading(true);
    try {
      const generated = await generateQuiz(content, title);
      const quizCode = Math.random().toString(36).substr(2, 6).toUpperCase();
      const fullQuiz: Quiz = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        title: title,
        code: quizCode,
        timeLimit: timeLimit,
        difficulty: difficulty,
        questions: generated.questions || [],
        createdBy: user.name
      };
      
      const allQuizzes = JSON.parse(localStorage.getItem('edugenius_global_quizzes') || '[]');
      const updatedGlobal = [fullQuiz, ...allQuizzes];
      localStorage.setItem('edugenius_global_quizzes', JSON.stringify(updatedGlobal));
      
      setActiveQuizzes([fullQuiz, ...activeQuizzes]);
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      alert("Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const { notes } = await webSearchNotes(searchQuery);
      setReadyNote(notes);
    } catch (err) {
      alert("Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadText(event.target?.result as string);
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (!uploadText.trim()) return;
    setLoading(true);
    try {
      const notes = await generateNotesFromText(uploadText);
      setReadyNote(notes);
    } catch (err) {
      alert("Note generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToWorkspace = (note: NoteContent) => {
    const key = `edugenius_saved_${user.id}`;
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([note, ...saved]));
    onViewNote(note);
    setReadyNote(null);
  };

  const handleSendEmail = () => {
    if (!readyNote) return;
    setIsEmailing(true);
    const subject = encodeURIComponent(`EduGenius AI Staff Resource: ${readyNote.title}`);
    const body = encodeURIComponent(`Hello ${user.name},\n\nYour AI-generated resource is ready.\n\n--- \nEduGenius AI`);
    setTimeout(() => {
      window.location.href = `mailto:${user.email}?subject=${subject}&body=${body}`;
      setIsEmailing(false);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 2000);
    }, 1000);
  };

  const resetForm = () => {
    setContent('');
    setTitle('');
    setDifficulty('Medium');
    setTimeLimit(20);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const removeQuiz = (id: string) => {
    const all = JSON.parse(localStorage.getItem('edugenius_global_quizzes') || '[]');
    const filtered = all.filter((q: Quiz) => q.id !== id);
    localStorage.setItem('edugenius_global_quizzes', JSON.stringify(filtered));
    setActiveQuizzes(activeQuizzes.filter(q => q.id !== id));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {readyNote && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setReadyNote(null)} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-200 dark:border-slate-800">
            <div className="p-10 text-center">
               <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                 <Sparkles className="w-10 h-10" />
               </div>
               <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Resource Ready</h3>
               <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">
                 Material for <strong>{readyNote.title}</strong> has been synthesized.
               </p>
               <div className="space-y-3">
                  <button 
                    onClick={() => handleSaveToWorkspace(readyNote)}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    <Save className="w-4 h-4" /> Save to Workspace
                  </button>
                  <button 
                    onClick={handleSendEmail}
                    className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                  >
                    <Mail className="w-4 h-4" /> Email Resource
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="inline-flex p-1.5 bg-slate-200/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-inner">
        {[
          { id: 'manage', label: 'Assessments', icon: Shield },
          { id: 'search', label: 'Web Search', icon: Globe },
          { id: 'upload', label: 'Processor', icon: Upload },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs transition-all duration-300 ${
              activeTab === tab.id 
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-lg' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'scale-110' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'manage' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Assessment Dashboard</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Create and deploy secure AI-assisted tests for students.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black shadow-lg flex items-center gap-2 transition-all active:scale-95 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              AI Quiz Architect
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeQuizzes.length === 0 ? (
              <div className="col-span-full py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 text-center px-6">
                <Layout className="w-12 h-12 opacity-10 mb-8" />
                <p className="font-black text-slate-900 dark:text-white text-xl mb-2">No active assessments</p>
                <p className="max-w-xs text-sm font-medium leading-relaxed">Deploy quizzes via the Architect tool to see them listed here.</p>
              </div>
            ) : (
              activeQuizzes.map((quiz) => (
                <div key={quiz.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                  <div className="p-8 flex-1">
                    <div className="flex justify-between items-start mb-6">
                      <span className={`px-3 py-1 w-fit rounded-full text-[10px] font-black uppercase tracking-widest ${
                        quiz.difficulty === 'Easy' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700' :
                        quiz.difficulty === 'Medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700'
                      }`}>
                        {quiz.difficulty}
                      </span>
                      <button onClick={() => removeQuiz(quiz.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 line-clamp-1 tracking-tight">{quiz.title}</h4>
                    <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl p-4 flex items-center justify-between border border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Code</p>
                        <p className="text-xl font-mono font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">{quiz.code}</p>
                      </div>
                      <button 
                        onClick={() => copyCode(quiz.code)}
                        className={`p-3 rounded-xl transition-all shadow-sm ${copiedId === quiz.code ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600'}`}
                      >
                        {copiedId === quiz.code ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row overflow-hidden min-h-[500px]">
          <div className="flex-1 p-10 md:p-16 flex flex-col justify-center space-y-8">
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
              Academic search, <br/>
              <span className="text-indigo-600 dark:text-indigo-400">synthesized.</span>
            </h3>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="flex-1 relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Modern Architecture patterns..."
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-850 rounded-[1.25rem] border border-slate-200 dark:border-slate-800 outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 focus:border-indigo-500 transition-all font-bold dark:text-white"
                />
              </div>
              <button disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 rounded-[1.25rem] font-black shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:scale-95 whitespace-nowrap">
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                Generate Resource
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-bottom-4 duration-500 flex flex-col overflow-hidden min-h-[600px]">
           <div className="p-8 md:p-12 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Resource Lab</h3>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                 <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".pdf,.docx,.pptx,.txt" />
                 <button onClick={() => fileInputRef.current?.click()} className="flex-1 md:flex-none px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                   <FileUp className="w-4 h-4 text-indigo-500" /> Upload Source
                 </button>
                 <button onClick={handleGenerate} disabled={loading || !uploadText.trim()} className="flex-1 md:flex-none px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs hover:bg-indigo-700 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:scale-95">
                   {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                   Generate Resource
                 </button>
              </div>
           </div>
           <div className="flex-1 p-8 md:p-12">
             <textarea
               value={uploadText}
               onChange={(e) => setUploadText(e.target.value)}
               placeholder="Paste content here..."
               className="w-full h-[400px] p-10 bg-slate-50/30 dark:bg-slate-850/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] outline-none font-mono text-xs resize-none leading-relaxed dark:text-white"
             />
           </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => !loading && setIsModalOpen(false)} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-200 dark:border-slate-800">
            <div className="bg-indigo-600 p-10 text-white flex justify-between items-center relative overflow-hidden">
              <h2 className="text-3xl font-black tracking-tight">AI Quiz Architect</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/20 rounded-2xl transition-colors"><X className="w-7 h-7" /></button>
            </div>
            <form onSubmit={handleCreateQuiz} className="p-10 space-y-8">
              <input 
                type="text" 
                required
                placeholder="Quiz Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none font-bold dark:text-white"
              />
              <textarea 
                required
                placeholder="Paste syllabus content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-48 px-6 py-5 rounded-[2rem] bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 outline-none font-medium text-sm resize-none dark:text-slate-300"
              />
              <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[1.5rem] shadow-xl disabled:opacity-50 flex items-center justify-center gap-3">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                DEPLOY ASSESSMENT
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
