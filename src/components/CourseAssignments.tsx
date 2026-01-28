import type { AssignmentEvent } from "../types/moodle";
import AssignmentCard from "./AssignmentCard";
import { BookOpen, ChevronLeft } from "lucide-react";

interface Props {
    assignments: AssignmentEvent[];
    completedIds: number[];
    toggleComplete: (id: number) => void;
    onBack: () => void;
}

export default function CourseAssignments({ assignments, completedIds, toggleComplete, onBack }: Props) {
    // Group assignments by course fullname
    const grouped = assignments.reduce((acc, curr) => {
        const key = curr.course.fullname;
        if (!acc[key]) acc[key] = [];
        acc[key].push(curr);
        return acc;
    }, {} as Record<string, AssignmentEvent[]>);

    return (
        <div className="animate-fade-in">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm mb-6 transition-colors"
            >
                <ChevronLeft size={18} /> Back to Dashboard
            </button>

            <div className="space-y-12">
                {Object.entries(grouped).map(([courseName, events]) => (
                    <section key={courseName}>
                        <div className="flex items-center gap-3 mb-6 border-l-4 border-indigo-600 pl-4">
                            <BookOpen className="text-indigo-600" size={20} />
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">{courseName}</h2>
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-lg ml-2">
                                {events.length} Tasks
                            </span>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {events.map(assign => (
                                <AssignmentCard 
                                    key={assign.id}
                                    assign={assign}
                                    isCompleted={completedIds.includes(assign.id)}
                                    onToggleComplete={toggleComplete}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}