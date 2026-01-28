import { Calendar, AlertTriangle, CheckCircle2, ArrowUpRight, Clock } from "lucide-react";
import DOMPurify from "dompurify";
import type { AssignmentEvent } from "../types/moodle";

interface Props {
  assign: AssignmentEvent;
  isCompleted: boolean;
  onToggleComplete: (id: number) => void;
}

export default function AssignmentCard({ assign, isCompleted, onToggleComplete }: Props) {
    const now = Date.now();
    const dueDate = assign.timesort * 1000;
    const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    const isOverdue = daysLeft < 0;

    return (
        <div className={`relative group bg-white rounded-[2rem] p-6 border-2 transition-all flex flex-col h-full ${
            isCompleted 
            ? 'opacity-60 border-emerald-100 bg-emerald-50/20' 
            : 'border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/5'
        }`}>
            {/* Status Header */}
            <div className="flex justify-between items-start mb-5">
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-indigo-100/50 truncate max-w-[60%]">
                    {assign.course.shortname}
                </span>
                
                <button 
                    onClick={() => onToggleComplete(assign.id)}
                    className={`p-2 rounded-xl transition-all ${isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50'}`}
                >
                    <CheckCircle2 size={20} />
                </button>
            </div>
            
            <h3 className={`font-bold text-lg leading-tight mb-3 transition-colors ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                {assign.name}
            </h3>
            
            {/* Description (Sanitized) */}
            <div 
                className="text-xs text-slate-500 mb-6 line-clamp-3 font-medium leading-relaxed" 
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(assign.description || "No description provided.") }} 
            />
            
            <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
                    <div className="flex items-center text-xs font-bold text-slate-600">
                        <Calendar size={14} className="mr-2 text-indigo-500" />
                        {new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>

                {!isCompleted && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border ${
                        isOverdue 
                        ? 'text-red-600 bg-red-50 border-red-100' 
                        : daysLeft <= 2 ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-slate-500 bg-slate-50 border-slate-100'
                    }`}>
                        {isOverdue ? <AlertTriangle size={12} /> : <Clock size={12} />}
                        {isOverdue ? 'Overdue' : `${daysLeft}d left`}
                    </div>
                )}
            </div>

            {/* Hover Action Overlay */}
            {!isCompleted && (
                <a 
                    href={assign.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white p-2 rounded-xl shadow-xl hover:scale-110 active:scale-95"
                >
                    <ArrowUpRight size={18} />
                </a>
            )}
        </div>
    );
}