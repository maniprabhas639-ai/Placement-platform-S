// client/src/App.jsx
import React, { Suspense, lazy, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Common/Navbar";

import "./index.css";

// Lazy-loaded pages (code-splitting)
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Practice = lazy(() => import("./pages/Practice"));
const Results = lazy(() => import("./pages/Results"));
const Resume = lazy(() => import("./pages/Resume"));
const InterviewDetails = lazy(() => import("./pages/InterviewDetails"));
const InterviewCreate = lazy(() => import("./pages/InterviewCreate"));
const Coding = lazy(() => import("./pages/Coding"));
const AdminSubmissions = lazy(() => import("./pages/AdminSubmissions"));
const Report = lazy(() => import("./pages/Report"));
const PracticeHub = lazy(() => import("./pages/PracticeHub"));
const MockInterview = lazy(() => import("./pages/MockInterview"));

// Single memoized AuthLayout to keep Navbar stable
const AuthLayout = React.memo(function AuthLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="main-content container-center">{children}</main>
    </>
  );
});

export default function App() {
  // keep the same layout reference between renders
  const Layout = useMemo(() => AuthLayout, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        <Suspense fallback={<div className="loading">Loading...</div>}>
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
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/practice"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Practice />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/practice-hub"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PracticeHub />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/results"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Results />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/resume"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Resume />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Report />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/coding"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Coding />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/submissions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminSubmissions />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/mock"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MockInterview />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Interview detail route */}
            <Route
              path="/interview/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <InterviewDetails />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Create interview route (centered page) */}
            <Route
              path="/interviews/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <InterviewCreate />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
