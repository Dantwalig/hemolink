import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import HospitalLoginPage from "./pages/HospitalLoginPage.jsx";
import DonorRegisterPage from "./pages/donor/DonorRegisterPage.jsx";
import DonorRespondPage from "./pages/donor/DonorRespondPage.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"               element={<HomePage />} />
          <Route path="/login"          element={<LoginPage />} />
          <Route path="/hospital-login" element={<HospitalLoginPage />} />
          <Route path="/register"       element={<DonorRegisterPage />} />
          <Route path="/donor/respond"  element={<DonorRespondPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);