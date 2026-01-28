import axios from "axios";
import Cookies from "js-cookie";

const MOODLE_COOKIE = "moodle_token";

const moodleClient = axios.create({
  baseURL: "/moodle-api", // Works with your Vercel proxy and Vite proxy
});

// Automatically add token to every request if it exists
moodleClient.interceptors.request.use((config) => {
  const token = Cookies.get(MOODLE_COOKIE);
  if (token) {
    config.params = {
      ...config.params,
      wstoken: token,
      moodlewsrestformat: "json",
    };
  }
  return config;
});

export default moodleClient;