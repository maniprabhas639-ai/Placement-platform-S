// client/src/pages/Dashboard.jsx
import React, { useContext, useEffect, useState, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  IoSearch,
  IoNotificationsOutline,
  IoAdd,
  IoArrowBack,
  IoArrowForward,
  IoCloseCircleOutline,
} from "react-icons/io5";

import api from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";

// --- PageButton ---
function PageButton({ disabled, onClick, children, isActive }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`px-3 py-1 rounded text-sm transition duration-150 
        ${
          isActive
            ? "bg-pink-600 text-white font-semibold"
            : "border border-gray-700 text-gray-400 hover:bg-gray-700"
        }
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

// --- InterviewCard ---
function InterviewCard({ interview }) {
  const cardGradientMap = {
    "Software Engineer": "bg-gradient-to-br from-amber-400/50 to-blue-600/50",
    "Product Manager": "bg-gradient-to-br from-green-400/50 to-teal-600/50",
    "Data Analyst": "bg-gradient-to-br from-yellow-400/50 to-green-600/50",
    "UX Designer": "bg-gradient-to-br from-fuchsia-400/50 to-indigo-600/50",
  };

  const cardBg =
    cardGradientMap[interview.role] ||
    "bg-gradient-to-br from-amber-400/50 to-blue-600/50";

  const dateStr = interview.date
    ? format(new Date(interview.date), "dd MMM yyyy")
    : "TBA";
  const pkgStr = interview.package || "$100k";

  const tagStyles = {
    "On-campus": "bg-blue-600/30 text-blue-300",
    SDE: "bg-indigo-600/30 text-indigo-300",
    Applied: "bg-yellow-600/30 text-yellow-300",
    OA: "bg-purple-600/30 text-purple-300",
    "Technical Round": "bg-green-600/30 text-green-300",
    "Off-campus": "bg-red-600/30 text-red-300",
    Design: "bg-pink-600/30 text-pink-300",
  };

  const getTagStyle = (tag) => tagStyles[tag] || "bg-gray-600/30 text-gray-300";

  return (
    <Link to={`/interview/${interview._id}`} className="block">
      <div className="p-0 rounded-xl overflow-hidden shadow-2xl transition duration-300 hover:scale-[1.02] bg-gray-800/80 border border-gray-700">
        <div className={`h-24 ${cardBg} relative`}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        </div>

        <div className="p-4 pt-1">
          <h3 className="text-xl font-semibold mb-1">{interview.role}</h3>
          <p className="text-md text-gray-400">{interview.company}</p>

          <p className="text-sm text-gray-300 mt-2">
            {dateStr} - {pkgStr}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {(interview.topics || []).slice(0, 3).map((t, index) => (
              <span
                key={index}
                className={`text-xs px-3 py-1 rounded-full font-medium ${getTagStyle(
                  t
                )}`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

// --- UpcomingInterviewToast ---
function UpcomingInterviewToast({ interview, onClose }) {
  if (!interview) return null;

  const dateStr = format(new Date(interview.date), "EEE, MMM do, yyyy");
  const timeStr = format(new Date(interview.date), "h:mm a");

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-gray-800 p-4 rounded-xl shadow-2xl border-l-4 border-pink-500 z-50 animate-fadeInUp">
      <div className="flex justify-between items-start">
        <h4 className="text-lg font-semibold text-pink-400 mb-1">
          Reminder: Upcoming Interview
        </h4>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition">
          <IoCloseCircleOutline className="text-2xl" />
        </button>
      </div>

      <p className="text-white text-md">
        <span className="font-bold">{interview.company}</span> - {interview.role}
      </p>

      <p className="text-sm text-gray-300 mt-1">
        <span className="font-medium text-white">{dateStr}</span> at {timeStr}
      </p>

      <Link
        to={`/interview/${interview._id}`}
        onClick={onClose}
        className="text-xs text-purple-400 mt-2 block hover:underline"
      >
        View Details
      </Link>
    </div>
  );
}

// --- Dashboard (main) ---
export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1, limit: 9 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState("");
  const [packageFilter, setPackageFilter] = useState("");
  const [upcomingFilter, setUpcomingFilter] = useState("all");
  const [limit, setLimit] = useState(9);

  const searchRef = useRef(null);
  const [debouncedQ, setDebouncedQ] = useState(q);

  const gotoPage = (p) => setMeta((prev) => ({ ...prev, page: p }));

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const params = new URLSearchParams();
        params.set("page", meta.page || 1);
        params.set("limit", limit);
        if (debouncedQ) params.set("q", debouncedQ);
        if (upcomingFilter === "upcoming") params.set("upcoming", "true");
        if (upcomingFilter === "past") params.set("upcoming", "false");
        if (roleFilter) params.set("role", roleFilter);
        if (dateRangeFilter) params.set("dateRange", dateRangeFilter);
        if (packageFilter) params.set("package", packageFilter);

        const res = await api.get(`/api/interviews?${params.toString()}`);

        if (!mounted) return;
        setInterviews(res.data.interviews || []);
        setMeta(res.data.meta || { total: 0, page: 1, pages: 1, limit });
      } catch (e) {
        console.error("Failed to load interviews", e);
        if (mounted) setErr("Failed to load data");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (user) load();
    return () => {
      mounted = false;
    };
  }, [user, debouncedQ, upcomingFilter, meta.page, limit, roleFilter, dateRangeFilter, packageFilter]);

  useEffect(() => {
    setMeta((prev) => ({ ...prev, page: 1 }));
  }, [debouncedQ, upcomingFilter, limit, roleFilter, dateRangeFilter, packageFilter]);

  const upcomingInterview = useMemo(() => {
    if (!Array.isArray(interviews) || interviews.length === 0) return null;
    const now = new Date();
    const candidates = interviews
      .filter((it) => it.date)
      .map((it) => ({ ...it, _dateObj: new Date(it.date) }))
      .filter((it) => it._dateObj >= now)
      .sort((a, b) => a._dateObj - b._dateObj);
    return candidates.length ? candidates[0] : null;
  }, [interviews]);

  const summaryCards = [
    { title: "Recent Interviews", value: meta.total || 0, action: "recent" },
    {
      title: "Upcoming Mock",
      value: upcomingInterview
        ? format(new Date(upcomingInterview.date), "dd MMM, yyyy")
        : "No upcoming mock",
      action: "upcoming",
      interviewId: upcomingInterview ? upcomingInterview._id : null,
    },
    { title: "Latest Score", value: "View Report", action: "report" },
  ];

  const handleSummaryClick = (card) => {
    if (!card) return;
    if (card.action === "recent") navigate("/interviews");
    else if (card.action === "upcoming")
      navigate(
        card.interviewId
          ? `/interview/${card.interviewId}`
          : "/interviews?upcoming=true"
      );
    else if (card.action === "report") navigate("/results");
  };

  const handleNotificationClick = () => {
    if (upcomingInterview) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } else {
      alert("No upcoming interviews found.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center space-x-2">
            
           </div>

          <div className="flex items-center bg-gray-800 rounded-full px-4 py-2 flex-grow max-w-xl mx-8 border border-gray-700 shadow-md">
            <IoSearch className="text-xl text-gray-400 mr-2" />
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search companies, roles..."
              className="bg-transparent outline-none flex-grow text-white placeholder-gray-400"
            />
          </div>

          <div className="relative cursor-pointer" onClick={handleNotificationClick}>
            <IoNotificationsOutline className="text-3xl text-gray-400 hover:text-pink-500 transition" />
            {upcomingInterview && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-gray-900 bg-red-500" />
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {summaryCards.map((card, i) => (
            <div
              key={i}
              className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700"
            >
              <h3 className="text-lg text-gray-400 mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-white mb-3">{card.value}</p>
              <button
                onClick={() => handleSummaryClick(card)}
                className="text-sm text-pink-400 hover:text-pink-300 font-medium transition"
              >
                {card.title === "Latest Score"
                  ? "View Report"
                  : card.title === "Recent Interviews"
                  ? "View All"
                  : "View Schedule"}
              </button>
            </div>
          ))}
        </div>
      </header>

      {/* Interviews */}
      <section className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">My Interviews ({meta.total})</h2>
          <button
            onClick={() => navigate("/interviews/new")}
            className="flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 font-medium text-white shadow-lg hover:opacity-90 transition"
          >
            <IoAdd className="text-xl mr-1" /> Add Interview
          </button>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {loading && (
            <div className="col-span-full p-6 text-center text-gray-400">
              Loading interviews...
            </div>
          )}
          {err && (
            <div className="col-span-full text-red-400 bg-red-900/30 p-4 rounded-lg">
              Error: {err}
            </div>
          )}

          {!loading && interviews.length === 0 && (
            <div className="col-span-full p-8 bg-gray-800 rounded-xl text-center text-gray-400 border border-gray-700">
              No interviews found — try adjusting your filters or click 'Add Interview'.
            </div>
          )}

          {interviews.map((i) => (
            <InterviewCard key={i._id} interview={i} />
          ))}
        </div>
      </section>

      {/* Pagination */}
      <div className="mt-10 flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="text-sm text-gray-400">
          Showing{" "}
          {Math.min(meta.total, (meta.page - 1) * (meta.limit || limit) + 1)}–
          {Math.min(meta.total, meta.page * (meta.limit || limit))} of{" "}
          {meta.total} interview(s)
        </div>
        <div className="flex items-center gap-2">
          <PageButton
            disabled={meta.page <= 1}
            onClick={() => gotoPage(Math.max(1, meta.page - 1))}
          >
            <IoArrowBack className="inline-block text-lg" />
          </PageButton>
          <PageButton
            disabled={meta.page >= meta.pages}
            onClick={() => gotoPage(Math.min(meta.pages, meta.page + 1))}
          >
            <IoArrowForward className="inline-block text-lg" />
          </PageButton>
        </div>
      </div>

      {/* Toast */}
      {showToast && upcomingInterview && (
        <UpcomingInterviewToast
          interview={upcomingInterview}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
