import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from './Layouts/AuthenticatedLayout';

const StatusBadge = ({ status }) => {
    const styles = {
        applied: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        viewed: 'bg-blue-100 text-blue-800 border-blue-300',
        assigned_to_calling_member: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        calling_in_progress: 'bg-sky-100 text-sky-800 border-sky-300',
        calling_approved: 'bg-green-100 text-green-800 border-green-300',
        calling_rejected: 'bg-red-100 text-red-800 border-red-300',
        admin_review: 'bg-violet-100 text-violet-800 border-violet-300',
        offer_letter_generated: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        shortlisted: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        waiting_list: 'bg-blue-100 text-blue-800 border-blue-300',
        hired: 'bg-purple-100 text-purple-800 border-purple-300',
        not_selected: 'bg-orange-100 text-orange-800 border-orange-300',
        rejected: 'bg-red-100 text-red-800 border-red-300',
    };

    const labels = {
        applied: 'Applied',
        viewed: 'Viewed',
        assigned_to_calling_member: 'Assigned To Calling Member',
        calling_in_progress: 'Calling In Progress',
        calling_approved: 'Calling Approved',
        calling_rejected: 'Calling Rejected',
        admin_review: 'Admin Review',
        offer_letter_generated: 'Offer Letter Generated',
        shortlisted: 'Shortlisted',
        waiting_list: 'Waiting List',
        hired: 'Hired',
        not_selected: 'Not Selected',
        rejected: 'Rejected',
    };

    return (
        <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${styles[status] || styles.applied}`}>
            {labels[status] || status}
        </span>
    );
};

const ApplicationRow = ({ application, onWithdraw }) => {
    const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    const handleWithdraw = async () => {
        setIsWithdrawing(true);
        try {
            const response = await fetch(`/member/applications/${application.id}/withdraw`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();
            if (data.success) {
                onWithdraw(application.id);
            }
        } catch (error) {
            console.error('Withdraw failed:', error);
        } finally {
            setIsWithdrawing(false);
            setShowWithdrawConfirm(false);
        }
    };

    const canWithdraw = ['applied', 'viewed'].includes(application.status);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <tr className="align-top">
            <td className="px-5 py-4">
                <div className="font-medium text-slate-900">{application.job?.title || '-'}</div>
                <div className="text-slate-500 text-sm">{application.job?.company || application.job?.company_name || '-'}</div>
            </td>
            <td className="px-5 py-4">
                <div className="space-y-2">
                    <StatusBadge status={application.status} />
                    {application.interview_date_time && (
                        <div className="text-xs text-slate-500">
                            Interview: {formatDate(application.interview_date_time)}
                        </div>
                    )}
                    {application.interview_mode === "offline" && application.interview_address && (
                        <div className="text-xs text-slate-500">
                            Address: {application.interview_address}
                        </div>
                    )}
                </div>
            </td>
            <td className="px-5 py-4 text-slate-600 text-sm">
                {formatDate(application.created_at)}
            </td>
            <td className="px-5 py-4">
                {application.resume_url ? (
                    <a
                        href={String(application.resume_url).startsWith('http') || String(application.resume_url).startsWith('/') ? application.resume_url : `/${application.resume_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm font-medium"
                    >
                        Preview
                    </a>
                ) : (
                    <span className="text-slate-400">—</span>
                )}
            </td>
            <td className="px-5 py-4">
                {canWithdraw ? (
                    <>
                        {!showWithdrawConfirm ? (
                            <button
                                onClick={() => setShowWithdrawConfirm(true)}
                                className="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                Withdraw
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowWithdrawConfirm(false)}
                                    className="px-2 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleWithdraw}
                                    disabled={isWithdrawing}
                                    className="px-2 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                                >
                                    {isWithdrawing ? (
                                        <>
                                            <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            ...
                                        </>
                                    ) : (
                                        'Confirm'
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <span className="text-slate-400">—</span>
                )}
            </td>
        </tr>
    );
};

export default function MyApplications({ auth, applications, statusCounts }) {
    const [filter, setFilter] = useState('all');
    const [localApplications, setLocalApplications] = useState(applications.data);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const handleWithdraw = (applicationId) => {
        setLocalApplications(prev => prev.filter(app => app.id !== applicationId));
    };

    const filteredApplications = filter === 'all'
        ? localApplications
        : localApplications.filter(app => app.status === filter);

    // Pagination logic
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Reset to page 1 when filter changes
    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const filters = [
        { key: 'all', label: 'All Applications', count: applications.total },
        { key: 'applied', label: 'Applied', count: statusCounts.applied || 0 },
        { key: 'viewed', label: 'Viewed', count: statusCounts.viewed || 0 },
        { key: 'assigned_to_calling_member', label: 'Assigned', count: statusCounts.assigned_to_calling_member || 0 },
        { key: 'calling_in_progress', label: 'Calling In Progress', count: statusCounts.calling_in_progress || 0 },
        { key: 'calling_approved', label: 'Calling Approved', count: statusCounts.calling_approved || 0 },
        { key: 'calling_rejected', label: 'Calling Rejected', count: statusCounts.calling_rejected || 0 },
        { key: 'admin_review', label: 'Admin Review', count: statusCounts.admin_review || 0 },
        { key: 'offer_letter_generated', label: 'Offer Generated', count: statusCounts.offer_letter_generated || 0 },
        { key: 'rejected', label: 'Rejected', count: statusCounts.rejected || 0 },
        { key: 'shortlisted', label: 'Shortlisted', count: statusCounts.shortlisted || 0 },
        { key: 'waiting_list', label: 'Waiting List', count: statusCounts.waiting_list || 0 },
        { key: 'hired', label: 'Hired', count: statusCounts.hired || 0 },
        { key: 'not_selected', label: 'Not Selected', count: statusCounts.not_selected || 0 },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="My Applications" />

            <div className="pt-20 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">My Applications</h1>
                    <p className="text-slate-600 text-sm leading-relaxed">Track and manage your job applications</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {filters.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => handleFilterChange(f.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === f.key
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {f.label}
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                filter === f.key ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                                {f.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Applications Table */}
                {filteredApplications.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold text-slate-700">Job</th>
                                        <th className="px-5 py-3 font-semibold text-slate-700">Status</th>
                                        <th className="px-5 py-3 font-semibold text-slate-700">Applied</th>
                                        <th className="px-5 py-3 font-semibold text-slate-700">Resume</th>
                                        <th className="px-5 py-3 font-semibold text-slate-700">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedApplications.map((application) => (
                                        <ApplicationRow
                                            key={application.id}
                                            application={application}
                                            onWithdraw={handleWithdraw}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                            {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
                        </h3>
                        <p className="text-slate-500 mb-4">
                            {filter === 'all'
                                ? 'Start applying to jobs and track your progress here'
                                : 'Try selecting a different filter'}
                        </p>
                        {filter === 'all' && (
                            <Link
                                href={route('member.jobs.index')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Browse Jobs
                            </Link>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between bg-white rounded-lg border border-slate-200 px-4 py-3">
                        <div className="text-sm text-slate-600">
                            Page <span className="font-semibold text-slate-900">{currentPage}</span> of <span className="font-semibold text-slate-900">{totalPages}</span>
                            <span className="ml-2">({filteredApplications.length} total)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Previous Button */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${
                                    currentPage === 1
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Prev
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium ${
                                            currentPage === pageNum
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${
                                    currentPage === totalPages
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                Next
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
