import { Head, router } from "@inertiajs/react";
import { useState, useRef } from "react";
import ActivityLogSection from "@/Components/ActivityLogSection";
import PasswordLogSection from "@/Components/PasswordLogSection";
import ImageActionLogSection from "@/Components/ImageActionLogSection";
import Calendar from "@/Components/Calendar";
import ConfirmDialog from "@/Components/ConfirmDialog";
import ResumePreviewModal from "@/Components/ResumePreviewModal";
import { useAlerts } from "@/Components/Alerts";

import {
    FaTasks,
    FaCalendarAlt,
    FaCheckCircle,
    FaExclamationTriangle,
    FaChartPie,
    FaChartBar,
    FaFileExport,
    FaPrint,
    FaUsers,
    FaUserTie,
    FaBuilding,
} from "react-icons/fa";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";
import AuthenticatedLayout from "./Layouts/AuthenticatedLayout";

const CHART_COLORS = {
    primary: "#3b82f6",
    primaryDark: "#1d4ed8",
    success: "#10b981",
    successDark: "#059669",
    warning: "#f59e0b",
    warningDark: "#d97706",
    danger: "#ef4444",
    dangerDark: "#dc2626",
    info: "#06b6d4",
    infoDark: "#0891b2",
    gray: "#6b7280",
    grayLight: "#f3f4f6",
};

const chartTheme = {
    colors: CHART_COLORS,
    fontFamily:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 12,
    axis: {
        tickColor: CHART_COLORS.gray,
        tickLine: false,
    },
    grid: {
        stroke: CHART_COLORS.grayLight,
        strokeDasharray: "3 3",
    },
    tooltip: {
        backgroundColor: "white",
        border: "none",
        borderRadius: "6px",
        boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    },
    legend: {
        wrapperStyle: {
            paddingTop: "10px",
            fontSize: "12px",
        },
    },
};

const TASK_TYPE_COLORS = {
    one_time: CHART_COLORS.primary,
    recurring: CHART_COLORS.success,
};

export default function Dashboard({
    statsData,
    auth,
    stats,
    activityLogs,
    members,
    passwordLogs,
    imageActionLogs,
}) {
    const [activeTab, setActiveTab] = useState("monthly");
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        year: stats.tasks.filter?.year || new Date().getFullYear(),
        month: stats.tasks.filter?.month || new Date().getMonth() + 1,
        member_id: stats.tasks.filter?.member_id || null,
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
    const memberOptions = [
        { value: "", label: "All Members" },
        ...(members || []).map((member) => ({
            value: member.id,
            label: member.name,
        })),
    ];

    const [recentApplications, setRecentApplications] = useState(
        Array.isArray(stats.jobs?.recentApplications)
            ? stats.jobs.recentApplications
            : []
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
                route("super.job.requests.api.applications.decision", decisionApp.id),
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
                route("super.job.applications.api.status", app.id),
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
            ? route("super.job.applications.api.resume-preview", applicationId)
            : null;

        if (resolved && !isPreviewableResume(resolved)) {
            window.open(resolved, "_blank");
            return;
        }

        setResumePreviewUrl(resolved);
        setResumePreviewFallbackUrl(fallbackUrl);
        setResumePreviewOpen(true);
    };
    const handleFilterChange = async (year, month, member_id) => {
        setLoading(true);
        try {
            await router.get(
                route("super.dashboard"),
                { year, month, member_id },
                {
                    preserveState: true,
                    replace: true,
                    only: ["stats"],
                }
            );
            setFilters({ year, month, member_id });
        } catch (error) {
            console.error("Filter change error:", error);
        } finally {
            setLoading(false);
        }
    };
    const updateFilters = (type, value) => {
        const newFilters = {
            ...filters,
            [type]:
                type === "year" || type === "month" || type === "member_id"
                    ? value === ""
                        ? null
                        : parseInt(value)
                    : value,
        };
        setFilters(newFilters);
        const debounceTimer = setTimeout(() => {
            handleFilterChange(
                newFilters.year,
                newFilters.month,
                newFilters.member_id
            );
        }, 300);
        return () => clearTimeout(debounceTimer);
    };
    const taskTypeData = Object.entries(stats.tasks.types || {}).map(
        ([name, value]) => ({
            name: name == "one_time" ? "One Time" : "Recurring",
            value,
            color: TASK_TYPE_COLORS[name],
        })
    );
    const exportRef = useRef();
    const handleExport = (type = "print") => {
        const selectedYear =
            yearOptions.find((opt) => opt.value === filters.year)?.label ||
            filters.year;
        const selectedMonth =
            monthOptions.find((opt) => opt.value === filters.month)?.label ||
            filters.month;
        const selectedMember =
            memberOptions.find((opt) => opt.value === filters.member_id)
                ?.label || "All Members";
        const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Dashboard Report</title>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .filters { margin-bottom: 20px; padding: 10px; background: #f5f5f5; border-radius: 5px; }
                .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; }
                .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
                .chart-section { margin-bottom: 30px; }
                .chart-title { font-weight: bold; margin-bottom: 10px; }
                .chart-container { position: relative; height: 300px; margin-bottom: 20px; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
                .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Task Management Dashboard Report</h1>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="filters">
                <h3>Applied Filters:</h3>
                <p><strong>Year:</strong> ${selectedYear}</p>
                <p><strong>Month:</strong> ${selectedMonth}</p>
                <p><strong>Member:</strong> ${selectedMember}</p>
            </div>

            <div class="stats-grid">
                // <div class="stat-card">
                //     <h4>Total Tasks</h4>
                //     <p>${stats.tasks.total || "No Data Available"}</p>
                // </div>
                // <div class="stat-card">
                //     <h4>Closed Tasks</h4>
                //     <p>${stats.tasks.completed || "No Data Available"}</p>
                // </div>
                <div class="stat-card">
                    <h4>Active Staff</h4>
                    <p>${stats.staff.count || "No Data Available"}</p>
                </div>
                <div class="stat-card">
                    <h4>Departments</h4>
                    <p>${stats.departments.count || "No Data Available"}</p>
                </div>
                // <div class="stat-card">
                //     <h4>Overdue Tasks</h4>
                //     <p>${stats.tasks.overdue || "No Data Available"}</p>
                // </div>
            </div>



            <div class="footer">
                <p>Report generated from Task Management System</p>
            </div>

            <div class="no-print">
                <button onclick="window.print()">Print Now</button>
                <button onclick="window.close()">Close</button>
            </div>

            <script>
                document.addEventListener('DOMContentLoaded', function() {
                    // Task Type Distribution Chart
                    const typeCtx = document.getElementById('typeChart').getContext('2d');
                    new Chart(typeCtx, {
                        type: 'pie',
                        data: {
                            labels: ${JSON.stringify(
                                taskTypeData.map((d) => d.name)
                            )},
                            datasets: [{
                                data: ${JSON.stringify(
                                    taskTypeData.map((d) => d.value)
                                )},
                                backgroundColor: ${JSON.stringify(
                                    taskTypeData.map((d) => d.color)
                                )},
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom'
                                },
                                title: {
                                    display: true,
                                    text: 'Task Type Distribution'
                                }
                            }
                        }
                    });
                    setTimeout(() => {
                        window.print();
                    }, 1000);
                });
            </script>
        </body>
        </html>
    `;
        if (type === "print") {
            const printWindow = window.open("", "_blank");
            printWindow.document.write(printContent);
            printWindow.document.close();
        } else {
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            document.body.appendChild(iframe);

            const iframeDoc =
                iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.write(printContent);
            iframeDoc.close();
            iframe.onload = function () {
                const checkChartsLoaded = () => {
                    const iframeWindow = iframe.contentWindow;
                    if (iframeWindow.chartsLoaded) {
                        const element = iframeDoc.body;
                        const opt = {
                            margin: 10,
                            filename: `dashboard-report-${
                                new Date().toISOString().split("T")[0]
                            }.pdf`,
                            image: { type: "jpeg", quality: 0.98 },
                            html2canvas: {
                                scale: 2,
                                useCORS: true,
                                logging: true,
                                onclone: function (clonedDoc) {
                                    const charts =
                                        clonedDoc.querySelectorAll("canvas");
                                    charts.forEach((chart) => {
                                        chart.style.width = "100%";
                                        chart.style.height = "300px";
                                    });
                                },
                            },
                            jsPDF: {
                                unit: "mm",
                                format: "a4",
                                orientation: "portrait",
                            },
                        };
                        html2pdf()
                            .set(opt)
                            .from(element)
                            .save()
                            .then(() => {
                                document.body.removeChild(iframe);
                            });
                    } else {
                        setTimeout(checkChartsLoaded, 100);
                    }
                };
                checkChartsLoaded();
            };
        }
    };
    // const GlobalFilters = () => (
    //     <div className="flex flex-col gap-[5px] sm:flex-row items-center mb-6 pb-[15px] border-b-[1px] border-b-[#5146E64D]">
    //         <div className="w-full sm:w-auto text-lg font-semibold text-second-color">
    //             Filters:
    //         </div>
    //         <select
    //             value={filters.year}
    //             onChange={(e) => updateFilters("year", e.target.value)}
    //             className="w-full sm:w-auto sm:min-w-[120px] text-sm selectbg border rounded-md px-3 py-2"
    //             disabled={loading}
    //         >
    //             {yearOptions.map((option) => (
    //                 <option key={option.value} value={option.value}>
    //                     {option.label}
    //                 </option>
    //             ))}
    //         </select>
    //         <select
    //             value={filters.month}
    //             onChange={(e) => updateFilters("month", e.target.value)}
    //             className="w-full sm:w-auto min-w-[120px] text-sm selectbg border rounded-md px-3 py-2"
    //             disabled={loading}
    //         >
    //             {monthOptions.map((option) => (
    //                 <option key={option.value} value={option.value}>
    //                     {option.label}
    //                 </option>
    //             ))}
    //         </select>
    //         <select
    //             value={filters.member_id || ""}
    //             onChange={(e) => updateFilters("member_id", e.target.value)}
    //             className="w-full sm:w-auto min-w-[180px] text-sm selectbg border rounded-md px-3 py-2"
    //             disabled={loading}
    //         >
    //             {memberOptions.map((option) => (
    //                 <option key={option.value} value={option.value}>
    //                     {option.label}
    //                 </option>
    //             ))}
    //         </select>
    //         <div className="flex gap-2">
    //             <button
    //                 onClick={() => handleExport("print")}
    //                 className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
    //                 title="Print Report"
    //             >
    //                 <FaPrint size={14} />
    //                 <span>Print</span>
    //             </button>
    //         </div>
    //         {loading && (
    //             <svg
    //                 className="animate-spin h-5 w-5 text-gray-500"
    //                 xmlns="http://www.w3.org/2000/svg"
    //                 fill="none"
    //                 viewBox="0 0 24 24"
    //             >
    //                 <circle
    //                     className="opacity-25"
    //                     cx="12"
    //                     cy="12"
    //                     r="10"
    //                     stroke="currentColor"
    //                     strokeWidth="4"
    //                 ></circle>
    //                 <path
    //                     className="opacity-75"
    //                     fill="currentColor"
    //                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    //                 ></path>
    //             </svg>
    //         )}
    //     </div>
    // );
    const ChartHeader = ({ title, icon }) => (
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {title}
            </h3>
            {icon}
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <div className="mt-[75px]">
                <div className="min-h-screen py-[40px] px-[15px]">
                    {/* First Row - Core Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
                        {/* Total Active Staff Card */}
                        <div className="cards border borderbx rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="w-0 flex-1">
                                    <dt className="text-[14px] font-[400] text-prime-color uppercase">
                                        Total Active Staff
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                                            {stats.staff.count || (
                                                <span className="text-[15px] font-semibold text-second-color">
                                                    No Data Available
                                                </span>
                                            )}
                                        </div>
                                    </dd>
                                </div>
                                <div className="taskrunning px-[13px] py-[10px] rounded-lg border">
                                    <FaUsers size={20} className="text-[#5146E6]" />
                                </div>
                            </div>
                        </div>

                        {/* Total Departments Card */}
                        <div className="cards border borderbx rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="w-0 flex-1">
                                    <dt className="text-[14px] font-[400] text-prime-color uppercase">
                                        Departments
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                                            {stats.departments.count || (
                                                <span className="text-[15px] font-semibold text-second-color">
                                                    No Data Available
                                                </span>
                                            )}
                                        </div>
                                    </dd>
                                </div>
                                <div className="taskrunning px-[13px] py-[10px] rounded-lg border">
                                    <FaBuilding size={20} className="text-[#5146E6]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Second Row - Additional Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {/* Total Roles Card */}
                        <div className="cards border borderbx rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[14px] font-[400] text-prime-color uppercase">
                                        Total Roles
                                    </p>
                                    <h3 className="text-[30px] font-[500] text-second-color mt-1">
                                        {stats.roles?.count || (
                                            <span className="text-[15px] font-semibold text-second-color">
                                                No Data Available
                                            </span>
                                        )}
                                    </h3>
                                </div>
                                <div className="taskrunning px-[13px] py-[10px] rounded-lg border">
                                    <FaUserTie className="text-[#5146E6]" size={20} />
                                </div>
                            </div>
                        </div>

                        {/* Total Designations Card */}
                        <div className="cards border borderbx rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[14px] font-[400] text-prime-color uppercase">
                                        Total Designations
                                    </p>
                                    <h3 className="text-[30px] font-[500] text-second-color mt-1">
                                        {stats.designations?.count || (
                                            <span className="text-[15px] font-semibold text-second-color">
                                                No Data Available
                                            </span>
                                        )}
                                    </h3>
                                </div>
                                <div className="taskrunning px-[13px] py-[10px] rounded-lg border">
                                    <svg
                                        className="h-6 w-6 text-[#5146E6]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Total Members Card */}
                        <div className="cards border borderbx rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[14px] font-[400] text-prime-color uppercase">
                                        Total Members
                                    </p>
                                    <h3 className="text-[30px] font-[500] text-second-color mt-1">
                                        {stats.members?.count || (
                                            <span className="text-[15px] font-semibold text-second-color">
                                                No Data Available
                                            </span>
                                        )}
                                    </h3>
                                </div>
                                <div className="taskrunning px-[13px] py-[10px] rounded-lg border">
                                    <FaUsers size={20} className="text-[#5146E6]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
                        <div
                            className="cards border borderbx rounded-lg p-4 shadow-sm cursor-pointer"
                            onClick={() => router.visit(route("super.job.requests.all.jobs"))}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[14px] font-[400] text-prime-color uppercase">
                                        Total Jobs
                                    </p>
                                    <h3 className="text-[30px] font-[500] text-second-color mt-1">
                                        {stats.jobs?.count ?? (
                                            <span className="text-[15px] font-semibold text-second-color">
                                                No Data Available
                                            </span>
                                        )}
                                    </h3>
                                </div>
                                <div className="taskrunning px-[13px] py-[10px] rounded-lg border">
                                    <FaChartBar size={20} className="text-[#5146E6]" />
                                </div>
                            </div>
                            <div className="mt-2 text-[12px] text-[#5146E6] font-medium">
                                View all job posts
                            </div>
                        </div>

                        <div
                            className="cards border borderbx rounded-lg p-4 shadow-sm cursor-pointer"
                            onClick={() => router.visit(route("super.job.applications.index"))}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[14px] font-[400] text-prime-color uppercase">
                                        Total Job Applicants
                                    </p>
                                    <h3 className="text-[30px] font-[500] text-second-color mt-1">
                                        {stats.jobs?.applicationsCount ?? (
                                            <span className="text-[15px] font-semibold text-second-color">
                                                No Data Available
                                            </span>
                                        )}
                                    </h3>
                                </div>
                                <div className="taskrunning px-[13px] py-[10px] rounded-lg border">
                                    <FaUsers size={20} className="text-[#5146E6]" />
                                </div>
                            </div>
                            <div className="mt-2 text-[12px] text-[#5146E6] font-medium">
                                View applicants list
                            </div>
                        </div>
                    </div>

                    <div
                        id="job-applications"
                        className="cards border borderbx rounded-lg p-4 shadow-sm mb-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                Recent Job Applications
                            </h3>
                            <button
                                type="button"
                                onClick={() => router.visit(route("super.job.applications.index"))}
                                className="px-4 py-2 rounded-lg bg-[#5146E6] text-white text-sm font-medium hover:bg-[#4338CA]"
                            >
                                View All
                            </button>
                        </div>

                        {Array.isArray(recentApplications) &&
                        recentApplications.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-slate-500">
                                            <th className="py-2 pr-3 font-medium">
                                                Candidate
                                            </th>
                                            <th className="py-2 pr-3 font-medium">
                                                Email
                                            </th>
                                            <th className="py-2 pr-3 font-medium">
                                                Job
                                            </th>
                                            <th className="py-2 pr-3 font-medium">
                                                Status
                                            </th>
                                            <th className="py-2 pr-3 font-medium">
                                                Action
                                            </th>
                                            <th className="py-2 pr-3 font-medium">
                                                Applied
                                            </th>
                                            <th className="py-2 font-medium">
                                                Resume
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {recentApplications.map((app) => (
                                            <tr
                                                key={app.id}
                                                className="align-top"
                                            >
                                                <td className="py-2 pr-3 text-slate-800">
                                                    {app.candidate_name || "-"}
                                                </td>
                                                <td className="py-2 pr-3">
                                                    {app.candidate_email || "-"}
                                                </td>
                                                <td className="py-2 pr-3">
                                                    {app.job?.title || "-"}
                                                </td>
                                                <td className="py-2 pr-3">
                                                    {updatingStatusId === app.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                            <span className="text-xs text-slate-500">Updating...</span>
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
                                                <td className="py-2 pr-3">
                                                    {app.status === "applied" || app.status === "viewed" ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openDecision(
                                                                        app,
                                                                        "approve"
                                                                    )
                                                                }
                                                                className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                                                            >
                                                                Shortlist
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openDecision(
                                                                        app,
                                                                        "reject"
                                                                    )
                                                                }
                                                                className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2 pr-3">
                                                    {app.created_at
                                                        ? new Date(
                                                              app.created_at
                                                          ).toLocaleString(
                                                              "en-US"
                                                          )
                                                        : "-"}
                                                </td>
                                                <td className="py-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openResumePreview(
                                                                app.resume_url,
                                                                app.id
                                                            )
                                                        }
                                                        className="text-[#5146E6] hover:underline font-medium"
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
                            <div className="text-sm text-slate-500">
                                No applications yet.
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

                    <ActivityLogSection activityLogs={activityLogs} />
                    <PasswordLogSection
                        passwordLogs={passwordLogs}
                        auth={auth}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
