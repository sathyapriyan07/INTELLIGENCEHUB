
import React, { useState, useRef } from 'react';
import { Quiz, User, UserRole, QuizQuestion } from '../types.ts';
import { generateQuiz } from '../services/groqService.ts';
import { 
  BrainCircuit, 
  Key, 
  Plus, 
  Loader2, 
  Play, 
  Users, 
  ShieldCheck, 
  FileUp, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  ClipboardList,
  CheckCircle2
} from 'lucide-react';

interface LabModuleProps {
  user: User;
  onStartQuiz: (quiz: Quiz) => void;
}

const LabModule: React.FC<LabModuleProps> = ({ user, onStartQuiz }) => {
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'selection' | 'join' | 'create'>('selection');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleJoin = () => {
    if (!code) return;
    
    if (code === 'EXAM123') {
      onStartQuiz({
        id: 'sample-123',
        title: 'Core Principles Assessment',
        code: 'EXAM123',
        timeLimit: 15,
        difficulty: 'Medium',
        questions: [
          { id: 'q1', type: 'MCQ', question: 'Which of the following describes universal synthesis?', options: ['Summarization', 'Data Extraction', 'Connecting disparate points', 'Manual typing'], correctAnswer: 'Connecting disparate points' }
        ],
        createdBy: 'Universal Admin'
      });
      return;
    }

    const allQuizzes = JSON.parse(localStorage.getItem('edugenius_global_quizzes') || '[]');
    const found = allQuizzes.find((q: Quiz) => q.code === code.trim().toUpperCase());
    
    if (found) {
      onStartQuiz(found);
    } else {
      alert("Invalid code. Please enter the code assigned for this session.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsReadingFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setContent(event.target?.result as string);
      setIsReadingFile(false);
    };
    reader.onerror = () => {
      alert("Failed to read file content.");
      setIsReadingFile(false);
    };
    reader.readAsText(file);
  };

  const handleCreate = async () => {
    if (!title || !content) {
      alert("Please provide a title and context for the AI to analyze.");
      return;
    }
    setLoading(true);
    try {
      const generated = await generateQuiz(content, title);
      const quizCode = Math.random().toString(36).substr(2, 6).toUpperCase();
      
      const newQuiz: Quiz = {
        id: Math.random().toString(36).substr(2, 9),
        title: title,
        code: quizCode,
        timeLimit: 20,
        difficulty: 'Medium',
        questions: (generated.questions as QuizQuestion[]) || [],
        createdBy: user.name
      };
      
      if (user.role === UserRole.STAFF) {
        const all = JSON.parse(localStorage.getItem('edugenius_global_quizzes') || '[]');
        localStorage.setItem('edugenius_global_quizzes', JSON.stringify([newQuiz, ...all]));
      }
      
      onStartQuiz(newQuiz);
    } catch (err) {
      console.error(err);
      alert("Lab failed to build assessment. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 py-8 animate-fade-up">
      {mode === 'selection' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button 
            onClick={() => setMode('join')}
            className="group bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/5 text-left shadow-premium hover:shadow-2xl hover:border-brand-500/50 transition-all active:scale-[0.98] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-500/10 transition-colors"></div>
            <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center text-brand-600 mb-10 group-hover:scale-110 transition-transform shadow-lg">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Formal Join</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10">Enter a class code to attend text-based formal evaluations assigned by your institution.</p>
            <div className="flex items-center gap-2 text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest group-hover:translate-x-2 transition-transform">
              Enter Session <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          <button 
            onClick={() => setMode('create')}
            className="group bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/5 text-left shadow-premium hover:shadow-2xl hover:border-brand-500/50 transition-all active:scale-[0.98] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-500/10 transition-colors"></div>
            <div className="w-16 h-16 bg-slate-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center text-brand-600 mb-10 group-hover:rotate-12 transition-transform shadow-lg">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Practice Lab</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10">Generate custom evaluations from your context notes for self-paced recall.</p>
            <div className="flex items-center gap-2 text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest group-hover:translate-x-2 transition-transform">
              Generate Evaluation <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {mode === 'join' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 md:p-14 shadow-premium border border-slate-200/50 dark:border-white/5 animate-fade-up">
          <div className="flex items-center gap-4 mb-12">
            <button onClick={() => setMode('selection')} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-900 transition-all active:scale-95">
              <ArrowRight className="w-6 h-6 rotate-180" />
            </button>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Access Lab</h2>
          </div>
          
          <div className="space-y-8">
            <div className="relative group">
              <input 
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="LAB-CODE"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-[2rem] px-10 py-8 text-center text-4xl font-mono font-black tracking-[0.4em] text-brand-600 focus:outline-none focus:ring-8 focus:ring-brand-500/5 transition-all shadow-inner"
              />
              <Key className="absolute left-8 top-1/2 -translate-y-1/2 w-8 h-8 text-slate-200 group-focus-within:text-brand-500 transition-colors pointer-events-none" />
            </div>
            <button 
              onClick={handleJoin}
              disabled={code.length < 3}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-6 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl disabled:opacity-20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Play className="w-5 h-5 fill-current" /> Join Evaluation
            </button>
            <div className="flex items-center justify-center gap-3 py-4 opacity-50">
               <ShieldCheck className="w-4 h-4 text-emerald-500" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secured Assessment Protocol</p>
            </div>
          </div>
        </div>
      )}

      {mode === 'create' && (
        <div className="bg-white dark:bg-slate-900 rounded-[4rem] p-8 md:p-16 shadow-premium border border-slate-200/50 dark:border-white/5 animate-fade-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-6">
            <div className="flex items-center gap-4">
              <button onClick={() => setMode('selection')} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
                <ArrowRight className="w-6 h-6 rotate-180" />
              </button>
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Assessment Generator</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Textual Synthesis Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-full border border-brand-100 dark:border-brand-800/30">
               <Sparkles className="w-5 h-5 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest">Ready to Process</span>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Assessment Title</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Molecular Synthesis Midterm"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-[1.5rem] px-8 py-5 font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 outline-none transition-all shadow-inner"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Context Data</label>
              <div className="relative group">
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste research data, technical notes, or reference documents here..."
                  className="w-full h-64 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-[2.5rem] px-10 py-10 font-medium text-lg text-slate-800 dark:text-slate-300 resize-none focus:ring-4 focus:ring-brand-500/10 outline-none transition-all shadow-inner leading-relaxed"
                />
                {isReadingFile && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center rounded-[2.5rem] gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-brand-600" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Parsing Neural Context...</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileUpload} 
                accept=".txt" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-none px-10 py-5 bg-white dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-slate-500 hover:text-brand-600 transition-all border border-slate-100 dark:border-white/5 shadow-sm active:scale-95 group"
              >
                <FileUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
              </button>
              <button 
                onClick={handleCreate}
                disabled={loading || !title || !content || isReadingFile}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-6 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-4 shadow-xl shadow-brand-500/20 disabled:opacity-30 transition-all active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="tracking-widest">SYNTHESIZING...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="tracking-widest">START EVALUATION</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabModule;
