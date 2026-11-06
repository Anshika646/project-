# Edunexa — Multi-Tenant Education ERP

> **Learn • Grow • Excel**  
> Premium Institutional Glassmorphism SaaS Platform for Schools & Colleges.

---

## 1. Architecture & Multi-Tenancy

Edunexa is built with strict multi-tenant isolation. Every table contains an `institution_id uuid not null references institutions(id)`. Data privacy is strictly enforced at the database engine level via **PostgreSQL Row Level Security (RLS)** policies using security helper functions:
- `auth_institution_id()`: Returns the tenant `institution_id` of the authenticated user.
- `auth_role()`: Returns the authenticated user's role (`super_admin`, `school_admin`, `teacher`, `student`, `parent`, `college_admin`, `college_faculty`, `college_student`).

### Important Constraints
- **Fees & Payment Modules**: STRICTLY OUT OF SCOPE. No fee screens, payment receipts, or fee code exist anywhere in Edunexa.
- **Service Role Key**: The Supabase service role key is **never** bundled or exposed in frontend code. It is only utilized locally via `.env.local` for administration and seeding (`npm run seed`).

---

## 2. Environment Variables

Create `.env` (for web client) and `.env.local` (for backend seeding):

```bash
# Frontend (.env)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI..."

# Backend / Local Seeding only (.env.local)
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI..."
```

---

## 3. Database Schema & RLS Policies

The complete SQL migrations are provided under `supabase/migrations/`:
- `supabase/migrations/00001_initial_schema.sql`: Contains 28 multi-tenant tables, indexes on foreign keys and `institution_id`, updated_at triggers, and soft deletion (`is_deleted`) for students and teachers.
- `supabase/migrations/00002_rls_policies.sql`: Complete Row Level Security policies enforcing:
  1. Tenant isolation across institutions.
  2. Student privacy (students can only see their own marks, report cards, and attendance).
  3. Parent privacy (parents can only see records for children linked in `parent_student_links`).
  4. Role access guards for administrators and teachers.

To apply migrations with Supabase CLI:
```bash
supabase db push
```

---

## 4. Development Demo Accounts

Edunexa provides 8 pre-seeded development personas accessible instantly from the Login Page or the Top Header Role Switcher:

| Persona | Role | Email | Scope |
| :--- | :--- | :--- | :--- |
| **Dr. Rajesh Sharma** | `school_admin` | `principal.sharma@edunexa.edu` | Principal / Full School Control |
| **Ms. Priya Verma** | `teacher` | `priya.verma@edunexa.edu` | Mathematics Faculty / Class 10-A |
| **Aarav Patel** | `student` | `aarav.patel@edunexa.edu` | Class 10-A, Roll #14 |
| **Mr. Rajesh Patel** | `parent` | `rajesh.patel@edunexa.edu` | Parent of Aarav Patel |
| **Prof. Alok Kapoor** | `college_admin` | `dean.kapoor@edunexa.edu` | Dean of Academics |
| **Dr. Ananya Sen** | `college_faculty` | `dr.ananya.sen@edunexa.edu` | Associate Professor, CSE |
| **Rohan Mehta** | `college_student` | `rohan.mehta@edunexa.edu` | B.Tech CSE, Sem 6 |
| **Vikramaditya Rao** | `super_admin` | `platform.admin@edunexa.io` | SaaS Platform Owner |

---

## 5. Scripts & Testing

```bash
# Run the development server (port 3000)
npm run dev

# Build for production
npm run build

# Start production Node.js server
npm start

# Run Vitest test suite (grade calculations, attendance %, timetable conflict detection, SGPA/CGPA)
npm test

# Run tests with code coverage
npm run test:coverage

# Run local database seed script
npm run seed
```

---

## 6. Deployment Guide

### A. Deploying to GitHub Pages
1. Go to your GitHub repository: `Settings` → `Pages`.
2. Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Push to `main` (or `master`). The pre-configured `.github/workflows/deploy.yml` workflow will automatically build and publish the applet.
4. Your site will be live at `https://<username>.github.io/<repo-name>/`.
   *(HashRouter and `public/404.html` ensure direct links and browser refreshes work with zero 404 errors)*.

### B. Deploying on Google AI Studio
1. The applet is already pre-configured to bind to `0.0.0.0:3000` with `allowedHosts: true`.
2. The dev server runs seamlessly via `npm run dev`.
3. In-memory demo profiles and institutional state are loaded automatically if no external database is attached.

