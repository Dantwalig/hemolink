import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import HospitalLoginPage from "./pages/HospitalLoginPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<HomePage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/hospital-login" element={<HospitalLoginPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);