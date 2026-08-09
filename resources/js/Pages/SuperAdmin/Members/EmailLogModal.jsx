import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import Loading from '@/Components/Loading';
import { Head, router } from '@inertiajs/react';

export default function EmailLogModal({ member, show, onClose }) {
    const [emailLogs, setEmailLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [searchSubject, setSearchSubject] = useState('');
    const [dateRange, setDateRange] = useState({
        start: null,
        end: null
    });
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        if (show && member?.uuid) {
            setCurrentPage(1);
            fetchEmailLogs();
        }
    }, [show, member, debouncedSearch, dateRange, perPage, currentPage]);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchSubject);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchSubject]);

    const fetchEmailLogs = () => {
        setIsLoading(true);

        const params = {
            page: currentPage,
            per_page: perPage,
            subject: debouncedSearch || undefined,
            start_date: dateRange.start ? dateRange.start.toISOString().split('T')[0] : undefined,
            end_date: dateRange.end ? dateRange.end.toISOString().split('T')[0] : undefined
        };
        axios.get(route('super.members.email-logs', { user: member.uuid }), { params })
            .then(response => {
                setEmailLogs(response.data.emailLogs.data);
                setTotal(response.data.emailLogs.total);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching email logs:', error);
                setIsLoading(false);
            });
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };
    const renderStatusBadge = (status) => {
        const statusMap = {
            'sent': { class: 'bg-green-100 text-green-800', text: 'Sent' },
            'failed': { class: 'bg-red-100 text-red-800', text: 'Failed' },
            'pending': { class: 'bg-yellow-100 text-yellow-800', text: 'Pending' }
        };
        const statusInfo = statusMap[status] || statusMap['pending'];
        return (
            <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.class}`}>
                {statusInfo.text}
            </span>
        );
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleDateChange = (e, type) => {
        const value = e.target.value;
        setDateRange(prev => ({
            ...prev,
            [type]: value ? new Date(value) : null
        }));
    };

    const clearFilters = () => {
        setSearchSubject('');
        setDateRange({ start: null, end: null });
        setCurrentPage(1);
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="7xl" topCloseButton={true} handleTopClose={onClose}>
            <div className="p-6">
                <Head title={`Email Logs - ${member?.name || ''}`} />

                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    Email Logs for {member?.name || ''}
                </h2>

                {/* Search and Filter Section */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Search by subject..."
                            value={searchSubject}
                            onChange={(e) => setSearchSubject(e.target.value)}
                            className={`
                                w-full text-sm border rounded-lg px-6 py-3
                                focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all
                                bg-white text-gray-800 border-gray-300 placeholder-gray-400
                                hover:border-gray-400 focus:border-blue-500 focus:ring-blue-200
                                dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400
                                dark:hover:border-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-800
                            `}
                        />
                    </div>
                    <div className="flex space-x-2">
                        <input
                            type="date"
                            value={dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''}
                            onChange={(e) => handleDateChange(e, 'start')}
                            className={`
                                w-full text-sm border rounded-lg px-6 py-3
                                focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all
                                bg-white text-gray-800 border-gray-300 placeholder-gray-400
                                hover:border-gray-400 focus:border-blue-500 focus:ring-blue-200
                                dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400
                                dark:hover:border-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-800
                            `}
                        />
                        <input
                            type="date"
                            value={dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''}
                            onChange={(e) => handleDateChange(e, 'end')}
                            min={dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''}
                            className={`
                                w-full text-sm border rounded-lg px-6 py-3
                                focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all
                                bg-white text-gray-800 border-gray-300 placeholder-gray-400
                                hover:border-gray-400 focus:border-blue-500 focus:ring-blue-200
                                dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400
                                dark:hover:border-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-800
                            `}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        >
                            Clear Filters
                        </button>
                        {/* <button
                            onClick={fetchEmailLogs}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                            Apply Filters
                        </button> */}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loading />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">To</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subject</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {emailLogs.length > 0 ? (
                                    emailLogs.map((log) => (
                                        <tr key={log.uuid} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {formatDate(log.sent_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {log.to}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {log.subject}
                                            </td>

                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                            No email logs found for this member.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {emailLogs.length > 0 && (
                            <div className="mt-4 flex justify-between items-center">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing {emailLogs.length} of {total} entries
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">Per page:</span>
                                        <select
                                            value={perPage}
                                            onChange={(e) => setPerPage(Number(e.target.value))}
                                            className={`
                                                border rounded-md px-2 py-1 text-sm
                                                bg-white text-gray-800 border-gray-300
                                                dark:bg-gray-800 dark:text-white dark:border-gray-600
                                                focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800
                                            `}
                                        >
                                            <option value="10">10</option>
                                            <option value="25">25</option>
                                            <option value="50">50</option>
                                            <option value="100">100</option>
                                        </select>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={emailLogs.length < perPage}
                                            className={`px-3 py-1 rounded-md ${emailLogs.length < perPage ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}
