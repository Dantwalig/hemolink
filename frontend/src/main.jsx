import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./utils/AuthContext.jsx";

import HomePage              from "./pages/HomePage.jsx";
import LoginPage             from "./pages/LoginPage.jsx";
import HospitalLoginPage     from "./pages/HospitalLoginPage.jsx";
import HospitalRegisterPage  from "./pages/HospitalRegisterPage.jsx";
import DonorRegisterPage     from "./pages/donor/DonorRegisterPage.jsx";
import DonorDashboard        from "./pages/donor/DonorDashboard.jsx";
import DonorRespondPage      from "./pages/donor/DonorRespondPage.jsx";
import HospitalDashboard     from "./pages/hospital/HospitalDashboard.jsx";
import HospitalRequests      from "./pages/hospital/HospitalRequests.jsx";
import HospitalInventory     from "./pages/hospital/HospitalInventory.jsx";
import NewRequest            from "./pages/hospital/NewRequest.jsx";

// Route guard: redirects to login if not authenticated or wrong role
function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to={role === "hospital" ? "/hospital-login" : "/login"} replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"                    element={<HomePage />} />
          <Route path="/login"               element={<LoginPage />} />
          <Route path="/register"            element={<DonorRegisterPage />} />
          <Route path="/hospital-login"      element={<HospitalLoginPage />} />
          {/* FIX: new hospital self-registration page */}
          <Route path="/hospital/register"   element={<HospitalRegisterPage />} />
          {/* SMS response link — public, no auth */}
          <Route path="/donor/respond"       element={<DonorRespondPage />} />

          {/* Donor protected routes */}
          <Route path="/donor/dashboard" element={
            <ProtectedRoute role="donor"><DonorDashboard /></ProtectedRoute>
          } />

          {/* Hospital protected routes */}
          <Route path="/hospital/dashboard" element={
            <ProtectedRoute role="hospital"><HospitalDashboard /></ProtectedRoute>
          } />
          <Route path="/hospital/requests" element={
            <ProtectedRoute role="hospital"><HospitalRequests /></ProtectedRoute>
          } />
          <Route path="/hospital/requests/new" element={
            <ProtectedRoute role="hospital"><NewRequest /></ProtectedRoute>
          } />
          <Route path="/hospital/inventory" element={
            <ProtectedRoute role="hospital"><HospitalInventory /></ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);