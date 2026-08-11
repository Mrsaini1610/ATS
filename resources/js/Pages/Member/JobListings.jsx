import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from './Layouts/AuthenticatedLayout';

const QUESTION_TYPE_LABELS = {
    text: 'Text Input',
    textarea: 'Textarea',
    single_select: 'Single Select',
    multi_select: 'Multiple Select',
};

const isMultiSelectQuestion = (type) => type === 'multi_select';

// Predefined job categories from admin panel
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

const normalizeApplicationQuestions = (questions = []) =>
    (Array.isArray(questions) ? questions : [])
        .map((question, index) => ({
            id: question?.id || `question-${index}`,
            question: String(question?.question || '').trim(),
            type: question?.type || 'text',
            required: !!question?.required,
            options: Array.isArray(question?.options)
                ? question.options.map((option) => String(option || '').trim()).filter(Boolean)
                : [],
        }))
        .filter((question) => question.question !== '');

// Job Card Component for Candidates
const CandidateJobCard = ({ job, hasApplied, isSaved, onViewDetails, onApply, onToggleSave }) => {
    const getJobTypeBadge = (type) => {
        const badges = {
            'full-time': 'bg-blue-100 text-blue-800',
            'part-time': 'bg-green-100 text-green-800',
            'contract': 'bg-purple-100 text-purple-800',
            'internship': 'bg-orange-100 text-orange-800',
            'remote': 'bg-teal-100 text-teal-800',
        };
        return badges[type?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No deadline';
        const date = new Date(dateString);
        const today = new Date();
        const diffTime = date - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'Expired';
        if (diffDays === 0) return 'Closing today';
        if (diffDays === 1) return 'Closes tomorrow';
        if (diffDays <= 7) return `Closes in ${diffDays} days`;
        return `Closes: ${date.toLocaleDateString('en-IN')}`;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 overflow-hidden flex flex-col h-full">
            {/* Top Row: Company Logo on left, Save Icon on right */}
            <div className="p-5 pb-0 flex-grow">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
                            {job.company_image ? (
                                <img 
                                    src={job.company_image} 
                                    alt={job.company}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = job.company?.charAt(0)?.toUpperCase() || 'J';
                                    }}
                                />
                            ) : (
                                job.company?.charAt(0)?.toUpperCase() || 'J'
                            )}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-lg font-semibold text-slate-900 line-clamp-1 mb-1">
                                {job.title}
                            </h3>
                            <p className="text-slate-600 text-sm font-medium">{job.company}</p>
                        </div>
                    </div>
                    {/* Save/Bookmark Icon - Top Right */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleSave(job); }}
                        className="p-1.5 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
                        title={isSaved ? 'Remove from saved' : 'Save job'}
                    >
                        {isSaved ? (
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-slate-400 hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Job Meta */}
                <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getJobTypeBadge(job.job_type)}`}>
                        {job.job_type?.replace('-', ' ')?.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {job.experience}
                    </span>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold text-emerald-600">{job.salary}</span>
                    </div>
                </div>

                {/* Skills Preview */}
                {job.skills && job.skills.length > 0 && (
                    <div className="mt-4">
                        <div className="flex flex-wrap gap-1.5">
                            {job.skills.slice(0, 4).map((skill, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-slate-50 text-slate-600 text-xs rounded-md border border-slate-200">
                                    {skill}
                                </span>
                            ))}
                            {job.skills.length > 4 && (
                                <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-xs rounded-md">
                                    +{job.skills.length - 4} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer with Actions - Always at Bottom */}
            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 mt-auto">
                <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDate(job.last_date)}
                        </div>
                        <div className="mt-1 text-slate-400">
                            {job.applicants || 0} applicants
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onViewDetails(job)}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            View Details
                        </button>
                        {hasApplied ? (
                            <button
                                disabled
                                className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg cursor-not-allowed flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Applied
                            </button>
                        ) : (
                            <button
                                onClick={() => onApply(job)}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Apply Now
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Job Details Modal
const JobDetailsModal = ({ job, isOpen, onClose, hasApplied, onApply }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const screeningQuestions = normalizeApplicationQuestions(job?.application_questions);
    
    if (!isOpen || !job) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop */}
                <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50" onClick={onClose}></div>

                {/* Modal Panel */}
                <div className="inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl sm:align-middle">
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 px-8 py-6 rounded-t-2xl">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                                {job.company_image ? (
                                    <img 
                                        src={job.company_image} 
                                        alt={job.company}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = job.company?.charAt(0)?.toUpperCase() || 'J';
                                        }}
                                    />
                                ) : (
                                    job.company?.charAt(0)?.toUpperCase() || 'J'
                                )}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white mb-1">{job.title}</h2>
                                <p className="text-white/90 text-lg">{job.company}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white text-sm">
                                        {job.job_type?.replace('-', ' ')?.toUpperCase()}
                                    </span>
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white text-sm">
                                        {job.location}
                                    </span>
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white text-sm">
                                        {job.experience}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-slate-200 px-8">
                        <div className="flex gap-6">
                            {['overview', 'requirements', 'company'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-4 text-sm font-medium border-b-2 transition-colors capitalize ${
                                        activeTab === tab
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 max-h-[60vh] overflow-y-auto">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <p className="text-slate-500 text-sm mb-1">Salary</p>
                                        <p className="text-lg font-semibold text-emerald-600">{job.salary}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <p className="text-slate-500 text-sm mb-1">Experience</p>
                                        <p className="text-lg font-semibold text-slate-900">{job.experience}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <p className="text-slate-500 text-sm mb-1">Applicants</p>
                                        <p className="text-lg font-semibold text-slate-900">{job.applicants || 0}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-lg font-semibold text-slate-900 mb-3">About the Role</h4>
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
                                </div>

                                {job.skills && job.skills.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-slate-900 mb-3">Required Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {job.skills.map((skill, idx) => (
                                                <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-100">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {job.perks && job.perks.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-slate-900 mb-3">Perks & Benefits</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {job.perks.map((perk, idx) => (
                                                <span 
                                                    key={idx} 
                                                    className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100 flex items-center gap-1.5"
                                                >
                                                    <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    {perk}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {screeningQuestions.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-slate-900 mb-3">Application Questions</h4>
                                        <div className="space-y-3">
                                            {screeningQuestions.map((question, index) => (
                                                <div key={question.id || index} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {question.question}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 text-xs">
                                                            <span className="rounded-full bg-blue-100 px-2.5 py-1 font-medium text-blue-700">
                                                                {QUESTION_TYPE_LABELS[question.type] || 'Text Input'}
                                                            </span>
                                                            <span className={`rounded-full px-2.5 py-1 font-medium ${question.required ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'}`}>
                                                                {question.required ? 'Required' : 'Optional'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {question.options.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {question.options.map((option, optionIndex) => (
                                                                <span key={`${question.id}-option-${optionIndex}`} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">
                                                                    {option}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'requirements' && (
                            <div className="space-y-6">
                                {(() => {
                                    const quals = Array.isArray(job.qualifications) 
                                        ? job.qualifications 
                                        : (typeof job.qualifications === 'string' && job.qualifications
                                            ? job.qualifications.split('\n').map(s => s.trim()).filter(Boolean)
                                            : []);
                                    return quals.length > 0 && (
                                        <div>
                                            <h4 className="text-lg font-semibold text-slate-900 mb-3">Qualifications</h4>
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                <ul className="space-y-2">
                                                    {quals.map((item, idx) => (
                                                        <li key={idx} className="text-slate-700 flex items-start gap-2">
                                                            <span className="text-blue-500 mt-1">•</span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {(() => {
                                    const responsibilities = Array.isArray(job.key_responsibilities || job.keyResponsibilities) 
                                        ? (job.key_responsibilities || job.keyResponsibilities) 
                                        : (typeof (job.key_responsibilities || job.keyResponsibilities) === 'string' && (job.key_responsibilities || job.keyResponsibilities)
                                            ? (job.key_responsibilities || job.keyResponsibilities).split('\n').map(s => s.trim()).filter(Boolean)
                                            : []);
                                    return responsibilities.length > 0 && (
                                        <div>
                                            <h4 className="text-lg font-semibold text-slate-900 mb-3">Key Responsibilities</h4>
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                <ul className="space-y-2">
                                                    {responsibilities.map((item, idx) => (
                                                        <li key={idx} className="text-slate-700 flex items-start gap-2">
                                                            <span className="text-blue-500 mt-1">•</span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {activeTab === 'company' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-slate-500 text-sm mb-1">Posted by</p>
                                    <p className="text-lg font-semibold text-slate-900">{job.creator?.name || 'Admin'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-slate-500 text-sm mb-1">Posted on</p>
                                    <p className="text-lg font-semibold text-slate-900">
                                        {new Date(job.created_at).toLocaleDateString('en-IN', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                </div>
                                {job.last_date && (
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <p className="text-slate-500 text-sm mb-1">Application Deadline</p>
                                        <p className="text-lg font-semibold text-slate-900">
                                            {new Date(job.last_date).toLocaleDateString('en-IN', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-5 bg-slate-50 rounded-b-2xl border-t border-slate-200 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Close
                        </button>
                        {hasApplied ? (
                            <button
                                disabled
                                className="px-6 py-2.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg cursor-not-allowed flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Already Applied
                            </button>
                        ) : (
                            <button
                                onClick={() => onApply(job)}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Apply for this Job
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Apply Modal
const ApplyModal = ({ job, isOpen, onClose, onSubmit, isSubmitting, initialMode = 'resume', profileGate }) => {
    const [coverLetter, setCoverLetter] = useState('');
    const [resume, setResume] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [mode, setMode] = useState(initialMode);
    const [screeningAnswers, setScreeningAnswers] = useState({});
    const [screeningErrors, setScreeningErrors] = useState({});
    const [details, setDetails] = useState({
        isFresher: true,
        experienceYears: '',
        lastSalaryAmount: '',
        lastSalaryUnit: 'lpa',
        expectedSalaryAmount: '',
        expectedSalaryUnit: 'lpa',
        skills: '',
        hobbies: '',
        overview: '',
        tenthPercentage: '',
        twelfthPercentage: '',
        degreeName: '',
        collegeName: '',
        cgpa: '',
        projectTitle: '',
        projectDescription: '',
        projectLink: '',
        linkedin: '',
        github: '',
        portfolio: '',
    });
    const applicationQuestions = normalizeApplicationQuestions(job?.application_questions);

    useEffect(() => {
        if (!isOpen) return;
        setMode(initialMode);
        setCoverLetter('');
        setResume(null);
        setDragActive(false);
        setDetails({
            isFresher: true,
            experienceYears: '',
            lastSalaryAmount: '',
            lastSalaryUnit: 'lpa',
            expectedSalaryAmount: '',
            expectedSalaryUnit: 'lpa',
            skills: '',
            hobbies: '',
            overview: '',
            tenthPercentage: '',
            twelfthPercentage: '',
            degreeName: '',
            collegeName: '',
            cgpa: '',
            projectTitle: '',
            projectDescription: '',
            projectLink: '',
            linkedin: '',
            github: '',
            portfolio: '',
        });
        setScreeningAnswers(
            normalizeApplicationQuestions(job?.application_questions).reduce((answers, question) => {
                answers[question.id] = isMultiSelectQuestion(question.type) ? [] : '';
                return answers;
            }, {})
        );
        setScreeningErrors({});
    }, [isOpen, initialMode, job]);

    if (!isOpen || !job) return null;

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setResume(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setResume(e.target.files[0]);
        }
    };

    const updateScreeningAnswer = (questionId, value) => {
        setScreeningAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));
        setScreeningErrors((prev) => {
            if (!prev[questionId]) {
                return prev;
            }

            const next = { ...prev };
            delete next[questionId];
            return next;
        });
    };

    const toggleMultiSelectAnswer = (questionId, option) => {
        setScreeningAnswers((prev) => {
            const selectedOptions = Array.isArray(prev[questionId]) ? prev[questionId] : [];
            const nextValue = selectedOptions.includes(option)
                ? selectedOptions.filter((item) => item !== option)
                : [...selectedOptions, option];

            return {
                ...prev,
                [questionId]: nextValue,
            };
        });
        setScreeningErrors((prev) => {
            if (!prev[questionId]) {
                return prev;
            }

            const next = { ...prev };
            delete next[questionId];
            return next;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const nextErrors = {};

        applicationQuestions.forEach((question) => {
            const answer = screeningAnswers[question.id];
            const isEmpty = isMultiSelectQuestion(question.type)
                ? !Array.isArray(answer) || answer.length < 1
                : String(answer || '').trim() === '';

            if (question.required && isEmpty) {
                nextErrors[question.id] = 'This answer is required.';
            }
        });

        if (Object.keys(nextErrors).length > 0) {
            setScreeningErrors(nextErrors);
            return;
        }

        const normalizedScreeningAnswers = applicationQuestions.reduce((answers, question) => {
            const answer = screeningAnswers[question.id];
            answers[question.id] = isMultiSelectQuestion(question.type)
                ? (Array.isArray(answer) ? answer : [])
                : String(answer || '').trim();
            return answers;
        }, {});

        onSubmit({ coverLetter, resume, mode, details, screeningAnswers: normalizedScreeningAnswers });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50" onClick={onClose}></div>
                
                <div className="inline-block w-full max-w-2xl my-8 text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-slate-900">Apply for {job.title}</h3>
                            <p className="text-slate-500 text-sm mt-1">{job.company}</p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {profileGate && profileGate.minRequired && profileGate.percentage < profileGate.minRequired && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="text-sm font-semibold text-amber-800">
                                            Profile completion {profileGate.percentage}% (min {profileGate.minRequired}% required)
                                        </div>
                                        <div className="text-xs text-amber-700 mt-1">
                                            Fill details to generate resume and complete your profile.
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => router.visit(route('member.profile'))}
                                        className="px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-amber-800 text-xs font-semibold hover:bg-amber-100"
                                    >
                                        Go to Profile
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-1 border border-slate-200">
                            <button
                                type="button"
                                onClick={() => setMode('resume')}
                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold ${
                                    mode === 'resume' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Upload Resume
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('details')}
                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold ${
                                    mode === 'details' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Fill Details
                            </button>
                        </div>

                        {/* Cover Letter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Cover Letter <span className="text-slate-400">(Optional)</span>
                            </label>
                            <textarea
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                rows={5}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                placeholder="Tell us why you're a great fit for this role..."
                            />
                            <p className="text-xs text-slate-500 mt-1">{coverLetter.length}/5000 characters</p>
                        </div>

                        {applicationQuestions.length > 0 && (
                            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div>
                                    <h4 className="text-base font-semibold text-slate-900">Application Questions</h4>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Answer the screening questions before submitting your application.
                                    </p>
                                </div>

                                {applicationQuestions.map((question, index) => (
                                    <div key={question.id || index} className="space-y-2">
                                        <label className="block text-sm font-medium text-slate-700">
                                            {question.question} {question.required && <span className="text-red-500">*</span>}
                                        </label>

                                        {question.type === 'textarea' && (
                                            <textarea
                                                value={String(screeningAnswers[question.id] || '')}
                                                onChange={(e) => updateScreeningAnswer(question.id, e.target.value)}
                                                rows={4}
                                                className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                                                    screeningErrors[question.id] ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                                }`}
                                                placeholder="Enter your answer"
                                            />
                                        )}

                                        {question.type === 'text' && (
                                            <input
                                                type="text"
                                                value={String(screeningAnswers[question.id] || '')}
                                                onChange={(e) => updateScreeningAnswer(question.id, e.target.value)}
                                                className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    screeningErrors[question.id] ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                                }`}
                                                placeholder="Enter your answer"
                                            />
                                        )}

                                        {question.type === 'single_select' && (
                                            <select
                                                value={String(screeningAnswers[question.id] || '')}
                                                onChange={(e) => updateScreeningAnswer(question.id, e.target.value)}
                                                className={`w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    screeningErrors[question.id] ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                                }`}
                                            >
                                                <option value="">Select an option</option>
                                                {question.options.map((option, optionIndex) => (
                                                    <option key={`${question.id}-option-${optionIndex}`} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        )}

                                        {question.type === 'multi_select' && (
                                            <div className={`space-y-2 rounded-lg border px-4 py-3 ${
                                                screeningErrors[question.id] ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
                                            }`}>
                                                {question.options.map((option, optionIndex) => {
                                                    const selectedOptions = Array.isArray(screeningAnswers[question.id]) ? screeningAnswers[question.id] : [];
                                                    const checked = selectedOptions.includes(option);

                                                    return (
                                                        <label key={`${question.id}-option-${optionIndex}`} className="flex items-center gap-3 text-sm text-slate-700">
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() => toggleMultiSelectAnswer(question.id, option)}
                                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span>{option}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {screeningErrors[question.id] && (
                                            <p className="text-xs font-medium text-red-600">{screeningErrors[question.id]}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {mode === 'resume' ? (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Resume / CV <span className="text-slate-400">(Required if you don’t fill details)</span>
                                </label>
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                        dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300'
                                    }`}
                                >
                                    {resume ? (
                                        <div className="flex items-center justify-center gap-2 text-slate-700">
                                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="font-medium">{resume.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => setResume(null)}
                                                className="text-red-500 hover:text-red-700 ml-2"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <svg className="w-10 h-10 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <p className="text-slate-600 mb-1">Drag & drop your resume here</p>
                                            <p className="text-slate-400 text-sm">or</p>
                                            <label className="mt-2 inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                                                Browse Files
                                                <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                            </label>
                                            <p className="text-xs text-slate-400 mt-2">PDF, DOC, DOCX up to 5MB</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Candidate Type
                                        </label>
                                        <select
                                            value={details.isFresher ? 'fresher' : 'experienced'}
                                            onChange={(e) => setDetails(prev => ({ ...prev, isFresher: e.target.value === 'fresher' }))}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="fresher">Fresher</option>
                                            <option value="experienced">Experienced</option>
                                        </select>
                                    </div>
                                    {!details.isFresher && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Total Experience (Years)
                                            </label>
                                            <input
                                                value={details.experienceYears}
                                                onChange={(e) => setDetails(prev => ({ ...prev, experienceYears: e.target.value }))}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="e.g. 2"
                                            />
                                        </div>
                                    )}
                                </div>

                                {!details.isFresher && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Last Salary</label>
                                            <div className="flex gap-2">
                                                <input
                                                    value={details.lastSalaryAmount}
                                                    onChange={(e) => setDetails(prev => ({ ...prev, lastSalaryAmount: e.target.value }))}
                                                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="e.g. 6"
                                                />
                                                <select
                                                    value={details.lastSalaryUnit}
                                                    onChange={(e) => setDetails(prev => ({ ...prev, lastSalaryUnit: e.target.value }))}
                                                    className="px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="lpa">LPA</option>
                                                    <option value="month">Per Month</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Expected Salary</label>
                                            <div className="flex gap-2">
                                                <input
                                                    value={details.expectedSalaryAmount}
                                                    onChange={(e) => setDetails(prev => ({ ...prev, expectedSalaryAmount: e.target.value }))}
                                                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="e.g. 8"
                                                />
                                                <select
                                                    value={details.expectedSalaryUnit}
                                                    onChange={(e) => setDetails(prev => ({ ...prev, expectedSalaryUnit: e.target.value }))}
                                                    className="px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="lpa">LPA</option>
                                                    <option value="month">Per Month</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Skills (comma separated)
                                        </label>
                                        <input
                                            value={details.skills}
                                            onChange={(e) => setDetails(prev => ({ ...prev, skills: e.target.value }))}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g. React, Laravel, SQL"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Hobbies (comma separated)
                                        </label>
                                        <input
                                            value={details.hobbies}
                                            onChange={(e) => setDetails(prev => ({ ...prev, hobbies: e.target.value }))}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g. Reading, Cricket"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Overview <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={details.overview}
                                        onChange={(e) => setDetails(prev => ({ ...prev, overview: e.target.value }))}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        placeholder="Short summary about you..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">10th Percentage</label>
                                        <input
                                            value={details.tenthPercentage}
                                            onChange={(e) => setDetails(prev => ({ ...prev, tenthPercentage: e.target.value }))}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g. 85%"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">12th Percentage</label>
                                        <input
                                            value={details.twelfthPercentage}
                                            onChange={(e) => setDetails(prev => ({ ...prev, twelfthPercentage: e.target.value }))}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g. 78%"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Degree <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            value={details.degreeName}
                                            onChange={(e) => setDetails(prev => ({ ...prev, degreeName: e.target.value }))}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g. B.Tech CSE"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">College</label>
                                        <input
                                            value={details.collegeName}
                                            onChange={(e) => setDetails(prev => ({ ...prev, collegeName: e.target.value }))}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="College name"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">CGPA/GPA</label>
                                        <input
                                            value={details.cgpa}
                                            onChange={(e) => setDetails(prev => ({ ...prev, cgpa: e.target.value }))}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g. 8.2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Portfolio</label>
                                        <input
                                            value={details.portfolio}
                                            onChange={(e) => setDetails(prev => ({ ...prev, portfolio: e.target.value }))}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="https://"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">LinkedIn</label>
                                        <input
                                            value={details.linkedin}
                                            onChange={(e) => setDetails(prev => ({ ...prev, linkedin: e.target.value }))}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="https://"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">GitHub</label>
                                        <input
                                            value={details.github}
                                            onChange={(e) => setDetails(prev => ({ ...prev, github: e.target.value }))}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="https://"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Last Project Title</label>
                                        <input
                                            value={details.projectTitle}
                                            onChange={(e) => setDetails(prev => ({ ...prev, projectTitle: e.target.value }))}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Project title"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Project Link</label>
                                        <input
                                            value={details.projectLink}
                                            onChange={(e) => setDetails(prev => ({ ...prev, projectLink: e.target.value }))}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="https://"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Project Description</label>
                                    <textarea
                                        value={details.projectDescription}
                                        onChange={(e) => setDetails(prev => ({ ...prev, projectDescription: e.target.value }))}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        placeholder="What you built and tech used..."
                                    />
                                </div>

                                <div className="text-xs text-slate-500">
                                    Resume will be generated automatically (random theme) and shared with Admin/Super Admin.
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                        Submit Application
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Main Component
export default function JobListings({ auth, jobs, appliedJobIds, savedJobIds, filters, jobTypes, locations }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.job_type || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.job_category || '');
    const [selectedLocation, setSelectedLocation] = useState(filters.location || '');
    const [selectedDistance, setSelectedDistance] = useState(filters.distance || 20);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localAppliedIds, setLocalAppliedIds] = useState(appliedJobIds || []);
    const [localSavedIds, setLocalSavedIds] = useState(savedJobIds || []);
    const [savingJobId, setSavingJobId] = useState(null);
    const [notification, setNotification] = useState(null);
    const [profileGate, setProfileGate] = useState(null);
    const [applyInitialMode, setApplyInitialMode] = useState('resume');

    // Handle search with debounce
    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(route('member.jobs.index'), {
                search: searchQuery,
                job_type: selectedType,
                job_category: selectedCategory,
                location: selectedLocation,
                distance: selectedDistance,
            }, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 500);

        return () => clearTimeout(timeout);
    }, [searchQuery, selectedType, selectedCategory, selectedLocation, selectedDistance]);

    const handleViewDetails = (job) => {
        setSelectedJob(job);
        setShowDetailsModal(true);
    };

    const handleToggleSave = async (job) => {
        const wasSaved = localSavedIds.includes(job.id);
        
        // Optimistic update
        if (wasSaved) {
            setLocalSavedIds(localSavedIds.filter(id => id !== job.id));
        } else {
            setLocalSavedIds([...localSavedIds, job.id]);
        }
        
        setSavingJobId(job.id);
        try {
            const url = wasSaved 
                ? route('member.jobs.unsave', job.id)
                : route('member.jobs.save', job.id);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                },
            });
            
            const data = await response.json();
            if (!response.ok || !data?.success) {
                // Rollback on failure
                if (wasSaved) {
                    setLocalSavedIds([...localSavedIds, job.id]);
                } else {
                    setLocalSavedIds(localSavedIds.filter(id => id !== job.id));
                }
                setNotification({ type: 'error', message: data?.message || 'Failed to update' });
            }
        } catch (error) {
            // Rollback on error
            if (wasSaved) {
                setLocalSavedIds([...localSavedIds, job.id]);
            } else {
                setLocalSavedIds(localSavedIds.filter(id => id !== job.id));
            }
            setNotification({ type: 'error', message: 'Network error. Please try again.' });
        } finally {
            setSavingJobId(null);
        }
    };

    const handleApplyClick = (job) => {
        setSelectedJob(job);
        setShowDetailsModal(false);
        setProfileGate(null);
        setApplyInitialMode('resume');
        fetch(route('member.api.profile-completion'), {
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
            },
        })
            .then(res => res.json().catch(() => null))
            .then(data => {
                if (data?.success) {
                    const gate = {
                        percentage: data.completion_percentage ?? 0,
                        missingFields: Array.isArray(data.missing_fields) ? data.missing_fields : [],
                        minRequired: data.min_required ?? 35,
                        profileUrl: data.profile_url,
                    };
                    setProfileGate(gate);
                    if (gate.percentage < gate.minRequired) {
                        setApplyInitialMode('details');
                        setNotification({
                            type: 'error',
                            message: `Profile completion ${gate.percentage}% (min ${gate.minRequired}% required). Fill details or update profile to apply.`,
                        });
                    }
                }
            })
            .finally(() => {
                setShowApplyModal(true);
            });
    };

    const handleApplySubmit = async ({ coverLetter, resume, mode, details, screeningAnswers }) => {
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('cover_letter', coverLetter);
        formData.append('screening_answers', JSON.stringify(screeningAnswers || {}));
        if (mode === 'resume' && resume) {
            formData.append('resume', resume);
        }
        if (mode === 'details') {
            const normalizeList = (value) =>
                String(value || '')
                    .split(',')
                    .map(v => v.trim())
                    .filter(Boolean);

            const applicationProfile = {
                is_fresher: !!details.isFresher,
                skills: normalizeList(details.skills),
                hobbies: normalizeList(details.hobbies),
                overview: details.overview || '',
                links: {
                    linkedin: details.linkedin || null,
                    github: details.github || null,
                    portfolio: details.portfolio || null,
                },
                education: {
                    tenth: { percentage: details.tenthPercentage || null },
                    twelfth: { percentage: details.twelfthPercentage || null },
                    degree: {
                        name: details.degreeName || '',
                        college: details.collegeName || null,
                        cgpa: details.cgpa || null,
                    },
                },
                experience: details.isFresher
                    ? null
                    : {
                          total_years: details.experienceYears || null,
                          last_salary: {
                              amount: details.lastSalaryAmount || null,
                              unit: details.lastSalaryUnit || null,
                          },
                          expected_salary: {
                              amount: details.expectedSalaryAmount || null,
                              unit: details.expectedSalaryUnit || null,
                          },
                      },
                projects: [
                    {
                        title: details.projectTitle || null,
                        description: details.projectDescription || null,
                        link: details.projectLink || null,
                    },
                ],
            };

            formData.append('application_profile', JSON.stringify(applicationProfile));
        }

        try {
            const response = await fetch(`/member/jobs/${selectedJob.id}/apply`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
                body: formData,
            });

            const data = await response.json().catch(() => null);

            if (response.ok && data?.success) {
                setLocalAppliedIds([...localAppliedIds, selectedJob.id]);
                setNotification({ type: 'success', message: data.message });
                setShowApplyModal(false);
                setSelectedJob(null);
            } else {
                const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : null;
                setNotification({
                    type: 'error',
                    message: firstError || data?.message || 'Failed to submit application. Please check your answers and try again.',
                });
            }
        } catch (error) {
            setNotification({ type: 'error', message: 'Failed to submit application. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Auto-hide notification
    useEffect(() => {
        if (notification) {
            const timeout = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timeout);
        }
    }, [notification]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Browse Jobs" />

            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${
                    notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                    <div className="flex items-center gap-2">
                        {notification.type === 'success' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        <span className="font-medium">{notification.message}</span>
                    </div>
                </div>
            )}

            <div className="py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Find Your Dream Job</h1>
                    <p className="text-slate-600">Browse {jobs.total} active job openings</p>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search jobs, companies... "
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                         {/* Job Type Filter */}
                         <select
                             value={selectedType}
                             onChange={(e) => setSelectedType(e.target.value)}
                             className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                         >
                             <option value="">All Job Types</option>
                             {jobTypes?.map((type) => (
                                 <option key={type} value={type}>
                                     {type?.replace('-', ' ')?.replace(/\b\w/g, l => l.toUpperCase())}
                                 </option>
                             ))}
                         </select>

                         {/* Job Category Filter */}
                         <select
                             value={selectedCategory}
                             onChange={(e) => setSelectedCategory(e.target.value)}
                             className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                         >
                             <option value="">All Categories</option>
                             {JOB_CATEGORIES.map((category) => (
                                 <option key={category} value={category}>
                                     {category}
                                 </option>
                             ))}
                         </select>

                         {/* Location Search Filter */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search location..."
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Distance Filter */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                            </div>
                            <select
                                value={selectedDistance}
                                onChange={(e) => setSelectedDistance(Number(e.target.value))}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                            >
                                <option value={5}>5 km</option>
                                <option value={10}>10 km</option>
                                <option value={20}>20 km</option>
                                <option value={30}>30 km</option>
                                <option value={50}>50 km</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-3 text-sm text-slate-500">
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Distance filter shows jobs within {selectedDistance}km from your location. Update your profile location to enable distance-based filtering.
                    </div>
                </div>

                {/* Jobs Grid */}
                {jobs.data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                        {jobs.data.map((job) => (
                            <CandidateJobCard
                                key={job.id}
                                job={job}
                                hasApplied={localAppliedIds.includes(job.id)}
                                isSaved={localSavedIds.includes(job.id)}
                                onViewDetails={handleViewDetails}
                                onApply={handleApplyClick}
                                onToggleSave={handleToggleSave}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No jobs found</h3>
                        <p className="text-slate-500">Try adjusting your search or filters</p>
                    </div>
                )}

                {/* Pagination */}
                {jobs.last_page > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex items-center gap-2">
                            {jobs.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    disabled={!link.url}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                        link.active
                                            ? 'bg-blue-600 text-white'
                                            : link.url
                                                ? 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <JobDetailsModal
                job={selectedJob}
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                hasApplied={selectedJob ? localAppliedIds.includes(selectedJob.id) : false}
                onApply={handleApplyClick}
            />

            <ApplyModal
                job={selectedJob}
                isOpen={showApplyModal}
                onClose={() => setShowApplyModal(false)}
                onSubmit={handleApplySubmit}
                isSubmitting={isSubmitting}
                initialMode={applyInitialMode}
                profileGate={profileGate}
            />
        </AuthenticatedLayout>
    );
}
