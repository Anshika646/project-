import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { RouteGuard } from './components/layout/RouteGuard';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdmissionsPage } from './pages/AdmissionsPage';
import { StudentsPage } from './pages/StudentsPage';
import { TeachersPage } from './pages/TeachersPage';
import { AcademicSetupPage } from './pages/AcademicSetupPage';
import { ClassesPage } from './pages/ClassesPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { AttendancePage } from './pages/AttendancePage';
import { ExaminationsPage } from './pages/ExaminationsPage';
import { TimetablePage } from './pages/TimetablePage';
import { NotesPage } from './pages/NotesPage';
import { QuizzesPage } from './pages/QuizzesPage';
import { HomeworkPage } from './pages/HomeworkPage';
import { PTMPage } from './pages/PTMPage';
import { NoticesPage } from './pages/NoticesPage';
import { ReportsPage } from './pages/ReportsPage';
import { PromotionsPage } from './pages/PromotionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SessionLifecyclePage } from './pages/SessionLifecyclePage';
import { SettingsPage } from './pages/SettingsPage';
import { CollegePage } from './pages/CollegePage';
import { SuperAdminPage } from './pages/SuperAdminPage';
import { UnauthorizedPage, NotFoundPage } from './pages/ErrorPages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected Application Routes inside AppLayout */}
            <Route
              path="/"
              element={
                <RouteGuard>
                  <AppLayout />
                </RouteGuard>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="admissions" element={<AdmissionsPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="teachers" element={<TeachersPage />} />
              <Route path="academic-setup" element={<AcademicSetupPage />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route path="subjects" element={<SubjectsPage />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="examinations" element={<ExaminationsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="homework" element={<HomeworkPage />} />
              <Route path="quizzes" element={<QuizzesPage />} />
              <Route path="ptm" element={<PTMPage />} />
              <Route path="notices" element={<NoticesPage />} />
              <Route path="promotions" element={<PromotionsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="session-lifecycle" element={<SessionLifecyclePage />} />
              <Route path="settings" element={<SettingsPage />} />

              {/* Dedicated College & University Routes */}
              <Route path="departments" element={<CollegePage />} />
              <Route path="courses" element={<CollegePage />} />

              {/* Dedicated Super Admin SaaS Management Routes */}
              <Route path="institutions" element={<SuperAdminPage />} />
              <Route path="subscriptions" element={<SuperAdminPage />} />
              <Route path="tickets" element={<SuperAdminPage />} />
            </Route>

            {/* Fallback 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
