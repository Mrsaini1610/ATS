import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import AuthenticatedLayout from "./Layouts/AuthenticatedLayout";
import ConfirmDialog from "@/Components/ConfirmDialog";
import ResumePreviewModal from "@/Components/ResumePreviewModal";
import { useAlerts } from "@/Components/Alerts";
// import ActivityLogSectionAdmin from "@/Components/ActivityLogSectionAdmin";
// import AdminPasswordLogSection from "@/Components/AdminPasswordLogSection";
// import AdminCalendar from "@/Components/AdminCalendar";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
} from "recharts";

export default function Dashboard({
    stats,
    recentTasks,
    auth,
    initialFilters,
    activityLogs,
    members,
    passwordLogs,
    checkCheckoutToday,
    checkCheckoutList,
    jobStats,
}) {
    const isAdmin = auth.guard == "admin";
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

    const { successAlert, errorAlert } = useAlerts();

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

    const [updatingStatusId, setUpdatingStatusId] = useState(null);

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
                console.log(data);
                errorAlert(data?.message || "Failed to update status.");
                return;
            }

            setRecentApplications((prev) =>
                prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a))
            );
            successAlert("Status updated successfully!");
        } catch (e) {
            console.log(e);
            errorAlert("Failed to update status.");
        } finally {
            setUpdatingStatusId(null);
        }
    };

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

    const isPreviewableResume = (url) => {
        const u = String(url || "").toLowerCase();
        return u.endsWith(".pdf") || u.endsWith(".html") || u.includes("generated-resumes");
    };

    const openResumePreview = (url, applicationId) => {
        const resolved = url
            ? (String(url).startsWith("/") || /^https?:\/\//i.test(String(url))
                  ? String(url)
                  : `/${url}`)
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
    const [filters, setFilters] = useState({
        year: initialFilters?.year || new Date().getFullYear(),
        month: initialFilters?.month || new Date().getMonth() + 1,
        member_id: initialFilters?.member_id || null,
    });

    // Generate year options (current year and previous 5 years)
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

    const memberOptions = [
        { value: "", label: "All Members" },
        ...(members || []).map(member => ({
            value: member.id,
            label: member.name
        }))
    ];

    const handleFilterChange = async (newFilters) => {
        setLoading(true);
        try {
            await router.get(
                route("admin.dashboard"),
                {
                    year: newFilters.year,
                    month: newFilters.month,
                    member_id: newFilters.member_id
                },
                {
                    preserveState: true,
                    replace: true,
                    only: ["stats", "recentTasks", "initialFilters", "activityLogs"],
                }
            );
        } catch (error) {
            console.error("Filter change error:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateFilters = (type, value) => {
        const newFilters = {
            ...filters,
            [type]: type === "year" || type === "month" || type === "member_id"
                ? (value === "" ? null : parseInt(value))
                : value,
        };
        setFilters(newFilters);
        handleFilterChange(newFilters);
    };

    // Commented out tasks data
    // const tasksData = [
    //     { name: "Completed", value: stats.completedTasks },
    //     { name: "Pending", value: stats.pendingTasks },
    //     { name: "In Progress", value: stats.inProgressTasks },
    //     { name: "Overdue", value: stats.overdueTasks },
    // ];

    const COLORS = ["#0088FE", "#FFBB28", "#00C49F", "#FF5733"];
    const BAR_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <div className="mt-[75px]">
                <div className="min-h-screen py-[40px] px-[15px]">
                    {/* Member Count Card Only */}
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-8">
                        <div className="cards border borderbx rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Total Members
                                    </h3>
                                    <h2 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                                        {stats?.totalMembers || 0}
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Active members in the system
                                    </p>
                                </div>
                                <div className="taskrunning px-[13px] py-[10px] rounded-lg border">
                                    <svg
                                        className="h-8 w-8 text-[#5146E6]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="cards border borderbx rounded-lg p-4 shadow-sm mt-[30px]">
                        <div className="mb-[20px] py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">
                                    Recent Job Applications
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Applications for your job posts
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => router.visit(route("admin.job.applications.index"))}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                            >
                                View All
                            </button>
                        </div>

                        {Array.isArray(recentApplications) && recentApplications.length > 0 ? (
                            <div className="overflow-x-auto tablebxbg p-[15px] rounded-[15px]">
                                <table className="min-w-full text-black rounded-2xl dark:text-white">
                                    <thead>
                                        <tr className="whitespace-nowrap text-left">
                                            <th className="p-3">Candidate</th>
                                            <th className="p-3">Email</th>
                                            <th className="p-3">Job</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Action</th>
                                            <th className="p-3">Applied</th>
                                            <th className="p-3">Resume</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentApplications.map((app) => (
                                            <tr key={app.id} className="hover:bg-gray-100 dark:hover:bg-[#0a0e25]">
                                                <td className="p-3">{app.candidate_name || "-"}</td>
                                                <td className="p-3">{app.candidate_email || "-"}</td>
                                                <td className="p-3">{app.job?.title || "-"}</td>
                                                <td className="p-3">
                                                    {updatingStatusId === app.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                            <span className="text-xs text-gray-500">Updating...</span>
                                                        </div>
                                                    ) : (
                                                        <select
                                                            value={app.status}
                                                            onChange={(e) => handleStatusChangeDirectly(app, e.target.value)}
                                                            className={`w-full px-2 py-1.5 text-xs font-medium rounded-full border cursor-pointer outline-none ${
                                                                app.status === 'applied' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                                                app.status === 'viewed' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                                                app.status === 'shortlisted' ? 'bg-green-100 text-green-800 border-green-300' :
                                                                app.status === 'assigned_to_calling_member' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
                                                                app.status === 'calling_in_progress' ? 'bg-sky-100 text-sky-800 border-sky-300' :
                                                                app.status === 'calling_approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                                                app.status === 'calling_rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                                                                app.status === 'admin_review' ? 'bg-violet-100 text-violet-800 border-violet-300' :
                                                                app.status === 'offer_letter_generated' ? 'bg-teal-100 text-teal-800 border-teal-300' :
                                                                app.status === 'waiting_list' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                                                app.status === 'hired' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                                                                app.status === 'not_selected' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                                                app.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                                                                'bg-gray-100 text-gray-800 border-gray-300'
                                                            }`}
                                                        >
                                                            {statusOptions.map(opt => (
                                                                <option key={opt.value} value={opt.value}>
                                                                    {opt.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    {app.status === "applied" || app.status === "viewed" ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => openDecision(app, "approve")}
                                                                className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => openDecision(app, "reject")}
                                                                className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    {app.created_at ? new Date(app.created_at).toLocaleString("en-US") : "-"}
                                                </td>
                                                <td className="p-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openResumePreview(
                                                                app.resume_url,
                                                                app.id
                                                            )
                                                        }
                                                        className="text-blue-600 hover:underline font-medium"
                                                    >
                                                        {app.resume_url ? "Preview" : "Generated Preview"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                No recent job applications.
                            </div>
                        )}
                    </div>

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
                                ? `${decisionAction === "approve" ? "Approve" : "Reject"} application of "${decisionApp.candidate_name}" for "${decisionApp.job?.title || "Job"}"?`
                                : "Are you sure?"
                        }
                        confirmText={
                            decisionAction === "approve"
                                ? "Yes, Approve"
                                : "Yes, Reject"
                        }
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

                    {/* Commented out all other sections */}
                    {/*
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <a href={route("admin.task.dashboard", {
                            member_id: initialFilters?.member_id,
                        })}>
                            <div className="cards border borderbx rounded-lg p-4 shadow-sm">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Total Tasks
                                </h3>
                                <h2 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                                    {stats.totalTasks}
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {
                                        monthOptions.find(
                                            (m) => m.value === filters.month
                                        )?.label
                                    }{" "}
                                    {filters.year}
                                </p>
                            </div>
                        </a>
                        <a href={route("admin.task.tasklist", {
                            member_id: initialFilters?.member_id, status: "pending"
                        })}>
                            <div className="cards border borderbx rounded-lg p-4 shadow-sm">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Total Department Pending Tasks Instances
                                </h3>
                                <h2 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                                    {stats.pendingTasks}
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {
                                        monthOptions.find(
                                            (m) => m.value === filters.month
                                        )?.label
                                    }{" "}
                                    {filters.year}
                                </p>
                            </div>
                        </a>
                        <div className="cards border borderbx rounded-lg p-4 shadow-sm">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Total Department Completed Tasks Instances
                            </h3>
                            <h2 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                                {stats.completedTasks}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {
                                    monthOptions.find(
                                        (m) => m.value === filters.month
                                    )?.label
                                }{" "}
                                {filters.year}
                            </p>
                        </div>
                    </div>

                    <div className="cards border borderbx rounded-lg p-4 shadow-sm">
                        <div className="flex flex-col gap-[5px] sm:flex-row items-center mb-6 pb-[15px] border-b-[1px] border-b-[#5146E64D]">
                            <div className="w-full sm:w-auto text-lg font-semibold text-second-color">
                                Filters:
                            </div>
                            <select
                                value={filters.year}
                                onChange={(e) =>
                                    updateFilters("year", e.target.value)
                                }
                                className="w-full sm:w-auto sm:min-w-[120px] text-sm selectbg border rounded-md px-3 py-2"
                                disabled={loading}
                            >
                                {yearOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filters.month}
                                onChange={(e) =>
                                    updateFilters("month", e.target.value)
                                }
                                className="w-full sm:w-auto sm:min-w-[120px] text-sm selectbg border rounded-md px-3 py-2"
                                disabled={loading}
                            >
                                {monthOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {isAdmin && (
                                <select
                                    value={filters.member_id || ""}
                                    onChange={(e) => updateFilters("member_id", e.target.value)}
                                    className="w-full sm:w-auto min-w-[180px] text-sm selectbg border rounded-md px-3 py-2"
                                    disabled={loading}
                                >
                                    {memberOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {loading && (
                                <svg
                                    className="animate-spin h-5 w-5 text-gray-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <div className="cards border borderbx rounded-lg p-4 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                                    Tasks Instances Overview
                                </h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={tasksData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) =>
                                                    `${name}: ${(
                                                        percent * 100
                                                    ).toFixed(0)}%`
                                                }
                                            >
                                                {tasksData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            COLORS[
                                                                index %
                                                                    COLORS.length
                                                            ]
                                                        }
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#1e293b",
                                                    borderColor: "#334155",
                                                    borderRadius: "0.5rem",
                                                }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {isAdmin &&
                                stats.tasksByDepartment &&
                                stats.tasksByDepartment.length > 0 && (
                                    <div className="cards border borderbx rounded-lg p-4 shadow-sm">
                                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                                            Tasks Instances by Department
                                        </h3>
                                        <div className="h-80">
                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <BarChart
                                                    data={stats.tasksByDepartment}
                                                    margin={{
                                                        top: 20,
                                                        right: 30,
                                                        left: 20,
                                                        bottom: 5,
                                                    }}
                                                    layout="vertical"
                                                >
                                                    <XAxis
                                                        type="number"
                                                        tick={{
                                                            fill: "#6b7280",
                                                            stroke: "transparent",
                                                        }}
                                                        axisLine={{
                                                            stroke: "#6b7280",
                                                            strokeWidth: 0.5,
                                                        }}
                                                    />
                                                    <YAxis
                                                        dataKey="name"
                                                        type="category"
                                                        width={120}
                                                        tick={{
                                                            fill: "#6b7280",
                                                            stroke: "transparent",
                                                            fontSize: 12,
                                                        }}
                                                        axisLine={{
                                                            stroke: "#6b7280",
                                                            strokeWidth: 0.5,
                                                        }}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor:
                                                                "#1e293b",
                                                            borderColor: "#334155",
                                                            borderRadius: "0.5rem",
                                                            color: "#f3f4f6",
                                                        }}
                                                        itemStyle={{
                                                            color: "#f3f4f6",
                                                        }}
                                                        labelStyle={{
                                                            color: "#f3f4f6",
                                                            fontWeight: "bold",
                                                        }}
                                                    />
                                                    <Legend
                                                        wrapperStyle={{
                                                            color: "#6b7280",
                                                            paddingTop: "20px",
                                                        }}
                                                    />
                                                    <Bar
                                                        dataKey="value"
                                                        name="Tasks"
                                                        radius={[0, 4, 4, 0]}
                                                        label={{
                                                            position: "right",
                                                            fill: "#6b7280",
                                                            fontSize: 12,
                                                            formatter: (value) =>
                                                                value > 0
                                                                    ? value
                                                                    : "",
                                                        }}
                                                    >
                                                        {stats.tasksByDepartment.map(
                                                            (entry, index) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={
                                                                        BAR_COLORS[
                                                                            index %
                                                                                BAR_COLORS.length
                                                                        ]
                                                                    }
                                                                    strokeWidth={1}
                                                                />
                                                            )
                                                        )}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                                            Showing task distribution across{" "}
                                            {stats.tasksByDepartment.length}{" "}
                                            departments for{" "}
                                            {
                                                monthOptions.find(
                                                    (m) => m.value === filters.month
                                                )?.label
                                            }{" "}
                                            {filters.year}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>

                    <div className="cards border borderbx rounded-lg p-4 shadow-sm mt-[30px]">
                        <div className="mb-[20px] py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                                Recent Tasks
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Showing tasks from{" "}
                                {
                                    monthOptions.find(
                                        (m) => m.value === filters.month
                                    )?.label
                                }{" "}
                                {filters.year}
                            </p>
                        </div>
                        <div className="overflow-x-auto tablebxbg p-[15px] rounded-[15px]">
                            <table className="min-w-full text-black rounded-2xl dark:text-white">
                                <thead className="">
                                    <tr className="whitespace-nowrap text-left">
                                        <th className="p-3">Task</th>
                                        {isAdmin && (
                                            <th className="p-3">Assigned To</th>
                                        )}
                                        <th className="p-3">Due Date</th>
                                        <th className="p-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="">
                                    {recentTasks.map((task) => (
                                        <tr
                                            key={task.id}
                                            className="hover:bg-gray-100 dark:hover:bg-[#0a0e25]"
                                        >
                                            <td className="p-3">
                                                {task.title}
                                            </td>
                                            {isAdmin && (
                                                <td className="p-3">
                                                    {task.assigned_to_name ||
                                                        "Unassigned"}
                                                </td>
                                            )}
                                            <td className="p-3">
                                                {new Date(
                                                    task.due_date
                                                ).toLocaleDateString()}
                                            </td>
                                            <td align="center" className="px-6 py-4 whitespace-nowrap text-center">
                                                <span
                                                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        task.status ==
                                                        "completed"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                            : task.status ==
                                                              "in_progress"
                                                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                    }`}
                                                >
                                                    {task.status
                                                        .split("_")
                                                        .map(
                                                            (word) =>
                                                                word
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                word.slice(1)
                                                        )
                                                        .join(" ")}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <AdminCalendar />
                    {activityLogs && (
                        <ActivityLogSectionAdmin activityLogs={activityLogs} />
                    )}
                    <AdminPasswordLogSection passwordLogs={passwordLogs} auth={auth} />
                    */}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
