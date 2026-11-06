
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../auth';
import { DashboardPage } from '../pages/DashboardPage';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { CustomerPage } from '../pages/CustomerPage';
import { InvitationPage } from '../pages/InvitationPage';
import { InvitationWelcomePage } from '../pages/InvitationWelcomePage';

const ProtectedRoute = ({ role, children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAuthenticated(role)) {
    return <Navigate to={role === 'admin' ? '/cliente' : '/dashboard'} replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/invitacion" element={<InvitationWelcomePage />} />
      <Route path="/invitaciones" element={<InvitationPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute role="admin"><DashboardPage /></ProtectedRoute>
      } />
      <Route path="/cliente" element={
        <ProtectedRoute role="customer"><CustomerPage /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};