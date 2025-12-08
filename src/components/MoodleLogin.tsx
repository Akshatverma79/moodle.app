import axios from "axios";
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
