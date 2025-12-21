import axios from "axios";
import Cookies from "js-cookie";
import { 
    Calendar, CheckCircle, Clock, ExternalLink, Filter, 
    LogOut, Search, AlertTriangle, BookOpen
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import type { AssignmentEvent, MoodleEventsResponse } from "../types/moodle";

export default function MoodleAssignments({ onLogout }: { onLogout: () => void }) {
    const [assignments, setAssignments] = useState<AssignmentEvent[]>([]);
    const [loading, setLoading] = useState(true);
    
    // -- NEW FEATURES: State Management --
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "overdue" | "upcoming">("all");
    const [selectedCourse, setSelectedCourse] = useState<string>("all");

    useEffect(() => {
        const fetchAssignments = async () => {
            const token = Cookies.get("moodle_token");
            if (!token) return;

            // Look back 90 days to catch overdue items
            const threeMonthsAgo = Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60);

            try {
                // FIXED: Removed localhost, using relative path for proxy to prevent errors
                const response = await axios.get<MoodleEventsResponse>(
                    "/moodle-api/webservice/rest/server.php",
                    {
                        params: {
                            wstoken: token,
                            wsfunction: "core_calendar_get_action_events_by_timesort",
                            moodlewsrestformat: "json",
                            timesortfrom: threeMonthsAgo,
                            limitnum: 50
                        },
                    }
                );
                
                if (response.data.events) {
                    setAssignments(response.data.events);
                    checkNotifications(response.data.events);
                }
            } catch (err) {
                console.error("Failed to fetch", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
        
        // Request Notification Permission on load
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    // -- FEATURE: Browser Notifications --
    const checkNotifications = (events: AssignmentEvent[]) => {
        if (Notification.permission !== "granted") return;
        
        const now = Date.now();
        const tomorrow = now + (24 * 60 * 60 * 1000);

        events.forEach(event => {
            const due = event.timesort * 1000;
            // Notify if due within 24 hours
            if (due > now && due < tomorrow) {
                new Notification(`Due Tomorrow: ${event.name}`, {
                    body: `Don't forget your assignment for ${event.course.fullname}!`,
                    icon: "/vite.svg"
                });
            }
        });
    };

    // -- FEATURE: Smart Filter Logic --
    const filteredAssignments = useMemo(() => {
        const now = Date.now();
        return assignments.filter(assign => {
            const due = assign.timesort * 1000;
            
            // Search Logic
            const matchesSearch = assign.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  assign.course.fullname.toLowerCase().includes(searchQuery.toLowerCase());
            
            // Course Filter Logic
            const matchesCourse = selectedCourse === "all" || assign.course.shortname === selectedCourse;
            
            // Tab Status Logic
            let matchesStatus = true;
            if (filterStatus === "overdue") matchesStatus = due < now;
            if (filterStatus === "upcoming") matchesStatus = due >= now;

            return matchesSearch && matchesCourse && matchesStatus;
        });
    }, [assignments, searchQuery, filterStatus, selectedCourse]);

    // Extract unique courses for the dropdown
    const uniqueCourses = useMemo(() => {
        const courses = new Set(assignments.map(a => a.course.shortname || a.course.fullname));
        return Array.from(courses);
    }, [assignments]);

    // Helper: Calculate days left
    const getDaysLeft = (timestamp: number) => {
        const diff = (timestamp * 1000) - Date.now();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* --- HEADER BAR --- */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm animate-fade-in">
                <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <span className="bg-indigo-600 text-white px-2 rounded-md">K</span> TRACKER
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider ml-1">Moodle Assignment Dashboard</p>
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
                
                {/* --- FILTERS TOOLBAR --- */}
                <div className="max-w-5xl mx-auto px-4 pb-4 md:pt-0 flex flex-col sm:flex-row gap-3 overflow-x-auto items-center animate-fade-in" style={{animationDelay: '0.1s'}}>
                    
                    {/* Status Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 w-full sm:w-auto">
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

                    {/* Course Dropdown */}
                    <div className="relative shrink-0 w-full sm:w-auto">
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

            {/* --- MAIN CONTENT --- */}
            <main className="max-w-5xl mx-auto p-4 md:p-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <div className="h-16 w-16 bg-slate-200 rounded-full mb-4"></div>
                        <div className="h-6 w-48 bg-slate-200 rounded-lg mb-2"></div>
                        <div className="h-4 w-32 bg-slate-200 rounded-lg"></div>
                    </div>
                ) : filteredAssignments.length === 0 ? (
                    <div className="text-center py-16 px-4 animate-fade-in">
                        <div className="bg-white inline-flex p-6 rounded-full shadow-sm mb-6 border border-slate-100">
                            {filterStatus === 'overdue' ? 
                                <CheckCircle className="h-12 w-12 text-emerald-500" /> : 
                                <BookOpen className="h-12 w-12 text-slate-300" />
                            }
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">No assignments found</h2>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            {filterStatus === 'overdue' ? "You have no overdue work! Great job keeping up." : 
                             searchQuery ? `No matches found for "${searchQuery}".` : 
                             "You are all caught up! Enjoy your free time."}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredAssignments.map((assign, index) => {
                            const daysLeft = getDaysLeft(assign.timesort);
                            const isOverdue = daysLeft < 0;
                            const isUrgent = daysLeft >= 0 && daysLeft <= 2;
                            
                            return (
                                <div 
                                    key={assign.id} 
                                    className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all flex flex-col h-full animate-fade-in"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Card Badge */}
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider truncate max-w-[60%]">
                                            {assign.course.shortname || "Course"}
                                        </span>
                                        {isOverdue ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                                                <AlertTriangle size={10} /> Overdue
                                            </span>
                                        ) : (
                                            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${
                                                isUrgent 
                                                ? 'text-amber-600 bg-amber-50 border-amber-100' 
                                                : 'text-emerald-600 bg-emerald-50 border-emerald-100'
                                            }`}>
                                                <Clock size={10} /> {daysLeft === 0 ? 'Due Today' : `${daysLeft}d left`}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Assignment Title */}
                                    <h3 className="font-bold text-lg text-slate-800 leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
                                        {assign.name}
                                    </h3>
                                    
                                    {/* Description Snippet */}
                                    <div className="text-xs text-slate-500 mb-4 line-clamp-2" dangerouslySetInnerHTML={{ __html: assign.description || "No description provided." }} />
                                    
                                    {/* Footer */}
                                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center text-xs font-semibold text-slate-400">
                                            <Calendar size={12} className="mr-1.5" />
                                            {new Date(assign.timesort * 1000).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                                        </div>
                                        <a 
                                            href={assign.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:shadow-md transition-all active:scale-95"
                                        >
                                            Open <ExternalLink size={12} />
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}