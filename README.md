# 🎓 KIET Moodle Tracker

A modern, responsive student dashboard built with **React** and **TypeScript** to help KIET students track assignments, view deadlines, and stay organized. This app interfaces directly with the KIET LMS Moodle API to provide a cleaner, faster user experience.

![Project Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Key Features

* **🔐 Secure Authentication:** Log in directly using your Library ID and Password (verified via KIET Moodle).
* **📅 Smart Dashboard:** View all assignments sorted by deadline.
* **🔎 Advanced Filtering:**
    * **Search:** Instantly find assignments by name or course.
    * **Status Tabs:** Toggle between **All**, **Upcoming**, and **Overdue** tasks.
    * **Course Filter:** Filter assignments by specific subjects.
* **🔔 Deadline Notifications:** Get browser notifications for assignments due within 24 hours.
* **👁️ Password Visibility:** Toggle password visibility during login.
* **📱 Responsive Design:** Fully optimized for mobile and desktop using Tailwind CSS.

## 🛠️ Tech Stack

* **Frontend:** [React](https://react.dev/) (v19), [TypeScript](https://www.typescriptlang.org/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **HTTP Client:** [Axios](https://axios-http.com/)
* **State/Auth:** [JS Cookie](https://github.com/js-cookie/js-cookie)

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites
* Node.js (v18 or higher recommended)
* npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/kiet-moodle-app.git](https://github.com/your-username/kiet-moodle-app.git)
    cd kiet-moodle-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:5173`.

## ⚙️ Configuration & API Proxy

This project relies on a **Proxy** to communicate with the HTTP-based KIET Moodle server (`http://lms.kiet.edu`) from a modern HTTPS environment.

### Local Development
The proxy is configured in `vite.config.ts`. It redirects requests from `/moodle-api` to the actual Moodle server to avoid CORS issues.

```ts
// vite.config.ts
proxy: {
  '/moodle-api': {
    target: '[http://lms.kiet.edu/moodle](http://lms.kiet.edu/moodle)',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/moodle-api/, ''),
  },
}