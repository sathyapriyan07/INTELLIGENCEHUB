import React, { useState } from 'react';
import { NoteContent, User } from '../types.ts';
import { generateArchitectureDocs } from '../services/groqService.ts';
import { 
  ShieldAlert, 
  FileCode, 
  Loader2, 
  Zap, 
  ArrowRight, 
  Settings2,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Cpu,
  Globe,
  Layers,
  ChevronRight
} from 'lucide-react';

interface ArchitectureModuleProps {
  user: User;
  onNoteGenerated: (note: NoteContent) => void;
}

const ArchitectureModule: React.FC<ArchitectureModuleProps> = ({ user, onNoteGenerated }) => {
  const [projectTitle, setProjectTitle] = useState('Secure Authentication System');
  const [loading, setLoading] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState('auth');

  const templates = [
    { 
      id: 'auth', 
      title: 'Secure JWT Auth', 
      desc: 'Deep dive into JWT, Refresh Tokens, Bcrypt, and Security Hooks.',
      prompt: 'Complete JWT Auth system with Refresh Tokens, Bcrypt (12 rounds), Rate Limiting, and Email Verification.'
    },
    { 
      id: 'microservices', 
      title: 'Event-Driven Architecture', 
      desc: 'Service communication, API Gateways, and Message Queues.',
      prompt: 'Event-driven microservices using RabbitMQ, API Gateway, and Distributed Tracing.'
    },
    { 
      id: 'data', 
      title: 'Scalable Data Layer', 
      desc: 'SQL vs NoSQL, Caching strategies, and Data Integrity.',
      prompt: 'Scalable database architecture with Redis caching, Read Replicas, and ACID compliance.'
    }
  ];

  const handleGenerate = async (templatePrompt: string, title: string) => {
    setLoading(true);
    try {
      const blueprint = await generateArchitectureDocs(title, templatePrompt);
      const historyKey = `edugenius_history_${user.id}`;
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      localStorage.setItem(historyKey, JSON.stringify([blueprint, ...history].slice(0, 20)));
      onNoteGenerated(blueprint);
    } catch (err) {
      alert("Blueprint generation failed. The architect is currently offline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-24 py-12">
      {/* Cinematic Header */}
      <section className="text-center space-y-10 max-w-4xl mx-auto animate-fade-up">
        <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-brand-50/50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-100 dark:border-brand-800">
          <ShieldCheck className="w-4 h-4" /> Final Year Project Ready
        </div>
        <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
          Architecture <br/>
          <span className="text-gradient">Logic Blueprints.</span>
        </h2>
        <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
          Synthesize comprehensive technical documentation suitable for high-stakes thesis defenses and production deployments.
        </p>
      </section>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 space-y-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          {/* Template Grid */}
          <div className="grid sm:grid-cols-2 gap-8">
            {templates.map((tpl) => (
              <button 
                key={tpl.id}
                onClick={() => setActiveTemplate(tpl.id)}
                className={`group p-10 rounded-[3.5rem] border-2 text-left transition-all relative overflow-hidden ${
                  activeTemplate === tpl.id 
                  ? 'border-brand-500 bg-white dark:bg-slate-900 shadow-premium' 
                  : 'border-slate-100 dark:border-white/5 bg-white/50 dark:bg-slate-900/30 hover:border-brand-200 dark:hover:border-slate-700'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 shadow-lg ${
                  activeTemplate === tpl.id ? 'bg-brand-600 text-white shadow-brand-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  {tpl.id === 'auth' ? <ShieldAlert className="w-8 h-8" /> : tpl.id === 'microservices' ? <Cpu className="w-8 h-8" /> : <Globe className="w-8 h-8" />}
                </div>
                
                <h4 className={`text-2xl font-black mb-3 tracking-tight transition-colors ${activeTemplate === tpl.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  {tpl.title}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {tpl.desc}
                </p>
                
                <div className={`mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTemplate === tpl.id ? 'text-brand-600 opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                  Select Template <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>

          {/* Main Action Surface */}
          <div className="relative group rounded-[4rem] overflow-hidden shadow-premium animate-fade-up" style={{ animationDelay: '0.4s' }}>
             <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-950 dark:from-brand-600 dark:to-accent-700"></div>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
             
             <div className="relative z-10 p-12 md:p-16 space-y-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl text-white border border-white/20">
                    <FileCode className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60">Architectural Engine</p>
                    <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                      {templates.find(t => t.id === activeTemplate)?.title}
                    </h3>
                  </div>
                </div>

                <p className="text-lg text-white/70 font-medium leading-relaxed max-w-2xl">
                  This blueprint enforces structural integrity, security best practices, and Viva-ready explanations tailored for academic defense.
                </p>

                <div className="pt-6">
                  <button 
                    disabled={loading}
                    onClick={() => {
                      const t = templates.find(t => t.id === activeTemplate);
                      if (t) handleGenerate(t.prompt, t.title);
                    }}
                    className="group/btn relative inline-flex items-center gap-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-12 py-7 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-brand-500/5 translate-y-full group-hover/btn:translate-y-0 transition-transform"></div>
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                        Forging Blueprint...
                      </>
                    ) : (
                      <>
                        <Zap className="w-6 h-6 text-brand-600 fill-current" />
                        Synthesize Blueprint
                        <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
             </div>
             
             <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
          </div>
        </div>

        {/* Cinematic Sidebar */}
        <aside className="lg:col-span-4 space-y-10 animate-fade-up" style={{ animationDelay: '0.6s' }}>
          <div className="bg-white dark:bg-slate-900/50 rounded-[3.5rem] p-10 shadow-premium border border-slate-200 dark:border-white/5 backdrop-blur-3xl group">
            <div className="flex items-center gap-4 mb-12">
              <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl text-brand-600">
                <Settings2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Blueprint Logic</h3>
            </div>
            
            <div className="space-y-6">
              {[
                { label: 'Academic Rigor', status: 'Thesis Level', icon: Layers },
                { label: 'Security Protocols', status: 'OWASP Aligned', icon: ShieldCheck },
                { label: 'Visual Mapping', status: 'Mermaid Enabled', icon: Cpu },
                { label: 'Viva Readiness', status: 'Optimized', icon: HelpCircle }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-brand-500/20 transition-all group/item">
                  <div className="flex items-center gap-4">
                    <item.icon className="w-5 h-5 text-slate-300 group-hover/item:text-brand-600 transition-colors" />
                    <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">{item.status}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-10 border-t border-slate-100 dark:border-white/5">
               <div className="flex items-center gap-4 p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-100 dark:border-emerald-800/30">
                 <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl text-emerald-600 shadow-sm flex items-center justify-center shrink-0">
                   <CheckCircle className="w-6 h-6" />
                 </div>
                 <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 leading-relaxed">
                   Validated against top university technical standards.
                 </p>
               </div>
            </div>
          </div>

          <div className="p-10 bg-gradient-to-br from-brand-600/5 to-accent-600/5 rounded-[3.5rem] border border-brand-100 dark:border-white/5 flex flex-col items-center text-center space-y-6 shadow-sm group">
             <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl text-brand-600 shadow-xl group-hover:rotate-12 transition-transform">
               <HelpCircle className="w-10 h-10" />
             </div>
             <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">About Synthesis</h4>
             <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
               NoteForge Blueprints go beyond summaries, providing <span className="text-brand-600 font-black">deep system architecture</span> and narrative flows for technical defenses.
             </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ArchitectureModule;