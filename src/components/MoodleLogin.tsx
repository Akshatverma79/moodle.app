import axios from "axios";
import Cookies from "js-cookie";
import { ArrowRight, Lock, School, IdCard, Eye, EyeOff, ShieldCheck, Zap, FileText, ClipboardList } from "lucide-react";
import { useState } from "react";
import ParticlesBackground from "./ParticlesBackground";

const MOODLE_COOKIE = "moodle_token";
const USERNAME_COOKIE = "moodle_username";

export default function MoodleLogin({ onLogin }: { onLogin: () => void }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await axios.get("/moodle-api/login/token.php", {
                params: { username, password, service: "moodle_mobile_app" },
            });
            if (response.data.error) {
                setError(response.data.error === "invalidlogin" ? "Invalid Library ID or Password" : response.data.error);
            } else if (response.data.token) {
                const opt = { expires: 2/24, secure: true, sameSite: 'strict' as const };
                Cookies.set(MOODLE_COOKIE, response.data.token, opt);
                Cookies.set(USERNAME_COOKIE, username, opt); 
                onLogin();
            }
        } catch (err) {
            setError("Unable to connect to KIET servers.");
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: ClipboardList, text: "Track Assignments" },
        { icon: FileText, text: "Course Notes" },
        { icon: Zap, text: "Real-time Sync" },
    ];

    return (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden font-sans">
            {/* Animated Mesh Background */}
            <div className="absolute inset-0 bg-mesh animate-mesh opacity-80" />
            <ParticlesBackground />
            {/* Glassmorphism Login Card */}
            <div className="relative w-full max-w-md mx-4 z-10">
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/30 animate-fade-in-up ring-1 ring-indigo-500/10">
                    
                    {/* Logo Area */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 p-4 rounded-2xl shadow-xl shadow-indigo-500/30 mb-4 transform transition-transform hover:rotate-12 duration-300">
                            <School className="text-white h-10 w-10" />
                            {/* Glow ring */}
                            <div className="absolute inset-0 rounded-2xl bg-indigo-400/20 blur-lg -z-10" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                            LMS Moodle
                        </h2>
                        <div className="flex items-center gap-1.5 mt-2 bg-indigo-100/50 px-3 py-1 rounded-full">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-subtle" />
                            <ShieldCheck className="text-indigo-600 h-3.5 w-3.5" />
                            <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-widest">Secure Portal</span>
                        </div>
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Library ID Field */}
                        <div className="animate-fade-in-up [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1">Library ID</label>
                            <div className="relative group">
                                <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-all" size={20} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-700"
                                    placeholder="2428...."
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="animate-fade-in-up [animation-delay:400ms] opacity-0 [animation-fill-mode:forwards]">
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-all" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-700"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-center animate-shake">
                                <span className="mr-2">⚠️</span> {error}
                            </div>
                        )}
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] animate-fade-in-up [animation-delay:600ms] opacity-0 [animation-fill-mode:forwards]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative flex items-center justify-center gap-2">
                                {loading ? "Authenticating..." : <>Access Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                            </span>
                        </button>
                    </form>

                    {/* Feature pills */}
                    <div className="mt-6 flex items-center justify-center gap-2 flex-wrap animate-fade-in-up [animation-delay:800ms] opacity-0 [animation-fill-mode:forwards]">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                <f.icon size={12} className="text-indigo-500" />
                                <span className="text-[10px] font-bold text-slate-500">{f.text}</span>
                            </div>
                        ))}
                    </div>

                    <p className="mt-6 text-center text-xs text-slate-400 font-semibold tracking-wide">
                        All credentials are securely handled via Moodle's official API.
                    </p>
                </div>
            </div>
        </div>
    );
}