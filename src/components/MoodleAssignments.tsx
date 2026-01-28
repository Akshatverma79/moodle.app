import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { 
    CheckCircle, LogOut, Search, 
    BookOpen, User, Loader2, LayoutDashboard, 
    Clock, AlertCircle, RefreshCw 
} from "lucide-react";
import moodleClient from "../api/moodleClient";
import AssignmentCard from "./AssignmentCard";
import type { AssignmentEvent } from "../types/moodle";

export default function MoodleAssignments({ onLogout }: { onLogout: () => void }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "overdue" | "upcoming">("all");
    const [selectedCourse] = useState<string>("all");
    const [username] = useState(() => Cookies.get("moodle_username") || "");

    const [completedIds, setCompletedIds] = useState<number[]>(() => {
        const saved = localStorage.getItem("completed_assignments");
        return saved ? JSON.parse(saved) : [];
    });

    const { data: assignments = [], isLoading, refetch } = useQuery<AssignmentEvent[]>({
        queryKey: ["assignments"],
        queryFn: async () => {
            const threeMonthsAgo = Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60);
            const response = await moodleClient.get("/webservice/rest/server.php", {
                params: {
                    wsfunction: "core_calendar_get_action_events_by_timesort",
                    timesortfrom: threeMonthsAgo,
                    limitnum: 50
                },
            });
            return response.data.events || [];
        },
        refetchInterval: 1000 * 60 * 10,
    });

    const stats = useMemo(() => {
        const now = Date.now();
        const pending = assignments.filter(a => !completedIds.includes(a.id));
        return {
            total: pending.length,
            overdue: pending.filter(a => (a.timesort * 1000) < now).length,
            upcoming: pending.filter(a => (a.timesort * 1000) >= now).length,
        };
    }, [assignments, completedIds]);

    const filteredAssignments = useMemo(() => {
        const now = Date.now();
        return assignments.filter(assign => {
            const due = assign.timesort * 1000;
            const matchesSearch = assign.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  assign.course.fullname.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCourse = selectedCourse === "all" || assign.course.shortname === selectedCourse;
            
            let matchesStatus = true;
            if (filterStatus === "overdue") matchesStatus = due < now && !completedIds.includes(assign.id);
            if (filterStatus === "upcoming") matchesStatus = due >= now && !completedIds.includes(assign.id);

            return matchesSearch && matchesCourse && matchesStatus;
        });
    }, [assignments, searchQuery, filterStatus, selectedCourse, completedIds]);


    const toggleComplete = (id: number) => {
        const newIds = completedIds.includes(id) ? completedIds.filter(i => i !== id) : [...completedIds, id];
        setCompletedIds(newIds);
        localStorage.setItem("completed_assignments", JSON.stringify(newIds));
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
            {/* --- TOP NAV --- */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
                            <LayoutDashboard className="text-white h-5 w-5" />
                        </div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">K-TRACKER</h1>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                            <User size={14} className="text-indigo-600" />
                            <span className="text-[11px] font-bold text-slate-600">{username}</span>
                        </div>
                        <button onClick={onLogout} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 mt-8">
                {/* --- STATS OVERVIEW --- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Pending Tasks', value: stats.total, icon: BookOpen, color: 'indigo' },
                        { label: 'Upcoming', value: stats.upcoming, icon: Clock, color: 'emerald' },
                        { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'red' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className={`bg-${s.color}-50 p-3 rounded-2xl`}>
                                <s.icon className={`text-${s.color}-600 h-6 w-6`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                                <p className="text-2xl font-black text-slate-800">{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- TOOLBAR --- */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
                    <div className="flex items-center gap-2 bg-slate-200/50 p-1 rounded-2xl w-full md:w-auto">
                        {(['all', 'upcoming', 'overdue'] as const).map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)} className={`px-5 py-2 rounded-xl text-xs font-bold capitalize transition-all ${filterStatus === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                {s}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <input 
                                type="text" 
                                placeholder="Search assignment..." 
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button onClick={() => refetch()} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>

                {/* --- ASSIGNMENTS GRID --- */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px]">Syncing Moodle Data...</p>
                    </div>
                ) : filteredAssignments.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-16 text-center border border-dashed border-slate-200">
                        <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-10 w-10 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Workspace Clear</h2>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium">No assignments match your current filters. Take a break!</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredAssignments.map((assign) => (
                            <AssignmentCard 
                                key={assign.id} 
                                assign={assign}
                                isCompleted={completedIds.includes(assign.id)}
                                onToggleComplete={toggleComplete}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}