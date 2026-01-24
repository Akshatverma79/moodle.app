import axios from "axios";
import Cookies from "js-cookie";
import { ArrowRight, Lock, School, IdCard, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const MOODLE_COOKIE = "moodle_token";
const USERNAME_COOKIE = "moodle_username"; // New constant

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
                params: {
                    username: username,
                    password: password,
                    service: "moodle_mobile_app",
                },
            });

            if (response.data.error) {
                setError("Access Denied: " + response.data.error);
            } else if (response.data.token) {
                // Save both token and username
                Cookies.set(MOODLE_COOKIE, response.data.token, { expires: 90 });
                Cookies.set(USERNAME_COOKIE, username, { expires: 90 }); 
                onLogin();
            } else {
                setError("Unexpected response from server.");
            }
        } catch (err) {
            console.error(err);
            setError("Unable to connect to KIET servers.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4 font-sans text-slate-900">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100 animate-fade-in">
                
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200 mb-4 transform transition-transform hover:scale-105 duration-300">
                        <School className="text-white h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                        Student Portal
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Sign in to access your Moodle Dashboard
                    </p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">
                            Library ID
                        </label>
                        <div className="relative group">
                            <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                <IdCard size={20} />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-700 placeholder-slate-400"
                                placeholder="e.g. 2024...."
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider ml-1">
                            Password
                        </label>
                        <div className="relative group">
                            <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-700 placeholder-slate-400"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 flex items-center animate-pulse">
                            <span className="mr-2 text-base">⚠️</span> {error}
                        </div>
                    )}
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? "Verifying..." : <>Secure Login <ArrowRight size={18} strokeWidth={2.5}/></>}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-400 font-medium">
                        Protected by KIET Authentication
                    </p>
                </div>
            </div>
        </div>
    );
}