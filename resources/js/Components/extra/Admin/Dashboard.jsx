import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import AuthenticatedLayout from "./Layouts/AuthenticatedLayout";
import ConfirmDialog from "@/Components/ConfirmDialog";
import ResumePreviewModal from "@/Components/ResumePreviewModal";
import { useAlerts } from "@/Components/Alerts";
import {
  Briefcase,
  Users,
  CheckCircle2,
  TrendingUp,
  Building2,
  ChevronRight,
  AlertTriangle,
  Calendar,
  ClipboardList,
  Eye,
  FileText,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color, onClick }) {
  const content = (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {onClick && <ChevronRight className="w-4 h-4 text-gray-400" />}
      </div>
      <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
  return content;
}

export default function Dashboard({
  stats,
  recentTasks = [],
  auth,
  initialFilters,
  members = [],
  jobStats,
}) {
  const isAdmin = auth?.guard === "admin" || auth?.user?.role === "admin" || auth?.user?.role === "super_admin";
  const currentUser = auth?.user;
  const role = currentUser?.role || (isAdmin ? "admin" : "team_member");

  const [loading, setLoading] = useState(false);
  const [recentApplications, setRecentApplications] = useState(
    Array.isArray(jobStats?.recentApplications) ? jobStats.recentApplications : []
  );
  const [confirmAppDecisionOpen, setConfirmAppDecisionOpen] = useState(false);
  const [decisionApp, setDecisionApp] = useState(null);
  const [decisionAction, setDecisionAction] = useState(null);
  const [resumePreviewOpen, setResumePreviewOpen] = useState(false);
  const [resumePreviewUrl, setResumePreviewUrl] = useState(null);
  const [resumePreviewFallbackUrl, setResumePreviewFallbackUrl] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const { successAlert, errorAlert } = useAlerts();

  const [filters, setFilters] = useState({
    year: initialFilters?.year || new Date().getFullYear(),
    month: initialFilters?.month || new Date().getMonth() + 1,
    member_id: initialFilters?.member_id || "",
  });

  const yearOptions = Array.from({ length: 6 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year, label: year.toString() };
  });

  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const statusOptions = [
    { value: "applied", label: "Applied" },
    { value: "viewed", label: "Viewed" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "assigned_to_calling_member", label: "Assigned To Calling Member" },
    { value: "calling_in_progress", label: "Calling In Progress" },
    { value: "calling_approved", label: "Calling Approved" },
    { value: "calling_rejected", label: "Calling Rejected" },
    { value: "admin_review", label: "Admin Review" },
    { value: "offer_letter_generated", label: "Offer Letter Generated" },
    { value: "waiting_list", label: "Waiting List" },
    { value: "hired", label: "Hired" },
    { value: "not_selected", label: "Not Selected" },
    { value: "rejected", label: "Rejected" },
  ];

  const statusBadgeColors = {
    applied: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    viewed: "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    shortlisted: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    assigned_to_calling_member: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    calling_in_progress: "bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    calling_approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    calling_rejected: "bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    admin_review: "bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    offer_letter_generated: "bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    waiting_list: "bg-orange-50 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    hired: "bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    not_selected: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
    rejected: "bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };

  const handleFilterChange = (newFilters) => {
    setLoading(true);
    router.get(
      route("admin.dashboard"),
      {
        year: newFilters.year,
        month: newFilters.month,
        member_id: newFilters.member_id || undefined,
      },
      {
        preserveState: true,
        replace: true,
        only: ["stats", "recentTasks", "initialFilters", "jobStats"],
        onFinish: () => setLoading(false),
      }
    );
  };

  const updateFilters = (type, value) => {
    const newFilters = {
      ...filters,
      [type]: type === "year" || type === "month" ? parseInt(value) : value,
    };
    setFilters(newFilters);
    handleFilterChange(newFilters);
  };

  const openDecision = (app, action) => {
    setDecisionApp(app);
    setDecisionAction(action);
    setConfirmAppDecisionOpen(true);
  };

  const confirmDecision = async () => {
    if (!decisionApp || !decisionAction) return;
    try {
      const response = await fetch(
        route("admin.api.applications.decision", decisionApp.id),
        {
          method: "PATCH",
          headers: {
            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: decisionAction }),
        }
      );
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        errorAlert(data?.message || "Failed to update application.");
        return;
      }

      setRecentApplications((prev) =>
        prev.map((a) => (a.id === decisionApp.id ? { ...a, status: data.data.status } : a))
      );
      successAlert("Application updated successfully!");
    } catch (e) {
      errorAlert("Failed to update application.");
    } finally {
      setConfirmAppDecisionOpen(false);
      setDecisionApp(null);
      setDecisionAction(null);
    }
  };

  const handleStatusChangeDirectly = async (app, newStatus) => {
    if (app.status === newStatus) return;
    setUpdatingStatusId(app.id);
    try {
      const res = await fetch(
        route("admin.api.job.applicants.status", app.id),
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        errorAlert(data?.message || "Failed to update status.");
        return;
      }

      setRecentApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a))
      );
      successAlert("Status updated successfully!");
    } catch (e) {
      errorAlert("Failed to update status.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const isPreviewableResume = (url) => {
    const u = String(url || "").toLowerCase();
    return u.endsWith(".pdf") || u.endsWith(".html") || u.includes("generated-resumes");
  };

  const openResumePreview = (url, applicationId) => {
    const resolved = url
      ? String(url).startsWith("/") || /^https?:\/\//i.test(String(url))
        ? String(url)
        : `/${url}`
      : null;
    const fallbackUrl = applicationId
      ? route("admin.api.job.applicants.resume-preview", applicationId)
      : null;

    if (resolved && !isPreviewableResume(resolved)) {
      window.open(resolved, "_blank");
      return;
    }

    setResumePreviewUrl(resolved);
    setResumePreviewFallbackUrl(fallbackUrl);
    setResumePreviewOpen(true);
  };

  return (
    <AuthenticatedLayout>
      <Head title="Dashboard" />

      <div className="p-6 space-y-6 max-w-7xl mx-auto mt-14">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Welcome back, {currentUser?.name?.split(" ")[0] || "Admin"}! 👋
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Here is an overview of platform activity today.
            </p>
          </div>

          {/* Date & Member Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filters.month}
              onChange={(e) => updateFilters("month", e.target.value)}
              className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-200 shadow-sm"
              disabled={loading}
            >
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <select
              value={filters.year}
              onChange={(e) => updateFilters("year", e.target.value)}
              className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-200 shadow-sm"
              disabled={loading}
            >
              {yearOptions.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>

            {isAdmin && members.length > 0 && (
              <select
                value={filters.member_id}
                onChange={(e) => updateFilters("member_id", e.target.value)}
                className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-200 shadow-sm"
                disabled={loading}
              >
                <option value="">All Members</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Members"
            value={stats?.totalMembers ?? 0}
            sub="Registered accounts"
            color="bg-indigo-600"
          />
          <StatCard
            icon={ClipboardList}
            label="Applications"
            value={jobStats?.totalApplications ?? recentApplications.length}
            sub={`${jobStats?.shortlistedCount ?? 0} shortlisted`}
            color="bg-purple-600"
            onClick={() => router.visit(route("admin.job.applications.index"))}
          />
          <StatCard
            icon={Calendar}
            label="Interviews"
            value={jobStats?.scheduledInterviews ?? 0}
            sub="Upcoming schedules"
            color="bg-orange-500"
          />
          <StatCard
            icon={CheckCircle2}
            label="Hired"
            value={jobStats?.hiredCount ?? 0}
            sub="Selected candidates"
            color="bg-green-600"
          />
          {isAdmin && (
            <>
              <StatCard
                icon={Briefcase}
                label="Active Jobs"
                value={jobStats?.activeJobs ?? 0}
                sub="Live on portal"
                color="bg-blue-600"
              />
              <StatCard
                icon={AlertTriangle}
                label="Pending Jobs"
                value={jobStats?.pendingJobs ?? 0}
                sub="Awaiting moderation"
                color="bg-yellow-500"
              />
              <StatCard
                icon={TrendingUp}
                label="Total Tasks"
                value={stats?.totalTasks ?? recentTasks.length}
                sub={`${stats?.pendingTasks ?? 0} pending`}
                color="bg-pink-600"
              />
              <StatCard
                icon={Building2}
                label="Completed Tasks"
                value={stats?.completedTasks ?? 0}
                sub="Resolved"
                color="bg-teal-600"
              />
            </>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Applications",
              icon: ClipboardList,
              color: "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300",
              onClick: () => router.visit(route("admin.job.applications.index")),
            },
            {
              label: "Pending Approvals",
              icon: AlertTriangle,
              color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300",
              onClick: () => router.visit(route("admin.job.applications.index")),
            },
            {
              label: "Team Tasks",
              icon: TrendingUp,
              color: "bg-pink-50 text-pink-700 hover:bg-pink-100 dark:bg-pink-900/30 dark:text-pink-300",
              onClick: () => router.visit(route("admin.dashboard")),
            },
            {
              label: "All Members",
              icon: Users,
              color: "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300",
              onClick: () => router.visit(route("admin.dashboard")),
            },
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={item.onClick}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-colors text-left ${item.color}`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Recent Applications Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Recent Job Applications</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Applications received for your job posts</p>
            </div>
            <button
              type="button"
              onClick={() => router.visit(route("admin.job.applications.index"))}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </button>
          </div>

          {recentApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3">Candidate</th>
                    <th className="px-4 py-3">Job Post</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Quick Decision</th>
                    <th className="px-4 py-3">Applied Date</th>
                    <th className="px-4 py-3 text-right">Resume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-700 dark:text-gray-200">
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-900 dark:text-white">{app.candidate_name || "-"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{app.candidate_email || "-"}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-gray-800 dark:text-gray-100 truncate max-w-[180px]">
                          {app.job?.title || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        {updatingStatusId === app.id ? (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-blue-600"></div>
                            <span>Saving...</span>
                          </div>
                        ) : (
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChangeDirectly(app, e.target.value)}
                            className={`text-xs px-2.5 py-1 rounded-full font-semibold border border-transparent outline-none cursor-pointer ${
                              statusBadgeColors[app.status] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {statusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {app.status === "applied" || app.status === "viewed" ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openDecision(app, "approve")}
                              className="px-2.5 py-1 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => openDecision(app, "reject")}
                              className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400">
                        {app.created_at ? new Date(app.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => openResumePreview(app.resume_url, app.id)}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{app.resume_url ? "Preview" : "View"}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No recent job applications found.
            </div>
          )}
        </div>

        {/* Tasks Section */}
        {recentTasks.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Recent Tasks</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{task.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {task.assigned_to_name ? `Assigned to ${task.assigned_to_name} · ` : ""}
                      Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                      task.status === "completed"
                        ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : task.status === "in_progress"
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                    }`}
                  >
                    {String(task.status).replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        <ConfirmDialog
          isOpen={confirmAppDecisionOpen}
          onClose={() => {
            setConfirmAppDecisionOpen(false);
            setDecisionApp(null);
            setDecisionAction(null);
          }}
          onConfirm={confirmDecision}
          message={
            decisionApp
              ? `${decisionAction === "approve" ? "Approve" : "Reject"} application of "${
                  decisionApp.candidate_name
                }" for "${decisionApp.job?.title || "Job"}"?`
              : "Are you sure?"
          }
          confirmText={decisionAction === "approve" ? "Yes, Approve" : "Yes, Reject"}
          cancelText="Cancel"
          modalSpinnerMessage="Processing Please Wait...."
        />

        <ResumePreviewModal
          isOpen={resumePreviewOpen}
          sourceUrl={resumePreviewUrl}
          fallbackUrl={resumePreviewFallbackUrl}
          onClose={() => {
            setResumePreviewOpen(false);
            setResumePreviewUrl(null);
            setResumePreviewFallbackUrl(null);
          }}
        />
      </div>
    </AuthenticatedLayout>
  );
}
