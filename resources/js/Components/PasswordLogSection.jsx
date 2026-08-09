import { router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import moment from "moment";

const PasswordLogSection = ({ passwordLogs, auth }) => {
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(passwordLogs.current_page);
    const [perPage, setPerPage] = useState(passwordLogs.per_page);
    const [isDarkMode, setIsDarkMode] = useState(false);

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
                pagePasswordLog: page,
                perPagePasswordLog: perPage
            }, {
                preserveState: true,
                only: ['passwordLogs'],
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
                pagePasswordLog: 1,
                perPagePasswordLog: newPerPage
            }, {
                preserveState: true,
                only: ['passwordLogs'],
            });
            setPerPage(newPerPage);
            setCurrentPage(1);
        } catch (error) {
            console.error("Per page change error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Get user name from relationships
    const getUserName = (log) => {
        if (log.super_admin) {
            return log.super_admin.name;
        } else if (log.member) {
            return log.member.name;
        }
        return 'Unknown User';
    };

    // Get user role from relationships
    const getUserRole = (log) => {
        if (log.super_admin) {
            return 'Super Admin';
        } else if (log.member && log.member.roles) {
            // Map role IDs to role names
            const roleMap = {
                1: 'Admin',
                2: 'Super Admin',
                3: 'Member'
            };

            const roleNames = log.member.roles.map(roleId =>
                roleMap[roleId] || `Role ${roleId}`
            );

            return roleNames.join(', ');
        }
        return log.role || 'Unknown Role';
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
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    Password Change History
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
                    <svg className="animate-spin h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Password Changed</th>
                                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">New Password</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Time</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${tableRowClass}`}>
                                {passwordLogs.data.map((log) => (
                                    <tr key={log.uuid} className="hover:bg-opacity-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`h-9 w-9 rounded-full flex items-center justify-center font-medium text-sm ${
                                                    isDarkMode ? 'bg-green-700 text-green-100' : 'bg-green-500 text-white'
                                                }`}>
                                                    {getUserName(log)?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="ml-3">
                                                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                                        {getUserName(log)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textColorClass}`}>
                                            {log.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {getUserRole(log)}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-sm ${textColorClass}`}>
                                            {log.new_password ? 'Updated' : 'Reset'}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textColorClass}`}>
                                            {log?.new_password}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textColorClass}`}>
                                            {moment(log.created_at).format('MMM D, YYYY h:mm A')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {passwordLogs.data.length === 0 && (
                        <div className={`text-center py-8 ${textColorClassLight}`}>
                            No password change logs found.
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-3 sm:space-y-0">
                        <div className={`text-sm ${textColorClass}`}>
                            Showing <span className="font-medium">{passwordLogs.from}</span> to <span className="font-medium">{passwordLogs.to}</span> of <span className="font-medium">{passwordLogs.total}</span> results
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {passwordLogs.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => link.url && handlePageChange(link.url.split('pagePasswordLog=')[1])}
                                    className={`px-3 py-1 rounded-md text-sm ${link.active
                                        ? (isDarkMode ? 'bg-green-700 text-white' : 'bg-green-500 text-white')
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

export default PasswordLogSection;
