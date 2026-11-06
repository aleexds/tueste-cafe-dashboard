
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../auth';
import { DashboardPage } from '../pages/DashboardPage';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';

const ProtectedDashboard = () => {
  const location = useLocation();

  return isAuthenticated()
    ? <DashboardPage />
    : <Navigate to="/login" replace state={{ from: location }} />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};