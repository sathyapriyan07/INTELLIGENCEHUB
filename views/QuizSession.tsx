
import React, { useState, useEffect } from 'react';
import { Quiz, QuizResult } from '../types.ts';
import { evaluateAssessment } from '../services/groqService.ts';
import { Timer, CheckCircle, X, Award, ListChecks, Loader2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface QuizSessionProps {
  quiz: Quiz;
  onFinish: () => void;
}

const QuizSession: React.FC<QuizSessionProps> = ({ quiz, onFinish }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<Partial<QuizResult> | null>(null);

  useEffect(() => {
    if (isFinished || isEvaluating) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished, isEvaluating]);

  const handleComplete = async () => {
    setIsEvaluating(true);
    try {
      const evalResult = await evaluateAssessment(quiz, answers);
      setResult(evalResult);
      setIsFinished(true);
    } catch (err) {
      console.error("Evaluation failed", err);
      const manualScore = quiz.questions.reduce((acc, q) => {
        if (q.type.toUpperCase() === 'MCQ' && answers[q.id] === q.correctAnswer) return acc + 1;
        return acc;
      }, 0);
      setResult({ score: manualScore, totalQuestions: quiz.questions.length, percentage: (manualScore / quiz.questions.length) * 100, feedback: "Evaluation completed with local synthesis." });
      setIsFinished(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  const q = quiz.questions[currentIdx];
  const qType = q.type.toUpperCase();

  if (isEvaluating) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050914] flex flex-col items-center justify-center p-6 space-y-8 overflow-hidden">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
          <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-amber-400 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Synthesizing Results...</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Neural engine is grading your performance.</p>
        </div>
      </div>
    );
  }

  if (isFinished && result) {
    const score = result.score || 0;
    const total = result.totalQuestions || quiz.questions.length;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050914] flex items-center justify-center p-4">
        <div className="max-w-md w-full animate-fade-up">
          <div className="bg-white dark:bg-[#0f172a] rounded-[3.5rem] pt-12 pb-10 px-8 md:px-12 text-center shadow-2xl relative border border-slate-200 dark:border-white/5 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-indigo-600 rounded-t-[3.5rem] opacity-90"></div>
            
            <div className="w-24 h-24 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Award className="w-12 h-12 text-indigo-500" />
            </div>

            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">Evaluation Complete</h2>
            
            <p className="text-slate-600 dark:text-slate-400 font-medium text-sm mb-12 italic leading-relaxed px-2">
              "{result.feedback || 'The synthesis process has completed successfully.'}"
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-12">
               <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Final Score</p>
                 <p className="text-3xl font-black text-slate-900 dark:text-white">{score}<span className="text-slate-500 text-lg">/{total}</span></p>
               </div>
               <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Percentage</p>
                 <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{Math.round(result.percentage || 0)}%</p>
               </div>
            </div>

            <button 
              onClick={onFinish} 
              className="w-full bg-white hover:bg-slate-50 text-slate-900 font-black py-5 rounded-[2rem] shadow-xl transition-all active:scale-95 text-base tracking-tight"
            >
              Finish Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050914] flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Header aligned as per screenshot */}
      <header className="px-8 py-10 flex justify-between items-center z-50">
        <button 
          onClick={onFinish} 
          className="p-4 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white/70 dark:bg-[#111827]/80 rounded-[1.25rem] transition-all active:scale-90 border border-slate-200 dark:border-white/5 backdrop-blur"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="px-6 py-3.5 bg-white text-slate-900 rounded-[1.5rem] font-black text-sm flex items-center gap-3 shadow-2xl">
          <Timer className="w-4 h-4 text-rose-500" /> 
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
      </header>

      {/* Main Content Card - Matches screenshot proportions */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-3xl w-full space-y-8">
          <div className="bg-white dark:bg-[#0f172a] p-10 md:p-16 rounded-[3.5rem] shadow-2xl border border-slate-200 dark:border-white/5 min-h-[400px] flex flex-col justify-center animate-fade-up relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -mr-32 -mt-32"></div>
             
             <div className="space-y-10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-500/20">
                    <ListChecks className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{qType} EVALUATION</span>
                  </div>
                </div>
                
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.2]">
                  {q.question}
                </h2>

                <div className="pt-10 border-t border-slate-200 dark:border-white/5">
                  {qType === 'MCQ' ? (
                      <div className="grid gap-4">
                        {q.options?.map((opt, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => setAnswers({...answers, [q.id]: opt})}
                            className={`p-6 rounded-[1.75rem] border-2 text-left font-bold transition-all flex items-center justify-between group ${
                              answers[q.id] === opt 
                              ? 'border-indigo-500 bg-indigo-500/10 text-slate-900 dark:text-white' 
                              : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-800/50 dark:hover:border-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
                            }`}
                          >
                            <span className="text-base md:text-lg flex-1 pr-6">{opt}</span>
                            <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center shrink-0 ${
                              answers[q.id] === opt ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 dark:border-slate-700'
                            }`}>
                               {answers[q.id] === opt && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                            </div>
                          </button>
                        ))}
                      </div>
                  ) : (
                    <textarea 
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                      className="w-full h-52 p-8 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-[2.5rem] outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 resize-none shadow-inner leading-relaxed"
                      placeholder="Type your synthesis response here..."
                    />
                  )}
                </div>
             </div>
          </div>

          {/* Bottom Bar - Matches screenshot pill shape */}
          <div className="flex justify-between items-center bg-white/80 dark:bg-[#0f172a]/60 p-5 rounded-[2.5rem] border border-slate-200 dark:border-white/5 backdrop-blur-xl shadow-2xl">
             <button 
               disabled={currentIdx === 0} 
               onClick={() => setCurrentIdx(c => c - 1)} 
               className="flex items-center gap-2 px-8 py-3 rounded-2xl text-slate-500 font-black text-xs uppercase tracking-widest disabled:opacity-0 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
             >
               <ChevronLeft className="w-4 h-4" /> Back
             </button>
              
             <div className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] translate-x-1">
               {currentIdx + 1} / {quiz.questions.length}
             </div>

             {currentIdx === quiz.questions.length - 1 ? (
               <button 
                 onClick={handleComplete} 
                 className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-2"
               >
                 Submit Session <CheckCircle className="w-4 h-4" />
               </button>
             ) : (
               <button 
                 onClick={() => setCurrentIdx(c => c + 1)} 
                 className="bg-white hover:bg-slate-50 text-slate-900 px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-2"
               >
                 Next <ChevronRight className="w-4 h-4" />
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSession;
