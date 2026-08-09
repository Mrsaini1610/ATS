import React, { useState, useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "../Layouts/AuthenticatedLayout";
import { useAlerts } from "../../../Components/Alerts";

const JobRequestCard = ({ job, onView, onApprove, onReject }) => {
    const getStatusBadge = (status) => {
        const badges = {
            pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
            active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            declined: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        };
        return badges[status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700 max-w-sm">
            <div className="flex items-start justify-between mb-3">
                <div className="flex gap-3">
                    {job.company_image ? (
                        <img
                            src={job.company_image}
                            alt={job.company}
                            className="w-12 h-12 rounded-xl object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-gray-400 dark:text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                            </svg>
                        </div>
                    )}
                    <div>
                        <h3 className="text-[16px] font-semibold text-slate-900 dark:text-white line-clamp-1">
                            {job.title}
                        </h3>
                        <p className="text-slate-500 dark:text-gray-400 text-[12px]">{job.company}</p>
                    </div>
                </div>
                <span
                    className={`px-2 py-1 rounded-full text-[11px] font-medium capitalize ${getStatusBadge(
                        job.status
                    )}`}
                >
                    {job.status}
                </span>
            </div>

            <div className="space-y-1 text-slate-600 dark:text-gray-400 text-[12px] mb-3">
                <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700 dark:text-gray-300">Location:</span>
                    <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700 dark:text-gray-300">Type:</span>
                    <span>{job.job_type}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700 dark:text-gray-300">Created By:</span>
                    <span>{job.creator?.name || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700 dark:text-gray-300">Created:</span>
                    <span>
                        {new Date(job.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </span>
                </div>
            </div>

            {job.status === "pending" && (
                <div className="flex gap-2">
                    <button
                        onClick={() => onApprove(job)}
                        className="flex-1 py-2 rounded-lg bg-green-600 text-white text-[12px] font-medium hover:bg-green-700 transition-colors"
                    >
                        Approve
                    </button>
                    
                    <button
                        onClick={() => onReject(job)}
                        className="flex-1 py-2 rounded-lg bg-red-600 text-white text-[12px] font-medium hover:bg-red-700 transition-colors"
                    >
                        Reject
                    </button>
                </div>
            )}

            <button
                onClick={() => onView(job)}
                className="w-full mt-2 py-2 rounded-lg text-blue-600 dark:text-blue-400 text-[12px] font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-blue-200 dark:border-blue-800"
            >
                View Details
            </button>
        </div>
    );
};

const JobDetailModal = ({ job, isOpen, onClose, onApprove, onReject }) => {
    if (!isOpen || !job) return null;

    const getStatusBadge = (status) => {
        const badges = {
            pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
            active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            declined: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        };
        return badges[status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <svg
                        className="w-4 h-4 text-gray-600 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
                <div className="max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                    <div className="absolute top-3 left-3">
                        <div className="w-16 h-16 rounded-xl border-4 border-white shadow-lg overflow-hidden bg-white">
                            {job.company_image ? (
                                <img
                                    src={job.company_image}
                                    alt={job.company}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                                    <svg
                                        className="w-8 h-8 text-gray-400 dark:text-gray-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                        />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="absolute bottom-1  left-4 right-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-white font-bold text-xl">{job.title}</h2>
                            <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${getStatusBadge(
                                    job.status
                                )}`}
                            >
                                {job.status}
                            </span>
                        </div>
                        <p className="text-white/90 text-sm">{job.company}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Location</p>
                            <p className="font-medium text-gray-900 dark:text-white">{job.location}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Job Type</p>
                            <p className="font-medium text-gray-900 dark:text-white">{job.job_type}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Experience</p>
                            <p className="font-medium text-gray-900 dark:text-white">{job.experience || "Not specified"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Salary</p>
                            <p className="font-medium text-green-600 dark:text-green-400">{job.salary || "Not specified"}</p>
                        </div>
                    </div>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Skills Required</p>
                            <div className="flex flex-wrap gap-2">
                                {job.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {job.description && (
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                {job.description}
                            </p>
                        </div>
                    )}

                    {/* Key Responsibilities */}
                    {(() => {
                        const responsibilities = Array.isArray(job.key_responsibilities) 
                            ? job.key_responsibilities 
                            : (typeof job.key_responsibilities === 'string' && job.key_responsibilities
                                ? job.key_responsibilities.split('\n').map(s => s.trim()).filter(Boolean)
                                : []);
                        return responsibilities.length > 0 && (
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Key Responsibilities</p>
                                <ul className="space-y-1">
                                    {responsibilities.map((item, idx) => (
                                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                            <span className="text-blue-500 mt-1">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })()}

                    {/* Qualifications */}
                    {(() => {
                        const qualifications = Array.isArray(job.qualifications) 
                            ? job.qualifications 
                            : (typeof job.qualifications === 'string' && job.qualifications
                                ? job.qualifications.split('\n').map(s => s.trim()).filter(Boolean)
                                : []);
                        return qualifications.length > 0 && (
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Qualifications</p>
                                <ul className="space-y-1">
                                    {qualifications.map((item, idx) => (
                                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                            <span className="text-blue-500 mt-1">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })()}

                    {/* Perks */}
                    {job.perks && job.perks.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Perks & Benefits</p>
                            <div className="flex flex-wrap gap-2">
                                {job.perks.map((perk, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        {perk}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Approval Info */}
                    <div className="border-t pt-4">
                        <p className="text-xs text-gray-500 mb-2">Request Information</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Created By:</span>
                                <span className="ml-1 font-medium">{job.creator?.name || "Unknown"}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Created:</span>
                                <span className="ml-1 font-medium">
                                    {new Date(job.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            {job.approved_by && (
                                <div>
                                    <span className="text-gray-500">Approved By:</span>
                                    <span className="ml-1 font-medium">{job.approver?.name}</span>
                                </div>
                            )}
                            {job.approved_at && (
                                <div>
                                    <span className="text-gray-500">Approved:</span>
                                    <span className="ml-1 font-medium">
                                        {new Date(job.approved_at).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                            {job.rejection_reason && (
                                <div className="col-span-2">
                                    <span className="text-gray-500">Rejection Reason:</span>
                                    <span className="ml-1 text-red-600">{job.rejection_reason}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    {job.status === "pending" && (
                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                onClick={() => {
                                    onApprove(job);
                                    onClose();
                                }}
                                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                            >
                                Approve Job
                            </button>
                            <button
                                onClick={() => {
                                    onReject(job);
                                    onClose();
                                }}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                            >
                                Reject Job
                            </button>
                        </div>
                    )}
                </div>
                </div>
            </div>
        </div>
    );
};

export default function JobRequests({ auth }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [jobToReject, setJobToReject] = useState(null);

    const { successAlert, errorAlert } = useAlerts();

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await fetch(route("super.job.requests.api.all"));
            const data = await response.json();
            if (data.success) {
                setJobs(data.data);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (job) => {
        setSelectedJob(job);
        setShowModal(true);
    };

    const handleApprove = async (job) => {
        try {
            const response = await fetch(
                route("super.job.requests.api.approve", job.id),
                {
                    method: "PATCH",
                    headers: {
                        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
                        "Accept": "application/json",
                    },
                }
            );
            const data = await response.json();
            if (data.success) {
                setJobs(jobs.map((j) => (j.id === job.id ? data.data : j)));
                successAlert("Job approved successfully!");
            } else {
                errorAlert(data.message || "Failed to approve job.");
            }
        } catch (error) {
            console.error("Error approving job:", error);
            errorAlert("Failed to approve job.");
        }
    };

    const handleRejectClick = (job) => {
        setJobToReject(job);
        setRejectionReason("");
        setShowRejectModal(true);
    };

    const handleReject = async () => {
        if (!jobToReject) return;

        try {
            const response = await fetch(
                route("super.job.requests.api.reject", jobToReject.id),
                {
                    method: "PATCH",
                    headers: {
                        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ rejection_reason: rejectionReason }),
                }
            );
            const data = await response.json();
            if (data.success) {
                setJobs(jobs.map((j) => (j.id === jobToReject.id ? data.data : j)));
                setShowRejectModal(false);
                setJobToReject(null);
                setRejectionReason("");
                successAlert("Job rejected successfully!");
            } else {
                errorAlert(data.message || "Failed to reject job.");
            }
        } catch (error) {
            console.error("Error rejecting job:", error);
            errorAlert("Failed to reject job.");
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Job Requests" />

            <div className="min-h-screen bg-slate-100 dark:bg-gray-900 p-4 sm:p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
                            Job Requests
                        </h1>
                        <p className="text-slate-500 dark:text-gray-400 mt-1">
                            Manage job approval requests from admins
                        </p>
                    </div>

                    {/* Job Cards Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5146E6]"></div>
                        </div>
                    ) : jobs.filter(job => job.status === 'pending').length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                            <svg
                                className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No Job Requests Found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                No pending job requests found.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {jobs.filter(job => job.status === 'pending').map((job) => (
                                <JobRequestCard
                                    key={job.id}
                                    job={job}
                                    onView={handleView}
                                    onApprove={handleApprove}
                                    onReject={handleRejectClick}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Job Detail Modal */}
            <JobDetailModal
                job={selectedJob}
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedJob(null);
                }}
                onApprove={handleApprove}
                onReject={handleRejectClick}
            />

            {/* Rejection Reason Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Reject Job Request
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Please provide a reason for rejecting "{jobToReject?.title}"
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4 dark:bg-gray-700 dark:text-white"
                            rows={4}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setJobToReject(null);
                                    setRejectionReason("");
                                }}
                                className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
