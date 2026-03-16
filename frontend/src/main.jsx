import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./utils/AuthContext.jsx";

import HomePage             from "./pages/HomePage.jsx";
import LoginPage            from "./pages/LoginPage.jsx";
import HospitalLoginPage    from "./pages/HospitalLoginPage.jsx";
import HospitalRegisterPage from "./pages/HospitalRegisterPage.jsx";
import AdminLoginPage       from "./pages/AdminLoginPage.jsx";
import DonorRegisterPage    from "./pages/donor/DonorRegisterPage.jsx";
import DonorDashboard       from "./pages/donor/DonorDashboard.jsx";
import DonorRespondPage     from "./pages/donor/DonorRespondPage.jsx";
import HospitalDashboard    from "./pages/hospital/HospitalDashboard.jsx";
import HospitalRequests     from "./pages/hospital/HospitalRequests.jsx";
import HospitalInventory    from "./pages/hospital/HospitalInventory.jsx";
import NewRequest           from "./pages/hospital/NewRequest.jsx";
import AdminDashboard       from "./pages/admin/AdminDashboard.jsx";
import AdminHospitals       from "./pages/admin/AdminHospitals.jsx";
import AdminDonors          from "./pages/admin/AdminDonors.jsx";
import AdminSmsLog          from "./pages/admin/AdminSmsLog.jsx";
import AdminRequests        from "./pages/admin/AdminRequests.jsx";

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) {
    if (role === "hospital") return <Navigate to="/hospital-login" replace />;
    if (role === "admin")    return <Navigate to="/admin/login" replace />;
    return <Navigate to="/login" replace />;
  }
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"                   element={<HomePage />} />
          <Route path="/login"              element={<LoginPage />} />
          <Route path="/register"           element={<DonorRegisterPage />} />
          <Route path="/hospital-login"     element={<HospitalLoginPage />} />
          <Route path="/hospital/register"  element={<HospitalRegisterPage />} />
          <Route path="/admin/login"        element={<AdminLoginPage />} />
          <Route path="/donor/respond"      element={<DonorRespondPage />} />

          {/* Donor protected */}
          <Route path="/donor/dashboard" element={
            <ProtectedRoute role="donor"><DonorDashboard /></ProtectedRoute>
          } />

          {/* Hospital protected */}
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

          {/* Admin protected */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/hospitals" element={
            <ProtectedRoute role="admin"><AdminHospitals /></ProtectedRoute>
          } />
          <Route path="/admin/donors" element={
            <ProtectedRoute role="admin"><AdminDonors /></ProtectedRoute>
          } />
          <Route path="/admin/sms" element={
            <ProtectedRoute role="admin"><AdminSmsLog /></ProtectedRoute>
          } />
          <Route path="/admin/requests" element={
            <ProtectedRoute role="admin"><AdminRequests /></ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);