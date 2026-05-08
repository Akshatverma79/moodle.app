import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    ChevronLeft, Loader2, FolderOpen, AlertCircle, Search,
} from "lucide-react";
import { useState } from "react";
import moodleClient from "../api/moodleClient";
import NoteCard from "./NoteCard";
import type { EnrolledCourse, MoodleCourseSection } from "../types/moodle";

interface Props {
    course: EnrolledCourse;
    onBack: () => void;
}

export default function CourseNotesList({ course, onBack }: Props) {
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch course contents
    const { data: sections = [], isLoading } = useQuery<MoodleCourseSection[]>({
        queryKey: ["courseContents", course.id],
        queryFn: async () => {
            const res = await moodleClient.get("/webservice/rest/server.php", {
                params: {
                    wsfunction: "core_course_get_contents",
                    courseid: course.id,
                },
            });
            return res.data || [];
        },
        staleTime: 1000 * 60 * 10,
    });

    // Filter to only resource/folder modules with downloadable content
    const filteredSections = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return sections
            .map((section) => ({
                ...section,
                modules: section.modules.filter((mod) => {
                    const hasFiles = (mod.modname === "resource" || mod.modname === "folder") && 
                                     mod.contents && mod.contents.length > 0;
                    if (!hasFiles) return false;
                    if (!q) return true;
                    return (
                        mod.name.toLowerCase().includes(q) ||
                        mod.contents?.some((f) => f.filename.toLowerCase().includes(q))
                    );
                }),
            }))
            .filter((section) => section.modules.length > 0);
    }, [sections, searchQuery]);

    const totalFiles = useMemo(() => {
        return filteredSections.reduce(
            (sum, section) =>
                sum + section.modules.reduce((s, m) => s + (m.contents?.length || 0), 0),
            0
        );
    }, [filteredSections]);

    return (
        <div className="pb-20">
            <main className="max-w-6xl mx-auto px-4 mt-8">
                {/* Back button + header */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm mb-6 transition-colors"
                >
                    <ChevronLeft size={18} /> Back to Courses
                </button>

                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                            <FolderOpen className="text-white h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight line-clamp-1">
                                {course.fullname}
                            </h2>
                            <p className="text-xs font-medium text-slate-400">
                                {totalFiles} file{totalFiles !== 1 ? "s" : ""} available
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-8 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search files..."
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                            Loading Course Materials...
                        </p>
                    </div>
                ) : filteredSections.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-16 text-center border border-dashed border-slate-200">
                        <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No Materials Found</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium">
                            {searchQuery
                                ? "Try adjusting your search term."
                                : "This course doesn't have any downloadable files."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {filteredSections.map((section) => (
                            <section key={section.id} className="animate-slide-in-up">
                                {/* Section header */}
                                <div className="flex items-center gap-3 mb-5 border-l-4 border-indigo-600 pl-4">
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight">
                                        {section.name || "General"}
                                    </h3>
                                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-lg">
                                        {section.modules.reduce(
                                            (s, m) => s + (m.contents?.length || 0),
                                            0
                                        )}{" "}
                                        files
                                    </span>
                                </div>

                                {/* File cards grid */}
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {section.modules.map((mod) =>
                                        mod.contents?.map((file, fileIdx) => (
                                            <NoteCard
                                                key={`${mod.id}-${fileIdx}`}
                                                file={file}
                                                moduleName={mod.name}
                                            />
                                        ))
                                    )}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
