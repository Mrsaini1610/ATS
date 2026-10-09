import React, { useState } from "react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";
import { Head, usePage, router } from "@inertiajs/react";
import {
  Search,
  CheckCircle2,
  Phone,
  Calendar,
  X,
  Eye,
  MessageCircle,
  Mail,
  FileText,
  Users,
  MapPin,
  Building2,
  Send,
  Briefcase,
  GraduationCap,
  ExternalLink,
  Download,
  Globe,
  Linkedin,
  Clock,
  User,
  Tag,
  Sparkles,
} from "lucide-react";

const STATUS_CFG = {
  applied: { label: "Applied", color: "bg-gray-100 text-gray-600" },
  viewed: { label: "Viewed", color: "bg-blue-50 text-blue-700" },
  shortlisted: { label: "Shortlisted", color: "bg-yellow-50 text-yellow-700" },
  assigned_to_calling_member: { label: "Assigned", color: "bg-indigo-50 text-indigo-700" },
  calling_in_progress: { label: "Calling In Progress", color: "bg-purple-50 text-purple-700" },
  admin_review: { label: "Admin Review", color: "bg-purple-50 text-purple-700" },
  interview_scheduled: { label: "Interview Scheduled", color: "bg-purple-50 text-purple-700" },
  offer_letter_generated: { label: "Offer Letter Generated", color: "bg-green-50 text-green-700" },
  hired: { label: "Hired ✓", color: "bg-green-50 text-green-700" },
  rejected: { label: "Rejected", color: "bg-red-50 text-red-600" },
  not_selected: { label: "Not Selected", color: "bg-red-50 text-red-600" },
  waiting_list: { label: "Waiting List", color: "bg-orange-50 text-orange-700" },
};

const ALL_STATUSES = Object.keys(STATUS_CFG);

const toWANum = (phone) => (phone || "").replace(/\s/g, "").replace(/^\+/, "");
const waUrl = (phone, msg) =>
  `https://wa.me/${toWANum(phone)}?text=${encodeURIComponent(msg)}`;
const mailUrl = (email, subject, body) =>
  `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/* ── Offer Letter Modal ── */
function OfferLetterModal({ app, onClose }) {
  const [salary, setSalary] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [sent, setSent] = useState("");
  const [validationError, setValidationError] = useState("");

  const canSend = () => {
    if (!salary || Number(salary) <= 0) {
      setValidationError("Enter a positive offered CTC.");
      return false;
    }
    if (!joiningDate || joiningDate < new Date().toISOString().slice(0, 10)) {
      setValidationError("Select today or a future joining date.");
      return false;
    }
    setValidationError("");
    return true;
  };

  const letter = `Dear ${app.userName},

We are delighted to offer you the position of ${app.jobTitle} at ${app.company}.

Position Details:
• Role: ${app.jobTitle}
• Company: ${app.company}
• Location: ${app.userCity || "India"}${salary ? `\n• CTC: ₹${salary} LPA` : ""}${
    joiningDate ? `\n• Joining Date: ${joiningDate}` : ""
  }

Please confirm your acceptance within 48 hours.

Congratulations and welcome to the team!

Best regards,
ATS Recruitment Team`;

  const recordAndSendWA = () => {
    if (!canSend()) return;
    router.post(
      route("admin.applications.save-offer", app.uuid),
      { salary, joining_date: joiningDate },
      { preserveScroll: true }
    );
    window.open(
      waUrl(app.userPhone, `🎉 *Offer Letter – ${app.company}*\n\n${letter}`),
      "_blank"
    );
    setSent("wa");
  };

  const recordAndSendEmail = () => {
    if (!app.userEmail || !canSend()) return;
    router.post(
      route("admin.applications.save-offer", app.uuid),
      { salary, joining_date: joiningDate },
      { preserveScroll: true }
    );
    window.open(
      mailUrl(
        app.userEmail,
        `Offer Letter – ${app.jobTitle} at ${app.company}`,
        letter
      ),
      "_blank"
    );
    setSent("email");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-600" />
            <h3 className="font-bold text-gray-900">Send Offer Letter</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Offered CTC (LPA)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                <input
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. 6.5"
                  className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Joining Date
              </label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Letter Preview
            </label>
            <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed max-h-52 overflow-y-auto">
              {letter}
            </pre>
          </div>
          {sent && (
            <div className="flex items-center gap-2 text-xs bg-green-50 text-green-700 px-3 py-2 rounded-xl font-medium border border-green-200">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Offer details logged. Verify and send via selected channel.
            </div>
          )}
          {validationError && <p className="text-xs text-red-500">{validationError}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={recordAndSendWA}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold cursor-pointer transition shadow-md shadow-green-500/20"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
            <button
              type="button"
              onClick={recordAndSendEmail}
              disabled={!app.userEmail || !salary || !joiningDate}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 cursor-pointer transition shadow-md shadow-blue-600/20"
            >
              <Mail className="w-4 h-4" /> Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Assign Modal ── */
function AssignModal({ app, teamMembers = [], onAssign, onClose }) {
  const [filter, setFilter] = useState("all");
  const [areaInput, setAreaInput] = useState("");
  const [companyInput, setCompanyInput] = useState(app.company || "");
  const [selected, setSelected] = useState(app.assignedTo || "");

  const activeMembers = teamMembers.filter((m) => m.role === "team_member" || m.role === "admin");

  const save = () => {
    const tm = activeMembers.find((m) => String(m.id) === String(selected));
    if (tm) onAssign(tm.id, tm.name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-gray-900">Assign Application</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="font-semibold text-gray-900 text-sm">{app.userName}</p>
            <p className="text-xs text-gray-500">
              {app.jobTitle} · {app.company}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Filter by</label>
            <div className="flex gap-2 mb-3">
              {["all", "area", "company"].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFilter(k)}
                  className={`flex-1 py-1.5 text-xs rounded-xl font-semibold border capitalize cursor-pointer transition ${
                    filter === k
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {k === "all" ? "All Staff" : k === "area" ? "City / Area" : "Company"}
                </button>
              ))}
            </div>
            {filter === "area" && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  placeholder="e.g. Jaipur, Delhi…"
                  className="bg-transparent flex-1 outline-none text-sm"
                />
              </div>
            )}
            {filter === "company" && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  placeholder="Company name…"
                  className="bg-transparent flex-1 outline-none text-sm"
                />
              </div>
            )}
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto">
            {activeMembers.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No team members available</p>
            ) : (
              activeMembers.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelected(m.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    String(selected) === String(m.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-100 hover:border-gray-200 bg-white"
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {(m.name || "U").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                    <p className="text-xs text-gray-400 truncate">{m.phone || m.email || "Available"}</p>
                  </div>
                  {String(selected) === String(m.id) && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!selected}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 cursor-pointer shadow-md shadow-blue-600/30"
            >
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function Applications({
  applications = [],
  teamMembers = [],
  canViewAll = false,
  scope = "your",
  filters = {},
}) {
  const { auth, flash } = usePage().props;
  const currentUser = auth?.admin;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState(null);
  const [remark, setRemark] = useState("");
  const [assigningApp, setAssigningApp] = useState(null);
  const [offerApp, setOfferApp] = useState(null);

  const isTeamMember = currentUser?.role === "team_member";

  const updateStatus = (uuid, status) => {
    router.post(
      route("admin.applications.update-status", uuid),
      { status },
      {
        preserveScroll: true,
        onSuccess: () => {
          if (selectedApp?.uuid === uuid) {
            setSelectedApp((prev) => (prev ? { ...prev, status } : null));
          }
        },
      }
    );
  };

  const saveRemark = (uuid) => {
    if (!remark.trim()) return;
    router.post(
      route("admin.applications.update-remark", uuid),
      { remark },
      {
        preserveScroll: true,
        onSuccess: () => {
          if (selectedApp?.uuid === uuid) {
            setSelectedApp((prev) => (prev ? { ...prev, remark } : null));
          }
          setRemark("");
        },
      }
    );
  };

  const doAssign = (uuid, tmId, name) => {
    router.post(
      route("admin.applications.assign", uuid),
      { team_member_id: tmId },
      {
        preserveScroll: true,
        onSuccess: () => {
          if (selectedApp?.uuid === uuid) {
            setSelectedApp((prev) =>
              prev ? { ...prev, assignedTo: tmId, assignedToName: name } : null
            );
          }
          setAssigningApp(null);
        },
      }
    );
  };

  const followUpWA = (app) =>
    waUrl(
      app.userPhone,
      `👋 Hi ${app.userName},\n\nThis is the ATS recruitment team regarding your application for *${app.jobTitle}* at *${app.company}*. We would like to update you on your application status. Please reply to connect.\n\n– ATS Recruitment Team`
    );

  const interviewWA = (app) =>
    waUrl(
      app.userPhone,
      `🎯 *Interview Scheduled – ${app.company}*\n\nDear ${app.userName},\n\nYour interview for *${app.jobTitle}* at *${app.company}* is scheduled on ${
        app.interviewDate || "TBD"
      }.\n\nPlease confirm your availability.\n\n– ATS Recruitment Team`
    );

  const filtered = applications.filter((a) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (a.userName || "").toLowerCase().includes(q) ||
      (a.jobTitle || "").toLowerCase().includes(q) ||
      (a.company || "").toLowerCase().includes(q) ||
      (a.userPhone || "").toLowerCase().includes(q) ||
      (a.userEmail || "").toLowerCase().includes(q) ||
      (a.userCity || "").toLowerCase().includes(q) ||
      (a.currentTitle || "").toLowerCase().includes(q) ||
      (a.lastCompany || "").toLowerCase().includes(q) ||
      (Array.isArray(a.skills) && a.skills.some((s) => (s || "").toLowerCase().includes(q)));

    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Head title="Candidate Applications - ATS Admin" />

      <div className="p-3.5 sm:p-5 lg:p-6 pb-25">
        {flash?.success && (
          <div className="mb-5 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> {flash.success}
          </div>
        )}

        {assigningApp && (
          <AssignModal
            app={assigningApp}
            teamMembers={teamMembers}
            onClose={() => setAssigningApp(null)}
            onAssign={(tmId, name) => doAssign(assigningApp.uuid, tmId, name)}
          />
        )}

        {offerApp && (
          <OfferLetterModal
            app={offerApp}
            onClose={() => setOfferApp(null)}
          />
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">
              {isTeamMember ? "My Assigned Applications" : "Job Applications"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {applications.length} total · {filtered.length} shown
            </p>
          </div>
        </div>

        {filters?.job_id && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2.5 rounded-xl text-xs font-semibold mb-4">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              Showing {applications.length} applicant{applications.length !== 1 ? "s" : ""} for Job #{filters.job_id}
            </span>
            <button
              type="button"
              onClick={() => router.get(route("admin.applications.index"))}
              className="text-blue-600 hover:text-blue-900 underline font-bold cursor-pointer"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* All vs Your Scope Tab (Visible when canViewAll is true) */}
        {canViewAll && (
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl w-fit mb-5">
            <button
              type="button"
              onClick={() =>
                router.get(
                  route("admin.applications.index"),
                  { scope: "all" },
                  { preserveState: true, preserveScroll: true }
                )
              }
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                scope === "all"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              All Applications
            </button>
            <button
              type="button"
              onClick={() =>
                router.get(
                  route("admin.applications.index"),
                  { scope: "your" },
                  { preserveState: true, preserveScroll: true }
                )
              }
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                scope === "your"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Your Applications
            </button>
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
          {[
            ["all", `All (${applications.length})`],
            ...ALL_STATUSES.map((s) => [
              s,
              `${STATUS_CFG[s].label} (${applications.filter((a) => a.status === s).length})`,
            ]),
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition ${
                statusFilter === key
                  ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative mb-5 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate, job, or company…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Applications Table */}
          <div className={`w-full min-w-0 ${selectedApp ? "hidden lg:block lg:w-1/2 xl:w-7/12" : "w-full"}`}>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  {filtered.length > 0 && (
                    <thead className="bg-gray-50/75 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                          Candidate
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                          Job Applied
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                          Status
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                          Applied
                        </th>
                        <th className={`text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap ${selectedApp ? "hidden xl:table-cell" : ""}`}>
                          Assigned Staff
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                          {/* Actions */}
                        </th>
                      </tr>
                    </thead>
                  )}
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((app) => (
                      <tr
                        key={app.uuid}
                        className={`hover:bg-gray-50/80 cursor-pointer transition ${
                          selectedApp?.uuid === app.uuid ? "bg-blue-50/50" : ""
                        }`}
                        onClick={() => setSelectedApp(app)}
                      >
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-gray-900 leading-tight">{app.userName}</p>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1 text-gray-500">
                              <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                              {app.userPhone}
                            </span>
                            {app.userCity && (
                              <span className="text-gray-400">
                                · 📍 {app.userCity}
                              </span>
                            )}
                          </div>
                          {(app.experience || app.expectedSalary) && (
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              {app.experience && (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                                  {app.experience}
                                </span>
                              )}
                              {app.expectedSalary && (
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  ₹{Number(app.expectedSalary).toLocaleString("en-IN")}
                                  <span className="text-[9px] font-normal text-emerald-600 ml-0.5">
                                    {app.jobSalaryType === "yearly" ? "/yr" : "/mo"}
                                  </span>
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-gray-800 leading-tight">
                            {app.jobTitle}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{app.company}</p>
                          {app.currentTitle && (
                            <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
                              Role: {app.currentTitle}
                            </p>
                          )}
                          {selectedApp && app.assignedToName && (
                            <p className="text-[10px] text-blue-600 xl:hidden mt-0.5 font-medium">
                              Staff: {app.assignedToName}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                              STATUS_CFG[app.status]?.color || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {STATUS_CFG[app.status]?.label || app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-500 font-medium whitespace-nowrap">
                          {app.appliedAt}
                        </td>
                        <td className={`px-4 py-3.5 text-xs ${selectedApp ? "hidden xl:table-cell" : ""}`}>
                          {app.assignedToName ? (
                            <span className="text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 whitespace-nowrap">
                              {app.assignedToName}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div
                            className="flex gap-1 justify-end items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {app.resumeUrl && (
                              <a
                                href={app.resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="View Candidate Resume PDF"
                              >
                                <FileText className="w-4 h-4" />
                              </a>
                            )}
                            {!isTeamMember && (
                              <button
                                type="button"
                                onClick={() => setAssigningApp(app)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition"
                                title="Assign to staff"
                              >
                                <Users className="w-4 h-4" />
                              </button>
                            )}
                            <a
                              href={followUpWA(app)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition cursor-pointer"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                            <a
                              href={`tel:${app.userPhone}`}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Call Candidate"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                          Koi application nahi mili.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Application Detail Side View (Natural Full Height, No Inner Scroller) */}
          {selectedApp && (
            <div
              id="admin-application-detail-panel"
              className="w-full lg:w-1/2 xl:w-5/12 bg-white border border-gray-200 rounded-3xl shadow-lg flex flex-col h-fit sticky top-6 z-10 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300 ease-out"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-white shrink-0">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="text-xs font-semibold text-blue-600 hover:underline px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg lg:hidden cursor-pointer shrink-0"
                  >
                    ← Back
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                        Application #{selectedApp.id}
                      </h3>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold shrink-0 ${
                          STATUS_CFG[selectedApp.status]?.color || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {STATUS_CFG[selectedApp.status]?.label || selectedApp.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">Applied: {selectedApp.appliedAt}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl cursor-pointer shrink-0 transition"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Natural Full Content (No Inner Scroller, Clean & Visible) */}
              <div className="p-5 sm:p-6 space-y-4">
                {/* Hero Candidate Profile Card */}
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-purple-50/50 border border-blue-100">
                  <div className="w-13 h-13 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-blue-500/20 shrink-0">
                    {(selectedApp.userName || "U").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-gray-900 text-base sm:text-lg leading-tight truncate">
                        {selectedApp.userName}
                      </h4>
                      {selectedApp.currentTitle && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          {selectedApp.currentTitle}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <a href={`tel:${selectedApp.userPhone}`} className="hover:text-blue-600 font-medium">
                          {selectedApp.userPhone}
                        </a>
                      </div>
                      {selectedApp.userEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <a href={`mailto:${selectedApp.userEmail}`} className="hover:text-blue-600 font-medium truncate">
                            {selectedApp.userEmail}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">
                          {[selectedApp.userCity, selectedApp.userArea, selectedApp.userState].filter(Boolean).join(", ") || "India"}
                        </span>
                      </div>
                      {(selectedApp.userGender || selectedApp.userDob) && (
                        <div className="flex items-center gap-2 text-gray-400 text-[11px] pt-0.5">
                          {selectedApp.userGender && <span className="capitalize">{selectedApp.userGender}</span>}
                          {selectedApp.userGender && selectedApp.userDob && <span>·</span>}
                          {selectedApp.userDob && <span>DOB: {selectedApp.userDob}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Candidate Resume Action Box */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-white shadow-xs">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm">Resume / CV Document</p>
                        <p className="text-xs text-gray-400 truncate">
                          {selectedApp.resumeUrl ? "Candidate uploaded resume" : "No resume document uploaded"}
                        </p>
                      </div>
                    </div>
                    {selectedApp.resumeUrl ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={selectedApp.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View PDF
                        </a>
                        <a
                          href={selectedApp.resumeUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                          title="Download Resume"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Not available</span>
                    )}
                  </div>
                </div>

                {/* Compensation & Experience Highlights */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Compensation & Availability
                    </span>
                    {selectedApp.noticePeriod && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-orange-100 text-orange-800 border border-orange-200">
                        Notice: {selectedApp.noticePeriod}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3">
                      <span className="text-[10px] font-bold text-emerald-800 block uppercase">
                        Expected Salary
                      </span>
                      <p className="text-base font-extrabold text-emerald-900 mt-0.5">
                        {selectedApp.expectedSalary
                          ? `₹${Number(selectedApp.expectedSalary).toLocaleString("en-IN")}`
                          : "Not specified"}
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-3">
                      <span className="text-[10px] font-bold text-gray-500 block uppercase">
                        Current Salary
                      </span>
                      <p className="text-base font-extrabold text-gray-900 mt-0.5">
                        {selectedApp.currentSalary
                          ? `₹${Number(selectedApp.currentSalary).toLocaleString("en-IN")}`
                          : "—"}
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-3 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-bold text-gray-500 block uppercase">
                        Total Experience
                      </span>
                      <p className="text-base font-extrabold text-gray-900 mt-0.5">
                        {selectedApp.experience || "Fresher"}
                      </p>
                    </div>
                  </div>

                  {selectedApp.lastWorkingDay && (
                    <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-900 px-3 py-2 rounded-xl border border-amber-200 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Last Working Day: <strong>{selectedApp.lastWorkingDay}</strong></span>
                    </div>
                  )}
                </div>

                {/* Professional Background */}
                {(selectedApp.currentTitle || selectedApp.lastCompany || selectedApp.experience) && (
                  <div className="border border-gray-200 rounded-2xl p-4 bg-white space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                      Professional Details
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Current / Latest Role</span>
                        <span className="font-semibold text-gray-900 text-sm">{selectedApp.currentTitle || "—"}</span>
                      </div>
                      <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Previous / Current Company</span>
                        <span className="font-semibold text-gray-900 text-sm">{selectedApp.lastCompany || "—"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Candidate Skills */}
                {selectedApp.skills && selectedApp.skills.length > 0 && (
                  <div className="border border-gray-200 rounded-2xl p-4 bg-white space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <Tag className="w-3.5 h-3.5 text-blue-500" />
                      Candidate Skills ({selectedApp.skills.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedApp.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-100"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education Background */}
                {(selectedApp.qualification || selectedApp.educationDegree || selectedApp.educationInstitute) && (
                  <div className="border border-gray-200 rounded-2xl p-4 bg-white space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                      Education & Qualifications
                    </div>
                    <div className="space-y-2 text-xs">
                      {selectedApp.qualification && (
                        <div className="flex items-baseline justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                          <span className="text-gray-400">Level:</span>
                          <span className="font-semibold text-gray-900">{selectedApp.qualification}</span>
                        </div>
                      )}
                      {selectedApp.educationDegree && (
                        <div className="flex items-baseline justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                          <span className="text-gray-400">Degree / Branch:</span>
                          <span className="font-semibold text-gray-900">{selectedApp.educationDegree}</span>
                        </div>
                      )}
                      {selectedApp.educationInstitute && (
                        <div className="flex items-baseline justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                          <span className="text-gray-400">College / Institute:</span>
                          <span className="font-semibold text-gray-900 text-right">{selectedApp.educationInstitute}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cover Letter / Statement */}
                {selectedApp.coverLetter && (
                  <div className="border border-amber-200 rounded-2xl p-4 bg-amber-50/40 space-y-2">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                      Candidate Note / Why Apply
                    </span>
                    <p className="text-xs text-gray-800 leading-relaxed italic whitespace-pre-line bg-white/80 p-3 rounded-xl border border-amber-100">
                      "{selectedApp.coverLetter}"
                    </p>
                  </div>
                )}

                {/* Links: LinkedIn & Portfolio */}
                {(selectedApp.linkedin || selectedApp.portfolio) && (
                  <div className="flex gap-2">
                    {selectedApp.linkedin && (
                      <a
                        href={selectedApp.linkedin.startsWith("http") ? selectedApp.linkedin : `https://${selectedApp.linkedin}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition"
                      >
                        <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                      </a>
                    )}
                    {selectedApp.portfolio && (
                      <a
                        href={selectedApp.portfolio.startsWith("http") ? selectedApp.portfolio : `https://${selectedApp.portfolio}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition"
                      >
                        <Globe className="w-3.5 h-3.5" /> Portfolio
                      </a>
                    )}
                  </div>
                )}

                {/* Applied Job Details */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/70 space-y-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Job Details
                  </span>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-extrabold text-gray-900 text-sm sm:text-base">{selectedApp.jobTitle}</p>
                      <p className="text-xs font-semibold text-blue-600 mt-0.5">{selectedApp.company}</p>
                    </div>
                    {selectedApp.jobType && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                        {selectedApp.jobType}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 pt-1 border-t border-gray-200/60 flex-wrap">
                    {selectedApp.jobLocation && (
                      <span className="flex items-center gap-1">📍 {selectedApp.jobLocation}</span>
                    )}
                    {selectedApp.jobSalary && (
                      <span className="flex items-center gap-1 font-semibold text-emerald-700">
                        💰 {selectedApp.jobSalary} ({selectedApp.jobSalaryType})
                      </span>
                    )}
                  </div>
                </div>

                {/* Interview Information (if scheduled) */}
                {(selectedApp.interviewDate || selectedApp.interviewMode || selectedApp.status === "interview_scheduled") && (
                  <div className="border border-purple-200 rounded-2xl p-4 bg-purple-50/50 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-purple-800 uppercase tracking-wider">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      Interview Details
                    </div>
                    <div className="space-y-1.5 text-gray-700">
                      {selectedApp.interviewDate && (
                        <p><strong>Scheduled:</strong> {selectedApp.interviewDate}</p>
                      )}
                      {selectedApp.interviewMode && (
                        <p><strong>Mode:</strong> {selectedApp.interviewMode}</p>
                      )}
                      {selectedApp.interviewAddress && (
                        <p><strong>Address / Link:</strong> {selectedApp.interviewAddress}</p>
                      )}
                      {selectedApp.interviewContact && (
                        <p><strong>Contact Person:</strong> {selectedApp.interviewContact}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Recruiter Actions */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Quick Actions
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={followUpWA(selectedApp)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-green-50 text-green-700 rounded-xl text-xs font-semibold hover:bg-green-100 border border-green-200 transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                    {selectedApp.userEmail && (
                      <a
                        href={mailUrl(
                          selectedApp.userEmail,
                          `Regarding your application – ${selectedApp.jobTitle}`,
                          `Dear ${selectedApp.userName},\n\nThis is ATS recruitment team regarding your application for ${selectedApp.jobTitle} at ${selectedApp.company}.\n\nWe would like to connect with you for next steps.\n\n– ATS Team`
                        )}
                        className="flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold hover:bg-blue-100 border border-blue-200 transition"
                      >
                        <Mail className="w-3.5 h-3.5" /> Email
                      </a>
                    )}
                    {selectedApp.status === "interview_scheduled" && (
                      <a
                        href={interviewWA(selectedApp)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2.5 bg-purple-50 text-purple-700 rounded-xl text-xs font-semibold hover:bg-purple-100 border border-purple-200 transition col-span-2"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Send Interview WA Reminder
                      </a>
                    )}
                    {(selectedApp.status === "hired" || selectedApp.status === "offer_letter_generated") && (
                      <button
                        type="button"
                        onClick={() => setOfferApp(selectedApp)}
                        className="flex items-center justify-center gap-1.5 py-2.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold hover:bg-amber-100 border border-amber-200 transition cursor-pointer col-span-2"
                      >
                        <FileText className="w-3.5 h-3.5" /> Generate / Send Offer Letter
                      </button>
                    )}
                  </div>
                </div>

                {/* Assignment Info */}
                {selectedApp.assignedToName ? (
                  <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3.5 py-2.5 border border-blue-100">
                    <Users className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-blue-400">Assigned Recruiter</p>
                      <p className="text-sm font-semibold text-blue-800 truncate">
                        {selectedApp.assignedToName}
                      </p>
                    </div>
                    {!isTeamMember && (
                      <button
                        type="button"
                        onClick={() => setAssigningApp(selectedApp)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 bg-white border border-blue-200 rounded-lg shrink-0 cursor-pointer"
                      >
                        Change
                      </button>
                    )}
                  </div>
                ) : (
                  !isTeamMember && (
                    <button
                      type="button"
                      onClick={() => setAssigningApp(selectedApp)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-500 hover:border-blue-400 hover:text-blue-600 font-semibold cursor-pointer transition"
                    >
                      <Users className="w-3.5 h-3.5" /> Assign Staff Member
                    </button>
                  )
                )}

                {/* Status Update Pipeline */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Update Pipeline Status
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ALL_STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateStatus(selectedApp.uuid, s)}
                        className={`text-xs py-2 px-2 rounded-xl font-semibold border transition-all cursor-pointer ${
                          selectedApp.status === s
                            ? "ring-2 ring-blue-500 font-bold " + STATUS_CFG[s].color
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {STATUS_CFG[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Remarks & History */}
                {selectedApp.remark && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                    <p className="text-xs font-semibold text-yellow-700 mb-1">Previous Remark / Note</p>
                    <p className="text-sm text-yellow-800 whitespace-pre-line">{selectedApp.remark}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Add Remark
                  </p>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    rows={3}
                    placeholder="e.g. Cleared round 1, agreed on offered CTC, documents verified…"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                  />
                  <button
                    type="button"
                    onClick={() => saveRemark(selectedApp.uuid)}
                    disabled={!remark.trim()}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" /> Save Remark
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Applications.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;