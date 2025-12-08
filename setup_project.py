import os

# Define the file contents
files = {
    "vite.config.ts": """import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/moodle-api': {
        target: 'http://lms.kiet.edu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/moodle-api/, '/moodle'),
      },
    },
  },
});
""",

    "src/index.css": """@import "tailwindcss";

body {
  background-color: #f3f4f6;
}
""",

    "src/types/moodle.ts": """export interface MoodleTokenResponse {
    token: string;
    privatetoken: string | null;
    error?: string;
}

export interface AssignmentEvent {
    id: number;
    name: string;
    description: string;
    course: {
        id: number;
        fullname: string;
        shortname: string;
    };
    timesort: number; // Unix timestamp for Due Date
    url: string;
    action: {
        name: string;
        itemcount: number;
        actionable: boolean;
    };
}

export interface MoodleEventsResponse {
    events: AssignmentEvent[];
}
""",

    "src/components/MoodleLogin.tsx": """import axios from "axios";
import Cookies from "js-cookie";
import { Lock, User } from "lucide-react";
import { useState } from "react";

const MOODLE_COOKIE = "moodle_token";

export default function MoodleLogin({ onLogin }: { onLogin: () => void }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Use relative path so requests go through the Vite Proxy
            const response = await axios.get("/moodle-api/login/token.php", {
                params: {
                    username: username,
                    password: password,
                    service: "moodle_mobile_app",
                },
            });

            if (response.data.error) {
                setError("Login failed: " + response.data.error);
            } else if (response.data.token) {
                Cookies.set(MOODLE_COOKIE, response.data.token, { expires: 90 });
                onLogin();
            } else {
                setError("Unexpected response from server.");
            }
        } catch (err) {
            console.error(err);
            setError("Network error. Check your internet connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-3xl font-black text-center mb-6 uppercase tracking-wider">
                    Moodle Tracker
                </h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block font-bold mb-1">University Roll No</label>
                        <div className="flex items-center border-2 border-black p-2">
                            <User className="mr-2" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full outline-none"
                                placeholder="Roll No..."
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block font-bold mb-1">Password</label>
                        <div className="flex items-center border-2 border-black p-2">
                            <Lock className="mr-2" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full outline-none"
                                placeholder="Password"
                                required
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-600 font-bold bg-red-100 p-2 border-2 border-red-600">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white font-bold py-3 hover:-translate-y-1 transition-transform border-2 border-transparent"
                    >
                        {loading ? "CONNECTING..." : "ACCESS ASSIGNMENTS"}
                    </button>
                </form>
            </div>
        </div>
    );
}
""",

    "src/components/MoodleAssignments.tsx": """import axios from "axios";
import Cookies from "js-cookie";
import { Calendar, CheckCircle, ExternalLink, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { AssignmentEvent, MoodleEventsResponse } from "../types/moodle";

export default function MoodleAssignments({ onLogout }: { onLogout: () => void }) {
    const [assignments, setAssignments] = useState<AssignmentEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignments = async () => {
            const token = Cookies.get("moodle_token");
            if (!token) return;

            const now = Math.floor(Date.now() / 1000);

            try {
                const response = await axios.get<MoodleEventsResponse>(
                    "/moodle-api/webservice/rest/server.php",
                    {
                        params: {
                            wstoken: token,
                            wsfunction: "core_calendar_get_action_events_by_timesort",
                            moodlewsrestformat: "json",
                            timesortfrom: now,
                            limitnum: 20
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

    const getTimeRemaining = (timestamp: number) => {
        const now = Date.now();
        const due = timestamp * 1000;
        const diff = due - now;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (diff < 0) return { text: "Overdue", color: "text-red-600", bg: "bg-red-100" };
        if (days < 1) return { text: `Due in ${hours} hours`, color: "text-red-600", bg: "bg-red-50" };
        if (days < 3) return { text: `${days} days left`, color: "text-amber-600", bg: "bg-amber-50" };
        return { text: `${days} days left`, color: "text-green-600", bg: "bg-green-50" };
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-black uppercase tracking-wide">Pending Assignments</h1>
                    <button 
                        onClick={onLogout}
                        className="flex items-center gap-2 bg-white border-2 border-black px-4 py-2 font-bold hover:bg-red-50"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>

                {loading ? (
                    <div className="text-center font-bold animate-pulse">Loading Moodle Data...</div>
                ) : assignments.length === 0 ? (
                    <div className="bg-white border-2 border-black p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                        <h2 className="text-xl font-bold">All caught up!</h2>
                        <p className="text-gray-600">No pending assignments found in the near future.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {assignments.map((assign) => {
                            const status = getTimeRemaining(assign.timesort);
                            return (
                                <div key={assign.id} className="bg-white border-2 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold bg-black text-white px-2 py-1 uppercase">
                                            {assign.course.shortname || "Course"}
                                        </span>
                                        <span className={`text-xs font-bold px-2 py-1 border border-current ${status.color} ${status.bg}`}>
                                            {status.text}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold leading-tight mb-2">{assign.name}</h3>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2" dangerouslySetInnerHTML={{ __html: assign.description || "No description provided." }} />
                                    
                                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                        <div className="flex items-center text-sm font-medium text-gray-500">
                                            <Calendar size={16} className="mr-1" />
                                            {new Date(assign.timesort * 1000).toLocaleDateString()}
                                        </div>
                                        <a 
                                            href={assign.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline"
                                        >
                                            Submit <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
""",

    "src/App.tsx": """import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import MoodleAssignments from "./components/MoodleAssignments";
import MoodleLogin from "./components/MoodleLogin";

const MOODLE_COOKIE = "moodle_token";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = Cookies.get(MOODLE_COOKIE);
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    Cookies.remove(MOODLE_COOKIE);
    setIsAuthenticated(false);
  };

  return (
    <main className="min-h-screen">
      {!isAuthenticated ? (
        <MoodleLogin onLogin={handleLogin} />
      ) : (
        <MoodleAssignments onLogout={handleLogout} />
      )}
    </main>
  );
}

export default App;
"""
}

# Create directories and files
for path, content in files.items():
    # Ensure directory exists
    dir_name = os.path.dirname(path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    
    # Write file content
    with open(path, "w") as f:
        f.write(content)
    print(f"Created: {path}")

print("\n✅ All files created successfully! Run 'npm run dev' to start.")