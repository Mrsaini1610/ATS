import React, { useState, useEffect, useRef } from "react";
import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "../Layouts/AuthenticatedLayout";
import LocationInput from "../../../Components/LocationInput";
import ConfirmDialog from "../../../Components/ConfirmDialog";

const ASSETS_OPTIONS = [
    "Bike",
    "License",
    "Aadhaar Card",
    "PAN Card",
    "Heavy Driver License",
    "Camera",
    "Laptop",
    "Auto / Rickshaw",
    "Tempo",
    "Tempo Traveller / Van",
    "Yulu / E-Bike"
];

const JOB_CATEGORIES = [
    "Information Technology (IT)",
    "Sales & Business Development",
    "Digital Marketing",
    "Human Resources (HR)",
    "Finance & Accounting",
    "Engineering",
    "Design & Creative",
    "Customer Support & BPO",
    "Healthcare",
    "Operations & Manufacturing"
];

const parseSalaryRange = (salary) => {
    if (!salary) return { min: '', max: '', period: 'Monthly' };
    const match = String(salary).replace(/\s+/g, ' ').trim().match(/₹?\s*([\d,]+)\s*-\s*₹?\s*([\d,]+)\s*\/\s*(year|month|hour|week)/i);
    if (!match) return { min: '', max: '', period: 'Monthly' };
    return { min: match[1].replace(/,/g, ''), max: match[2].replace(/,/g, ''), period: match[3].toLowerCase() };
};

const splitCommaList = (value) =>
    String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
import { useAlerts } from "../../../Components/Alerts";

// Reusable JobCard Component
const JobCard = ({ job, onStatusChange, onCloseJob, onApprove, onReject, onViewDetails, onEdit, onDelete }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            closed: 'bg-red-200 text-red-900 dark:bg-red-900/30 dark:text-red-400',
        };
        return badges[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    };

    const canToggleStatus = ['active', 'inactive', 'closed'].includes(job.status);
    const canClose = ['active', 'inactive'].includes(job.status);
    const isPending = job.status === 'pending';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-4 border min-h-[320px] relative flex flex-col border-slate-200 dark:border-gray-700 hover:border-blue-300 hover:ring-2 hover:ring-blue-200 transition-all duration-200">
            <div className="absolute -top-4 -right-2 z-10 flex gap-1">
                <button
                    onClick={() => onEdit(job)}
                    className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-md"
                    title="Edit Job"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button
                    onClick={() => onDelete(job)}
                    className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                    title="Delete Job"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            <div className="flex items-start justify-between mb-2">
                <div className="flex gap-3">
                    <img src={job.company_image || job.companyImage} alt={job.title} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                        <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white line-clamp-1">{job.title}</h2>
                        <p className="text-slate-500 dark:text-gray-400 text-[12px]">{job.company}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-medium whitespace-nowrap">
                        {job.job_type || job.type}
                    </span>
                    {/* Show status badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${getStatusBadge(job.status)}`}>
                        {job.status === 'active' ? 'Active' : job.status === 'inactive' ? 'Deactive' : job.status === 'closed' ? 'Closed' : job.status}
                    </span>
                </div>
            </div>

            <div className="space-y-1 text-slate-600 dark:text-gray-400 text-[12px] mb-2">
                <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{job.experience}</span>
                </div>
                <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{job.salary}</span>
                </div>
            </div>

            {/* Created By Admin */}
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-gray-400 mb-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Posted by: {job.creator?.name || "Unknown"}</span>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1 mb-2">
                {job.skills?.slice(0, 3).map((skill, index) => (
                    <span key={index} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-[10px] font-medium">
                        {skill}
                    </span>
                ))}
                {job.skills?.length > 3 && (
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400 rounded text-[10px]">
                        +{job.skills.length - 3}
                    </span>
                )}
            </div>

            {/* Posted Date, Applicants & Status Dropdown */}
            <div className="text-[11px] text-slate-400 dark:text-gray-500 mb-3">
                <div className="flex items-center justify-between">
                    <span>Posted: {job.created_at ? new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}</span>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0h-6v-1a6 6 0 00-9 5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            {job.applicants || 0} applicants
                        </span>
                        {/* Status Change Dropdown */}
                        {canToggleStatus && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 rounded-lg text-slate-600 dark:text-gray-300 text-[10px] font-medium transition-colors"
                                title="Change Job Status"
                            >
                                Job Status
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {showDropdown && (
                                <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-slate-200 dark:border-gray-700 py-1 z-20">
                                    <button
                                        onClick={() => {
                                            onStatusChange(job, 'active');
                                            setShowDropdown(false);
                                        }}
                                        disabled={job.status === 'active'}
                                        className={`w-full text-left px-3 py-2 text-[11px] hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors ${job.status === 'active' ? 'text-green-600 font-semibold bg-green-50 dark:bg-green-900/30 dark:text-green-400' : 'text-slate-700 dark:text-gray-300'
                                            }`}
                                    >
                                        Active
                                    </button>
                                    <button
                                        onClick={() => {
                                            onStatusChange(job, 'inactive');
                                            setShowDropdown(false);
                                        }}
                                        disabled={job.status === 'inactive'}
                                        className={`w-full text-left px-3 py-2 text-[11px] hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors ${job.status === 'inactive' ? 'text-gray-600 font-semibold bg-gray-50 dark:bg-gray-700 dark:text-gray-300' : 'text-slate-700 dark:text-gray-300'
                                            }`}
                                    >
                                        Deactive
                                    </button>
                                    {canClose && (
                                        <>
                                            <div className="border-t border-slate-100 dark:border-gray-700 my-1"></div>
                                            <button
                                                onClick={() => {
                                                    onCloseJob(job);
                                                    setShowDropdown(false);
                                                }}
                                                className="w-full text-left px-3 py-2 text-[11px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                Close
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        )}
                        {isPending && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onApprove(job)}
                                    className="px-2.5 py-1 rounded-lg bg-green-600 text-white text-[10px] font-semibold hover:bg-green-700 transition-colors"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => onReject(job)}
                                    className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-semibold hover:bg-red-700 transition-colors"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-auto">
                <button
                    onClick={() => onViewDetails(job)}
                    className="w-full py-2.5 rounded-xl text-blue-600 text-[12px] font-semibold hover:bg-blue-50 transition-colors border border-blue-200 bg-white"
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

export default function AllJobs({ auth }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedJob, setSelectedJob] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const modalRef = useRef(null);
    const [editingJob, setEditingJob] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [editSaving, setEditSaving] = useState(false);
    const [editFields, setEditFields] = useState({
        skillsList: [],
        currentSkill: "",
        perksList: [],
        currentPerk: "",
        responsibilities: [],
        currentResponsibility: "",
        qualificationsList: [],
        currentQualification: "",
        assets: [],
    });
    const [confirmToggleOpen, setConfirmToggleOpen] = useState(false);
    const [confirmToggleJob, setConfirmToggleJob] = useState(null);
    const [confirmToggleStatus, setConfirmToggleStatus] = useState(null);
    const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
    const [confirmCloseJob, setConfirmCloseJob] = useState(null);
    const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
    const [confirmApproveJob, setConfirmApproveJob] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [confirmDeleteJob, setConfirmDeleteJob] = useState(null);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectJob, setRejectJob] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectSubmitting, setRejectSubmitting] = useState(false);

    const { successAlert, errorAlert } = useAlerts();

    // Load jobs from API on component mount
    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await fetch(route('super.job.requests.api.all'));
            const data = await response.json();
            if (data.success) {
                setJobs(data.data);
            } else {
                setJobs([]);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (job, newStatus) => {
        if (job.status === newStatus) return;
        setConfirmToggleJob(job);
        setConfirmToggleStatus(newStatus);
        setConfirmToggleOpen(true);
    };

    const confirmToggle = async () => {
        if (!confirmToggleJob || !confirmToggleStatus) return;

        try {
            const response = await fetch(route('super.job.requests.api.toggle-status', confirmToggleJob.id), {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: confirmToggleStatus }),
            });

            const data = await response.json().catch(() => null);
            if (!response.ok || !data?.success) {
                const message =
                    data?.message === 'Only approved or closed jobs can be toggled.'
                        ? 'Approve the job first to change status.'
                        : (data?.message || 'Failed to update job status.');
                errorAlert(message);
                return;
            }

            setJobs(prev => prev.map(j => (j.id === confirmToggleJob.id ? data.data : j)));
            successAlert('Job status updated successfully!');
        } catch (error) {
            console.error('Error changing job status:', error);
            errorAlert('Failed to update job status.');
        } finally {
            setConfirmToggleOpen(false);
            setConfirmToggleJob(null);
            setConfirmToggleStatus(null);
        }
    };

    const handleCloseJob = (job) => {
        setConfirmCloseJob(job);
        setConfirmCloseOpen(true);
    };

    const confirmClose = async () => {
        if (!confirmCloseJob) return;

        try {
            const response = await fetch(route('super.job.requests.api.close', confirmCloseJob.id), {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json().catch(() => null);
            if (!response.ok || !data?.success) {
                errorAlert(data?.message || 'Failed to close job.');
                return;
            }

            setJobs(prev => prev.map(j => (j.id === confirmCloseJob.id ? data.data : j)));
            successAlert('Job closed successfully!');
        } catch (error) {
            console.error('Error closing job:', error);
            errorAlert('Failed to close job.');
        } finally {
            setConfirmCloseOpen(false);
            setConfirmCloseJob(null);
        }
    };

    const handleApproveJob = (job) => {
        setConfirmApproveJob(job);
        setConfirmApproveOpen(true);
    };

    const confirmApprove = async () => {
        if (!confirmApproveJob) return;

        try {
            const response = await fetch(route('super.job.requests.api.approve', confirmApproveJob.id), {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                },
            });

            const data = await response.json().catch(() => null);
            if (!response.ok || !data?.success) {
                errorAlert(data?.message || 'Failed to approve job.');
                return;
            }

            setJobs(prev => prev.map(j => (j.id === confirmApproveJob.id ? data.data : j)));
            if (selectedJob?.id === confirmApproveJob.id) {
                setSelectedJob(data.data);
            }
            successAlert('Job approved successfully!');
        } catch (error) {
            console.error('Error approving job:', error);
            errorAlert('Failed to approve job.');
        } finally {
            setConfirmApproveOpen(false);
            setConfirmApproveJob(null);
        }
    };

    const handleRejectJob = (job) => {
        setRejectJob(job);
        setRejectionReason('');
        setRejectOpen(true);
    };

    const submitReject = async () => {
        if (!rejectJob || rejectSubmitting) return;
        setRejectSubmitting(true);

        try {
            const response = await fetch(route('super.job.requests.api.reject', rejectJob.id), {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rejection_reason: rejectionReason || null }),
            });

            const data = await response.json().catch(() => null);
            if (!response.ok || !data?.success) {
                errorAlert(data?.message || 'Failed to reject job.');
                return;
            }

            setJobs(prev => prev.map(j => (j.id === rejectJob.id ? data.data : j)));
            if (selectedJob?.id === rejectJob.id) {
                setSelectedJob(data.data);
            }
            successAlert('Job rejected successfully!');
            setRejectOpen(false);
            setRejectJob(null);
            setRejectionReason('');
        } catch (error) {
            console.error('Error rejecting job:', error);
            errorAlert('Failed to reject job.');
        } finally {
            setRejectSubmitting(false);
        }
    };

    const handleViewDetails = async (job) => {
        setDetailsLoading(true);
        setSelectedJob(null);
        try {
            const response = await fetch(route('super.job.requests.api.show', job.id), {
                headers: {
                    'Accept': 'application/json',
                },
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setSelectedJob(data.data);
            } else {
                const message = (response.status === 404 || data.message?.includes('No query results'))
                    ? 'This job post no longer exists or has been deleted.'
                    : (data.message || 'Failed to load job details.');
                errorAlert(message);
                if (response.status === 404 || !data.data) {
                    setJobs(prev => prev.filter(j => j.id !== job.id));
                }
            }
        } catch (error) {
            console.error('Error fetching job details:', error);
            errorAlert('Failed to load job details.');
        } finally {
            setDetailsLoading(false);
        }
    };

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setSelectedJob(null);
                setDetailsLoading(false);
            }
        };

        if (selectedJob) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [selectedJob]);

    const handleDelete = async (job) => {
        setConfirmDeleteJob(job);
        setConfirmDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!confirmDeleteJob) return;

        try {
            const response = await fetch(route('super.job.requests.api.destroy', confirmDeleteJob.id), {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                },
            });
            const data = await response.json().catch(() => null);
            if (!response.ok || !data?.success) {
                errorAlert(data?.message || 'Failed to delete job.');
                return;
            }

            setJobs((prev) => prev.filter((j) => j.id !== confirmDeleteJob.id));
            if (selectedJob?.id === confirmDeleteJob.id) setSelectedJob(null);
            if (editingJob?.id === confirmDeleteJob.id) {
                setEditingJob(null);
                setEditForm(null);
            }
            successAlert('Job post deleted successfully!');
        } catch (error) {
            console.error('Error deleting job:', error);
            errorAlert('Failed to delete job.');
        } finally {
            setConfirmDeleteOpen(false);
            setConfirmDeleteJob(null);
        }
    };

    const toDateInputValue = (value) => {
        if (!value) return "";
        const str = String(value);
        const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
        if (match) return match[1];
        const d = new Date(str);
        if (Number.isNaN(d.getTime())) return "";
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };

    const handleEdit = (job) => {
        const salary = parseSalaryRange(job.salary);
        setEditingJob(job);
        setEditForm({
            title: job.title || '',
            company: job.company || '',
            location: job.location || '',
            job_type: job.job_type || job.type || 'Full Time',
            job_category: job.job_category || '',
            openings: job.openings || 1,
            experience: job.experience || '',
            min_salary: salary.min,
            max_salary: salary.max,
            salary_period: salary.period,
            last_date: toDateInputValue(job.last_date || job.lastDate),
            description: job.description || '',
            company_image: null,
            company_image_preview: job.company_image || job.companyImage || '',
            contact_person: job.contact_person || '',
            contact_phone: job.contact_phone || '',
            contact_email: job.contact_email || '',
            company_address: job.company_address || '',
        });
        setEditFields(prev => ({
            ...prev,
            skillsList: Array.isArray(job.skills) ? [...job.skills] : splitCommaList(job.skills),
            currentSkill: '',
            perksList: Array.isArray(job.perks) ? [...job.perks] : splitCommaList(job.perks),
            currentPerk: '',
            responsibilities: Array.isArray(job.key_responsibilities || job.keyResponsibilities)
                ? [...(job.key_responsibilities || job.keyResponsibilities)]
                : splitCommaList(job.key_responsibilities || job.keyResponsibilities),
            currentResponsibility: '',
            qualificationsList: Array.isArray(job.qualifications) ? [...job.qualifications] : splitCommaList(job.qualifications),
            currentQualification: '',
            assets: Array.isArray(job.assets) ? [...job.assets] : [],
        }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'min_salary' || name === 'max_salary') {
            setEditForm(prev => ({ ...prev, [name]: value.replace(/[^0-9]/g, '') }));
            return;
        }
        if (name === 'openings') {
            const numVal = parseInt(value) || '';
            if (numVal !== '' && numVal < 1) return;
            setEditForm(prev => ({ ...prev, [name]: numVal }));
            return;
        }
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSkillAdd = () => {
        if (editFields.currentSkill.trim()) {
            setEditFields(prev => ({
                ...prev,
                skillsList: [...prev.skillsList, prev.currentSkill.trim()],
                currentSkill: ''
            }));
        }
    };
    const handleEditSkillRemove = (idx) => {
        setEditFields(prev => ({ ...prev, skillsList: prev.skillsList.filter((_, i) => i !== idx) }));
    };

    const handleEditPerkAdd = () => {
        if (editFields.currentPerk.trim()) {
            setEditFields(prev => ({
                ...prev,
                perksList: [...prev.perksList, prev.currentPerk.trim()],
                currentPerk: ''
            }));
        }
    };
    const handleEditPerkRemove = (idx) => {
        setEditFields(prev => ({ ...prev, perksList: prev.perksList.filter((_, i) => i !== idx) }));
    };

    const handleEditRespAdd = () => {
        if (editFields.currentResponsibility.trim()) {
            setEditFields(prev => ({
                ...prev,
                responsibilities: [...prev.responsibilities, prev.currentResponsibility.trim()],
                currentResponsibility: ''
            }));
        }
    };
    const handleEditRespRemove = (idx) => {
        setEditFields(prev => ({ ...prev, responsibilities: prev.responsibilities.filter((_, i) => i !== idx) }));
    };

    const handleEditQualAdd = () => {
        if (editFields.currentQualification.trim()) {
            setEditFields(prev => ({
                ...prev,
                qualificationsList: [...prev.qualificationsList, prev.currentQualification.trim()],
                currentQualification: ''
            }));
        }
    };
    const handleEditQualRemove = (idx) => {
        setEditFields(prev => ({ ...prev, qualificationsList: prev.qualificationsList.filter((_, i) => i !== idx) }));
    };

    const handleEditToggleAsset = (asset) => {
        setEditFields(prev => ({
            ...prev,
            assets: prev.assets.includes(asset)
                ? prev.assets.filter(a => a !== asset)
                : [...prev.assets, asset]
        }));
    };

    const handleEditImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditForm(prev => ({
                    ...prev,
                    company_image: file,
                    company_image_preview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editingJob || !editForm) return;
        setEditSaving(true);

        const formData = new FormData();
        formData.append('title', editForm.title);
        formData.append('company', editForm.company);
        formData.append('location', editForm.location);
        formData.append('job_type', editForm.job_type);
        formData.append('job_category', editForm.job_category || '');
        formData.append('openings', editForm.openings || 1);
        formData.append('experience', editForm.experience);
        const salaryRange = `₹${editForm.min_salary || 0} - ₹${editForm.max_salary || 0}/${editForm.salary_period || 'Monthly'}`;
        formData.append('salary', salaryRange);
        formData.append('last_date', editForm.last_date);
        formData.append('description', editForm.description);
        formData.append('skills', JSON.stringify(editFields.skillsList));
        formData.append('perks', JSON.stringify(editFields.perksList));
        formData.append('key_responsibilities', JSON.stringify(editFields.responsibilities));
        formData.append('qualifications', JSON.stringify(editFields.qualificationsList));
        formData.append('assets', JSON.stringify(editFields.assets));
        formData.append('contact_person', editForm.contact_person);
        formData.append('contact_phone', editForm.contact_phone);
        formData.append('contact_email', editForm.contact_email);
        formData.append('company_address', editForm.company_address);

        if (editForm.company_image) {
            formData.append('company_image', editForm.company_image);
        }

        try {
            const response = await fetch(route('super.job.requests.api.update', editingJob.id), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const data = await response.json().catch(() => null);
            if (!response.ok || !data?.success) {
                errorAlert(data?.message || 'Failed to update job');
                return;
            }

            setJobs(prev => prev.map(j => (j.id === editingJob.id ? data.data : j)));
            if (selectedJob?.id === editingJob.id) {
                setSelectedJob(data.data);
            }
            successAlert('Job updated successfully!');
            setEditingJob(null);
            setEditForm(null);
        } catch (error) {
            console.error('Error updating job:', error);
            errorAlert('Failed to update job');
        } finally {
            setEditSaving(false);
        }
    };

    // Filter jobs based on search query and active tab
    const filteredJobs = jobs.filter((job) => {
        // Exclude pending jobs from All Jobs section
        if (job.status === 'pending') return false;

        // Search filter: only filter when 3+ characters, show all when less than 3
        const matchesSearch =
            searchQuery.length < 3 ||
            job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.creator?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        // Tab filter
        let matchesTab = true;
        if (activeTab !== 'all') {
            matchesTab = job.status === activeTab;
        }

        return matchesSearch && matchesTab;
    });

    const getJobCounts = () => {
        const nonPendingJobs = jobs.filter(j => j.status !== 'pending');
        return {
            all: nonPendingJobs.length,
            active: jobs.filter((j) => j.status === 'active').length,
            inactive: jobs.filter((j) => j.status === 'inactive').length,
            pending: jobs.filter((j) => j.status === 'pending').length,
            declined: jobs.filter((j) => j.status === 'declined').length,
            closed: jobs.filter((j) => j.status === 'closed').length,
        };
    };

    const counts = getJobCounts();

    const tabs = [
        { key: 'all', label: 'All Jobs', count: counts.all },
        { key: 'active', label: 'Active', count: counts.active },
        { key: 'declined', label: 'Rejected', count: counts.declined },
        { key: 'inactive', label: 'Deactivated', count: counts.inactive },
        { key: 'closed', label: 'Closed', count: counts.closed },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="All Job Listings" />

            <div className="min-h-screen bg-slate-100 dark:bg-gray-900 p-4 sm:p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
                            All Job Listings
                        </h1>
                        <p className="text-slate-500 dark:text-gray-400 mt-1">
                            View and manage all job posts from all admins
                        </p>
                    </div>

                    {/* Filter Tabs and Search Bar - Same Row */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        {/* Filter Tabs */}
                        <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key
                                        ? "bg-[#5146E6] text-white"
                                        : "bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700"
                                    }`}
                            >
                                {tab.label}
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key
                                        ? "bg-white/20 text-white"
                                        : "bg-slate-200 dark:bg-gray-600 text-slate-700 dark:text-gray-300"
                                    }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full lg:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by job title, company, or admin name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Jobs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {loading ? (
                            <div className="col-span-full flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5146E6]"></div>
                            </div>
                        ) : filteredJobs.length > 0 ? (
                            filteredJobs.map((job, idx) => (
                                <JobCard
                                    key={idx}
                                    job={job}
                                    onStatusChange={handleStatusChange}
                                    onCloseJob={handleCloseJob}
                                    onApprove={handleApproveJob}
                                    onReject={handleRejectJob}
                                    onViewDetails={handleViewDetails}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))
                        ) : (
                            <div className="col-span-full flex items-center justify-center py-12">
                                <div className="text-center">
                                    <svg
                                        className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        {searchQuery ? 'No Jobs Found' : 'No Job Listings Found'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {searchQuery
                                            ? `No jobs matching "${searchQuery}" found. Try a different search term.`
                                            : 'No job posts have been created yet.'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {(selectedJob || detailsLoading) && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div ref={modalRef} className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedJob(null);
                                        setDetailsLoading(false);
                                    }}
                                    className="absolute top-4 right-4 z-20 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    aria-label="Close"
                                >
                                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <div className="max-h-[90vh] overflow-y-auto">
                                <div className="p-6 pr-14">
                                    <div className="flex gap-3 mb-4">
                                        {selectedJob ? (
                                            <img
                                                src={selectedJob.company_image || selectedJob.companyImage}
                                                alt={selectedJob.title}
                                                className="w-12 h-12 rounded-xl object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-gray-700" />
                                        )}
                                        <div>
                                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{selectedJob?.title || 'Loading...'}</h2>
                                            <p className="text-slate-500 dark:text-gray-400">{selectedJob?.company || ''}</p>
                                        </div>
                                    </div>

                                    {detailsLoading && !selectedJob ? (
                                        <div className="py-10 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5146E6]" />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${selectedJob?.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        selectedJob?.status === 'inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                            selectedJob?.status === 'closed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                                selectedJob?.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                    selectedJob?.status === 'declined' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {selectedJob?.status}
                                                </span>
                                                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium whitespace-nowrap">
                                                    {selectedJob?.job_type || selectedJob?.type}
                                                </span>
                                            </div>

                                            {selectedJob?.status === 'pending' && (
                                                <div className="flex items-center gap-2 mb-4">
                                                    <button
                                                        onClick={() => handleApproveJob(selectedJob)}
                                                        className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectJob(selectedJob)}
                                                        className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}

                                            {selectedJob?.status === 'declined' && selectedJob?.rejection_reason && (
                                                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                                    <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Rejection Reason</h3>
                                                    <p className="text-sm text-red-600 dark:text-red-300">{selectedJob.rejection_reason}</p>
                                                </div>
                                            )}

                                            <div className="space-y-4 text-slate-600 dark:text-gray-400">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-slate-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span>{selectedJob?.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-slate-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>{selectedJob?.experience}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-slate-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">{selectedJob?.salary}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-slate-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0h-6v-1a6 6 0 00-9 5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                        </svg>
                                                        <span>{selectedJob?.applicants || 0} applicants</span>
                                                    </div>
                                                </div>

                                                <div className="border-t dark:border-gray-700 pt-4">
                                                    <h3 className="font-semibold text-slate-800 dark:text-gray-200 mb-2">Description</h3>
                                                    <p className="text-sm leading-relaxed dark:text-gray-400">{selectedJob?.description || 'No description available.'}</p>
                                                </div>

                                                {selectedJob?.responsibilities && (
                                                    <div className="border-t pt-4">
                                                        <h3 className="font-semibold text-slate-800 mb-2">Responsibilities</h3>
                                                        <ul className="list-disc list-inside text-sm space-y-1">
                                                            {Array.isArray(selectedJob.responsibilities) ? selectedJob.responsibilities.map((item, idx) => (
                                                                <li key={idx}>{item}</li>
                                                            )) : <li>{selectedJob.responsibilities}</li>}
                                                        </ul>
                                                    </div>
                                                )}

                                                {selectedJob?.requirements && (
                                                    <div className="border-t pt-4">
                                                        <h3 className="font-semibold text-slate-800 mb-2">Requirements</h3>
                                                        <ul className="list-disc list-inside text-sm space-y-1">
                                                            {Array.isArray(selectedJob.requirements) ? selectedJob.requirements.map((item, idx) => (
                                                                <li key={idx}>{item}</li>
                                                            )) : <li>{selectedJob.requirements}</li>}
                                                        </ul>
                                                    </div>
                                                )}

                                                {selectedJob?.skills && selectedJob.skills.length > 0 && (
                                                    <div className="border-t pt-4">
                                                        <h3 className="font-semibold text-slate-800 mb-2">Skills</h3>
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedJob.skills.map((skill, idx) => (
                                                                <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedJob?.perks && selectedJob.perks.length > 0 && (
                                                    <div className="border-t pt-4">
                                                        <h3 className="font-semibold text-slate-800 mb-2">Perks & Benefits</h3>
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedJob.perks.map((perk, idx) => (
                                                                <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-sm font-medium">
                                                                    {perk}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="border-t pt-4">
                                                    <h3 className="font-semibold text-slate-800 mb-2">Applicants</h3>
                                                    {Array.isArray(selectedJob?.applications) && selectedJob.applications.length > 0 ? (
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full text-sm">
                                                                <thead>
                                                                    <tr className="text-left text-slate-500">
                                                                        <th className="py-2 pr-3 font-medium">Name</th>
                                                                        <th className="py-2 pr-3 font-medium">Email</th>
                                                                        <th className="py-2 pr-3 font-medium">Phone</th>
                                                                        <th className="py-2 pr-3 font-medium">Status</th>
                                                                        <th className="py-2 pr-3 font-medium">Applied</th>
                                                                        <th className="py-2 font-medium">Resume</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-slate-100">
                                                                    {selectedJob.applications.map((app) => (
                                                                        <tr key={app.id} className="align-top">
                                                                            <td className="py-2 pr-3 text-slate-800">{app.candidate_name || app.candidate?.name || '-'}</td>
                                                                            <td className="py-2 pr-3">{app.candidate_email || app.candidate?.email || '-'}</td>
                                                                            <td className="py-2 pr-3">{app.candidate_phone || app.candidate?.phone || '-'}</td>
                                                                            <td className="py-2 pr-3 capitalize">{app.status || '-'}</td>
                                                                            <td className="py-2 pr-3">{app.created_at ? new Date(app.created_at).toLocaleString('en-US') : '-'}</td>
                                                                            <td className="py-2">
                                                                                {app.resume_url ? (
                                                                                    <a
                                                                                        href={(String(app.resume_url).startsWith('http') || String(app.resume_url).startsWith('/') ? app.resume_url : `/${app.resume_url}`)}
                                                                                        target="_blank"
                                                                                        rel="noreferrer"
                                                                                        className="text-[#5146E6] hover:underline"
                                                                                    >
                                                                                        View
                                                                                    </a>
                                                                                ) : (
                                                                                    <span className="text-slate-400">—</span>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-slate-500">No applications yet.</p>
                                                    )}
                                                </div>

                                                <div className="border-t pt-4">
                                                    <h3 className="font-semibold text-slate-800 mb-2">Posted By</h3>
                                                    <p className="text-sm">{selectedJob?.creator?.name || 'Unknown'} on {selectedJob?.created_at ? new Date(selectedJob.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {editingJob && editForm && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div ref={modalRef} className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingJob(null);
                                        setEditForm(null);
                                    }}
                                    className="absolute top-4 right-4 z-20 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    aria-label="Close"
                                >
                                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <div className="max-h-[90vh] overflow-y-auto">
                                <form onSubmit={handleEditSubmit} className="p-6 pr-14">
    <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Edit Job</h2>
        <p className="text-sm text-slate-500 dark:text-gray-400">{editingJob.title}</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Job Title</label>
            <input
                name="title"
                value={editForm.title}
                onChange={handleEditInputChange}
                className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                required
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Company</label>
            <input
                name="company"
                value={editForm.company}
                onChange={handleEditInputChange}
                className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                required
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Location</label>
            <LocationInput
                value={editForm.location}
                onChange={(value) => setEditForm(prev => ({ ...prev, location: value }))}
                placeholder="Enter job location"
            />
        </div>
         <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Job Type</label>
             <select
                 name="job_type"
                 value={editForm.job_type}
                 onChange={handleEditInputChange}
                 className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                 required
             >
                 <option value="Full Time">Full Time</option>
                 <option value="Part Time">Part Time</option>
                 <option value="Contract">Contract</option>
                 <option value="Internship">Internship</option>
                 <option value="Remote">Remote</option>
                 <option value="Hybrid">Hybrid</option>
             </select>
         </div>
         <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Job Category</label>
             <select
                 name="job_category"
                 value={editForm.job_category || ''}
                 onChange={handleEditInputChange}
                 className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
             >
                 <option value="">Select Category</option>
                 {JOB_CATEGORIES.map((category) => (
                     <option key={category} value={category}>
                         {category}
                     </option>
                 ))}
             </select>
         </div>
         <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Number of Openings</label>
            <input
                type="number"
                name="openings"
                value={editForm.openings}
                onChange={handleEditInputChange}
                min="1"
                className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Experience</label>
            <select
                name="experience"
                value={editForm.experience}
                onChange={handleEditInputChange}
                className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                required
            >
                <option value="">Select Experience</option>
                <option value="0-1 Year">0-1 Year</option>
                <option value="1-2 Years">1-2 Years</option>
                <option value="2-3 Years">2-3 Years</option>
                <option value="3-4 Years">3-4 Years</option>
                <option value="4+ Years">4+ Years</option>
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Last Date</label>
            <input
                type="date"
                name="last_date"
                value={editForm.last_date}
                onChange={handleEditInputChange}
                className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Company Logo</label>
            <input
                type="file"
                accept="image/*"
                onChange={handleEditImageUpload}
                className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
            />
            {editForm.company_image_preview ? (
                <img src={editForm.company_image_preview} alt="Preview" className="mt-2 w-20 h-20 rounded-xl object-cover border border-slate-200" />
            ) : null}
        </div>
        {/* Salary */}
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Minimum Salary</label>
            <input
                name="min_salary"
                value={editForm.min_salary}
                onChange={handleEditInputChange}
                className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                inputMode="numeric"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Maximum Salary</label>
            <input
                name="max_salary"
                value={editForm.max_salary}
                onChange={handleEditInputChange}
                className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                inputMode="numeric"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Salary Period</label>
            <select
                name="salary_period"
                value={editForm.salary_period}
                onChange={handleEditInputChange}
                className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
            >
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
                <option value="Yearly">Yearly</option>
            </select>
        </div>
        {/* Assets Required */}
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Assets Required <span className="text-xs text-slate-400">(Optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
                {ASSETS_OPTIONS.map((asset) => (
                    <button
                        key={asset}
                        type="button"
                        onClick={() => handleEditToggleAsset(asset)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            editFields.assets.includes(asset)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                        }`}
                    >
                        {asset}
                    </button>
                ))}
            </div>
        </div>
        {/* Skills - Dynamic List */}
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Skills Required</label>
            <div className="flex gap-2 mb-2">
                <input
                    value={editFields.currentSkill}
                    onChange={(e) => setEditFields(prev => ({ ...prev, currentSkill: e.target.value }))}
                    onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleEditSkillAdd(); } }}
                    placeholder="Type a skill and press Enter"
                    className="flex-1 border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                />
                <button type="button" onClick={handleEditSkillAdd} className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
                {editFields.skillsList.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                        {skill}
                        <button type="button" onClick={() => handleEditSkillRemove(idx)} className="text-blue-600 hover:text-blue-800">✕</button>
                    </span>
                ))}
            </div>
        </div>
        {/* Perks - Dynamic List */}
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Perks & Benefits</label>
            <div className="flex gap-2 mb-2">
                <input
                    value={editFields.currentPerk}
                    onChange={(e) => setEditFields(prev => ({ ...prev, currentPerk: e.target.value }))}
                    onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleEditPerkAdd(); } }}
                    placeholder="Type a perk and press Enter"
                    className="flex-1 border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                />
                <button type="button" onClick={handleEditPerkAdd} className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
                {editFields.perksList.map((perk, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2">
                        {perk}
                        <button type="button" onClick={() => handleEditPerkRemove(idx)} className="text-green-600 hover:text-green-800">✕</button>
                    </span>
                ))}
            </div>
        </div>
        {/* Job Description */}
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Job Description</label>
            <textarea
                name="description"
                value={editForm.description}
                onChange={handleEditInputChange}
                rows={4}
                className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
            />
        </div>
        {/* Responsibilities - Dynamic List */}
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Key Responsibilities</label>
            <div className="flex gap-2 mb-2">
                <input
                    value={editFields.currentResponsibility}
                    onChange={(e) => setEditFields(prev => ({ ...prev, currentResponsibility: e.target.value }))}
                    onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleEditRespAdd(); } }}
                    placeholder="Type a responsibility and press Enter"
                    className="flex-1 border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                />
                <button type="button" onClick={handleEditRespAdd} className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Add</button>
            </div>
            <div className="space-y-1">
                {editFields.responsibilities.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                        <span className="text-blue-500">•</span>
                        <span className="flex-1">{item}</span>
                        <button type="button" onClick={() => handleEditRespRemove(idx)} className="text-red-500 hover:text-red-700">✕</button>
                    </div>
                ))}
            </div>
        </div>
        {/* Qualifications - Dynamic List */}
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Qualifications</label>
            <div className="flex gap-2 mb-2">
                <input
                    value={editFields.currentQualification}
                    onChange={(e) => setEditFields(prev => ({ ...prev, currentQualification: e.target.value }))}
                    onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleEditQualAdd(); } }}
                    placeholder="Type a qualification and press Enter"
                    className="flex-1 border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                />
                <button type="button" onClick={handleEditQualAdd} className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Add</button>
            </div>
            <div className="space-y-1">
                {editFields.qualificationsList.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                        <span className="text-blue-500">•</span>
                        <span className="flex-1">{item}</span>
                        <button type="button" onClick={() => handleEditQualRemove(idx)} className="text-red-500 hover:text-red-700">✕</button>
                    </div>
                ))}
            </div>
        </div>
        {/* Company Details Section */}
        <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Company Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Contact Person Name</label>
                    <input
                        name="contact_person"
                        value={editForm.contact_person}
                        onChange={handleEditInputChange}
                        placeholder="Enter contact person name"
                        className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Phone Number</label>
                    <input
                        name="contact_phone"
                        value={editForm.contact_phone}
                        onChange={handleEditInputChange}
                        placeholder="Enter phone number"
                        className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Email Address</label>
                    <input
                        name="contact_email"
                        value={editForm.contact_email}
                        onChange={handleEditInputChange}
                        placeholder="Enter email address"
                        className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Company Address</label>
                    <textarea
                        name="company_address"
                        value={editForm.company_address}
                        onChange={handleEditInputChange}
                        rows={2}
                        placeholder="Enter company address"
                        className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                    />
                </div>
            </div>
        </div>
    </div>

    <div className="mt-6 flex items-center justify-end gap-3">
        <button
            type="button"
            onClick={() => {
                setEditingJob(null);
                setEditForm(null);
            }}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700"
            disabled={editSaving}
        >
            Cancel
        </button>
        <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#5146E6] text-white hover:bg-[#4338CA] disabled:opacity-60"
            disabled={editSaving}
        >
            {editSaving ? 'Saving...' : 'Save Changes'}
        </button>
    </div>
</form>
                                </div>
                            </div>
                        </div>
                    )}

                    <ConfirmDialog
                        isOpen={confirmToggleOpen}
                        onClose={() => {
                            setConfirmToggleOpen(false);
                            setConfirmToggleJob(null);
                            setConfirmToggleStatus(null);
                        }}
                        onConfirm={confirmToggle}
                        message={
                            confirmToggleJob
                                ? `${confirmToggleStatus === 'active' ? 'Activate' : 'Deactivate'} "${confirmToggleJob.title}"?`
                                : 'Are you sure you want to change job status?'
                        }
                        confirmText={confirmToggleStatus === 'active' ? 'Yes, Activate' : 'Yes, Deactivate'}
                        cancelText="Cancel"
                        modalSpinnerMessage="Processing Please Wait...."
                    />

                    <ConfirmDialog
                        isOpen={confirmCloseOpen}
                        onClose={() => {
                            setConfirmCloseOpen(false);
                            setConfirmCloseJob(null);
                        }}
                        onConfirm={confirmClose}
                        message={
                            confirmCloseJob
                                ? `Close "${confirmCloseJob.title}"? This action cannot be undone.`
                                : 'Are you sure you want to close this job?'
                        }
                        confirmText="Yes, Close"
                        cancelText="Cancel"
                        modalSpinnerMessage="Closing Please Wait...."
                    />

                    <ConfirmDialog
                        isOpen={confirmApproveOpen}
                        onClose={() => {
                            setConfirmApproveOpen(false);
                            setConfirmApproveJob(null);
                        }}
                        onConfirm={confirmApprove}
                        message={confirmApproveJob ? `Approve "${confirmApproveJob.title}"?` : 'Approve this job?'}
                        confirmText="Yes, Approve"
                        cancelText="Cancel"
                        modalSpinnerMessage="Approving Please Wait...."
                    />

                    <ConfirmDialog
                        isOpen={confirmDeleteOpen}
                        onClose={() => {
                            setConfirmDeleteOpen(false);
                            setConfirmDeleteJob(null);
                        }}
                        onConfirm={confirmDelete}
                        message={confirmDeleteJob ? `Delete "${confirmDeleteJob.title}" job post?` : 'Delete this job post?'}
                        confirmText="Yes, Delete"
                        cancelText="Cancel"
                        modalSpinnerMessage="Deleting Please Wait...."
                    />

                    {rejectOpen && rejectJob && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="relative bg-white rounded-2xl max-w-md w-full shadow-xl">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (rejectSubmitting) return;
                                        setRejectOpen(false);
                                        setRejectJob(null);
                                        setRejectionReason('');
                                    }}
                                    className="absolute top-4 right-4 z-20 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-100 transition-colors"
                                >
                                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <div className="p-6">
                                    <div className="mb-4 pr-14">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">Reject Job</h3>
                                            <p className="text-sm text-slate-500">{rejectJob.title}</p>
                                        </div>
                                    </div>

                                    <label className="block text-sm font-medium text-slate-700 mb-2">Rejection Reason (optional)</label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        rows={4}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        placeholder="Write reason..."
                                        disabled={rejectSubmitting}
                                    />

                                    <div className="mt-5 flex items-center justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setRejectOpen(false);
                                                setRejectJob(null);
                                                setRejectionReason('');
                                            }}
                                            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                            disabled={rejectSubmitting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={submitReject}
                                            className="px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                                            disabled={rejectSubmitting}
                                        >
                                            {rejectSubmitting ? 'Rejecting...' : 'Reject'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
