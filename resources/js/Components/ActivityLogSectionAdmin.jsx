import { router } from "@inertiajs/react";
import { useState } from "react";
import moment from "moment";

const ActivityLogSectionAdmin = ({ activityLogs }) => {
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(activityLogs?.current_page || 1);
    const [perPage, setPerPage] = useState(activityLogs?.per_page || 10);

    // ✅ Handle both array and object formats
    const isArrayLogs = Array.isArray(activityLogs);
    const logsData = isArrayLogs ? activityLogs : activityLogs?.data || [];
    const logsFrom = isArrayLogs ? 1 : activityLogs?.from || 0;
    const logsTo = isArrayLogs ? logsData.length : activityLogs?.to || 0;
    const logsTotal = isArrayLogs ? logsData.length : activityLogs?.total || 0;
    const logsLinks = isArrayLogs ? [] : activityLogs?.links || [];

    const handlePageChange = async (page) => {
        if (isArrayLogs) return; // ✅ No pagination for array data
        setLoading(true);
        try {
            await router.get(route('admin.dashboard'), {
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
        if (isArrayLogs) return; // ✅ Skip if only array data
        setLoading(true);
        try {
            await router.get(route('admin.dashboard'), {
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

    const getActionColor = (actionType) => {
        switch (actionType) {
            case 'create': return 'bg-blue-100 text-blue-800';
            case 'update': return 'bg-yellow-100 text-yellow-800';
            case 'delete': return 'bg-red-100 text-red-800';
            case 'login': return 'bg-green-100 text-green-800';
            case 'logout': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="cards border borderbx rounded-lg p-4 shadow-sm mt-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-second-color">
                    Recent Activity Logs
                </h3>

                {!isArrayLogs && (
                    <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-600">Items per page:</div>
                        <div className="relative">
                            <select
                                value={perPage}
                                onChange={(e) => handlePerPageChange(e.target.value)}
                                className="appearance-none text-sm border rounded pl-2 pr-8 py-1 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                disabled={loading}
                            >
                                {[5, 10, 20, 50].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
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
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {logsData.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-start gap-3">
                                                <div className="h-9 w-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                                                    {log.user?.name?.charAt(0).toUpperCase() || 'S'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                                                        <div className="text-sm font-medium text-gray-900 truncate">
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
                                                    {log.ip_address && (
                                                        <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
                                                            <span className="flex items-center">
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                </svg>
                                                                {log.ip_address}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(log.action_type)}`}>
                                                {log.action_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={log.description}>
                                            {log.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {moment(log.action_time).format('MMM D, YYYY h:mm A')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {logsData.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No activity logs found.
                        </div>
                    )}

                    {!isArrayLogs && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-medium">{logsFrom}</span> to <span className="font-medium">{logsTo}</span> of <span className="font-medium">{logsTotal}</span> results
                            </div>
                            <div className="flex space-x-1">
                                {logsLinks.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && handlePageChange(link.url.split('page=')[1])}
                                        className={`px-3 py-1 rounded-md ${link.active ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} ${!link.url ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        disabled={!link.url || loading}
                                    >
                                        {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ActivityLogSectionAdmin;
