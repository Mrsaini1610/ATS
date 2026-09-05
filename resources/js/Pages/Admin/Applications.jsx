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
} from "lucide-react";

const STATUS_CFG = {
  applied: { label: "Applied", color: "bg-gray-100 text-gray-600" },
  reviewed: { label: "Reviewed", color: "bg-blue-50 text-blue-700" },
  shortlisted: { label: "Shortlisted", color: "bg-yellow-50 text-yellow-700" },
  interview_scheduled: { label: "Interview Scheduled", color: "bg-purple-50 text-purple-700" },
  hired: { label: "Hired ✓", color: "bg-green-50 text-green-700" },
  rejected: { label: "Rejected", color: "bg-red-50 text-red-600" },
  not_interested: { label: "Not Interested", color: "bg-gray-100 text-gray-500" },
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
    if (!app.userEmail) return;
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
              disabled={!app.userEmail}
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
export default function Applications({ applications = [], teamMembers = [] }) {
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
      (a.company || "").toLowerCase().includes(q);

    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Head title="Candidate Applications - ATS Admin" />

      <div className="p-6">
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

        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">
              {isTeamMember ? "My Assigned Applications" : "Job Applications"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {applications.length} applications in database
            </p>
          </div>
        </div>

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
        <div className="relative mb-5 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate, job, or company…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex gap-5">
          {/* Applications Table */}
          <div className={`flex-1 min-w-0 ${selectedApp ? "hidden lg:block" : ""}`}>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/75 border-b border-gray-100">
                    <tr>
                      {["Candidate", "Job", "Status", "Applied", "Assigned Staff", ""].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
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
                          <p className="font-semibold text-gray-900">{app.userName}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            {app.userPhone}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-gray-800 truncate max-w-[160px]">
                            {app.jobTitle}
                          </p>
                          <p className="text-xs text-gray-400">{app.company}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                              STATUS_CFG[app.status]?.color || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {STATUS_CFG[app.status]?.label || app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-400">{app.appliedAt}</td>
                        <td className="px-4 py-3.5 text-xs">
                          {app.assignedToName ? (
                            <span className="text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                              {app.assignedToName}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div
                            className="flex gap-1 justify-end"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {!isTeamMember && (
                              <button
                                type="button"
                                onClick={() => setAssigningApp(app)}
                                title="Assign Staff"
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition"
                              >
                                <Users className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedApp(app)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-400">
                          No applications found matching your query
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Application Detail Side Drawer */}
          {selectedApp && (
            <div className="w-80 shrink-0 bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col max-h-[calc(100vh-120px)] sticky top-20 shadow-xs">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">Application Detail</h3>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-5 space-y-5">
                <div>
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg mb-3 shadow-md shadow-blue-600/30">
                    {(selectedApp.userName || "U").slice(0, 2).toUpperCase()}
                  </div>
                  <p className="font-bold text-gray-900 text-base">{selectedApp.userName}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {selectedApp.userPhone}
                  </p>
                  {selectedApp.userEmail && (
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3 h-3 text-gray-400" />
                      {selectedApp.userEmail}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">📍 {selectedApp.userCity || "India"}</p>
                </div>

                {/* Quick Actions */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Quick Actions
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={followUpWA(selectedApp)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-semibold hover:bg-green-100 border border-green-200 transition"
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
                        className="flex items-center justify-center gap-1.5 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold hover:bg-blue-100 border border-blue-200 transition"
                      >
                        <Mail className="w-3.5 h-3.5" /> Email
                      </a>
                    )}
                    {selectedApp.status === "interview_scheduled" && (
                      <a
                        href={interviewWA(selectedApp)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2 bg-purple-50 text-purple-700 rounded-xl text-xs font-semibold hover:bg-purple-100 border border-purple-200 transition"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Interview Info
                      </a>
                    )}
                    {selectedApp.status === "hired" && (
                      <button
                        type="button"
                        onClick={() => setOfferApp(selectedApp)}
                        className="flex items-center justify-center gap-1.5 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" /> Offer Letter
                      </button>
                    )}
                  </div>
                </div>

                {/* Job Info */}
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-0.5">Applied For</p>
                  <p className="font-semibold text-gray-900 text-sm">{selectedApp.jobTitle}</p>
                  <p className="text-xs text-blue-600">{selectedApp.company}</p>
                  <p className="text-xs text-gray-400 mt-1">Applied: {selectedApp.appliedAt}</p>
                </div>

                {/* Assignment Info */}
                {selectedApp.assignedToName ? (
                  <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2.5 border border-blue-100">
                    <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-blue-400">Assigned staff</p>
                      <p className="text-sm font-semibold text-blue-800 truncate">
                        {selectedApp.assignedToName}
                      </p>
                    </div>
                    {!isTeamMember && (
                      <button
                        type="button"
                        onClick={() => setAssigningApp(selectedApp)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0 cursor-pointer"
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
                      className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-500 hover:border-blue-400 hover:text-blue-600 font-medium cursor-pointer transition"
                    >
                      <Users className="w-3.5 h-3.5" /> Assign Staff Member
                    </button>
                  )
                )}

                {/* Status Update */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Current Status
                  </p>
                  <span
                    className={`text-sm font-bold px-3 py-1.5 rounded-xl inline-block ${
                      STATUS_CFG[selectedApp.status]?.color || "bg-gray-100"
                    }`}
                  >
                    {STATUS_CFG[selectedApp.status]?.label || selectedApp.status}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Change Status
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ALL_STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateStatus(selectedApp.uuid, s)}
                        className={`text-xs py-1.5 px-2 rounded-lg font-medium border transition-all cursor-pointer ${
                          selectedApp.status === s
                            ? "ring-2 ring-blue-500 " + STATUS_CFG[s].color
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {STATUS_CFG[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Remarks */}
                {selectedApp.remark && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                    <p className="text-xs font-semibold text-yellow-700 mb-1">Last Remark</p>
                    <p className="text-sm text-yellow-800">{selectedApp.remark}</p>
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
                    placeholder="e.g. Cleared round 1, candidate agreed on salary…"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                  />
                  <button
                    type="button"
                    onClick={() => saveRemark(selectedApp.uuid)}
                    disabled={!remark.trim()}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
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