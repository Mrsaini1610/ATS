import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import AuthenticatedLayout from "./Layouts/AuthenticatedLayout";
import DoerCalendar from "@/Components/DoerCalendar";
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
    checkCheckoutToday,
    checkCheckoutList,
}) {
    const isAdmin = auth.guard == "admin";
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        year: initialFilters?.year || new Date().getFullYear(),
        month: initialFilters?.month || new Date().getMonth() + 1,
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

    const handleFilterChange = async (newFilters) => {
        setLoading(true);
        try {
            await router.get(
                route("member.dashboard"),
                { year: newFilters.year, month: newFilters.month },
                {
                    preserveState: true,
                    replace: true,
                    only: ["stats", "recentTasks", "initialFilters"],
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
            [type]: parseInt(value),
        };
        setFilters(newFilters);
        handleFilterChange(newFilters);
    };
    const tasksData = [
        { name: "Completed", value: stats.completedTasks },
        { name: "Pending", value: stats.pendingTasks },
        { name: "In Progress", value: stats.inProgressTasks },
        { name: "Overdue", value: stats.overdueTasks },
    ];
    const COLORS = ["#0088FE", "#FFBB28", "#00C49F", "#FF5733"];
    const BAR_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"];

    return (
        <AuthenticatedLayout>
            <Head title="Task Dashboard" />
            <div className="min-h-screen bg-gray-100 dark:bg-[#0a0e25] text-gray-900 dark:text-white">
                <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <a href={route("member.task.dashboard")}>
                            {" "}
                            <div className="bg-white dark:bg-[#131836] rounded-lg p-6 shadow-sm transition-all hover:shadow-md">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Total Tasks
                                </h3>
                                <h2 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                                    {stats.totalTasks}
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {
                                        monthOptions.find(
                                            (m) => m.value == filters.month
                                        )?.label
                                    }{" "}
                                    {filters.year}
                                </p>
                            </div>
                        </a>
                        <a href={route("member.task.tasklist")}>
                            <div className="bg-white dark:bg-[#131836] rounded-lg p-6 shadow-sm transition-all hover:shadow-md">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Pending Tasks Instances
                                </h3>
                                <h2 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                                    {stats.pendingTasks}
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {
                                        monthOptions.find(
                                            (m) => m.value == filters.month
                                        )?.label
                                    }{" "}
                                    {filters.year}
                                </p>
                            </div>
                        </a>
                        <div className="bg-white dark:bg-[#131836] rounded-lg p-6 shadow-sm transition-all hover:shadow-md">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Completed Tasks Instances
                            </h3>
                            <h2 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                                {stats.completedTasks}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {
                                    monthOptions.find(
                                        (m) => m.value == filters.month
                                    )?.label
                                }{" "}
                                {filters.year}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 mb-6 p-4 bg-white dark:bg-[#131836] rounded-lg shadow-sm">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Filters:
                        </div>
                        <select
                            value={filters.year}
                            onChange={(e) =>
                                updateFilters("year", e.target.value)
                            }
                            className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2"
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
                            className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2"
                            disabled={loading}
                        >
                            {monthOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
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
                        <div className="bg-white dark:bg-[#131836] rounded-lg p-6 shadow-sm">
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
                                            paddingAngle={6}
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
                                <div className="bg-white dark:bg-[#131836] rounded-lg p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                                        Tasks by Department
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
                                        Showing Task Instances distribution
                                        across {stats.tasksByDepartment.length}{" "}
                                        departments for{" "}
                                        {
                                            monthOptions.find(
                                                (m) => m.value == filters.month
                                            )?.label
                                        }{" "}
                                        {filters.year}
                                    </div>
                                </div>
                            )}
                    </div>
                                        <DoerCalendar  />
                    <div className="bg-white dark:bg-[#131836] rounded-lg shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Recent Tasks/Instances
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Showing tasks from{" "}
                                {
                                    monthOptions.find(
                                        (m) => m.value == filters.month
                                    )?.label
                                }{" "}
                                {filters.year}
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Task
                                        </th>
                                        {isAdmin && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Assigned To
                                            </th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Due Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-[#131836] divide-y divide-gray-200 dark:divide-gray-700">
                                    {recentTasks.map((task) => (
                                        <tr
                                            key={task.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {task.title}
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {task.assigned_to_name ||
                                                        "Unassigned"}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(
                                                    task.due_date
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
