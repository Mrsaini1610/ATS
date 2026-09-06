import React from "react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";
import { Head, Link, usePage } from "@inertiajs/react";
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
} from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color, href }) {
  const content = (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {href && <ChevronRight className="w-4 h-4 text-gray-400" />}
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-sm font-bold text-gray-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs font-semibold text-gray-400 mt-1">{sub}</p>}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export default function Dashboard({
  stats = {},
  recentApplications = [],
  pendingJobsList = [],
  tasks = [],
}) {
  const { auth } = usePage().props;
  const admin = auth?.admin;

  // Role extraction (super_admin, admin, team_member)
  const role = admin?.role || "team_member";
  const isSuperAdmin = role === "super_admin";
  const isAdmin = role === "admin";
  const isTeamMember = role === "team_member";
  const canManagePlatform = isSuperAdmin || isAdmin;

  // Safe Stats Fallbacks
  const pendingJobs = stats.pendingJobs ?? 0;
  const activeJobs = stats.activeJobs ?? 0;
  const totalUsers = stats.totalUsers ?? 0;
  const totalCompanies = stats.totalCompanies ?? 0;
  const totalApps = stats.totalApps ?? 0;
  const shortlisted = stats.shortlisted ?? 0;
  const scheduledInterviews = stats.scheduledInterviews ?? 0;
  const pendingTasks = stats.pendingTasks ?? 0;
  const hired = stats.hired ?? 0;

  const statusColor = {
    applied: "bg-gray-100 text-gray-700 font-bold",
    reviewed: "bg-blue-50 text-blue-700 font-bold",
    shortlisted: "bg-yellow-50 text-yellow-700 font-bold",
    interview_scheduled: "bg-purple-50 text-purple-700 font-bold",
    hired: "bg-green-50 text-green-800 font-bold",
    rejected: "bg-red-50 text-red-700 font-bold",
    not_interested: "bg-gray-100 text-gray-600 font-bold",
  };

  const taskPriorityColor = {
    high: "text-red-700 bg-red-50 font-bold",
    medium: "text-yellow-700 bg-yellow-50 font-bold",
    low: "text-green-700 bg-green-50 font-bold",
  };

  return (
    <>
      <Head title={`${role.replace("_", " ").toUpperCase()} Dashboard - ATS`} />

      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
              Welcome back, {admin?.name ? admin.name.split(" ")[0] : "User"}! 👋
            </h1>
            <p className="text-sm font-semibold text-gray-500 mt-0.5">
              {isTeamMember
                ? "Here are your calling queue and candidate follow-ups for today."
                : "Here's what's happening on ATS Recruitment Platform today."}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-gray-500">🇮🇳 ATS Technologies</p>
            <p className="text-xs font-semibold text-gray-400 mt-0.5">August 2026</p>
          </div>
        </div>

        {/* Stats Grid - Role based conditions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {canManagePlatform && (
            <>
              <StatCard
                icon={AlertTriangle}
                label="Pending Jobs"
                value={pendingJobs}
                sub="Awaiting review"
                color="bg-yellow-500"
                href="/admin/jobs"
              />
              <StatCard
                icon={Briefcase}
                label="Active Jobs"
                value={activeJobs}
                sub="Live on platform"
                color="bg-blue-600"
                href="/admin/jobs"
              />
              <StatCard
                icon={Users}
                label="Total Users"
                value={totalUsers}
                sub="Registered candidates"
                color="bg-indigo-600"
                href="/admin/users"
              />
              <StatCard
                icon={Building2}
                label="Companies"
                value={totalCompanies}
                sub="Active employers"
                color="bg-teal-600"
                href="/admin/companies"
              />
            </>
          )}

          <StatCard
            icon={ClipboardList}
            label="Applications"
            value={totalApps}
            sub={`${shortlisted} shortlisted`}
            color="bg-purple-600"
            href="/admin/applications"
          />
          <StatCard
            icon={Calendar}
            label="Interviews Scheduled"
            value={scheduledInterviews}
            sub="Upcoming"
            color="bg-orange-500"
            href="/admin/interviews"
          />
          <StatCard
            icon={CheckCircle2}
            label="Hired"
            value={hired}
            sub="This month"
            color="bg-green-600"
            href="/admin/applications"
          />

          {canManagePlatform && (
            <StatCard
              icon={TrendingUp}
              label="Active Tasks"
              value={pendingTasks}
              sub="In progress"
              color="bg-pink-600"
              href="/admin/tasks"
            />
          )}
        </div>

        {/* Middle Tables Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending Approvals: Only Super Admin & Admin */}
          {canManagePlatform && (
            <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" /> Pending Approvals
                </h3>
                <Link href="/admin/jobs" className="text-xs font-bold text-blue-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {pendingJobsList.length === 0 ? (
                  <p className="text-center py-6 text-xs font-medium text-gray-400">
                    No pending approvals.
                  </p>
                ) : (
                  pendingJobsList.map((job) => (
                    <div key={job.id} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{job.title}</p>
                        <p className="text-xs font-medium text-gray-500">
                          {job.company} · {job.location}
                        </p>
                      </div>
                      <Link
                        href="/admin/jobs"
                        className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 shrink-0"
                      >
                        Review
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Recent Applications Table */}
          <div
            className={`${
              canManagePlatform ? "lg:col-span-2" : "lg:col-span-3"
            } bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm`}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-black text-gray-900 text-sm">Recent Applications</h3>
              <Link href="/admin/applications" className="text-xs font-bold text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-600">Candidate</th>
                    <th className="text-left px-3 py-3 text-xs font-bold text-gray-600">Job</th>
                    <th className="text-left px-3 py-3 text-xs font-bold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentApplications.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-6 text-xs font-medium text-gray-400">
                        No recent records available.
                      </td>
                    </tr>
                  ) : (
                    recentApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-bold text-gray-900">{app.userName}</p>
                          <p className="text-xs font-medium text-gray-500">{app.userCity}</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-gray-800 font-bold truncate max-w-[140px]">{app.jobTitle}</p>
                          <p className="text-xs font-medium text-gray-500">{app.company}</p>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full capitalize ${
                              statusColor[app.status] || "bg-gray-100 text-gray-600 font-bold"
                            }`}
                          >
                            {(app.status || "").replace(/_/g, " ")}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        {tasks.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-black text-gray-900 text-sm">
                {isTeamMember ? "My Tasks" : "Active Tasks"}
              </h3>
              <Link href="/admin/tasks" className="text-xs font-bold text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-gray-900">{task.title}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          taskPriorityColor[task.priority] || "text-gray-700 bg-gray-50 font-bold"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-500">
                      {!isTeamMember && task.assignedToName && `Assigned to: ${task.assignedToName} · `}
                      Due {task.dueDate}
                    </p>
                  </div>

                  {task.targetCount && (
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-gray-900">
                        {task.completedCount}/{task.targetCount}
                      </p>
                      <div className="w-20 bg-gray-100 rounded-full h-1.5 mt-1">
                        <div
                          className="h-1.5 bg-blue-600 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              ((task.completedCount || 0) / task.targetCount) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full capitalize shrink-0 font-bold ${
                      task.status === "done"
                        ? "bg-green-50 text-green-700"
                        : task.status === "in_progress"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {(task.status || "").replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/admin/applications", icon: ClipboardList, label: "Review Applications", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
            { href: "/admin/interviews", icon: Calendar, label: "Schedule Interview", color: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
            { href: "/admin/users", icon: Users, label: "Add New User", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
            { href: "/admin/jobs", icon: Briefcase, label: "Moderate Jobs", color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" },
          ].map((q) => (
            <Link
              key={q.label}
              href={q.href}
              className={`flex items-center gap-2.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-colors ${q.color}`}
            >
              <q.icon className="w-4 h-4 shrink-0" />
              {q.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

Dashboard.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;