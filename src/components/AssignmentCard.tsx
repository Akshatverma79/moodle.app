import { Calendar, ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";
import DOMPurify from "dompurify";
import type { AssignmentEvent } from "../types/moodle";

interface Props {
  assign: AssignmentEvent;
  isCompleted: boolean;
  onToggleComplete: (id: number) => void;
}

export default function AssignmentCard({ assign, isCompleted, onToggleComplete }: Props) {
    const daysLeft = Math.ceil(((assign.timesort * 1000) - Date.now()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysLeft < 0;

    return (
        <div className={`group bg-white rounded-2xl p-5 border transition-all flex flex-col h-full ${
            isCompleted ? 'opacity-60 border-emerald-100 bg-emerald-50/30' : 'border-slate-200 hover:shadow-lg'
        }`}>
            <div className="flex justify-between items-start mb-3">
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase truncate max-w-[50%]">
                    {assign.course.shortname}
                </span>
                
                <div className="flex gap-2">
                    <button 
                        onClick={() => onToggleComplete(assign.id)}
                        className={`p-1 rounded-md transition-colors ${isCompleted ? 'text-emerald-600' : 'text-slate-300 hover:text-emerald-500'}`}
                    >
                        <CheckCircle2 size={18} />
                    </button>
                    {isOverdue && !isCompleted && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                            <AlertTriangle size={10} /> Overdue
                        </span>
                    )}
                </div>
            </div>
            
            <h3 className={`font-bold text-lg leading-snug mb-2 ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                {assign.name}
            </h3>
            
            {/* Sanitized HTML Content */}
            <div 
                className="text-xs text-slate-500 mb-4 line-clamp-2" 
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(assign.description || "") }} 
            />
            
            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center text-xs font-semibold text-slate-400">
                    <Calendar size={12} className="mr-1.5" />
                    {new Date(assign.timesort * 1000).toLocaleDateString()}
                </div>
                <a 
                    href={assign.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-600 transition-all"
                >
                    Open <ExternalLink size={12} />
                </a>
            </div>
        </div>
    );
}