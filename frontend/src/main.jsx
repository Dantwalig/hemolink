import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import HospitalLoginPage from "./pages/HospitalLoginPage";
import DonorRegisterPage  from "./pages/donor/DonorRegisterPage";
import DonorRespondPage   from "./pages/donor/DonorRespondPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<HomePage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/hospital-login" element={<HospitalLoginPage />} />
        <Route path="/register"      element={<DonorRegisterPage />} />
        <Route path="/donor/respond" element={<DonorRespondPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);