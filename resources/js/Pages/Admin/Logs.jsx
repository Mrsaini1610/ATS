import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";
import {
  ScrollText,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  User,
  Shield,
  Smartphone,
  Laptop,
  Globe,
  Trash2,
  ExternalLink,
  ChevronDown,
  Terminal,
  Activity,
  Copy,
  Check,
  Calendar,
  X,
  FileSpreadsheet,
} from "lucide-react";

export default function Logs({
  activities,
  incompleteProcesses = [],
  errorLogs,
  serverLog,
  metrics,
  filters = {},
}) {
  const [activeTab, setActiveTab] = useState(filters.tab || "audit"); // audit, incomplete, errors, server_log
  const [search, setSearch] = useState(filters.search || "");
  const [moduleFilter, setModuleFilter] = useState(filters.module || "all");
  const [statusFilter, setStatusFilter] = useState(filters.status || "all");
  const [actorTypeFilter, setActorTypeFilter] = useState(filters.actor_type || "all"); // all, candidate, admin, system
  
  // Date & Month filter state
  const [filterMode, setFilterMode] = useState(filters.filter_mode || "all"); // all, month, date_range, preset
  const [selectedMonth, setSelectedMonth] = useState(filters.month || new Date().toISOString().slice(0, 7));
  const [fromDate, setFromDate] = useState(filters.from_date || "");
  const [toDate, setToDate] = useState(filters.to_date || "");
  const [preset, setPreset] = useState(filters.preset || "all");

  // Export Modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState("audit"); // audit, incomplete, errors
  const [exportFormat, setExportFormat] = useState("xlsx"); // xlsx, csv
  const [exportFilterMode, setExportFilterMode] = useState("month"); // month, date_range, preset, all
  const [exportMonth, setExportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [exportFromDate, setExportFromDate] = useState("");
  const [exportToDate, setExportToDate] = useState("");
  const [exportPreset, setExportPreset] = useState("this_month");

  const [expandedRow, setExpandedRow] = useState(null);
  const [expandedError, setExpandedError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [logSearch, setLogSearch] = useState("");
  const [logLevelFilter, setLogLevelFilter] = useState("all");

  const applyFilters = (customParams = {}) => {
    router.get(
      route("admin.logs.index"),
      {
        tab: activeTab,
        search,
        module: moduleFilter,
        status: statusFilter,
        actor_type: actorTypeFilter,
        filter_mode: filterMode,
        month: selectedMonth,
        from_date: fromDate,
        to_date: toDate,
        preset,
        ...customParams,
      },
      { preserveState: true, preserveScroll: true }
    );
  };

  const handleFilterSubmit = (e) => {
    if (e) e.preventDefault();
    applyFilters();
  };

  const resetDateFilters = () => {
    setFilterMode("all");
    setFromDate("");
    setToDate("");
    setPreset("all");
    applyFilters({ filter_mode: "all", from_date: "", to_date: "", preset: "all" });
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    applyFilters({ tab });
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearErrors = () => {
    if (confirm("Are you sure you want to clear all database error logs?")) {
      router.post(route("admin.logs.clear-errors"), {}, { preserveScroll: true });
    }
  };

  const handleClearServerLog = () => {
    if (confirm("Are you sure you want to clear the physical laravel.log file?")) {
      router.post(route("admin.logs.clear-server-log"), {}, { preserveScroll: true });
    }
  };

  const triggerDownload = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
      type: exportType,
      format: exportFormat,
      filter_mode: exportFilterMode,
      month: exportMonth,
      from_date: exportFromDate,
      to_date: exportToDate,
      preset: exportPreset,
      module: moduleFilter,
      actor_type: actorTypeFilter,
    });

    window.location.href = `${route("admin.logs.export")}?${params.toString()}`;
    setExportModalOpen(false);
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "success") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" /> Success
        </span>
      );
    }
    if (s === "incomplete" || s === "stalled") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3" /> Incomplete
        </span>
      );
    }
    if (s === "failed" || s === "error") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3" /> Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold bg-gray-100 text-gray-700">
        {status}
      </span>
    );
  };

  // Actor badge styling (Candidate, Admin, Super Admin, System)
  const getActorBadge = (type, name) => {
    const t = (type || "").toLowerCase();
    if (t === "candidate" || t === "user") {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-md font-semibold border bg-emerald-50 text-emerald-800 border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
          <span className="font-bold">Candidate:</span>
          <span className="truncate max-w-[130px]">{name || "Candidate"}</span>
        </span>
      );
    }
    if (t === "guest") {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-md font-semibold border bg-amber-50 text-amber-800 border-amber-200">
          <Globe className="w-3 h-3 text-amber-600 shrink-0" />
          <span className="font-bold">Guest:</span>
          <span className="truncate max-w-[130px]">{name || "Visitor"}</span>
        </span>
      );
    }
    if (t === "super_admin") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-semibold border bg-purple-50 text-purple-700 border-purple-200">
          <Shield className="w-3 h-3 shrink-0" />
          <span className="font-bold">Super Admin:</span>
          <span className="truncate max-w-[130px]">{name || "Super Admin"}</span>
        </span>
      );
    }
    if (t === "admin" || t === "team_member" || t === "staff") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-semibold border bg-indigo-50 text-indigo-700 border-indigo-200">
          <User className="w-3 h-3 shrink-0" />
          <span className="font-bold">{t === "team_member" ? "Staff:" : "Admin:"}</span>
          <span className="truncate max-w-[130px]">{name || "Admin"}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-semibold border bg-gray-100 text-gray-700 border-gray-200">
        <Activity className="w-3 h-3 shrink-0" />
        <span>{name || "System"}</span>
      </span>
    );
  };

  // Filter server log entries by level & search
  const filteredServerLogs = (serverLog?.recent_logs || []).filter((log) => {
    if (logLevelFilter !== "all" && log.level !== logLevelFilter) return false;
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        log.stack.toLowerCase().includes(q) ||
        log.timestamp.includes(q)
      );
    }
    return true;
  });

  return (
    <>
      <Head title="System Logs & Audit Trail - ATS Admin" />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <ScrollText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                  System Logs & Audit Trail
                </h2>
                <p className="text-xs text-gray-500">
                  Track who did what, incomplete workflows & system errors with Date & Month exports.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Open Export Modal Button */}
            <button
              type="button"
              onClick={() => {
                setExportType(activeTab === "errors" ? "errors" : activeTab === "incomplete" ? "incomplete" : "audit");
                setExportModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel / CSV</span>
            </button>

            {serverLog?.exists && (
              <a
                href={route("admin.logs.download-file")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 shadow-sm transition cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-gray-300" />
                <span>laravel.log ({metrics.server_log_size})</span>
              </a>
            )}
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Activities Today</p>
              <h3 className="text-xl font-black text-gray-900">{metrics.total_activities_today}</h3>
            </div>
          </div>

          <div
            onClick={() => switchTab("incomplete")}
            className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs flex items-center gap-3 cursor-pointer hover:border-amber-400 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Incomplete Tasks</p>
              <h3 className="text-xl font-black text-amber-900">{metrics.incomplete_count}</h3>
            </div>
          </div>

          <div
            onClick={() => switchTab("errors")}
            className="bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs flex items-center gap-3 cursor-pointer hover:border-rose-400 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Errors (24 Hours)</p>
              <h3 className="text-xl font-black text-rose-900">{metrics.errors_24h}</h3>
            </div>
          </div>

          <div
            onClick={() => switchTab("server_log")}
            className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3 cursor-pointer hover:border-gray-400 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">laravel.log File</p>
              <h3 className="text-xl font-black text-gray-900">{metrics.server_log_size}</h3>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-200 gap-1 overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => switchTab("audit")}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === "audit"
                ? "border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-xl"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Activity Audit Trail (Kisne Kya Kiya)</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold">
              {activities?.total || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => switchTab("incomplete")}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === "incomplete"
                ? "border-amber-600 text-amber-700 bg-amber-50/40 rounded-t-xl"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Incomplete Processes (Aadhi Chhodi Process)</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
              {metrics.incomplete_count}
            </span>
          </button>

          <button
            type="button"
            onClick={() => switchTab("errors")}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === "errors"
                ? "border-rose-600 text-rose-700 bg-rose-50/40 rounded-t-xl"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>System Error Logs</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
              {errorLogs?.total || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => switchTab("server_log")}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === "server_log"
                ? "border-gray-900 text-gray-900 bg-gray-100/60 rounded-t-xl"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <Terminal className="w-4 h-4 text-gray-700" />
            <span>Server File (laravel.log)</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* DATE & MONTH FILTER BAR (LIVE SCREEN FILTERING) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-gray-100 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-gray-800">Date & Month Filter:</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setFilterMode("all");
                  applyFilters({ filter_mode: "all", preset: "all" });
                }}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                  filterMode === "all"
                    ? "bg-gray-900 text-white shadow-2xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All Time
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilterMode("month");
                  applyFilters({ filter_mode: "month", month: selectedMonth });
                }}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                  filterMode === "month"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Month-Wise
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilterMode("date_range");
                }}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                  filterMode === "date_range"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Custom Date Range
              </button>

              {filterMode !== "all" && (
                <button
                  type="button"
                  onClick={resetDateFilters}
                  className="px-2 py-1 text-gray-400 hover:text-gray-700 text-xs font-semibold cursor-pointer"
                  title="Reset date filter"
                >
                  ✕ Reset
                </button>
              )}
            </div>
          </div>

          {/* Conditional Month or Date inputs */}
          <div className="flex flex-wrap items-center gap-3">
            {filterMode === "month" && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-600">Select Month:</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    applyFilters({ filter_mode: "month", month: e.target.value });
                  }}
                  className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            )}

            {filterMode === "date_range" && (
              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-xs font-semibold text-gray-600">From:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="text-xs font-semibold text-gray-600">To:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => applyFilters({ filter_mode: "date_range", from_date: fromDate, to_date: toDate })}
                  disabled={!fromDate || !toDate}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  Apply Dates
                </button>
              </div>
            )}

            {/* Quick preset buttons */}
            <div className="flex items-center gap-1.5 text-xs ml-auto">
              {["today", "yesterday", "last_7_days", "this_month", "last_month"].map((p) => {
                const labels = {
                  today: "Today",
                  yesterday: "Yesterday",
                  last_7_days: "Last 7 Days",
                  this_month: "This Month",
                  last_month: "Last Month",
                };
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setFilterMode("preset");
                      setPreset(p);
                      applyFilters({ filter_mode: "preset", preset: p });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                      filterMode === "preset" && preset === p
                        ? "bg-blue-50 text-blue-700 border-blue-300 font-bold"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {labels[p]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: ACTIVITY AUDIT TRAIL ("KISNE KYA KIYA") */}
        {/* ========================================================================= */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <form onSubmit={handleFilterSubmit} className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search user, action, description, or ID…"
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <select
                value={actorTypeFilter}
                onChange={(e) => {
                  setActorTypeFilter(e.target.value);
                  applyFilters({ actor_type: e.target.value });
                }}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none cursor-pointer"
              >
                <option value="all">All Actors (Everyone)</option>
                <option value="candidate">Candidates Only</option>
                <option value="admin">Admins & Staff Only</option>
                <option value="guest">Guest Visitors (Not Logged In)</option>
                <option value="system">System Automations</option>
              </select>

              <select
                value={moduleFilter}
                onChange={(e) => {
                  setModuleFilter(e.target.value);
                  applyFilters({ module: e.target.value });
                }}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none cursor-pointer"
              >
                <option value="all">All Modules</option>
                <option value="jobs">Job Posts</option>
                <option value="applications">Applications</option>
                <option value="navigation">Page Views & Navigation</option>
                <option value="offers">Offer Letters</option>
                <option value="users">Candidates / Users</option>
                <option value="interviews">Interviews</option>
                <option value="team">Team & Staff</option>
                <option value="auth">Auth & Login</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  applyFilters({ status: e.target.value });
                }}
                className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold bg-white outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="incomplete">Incomplete</option>
                <option value="failed">Failed</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
              >
                Filter
              </button>
            </form>

            {/* Activities Table Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col">
              <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-20rem)] min-h-[380px] custom-scrollbar">
                <table className="w-full min-w-[1020px] text-left text-xs border-collapse">
                  <thead className="sticky top-0 z-20 bg-slate-100/95 backdrop-blur-xs border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[10px] shadow-xs">
                    <tr>
                      <th className="w-[160px] min-w-[150px] px-4 py-3.5">Time & Platform</th>
                      <th className="w-[190px] min-w-[180px] px-4 py-3.5">Actor (Who)</th>
                      <th className="w-[170px] min-w-[160px] px-4 py-3.5">Action & Module</th>
                      <th className="min-w-[340px] px-4 py-3.5">Description</th>
                      <th className="w-[130px] min-w-[120px] px-4 py-3.5 text-center">Status</th>
                      <th className="w-[70px] min-w-[70px] px-4 py-3.5 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {activities.data.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                          No audit activity records found for this period.
                        </td>
                      </tr>
                    ) : (
                      activities.data.map((item) => {
                        const isExpanded = expandedRow === item.id;
                        return (
                          <React.Fragment key={item.id}>
                            <tr
                              onClick={() => setExpandedRow(isExpanded ? null : item.id)}
                              className="hover:bg-blue-50/40 transition cursor-pointer"
                            >
                              <td className="w-[160px] min-w-[150px] px-4 py-3 whitespace-nowrap align-middle">
                                <div className="font-semibold text-gray-800">
                                  {new Date(item.created_at).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </div>
                                <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 font-medium">
                                  <span>{new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5">
                                    {item.platform === "app" ? (
                                      <Smartphone className="w-3 h-3 text-indigo-500" />
                                    ) : (
                                      <Globe className="w-3 h-3 text-blue-500" />
                                    )}
                                    {item.platform.toUpperCase()}
                                  </span>
                                </div>
                              </td>

                              <td className="w-[190px] min-w-[180px] px-4 py-3 align-middle">
                                <div className="truncate max-w-[180px]">
                                  {getActorBadge(item.actor_type, item.actor_name)}
                                </div>
                                {item.actor_email && (
                                  <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-[175px]" title={item.actor_email}>
                                    {item.actor_email}
                                  </p>
                                )}
                                {item.device_name && (
                                  <div className="mt-1 flex items-center gap-1">
                                    <span
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                                      title={`Device: ${item.device_name}${item.user_agent ? ' • ' + item.user_agent : ''}`}
                                    >
                                      {item.platform === "app" || /iphone|android|pixel|samsung|redmi|oneplus/i.test(item.device_name) ? (
                                        <Smartphone className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
                                      ) : (
                                        <Laptop className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                                      )}
                                      <span className="truncate max-w-[140px]">{item.device_name}</span>
                                    </span>
                                  </div>
                                )}
                              </td>

                              <td className="w-[170px] min-w-[160px] px-4 py-3 align-middle">
                                <div className="font-bold text-gray-900 leading-tight">
                                  {item.action.replace(/_/g, " ")}
                                </div>
                                <span className="inline-block mt-0.5 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                  {item.module}
                                </span>
                              </td>

                              <td className="min-w-[340px] px-4 py-3 pr-6 align-middle">
                                <p className="text-gray-800 font-medium leading-relaxed break-words">
                                  {item.description}
                                </p>
                                {item.ip_address && (
                                  <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                                    IP: {item.ip_address}
                                  </span>
                                )}
                              </td>

                              <td className="w-[130px] min-w-[120px] px-4 py-3 whitespace-nowrap text-center align-middle">
                                {getStatusBadge(item.status)}
                              </td>

                              <td className="w-[70px] min-w-[70px] px-4 py-3 text-right align-middle">
                                <button
                                  type="button"
                                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                                >
                                  <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                </button>
                              </td>
                            </tr>

                            {/* Expanded Details Row */}
                            {isExpanded && (
                              <tr className="bg-gray-50/80">
                                <td colSpan={6} className="px-6 py-4">
                                  <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2.5 shadow-2xs">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-bold text-gray-700">Audit Metadata & Details:</span>
                                      <span className="text-gray-400">ID #{item.id}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                      {item.device_name && (
                                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1.5">
                                          {item.platform === "app" || /iphone|android|pixel|samsung|redmi|oneplus/i.test(item.device_name) ? (
                                            <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                                          ) : (
                                            <Laptop className="w-3.5 h-3.5 text-slate-600" />
                                          )}
                                          <span>Device: <strong>{item.device_name}</strong></span>
                                        </span>
                                      )}
                                      {item.ip_address && (
                                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg font-mono text-[11px]">
                                          IP: <strong>{item.ip_address}</strong>
                                        </span>
                                      )}
                                    </div>
                                    {item.user_agent && (
                                      <p className="text-[11px] text-gray-500 font-mono break-all bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        User-Agent: {item.user_agent}
                                      </p>
                                    )}
                                    {item.details && Object.keys(item.details).length > 0 ? (
                                      <pre className="text-[11px] font-mono bg-slate-900 text-emerald-400 p-3 rounded-lg overflow-x-auto max-h-48">
                                        {JSON.stringify(item.details, null, 2)}
                                      </pre>
                                    ) : (
                                      <p className="text-xs text-gray-400 italic">No additional payload parameters.</p>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {activities.links && activities.links.length > 3 && (
                <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 bg-white text-xs text-gray-500 shrink-0">
                  <span>
                    Showing <span className="font-bold text-gray-800">{activities.from || 0}</span> to{" "}
                    <span className="font-bold text-gray-800">{activities.to || 0}</span> of{" "}
                    <span className="font-bold text-gray-800">{activities.total}</span> records (10 per page)
                  </span>
                  <div className="flex gap-1 flex-wrap justify-center">
                    {activities.links.map((link, idx) => (
                      <Link
                        key={idx}
                        href={link.url || "#"}
                        preserveScroll
                        className={`px-3 py-1 rounded-lg border font-semibold transition ${
                          link.active
                            ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                            : link.url
                            ? "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                            : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: INCOMPLETE / HALF-DONE PROCESSES ("KISNE AADHI CHHODI PROCESS") */}
        {/* ========================================================================= */}
        {activeTab === "incomplete" && (
          <div className="space-y-4">
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Incomplete & Abandoned Workflow Discovery
                </h4>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  Real-time list of candidates who registered but stopped without uploading resumes, applications left pending decision, interviews with past dates without remarks, and unapproved jobs.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incompleteProcesses.length === 0 ? (
                <div className="col-span-2 text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-400">
                  🎉 Great job! No incomplete or stalled workflows found right now.
                </div>
              ) : (
                incompleteProcesses.map((proc) => (
                  <div
                    key={proc.id}
                    className="bg-white rounded-2xl border border-gray-200 hover:border-amber-300 p-4 shadow-2xs transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 tracking-wider">
                          {proc.category}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">
                          {proc.time_ago}
                        </span>
                      </div>

                      <h4 className="font-bold text-gray-900 text-sm leading-snug">
                        {proc.title}
                      </h4>

                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {proc.description}
                      </p>

                      <div className="mt-3 bg-gray-50 rounded-xl p-2.5 border border-gray-100 text-xs">
                        <span className="font-bold text-rose-600">Pending Reason: </span>
                        <span className="text-gray-700">{proc.stalled_reason}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div className="text-gray-500 truncate max-w-[200px]">
                        By: <span className="font-bold text-gray-800">{proc.actor_name}</span>
                        {proc.actor_phone && <span className="text-[11px]"> ({proc.actor_phone})</span>}
                      </div>

                      <a
                        href={proc.action_url}
                        className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 transition"
                      >
                        <span>Resolve</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SYSTEM ERROR LOGS */}
        {/* ========================================================================= */}
        {activeTab === "errors" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-gray-500">
                Detailed stack trace of all server exceptions, 500 crashes, and failed requests.
              </p>
              {errorLogs.total > 0 && (
                <button
                  type="button"
                  onClick={handleClearErrors}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All Errors
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="divide-y divide-gray-100">
                {errorLogs.data.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="font-semibold text-gray-700">Clean Slate! Zero error logs recorded for this period.</p>
                  </div>
                ) : (
                  errorLogs.data.map((err) => {
                    const isExpanded = expandedError === err.id;
                    return (
                      <div key={err.id} className="p-4 hover:bg-gray-50/60 transition">
                        <div
                          onClick={() => setExpandedError(isExpanded ? null : err.id)}
                          className="flex items-start justify-between gap-3 cursor-pointer"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-rose-100 text-rose-700 shrink-0">
                              {err.status_code || 500}
                            </span>
                            <div className="min-w-0">
                              <h4 className="font-bold text-gray-900 text-sm break-all">
                                {err.message}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                                {err.method && (
                                  <span className="font-mono font-bold uppercase text-gray-700">
                                    {err.method}
                                  </span>
                                )}
                                <span className="font-mono text-gray-600 truncate max-w-sm">
                                  {err.url || "N/A"}
                                </span>
                                <span>•</span>
                                <span>{new Date(err.created_at).toLocaleString()}</span>
                                {err.actor_name && (
                                  <>
                                    <span>•</span>
                                    <span>User: <strong>{err.actor_name}</strong></span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(`${err.message}\n${err.trace}`, err.id);
                              }}
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800 bg-white"
                              title="Copy Stack Trace"
                            >
                              {copiedId === err.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </div>
                        </div>

                        {/* Stack Trace Preview */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                            <div className="text-xs text-gray-500">
                              Location: <span className="font-mono font-bold text-gray-800">{err.file}:{err.line}</span>
                            </div>
                            <pre className="text-xs font-mono bg-slate-950 text-rose-400 p-4 rounded-xl overflow-x-auto max-h-72 leading-relaxed">
                              {err.trace || "No stack trace recorded."}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
              {errorLogs.links && errorLogs.links.length > 3 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-white text-xs text-gray-500">
                  <span>Showing {errorLogs.from || 0} to {errorLogs.to || 0} of {errorLogs.total} errors</span>
                  <div className="flex gap-1">
                    {errorLogs.links.map((link, idx) => (
                      <Link
                        key={idx}
                        href={link.url || "#"}
                        preserveScroll
                        className={`px-3 py-1 rounded-lg border font-semibold transition ${
                          link.active
                            ? "bg-rose-600 text-white border-rose-600"
                            : link.url
                            ? "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                            : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SERVER LOG FILE (storage/logs/laravel.log) */}
        {/* ========================================================================= */}
        {activeTab === "server_log" && (
          <div className="space-y-4">
            <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                  <Terminal className="w-4 h-4" />
                  <span>storage/logs/laravel.log</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Size: <strong className="text-white">{serverLog?.file_size}</strong> • Lines: <strong className="text-white">{serverLog?.total_lines}</strong> • Last Updated: <strong className="text-white">{serverLog?.updated_at}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={route("admin.logs.download-file")}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download Log File
                </a>
                <button
                  type="button"
                  onClick={handleClearServerLog}
                  className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear File
                </button>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search within server logs…"
                className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl flex-1 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={logLevelFilter}
                onChange={(e) => setLogLevelFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl outline-none font-semibold cursor-pointer"
              >
                <option value="all">All Levels</option>
                <option value="ERROR">ERROR</option>
                <option value="WARNING">WARNING</option>
                <option value="INFO">INFO</option>
                <option value="DEBUG">DEBUG</option>
              </select>
            </div>

            {/* Log Stream Viewer */}
            <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-4 font-mono text-xs max-h-[600px] overflow-y-auto space-y-3">
              {filteredServerLogs.length === 0 ? (
                <p className="text-slate-500 text-center py-10">No matching log entries found.</p>
              ) : (
                filteredServerLogs.map((entry, idx) => {
                  let badge = "bg-blue-900/60 text-blue-300 border-blue-700";
                  if (entry.level === "ERROR") badge = "bg-rose-900/60 text-rose-300 border-rose-700";
                  if (entry.level === "WARNING") badge = "bg-amber-900/60 text-amber-300 border-amber-700";

                  return (
                    <div key={idx} className="p-3 bg-slate-900/70 rounded-xl border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${badge}`}>
                            {entry.level}
                          </span>
                          <span className="text-slate-400">{entry.timestamp}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`${entry.message}\n${entry.stack}`, idx)}
                          className="text-slate-400 hover:text-white p-1"
                          title="Copy Entry"
                        >
                          {copiedId === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>

                      <p className="text-slate-200 font-semibold break-all leading-relaxed">
                        {entry.message}
                      </p>

                      {entry.stack && (
                        <pre className="text-[10px] text-slate-400 mt-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/50 overflow-x-auto max-h-40 whitespace-pre-wrap leading-relaxed">
                          {entry.stack}
                        </pre>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* EXPORT DIALOG MODAL (EXCEL & CSV + DATE / MONTH WISE) */}
      {/* ========================================================================= */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-linear-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Export Logs to File</h3>
                  <p className="text-xs text-gray-500">Excel (.xlsx) or CSV (.csv) with Date Filter</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="p-1.5 text-gray-400 hover:bg-gray-200/60 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={triggerDownload} className="p-6 space-y-4">
              {/* 1. Format Choice (Excel vs CSV) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  1. Choose Export Format
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setExportFormat("xlsx")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition ${
                      exportFormat === "xlsx"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-500/20"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Excel (.xlsx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat("csv")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition ${
                      exportFormat === "csv"
                        ? "bg-blue-50 text-blue-800 border-blue-500 ring-2 ring-blue-500/20"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>CSV (.csv)</span>
                  </button>
                </div>
              </div>

              {/* 2. Choose Data Type */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  2. Choose Data Category
                </label>
                <select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold bg-gray-50 focus:bg-white outline-none cursor-pointer"
                >
                  <option value="audit">Activity Audit Logs (Kisne Kya Kiya)</option>
                  <option value="incomplete">Incomplete & Stalled Workflows (Aadhi Process)</option>
                  <option value="errors">System Error Logs (Exceptions / Crashes)</option>
                </select>
              </div>

              {/* 3. Choose Timeframe Mode */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  3. Date & Month Period
                </label>
                <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                  <button
                    type="button"
                    onClick={() => setExportFilterMode("month")}
                    className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      exportFilterMode === "month"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    Month-wise
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportFilterMode("date_range")}
                    className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      exportFilterMode === "date_range"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    Date Range
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportFilterMode("all")}
                    className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      exportFilterMode === "all"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    All Time
                  </button>
                </div>

                {/* Month input */}
                {exportFilterMode === "month" && (
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600">Select Month to Export:</label>
                    <input
                      type="month"
                      value={exportMonth}
                      onChange={(e) => setExportMonth(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none cursor-pointer"
                    />
                  </div>
                )}

                {/* Date range inputs */}
                {exportFilterMode === "date_range" && (
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">From Date:</label>
                        <input
                          type="date"
                          value={exportFromDate}
                          onChange={(e) => setExportFromDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">To Date:</label>
                        <input
                          type="date"
                          value={exportToDate}
                          onChange={(e) => setExportToDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Export Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download {exportFormat.toUpperCase()} ({exportFilterMode === "month" ? exportMonth : exportFilterMode === "date_range" ? "Selected Dates" : "All Records"})</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

Logs.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;
