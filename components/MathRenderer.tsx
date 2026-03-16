
import React from 'react';
// @ts-ignore
import Katex from 'react-katex';
import { Sigma } from 'lucide-react';

const { InlineMath, BlockMath } = Katex;

interface MathRendererProps {
  equations: string[];
}

const MathRenderer: React.FC<MathRendererProps> = ({ equations }) => {
  if (!equations || equations.length === 0) return null;

  return (
    <div className="bg-blue-50/50 rounded-[2rem] border border-blue-100 p-8 md:p-10 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
          <Sigma className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Mathematical Formulations</h3>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Formal Notation & Proofs</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {equations.map((eq, idx) => (
          <div key={idx} className="bg-white p-8 rounded-2xl border border-blue-50 shadow-sm flex flex-col items-center justify-center transition-all hover:shadow-md group">
             <div className="scale-110 md:scale-125 overflow-x-auto w-full py-4 text-center">
                <BlockMath math={eq} />
             </div>
             <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Equation {idx + 1}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MathRenderer;
