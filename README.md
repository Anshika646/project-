# Edunexa — Education ERP Platform

> **Learn • Grow • Excel**  
> A modern, elegant Education ERP platform designed for schools and colleges with role-based portals.

---

## 📖 Overview

**Edunexa** is a comprehensive school and college management system built to streamline institutional operations. It provides dedicated, role-specific interfaces for Administrators, Teachers, Students, and Parents, enabling smooth academic administration, attendance monitoring, examination grading, and real-time announcements.

---

## ✨ Key Features

- **Multi-Role Portals**: Dedicated workspaces for School Admins, Teachers, Students, Parents, and College Admins.
- **Attendance Management**: Quick attendance marking with daily and monthly percentage tracking.
- **Examinations & Grading**: Timetable scheduling, marks entry, and automated downloadable report cards.
- **Notice Board & Drawer**: Slide-out announcements drawer with priority filters (Urgent, Academic, Circulars).
- **Data Exporting**: Instant PDF and Excel report exports for classes and performance summaries.
- **Light Purple & Lavender UI**: Pure white layout, bold typography, and soft pastel purple cards.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React
- **Backend / DB**: Supabase (PostgreSQL with RLS) & offline demo state
- **Reporting & Export**: jsPDF, xlsx
- **Testing**: Vitest

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Anshika646/project-.git
cd project-

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser at `http://localhost:3000` to view the application.

## 🌐 Deployment to GitHub Pages

This repository is pre-configured with a zero-setup GitHub Actions deployment workflow:

1. Push this repository to GitHub on `main` or `master`.
2. In your repository, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` will automatically build and publish your site with single-page app (SPA) routing support.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Compiles the production application bundle |
| `npm test` | Runs the Vitest test suite |
| `npm start` | Runs the production Node.js Express server |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

