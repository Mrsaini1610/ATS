import React, { useState } from "react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";
import { Head, usePage, Link, router } from "@inertiajs/react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  EyeOff,
  Eye,
  Search,
  Briefcase,
  MapPin,
  Users,
  Plus,
  X,
  Flame,
} from "lucide-react";

const STATUS_CONFIG = {
  pending:     { label: "Pending",     color: "bg-yellow-50 text-yellow-700 border-yellow-200", dotColor: "bg-yellow-400" },
  approved:    { label: "Approved",    color: "bg-green-50 text-green-700 border-green-200",    dotColor: "bg-green-500" },
  active:      { label: "Active",      color: "bg-blue-50 text-blue-700 border-blue-200",       dotColor: "bg-blue-500" },
  rejected:    { label: "Rejected",    color: "bg-red-50 text-red-600 border-red-200",          dotColor: "bg-red-500" },
  hold:        { label: "On Hold",     color: "bg-orange-50 text-orange-600 border-orange-200", dotColor: "bg-orange-400" },
  deactivated: { label: "Deactivated", color: "bg-gray-100 text-gray-500 border-gray-200",      dotColor: "bg-gray-400" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
      {cfg.label}
    </span>
  );
}

/* ── Assign Team Member Modal ── */
function AssignTMModal({ job, teamMembers = [], onAssign, onClose, processing }) {
  const [selected, setSelected] = useState(job.assigned_team_member_uuid || "");
  
  // Updated filter to check for 'team_member' or fallback to active staff
  const activeMembers = teamMembers.filter((m) => m.role === "team_member" || m.role === "admin");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Assign Job to Team Member</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          <div className="bg-blue-50 rounded-xl p-3 mb-4 text-sm">
            <p className="font-semibold text-gray-900">{job.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{job.company} · {job.location}</p>
            <p className="text-xs text-blue-600 mt-1">All future applications will be routed to the selected member.</p>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelected("")}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer transition ${
                selected === "" ? "border-blue-500 bg-blue-50/50" : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs font-bold shrink-0">
                —
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">No Assignment</p>
                <p className="text-xs text-gray-400">Admin will handle applications directly</p>
              </div>
              {selected === "" && <CheckCircle2 className="w-4 h-4 text-blue-600 ml-auto shrink-0" />}
            </button>

            {activeMembers.map((m) => (
              <button
                key={m.uuid}
                type="button"
                onClick={() => setSelected(m.uuid)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer transition ${
                  selected === m.uuid ? "border-blue-500 bg-blue-50/50" : "border-gray-100 hover:border-gray-200 bg-white"
                }`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {(m.name || "TM").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                  <p className="text-xs text-gray-400 truncate">{m.active_task || m.email || "Available"}</p>
                </div>
                {selected === m.uuid && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>
            ))}
          </div>

          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={processing}
              onClick={() => onAssign(selected)}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/30 cursor-pointer disabled:opacity-60"
            >
              {processing ? "Saving..." : "Save Assignment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Jobs({ jobs = [], teamMembers = [] }) {
  const { auth, flash } = usePage().props;
  const admin = auth?.admin;
  const canManage = admin?.role === "super_admin" || admin?.role === "admin";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);
  const [remarkModal, setRemarkModal] = useState(null);
  const [remark, setRemark] = useState("");
  const [assigningJob, setAssigningJob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const updateStatus = (uuid, status, remarkReason = null) => {
    setIsProcessing(true);
    router.post(
      route("admin.jobs.update-status", uuid),
      { status, remark: remarkReason },
      {
        preserveScroll: true,
        onSuccess: () => {
          setSelectedJob((prev) =>
            prev?.uuid === uuid ? { ...prev, status, remark: remarkReason } : prev
          );
          setRemarkModal(null);
          setRemark("");
        },
        onFinish: () => setIsProcessing(false),
      }
    );
  };

  const doAssignTM = (jobUuid, teamMemberUuid) => {
    setIsProcessing(true);
    router.post(
      route("admin.jobs.assign-team", jobUuid),
      { team_member_uuid: teamMemberUuid },
      {
        preserveScroll: true,
        onSuccess: () => {
          const tm = teamMembers.find((m) => String(m.uuid) === String(teamMemberUuid));
          setSelectedJob((prev) =>
            prev?.uuid === jobUuid
              ? {
                  ...prev,
                  assigned_team_member_uuid: teamMemberUuid,
                  assigned_team_member_name: tm?.name || null,
                }
              : prev
          );
          setAssigningJob(null);
        },
        onFinish: () => setIsProcessing(false),
      }
    );
  };

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    const matchQuery =
      !search ||
      (j.title || "").toLowerCase().includes(q) ||
      (j.company || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || j.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const counts = { all: jobs.length };
  Object.keys(STATUS_CONFIG).forEach((s) => {
    counts[s] = jobs.filter((j) => j.status === s).length;
  });

  return (
    <>
      <Head title="Job Posts & Moderation - ATS Admin" />

      <div className="p-6">
        {flash?.success && (
          <div className="mb-5 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> {flash.success}
          </div>
        )}

        {remarkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-1">
                {remarkModal.newStatus === "rejected" ? "Reject Job Post" : "Put on Hold"}
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Reason for <strong>{remarkModal.job.title}</strong>
              </p>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={3}
                placeholder="Enter reason or remarks..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRemarkModal(null);
                    setRemark("");
                  }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => updateStatus(remarkModal.job.uuid, remarkModal.newStatus, remark)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white shadow-md cursor-pointer disabled:opacity-60 ${
                    remarkModal.newStatus === "rejected"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-orange-500 hover:bg-orange-600"
                  }`}
                >
                  {isProcessing ? "Updating..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}

        {assigningJob && (
          <AssignTMModal
            job={assigningJob}
            teamMembers={teamMembers}
            processing={isProcessing}
            onClose={() => setAssigningJob(null)}
            onAssign={(tmUuid) => doAssignTM(assigningJob.uuid, tmUuid)}
          />
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Job Posts</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {jobs.length} total · {counts.pending || 0} pending review
            </p>
          </div>
          {canManage && (
            <Link
              href={route("admin.jobs.create")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Post Job
            </Link>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
          {[["all", "All"], ...Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label])].map(
            ([key, label]) => (
              <button
                type="button"
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  statusFilter === key
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {label} <span className="ml-1 opacity-60">({counts[key] || 0})</span>
              </button>
            )
          )}
        </div>

        <div className="relative mb-5 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title or company…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-2xs"
          />
        </div>

        <div className="flex gap-5">
          <div className={`flex-1 ${selectedJob ? "hidden lg:block" : ""} space-y-3`}>
            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">No jobs found</p>
              </div>
            ) : (
              filtered.map((job) => (
                <div
                  key={job.uuid}
                  onClick={() => setSelectedJob(job)}
                  className={`bg-white border rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all ${
                    selectedJob?.uuid === job.uuid
                      ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/20"
                      : "border-gray-100 hover:border-blue-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-gray-900">{job.title}</h3>
                        {job.is_hot && (
                          <Flame className="w-3.5 h-3.5 text-orange-500" title="Hot Job" />
                        )}
                        <StatusBadge status={job.status} />
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-gray-400" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-gray-400" />
                          {job.applicants ?? 0} applicants
                        </span>
                        <span className="font-medium text-gray-700">{job.salary}</span>
                        {job.work_mode && (
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">
                            {job.work_mode}
                          </span>
                        )}
                      </div>
                    </div>

                    {canManage && (
                      <div className="flex gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {job.status !== "approved" && job.status !== "active" && (
                          <button
                            type="button"
                            onClick={() => updateStatus(job.uuid, "approved")}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium cursor-pointer transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Approve</span>
                          </button>
                        )}
                        {job.status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() => {
                              setRemarkModal({ job, newStatus: "rejected" });
                              setRemark("");
                            }}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium cursor-pointer transition"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Reject</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {job.assigned_team_member_name && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-2.5 py-1.5 mt-2 w-fit">
                      <Users className="w-3 h-3" /> Managed by {job.assigned_team_member_name}
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    Posted {job.posted_at} · {job.type} · {job.exp} · {job.openings} opening
                    {job.openings > 1 ? "s" : ""}
                  </p>
                </div>
              ))
            )}
          </div>

          {selectedJob && (
            <div className="flex-1 bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col max-h-[calc(100vh-120px)] sticky top-20 shadow-xs">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 truncate max-w-[200px]">
                    {selectedJob.title}
                  </h3>
                  {selectedJob.is_hot && <Flame className="w-4 h-4 text-orange-500 shrink-0" />}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-5 space-y-5">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={selectedJob.status} />
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                    {selectedJob.type}
                  </span>
                  {selectedJob.work_mode && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                      {selectedJob.work_mode}
                    </span>
                  )}
                  <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                    {selectedJob.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: "Company", val: selectedJob.company },
                    { label: "Location", val: selectedJob.location },
                    { label: "Salary", val: selectedJob.salary },
                    { label: "Experience", val: selectedJob.exp },
                    { label: "Openings", val: selectedJob.openings },
                    { label: "Applicants", val: selectedJob.applicants ?? 0 },
                    { label: "Posted By", val: selectedJob.posted_by },
                    { label: "Posted On", val: selectedJob.posted_at },
                    ...(selectedJob.deadline ? [{ label: "Deadline", val: selectedJob.deadline }] : []),
                  ].map((r) => (
                    <div key={r.label}>
                      <p className="text-xs text-gray-400 font-medium">{r.label}</p>
                      <p className="font-semibold text-gray-900">{r.val || "—"}</p>
                    </div>
                  ))}
                </div>

                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/40">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Team Assignment
                    </p>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => setAssigningJob(selectedJob)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                      >
                        {selectedJob.assigned_team_member_name ? "Change" : "Assign"}
                      </button>
                    )}
                  </div>
                  {selectedJob.assigned_team_member_name ? (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                        {selectedJob.assigned_team_member_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedJob.assigned_team_member_name}
                        </p>
                        <p className="text-xs text-gray-400">Manages all applications for this job</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      Not assigned · Admin handles applications directly
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Description
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {selectedJob.desc}
                  </p>
                </div>

                {selectedJob.remark && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                    <p className="text-xs font-semibold text-yellow-700 mb-1">Remarks / Note</p>
                    <p className="text-sm text-yellow-800">{selectedJob.remark}</p>
                  </div>
                )}
              </div>

              {canManage && (
                <div className="p-4 border-t border-gray-100 flex flex-wrap gap-2 shrink-0 bg-gray-50/50">
                  {selectedJob.status !== "approved" && selectedJob.status !== "active" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(selectedJob.uuid, "approved")}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold cursor-pointer transition"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                  )}
                  {selectedJob.status !== "rejected" && (
                    <button
                      type="button"
                      onClick={() => {
                        setRemarkModal({ job: selectedJob, newStatus: "rejected" });
                        setRemark("");
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold cursor-pointer transition"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  )}
                  {selectedJob.status !== "hold" && (
                    <button
                      type="button"
                      onClick={() => {
                        setRemarkModal({ job: selectedJob, newStatus: "hold" });
                        setRemark("");
                      }}
                      className="flex items-center gap-1.5 py-2.5 px-4 border-2 border-orange-400 text-orange-600 rounded-xl text-sm font-bold hover:bg-orange-50 cursor-pointer transition"
                    >
                      <Clock className="w-4 h-4" /> Hold
                    </button>
                  )}
                  {selectedJob.status === "deactivated" ? (
                    <button
                      type="button"
                      onClick={() => updateStatus(selectedJob.uuid, "active")}
                      className="flex items-center gap-1.5 py-2.5 px-4 border-2 border-blue-400 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-50 cursor-pointer transition"
                    >
                      <Eye className="w-4 h-4" /> Activate
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => updateStatus(selectedJob.uuid, "deactivated")}
                      className="flex items-center gap-1.5 py-2.5 px-4 border-2 border-gray-300 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-100 cursor-pointer transition"
                    >
                      <EyeOff className="w-4 h-4" /> Deactivate
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Jobs.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;