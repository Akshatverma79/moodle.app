import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { 
    CheckCircle, LogOut, Search, Filter, 
    BookOpen, User, Loader2 
} from "lucide-react";
import moodleClient from "../api/moodleClient";
import AssignmentCard from "./AssignmentCard";
import type { AssignmentEvent } from "../types/moodle";

export default function MoodleAssignments({ onLogout }: { onLogout: () => void }) {
    // --- STATE ---
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "overdue" | "upcoming">("all");
    const [selectedCourse, setSelectedCourse] = useState<string>("all");
    const [username] = useState(() => Cookies.get("moodle_username") || "");

    // Local state for manually completed assignments (persisted in browser)
    const [completedIds, setCompletedIds] = useState<number[]>(() => {
        const saved = localStorage.getItem("completed_assignments");
        return saved ? JSON.parse(saved) : [];
    });

    // --- DATA FETCHING (React Query) ---
    const { data: assignments = [], isLoading, isError } = useQuery({
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
            
            const fetchedEvents = response.data.events || [];
            checkNotifications(fetchedEvents);
            return fetchedEvents;
        },
        refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
        staleTime: 1000 * 60 * 5,        // Consider data fresh for 5 minutes
    });

    // --- NOTIFICATIONS ---
    const checkNotifications = (events: AssignmentEvent[]) => {
        if ("Notification" in window && Notification.permission === "granted") {
            const now = Date.now();
            const tomorrow = now + (24 * 60 * 60 * 1000);

            events.forEach(event => {
                const due = event.timesort * 1000;
                if (due > now && due < tomorrow) {
                    new Notification(`Due Soon: ${event.name}`, {
                        body: `Assignment for ${event.course.fullname} is due within 24 hours.`,
                        icon: "/vite.svg"
                    });
                }
            });
        }
    };

    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    // --- LOGIC ---
    const toggleComplete = (id: number) => {
        const newIds = completedIds.includes(id) 
            ? completedIds.filter(i => i !== id) 
            : [...completedIds, id];
        setCompletedIds(newIds);
        localStorage.setItem("completed_assignments", JSON.stringify(newIds));
    };

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

    const uniqueCourses = useMemo(() => {
        const courses = new Set(assignments.map(a => a.course.shortname || a.course.fullname));
        return Array.from(courses);
    }, [assignments]);

    // --- UI RENDERING ---
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <span className="bg-indigo-600 text-white px-2 rounded-md">K</span> TRACKER
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                Moodle Dashboard
                            </p>
                            {username && (
                                <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-indigo-100">
                                    <User size={10} />
                                    <span>{username}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
                            <input 
                                type="text" 
                                placeholder="Search tasks..." 
                                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={onLogout}
                            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                            <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
                
                <div className="max-w-5xl mx-auto px-4 pb-4 flex flex-col sm:flex-row gap-3 items-center">
                    <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                        {(['all', 'upcoming', 'overdue'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                                    filterStatus === status 
                                    ? 'bg-white text-indigo-600 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-auto">
                        <Filter className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
                        <select 
                            className="w-full sm:w-auto pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer hover:border-indigo-300 transition-colors"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            <option value="all">All Courses</option>
                            {uniqueCourses.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-4 md:p-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
                        <p className="text-slate-500 font-medium">Fetching assignments...</p>
                    </div>
                ) : isError ? (
                    <div className="text-center py-16">
                        <p className="text-red-500 font-bold">Failed to load assignments. Please check your connection.</p>
                    </div>
                ) : filteredAssignments.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <div className="bg-white inline-flex p-6 rounded-full shadow-sm mb-6 border border-slate-100">
                            {filterStatus === 'overdue' ? 
                                <CheckCircle className="h-12 w-12 text-emerald-500" /> : 
                                <BookOpen className="h-12 w-12 text-slate-300" />
                            }
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">No assignments found</h2>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            {filterStatus === 'overdue' ? "You have no overdue work!" : "You are all caught up for now."}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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