import { Calendar, ExternalLink, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import DOMPurify from "dompurify";
import type { AssignmentEvent } from "../types/moodle";

interface Props {
  assign: AssignmentEvent;
  isCompleted: boolean;
  onToggleComplete: (id: number) => void;
}

export default function AssignmentCard({ assign, isCompleted, onToggleComplete }: Props) {
    const dueDate = assign.timesort * 1000;
    const daysLeft = Math.ceil((dueDate - Date.now()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysLeft < 0;

    return (
        <div className={`relative bg-white rounded-[2.5rem] p-7 border-2 transition-all flex flex-col h-full ${
            isCompleted 
            ? 'opacity-60 border-emerald-100 bg-emerald-50/20' 
            : 'border-slate-100 hover:border-indigo-200 hover:shadow-2xl shadow-sm'
        }`}>
            {/* Top Badge & Mark Done */}
            <div className="flex justify-between items-start mb-4">
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border border-indigo-100/50 truncate max-w-[65%]">
                    {assign.course.shortname || "Course"}
                </span>
                
                <button 
                    onClick={() => onToggleComplete(assign.id)}
                    title={isCompleted ? "Mark as pending" : "Mark as completed"}
                    className={`p-2.5 rounded-2xl transition-all ${
                        isCompleted 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' 
                        : 'bg-slate-50 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50'
                    }`}
                >
                    <CheckCircle2 size={20} />
                </button>
            </div>
            
            <h3 className={`font-bold text-lg leading-snug mb-3 ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                {assign.name}
            </h3>
            
            <div 
                className="text-xs text-slate-500 mb-6 line-clamp-3 font-medium" 
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(assign.description || "No description provided.") }} 
            />
            
            {/* Footer Action Bar: Clear separation to prevent overlapping */}
            <div className="mt-auto pt-6 border-t border-slate-50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-xs font-bold text-slate-400">
                        <Calendar size={14} className="mr-2 text-indigo-400" />
                        {new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>

                    {!isCompleted && (
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            isOverdue ? 'text-red-600 bg-red-50' : 'text-slate-500 bg-slate-50'
                        }`}>
                            {isOverdue ? <AlertTriangle size={12} /> : <Clock size={12} />}
                            {isOverdue ? 'Overdue' : `${daysLeft}d left`}
                        </div>
                    )}
                </div>

                {/* Primary Button: Visit Site */}
                <a 
                    href={assign.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
                >
                    Visit Moodle Page <ExternalLink size={14} />
                </a>
            </div>
        </div>
    );
}