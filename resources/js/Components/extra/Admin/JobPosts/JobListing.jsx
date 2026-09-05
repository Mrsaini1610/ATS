import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import LocationInput from '../../../Components/LocationInput';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import ResumePreviewModal from '../../../Components/ResumePreviewModal';
import { useAlerts } from '../../../Components/Alerts';

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

const QUESTION_TYPE_OPTIONS = [
    { value: 'text', label: 'Text Input' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'single_select', label: 'Single Select' },
    { value: 'multi_select', label: 'Multiple Select' },
];

const QUESTION_TYPE_LABELS = QUESTION_TYPE_OPTIONS.reduce((labels, option) => {
    labels[option.value] = option.label;
    return labels;
}, {});

const createQuestionDraft = () => ({
    id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    question: '',
    type: 'text',
    required: false,
    options: [''],
});

const isSelectQuestionType = (type) => ['single_select', 'multi_select'].includes(type);

const normalizeQuestionDrafts = (questions = []) =>
    (Array.isArray(questions) ? questions : [])
        .map((question) => {
            const options = Array.isArray(question?.options)
                ? question.options.map((option) => String(option || '').trim()).filter(Boolean)
                : [];

            return {
                id: question?.id || undefined,
                question: String(question?.question || '').trim(),
                type: question?.type || 'text',
                required: !!question?.required,
                options,
            };
        })
        .filter((question) => question.question || question.options.length > 0);

const formatScreeningAnswerPreview = (answer) => {
    if (Array.isArray(answer)) {
        return answer.filter(Boolean).join(', ') || 'No answer';
    }

    if (answer === null || answer === undefined || String(answer).trim() === '') {
        return 'No answer';
    }

    return String(answer);
};

const ScreeningQuestionsEditor = ({ questions, onChange }) => {
    const safeQuestions = Array.isArray(questions) ? questions : [];

    const updateQuestion = (index, updates) => {
        onChange(safeQuestions.map((question, questionIndex) => (
            questionIndex === index ? { ...question, ...updates } : question
        )));
    };

    const removeQuestion = (index) => {
        onChange(safeQuestions.filter((_, questionIndex) => questionIndex !== index));
    };

    const addQuestion = () => {
        onChange([...safeQuestions, createQuestionDraft()]);
    };

    const updateOption = (questionIndex, optionIndex, value) => {
        onChange(safeQuestions.map((question, currentQuestionIndex) => {
            if (currentQuestionIndex !== questionIndex) {
                return question;
            }

            const options = Array.isArray(question.options) ? [...question.options] : [''];
            options[optionIndex] = value;

            return { ...question, options };
        }));
    };

    const addOption = (questionIndex) => {
        onChange(safeQuestions.map((question, currentQuestionIndex) => {
            if (currentQuestionIndex !== questionIndex) {
                return question;
            }

            return {
                ...question,
                options: [...(Array.isArray(question.options) ? question.options : []), ''],
            };
        }));
    };

    const removeOption = (questionIndex, optionIndex) => {
        onChange(safeQuestions.map((question, currentQuestionIndex) => {
            if (currentQuestionIndex !== questionIndex) {
                return question;
            }

            const options = (Array.isArray(question.options) ? question.options : []).filter((_, currentOptionIndex) => currentOptionIndex !== optionIndex);

            return {
                ...question,
                options: options.length > 0 ? options : [''],
            };
        }));
    };

    return (
        <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
            <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Application Questions</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400">
                        Add dynamic screening questions for applicants.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={addQuestion}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                >
                    Add Question
                </button>
            </div>

            {safeQuestions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-gray-600 px-4 py-5 text-sm text-slate-500 dark:text-gray-400">
                    No screening questions added yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {safeQuestions.map((question, index) => (
                        <div key={question.id || index} className="rounded-2xl border border-slate-200 dark:border-gray-700 p-4 space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-slate-700 dark:text-gray-200">
                                    Question {index + 1}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(index)}
                                    className="text-sm font-medium text-red-600 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                                        Question Text
                                    </label>
                                    <input
                                        value={question.question || ''}
                                        onChange={(event) => updateQuestion(index, { question: event.target.value })}
                                        className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                                        placeholder="Enter question"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                                        Answer Type
                                    </label>
                                    <select
                                        value={question.type || 'text'}
                                        onChange={(event) => updateQuestion(index, {
                                            type: event.target.value,
                                            options: isSelectQuestionType(event.target.value)
                                                ? (Array.isArray(question.options) && question.options.length > 0 ? question.options : [''])
                                                : [],
                                        })}
                                        className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                                    >
                                        {QUESTION_TYPE_OPTIONS.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={!!question.required}
                                            onChange={(event) => updateQuestion(index, { required: event.target.checked })}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        Required answer
                                    </label>
                                </div>
                            </div>

                            {isSelectQuestionType(question.type) && (
                                <div>
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                                            Options
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => addOption(index)}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                        >
                                            Add Option
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {(Array.isArray(question.options) ? question.options : ['']).map((option, optionIndex) => (
                                            <div key={`${question.id || index}-${optionIndex}`} className="flex items-center gap-2">
                                                <input
                                                    value={option}
                                                    onChange={(event) => updateOption(index, optionIndex, event.target.value)}
                                                    className="flex-1 border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                                                    placeholder={`Option ${optionIndex + 1}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(index, optionIndex)}
                                                    className="px-3 py-3 rounded-xl border border-slate-200 dark:border-gray-600 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const JobCard = ({ job, onViewDetails, onViewApplications, onEdit, onDelete, onResend, onStatusChange, onCloseJob }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const canToggleStatus = ['active', 'inactive', 'closed'].includes(job.status);
    const canClose = ['active', 'inactive'].includes(job.status);

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
            pending: 'bg-yellow-100 text-yellow-800',
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            declined: 'bg-red-100 text-red-800',
            closed: 'bg-red-200 text-red-900',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-4 border min-h-[300px] relative flex flex-col border-slate-200 dark:border-gray-700 hover:border-blue-300 hover:ring-2 hover:ring-blue-200 transition-all duration-200">
            <div className="absolute -top-4 -right-2 z-10 flex gap-1">
                <button onClick={() => onEdit(job)} className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-md" title="Edit Job">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => onDelete(job)} className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md" title="Delete Job">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
                    <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-medium whitespace-nowrap">{job.job_type || job.type}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${getStatusBadge(job.status)}`}>{job.status === 'active' ? 'Active' : job.status === 'inactive' ? 'Deactive' : job.status === 'closed' ? 'Closed' : job.status}</span>
                </div>
            </div>

            <div className="space-y-1 text-slate-600 dark:text-gray-300 text-[12px] mb-2">
                <div className="flex items-center gap-1"><span>{job.location}</span></div>
                <div className="flex items-center gap-1"><span>{job.experience}</span></div>
                <div className="flex items-center gap-1"><span className="text-emerald-600 font-medium">{job.salary}</span></div>
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
                {job.skills?.slice(0, 3).map((skill, index) => (
                    <span key={index} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium">{skill}</span>
                ))}
            </div>

            <div className="mb-2">
                <p className="text-[11px] font-medium text-slate-700 mb-1">Perks:</p>
                <p className="text-[10px] text-slate-600 line-clamp-1">{job.perks?.join(' • ') || 'Flexible working hours • Health Insurance • Learning opportunities'}</p>
            </div>

            <div className="mt-auto">
                <hr className="my-2" />
                {job.status === 'declined' && (
                    <button onClick={() => onResend(job)} className="w-full mb-2 py-2 rounded-xl bg-yellow-500 text-white text-[12px] font-semibold hover:bg-yellow-600 transition-colors">↻ Resend for Approval</button>
                )}
                <div className="flex justify-between items-center text-[12px] text-slate-500 mb-3">
                    <p>Posted {new Date(job.created_at || job.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} <span className="mx-2">•</span> {job.applicants || 0} applicants</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => onViewDetails(job)} className="w-full py-2 rounded-xl text-blue-600 text-[14px] font-semibold hover:bg-blue-50 transition-colors">View Details</button>
                    <button onClick={() => onViewApplications(job)} className="w-full py-2 rounded-xl text-emerald-600 text-[14px] font-semibold hover:bg-emerald-50 transition-colors">Applicants</button>
                </div>
            </div>
        </div>
    );
};

const defaultCreateForm = {
    title: '', company: '', location: '', job_type: 'Full Time', job_category: '', openings: 1, experience: '',
    min_salary: '', max_salary: '', salary_period: 'Monthly', last_date: '', description: '',
    currentSkill: '', skillsList: [], currentPerk: '', perksList: [],
    responsibilities: [], currentResponsibility: '',
    qualificationsList: [], currentQualification: '',
    assets: [], company_image: null, company_image_preview: '',
    contact_person: '', contact_phone: '', contact_email: '', company_address: '',
    application_questions: [],
};

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

const mapApiJobToCard = (job) => ({
    ...job,
    companyImage: job.company_image || job.companyImage || null,
    type: job.job_type || job.type || '',
    keyResponsibilities: job.key_responsibilities || job.keyResponsibilities || '',
    lastDate: job.last_date || job.lastDate || '',
    active: job.status === 'active',
    applicants: job.applicants || 0,
    application_questions: Array.isArray(job.application_questions)
        ? job.application_questions
        : (Array.isArray(job.applicationQuestions) ? job.applicationQuestions : []),
});

export default function JobListing({ auth }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { successAlert, errorAlert } = useAlerts();

    // Dialog states
    const [confirmToggleOpen, setConfirmToggleOpen] = useState(false);
    const [confirmToggleJob, setConfirmToggleJob] = useState(null);
    const [confirmToggleStatus, setConfirmToggleStatus] = useState(null);
    const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
    const [confirmCloseJob, setConfirmCloseJob] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [confirmDeleteJob, setConfirmDeleteJob] = useState(null);
    const [confirmResendOpen, setConfirmResendOpen] = useState(false);
    const [confirmResendJob, setConfirmResendJob] = useState(null);

    // Filter jobs based on search query
    const filteredJobs = jobs.filter(job => {
        const query = searchQuery.toLowerCase();
        return (
            job.title?.toLowerCase().includes(query) ||
            job.company?.toLowerCase().includes(query)
        );
    });

    // Load jobs from API on component mount
    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await fetch(route('admin.api.jobs.list'), {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                },
            });
            const data = await response.json();
            if (data.success) {
                setJobs(data.data);
            } else {
                setJobs([]);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            errorAlert('Failed to load jobs');
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const [selectedJob, setSelectedJob] = useState(null);
    const [applicationsModalOpen, setApplicationsModalOpen] = useState(false);
    const modalRef = useRef(null);
    const [editingJob, setEditingJob] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [editSaving, setEditSaving] = useState(false);
    const [createJobOpen, setCreateJobOpen] = useState(false);
    const [createJobForm, setCreateJobForm] = useState(defaultCreateForm);
    const [createSaving, setCreateSaving] = useState(false);
    const [applicationsJob, setApplicationsJob] = useState(null);
    const [applicationsLoading, setApplicationsLoading] = useState(false);
    const [applications, setApplications] = useState([]);
    const [confirmAppDecisionOpen, setConfirmAppDecisionOpen] = useState(false);
    const [decisionApp, setDecisionApp] = useState(null);
    const [decisionAction, setDecisionAction] = useState(null);
    const [resumePreviewOpen, setResumePreviewOpen] = useState(false);
    const [resumePreviewUrl, setResumePreviewUrl] = useState(null);
    const [resumePreviewFallbackUrl, setResumePreviewFallbackUrl] = useState(null);

    const handleViewDetails = (job) => {
        setSelectedJob(job);
    };

    const openCreateModal = () => {
        setCreateJobForm({ ...defaultCreateForm });
        setCreateJobOpen(true);
    };

    const closeCreateModal = () => {
        if (createSaving) return;
        setCreateJobOpen(false);
        setCreateJobForm({ ...defaultCreateForm });
    };
// Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setSelectedJob(null);
            }
            if (modalRef.current && !modalRef.current.contains(event.target) && editingJob) {
                setEditingJob(null);
                setEditForm(null);
            }
            if (modalRef.current && !modalRef.current.contains(event.target) && createJobOpen && !createSaving) {
                closeCreateModal();
            }
        };

        if (selectedJob || editingJob || createJobOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [selectedJob, editingJob, createJobOpen, createSaving]);


    const handleViewApplications = async (job) => {
        setApplicationsJob(job);
        setApplications([]);
        setApplicationsModalOpen(true);
        setApplicationsLoading(true);

        try {
            const response = await fetch(route('admin.api.jobs.applications', job.id), {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                },
            });
            const data = await response.json().catch(() => null);
            if (!response.ok || !data?.success) {
                errorAlert(data?.message || 'Failed to load applications.');
                return;
            }
            setApplications(Array.isArray(data.data) ? data.data : []);
        } catch (error) {
            console.error('Error fetching applications:', error);
            errorAlert('Failed to load applications.');
        } finally {
            setApplicationsLoading(false);
        }
    };

    const openDecision = (app, action) => {
        setDecisionApp(app);
        setDecisionAction(action);
        setConfirmAppDecisionOpen(true);
    };

    const isPreviewableResume = (url) => {
        const u = String(url || "").toLowerCase();
        return u.endsWith(".pdf") || u.endsWith(".html") || u.includes("generated-resumes");
    };

    const openResumePreview = (url, applicationId) => {
        const resolved = url
            ? (String(url).startsWith('/') || /^https?:\/\//i.test(String(url))
                  ? String(url)
                  : `/${url}`)
            : null;
        const fallbackUrl = applicationId
            ? route('admin.api.job.applicants.resume-preview', applicationId)
            : null;

        if (resolved && !isPreviewableResume(resolved)) {
            window.open(resolved, '_blank');
            return;
        }

        setResumePreviewUrl(resolved);
        setResumePreviewFallbackUrl(fallbackUrl);
        setResumePreviewOpen(true);
    };

    const confirmDecision = async () => {
        if (!decisionApp || !decisionAction) return;
        try {
            const response = await fetch(route('admin.api.applications.decision', decisionApp.id), {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: decisionAction }),
            });
            const data = await response.json().catch(() => null);
            if (!response.ok || !data?.success) {
                errorAlert(data?.message || 'Failed to update application.');
                return;
            }
            setApplications(prev => prev.map(a => (a.id === decisionApp.id ? { ...a, status: data.data.status } : a)));
            successAlert('Application updated successfully!');
        } catch (error) {
            console.error('Error updating application:', error);
            errorAlert('Failed to update application.');
        } finally {
            setConfirmAppDecisionOpen(false);
            setDecisionApp(null);
            setDecisionAction(null);
        }
    };

    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    const handleStatusChangeDirectly = async (app, newStatus) => {
        if (app.status === newStatus) return;
        setUpdatingStatusId(app.id);
        try {
            const response = await fetch(route('admin.api.job.applicants.status', app.id), {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await response.json().catch(() => null);
            if (!response.ok || !data?.success) {
                errorAlert(data?.message || 'Failed to update status.');
                return;
            }
            setApplications(prev => prev.map(a => (a.id === app.id ? { ...a, status: newStatus } : a)));
            successAlert('Status updated successfully!');
        } catch (error) {
            console.error('Error updating status:', error);
            errorAlert('Failed to update status.');
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const statusOptions = [
        { value: 'applied', label: 'Applied' },
        { value: 'viewed', label: 'Viewed' },
        { value: 'shortlisted', label: 'Shortlisted' },
        { value: 'assigned_to_calling_member', label: 'Assigned To Calling Member' },
        { value: 'calling_in_progress', label: 'Calling In Progress' },
        { value: 'calling_approved', label: 'Calling Approved' },
        { value: 'calling_rejected', label: 'Calling Rejected' },
        { value: 'admin_review', label: 'Admin Review' },
        { value: 'offer_letter_generated', label: 'Offer Letter Generated' },
        { value: 'waiting_list', label: 'Waiting List' },
        { value: 'hired', label: 'Hired' },
        { value: 'not_selected', label: 'Not Selected' },
        { value: 'rejected', label: 'Rejected' },
    ];

    const [editFields, setEditFields] = useState({
        skillsList: [],
        currentSkill: '',
        perksList: [],
        currentPerk: '',
        responsibilities: [],
        currentResponsibility: '',
        qualificationsList: [],
        currentQualification: '',
        assets: [],
        applicationQuestions: [],
    });

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
            last_date: job.last_date || '',
            description: job.description || '',
            company_image: null,
            company_image_preview: job.company_image || job.companyImage || '',
            contact_person: job.contact_person || '',
            contact_phone: job.contact_phone || '',
            contact_email: job.contact_email || '',
            company_address: job.company_address || '',
        });
        setEditFields({
            skillsList: Array.isArray(job.skills) ? [...job.skills] : [],
            currentSkill: '',
            perksList: Array.isArray(job.perks) ? [...job.perks] : [],
            currentPerk: '',
            responsibilities: Array.isArray(job.key_responsibilities || job.keyResponsibilities)
                ? [...(job.key_responsibilities || job.keyResponsibilities)]
                : [],
            currentResponsibility: '',
            qualificationsList: Array.isArray(job.qualifications) ? [...job.qualifications] : [],
            currentQualification: '',
            assets: Array.isArray(job.assets) ? [...job.assets] : [],
            applicationQuestions: Array.isArray(job.application_questions)
                ? job.application_questions.map((question) => ({
                    id: question.id || createQuestionDraft().id,
                    question: question.question || '',
                    type: question.type || 'text',
                    required: !!question.required,
                    options: Array.isArray(question.options) && question.options.length > 0 ? question.options : [''],
                }))
                : [],
        });
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
        formData.append('application_questions', JSON.stringify(normalizeQuestionDrafts(editFields.applicationQuestions)));
        formData.append('contact_person', editForm.contact_person);
        formData.append('contact_phone', editForm.contact_phone);
        formData.append('contact_email', editForm.contact_email);
        formData.append('company_address', editForm.company_address);

        if (editForm.company_image) {
            formData.append('company_image', editForm.company_image);
        }

        try {
            const response = await fetch(route('admin.api.jobs.update', editingJob.id), {
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

            setJobs(prev => prev.map(j => (j.id === editingJob.id ? mapApiJobToCard(data.data) : j)));
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

    const handleCreateInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'min_salary' || name === 'max_salary') {
            setCreateJobForm(prev => ({ ...prev, [name]: value.replace(/[^0-9]/g, '') }));
            return;
        }
        if (name === 'openings') {
            const numVal = parseInt(value) || '';
            if (numVal !== '' && numVal < 1) return;
            setCreateJobForm(prev => ({ ...prev, [name]: numVal }));
            return;
        }
        setCreateJobForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateSkillAdd = () => {
        if (createJobForm.currentSkill.trim()) {
            setCreateJobForm(prev => ({
                ...prev,
                skillsList: [...prev.skillsList, prev.currentSkill.trim()],
                currentSkill: ''
            }));
        }
    };
    const handleCreateSkillRemove = (idx) => {
        setCreateJobForm(prev => ({
            ...prev,
            skillsList: prev.skillsList.filter((_, i) => i !== idx)
        }));
    };

    const handleCreatePerkAdd = () => {
        if (createJobForm.currentPerk.trim()) {
            setCreateJobForm(prev => ({
                ...prev,
                perksList: [...prev.perksList, prev.currentPerk.trim()],
                currentPerk: ''
            }));
        }
    };
    const handleCreatePerkRemove = (idx) => {
        setCreateJobForm(prev => ({
            ...prev,
            perksList: prev.perksList.filter((_, i) => i !== idx)
        }));
    };

    const handleCreateRespAdd = () => {
        if (createJobForm.currentResponsibility.trim()) {
            setCreateJobForm(prev => ({
                ...prev,
                responsibilities: [...prev.responsibilities, prev.currentResponsibility.trim()],
                currentResponsibility: ''
            }));
        }
    };
    const handleCreateRespRemove = (idx) => {
        setCreateJobForm(prev => ({
            ...prev,
            responsibilities: prev.responsibilities.filter((_, i) => i !== idx)
        }));
    };

    const handleCreateQualAdd = () => {
        if (createJobForm.currentQualification.trim()) {
            setCreateJobForm(prev => ({
                ...prev,
                qualificationsList: [...prev.qualificationsList, prev.currentQualification.trim()],
                currentQualification: ''
            }));
        }
    };
    const handleCreateQualRemove = (idx) => {
        setCreateJobForm(prev => ({
            ...prev,
            qualificationsList: prev.qualificationsList.filter((_, i) => i !== idx)
        }));
    };

    const handleCreateToggleAsset = (asset) => {
        setCreateJobForm(prev => ({
            ...prev,
            assets: prev.assets.includes(asset)
                ? prev.assets.filter(a => a !== asset)
                : [...prev.assets, asset]
        }));
    };

    const handleCreateImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCreateJobForm(prev => ({
                    ...prev,
                    company_image: file,
                    company_image_preview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setCreateSaving(true);

        const formData = new FormData();
        formData.append('title', createJobForm.title);
        formData.append('company', createJobForm.company);
        formData.append('location', createJobForm.location);
        formData.append('job_type', createJobForm.job_type || 'Full Time');
        formData.append('job_category', createJobForm.job_category || '');
        formData.append('openings', createJobForm.openings || 1);
        formData.append('experience', createJobForm.experience);
        const salaryRange = `₹${createJobForm.min_salary || 0} - ₹${createJobForm.max_salary || 0}/${createJobForm.salary_period || 'Monthly'}`;
        formData.append('salary', salaryRange);
        formData.append('last_date', createJobForm.last_date);
        formData.append('description', createJobForm.description);
        formData.append('skills', JSON.stringify(createJobForm.skillsList));
        formData.append('perks', JSON.stringify(createJobForm.perksList));
        formData.append('key_responsibilities', JSON.stringify(createJobForm.responsibilities));
        formData.append('qualifications', JSON.stringify(createJobForm.qualificationsList));
        formData.append('assets', JSON.stringify(createJobForm.assets));
        formData.append('application_questions', JSON.stringify(normalizeQuestionDrafts(createJobForm.application_questions)));
        formData.append('contact_person', createJobForm.contact_person);
        formData.append('contact_phone', createJobForm.contact_phone);
        formData.append('contact_email', createJobForm.contact_email);
        formData.append('company_address', createJobForm.company_address);

        if (createJobForm.company_image) {
            formData.append('company_image', createJobForm.company_image);
        }

        try {
            const response = await fetch(route('admin.api.jobs.store'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const data = await response.json().catch(() => null);
            if (!response.ok || !data?.success) {
                const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : null;
                errorAlert(firstError || data?.message || 'Failed to create job post.');
                return;
            }

            setJobs(prev => [mapApiJobToCard(data.data), ...prev]);
            successAlert('Job post created successfully and sent for approval!');
            closeCreateModal();
        } catch (error) {
            console.error('Error creating job:', error);
            errorAlert('Failed to create job post.');
        } finally {
            setCreateSaving(false);
        }
    };

    const handleDelete = (job) => {
        setConfirmDeleteJob(job);
        setConfirmDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!confirmDeleteJob) return;

        try {
            const response = await fetch(route('admin.api.jobs.destroy', confirmDeleteJob.id), {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                },
            });
            const data = await response.json();
            if (data.success) {
                setJobs(jobs.filter(j => j.id !== confirmDeleteJob.id));
                successAlert('Job post deleted successfully!');
            } else {
                errorAlert(data.message || 'Failed to delete job.');
            }
        } catch (error) {
            console.error('Error deleting job:', error);
            errorAlert('Failed to delete job.');
        } finally {
            setConfirmDeleteOpen(false);
            setConfirmDeleteJob(null);
        }
    };

    const handleResend = (job) => {
        setConfirmResendJob(job);
        setConfirmResendOpen(true);
    };

    const confirmResend = async () => {
        if (!confirmResendJob) return;

        try {
            const response = await fetch(route('admin.api.jobs.resend', confirmResendJob.id), {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                },
            });
            const data = await response.json();
            if (data.success) {
                setJobs(jobs.map(j => j.id === confirmResendJob.id ? data.data : j));
                successAlert('Job resent for approval successfully!');
            } else {
                errorAlert(data.message || 'Failed to resend job.');
            }
        } catch (error) {
            console.error('Error resending job:', error);
            errorAlert('Failed to resend job.');
        } finally {
            setConfirmResendOpen(false);
            setConfirmResendJob(null);
        }
    };

    const handleStatusChange = (job, newStatus) => {
        if (job.status === newStatus) return;
        setConfirmToggleJob(job);
        setConfirmToggleStatus(newStatus);
        setConfirmToggleOpen(true);
    };

    const handleCloseJob = (job) => {
        setConfirmCloseJob(job);
        setConfirmCloseOpen(true);
    };

    const confirmToggle = async () => {
        if (!confirmToggleJob || !confirmToggleStatus) return;

        try {
            const response = await fetch(route('admin.api.jobs.toggle-status', confirmToggleJob.id), {
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
                errorAlert(data?.message || 'Failed to update job status.');
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

    const confirmClose = async () => {
        if (!confirmCloseJob) return;

        try {
            const response = await fetch(route('admin.api.jobs.close', confirmCloseJob.id), {
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

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Job Listing" />

            <div className="min-h-screen bg-slate-100 dark:bg-gray-900 p-4">
                <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-6">Listed Jobs Posts</h1>

                {/* Search and Post New Job Row */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by job title or company name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
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

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md whitespace-nowrap"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Post New Job
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {loading ? (
                        <div className="col-span-full flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredJobs.length > 0 ? (
                        filteredJobs.map((job, idx) => (
                            <JobCard
                                key={idx}
                                job={job}
                                onViewDetails={handleViewDetails}
                                onViewApplications={handleViewApplications}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onResend={handleResend}
                                onStatusChange={handleStatusChange}
                                onCloseJob={handleCloseJob}
                            />
                        ))
                    ) : (
                        <div className="col-span-full">
                            <div className="text-center py-12">
                                <svg
                                    className="w-16 h-16 mx-auto text-gray-400 mb-4"
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
                                {!searchQuery && (
                                    <button
                                        type="button"
                                        onClick={openCreateModal}
                                        className="inline-flex items-center px-4 py-2 mt-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        Create First Job Post
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {applicationsModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden">
                        <button
                            type="button"
                            onClick={() => {
                                setApplicationsModalOpen(false);
                                setApplicationsJob(null);
                                setApplications([]);
                            }}
                            className="absolute top-4 right-4 z-20 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-5 h-5 text-slate-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="px-6 py-4 pr-14 border-b border-slate-200 dark:border-gray-700">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Job Applicants</h3>
                                <p className="text-sm text-slate-500 dark:text-gray-400">{applicationsJob?.title || '-'}</p>
                            </div>
                        </div>

                        <div className="p-6 overflow-auto max-h-[70vh]">
                            {applicationsLoading ? (
                                <div className="py-10 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                                </div>
                            ) : applications.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-slate-500 dark:text-gray-400 whitespace-nowrap">
                                                <th className="py-2 pr-3 font-medium">Candidate</th>
                                                <th className="py-2 pr-3 font-medium">Email</th>
                                                <th className="py-2 pr-3 font-medium">Phone</th>
                                                <th className="py-2 pr-3 font-medium">Status</th>
                                                <th className="py-2 pr-3 font-medium">Screening Answers</th>
                                                <th className="py-2 pr-3 font-medium">Resume</th>
                                                <th className="py-2 font-medium">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                                            {applications.map((app) => (
                                                <tr key={app.id} className="align-top">
                                                    <td className="py-2 pr-3 text-slate-900 dark:text-white">{app.candidate_name || '-'}</td>
                                                    <td className="py-2 pr-3">{app.candidate_email || '-'}</td>
                                                    <td className="py-2 pr-3">{app.candidate_phone || '-'}</td>
                                                    <td className="py-2 pr-3">
                                                        {updatingStatusId === app.id ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                                <span className="text-xs text-slate-500">Updating...</span>
                                                            </div>
                                                        ) : (
                                                            <select
                                                                value={app.status}
                                                                onChange={(e) => handleStatusChangeDirectly(app, e.target.value)}
                                                                className={`w-full px-2 py-1.5 text-xs font-medium rounded-full border cursor-pointer outline-none ${
                                                                    app.status === 'applied' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                                                    app.status === 'viewed' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                                                    app.status === 'shortlisted' ? 'bg-green-100 text-green-800 border-green-300' :
                                                                    app.status === 'assigned_to_calling_member' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
                                                                    app.status === 'calling_in_progress' ? 'bg-sky-100 text-sky-800 border-sky-300' :
                                                                    app.status === 'calling_approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                                                    app.status === 'calling_rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                                                                    app.status === 'admin_review' ? 'bg-violet-100 text-violet-800 border-violet-300' :
                                                                    app.status === 'offer_letter_generated' ? 'bg-teal-100 text-teal-800 border-teal-300' :
                                                                    app.status === 'waiting_list' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                                                    app.status === 'hired' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                                                                    app.status === 'not_selected' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                                                    app.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                                                                    'bg-gray-100 text-gray-800 border-gray-300'
                                                                }`}
                                                            >
                                                                {statusOptions.map(opt => (
                                                                    <option key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </td>
                                                    <td className="py-2 pr-3">
                                                        {Array.isArray(app.screening_answers) && app.screening_answers.length > 0 ? (
                                                            <div className="min-w-[260px] space-y-2">
                                                                {app.screening_answers.map((answer, answerIndex) => (
                                                                    <div
                                                                        key={`${app.id}-answer-${answer.question_id || answerIndex}`}
                                                                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                                                                    >
                                                                        <p className="text-xs font-semibold text-slate-700">
                                                                            {answer.question || `Question ${answerIndex + 1}`}
                                                                        </p>
                                                                        <p className="mt-1 text-xs text-slate-600 whitespace-pre-wrap break-words">
                                                                            {formatScreeningAnswerPreview(answer.answer)}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400">No answers</span>
                                                        )}
                                                    </td>
                                                    <td className="py-2 pr-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => openResumePreview(app.resume_url, app.id)}
                                                            className="text-blue-600 hover:underline font-medium"
                                                        >
                                                            {app.resume_url ? 'Preview' : 'Generated Preview'}
                                                        </button>
                                                    </td>
                                                    <td className="py-2">
                                                        {app.status === 'applied' || app.status === 'viewed' ? (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openDecision(app, 'approve')}
                                                                    className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openDecision(app, 'reject')}
                                                                    className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
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
                                <div className="text-sm text-slate-500">No applications found.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={confirmAppDecisionOpen}
                onClose={() => {
                    setConfirmAppDecisionOpen(false);
                    setDecisionApp(null);
                    setDecisionAction(null);
                }}
                onConfirm={confirmDecision}
                message={
                    decisionApp
                        ? `${decisionAction === 'approve' ? 'Approve' : 'Reject'} application of "${decisionApp.candidate_name}"?`
                        : 'Are you sure?'
                }
                confirmText={decisionAction === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
                cancelText="Cancel"
                modalSpinnerMessage="Processing Please Wait...."
            />

            {/* Create New Job Post Modal */}
            {createJobOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div ref={modalRef} className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <button
                            type="button"
                            onClick={closeCreateModal}
                            className="absolute top-4 right-4 z-20 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleCreateSubmit} className="p-6 pr-14">
                            <div className="mb-5">
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Create New Job Post</h2>
                                <p className="text-sm text-slate-500 dark:text-gray-400">Manage new job posting directly from this modal.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Job Title</label>
                                    <input
                                        name="title"
                                        value={createJobForm.title}
                                        onChange={handleCreateInputChange}
                                        className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Company</label>
                                    <input
                                        name="company"
                                        value={createJobForm.company}
                                        onChange={handleCreateInputChange}
                                        className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Location</label>
                                    <LocationInput
                                        value={createJobForm.location}
                                        onChange={(value) => setCreateJobForm(prev => ({ ...prev, location: value }))}
                                        placeholder="Enter job location"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Job Type</label>
                                    <select
                                        name="job_type"
                                        value={createJobForm.job_type}
                                        onChange={handleCreateInputChange}
                                        className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
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
                                        value={createJobForm.job_category || ''}
                                        onChange={handleCreateInputChange}
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
                                        value={createJobForm.openings}
                                        onChange={handleCreateInputChange}
                                        min="1"
                                        className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Experience</label>
                                    <select
                                        name="experience"
                                        value={createJobForm.experience}
                                        onChange={handleCreateInputChange}
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
                                        value={createJobForm.last_date}
                                        onChange={handleCreateInputChange}
                                        className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Company Logo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCreateImageUpload}
                                        className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                                    />
                                    {createJobForm.company_image_preview ? (
                                        <img src={createJobForm.company_image_preview} alt="Preview" className="mt-2 w-20 h-20 rounded-xl object-cover border border-slate-200" />
                                    ) : null}
                                </div>
                                {/* Salary */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Minimum Salary</label>
                                    <input
                                        name="min_salary"
                                        value={createJobForm.min_salary}
                                        onChange={handleCreateInputChange}
                                        className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                                        inputMode="numeric"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Maximum Salary</label>
                                    <input
                                        name="max_salary"
                                        value={createJobForm.max_salary}
                                        onChange={handleCreateInputChange}
                                        className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                                        inputMode="numeric"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Salary Period</label>
                                    <select
                                        name="salary_period"
                                        value={createJobForm.salary_period}
                                        onChange={handleCreateInputChange}
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
                                                onClick={() => handleCreateToggleAsset(asset)}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                                    createJobForm.assets.includes(asset)
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
                                            value={createJobForm.currentSkill}
                                            onChange={(e) => setCreateJobForm(prev => ({ ...prev, currentSkill: e.target.value }))}
                                            onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateSkillAdd(); } }}
                                            placeholder="Type a skill and press Enter"
                                            className="flex-1 border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                                        />
                                        <button type="button" onClick={handleCreateSkillAdd} className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Add</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {createJobForm.skillsList.map((skill, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                                                {skill}
                                                <button type="button" onClick={() => handleCreateSkillRemove(idx)} className="text-blue-600 hover:text-blue-800">✕</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {/* Perks - Dynamic List */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Perks & Benefits</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            value={createJobForm.currentPerk}
                                            onChange={(e) => setCreateJobForm(prev => ({ ...prev, currentPerk: e.target.value }))}
                                            onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreatePerkAdd(); } }}
                                            placeholder="Type a perk and press Enter"
                                            className="flex-1 border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                                        />
                                        <button type="button" onClick={handleCreatePerkAdd} className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Add</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {createJobForm.perksList.map((perk, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2">
                                                {perk}
                                                <button type="button" onClick={() => handleCreatePerkRemove(idx)} className="text-green-600 hover:text-green-800">✕</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {/* Job Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Job Description</label>
                                    <textarea
                                        name="description"
                                        value={createJobForm.description}
                                        onChange={handleCreateInputChange}
                                        rows={4}
                                        className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                {/* Responsibilities - Dynamic List */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Key Responsibilities</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            value={createJobForm.currentResponsibility}
                                            onChange={(e) => setCreateJobForm(prev => ({ ...prev, currentResponsibility: e.target.value }))}
                                            onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateRespAdd(); } }}
                                            placeholder="Type a responsibility and press Enter"
                                            className="flex-1 border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                                        />
                                        <button type="button" onClick={handleCreateRespAdd} className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Add</button>
                                    </div>
                                    <div className="space-y-1">
                                        {createJobForm.responsibilities.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                                                <span className="text-blue-500">•</span>
                                                <span className="flex-1">{item}</span>
                                                <button type="button" onClick={() => handleCreateRespRemove(idx)} className="text-red-500 hover:text-red-700">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Qualifications - Dynamic List */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Qualifications</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            value={createJobForm.currentQualification}
                                            onChange={(e) => setCreateJobForm(prev => ({ ...prev, currentQualification: e.target.value }))}
                                            onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateQualAdd(); } }}
                                            placeholder="Type a qualification and press Enter"
                                            className="flex-1 border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                                        />
                                        <button type="button" onClick={handleCreateQualAdd} className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Add</button>
                                    </div>
                                    <div className="space-y-1">
                                        {createJobForm.qualificationsList.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                                                <span className="text-blue-500">•</span>
                                                <span className="flex-1">{item}</span>
                                                <button type="button" onClick={() => handleCreateQualRemove(idx)} className="text-red-500 hover:text-red-700">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <ScreeningQuestionsEditor
                                    questions={createJobForm.application_questions}
                                    onChange={(questions) => setCreateJobForm(prev => ({
                                        ...prev,
                                        application_questions: questions,
                                    }))}
                                />
                                {/* Company Details Section */}
                                <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Company Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Contact Person Name</label>
                                            <input
                                                name="contact_person"
                                                value={createJobForm.contact_person}
                                                onChange={handleCreateInputChange}
                                                placeholder="Enter contact person name"
                                                className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Phone Number</label>
                                            <input
                                                name="contact_phone"
                                                value={createJobForm.contact_phone}
                                                onChange={handleCreateInputChange}
                                                placeholder="Enter phone number"
                                                className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Email Address</label>
                                            <input
                                                name="contact_email"
                                                value={createJobForm.contact_email}
                                                onChange={handleCreateInputChange}
                                                placeholder="Enter email address"
                                                className="w-full border border-slate-300 dark:border-gray-600 rounded-xl px-4 py-3 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Company Address</label>
                                            <textarea
                                                name="company_address"
                                                value={createJobForm.company_address}
                                                onChange={handleCreateInputChange}
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
                                    onClick={closeCreateModal}
                                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700"
                                    disabled={createSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-[#5146E6] text-white hover:bg-[#4338CA] disabled:opacity-60"
                                    disabled={createSaving}
                                >
                                    {createSaving ? 'Submitting...' : 'Submit Job Post'}
                                </button>
                            </div>
                        </form>
                        </div>
                    </div>
                </div>
            )}

            <ResumePreviewModal
                isOpen={resumePreviewOpen}
                sourceUrl={resumePreviewUrl}
                fallbackUrl={resumePreviewFallbackUrl}
                onClose={() => {
                    setResumePreviewOpen(false);
                    setResumePreviewUrl(null);
                    setResumePreviewFallbackUrl(null);
                }}
            />

            {/* Job Details Modal */}
            {selectedJob && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div ref={modalRef} className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        <button
                            onClick={() => setSelectedJob(null)}
                            className="absolute top-4 right-4 z-20 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="max-h-[90vh] overflow-y-auto">
                        <div className="p-6 pr-14">
                            <div className="flex gap-4 mb-6">
                                <img
                                    src={selectedJob.company_image || selectedJob.companyImage}
                                    alt={selectedJob.company}
                                    className="w-16 h-16 rounded-xl object-cover"
                                />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedJob.title}</h2>
                                    <p className="text-lg text-gray-600 dark:text-gray-300">{selectedJob.company}</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                                        selectedJob.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        selectedJob.status === 'active' ? 'bg-green-100 text-green-800' :
                                        selectedJob.status === 'declined' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {selectedJob.status}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Location</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{selectedJob.location}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Experience</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{selectedJob.experience}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Job Type</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{selectedJob.job_type || selectedJob.type}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Salary</p>
                                    <p className="font-medium text-green-600">{selectedJob.salary}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Number of Openings</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{selectedJob.openings || 1}</p>
                                </div>
                            </div>

                            {selectedJob.status === 'declined' && selectedJob.rejection_reason && (
                                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                    <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Rejection Reason</h3>
                                    <p className="text-sm text-red-600 dark:text-red-300">{selectedJob.rejection_reason}</p>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Skills Required</h3>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                    {selectedJob.skills && selectedJob.skills.length > 0 ? (
                                        <ul className="space-y-2">
                                            {selectedJob.skills.map((skill, idx) => (
                                                <li key={idx} className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                                    <span className="text-blue-500 mt-1">•</span>
                                                    {skill}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-700 dark:text-gray-300">No skills specified.</p>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Perks & Benefits</h3>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                    {selectedJob.perks && selectedJob.perks.length > 0 ? (
                                        <ul className="space-y-2">
                                            {selectedJob.perks.map((perk, idx) => (
                                                <li key={idx} className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                                    <span className="text-green-500 mt-1">•</span>
                                                    {perk}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-700 dark:text-gray-300">No perks specified.</p>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Key Responsibilities</h3>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                    {(() => {
                                        const items = Array.isArray(selectedJob.key_responsibilities || selectedJob.keyResponsibilities)
                                            ? (selectedJob.key_responsibilities || selectedJob.keyResponsibilities)
                                            : (typeof (selectedJob.key_responsibilities || selectedJob.keyResponsibilities) === 'string' && (selectedJob.key_responsibilities || selectedJob.keyResponsibilities)
                                                ? (selectedJob.key_responsibilities || selectedJob.keyResponsibilities).split('\n').map(s => s.trim()).filter(Boolean)
                                                : []);
                                        return items.length > 0 ? (
                                            <ul className="space-y-2">
                                                {items.map((item, idx) => (
                                                    <li key={idx} className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                                        <span className="text-blue-500 mt-1">•</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : <p className="text-gray-700 dark:text-gray-300">No key responsibilities specified.</p>;
                                    })()}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Qualifications</h3>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                    {(() => {
                                        const items = Array.isArray(selectedJob.qualifications)
                                            ? selectedJob.qualifications
                                            : (typeof selectedJob.qualifications === 'string' && selectedJob.qualifications
                                                ? selectedJob.qualifications.split('\n').map(s => s.trim()).filter(Boolean)
                                                : []);
                                        return items.length > 0 ? (
                                            <ul className="space-y-2">
                                                {items.map((item, idx) => (
                                                    <li key={idx} className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                                        <span className="text-blue-500 mt-1">•</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : <p className="text-gray-700 dark:text-gray-300">No qualifications specified.</p>;
                                    })()}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Job Description</h3>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {selectedJob.description || 'No description provided.'}
                                    </p>
                                </div>
                            </div>

                            {/* Assets Required */}
                            {selectedJob.assets && selectedJob.assets.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Assets Required</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedJob.assets.map((asset, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm"
                                            >
                                                {asset}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(() => {
                                const questions = Array.isArray(selectedJob.application_questions)
                                    ? selectedJob.application_questions
                                    : (Array.isArray(selectedJob.applicationQuestions) ? selectedJob.applicationQuestions : []);

                                if (questions.length < 1) {
                                    return null;
                                }

                                return (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Application Questions</h3>
                                        <div className="space-y-3">
                                            {questions.map((question, index) => (
                                                <div
                                                    key={question.id || index}
                                                    className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-4"
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {question.question || `Question ${index + 1}`}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <span className="rounded-full bg-blue-100 px-2.5 py-1 font-medium text-blue-700">
                                                                {QUESTION_TYPE_LABELS[question.type] || 'Text Input'}
                                                            </span>
                                                            <span
                                                                className={`rounded-full px-2.5 py-1 font-medium ${
                                                                    question.required
                                                                        ? 'bg-red-100 text-red-700'
                                                                        : 'bg-slate-100 text-slate-600'
                                                                }`}
                                                            >
                                                                {question.required ? 'Required' : 'Optional'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {isSelectQuestionType(question.type) && Array.isArray(question.options) && question.options.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {question.options.map((option, optionIndex) => (
                                                                <span
                                                                    key={`${question.id || index}-option-${optionIndex}`}
                                                                    className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200"
                                                                >
                                                                    {option}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Contact Details */}
                            {(selectedJob.contact_person || selectedJob.contact_phone || selectedJob.contact_email || selectedJob.company_address) && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Company / Contact Details</h3>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600 space-y-2">
                                        {selectedJob.contact_person && <p><span className="text-gray-500">Contact Person:</span> <span className="font-medium">{selectedJob.contact_person}</span></p>}
                                        {selectedJob.contact_phone && <p><span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedJob.contact_phone}</span></p>}
                                        {selectedJob.contact_email && <p><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedJob.contact_email}</span></p>}
                                        {selectedJob.company_address && <p><span className="text-gray-500">Address:</span> <span className="font-medium">{selectedJob.company_address}</span></p>}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    <p>Posted: {selectedJob.created_at ? new Date(selectedJob.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    }) : (selectedJob.createdAt ? new Date(selectedJob.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    }) : 'Just now')}</p>
                                    <p>Last Date to Apply: {selectedJob.last_date ? new Date(selectedJob.last_date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    }) : selectedJob.lastDate ? new Date(selectedJob.lastDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    }) : 'Not specified'}</p>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Dialogs */}
            <ConfirmDialog
                isOpen={confirmToggleOpen}
                onClose={() => {
                    setConfirmToggleOpen(false);
                    setConfirmToggleJob(null);
                    setConfirmToggleStatus(null);
                }}
                onConfirm={confirmToggle}
                title="Confirm Status Change"
                message={confirmToggleJob && confirmToggleStatus
                    ? `Are you sure you want to ${confirmToggleStatus === 'active' ? 'activate' : confirmToggleStatus === 'inactive' ? 'deactivate' : 'update'} "${confirmToggleJob.title}"?`
                    : 'Are you sure you want to change the job status?'}
                confirmButtonText={confirmToggleStatus === 'active' ? 'Activate' : confirmToggleStatus === 'inactive' ? 'Deactivate' : 'Update'}
                confirmButtonColor={confirmToggleStatus === 'active' ? 'green' : confirmToggleStatus === 'inactive' ? 'gray' : 'blue'}
                icon="info"
                modalSpinnerMessage="Updating Please Wait...."
            />

            <ConfirmDialog
                isOpen={confirmCloseOpen}
                onClose={() => {
                    setConfirmCloseOpen(false);
                    setConfirmCloseJob(null);
                }}
                onConfirm={confirmClose}
                title="Confirm Close Job"
                message={confirmCloseJob
                    ? `Are you sure you want to close "${confirmCloseJob.title}"? This action cannot be undone by you. Only Super Admin can reactivate this job.`
                    : 'Are you sure you want to close this job?'}
                confirmButtonText="Close Job"
                confirmButtonColor="red"
                icon="warning"
                modalSpinnerMessage="Closing Please Wait...."
            />

            <ConfirmDialog
                isOpen={confirmDeleteOpen}
                onClose={() => {
                    setConfirmDeleteOpen(false);
                    setConfirmDeleteJob(null);
                }}
                onConfirm={confirmDelete}
                title="Confirm Delete Job"
                message={confirmDeleteJob
                    ? `Are you sure you want to delete "${confirmDeleteJob.title}"? This action cannot be undone.`
                    : 'Are you sure you want to delete this job?'}
                confirmButtonText="Delete"
                confirmButtonColor="red"
                icon="danger"
                modalSpinnerMessage="Deleting Please Wait...."
            />

            <ConfirmDialog
                isOpen={confirmResendOpen}
                onClose={() => {
                    setConfirmResendOpen(false);
                    setConfirmResendJob(null);
                }}
                onConfirm={confirmResend}
                title="Confirm Resend for Approval"
                message={confirmResendJob
                    ? `Resend "${confirmResendJob.title}" for Super Admin approval?`
                    : 'Resend this job for Super Admin approval?'}
                confirmButtonText="Resend"
                confirmButtonColor="yellow"
                icon="info"
                modalSpinnerMessage="Resending Please Wait...."
            />
            {/* Edit Job Modal */}
            {editingJob && editForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div ref={modalRef} className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <button
                            onClick={() => {
                                setEditingJob(null);
                                setEditForm(null);
                            }}
                            className="absolute top-4 right-4 z-20 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleEditSubmit} className="p-6 pr-14">
                            <div className="flex gap-3 mb-5">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">Edit Job</h2>
                                    <p className="text-slate-500 text-sm">{editingJob.title}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                                    <input
                                        name="title"
                                        value={editForm.title}
                                        onChange={handleEditInputChange}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5146E6] focus:border-[#5146E6]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                                    <input
                                        name="company"
                                        value={editForm.company}
                                        onChange={handleEditInputChange}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5146E6] focus:border-[#5146E6]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                                    <input
                                        name="location"
                                        value={editForm.location}
                                        onChange={handleEditInputChange}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5146E6] focus:border-[#5146E6]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
                                    <select
                                        name="job_type"
                                        value={editForm.job_type}
                                        onChange={handleEditInputChange}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5146E6] focus:border-[#5146E6]"
                                        required
                                    >
                                        <option>Full Time</option>
                                        <option>Part Time</option>
                                        <option>Contract</option>
                                        <option>Internship</option>
                                        <option>Remote</option>
                                        <option>Hybrid</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Job Category</label>
                                    <select
                                        name="job_category"
                                        value={editForm.job_category || ''}
                                        onChange={handleEditInputChange}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5146E6] focus:border-[#5146E6]"
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
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Number of Openings</label>
                                    <input
                                        type="number"
                                        name="openings"
                                        value={editForm.openings || 1}
                                        onChange={handleEditInputChange}
                                        min="1"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5146E6] focus:border-[#5146E6]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Experience</label>
                                    <input
                                        name="experience"
                                        value={editForm.experience}
                                        onChange={handleEditInputChange}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5146E6] focus:border-[#5146E6]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Date</label>
                                    <input
                                        type="date"
                                        name="last_date"
                                        value={editForm.last_date}
                                        onChange={handleEditInputChange}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5146E6] focus:border-[#5146E6]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Logo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            setEditForm((p) => ({
                                                ...p,
                                                company_image: file,
                                                company_image_preview: file ? URL.createObjectURL(file) : p.company_image_preview,
                                            }));
                                        }}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3"
                                    />
                                    {editForm.company_image_preview ? (
                                        <img
                                            src={editForm.company_image_preview}
                                            alt="Company"
                                            className="mt-2 w-20 h-20 rounded-xl object-cover border border-slate-200"
                                        />
                                    ) : null}
                                </div>
                                {/* Salary */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Salary</label>
                                    <input
                                        name="min_salary"
                                        value={editForm.min_salary}
                                        onChange={handleEditInputChange}
                                        placeholder="Minimum"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5146E6] focus:border-[#5146E6]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Maximum Salary</label>
                                    <input
                                        name="max_salary"
                                        value={editForm.max_salary}
                                        onChange={handleEditInputChange}
                                        placeholder="Maximum"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5146E6] focus:border-[#5146E6]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Salary Period</label>
                                    <select
                                        name="salary_period"
                                        value={editForm.salary_period}
                                        onChange={handleEditInputChange}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5146E6] focus:border-[#5146E6]"
                                    >
                                        <option value="Monthly">Monthly</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Yearly">Yearly</option>
                                    </select>
                                </div>
                                {/* Assets Required */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
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
                                                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                                                }`}
                                            >
                                                {asset}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Skills - Dynamic List */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Skills Required</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            value={editFields.currentSkill}
                                            onChange={(e) => setEditFields(prev => ({ ...prev, currentSkill: e.target.value }))}
                                            onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleEditSkillAdd(); } }}
                                            placeholder="Type a skill and press Enter"
                                            className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5146E6] focus:border-[#5146E6]"
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
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Perks & Benefits</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            value={editFields.currentPerk}
                                            onChange={(e) => setEditFields(prev => ({ ...prev, currentPerk: e.target.value }))}
                                            onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleEditPerkAdd(); } }}
                                            placeholder="Type a perk and press Enter"
                                            className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5146E6] focus:border-[#5146E6]"
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
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Job Description</label>
                                    <textarea
                                        name="description"
                                        value={editForm.description}
                                        onChange={handleEditInputChange}
                                        rows={4}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5146E6] focus:border-[#5146E6]"
                                    />
                                </div>
                                {/* Responsibilities - Dynamic List */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Key Responsibilities</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            value={editFields.currentResponsibility}
                                            onChange={(e) => setEditFields(prev => ({ ...prev, currentResponsibility: e.target.value }))}
                                            onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleEditRespAdd(); } }}
                                            placeholder="Type a responsibility and press Enter"
                                            className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5146E6] focus:border-[#5146E6]"
                                        />
                                        <button type="button" onClick={handleEditRespAdd} className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Add</button>
                                    </div>
                                    <div className="space-y-1">
                                        {editFields.responsibilities.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm">
                                                <span className="text-blue-500">•</span>
                                                <span className="flex-1">{item}</span>
                                                <button type="button" onClick={() => handleEditRespRemove(idx)} className="text-red-500 hover:text-red-700">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Qualifications - Dynamic List */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Qualifications</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            value={editFields.currentQualification}
                                            onChange={(e) => setEditFields(prev => ({ ...prev, currentQualification: e.target.value }))}
                                            onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleEditQualAdd(); } }}
                                            placeholder="Type a qualification and press Enter"
                                            className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5146E6] focus:border-[#5146E6]"
                                        />
                                        <button type="button" onClick={handleEditQualAdd} className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Add</button>
                                    </div>
                                    <div className="space-y-1">
                                        {editFields.qualificationsList.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm">
                                                <span className="text-blue-500">•</span>
                                                <span className="flex-1">{item}</span>
                                                <button type="button" onClick={() => handleEditQualRemove(idx)} className="text-red-500 hover:text-red-700">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <ScreeningQuestionsEditor
                                    questions={editFields.applicationQuestions}
                                    onChange={(questions) => setEditFields(prev => ({
                                        ...prev,
                                        applicationQuestions: questions,
                                    }))}
                                />
                                {/* Company Details Section */}
                                <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Company Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person Name</label>
                                            <input
                                                name="contact_person"
                                                value={editForm.contact_person}
                                                onChange={handleEditInputChange}
                                                placeholder="Enter contact person name"
                                                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5146E6] focus:border-[#5146E6]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                            <input
                                                name="contact_phone"
                                                value={editForm.contact_phone}
                                                onChange={handleEditInputChange}
                                                placeholder="Enter phone number"
                                                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5146E6] focus:border-[#5146E6]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                            <input
                                                name="contact_email"
                                                value={editForm.contact_email}
                                                onChange={handleEditInputChange}
                                                placeholder="Enter email address"
                                                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5146E6] focus:border-[#5146E6]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Company Address</label>
                                            <textarea
                                                name="company_address"
                                                value={editForm.company_address}
                                                onChange={handleEditInputChange}
                                                rows={2}
                                                placeholder="Enter company address"
                                                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5146E6] focus:border-[#5146E6]"
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
                                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
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
        </AuthenticatedLayout>
    );
}
