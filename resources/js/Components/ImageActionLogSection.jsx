import { router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import moment from "moment";

const ImageActionLogSection = ({ imageActionLogs, auth }) => {
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(imageActionLogs.current_page);
    const [perPage, setPerPage] = useState(imageActionLogs.per_page);
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
                pageImageLog: page,
                perPageImageLog: perPage
            }, {
                preserveState: true,
                only: ['imageActionLogs'],
            });
            setCurrentPage(page);
        } catch (error) {
            console.error("Page change error:", error);
        } finally {
            setLoading(false);
        }
    };
      const getFileIcon = (url) => {
        if (!url) return null;

        // Extract file extension from URL
        const extension = url.split('.').pop().toLowerCase().split('?')[0];

        const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
        const docExtensions = ["pdf", "doc", "docx", "txt"];
        const spreadsheetExtensions = ["xls", "xlsx", "csv"];

        if (imageExtensions.includes(extension)) {
            return (
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center dark:bg-blue-900/20">
<img
                                                            src={url}
                                                            alt="Action preview"
                                                            className="h-10 w-10 object-cover rounded"
                                                        />
                </div>
            );
        } else if (docExtensions.includes(extension)) {
            return (
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center dark:bg-red-900/20">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-red-600 dark:text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
            );
        } else if (spreadsheetExtensions.includes(extension)) {
            return (
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center dark:bg-green-900/20">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-green-600 dark:text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
            );
        } else {
            return (
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center dark:bg-gray-700">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-600 dark:text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
            );
        }
    };

    const handlePerPageChange = async (newPerPage) => {
        setLoading(true);
        try {
            await router.get(route('super.dashboard'), {
                pageImageLog: 1,
                perPageImageLog: newPerPage
            }, {
                preserveState: true,
                only: ['imageActionLogs'],
            });
            setPerPage(newPerPage);
            setCurrentPage(1);
        } catch (error) {
            console.error("Per page change error:", error);
        } finally {
            setLoading(false);
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

    const actionColors = {
        uploaded: isDarkMode ? "bg-green-800/30 text-green-300" : "bg-green-100 text-green-800",
        deleted: isDarkMode ? "bg-red-800/30 text-red-300" : "bg-red-100 text-red-800",
        updated: isDarkMode ? "bg-blue-800/30 text-blue-300" : "bg-blue-100 text-blue-800",
    };

    return (
        <div className={`rounded-lg p-4 shadow-sm mt-6 border ${containerClass}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    Image Action History
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
                    <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Admin</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Action</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Image</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Time</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${tableRowClass}`}>
                                {imageActionLogs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-opacity-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`h-9 w-9 rounded-full flex items-center justify-center font-medium text-sm ${
                                                    isDarkMode ? 'bg-purple-700 text-purple-100' : 'bg-purple-500 text-white'
                                                }`}>
                                                    {log.super_admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                                                </div>
                                                <div className="ml-3">
                                                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                                        {log.super_admin?.name || 'Unknown Admin'}
                                                    </div>
                                                    <div className={`text-sm ${textColorClass}`}>
                                                        {log.super_admin?.email || ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                actionColors[log.action] || (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800')
                                            }`}>
                                                {log.action?.charAt(0).toUpperCase() + log.action?.slice(1) || 'Unknown'}
                                            </span>
                                        </td>
                                       <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {log.image_url ? (
                                                    <>
                                                        {getFileIcon(log.image_url)}
                                                        <a
                                                            href={log.image_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="ml-2 text-sm text-blue-500 hover:text-blue-700"
                                                        >
                                                            View File
                                                        </a>
                                                    </>
                                                ) : (
                                                    <span className={`text-sm ${textColorClass}`}>No file available</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${textColorClass}`}>
                                            {moment(log.created_at).format('MMM D, YYYY h:mm A')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {imageActionLogs.data.length === 0 && (
                        <div className={`text-center py-8 ${textColorClassLight}`}>
                            No image action logs found.
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-3 sm:space-y-0">
                        <div className={`text-sm ${textColorClass}`}>
                            Showing <span className="font-medium">{imageActionLogs.from}</span> to <span className="font-medium">{imageActionLogs.to}</span> of <span className="font-medium">{imageActionLogs.total}</span> results
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {imageActionLogs.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => link.url && handlePageChange(link.url.split('pageImageLog=')[1])}
                                    className={`px-3 py-1 rounded-md text-sm ${link.active
                                        ? (isDarkMode ? 'bg-purple-700 text-white' : 'bg-purple-500 text-white')
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

export default ImageActionLogSection;
