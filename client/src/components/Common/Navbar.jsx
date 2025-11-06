import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // ensure the correct path

import prepSaasLogo from "../../assets/logo.jpg";
// --- Icons ---
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
  </svg>
);

const InterviewsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 10s-1-2-3-2c-2 0-3 2-3 2s1 2 3 2c2 0 3-2 3-2z" />
  </svg>
);

const PracticeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 17s3 3 8 3 8-3 8-3" />
    <path d="M4 17s3 3 8 3 8-3 8-3" />
  </svg>
);

const NotesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z" />
    <path d="M15 3v6h6" />
  </svg>
);

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" />
    <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4" />
    <path d="M12 18v4" />
    <path d="M4.93 4.93l2.83 2.83" />
    <path d="M16.24 16.24l2.83 2.83" />
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <path d="M4.93 19.07l2.83-2.83" />
    <path d="M16.24 7.76l2.83-2.83" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Logo = ()=>(
  <div className="flex items-center gap-2">
     <img 
       src={prepSaasLogo}
       alt="image"
       className="w-25 h-25 object-contain"
       />
       <span className="text-xl font-bold text-white whitespace-nowrap">PrepSaas</span>
  </div>
);


// --- Navigation Item Component ---
const NavItem = ({ to, icon, label, isActive, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-4 py-2 px-4 rounded-lg transition-colors ${
      isActive ? "bg-white/10 text-white" : "hover:bg-white/5 text-gray-300"
    }`}
  >
    <span className="flex-shrink-0">{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activePathSegment = location.pathname.split("/")[1] || "dashboard";

  const handleLogout = () => {
    if (user && logout) {
      logout();
      navigate("/login");
    }
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => isSidebarOpen && setIsSidebarOpen(false);

  // --- User Info ---
  const name = user?.name || user?.email?.split("@")[0] || "";
  const email = user?.email || "";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const sidebarWidthClass = "w-60"; // 240px

  return (
    <>
      {/* --- Top Bar --- */}
      <div className="p-4 bg-gray-900 sticky top-0 z-50 flex items-center justify-between shadow-lg">
        {/* Left: Menu Toggle */}
        <button
          onClick={toggleSidebar}
          className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        {/* Center: Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <span className="text-lg font-bold text-white">PrepSaas</span>
        </div>

        {/* Right: User Info */}
        {user && (
          <div className="flex items-center gap-2 text-white/90">
            <div className="hidden sm:block text-sm font-medium truncate max-w-[100px]">
              {name}
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold cursor-pointer">
              {initials}
            </div>
          </div>
        )}
      </div>

      {/* --- Sidebar --- */}
      <header
        className={`fixed top-0 left-0 h-full ${sidebarWidthClass} bg-gray-900 text-white flex flex-col justify-between p-4 shadow-2xl z-40 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Profile Section */}
        {user && (
          <div className="flex items-center gap-3 border-b border-gray-700 pb-4">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">
              {initials}
            </div>
            <div className="truncate">
              <div className="text-sm font-semibold truncate">{name}</div>
              <div className="text-xs text-gray-400 truncate">{email}</div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex flex-col gap-1 mt-6 flex-grow">
          <NavItem to="/dashboard" icon={<DashboardIcon />} label="Dashboard" isActive={activePathSegment === "dashboard"} onClick={closeSidebar} />
          <NavItem to="/practice" icon={<InterviewsIcon />} label="Practice" isActive={activePathSegment === "practice"} onClick={closeSidebar} />
          <NavItem to="/results" icon={<NotesIcon />} label="Results" isActive={activePathSegment === "results"} onClick={closeSidebar} />
          <NavItem to="/resume" icon={<ProfileIcon />} label="Resume" isActive={activePathSegment === "resume"} onClick={closeSidebar} />
          <NavItem to="/coding" icon={<PracticeIcon />} label="Coding" isActive={activePathSegment === "coding"} onClick={closeSidebar} />
          <NavItem to="/report" icon={<DashboardIcon />} label="Report" isActive={activePathSegment === "report"} onClick={closeSidebar} />

          {user?.role === "admin" && (
            <div className="mt-3 pt-3 border-t border-gray-800">
              <NavItem to="/admin/submissions" icon={<ProfileIcon />} label="Admin Submissions" isActive={activePathSegment.startsWith("admin")} onClick={closeSidebar} />
              <NavItem to="/admin/mocks" icon={<InterviewsIcon />} label="Mock Reviews" isActive={activePathSegment.startsWith("admin")} onClick={closeSidebar} />
            </div>
          )}
        </nav>

        {/* Settings & Logout */}
        <div className="flex flex-col gap-1 pt-4 border-t border-gray-700">
          <NavItem to="/settings" icon={<SettingsIcon />} label="Settings" isActive={activePathSegment === "settings"} onClick={closeSidebar} />

          {user && (
            <button
              onClick={() => {
                handleLogout();
                closeSidebar();
              }}
              className="flex items-center gap-4 py-2 px-4 rounded-lg text-gray-300 hover:bg-white/5 transition-colors w-full"
            >
              <LogoutIcon />
              <span className="text-sm font-medium">Log Out</span>
            </button>
          )}
        </div>
      </header>

      {/* --- Spacer for Layout --- */}
      <div
        className={`${isSidebarOpen ? sidebarWidthClass : "w-0"} h-0 flex-shrink-0 transition-all duration-300`}
        aria-hidden="true"
      />

      {/* --- Backdrop --- */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
    </>
  );
}
