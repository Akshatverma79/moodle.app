import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import AppShell from "./components/AppShell";
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
    Cookies.remove("moodle_username");
    setIsAuthenticated(false);
  };

  return (
    <main className="min-h-screen font-sans">
      {!isAuthenticated ? (
        <MoodleLogin onLogin={handleLogin} />
      ) : (
        <AppShell onLogout={handleLogout} />
      )}
      <Analytics />
    </main>
  );
}

export default App;
