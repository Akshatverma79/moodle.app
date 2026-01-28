# 🎓 Assignment-Tracker: KIET Moodle Assignment Dashboard

**Assignment-Tracker** is a high-performance, modern web application designed specifically for the KIET Group of Institutions Moodle LMS. It transforms the legacy Moodle experience into a streamlined, "productivity-first" interface, allowing students to track assignments, monitor deadlines, and organize their academic workload with ease.

---

## ✨ Key Features

* **📊 Smart Stats Dashboard**: Gain immediate clarity with a real-time overview of your total Pending, Upcoming, and Overdue tasks.
* **📂 Course-Wise Organization**: Seamlessly switch between a global dashboard and a grouped "Course View" to focus your attention on one subject at a time.
* **🛡️ Secure Authentication**: Enterprise-grade login using KIET Library IDs, featuring a "Keep me logged in" option for persistent session management.
* **✅ Local Task Persistence**: A custom "Mark as Done" feature that persists in your browser, allowing you to manually track completions regardless of Moodle's submission status.
* **🔍 Advanced Filtering & Search**: Rapidly locate specific assignments or courses using high-speed, client-side search and status filters.
* **✨ Professional UI/UX**: A modern Glassmorphic design featuring interactive particle backgrounds, smooth animations, and a fully responsive layout for all devices.

---

## 🚀 Tech Stack

### Frontend
* **React 19**: Utilizing the latest concurrent rendering features for a fluid user experience.
* **TypeScript**: Ensuring robust type-safety and reliability across the application.
* **TanStack Query (React Query)**: For high-performance data fetching, caching, and background synchronization.
* **Tailwind CSS v4**: For advanced styling and utility-first layout management.
* **Lucide React**: For a clean and modern iconography set.
* **@tsparticles**: Powering the interactive, dynamic background visuals.

### Integration & Architecture
* **Vercel Proxy**: A custom serverless rewrite configuration to bypass CORS restrictions when communicating with KIET Moodle servers.
* **Axios**: Centralized API client with interceptors for automated token management.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- A modern web browser

### Steps

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/akshatverma79/moodle.app.git
    cd moodle.app
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env.local` file in the root directory:
    ```env
    VITE_MOODLE_API_URL=https://moodle.kiet.edu
    VITE_API_PROXY_PATH=/moodle-api
    ```

4.  **Local Development**
    Start the Vite development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`

5.  **Production Build**
    Compile and minify for production:
    ```bash
    npm run build
    ```

6.  **Preview Production Build**
    ```bash
    npm run preview
    ```

---

## 🔒 Privacy & Security

* **Credential Protection**: Your Library ID and password are used solely to retrieve a secure session token from Moodle; they are never stored externally.

* **Local Data Control**: Your manually completed task states are stored locally on your device and are never sent to any third-party servers.

* **Secure Cookies**: Authentication tokens are managed with Secure and SameSite: Strict flags to ensure maximum protection against unauthorized access.

---

## 📁 Project Structure

```
moodle.app/
├── public/                 # Static public assets
├── src/
│   ├── api/
│   │   └── moodleClient.ts # Axios instance and API calls
│   ├── components/
│   │   ├── AssignmentCard.tsx        # Individual assignment display
│   │   ├── CourseAssignments.tsx     # Course-wise view
│   │   ├── MoodleAssignments.tsx     # Main assignments dashboard
│   │   ├── MoodleLogin.tsx           # Authentication component
│   │   └── ParticlesBackground.tsx   # Animated background
│   ├── types/
│   │   └── moodle.ts       # TypeScript type definitions
│   ├── App.tsx             # Root application component
│   ├── main.tsx            # Application entry point
│   ├── App.css             # Global styles
│   └── index.css           # Base styles
├── api/
│   └── proxy.js            # API proxy configuration
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── vercel.json             # Vercel deployment configuration
└── package.json            # Dependencies and scripts
```

---

## 🌐 Usage Guide

### Getting Started

1. **Open the Application**
   - Navigate to `http://localhost:5173` in your browser during development
   - Or visit the deployed application at `https://your-vercel-domain.com`

2. **Login**
   - Enter your KIET Library ID and password
   - Optionally check "Keep me logged in" for persistent session
   - The app will securely authenticate with Moodle

3. **Navigate Assignments**
   - **Dashboard View**: See all assignments with real-time stats
   - **Course View**: Filter assignments by specific courses
   - **Search**: Use the search bar to find specific assignments

4. **Track Progress**
   - Mark assignments as "Done" locally (independent of Moodle submission status)
   - Filter by status: Pending, Upcoming, Overdue
   - Monitor deadlines with visual indicators

### Available Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linter
npm run lint

# Format code
npm run format
```

---

## 🌍 Deployment

This project is optimized for **Vercel**.

### Vercel Configuration

The included `vercel.json` ensures that API requests are correctly routed to the KIET Moodle endpoint:

```json
{
  "rewrites": [
    {
      "source": "/moodle-api/:path*",
      "destination": "https://moodle.kiet.edu/:path*"
    }
  ]
}
```

### Deploy to Vercel

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Set environment variables in Vercel dashboard
5. Deploy with a single click

---

## 🐛 Troubleshooting

### Issue: CORS Errors
**Solution**: Ensure the Vercel proxy configuration is correctly set in `vercel.json` and the environment variables point to the correct Moodle API endpoint.

### Issue: Login Fails
**Solution**: 
- Verify your KIET Library ID and password are correct
- Ensure you have an active internet connection
- Check if Moodle servers are operational

### Issue: Assignments Not Loading
**Solution**:
- Clear browser cache and cookies
- Try logging out and logging back in
- Check browser console for API errors

### Issue: "Mark as Done" Not Persisting
**Solution**: 
- Enable localStorage in your browser settings
- Ensure cookies are not blocked
- Try using a different browser

---

## 📦 Dependencies

### Core Dependencies
- `react` - UI library
- `typescript` - Type safety
- `@tanstack/react-query` - Data fetching and caching
- `axios` - HTTP client
- `tailwindcss` - Utility-first CSS framework
- `lucide-react` - Icon library
- `tsparticles` - Particle animations

### Development Dependencies
- `vite` - Build tool
- `eslint` - Code linting
- `prettier` - Code formatting

See `package.json` for complete list with versions.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Authors & Contact

**Akshat Verma**
- GitHub: [@akshatverma79](https://github.com/akshatverma79)
- Project: [Assignment-Tracker on GitHub](https://github.com/akshatverma79/moodle.app)

For issues, feature requests, or questions, please open an issue on the GitHub repository.

---

## 🙋 Support

If you find Assignment-Tracker helpful, please consider:
- ⭐ Starring the repository
- 🔗 Sharing with fellow KIET students
- 📝 Contributing improvements
- 🐛 Reporting bugs and suggesting features

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn and create. Any contributions you make are greatly appreciated.

### How to Contribute

1. **Fork the Project**
   ```bash
   git clone https://github.com/YOUR-USERNAME/moodle.app.git
   cd moodle.app
   ```

2. **Create your Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Commit your Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open a Pull Request**
   - Describe your changes clearly
   - Include any relevant issue numbers
   - Follow the existing code style

### Code Style Guidelines
- Follow the existing TypeScript conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Format code with Prettier before submitting
- Ensure ESLint passes without warnings

---

**Made with ❤️ by the Assignment-Tracker team**
