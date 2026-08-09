import AuthenticatedLayout from "../Layouts/AuthenticatedLayout";
import { Head, usePage, Link, router } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import NoData from "@/Components/NoData";

export default function MemberDetails({ auth }) {
    const { member, tasks, task_instances, filters } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [statusFilter, setStatusFilter] = useState(filters.status || "");
    const [dateRange, setDateRange] = useState(filters.date_range || "");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [expandedTask, setExpandedTask] = useState(null);
    const datePickerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setShowDatePicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== filters.search || statusFilter !== filters.status || dateRange !== filters.date_range) {
                router.get(
                    route("super.members.details", member.uuid),
                    {
                        search: searchTerm,
                        status: statusFilter,
                        date_range: dateRange
                    },
                    { preserveState: true, replace: true }
                );
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, dateRange]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date)) return "Invalid Date";
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const statusClasses = {
        pending: "bg-yellow-100 text-yellow-800",
        in_progress: "bg-blue-100 text-blue-800",
        running: "bg-blue-100 text-blue-800",
        completed: "bg-green-100 text-green-800",
        overdue: "bg-red-100 text-red-800",
        closed: "bg-gray-100 text-gray-800"
    };

    const statusIcons = {
        pending: "⏳",
        in_progress: "🔄",
        running: "🏃‍♂️",
        completed: "✅",
        overdue: "⚠️",
        closed: "🔒"
    };

    const toggleTaskExpansion = (taskUuid) => {
        setExpandedTask(expandedTask === taskUuid ? null : taskUuid);
    };

    const resetFilters = () => {
        setSearchTerm("");
        setStatusFilter("");
        setDateRange("");
    };
     const handleBack = () => {
        router.get(route('super.members.list'));
    };

    const handleDateRangeChange = (startDate, endDate) => {
        if (startDate && endDate) {
            const formattedStart = startDate.toISOString().split('T')[0];
            const formattedEnd = endDate.toISOString().split('T')[0];
            setDateRange(`${formattedStart} to ${formattedEnd}`);
        } else {
            setDateRange("");
        }
        setShowDatePicker(false);
    };

    const CustomDatePicker = ({ onSelect }) => {
        const [startDate, setStartDate] = useState("");
        const [endDate, setEndDate] = useState("");

        const handleApply = () => {
            if (startDate && endDate) {
                onSelect(new Date(startDate), new Date(endDate));
            } else {
                onSelect(null, null);
            }
        };

        const handleClear = () => {
            setStartDate("");
            setEndDate("");
            onSelect(null, null);
        };

        return (
            <div className="absolute z-10 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate}
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-3 py-1 text-sm rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={handleApply}
                            className="px-3 py-1 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${member.name} Details`} />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 mt-[70px]">
                <div className="max-w-7xl mx-auto mt-5">
 <button
                        onClick={handleBack}
                        className="mb-4 flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Members List
                    </button>                    <div className="bg-white mt-5 dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
                        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white">
                                {member.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {member.name}
                                        </h1>
                                        <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-4">
                                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                </svg>
                                                {member.email}
                                            </div>
                                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                </svg>
                                                {member.phone || "Not provided"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Task Statistics */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</p>
                                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{tasks.total || 0}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Running</p>
                                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{tasks.running || 0}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
                                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{tasks.completed || 0}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Task Instance Statistics */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Instances</p>
                                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{task_instances.total_instances || 0}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Instances</p>
                                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{task_instances.pending_instances || 0}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress Instances</p>
                                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{task_instances.in_progress_instances || 0}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Instances</p>
                                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{task_instances.completed_instances || 0}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overdue Instances</p>
                                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{task_instances.overdue_instances || 0}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task Management</h2>
                            <div className="w-full sm:w-auto">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search tasks..."
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <select
                                        className="block w-full sm:w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="running">Running</option>
                                        <option value="completed">Completed</option>
                                        <option value="overdue">Overdue</option>
                                        <option value="closed">Closed</option>
                                    </select>

                                    <div className="relative flex-1" ref={datePickerRef}>
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Select date range"
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm cursor-pointer"
                                            value={dateRange}
                                            readOnly
                                            onClick={() => setShowDatePicker(!showDatePicker)}
                                        />
                                        {showDatePicker && (
                                            <CustomDatePicker onSelect={handleDateRangeChange} />
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tasks Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Start Date
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            End Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {tasks.data && tasks.data.length > 0 ? (
                                        tasks.data.map((task) => (
                                            <>
                                                <tr
                                                    key={task.uuid}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                                    onClick={() => toggleTaskExpansion(task.uuid)}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                                                                {task.title.charAt(0)}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {task.title}
                                                                </div>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {task.description ? task.description.substring(0, 30) + (task.description.length > 30 ? "..." : "") : "No description"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-white capitalize">
                                                            {task.task_type}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[task.status]}`}>
                                                            {statusIcons[task.status]} {task.status.replace(/_/g, ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {formatDate(task?.start_date)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {task?.end_date ? formatDate(task?.end_date) : "N/A"}
                                                    </td>
                                                </tr>
                                                {expandedTask === task.uuid && (
                                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                                        <td colSpan="6" className="px-6 py-4">
                                                            <div className="ml-14 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                                                    Task Details
                                                                </h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                                    <div>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                                                                        <p className="text-sm text-gray-900 dark:text-white">
                                                                            {task.description || "No description provided"}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                                                                        <p className="text-sm text-gray-900 dark:text-white">
                                                                            {formatDate(task.created_at)}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                                                    Task Instances
                                                                </h4>
                                                                {task.instances && task.instances.length > 0 ? (
                                                                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                                                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                                                            <thead className="bg-gray-100 dark:bg-gray-600">
                                                                                <tr>
                                                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                                        Due Date
                                                                                    </th>
                                                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                                        Status
                                                                                    </th>
                                                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                                        Completed At
                                                                                    </th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                                                                                {task.instances.map((instance) => (
                                                                                    <tr key={instance.uuid} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                                                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                                                            {formatDate(instance.due_date)}
                                                                                        </td>
                                                                                        <td className="px-4 py-2 whitespace-nowrap">
                                                                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[instance.status]}`}>
                                                                                                {statusIcons[instance.status]} {instance.status.replace(/_/g, ' ')}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                                                            {instance.completed_at ? formatDate(instance.completed_at) : "N/A"}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                ) : (
                                                                    <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-4 text-center">
                                                                        <p className="text-sm text-gray-500 dark:text-gray-300">No instances found for this task</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center">
                                                <NoData message="No tasks found matching your criteria" />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {tasks.data && tasks.data.length > 0 && (
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex flex-col sm:flex-row items-center justify-between">
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-0">
                                    Showing <span className="font-medium">{tasks.from}</span> to <span className="font-medium">{tasks.to}</span> of{' '}
                                    <span className="font-medium">{tasks.total}</span> tasks
                                </div>
                                <div className="flex space-x-2">
                                    {tasks.prev_page_url && (
                                        <Link
                                            href={tasks.prev_page_url}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                                            preserveState
                                        >
                                            Previous
                                        </Link>
                                    )}
                                    {tasks.next_page_url && (
                                        <Link
                                            href={tasks.next_page_url}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                                            preserveState
                                        >
                                            Next
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
