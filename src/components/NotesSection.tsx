import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Search, BookOpen, FolderOpen, FileText, ArrowRight, AlertCircle,
} from "lucide-react";
import moodleClient from "../api/moodleClient";
import CourseNotesList from "./CourseNotesList";
import type { EnrolledCourse, MoodleSiteInfo } from "../types/moodle";

export default function NotesSection() {
    const [selectedCourse, setSelectedCourse] = useState<EnrolledCourse | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // 1. Get user info (needed for enrolled courses API)
    const { data: siteInfo } = useQuery<MoodleSiteInfo>({
        queryKey: ["siteInfo"],
        queryFn: async () => {
            const res = await moodleClient.get("/webservice/rest/server.php", {
                params: { wsfunction: "core_webservice_get_site_info" },
            });
            return res.data;
        },
        staleTime: 1000 * 60 * 30,
    });

    // 2. Fetch enrolled courses
    const { data: courses = [], isLoading: coursesLoading } = useQuery<EnrolledCourse[]>({
        queryKey: ["enrolledCourses", siteInfo?.userid],
        queryFn: async () => {
            const res = await moodleClient.get("/webservice/rest/server.php", {
                params: {
                    wsfunction: "core_enrol_get_users_courses",
                    userid: siteInfo!.userid,
                },
            });
            return res.data || [];
        },
        enabled: !!siteInfo?.userid,
        staleTime: 1000 * 60 * 15,
    });

    // Filter courses by search
    const filteredCourses = useMemo(() => {
        if (!searchQuery.trim()) return courses;
        const q = searchQuery.toLowerCase();
        return courses.filter(
            (c) =>
                c.fullname.toLowerCase().includes(q) ||
                c.shortname.toLowerCase().includes(q)
        );
    }, [courses, searchQuery]);

    // Color palette for course cards
    const cardColors = [
        { bg: "bg-indigo-50", border: "border-indigo-200", icon: "text-indigo-600", accent: "bg-indigo-600" },
        { bg: "bg-violet-50", border: "border-violet-200", icon: "text-violet-600", accent: "bg-violet-600" },
        { bg: "bg-cyan-50", border: "border-cyan-200", icon: "text-cyan-600", accent: "bg-cyan-600" },
        { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-600", accent: "bg-emerald-600" },
        { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600", accent: "bg-amber-600" },
        { bg: "bg-rose-50", border: "border-rose-200", icon: "text-rose-600", accent: "bg-rose-600" },
        { bg: "bg-sky-50", border: "border-sky-200", icon: "text-sky-600", accent: "bg-sky-600" },
        { bg: "bg-fuchsia-50", border: "border-fuchsia-200", icon: "text-fuchsia-600", accent: "bg-fuchsia-600" },
    ];

    // --- If a course is selected, show its notes ---
    if (selectedCourse) {
        return (
            <CourseNotesList
                course={selectedCourse}
                onBack={() => setSelectedCourse(null)}
            />
        );
    }

    // --- COURSE GRID ---
    return (
        <div className="pb-20">
            <main className="max-w-6xl mx-auto px-4 mt-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                            <FolderOpen className="text-white h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Course Notes</h2>
                            <p className="text-xs font-medium text-slate-400">Browse and download study materials from your courses</p>
                        </div>
                    </div>
                </div>

                {/* Search bar */}
                <div className="relative mb-8 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Loading State */}
                {coursesLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-100">
                                <div className="skeleton h-12 w-12 rounded-xl mb-4" />
                                <div className="skeleton h-4 w-3/4 mb-2" />
                                <div className="skeleton h-3 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filteredCourses.length === 0 ? (
                    /* Empty state */
                    <div className="bg-white rounded-[2.5rem] p-16 text-center border border-dashed border-slate-200">
                        <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No Courses Found</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium">
                            {searchQuery ? "Try adjusting your search term." : "No enrolled courses were found for your account."}
                        </p>
                    </div>
                ) : (
                    /* Course Cards Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredCourses.map((course, index) => {
                            const color = cardColors[index % cardColors.length];
                            return (
                                <button
                                    key={course.id}
                                    onClick={() => setSelectedCourse(course)}
                                    className={`group relative text-left bg-white rounded-[2rem] p-6 border-2 ${color.border} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
                                    style={{ animationDelay: `${index * 60}ms` }}
                                >
                                    {/* Accent bar */}
                                    <div className={`absolute top-0 left-0 w-1 h-full ${color.accent} rounded-l-[2rem]`} />

                                    <div className="flex items-start gap-4">
                                        <div className={`${color.bg} p-3 rounded-xl flex-shrink-0`}>
                                            <BookOpen className={`h-6 w-6 ${color.icon}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-800 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                                                {course.fullname}
                                            </h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {course.shortname}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-5 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <FileText size={12} />
                                            <span className="text-[10px] font-bold">View Notes</span>
                                        </div>
                                        <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
