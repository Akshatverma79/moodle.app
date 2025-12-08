import axios from "axios";
import Cookies from "js-cookie";
import { AlertCircle, Calendar, CheckCircle, ExternalLink, LogOut, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { AssignmentEvent, MoodleEventsResponse } from "../types/moodle";

export default function MoodleAssignments({ onLogout }: { onLogout: () => void }) {
    const [assignments, setAssignments] = useState<AssignmentEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignments = async () => {
            const token = Cookies.get("moodle_token");
            if (!token) return;

            // FIX: Look back 90 days (3 months) to find ANY pending/overdue work
            const threeMonthsAgo = Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60);

            try {
                const response = await axios.get<MoodleEventsResponse>(
                    "http://localhost:5173/moodle-api/webservice/rest/server.php",
                    {
                        params: {
                            wstoken: token,
                            wsfunction: "core_calendar_get_action_events_by_timesort",
                            moodlewsrestformat: "json",
                            timesortfrom: threeMonthsAgo, // <--- The Magic Fix
                            limitnum: 50
                        },
                    }
                );
                
                if (response.data.events) {
                    setAssignments(response.data.events);
                }
            } catch (err) {
                console.error("Failed to fetch assignments", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, []);

    const getStatusColor = (timestamp: number) => {
        const now = Date.now();
        const due = timestamp * 1000;
        
        if (due < now) return "border-l-8 border-l-red-600"; // Overdue
        if (due < now + (3 * 24 * 60 * 60 * 1000)) return "border-l-8 border-l-amber-500"; // Due in 3 days
        return "border-l-8 border-l-green-500"; // Safe
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-wide">My Work</h1>
                        <p className="text-gray-500 font-bold">Pending & Overdue Assignments</p>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="flex items-center gap-2 bg-white border-2 border-black px-4 py-2 font-bold hover:bg-red-50 hover:-translate-y-1 transition-transform"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <div className="h-12 w-12 bg-gray-300 rounded-full mb-4"></div>
                        <div className="h-6 w-48 bg-gray-300 rounded"></div>
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="bg-white border-2 border-black p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6" />
                        <h2 className="text-2xl font-black mb-2">You are a Free Elf!</h2>
                        <p className="text-gray-600 font-medium">No pending assignments found in the last 3 months.</p>
                        <p className="text-sm text-gray-400 mt-4">(Check the official Moodle just to be safe)</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {assignments.map((assign) => (
                            <div 
                                key={assign.id} 
                                className={`bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all ${getStatusColor(assign.timesort)}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="inline-block text-xs font-bold bg-black text-white px-2 py-1 mb-2 uppercase tracking-widest">
                                            {assign.course.shortname || assign.course.fullname}
                                        </span>
                                        <h3 className="text-xl font-bold leading-tight">{assign.name}</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center justify-end text-sm font-bold text-gray-600 mb-1">
                                            <Calendar size={14} className="mr-1" />
                                            {new Date(assign.timesort * 1000).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center justify-end text-xs font-medium text-gray-500">
                                            <Clock size={12} className="mr-1" />
                                            {new Date(assign.timesort * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                                
                                <p className="text-sm text-gray-600 mt-3 mb-4 line-clamp-2" dangerouslySetInnerHTML={{ __html: assign.description || "Check Moodle for details." }} />
                                
                                <div className="pt-4 border-t border-gray-100 flex justify-end">
                                    <a 
                                        href={assign.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-black text-white px-4 py-2 font-bold text-sm hover:bg-gray-800 transition-colors"
                                    >
                                        Open in Moodle <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}