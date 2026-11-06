import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { RouteGuard } from './components/layout/RouteGuard';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { TeachersPage } from './pages/TeachersPage';
import { AttendancePage } from './pages/AttendancePage';
import { ExaminationsPage } from './pages/ExaminationsPage';
import { TimetablePage } from './pages/TimetablePage';
import { NotesPage } from './pages/NotesPage';
import { NoticesPage } from './pages/NoticesPage';
import { ReportsPage } from './pages/ReportsPage';
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
        <BrowserRouter>
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
              <Route path="students" element={<StudentsPage />} />
              <Route path="teachers" element={<TeachersPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="examinations" element={<ExaminationsPage />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="notices" element={<NoticesPage />} />
              <Route path="reports" element={<ReportsPage />} />

              {/* Convenience aliases for college / role specific routes */}
              <Route path="departments" element={<ReportsPage />} />
              <Route path="courses" element={<TimetablePage />} />
              <Route path="classes" element={<StudentsPage />} />
              <Route path="subjects" element={<NotesPage />} />
              <Route path="homework" element={<NotesPage />} />
              <Route path="quizzes" element={<DashboardPage />} />
              <Route path="ptm" element={<DashboardPage />} />
              <Route path="institutions" element={<ReportsPage />} />
              <Route path="subscriptions" element={<ReportsPage />} />
              <Route path="analytics" element={<ReportsPage />} />
              <Route path="tickets" element={<NoticesPage />} />
              <Route path="settings" element={<ReportsPage />} />
            </Route>

            {/* Fallback 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
