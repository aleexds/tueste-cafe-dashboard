
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};