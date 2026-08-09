import { router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import moment from "moment";

const ActivityLogSection = ({ activityLogs }) => {
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(activityLogs.current_page);
    const [perPage, setPerPage] = useState(activityLogs.per_page);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const getRoleBadgeColor = (roleId) => {
  const colorMap = {
    "1": "bg-blue-600 text-white",
    "2": "bg-purple-600 text-white",
    "3": "bg-green-600 text-white",
  };
  return colorMap[roleId] || "text-white";
};
const getRoleName = (roleId) => {
  const roleMap = {
    "1": "Admin",
    "2": "Super Admin",
    "3": "Doer",
  };
  return roleMap[roleId] || `Role ${roleId}`;
};
    // Check for dark mode preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(mediaQuery.matches);

        const handler = (e) => setIsDarkMode(e.matches);
        mediaQuery.addEventListener('change', handler);

        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    const handlePageChange = async (page) => {
        setLoading(true);
        try {
            await router.get(route('super.dashboard'), {
                page,
                perPage
            }, {
                preserveState: true,
                only: ['activityLogs'],
            });
            setCurrentPage(page);
        } catch (error) {
            console.error("Page change error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePerPageChange = async (newPerPage) => {
        setLoading(true);
        try {
            await router.get(route('super.dashboard'), {
                page: 1,
                perPage: newPerPage
            }, {
                preserveState: true,
                only: ['activityLogs'],
            });
            setPerPage(newPerPage);
            setCurrentPage(1);
        } catch (error) {
            console.error("Per page change error:", error);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (actionType) => {
        if (isDarkMode) {
            switch (actionType) {
                case 'create': return 'bg-blue-900/30 text-blue-300';
                case 'update': return 'bg-yellow-900/30 text-yellow-300';
                case 'delete': return 'bg-red-900/30 text-red-300';
                case 'login': return 'bg-green-900/30 text-green-300';
                case 'logout': return 'bg-purple-900/30 text-purple-300';
                default: return 'bg-gray-800 text-gray-300';
            }
        } else {
            switch (actionType) {
                case 'create': return 'bg-blue-100 text-blue-800';
                case 'update': return 'bg-yellow-100 text-yellow-800';
                case 'delete': return 'bg-red-100 text-red-800';
                case 'login': return 'bg-green-100 text-green-800';
                case 'logout': return 'bg-purple-100 text-purple-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        }
    };



    // Theme classes
    const containerClass = isDarkMode
        ? "bg-gray-900 border-gray-700 text-gray-100"
        : "bg-white border-gray-200 text-gray-800";

    const tableHeadClass = isDarkMode
        ? "bg-gray-800 text-gray-300"
        : "bg-gray-50 text-gray-500";

    const tableRowClass = isDarkMode
        ? "bg-gray-900 hover:bg-gray-800 divide-gray-700"
        : "bg-white hover:bg-gray-50 divide-gray-200";

    const textColorClass = isDarkMode ? "text-gray-300" : "text-gray-600";
    const textColorClassLight = isDarkMode ? "text-gray-400" : "text-gray-500";
    const borderColorClass = isDarkMode ? "border-gray-700" : "border-gray-200";
    const selectClass = isDarkMode
        ? "bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
        : "bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500";

    return (
        <div className={`rounded-lg p-4 shadow-sm mt-6 border ${containerClass}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    Recent Activity Logs
                </h3>
                <div className="flex items-center gap-2">
                    <div className={`text-sm ${textColorClassLight}`}>Items per page:</div>
                    <div className="relative">
                        <select
                            value={perPage}
                            onChange={(e) => handlePerPageChange(e.target.value)}
                            className={`appearance-none text-sm border rounded pl-2 pr-8 py-1 focus:ring-1 ${selectClass}`}
                            disabled={loading}
                        >
                            {[5, 10, 20, 50].map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y">
                            <thead className={tableHeadClass}>
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Action</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Time</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${tableRowClass}`}>
                                {activityLogs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-opacity-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-start gap-3">
                                                {/* User Avatar */}
                                                <div className="flex-shrink-0">
                                                    <div className={`h-9 w-9 rounded-full flex items-center justify-center font-medium text-sm ${
                                                        isDarkMode ? 'bg-blue-700 text-blue-100' : 'bg-blue-500 text-white'
                                                    }`}>
                                                        {log.user?.name?.charAt(0).toUpperCase() || 'S'}
                                                    </div>
                                                </div>

                                                {/* User Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                                                        <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} truncate`}>
                                                            {log.user?.name || 'System'}
                                                        </div>
                                                        {log.user_role && (
                                                            <span className={`px-1.5 py-0.5 text-[10px] font-semibold leading-none rounded-md ${getRoleBadgeColor(log.user_role)}`}>
                                                                {/* {log.user_role.toUpperCase()} */}
                                                                {log?.user?.roles && log?.user?.roles.length > 0 ? (
      log?.user?.roles.map((roleId) => (
        <span
          key={roleId}
          className={`inline-flex items-center gap-x-1 py-1 px-3 rounded-full text-xs font-medium ${getRoleBadgeColor(
            roleId
          )}`}
        >
          {getRoleName(roleId)}
        </span>
      ))
    ) : (
      <span className="text-gray-400">No roles assigned</span>
    )}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
                                                        {log.ip_address && (
                                                            <span className={`flex items-center ${textColorClassLight}`}>
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                </svg>
                                                                {log.ip_address}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(log.action_type)}`}>
                                                {log.action_type}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-sm max-w-xs truncate ${textColorClass}`} title={log.description}>
                                            {log.description}
                                        </td>

                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textColorClass}`}>
                                            {moment(log.action_time).format('MMM D, YYYY h:mm A')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {activityLogs.data.length === 0 && (
                        <div className={`text-center py-8 ${textColorClassLight}`}>
                            No activity logs found.
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-3 sm:space-y-0">
                        <div className={`text-sm ${textColorClass}`}>
                            Showing <span className="font-medium">{activityLogs.from}</span> to <span className="font-medium">{activityLogs.to}</span> of <span className="font-medium">{activityLogs.total}</span> results
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {activityLogs.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => link.url && handlePageChange(link.url.split('page=')[1])}
                                    className={`px-3 py-1 rounded-md text-sm ${link.active
                                        ? (isDarkMode ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white')
                                        : (isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100')
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} border ${borderColorClass}`}
                                    disabled={!link.url || loading}
                                >
                                    {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ActivityLogSection;
