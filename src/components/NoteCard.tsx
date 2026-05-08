import Cookies from "js-cookie";
import { Download, ExternalLink, FileText, FileSpreadsheet, FileImage, File } from "lucide-react";
import type { MoodleCourseFile } from "../types/moodle";

interface Props {
    file: MoodleCourseFile;
    moduleName: string;
}

function getFileIcon(filename: string) {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    switch (ext) {
        case "pdf":
            return { Icon: FileText, color: "text-red-500", bg: "bg-red-50", label: "PDF" };
        case "doc":
        case "docx":
            return { Icon: FileText, color: "text-blue-500", bg: "bg-blue-50", label: "DOC" };
        case "ppt":
        case "pptx":
            return { Icon: FileSpreadsheet, color: "text-orange-500", bg: "bg-orange-50", label: "PPT" };
        case "xls":
        case "xlsx":
            return { Icon: FileSpreadsheet, color: "text-emerald-500", bg: "bg-emerald-50", label: "XLS" };
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
        case "svg":
            return { Icon: FileImage, color: "text-purple-500", bg: "bg-purple-50", label: ext.toUpperCase() };
        default:
            return { Icon: File, color: "text-slate-500", bg: "bg-slate-50", label: ext.toUpperCase() || "FILE" };
    }
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getAuthenticatedUrl(url: string): string {
    const token = Cookies.get("moodle_token");
    if (!token) return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}token=${token}`;
}

export default function NoteCard({ file, moduleName }: Props) {
    const { Icon, color, bg, label } = getFileIcon(file.filename);
    const fileUrl = getAuthenticatedUrl(file.fileurl);
    const lastModified = new Date(file.timemodified * 1000).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="group bg-white rounded-2xl p-5 border-2 border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            {/* Top section */}
            <div className="flex items-start gap-3 mb-3">
                <div className={`${bg} p-2.5 rounded-xl flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-800 leading-snug line-clamp-2 mb-1">
                        {moduleName}
                    </h4>
                    <p className="text-[10px] font-medium text-slate-400 truncate">
                        {file.filename}
                    </p>
                </div>
            </div>

            {/* Meta info */}
            <div className="flex items-center gap-3 mb-4 text-[10px] font-bold text-slate-400">
                <span className={`${bg} ${color} px-2 py-0.5 rounded-md uppercase tracking-wider`}>
                    {label}
                </span>
                <span>{formatFileSize(file.filesize)}</span>
                <span>•</span>
                <span>{lastModified}</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
                <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 text-white py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-indigo-600 transition-all active:scale-[0.98]"
                >
                    <ExternalLink size={12} /> View
                </a>
                <a
                    href={fileUrl}
                    download={file.filename}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-indigo-50 hover:text-indigo-700 transition-all active:scale-[0.98]"
                >
                    <Download size={12} /> Download
                </a>
            </div>
        </div>
    );
}
