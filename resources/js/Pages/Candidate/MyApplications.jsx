import React, { useState, useMemo } from "react";
import { Link, router, usePage, Head } from "@inertiajs/react";
import HomepageLayout from "@/Layouts/HomepageLayout";
import {
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Eye,
  FileText,
  Search,
  ChevronRight,
  ExternalLink,
  Trash2,
  Sparkles,
  Filter,
  ArrowRight,
  X,
  Phone,
  Mail,
  Award,
  ChevronDown,
  ChevronUp,
  Download,
  User,
  Navigation,
  Video,
  Info,
  Check,
} from "lucide-react";

export default function MyApplications({
  applications = { data: [] },
  statusCounts = {},
}) {
  const { auth, flash } = usePage().props;
  const user = auth?.user || {};

  // Extract application items (handles both paginated and plain array)
  const appList = Array.isArray(applications)
    ? applications
    : applications?.data || [];

  // Local interactive state
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [expandedCoverId, setExpandedCoverId] = useState(null);

  // Modal State for Live Application Tracker & Job Details
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalTab, setModalTab] = useState("timeline"); // "timeline" | "job_details" | "submission"

  // Status mapping helper
  const getStatusConfig = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("hire") || s.includes("offer")) {
      return {
        label: "Hired / Offer Received",
        badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
        dotClass: "bg-purple-500",
        icon: Award,
        category: "hired",
      };
    }
    if (s.includes("shortlist") || s.includes("interview") || s.includes("approved")) {
      return {
        label: "Shortlisted / Interview",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotClass: "bg-emerald-500",
        icon: CheckCircle2,
        category: "shortlisted",
      };
    }
    if (s.includes("view") || s.includes("calling")) {
      return {
        label: "Application In Review",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
        dotClass: "bg-blue-500",
        icon: Eye,
        category: "in_progress",
      };
    }
    if (s.includes("reject") || s.includes("not_selected")) {
      return {
        label: "Not Selected",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
        dotClass: "bg-rose-500",
        icon: AlertCircle,
        category: "rejected",
      };
    }
    return {
      label: "Application Submitted",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
      dotClass: "bg-amber-500",
      icon: Clock,
      category: "applied",
    };
  };

  // Filter applications by tab and search
  const filteredApps = useMemo(() => {
    return appList.filter((app) => {
      const cfg = getStatusConfig(app.status);
      const job = app.jobPost || app.job || {};

      // Tab match
      if (activeTab === "applied" && cfg.category !== "applied" && cfg.category !== "in_progress") {
        return false;
      }
      if (activeTab === "shortlisted" && cfg.category !== "shortlisted") {
        return false;
      }
      if (activeTab === "hired" && cfg.category !== "hired") {
        return false;
      }
      if (activeTab === "rejected" && cfg.category !== "rejected") {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (job.title || "").toLowerCase().includes(q);
        const compMatch = (job.company || "").toLowerCase().includes(q);
        const locMatch = (job.location || "").toLowerCase().includes(q);
        return titleMatch || compMatch || locMatch;
      }

      return true;
    });
  }, [appList, activeTab, searchQuery]);

  // Handle withdraw application
  const handleConfirmWithdraw = () => {
    if (!withdrawTarget) return;
    setWithdrawing(true);
    router.delete(`/my-applications/${withdrawTarget.id}/withdraw`, {
      preserveScroll: true,
      onFinish: () => {
        setWithdrawing(false);
        setWithdrawTarget(null);
        if (selectedApp && selectedApp.id === withdrawTarget.id) {
          setSelectedApp(null);
        }
      },
    });
  };

  // Count calculations
  const totalCount = statusCounts.all ?? appList.length;
  const appliedCount =
    statusCounts.applied ??
    appList.filter((a) => {
      const c = getStatusConfig(a.status).category;
      return c === "applied" || c === "in_progress";
    }).length;
  const shortlistedCount =
    statusCounts.shortlisted ??
    appList.filter((a) => getStatusConfig(a.status).category === "shortlisted").length;
  const hiredCount =
    statusCounts.hired ??
    appList.filter((a) => getStatusConfig(a.status).category === "hired").length;
  const rejectedCount =
    statusCounts.rejected ??
    appList.filter((a) => getStatusConfig(a.status).category === "rejected").length;

  return (
    <HomepageLayout>
      <Head title="My Applications | Candidate Dashboard" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Flash Notifications */}
        {flash?.success && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-semibold shadow-xs animate-in fade-in duration-150">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{flash.success}</span>
          </div>
        )}
        {flash?.error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm font-semibold shadow-xs animate-in fade-in duration-150">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{flash.error}</span>
          </div>
        )}

        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Application Tracker
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
              My Job Applications
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Track live hiring progress, interview details, and complete job post specs
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/job-listings"
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition"
            >
              <Briefcase className="w-4 h-4" /> Browse More Jobs
            </Link>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[
            {
              id: "all",
              label: "Total Applied",
              count: totalCount,
              color: "text-gray-900",
              bgColor: "bg-white",
              borderColor: "border-gray-200/80",
              icon: Briefcase,
              iconColor: "text-blue-600",
            },
            {
              id: "applied",
              label: "In Review",
              count: appliedCount,
              color: "text-amber-800",
              bgColor: "bg-amber-50/40",
              borderColor: "border-amber-200/70",
              icon: Clock,
              iconColor: "text-amber-600",
            },
            {
              id: "shortlisted",
              label: "Shortlisted",
              count: shortlistedCount,
              color: "text-emerald-800",
              bgColor: "bg-emerald-50/40",
              borderColor: "border-emerald-200/70",
              icon: CheckCircle2,
              iconColor: "text-emerald-600",
            },
            {
              id: "hired",
              label: "Offers / Hired",
              count: hiredCount,
              color: "text-purple-800",
              bgColor: "bg-purple-50/40",
              borderColor: "border-purple-200/70",
              icon: Award,
              iconColor: "text-purple-600",
            },
          ].map((card) => {
            const Icon = card.icon;
            const isSelected = activeTab === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setActiveTab(card.id)}
                className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-xs hover:shadow-sm ${
                  card.bgColor
                } ${card.borderColor} ${
                  isSelected ? "ring-2 ring-blue-500 shadow-sm" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {card.label}
                  </span>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
                <p className={`text-2xl sm:text-3xl font-black mt-2 ${card.color}`}>
                  {card.count}
                </p>
              </button>
            );
          })}
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-3 sm:p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All", count: totalCount },
              { id: "applied", label: "In Review", count: appliedCount },
              { id: "shortlisted", label: "Shortlisted", count: shortlistedCount },
              { id: "hired", label: "Hired", count: hiredCount },
              { id: "rejected", label: "Rejected", count: rejectedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-gray-200/70 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job or company..."
              className="w-full pl-9 pr-8 py-2 bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Applications List */}
        {filteredApps.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-gray-200/80 rounded-2xl p-10 sm:p-14 text-center shadow-xs">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              {appList.length === 0
                ? "No applications submitted yet"
                : "No applications match your filter"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-1 leading-relaxed">
              {appList.length === 0
                ? "Explore top verified job vacancies matching your experience and apply in one click with your profile resume."
                : "Try clearing your search query or selecting a different status tab to see your applications."}
            </p>
            {appList.length === 0 ? (
              <Link
                href="/job-listings"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition"
              >
                Explore Vacancies <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("all");
                  setSearchQuery("");
                }}
                className="mt-4 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          /* Cards Grid */
          <div className="space-y-4">
            {filteredApps.map((app) => {
              const job = app.jobPost || app.job || {};
              const statusCfg = getStatusConfig(app.status);
              const StatusIcon = statusCfg.icon;

              const salaryText =
                job.min_salary && job.max_salary
                  ? `₹${Number(job.min_salary).toLocaleString()} - ₹${Number(job.max_salary).toLocaleString()}`
                  : job.min_salary
                  ? `₹${Number(job.min_salary).toLocaleString()}+`
                  : "Competitive CTC";

              const skillsList = Array.isArray(job.skills)
                ? job.skills
                : typeof job.skills === "string"
                ? job.skills.split(",").map((s) => s.trim()).filter(Boolean)
                : [];

              const appliedDate = app.created_at
                ? new Date(app.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Recently";

              const companyInitial = (job.company || "C").slice(0, 2).toUpperCase();

              return (
                <div
                  key={app.id || app.uuid}
                  className="bg-white border border-gray-200/80 hover:border-blue-300 rounded-2xl shadow-xs hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Card Main Body */}
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left: Company Logo & Details */}
                      <div className="flex items-start gap-4 min-w-0">
                        {job.company_image ? (
                          <img
                            src={job.company_image}
                            alt={job.company || "Company"}
                            className="w-12 h-12 rounded-xl object-contain border border-gray-100 bg-white p-1 shrink-0 shadow-xs"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                            {companyInitial}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2
                              onClick={() => {
                                setSelectedApp(app);
                                setModalTab("timeline");
                              }}
                              className="text-base sm:text-lg font-bold text-gray-900 hover:text-blue-600 transition cursor-pointer truncate"
                            >
                              {job.title || "Job Application"}
                            </h2>
                            {job.job_type && (
                              <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                                {job.job_type}
                              </span>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm font-semibold text-gray-700 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>{job.company || "Hiring Company"}</span>
                            {job.location && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-gray-500 font-normal flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                  {job.location}
                                </span>
                              </>
                            )}
                          </p>

                          {/* Quick Meta Pills */}
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs text-gray-500 font-medium">
                            <span className="flex items-center gap-1 font-semibold text-gray-800">
                              <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
                              {salaryText}
                              {job.salary_type ? ` / ${job.salary_type}` : ""}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              Applied on {appliedDate}
                            </span>
                            {job.experience && (
                              <span className="flex items-center gap-1 text-gray-600">
                                <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                {job.experience}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status Badge & Primary Action */}
                      <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 shrink-0">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${statusCfg.badgeClass}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${statusCfg.dotClass} ${
                              statusCfg.category === "applied" ? "animate-pulse" : ""
                            }`}
                          />
                          {statusCfg.label}
                        </span>

                        <span className="text-[11px] text-gray-400 font-mono">
                          ID: #{app.id}
                        </span>
                      </div>
                    </div>

                    {/* Interview / Next Step Notice (if scheduled) */}
                    {app.interview_date_time && (
                      <div className="mt-4 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>
                            <strong>Interview Scheduled:</strong>{" "}
                            {new Date(app.interview_date_time).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}{" "}
                            {app.interview_mode ? `(${app.interview_mode})` : ""}
                          </span>
                        </div>
                        {app.interview_contact_person && (
                          <span className="text-blue-700 font-semibold">
                            Contact: {app.interview_contact_person}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Skills Tags */}
                    {skillsList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-gray-100">
                        {skillsList.slice(0, 5).map((s) => (
                          <span
                            key={s}
                            className="text-[11px] font-medium bg-gray-50 hover:bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-lg border border-gray-200/60"
                          >
                            {s}
                          </span>
                        ))}
                        {skillsList.length > 5 && (
                          <span className="text-[11px] text-gray-400 self-center">
                            +{skillsList.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Cover Note Accordion (if submitted) */}
                    {app.cover_letter && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCoverId(
                              expandedCoverId === app.id ? null : app.id
                            )
                          }
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {expandedCoverId === app.id
                            ? "Hide Submitted Note"
                            : "View Submitted Cover Note"}
                          {expandedCoverId === app.id ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                        {expandedCoverId === app.id && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-xl text-xs text-gray-700 leading-relaxed border border-gray-200/70">
                            {app.cover_letter}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Bar with Actions */}
                  <div className="bg-gray-50/70 border-t border-gray-100 px-5 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {app.resume_url && (
                        <a
                          href={app.resume_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-gray-600 hover:text-blue-600 inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-gray-400" />
                          Submitted CV
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Withdraw Button */}
                      {statusCfg.category === "applied" && (
                        <button
                          type="button"
                          onClick={() => setWithdrawTarget(app)}
                          className="px-3 py-1.5 border border-gray-200 hover:border-rose-200 hover:bg-rose-50 text-gray-600 hover:text-rose-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                        >
                          Withdraw
                        </button>
                      )}

                      {/* View Job Post Details */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedApp(app);
                          setModalTab("job_details");
                        }}
                        className="px-3 py-1.5 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Job Details</span>
                      </button>

                      {/* Track Live Application Status */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedApp(app);
                          setModalTab("timeline");
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Track Status</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/*  APPLICATION DETAILS & LIVE STATUS TRACKER MODAL               */}
      {/* ============================================================== */}
      {selectedApp && (() => {
        const job = selectedApp.jobPost || selectedApp.job || {};
        const statusCfg = getStatusConfig(selectedApp.status);
        const StatusIcon = statusCfg.icon;

        const skillsList = Array.isArray(job.skills)
          ? job.skills
          : typeof job.skills === "string"
          ? job.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [];

        const responsibilities = Array.isArray(job.key_responsibilities)
          ? job.key_responsibilities
          : typeof job.key_responsibilities === "string"
          ? job.key_responsibilities.split("\n").map((s) => s.trim()).filter(Boolean)
          : [];

        const qualifications = Array.isArray(job.qualifications)
          ? job.qualifications
          : typeof job.qualifications === "string"
          ? job.qualifications.split("\n").map((s) => s.trim()).filter(Boolean)
          : [];

        const perks = Array.isArray(job.perks)
          ? job.perks
          : typeof job.perks === "string"
          ? job.perks.split("\n").map((s) => s.trim()).filter(Boolean)
          : [];

        const salaryText =
          job.min_salary && job.max_salary
            ? `₹${Number(job.min_salary).toLocaleString()} - ₹${Number(job.max_salary).toLocaleString()}`
            : job.min_salary
            ? `₹${Number(job.min_salary).toLocaleString()}+`
            : "Competitive Salary";

        // Determine step progression
        const sLower = String(selectedApp.status || "").toLowerCase();
        const isRejected = sLower.includes("reject") || sLower.includes("not_selected");
        const isHired = sLower.includes("hire") || sLower.includes("offer");
        const isInterviewScheduled =
          !!selectedApp.interview_date_time ||
          sLower.includes("interview") ||
          sLower.includes("shortlist") ||
          sLower.includes("calling_approved");
        const isInReview =
          !!selectedApp.reviewed_at ||
          sLower.includes("view") ||
          sLower.includes("calling") ||
          isInterviewScheduled ||
          isHired;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
              {/* Modal Top Header */}
              <div className="p-5 sm:p-6 border-b border-gray-100 flex items-start justify-between gap-4 bg-gray-50/50 shrink-0">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs overflow-hidden">
                    {job.company_image ? (
                      <img
                        src={job.company_image}
                        alt="Company"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (job.company || "JB").slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-black text-gray-900 truncate">
                        {job.title || "Job Application"}
                      </h2>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.badgeClass}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${statusCfg.dotClass}`}
                        />
                        {statusCfg.label}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>{job.company || "Company"}</span>
                      <span>•</span>
                      <span className="text-gray-500 font-normal flex items-center gap-0.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {job.location || "India"}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-gray-400 text-xs">
                        Application #{selectedApp.id}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs inside modal */}
              <div className="flex items-center gap-2 px-5 sm:px-6 pt-3 pb-2 border-b border-gray-100 bg-white shrink-0 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setModalTab("timeline")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                    modalTab === "timeline"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Status Tracking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab("job_details")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                    modalTab === "job_details"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Job Post Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab("submission")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                    modalTab === "submission"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>My Submitted Application</span>
                </button>
              </div>

              {/* Scrollable Content inside modal */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {/* ──────────────── TAB 1: STATUS TRACKING TIMELINE ──────────────── */}
                {modalTab === "timeline" && (
                  <div className="space-y-6">
                    {/* Top Status Alert Banner */}
                    <div
                      className={`p-4 rounded-2xl border flex items-start gap-3 ${
                        isHired
                          ? "bg-purple-50/80 border-purple-200 text-purple-900"
                          : isRejected
                          ? "bg-rose-50/80 border-rose-200 text-rose-900"
                          : isInterviewScheduled
                          ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                          : isInReview
                          ? "bg-blue-50/80 border-blue-200 text-blue-900"
                          : "bg-amber-50/80 border-amber-200 text-amber-900"
                      }`}
                    >
                      <StatusIcon className="w-5 h-5 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm">
                        <p className="font-bold">
                          {isHired
                            ? "🎉 Congratulations! You have received a job offer"
                            : isRejected
                            ? "Application Not Selected"
                            : isInterviewScheduled
                            ? "Interview Scheduled with Hiring Team"
                            : isInReview
                            ? "Application is Currently Under Review"
                            : "Application Submitted Successfully"}
                        </p>
                        <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
                          {isHired
                            ? "The employer has finalized the hiring decision and an offer letter has been generated."
                            : isRejected
                            ? "Thank you for your interest. While this role is not proceeding, we encourage you to apply for other matching openings."
                            : isInterviewScheduled
                            ? "Your interview details are confirmed. Please check the date, time, and instructions below."
                            : isInReview
                            ? "The hiring team is screening candidate qualifications and portfolio details."
                            : "Your profile has been transmitted to the recruiter queue."}
                        </p>
                      </div>
                    </div>

                    {/* Step-by-Step Visual Timeline */}
                    <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-5 sm:p-6">
                      <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>Hiring Workflow Stages</span>
                      </h3>

                      <div className="space-y-8 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-gray-200">
                        {/* Stage 1: Submitted */}
                        <div className="relative flex items-start gap-4">
                          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                            <Check className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-sm text-gray-900">
                                1. Application Submitted
                              </h4>
                              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Completed
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {selectedApp.created_at
                                ? new Date(selectedApp.created_at).toLocaleString("en-IN", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })
                                : "Completed"}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                              Application submitted with resume and profile details.
                            </p>
                          </div>
                        </div>

                        {/* Stage 2: Recruiter Review */}
                        <div className="relative flex items-start gap-4">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 shadow-xs ${
                              isInReview || isInterviewScheduled || isHired
                                ? "bg-emerald-600 text-white"
                                : isRejected
                                ? "bg-rose-600 text-white"
                                : "bg-amber-500 text-white"
                            }`}
                          >
                            {isInReview || isInterviewScheduled || isHired ? (
                              <Check className="w-4 h-4" />
                            ) : isRejected ? (
                              <X className="w-4 h-4" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 animate-spin" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-sm text-gray-900">
                                2. Recruiter Screening & Review
                              </h4>
                              <span
                                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                                  isInReview || isInterviewScheduled || isHired
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : isRejected
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : "bg-amber-50 text-amber-800 border-amber-200"
                                }`}
                              >
                                {isInReview || isInterviewScheduled || isHired
                                  ? "Reviewed"
                                  : isRejected
                                  ? "Screened"
                                  : "In Progress"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {selectedApp.reviewed_at
                                ? new Date(selectedApp.reviewed_at).toLocaleString("en-IN", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })
                                : isInReview
                                ? "Screened by ATS Recruiter"
                                : "In recruiter review queue"}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                              Profile assessment and experience validation against role requirements.
                            </p>
                          </div>
                        </div>

                        {/* Stage 3: Interview Scheduled */}
                        <div className="relative flex items-start gap-4">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 shadow-xs ${
                              isInterviewScheduled || isHired
                                ? "bg-emerald-600 text-white"
                                : isRejected
                                ? "bg-gray-300 text-gray-600"
                                : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-sm text-gray-900">
                                3. Interview / Technical Round
                              </h4>
                              <span
                                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                                  isInterviewScheduled
                                    ? "bg-blue-50 text-blue-700 border-blue-200 font-bold"
                                    : isHired
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-gray-100 text-gray-500 border-gray-200"
                                }`}
                              >
                                {isInterviewScheduled
                                  ? "Interview Active"
                                  : isHired
                                  ? "Completed"
                                  : "Pending"}
                              </span>
                            </div>

                            {/* Interview Card if scheduled */}
                            {selectedApp.interview_date_time ? (
                              <div className="mt-3 p-4 bg-white rounded-xl border border-blue-200 shadow-2xs space-y-2 text-xs text-gray-700">
                                <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                                  <span className="font-bold text-blue-700 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                    {new Date(selectedApp.interview_date_time).toLocaleString("en-IN", {
                                      dateStyle: "full",
                                      timeStyle: "short",
                                    })}
                                  </span>
                                  {selectedApp.interview_mode && (
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded-md border border-blue-100">
                                      {selectedApp.interview_mode}
                                    </span>
                                  )}
                                </div>

                                {selectedApp.interview_address && (
                                  <div className="flex items-start gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                                    <span>
                                      <strong>Venue / Link:</strong> {selectedApp.interview_address}
                                    </span>
                                  </div>
                                )}

                                {selectedApp.interview_contact_person && (
                                  <div className="flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <span>
                                      <strong>Contact Person:</strong>{" "}
                                      {selectedApp.interview_contact_person}
                                    </span>
                                  </div>
                                )}

                                {selectedApp.interview_instructions && (
                                  <div className="flex items-start gap-2 pt-1 border-t border-gray-100 text-gray-600">
                                    <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                                    <span>{selectedApp.interview_instructions}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 mt-1">
                                {isHired
                                  ? "Interview completed successfully."
                                  : "Once shortlisted, you will receive an interview invitation with date, time, and instructions."}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Stage 4: Final Outcome */}
                        <div className="relative flex items-start gap-4">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 shadow-xs ${
                              isHired
                                ? "bg-purple-600 text-white"
                                : isRejected
                                ? "bg-rose-600 text-white"
                                : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            <Award className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-sm text-gray-900">
                                4. Final Decision & Job Offer
                              </h4>
                              <span
                                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                                  isHired
                                    ? "bg-purple-50 text-purple-700 border-purple-200 font-bold"
                                    : isRejected
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : "bg-gray-100 text-gray-500 border-gray-200"
                                }`}
                              >
                                {isHired ? "Offer Released" : isRejected ? "Closed" : "Upcoming"}
                              </span>
                            </div>

                            {/* Offer Card if Hired */}
                            {isHired && (
                              <div className="mt-3 p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2 text-xs text-purple-900">
                                <p className="font-bold text-sm text-purple-800">
                                  Official Offer Details
                                </p>
                                {selectedApp.offer_salary_package && (
                                  <p>
                                    <strong>Offered CTC:</strong>{" "}
                                    {selectedApp.offer_salary_package}
                                  </p>
                                )}
                                {selectedApp.offer_joining_date && (
                                  <p>
                                    <strong>Joining Date:</strong>{" "}
                                    {new Date(selectedApp.offer_joining_date).toLocaleDateString("en-IN", {
                                      dateStyle: "medium",
                                    })}
                                  </p>
                                )}
                                {selectedApp.offer_letter_path && (
                                  <a
                                    href={selectedApp.offer_letter_path}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg font-bold text-xs hover:bg-purple-700 transition"
                                  >
                                    <Download className="w-3.5 h-3.5" /> Download Offer Letter
                                  </a>
                                )}
                              </div>
                            )}

                            {!isHired && (
                              <p className="text-xs text-gray-500 mt-1">
                                {isRejected
                                  ? "Application was not selected for this position."
                                  : "Final employment decision and offer letter issuance upon interview completion."}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Quick Links */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setModalTab("job_details")}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>View Complete Job Post Specifications</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      {statusCfg.category === "applied" && (
                        <button
                          type="button"
                          onClick={() => setWithdrawTarget(selectedApp)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-800 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Withdraw Application</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ──────────────── TAB 2: COMPLETE JOB POST DETAILS ──────────────── */}
                {modalTab === "job_details" && (
                  <div className="space-y-6">
                    {/* Key Stats Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 bg-gray-50 border border-gray-200/70 rounded-xl">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                          Offered Salary
                        </span>
                        <p className="text-sm font-bold text-emerald-700 mt-0.5 flex items-center gap-0.5">
                          <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{salaryText}</span>
                        </p>
                      </div>

                      <div className="p-3.5 bg-gray-50 border border-gray-200/70 rounded-xl">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                          Job Type
                        </span>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">
                          {job.job_type || "Full Time"}
                        </p>
                      </div>

                      <div className="p-3.5 bg-gray-50 border border-gray-200/70 rounded-xl">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                          Experience
                        </span>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">
                          {job.experience || "Any Experience"}
                        </p>
                      </div>

                      <div className="p-3.5 bg-gray-50 border border-gray-200/70 rounded-xl">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                          Vacancies
                        </span>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">
                          {job.openings ? `${job.openings} Openings` : "1 Opening"}
                        </p>
                      </div>
                    </div>

                    {/* Work Schedule Strip */}
                    {(job.working_days || job.shift_timing || job.interview_details) && (
                      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs sm:text-sm text-slate-700">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Work Schedule & Interview Hours
                        </p>
                        {job.working_days && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>
                              <strong>Working Days:</strong> {job.working_days}
                            </span>
                          </div>
                        )}
                        {job.shift_timing && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>
                              <strong>Shift Timing:</strong> {job.shift_timing}
                            </span>
                          </div>
                        )}
                        {job.interview_details && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              <strong>Interview Hours:</strong> {job.interview_details}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Job Description */}
                    {job.description && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-2">
                          Job Description
                        </h4>
                        <div className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                          {job.description}
                        </div>
                      </div>
                    )}

                    {/* Key Responsibilities */}
                    {responsibilities.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-2">
                          Key Responsibilities
                        </h4>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600">
                          {responsibilities.map((r, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-2" />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Qualifications / Requirements */}
                    {qualifications.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-2">
                          Qualifications & Requirements
                        </h4>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600">
                          {qualifications.map((q, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Required Skills */}
                    {skillsList.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-2">
                          Required Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {skillsList.map((skill, i) => (
                            <span
                              key={i}
                              className="text-xs bg-blue-50 text-blue-700 border border-blue-200/80 px-3 py-1 rounded-xl font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Perks & Benefits */}
                    {perks.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-2">
                          Perks & Benefits
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {perks.map((p, i) => (
                            <span
                              key={i}
                              className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-3 py-1 rounded-xl font-medium"
                            >
                              ✨ {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Company Information */}
                    {(job.company_about || job.company_size || job.company_address) && (
                      <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              About {job.company}
                            </p>
                            {job.company_size && (
                              <p className="text-xs text-gray-500">
                                {job.company_size}
                              </p>
                            )}
                          </div>
                        </div>

                        {job.company_about && (
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            {job.company_about}
                          </p>
                        )}

                        {job.company_address && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-2 border-t border-gray-200/60">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{job.company_address}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Company Contact */}
                    {(job.contact_person || job.contact_phone || job.contact_email) && (
                      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2 text-xs text-gray-700">
                        <p className="font-bold text-blue-900">
                          Employer Contact Details
                        </p>
                        {job.contact_person && (
                          <p>
                            <strong>Contact Person:</strong> {job.contact_person}
                          </p>
                        )}
                        {job.contact_phone && (
                          <p className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{job.contact_phone}</span>
                          </p>
                        )}
                        {job.contact_email && (
                          <p className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span>{job.contact_email}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ──────────────── TAB 3: SUBMITTED CANDIDATE DATA ──────────────── */}
                {modalTab === "submission" && (
                  <div className="space-y-5">
                    <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-5 space-y-3.5 text-xs sm:text-sm">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span>Candidate Profile Attached</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                        <div>
                          <span className="text-gray-400 block text-xs">Full Name</span>
                          <span className="font-semibold text-gray-900">
                            {selectedApp.candidate_name || user.name || "Candidate"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-xs">Email Address</span>
                          <span className="font-semibold text-gray-900">
                            {selectedApp.candidate_email || user.email || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-xs">Phone Number</span>
                          <span className="font-semibold text-gray-900">
                            {selectedApp.candidate_phone || user.phone || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-xs">Experience</span>
                          <span className="font-semibold text-gray-900">
                            {selectedApp.candidate_experience || "Fresher"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Resume File Box */}
                    {selectedApp.resume_url && (
                      <div className="p-4 bg-blue-50/50 border border-blue-200/80 rounded-2xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                              Submitted CV / Resume
                            </p>
                            <p className="text-[11px] text-gray-500">
                              Uploaded document submitted with application
                            </p>
                          </div>
                        </div>

                        <a
                          href={selectedApp.resume_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5 shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>View / Download</span>
                        </a>
                      </div>
                    )}

                    {/* Submitted Cover Letter / Note */}
                    {selectedApp.cover_letter && (
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                          Cover Letter / Note Submitted to Employer
                        </h4>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                          {selectedApp.cover_letter}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer Bar */}
              <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between gap-3 shrink-0">
                <span className="text-xs text-gray-500">
                  Application Status: <strong>{statusCfg.label}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold border border-gray-200 transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Withdraw Confirmation Modal */}
      {withdrawTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              Withdraw Application?
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Are you sure you want to withdraw your application for{" "}
              <strong>
                {withdrawTarget.jobPost?.title ||
                  withdrawTarget.job?.title ||
                  "this job"}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setWithdrawTarget(null)}
                disabled={withdrawing}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                disabled={withdrawing}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
              >
                {withdrawing ? "Withdrawing..." : "Yes, Withdraw"}
              </button>
            </div>
          </div>
        </div>
      )}
    </HomepageLayout>
  );
}
