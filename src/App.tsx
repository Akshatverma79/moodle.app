import Cookies from "js-cookie";
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
