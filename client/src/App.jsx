// client/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Practice from "./pages/Practice";
import Results from "./pages/Results";
import Resume from "./pages/Resume";
import InterviewDetails from "./pages/InterviewDetails";
import InterviewCreate from "./pages/InterviewCreate";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Common/Navbar";
import Coding from "./pages/Coding";
import AdminSubmissions from "./pages/AdminSubmissions";
import Report from "./pages/Report";
import PracticeHub from "./pages/PracticeHub";
import MockInterview from "./pages/MockInterview";

import "./index.css";

/**
 * AuthLayout - small layout wrapper used inside Route element prop
 * NOTE: We do NOT render <AuthLayout> directly inside <Routes> as a child.
 */
const AuthLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="main-content container-center">{children}</main>
  </>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected screens (wrap with ProtectedRoute and AuthLayout) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AuthLayout>
                  <Dashboard />
                </AuthLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <AuthLayout>
                  <Practice />
                </AuthLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/practice-hub"
            element={
              <ProtectedRoute>
                <AuthLayout>
                  <PracticeHub />
                </AuthLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <AuthLayout>
                  <Results />
                </AuthLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/resume"
            element={
              <ProtectedRoute>
                <AuthLayout>
                  <Resume />
                </AuthLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <AuthLayout>
                  <Report />
                </AuthLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/coding"
            element={
              <ProtectedRoute>
                <AuthLayout>
                  <Coding />
                </AuthLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/submissions"
            element={
              <ProtectedRoute>
                <AuthLayout>
                  <AdminSubmissions />
                </AuthLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/mock"
            element={
              <ProtectedRoute>
                <AuthLayout>
                  <MockInterview />
                </AuthLayout>
              </ProtectedRoute>
            }
          />

          {/* Interview detail route */}
          <Route
            path="/interview/:id"
            element={
              <ProtectedRoute>
                <AuthLayout>
                  <InterviewDetails />
                </AuthLayout>
              </ProtectedRoute>
            }
          />

          {/* Create interview route (centered page) */}
          <Route
            path="/interviews/new"
            element={
              <ProtectedRoute>
                <AuthLayout>
                  <InterviewCreate />
                </AuthLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
