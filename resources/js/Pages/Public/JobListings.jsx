import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Briefcase, ArrowRight, Clock, MapPin, DollarSign, Bookmark, BookmarkCheck } from 'lucide-react';
import { ThemeProvider } from '@/Contexts/ThemeContext';
import { useTheme } from '@/Contexts/ThemeContext';
import HomepageLayout from '@/Layouts/HomepageLayout';
import Footer from '@/Components/Layout/Footer';

// Job Card Component (Copy from Member/JobListings)
const CandidateJobCard = ({ job, onViewDetails, onApply, isDark, isAuthenticated, onSaveJob, savedJobs }) => {
    const getJobTypeBadge = (type) => {
        const badges = {
            'full-time': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'part-time': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'contract': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            'internship': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            'remote': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
        };
        return badges[type?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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

    const cardBg = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200';
    const hoverBorder = isDark ? 'hover:border-blue-500' : 'hover:border-blue-300';
    const footerBg = isDark ? 'bg-gray-700/50 border-gray-700' : 'bg-slate-50 border-slate-100';
    const textPrimary = isDark ? 'text-white' : 'text-slate-900';
    const textSecondary = isDark ? 'text-gray-300' : 'text-slate-600';
    const textMuted = isDark ? 'text-gray-400' : 'text-slate-500';

    const isSaved = savedJobs?.includes(job.id);
    const handleSaveJob = () => {
        if (!isAuthenticated) {
            // Redirect to login when trying to save without authentication
            window.location.href = route('login');
            return;
        }
        onSaveJob(job.id);
    };

    return (
        <div className={`${cardBg} rounded-2xl shadow-sm border ${hoverBorder} transition-all duration-300 overflow-hidden flex flex-col h-full`}>
            {/* Header with Company Logo */}
            <div className="p-5 flex-grow">
                <div className="flex items-start gap-4">
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
                    <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-semibold ${textPrimary} line-clamp-1 mb-1`}>
                            {job.title}
                        </h3>
                        <p className={`${textSecondary} text-sm font-medium`}>{job.company}</p>
                    </div>

                    {/* Save/Bookmark Button - Top Right */}
                    <button
                        onClick={handleSaveJob}
                        className={`p-2 rounded-lg transition-all duration-300 flex-shrink-0 ${
                            isSaved
                                ? 'bg-emerald-100 text-emerald-600 border border-emerald-200 hover:bg-emerald-200'
                                : isDark
                                    ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:text-white'
                                    : 'bg-white text-gray-600 border border-slate-300 hover:bg-slate-50 hover:text-slate-700'
                        }`}
                        title={isSaved ? 'Remove from saved jobs' : isAuthenticated ? 'Save job' : 'Sign in to save jobs'}
                    >
                        {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                </div>

                {/* Job Meta */}
                <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getJobTypeBadge(job.job_type)}`}>
                        {job.job_type?.replace('-', ' ')?.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>
                        {job.experience}
                    </span>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-2">
                    <div className={`flex items-center gap-2 ${textSecondary} text-sm`}>
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{job.location}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${textSecondary} text-sm`}>
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-emerald-600">{job.salary}</span>
                    </div>
                </div>

                {/* Skills Preview */}
                {job.skills && job.skills.length > 0 && (
                    <div className="mt-4">
                        <div className="flex flex-wrap gap-1.5">
                            {job.skills.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className={`px-2 py-0.5 text-xs rounded-md border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                    {skill}
                                </span>
                            ))}
                            {job.skills.length > 3 && (
                                <span className={`px-2 py-0.5 text-xs rounded-md ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-slate-50 text-slate-500'}`}>
                                    +{job.skills.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer with Actions - Always at Bottom */}
            <div className={`px-5 py-4 ${footerBg} border-t mt-auto`}>
                <div className="flex items-center justify-between">
                    <div className={`text-xs ${textMuted}`}>
                        <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(job.last_date)}
                        </div>
                        <div className="mt-1">
                            {job.applicants || 0} applicants
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onViewDetails(job)}
                            className={`px-4 py-2 text-sm font-medium ${isDark ? 'text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600' : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'} rounded-lg transition-colors`}
                        >
                            View Details
                        </button>
                        <button
                            onClick={() => onApply(job)}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Apply Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Job Details Modal (Exact Copy from Member/JobListings)
const JobDetailsModal = ({ job, isOpen, onClose, hasApplied, onApply }) => {
    const [activeTab, setActiveTab] = useState('overview');

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
                            </div>
                        )}

                        {activeTab === 'requirements' && (
                            <div className="space-y-6">
                                {(job.qualifications) && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-slate-900 mb-3">Requirements</h4>
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                                {job.qualifications || 'No qualifications specified.'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h4 className="text-lg font-semibold text-slate-900 mb-3">Key Responsibilities</h4>
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                            {job.key_responsibilities || job.keyResponsibilities || 'No key responsibilities specified.'}
                                        </p>
                                    </div>
                                </div>
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
                                className="px-6 py-2.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg cursor-not-allowed flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Applied
                            </button>
                        ) : (
                            <button
                                onClick={() => onApply(job)}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
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

function PublicJobListingsContent({ auth, jobs, filters = {} }) {
    const [selectedJob, setSelectedJob] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const { isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState(filters.search ?? '');
    const [selectedType, setSelectedType] = useState(filters.job_type ?? '');
    const [selectedLocation, setSelectedLocation] = useState(filters.location ?? '');
    const [filteredJobs, setFilteredJobs] = useState(jobs || []);
    const isAuthenticated = !!auth?.user;
    const [savedJobs, setSavedJobs] = useState([]);

    useEffect(() => {
        setSearchQuery(filters.search ?? '');
        setSelectedType(filters.job_type ?? '');
        setSelectedLocation(filters.location ?? '');
    }, [filters.job_type, filters.location, filters.search]);

    // Filter jobs based on search and filters
    useEffect(() => {
        let filtered = jobs || [];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(job =>
                job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.location?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Job type filter
        if (selectedType) {
            filtered = filtered.filter(job =>
                job.job_type?.toLowerCase() === selectedType.toLowerCase()
            );
        }

        // Location filter
        if (selectedLocation) {
            filtered = filtered.filter(job =>
                job.location?.toLowerCase().includes(selectedLocation.toLowerCase())
            );
        }

        setFilteredJobs(filtered);
    }, [jobs, searchQuery, selectedType, selectedLocation]);

    // Get unique locations from jobs
    const jobTypes = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance', 'Remote'];

    const handleViewDetails = (job) => {
        setSelectedJob(job);
        setShowDetailsModal(true);
    };

    const handleApply = () => {
        if (auth?.guard === 'member') {
            window.location.href = route('member.jobs.index');
            return;
        }

        if (!auth?.user) {
            window.location.href = route('login');
            return;
        }

        window.location.href = route('login');
    };

    const handleCloseModal = () => {
        setShowDetailsModal(false);
        setSelectedJob(null);
    };

    const handleSaveJob = (jobId) => {
        if (savedJobs.includes(jobId)) {
            setSavedJobs(savedJobs.filter(id => id !== jobId));
        } else {
            setSavedJobs([...savedJobs, jobId]);
        }
    };

    const bgColor = isDark ? 'bg-[#0f172a]' : 'bg-gray-50';
    const textColor = isDark ? 'text-white' : 'text-gray-900';
    const subTextColor = isDark ? 'text-gray-400' : 'text-gray-600';

    return (
        <>
            <Head title="Browse Jobs - ATS" />
            <HomepageLayout>
                <div className={`min-h-screen ${bgColor}`}>
                {/* Header */}
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className={`text-3xl font-bold ${textColor}`}>Browse Jobs</h1>
                                <p className={`${subTextColor} mt-1`}>Discover opportunities from top companies</p>
                            </div>
                            {auth?.user ? (
                                <Link
                                    href={route('member.dashboard')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search Input */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search jobs, companies..."
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                    }`}
                                />
                            </div>

                            {/* Job Type Filter */}
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                }`}
                            >
                                <option value="">All Job Types</option>
                                {jobTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </option>
                                ))}
                            </select>

                            {/* Location Filter */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search location..."
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                    }`}
                                />
                            </div>

                            {/* Clear Filters Button */}
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedType('');
                                    setSelectedLocation('');
                                }}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Clear Filters
                            </button>
                        </div>

                        {/* Active Filters Display */}
                        {(searchQuery || selectedType || selectedLocation) && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {searchQuery && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                                        Search: {searchQuery}
                                        <button onClick={() => setSearchQuery('')} className="ml-2 text-blue-600 hover:text-blue-800">×</button>
                                    </span>
                                )}
                                {selectedType && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                                        Type: {selectedType}
                                        <button onClick={() => setSelectedType('')} className="ml-2 text-green-600 hover:text-green-800">×</button>
                                    </span>
                                )}
                                {selectedLocation && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                                        Location: {selectedLocation}
                                        <button onClick={() => setSelectedLocation('')} className="ml-2 text-purple-600 hover:text-purple-800">×</button>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {!filteredJobs || filteredJobs.length === 0 ? (
                        <div className={`text-center py-16 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <Briefcase className={`w-16 h-16 mx-auto mb-4 ${subTextColor}`} />
                            <h3 className={`text-xl font-semibold mb-2 ${textColor}`}>No jobs available</h3>
                            <p className={`${subTextColor} mb-6`}>Check back later for new opportunities</p>
                            <Link
                                href={route('homepage')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Back to Homepage
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredJobs.map((job) => (
                                <CandidateJobCard
                                    key={job.id}
                                    job={job}
                                    onViewDetails={handleViewDetails}
                                    onApply={handleApply}
                                    isDark={isDark}
                                    isAuthenticated={isAuthenticated}
                                    onSaveJob={handleSaveJob}
                                    savedJobs={savedJobs}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Modals */}
                <JobDetailsModal
                    job={selectedJob}
                    isOpen={showDetailsModal}
                    onClose={handleCloseModal}
                    hasApplied={false}
                    onApply={handleApply}
                />
                </div>
                <Footer />
            </HomepageLayout>
        </>
    );
}

export default function PublicJobListings(props) {
    return (
        <ThemeProvider>
            <PublicJobListingsContent {...props} />
        </ThemeProvider>
    );
}
