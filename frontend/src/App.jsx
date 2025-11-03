import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AQIResult from "./pages/AQIResult";
import ForgotPassword from "./pages/ForgotPassword";
import MainPage from "./pages/mainpage";



function App() {
  return (
    <div style={{ width: "100%", minHeight: "100vh" }}>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/result" element={<AQIResult />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </Router>
    </div>
  );
}
export default App;
