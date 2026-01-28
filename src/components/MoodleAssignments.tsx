import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { 
    CheckCircle, LogOut, Search, 
    BookOpen, User, Loader2, LayoutDashboard, 
    Clock, AlertCircle, RefreshCw, 
    LayoutGrid
} from "lucide-react";
import moodleClient from "../api/moodleClient";
import AssignmentCard from "./AssignmentCard";
import type { AssignmentEvent } from "../types/moodle";

export default function MoodleAssignments({ onLogout }: { onLogout: () => void }) {
    // --- STATE ---
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus] = useState<"all" | "overdue" | "upcoming">("all");
    const [selectedCourse] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"dashboard" | "courses">("dashboard");
    const [username] = useState(() => Cookies.get("moodle_username") || "");

    const [completedIds, setCompletedIds] = useState<number[]>(() => {
        const saved = localStorage.getItem("completed_assignments");
        return saved ? JSON.parse(saved) : [];
    });

    // --- DATA FETCHING ---
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

    // --- STATS CALCULATION ---
    const stats = useMemo(() => {
        const now = Date.now();
        const pending = assignments.filter(a => !completedIds.includes(a.id));
        return {
            total: pending.length,
            overdue: pending.filter(a => (a.timesort * 1000) < now).length,
            upcoming: pending.filter(a => (a.timesort * 1000) >= now).length,
        };
    }, [assignments, completedIds]);

    // --- GROUPING & FILTERING LOGIC ---
    const toggleComplete = (id: number) => {
        const newIds = completedIds.includes(id) ? completedIds.filter(i => i !== id) : [...completedIds, id];
        setCompletedIds(newIds);
        localStorage.setItem("completed_assignments", JSON.stringify(newIds));
    };

    const filteredAssignments = useMemo(() => {
        const now = Date.now();
        return assignments.filter((assign: AssignmentEvent) => {
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

    const groupedByCourse = useMemo(() => {
        return filteredAssignments.reduce((acc, curr) => {
            const key = curr.course.fullname;
            if (!acc[key]) acc[key] = [];
            acc[key].push(curr);
            return acc;
        }, {} as Record<string, AssignmentEvent[]>);
    }, [filteredAssignments]);


    // --- UI COMPONENTS ---
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
            {/* --- NAVIGATION --- */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
                            <LayoutDashboard className="text-white h-5 w-5" />
                        </div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">Assignment TRACKER</h1>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
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
                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                            <div className={`p-3 rounded-2xl bg-slate-50`}>
                                <s.icon className={`h-6 w-6 ${s.color === 'indigo' ? 'text-indigo-600' : s.color === 'emerald' ? 'text-emerald-600' : 'text-red-600'}`} />
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
                        <button 
                            onClick={() => setViewMode("dashboard")}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${viewMode === "dashboard" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}
                        >
                            <LayoutGrid size={14} /> Dashboard
                        </button>
                        <button 
                            onClick={() => setViewMode("courses")}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${viewMode === "courses" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}
                        >
                            <BookOpen size={14} /> Courses
                        </button>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <input 
                                type="text" 
                                placeholder="Search assignment..." 
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button onClick={() => refetch()} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>

                {/* --- CONTENT AREA --- */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Moodle Data...</p>
                    </div>
                ) : filteredAssignments.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-16 text-center border border-dashed border-slate-200">
                        <div className="bg-emerald-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-10 w-10 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Workspace Clear</h2>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium">Everything looks good! Take a break.</p>
                    </div>
                ) : viewMode === "courses" ? (
                    /* COURSE OVERVIEW MODE */
                    <div className="space-y-12">
                        {Object.entries(groupedByCourse).map(([courseName, events]) => (
                            <section key={courseName} className="animate-fade-in">
                                <div className="flex items-center gap-3 mb-6 border-l-4 border-indigo-600 pl-4">
                                    <h2 className="text-xl font-black text-slate-800 tracking-tight">{courseName}</h2>
                                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-lg">
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
                ) : (
                    /* STANDARD DASHBOARD MODE */
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
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