import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SchoolAdminDashboard } from '../components/dashboard/SchoolAdminDashboard';
import { TeacherDashboard } from '../components/dashboard/TeacherDashboard';
import { StudentDashboard } from '../components/dashboard/StudentDashboard';
import { ParentDashboard } from '../components/dashboard/ParentDashboard';
import { SuperAdminDashboard } from '../components/dashboard/SuperAdminDashboard';
import { CollegeAdminDashboard } from '../components/dashboard/CollegeAdminDashboard';

export const DashboardPage: React.FC = () => {
  const { role } = useAuth();

  switch (role) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'teacher':
    case 'college_faculty':
      return <TeacherDashboard />;
    case 'student':
    case 'college_student':
      return <StudentDashboard />;
    case 'parent':
      return <ParentDashboard />;
    case 'college_admin':
      return <CollegeAdminDashboard />;
    case 'school_admin':
    default:
      return <SchoolAdminDashboard />;
  }
};
