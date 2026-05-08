import { useState } from "react";
import Cookies from "js-cookie";
import {
    LayoutDashboard, FileText, User, LogOut, Sparkles,
} from "lucide-react";
import MoodleAssignments from "./MoodleAssignments";
import NotesSection from "./NotesSection";

type Tab = "assignments" | "notes";

interface Props {
    onLogout: () => void;
}

export default function AppShell({ onLogout }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>("assignments");
    const [username] = useState(() => Cookies.get("moodle_username") || "");

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* --- TOP NAVIGATION BAR --- */}
            <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Left: Brand */}
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
                            <Sparkles className="text-white h-5 w-5" />
                        </div>
                        <h1 className="text-lg font-black text-slate-800 tracking-tight hidden sm:block">
                            KIET LMS
                        </h1>
                    </div>

                    {/* Center: Tabs */}
                    <div className="flex items-center bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50">
                        <button
                            onClick={() => setActiveTab("assignments")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                                activeTab === "assignments"
                                    ? "bg-white text-indigo-600 shadow-sm shadow-indigo-100"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <LayoutDashboard size={14} />
                            <span className="hidden sm:inline">Assignments</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("notes")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                                activeTab === "notes"
                                    ? "bg-white text-indigo-600 shadow-sm shadow-indigo-100"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <FileText size={14} />
                            <span className="hidden sm:inline">Notes</span>
                        </button>
                    </div>

                    {/* Right: User & Logout */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                            <User size={14} className="text-indigo-600" />
                            <span className="text-[11px] font-bold text-slate-600">{username}</span>
                        </div>
                        <button
                            onClick={onLogout}
                            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- CONTENT AREA --- */}
            <div className="animate-fade-in">
                {activeTab === "assignments" ? (
                    <MoodleAssignments />
                ) : (
                    <NotesSection />
                )}
            </div>
        </div>
    );
}
