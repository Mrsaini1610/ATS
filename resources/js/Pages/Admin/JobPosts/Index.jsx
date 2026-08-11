import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import LocationInput from '../../../Components/LocationInput';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import { useAlerts } from '../../../Components/Alerts';

// Predefined skills list
const PREDEFINED_SKILLS = [
    "React", "Laravel", "MySQL", "JavaScript", "PHP", "Python",
    "Java", "Node.js", "HTML", "CSS", "TypeScript", "Vue.js",
    "Angular", "MongoDB", "PostgreSQL", "Docker", "AWS", "Git",
    "REST API", "GraphQL", "Redis", "RabbitMQ", "Kubernetes"
];

// Reusable JobCard Component
const JobCard = ({ job, onViewDetails, onEdit, onDelete }) => {
    const [showFullPerks, setShowFullPerks] = useState(false);

    const perksToShow = showFullPerks ? job.perks : job.perks?.slice(0, 2);
    const hasMorePerks = job.perks && job.perks.length > 2;

    return (
        <div className={`bg-white rounded-3xl shadow-sm p-4 border min-h-[320px] relative flex flex-col ${job.active ? 'border-blue-300 ring-2 ring-blue-200' : 'border-slate-200'
            }`}>
            {/* Action Icons - Outside Card */}
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

            <div className="flex items-start justify-between mb-3">
                <div className="flex gap-3">
                    <img src={job.companyImage} alt={job.title} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                        <h2 className="text-[16px] font-semibold text-slate-900 line-clamp-1">{job.title}</h2>
                        <p className="text-slate-500 text-[12px]">{job.company}</p>
                    </div>
                </div>
                <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-medium whitespace-nowrap">
                    {job.type}
                </span>
            </div>

            <div className="space-y-1 text-slate-600 text-[12px] mb-2">
                <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700">Location:</span>
                    <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700">Experience:</span>
                    <span>{job.experience}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700">Salary:</span>
                    <span className="text-emerald-600 font-medium">{job.salary}</span>
                </div>
            </div>

            <div className="mb-2">
                <p className="text-[11px] font-semibold text-slate-700 mb-1">Skills:</p>
                <div className="flex flex-wrap gap-1">
                    {job.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px]">
                            {skill}
                        </span>
                    ))}
                    {job.skills.length > 3 && (
                        <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px]">
                            +{job.skills.length - 3} more
                        </span>
                    )}
                </div>
            </div>

            <div className="mb-2 flex-grow">
                <p className="text-[11px] font-medium text-slate-700 mb-1">Perks:</p>
                <div className="text-[10px] text-slate-600 leading-4">
                    {perksToShow?.join(' • ') || 'Flexible working hours • Health Insurance • Learning opportunities'}
                    {hasMorePerks && (
                        <button
                            onClick={() => setShowFullPerks(!showFullPerks)}
                            className="text-blue-600 hover:text-blue-800 ml-1 underline"
                        >
                            {showFullPerks ? 'Show less' : `+${job.perks.length - 2} more`}
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-auto">
                <hr className="my-2" />

                <div className="flex justify-between items-center text-[12px] text-slate-500 mb-3">
                    <p>Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }) : 'Just now'} <span className="mx-2">•</span> {job.applicants || 0} applicants</p>
                </div>

                <button
                    onClick={() => onViewDetails(job)}
                    className="w-full py-2 rounded-xl text-blue-600 text-[14px] font-semibold hover:bg-blue-50 transition-colors"
                >
                    👁 View Details
                </button>
            </div>
        </div>
    );
};

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

export default function JobPostsIndex({ auth, jobs: initialJobs }) {
    const defaultFormData = {
        jobTitle: "",
        companyName: "",
        companyLogo: null,
        companyLogoPreview: "",
        location: "",
        jobType: "Full Time",
        openings: 1,
        experience: "",
        minSalary: "",
        maxSalary: "",
        salaryPeriod: "Monthly",
        lastDate: "",
        assets: [],
        skills: [],
        currentSkill: "",
        perks: [],
        currentPerk: "",
        responsibilities: [],
        currentResponsibility: "",
        qualifications: [],
        currentQualification: "",
        jobDescription: "",
        // Company Details
        compCompanyName: "",
        compLogo: null,
        compLogoPreview: "",
        contactPerson: "",
        contactPhone: "",
        contactEmail: "",
        companyAddress: ""
    };

    const [formData, setFormData] = useState({ ...defaultFormData });
    const [locationLatLng, setLocationLatLng] = useState({ latitude: null, longitude: null });
    const [editingJobId, setEditingJobId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [showSkillDropdown, setShowSkillDropdown] = useState(false);

    const { successAlert, errorAlert } = useAlerts();

    const parseSalary = (salaryString) => {
        if (!salaryString) {
            return { minSalary: '', maxSalary: '', salaryPeriod: 'Monthly' };
        }

        const str = String(salaryString).replace(/\s+/g, ' ').trim();
        const match = str.match(/₹?\s*([\d,]+)\s*-\s*₹?\s*([\d,]+)\s*\/(year|month|Weekly|Yearly)/i);
        if (match) {
            let period = match[3].toLowerCase();
            if (period === 'year') period = 'Yearly';
            else if (period === 'month') period = 'Monthly';
            else period = period.charAt(0).toUpperCase() + period.slice(1).toLowerCase();
            return {
                minSalary: match[1].replace(/,/g, ''),
                maxSalary: match[2].replace(/,/g, ''),
                salaryPeriod: period,
            };
        }

        return { minSalary: '', maxSalary: '', salaryPeriod: 'Monthly' };
    };

    const fillFormForEdit = (job) => {
        if (!job) return;

        const { minSalary, maxSalary, salaryPeriod } = parseSalary(job.salary);

        setEditingJobId(job.id);
        setFormData({
            ...defaultFormData,
            jobTitle: job.title || '',
            companyName: job.company || '',
            companyLogo: null,
            companyLogoPreview: job.companyImage || '',
            location: job.location || '',
            jobType: job.type || 'Full Time',
            openings: job.openings || 1,
            experience: job.experience || '',
            minSalary,
            maxSalary,
            salaryPeriod,
            lastDate: job.lastDate || '',
            assets: Array.isArray(job.assets) ? job.assets : [],
            skills: Array.isArray(job.skills) ? job.skills : [],
            perks: Array.isArray(job.perks) ? job.perks : [],
            responsibilities: Array.isArray(job.keyResponsibilities)
                ? job.keyResponsibilities
                : (typeof job.keyResponsibilities === 'string' && job.keyResponsibilities
                    ? job.keyResponsibilities.split(',').map(s => s.trim()).filter(Boolean)
                    : []),
            qualifications: Array.isArray(job.qualifications)
                ? job.qualifications
                : (typeof job.qualifications === 'string' && job.qualifications
                    ? job.qualifications.split('\n').map(s => s.trim()).filter(Boolean)
                    : []),
            jobDescription: job.description || '',
            compCompanyName: job.company || '',
            compLogo: null,
            compLogoPreview: job.companyImage || '',
            contactPerson: job.contactPerson || '',
            contactPhone: job.contactPhone || '',
            contactEmail: job.contactEmail || '',
            companyAddress: job.companyAddress || ''
        });
    };

    // Check for edit mode on mount
    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const editJobId = urlParams.get('edit');

        if (editJobId && initialJobs) {
            const jobToEdit = initialJobs.find(job => job.id === parseInt(editJobId));
            if (jobToEdit) {
                fillFormForEdit(jobToEdit);
            }
        }
    }, [initialJobs]);

    const [showPreview, setShowPreview] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [jobs, setJobs] = useState(initialJobs || []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'minSalary' || name === 'maxSalary') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setFormData(prev => ({ ...prev, [name]: numericValue }));
            return;
        }

        if (name === 'openings') {
            const numVal = parseInt(value) || '';
            if (numVal !== '' && numVal < 1) return;
            setFormData(prev => ({ ...prev, [name]: numVal }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    companyLogo: file,
                    companyLogoPreview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCompImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    compLogo: file,
                    compLogoPreview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({
            ...prev,
            companyLogo: null,
            companyLogoPreview: null
        }));
    };

    const handleRemoveCompLogo = () => {
        setFormData(prev => ({
            ...prev,
            compLogo: null,
            compLogoPreview: null
        }));
    };

    // Skills handlers
    const handleAddSkill = () => {
        if (formData.currentSkill.trim() && !formData.skills.includes(formData.currentSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, prev.currentSkill.trim()],
                currentSkill: ""
            }));
            setShowSkillDropdown(false);
        }
    };

    const handleSelectPredefinedSkill = (skill) => {
        if (!formData.skills.includes(skill)) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, skill],
                currentSkill: ""
            }));
        }
        setShowSkillDropdown(false);
    };

    const handleRemoveSkill = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, idx) => idx !== indexToRemove)
        }));
    };

    const handleSkillKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill();
        }
    };

    // Perks handlers
    const handleAddPerk = () => {
        if (formData.currentPerk.trim() && !formData.perks.includes(formData.currentPerk.trim())) {
            setFormData(prev => ({
                ...prev,
                perks: [...prev.perks, prev.currentPerk.trim()],
                currentPerk: ""
            }));
        }
    };

    const handleRemovePerk = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            perks: prev.perks.filter((_, idx) => idx !== indexToRemove)
        }));
    };

    const handlePerkKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddPerk();
        }
    };

    // Responsibilities handlers
    const handleAddResponsibility = () => {
        if (formData.currentResponsibility.trim() && !formData.responsibilities.includes(formData.currentResponsibility.trim())) {
            setFormData(prev => ({
                ...prev,
                responsibilities: [...prev.responsibilities, prev.currentResponsibility.trim()],
                currentResponsibility: ""
            }));
        }
    };

    const handleRemoveResponsibility = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            responsibilities: prev.responsibilities.filter((_, idx) => idx !== indexToRemove)
        }));
    };

    const handleResponsibilityKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddResponsibility();
        }
    };

    // Qualifications handlers
    const handleAddQualification = () => {
        if (formData.currentQualification.trim() && !formData.qualifications.includes(formData.currentQualification.trim())) {
            setFormData(prev => ({
                ...prev,
                qualifications: [...prev.qualifications, prev.currentQualification.trim()],
                currentQualification: ""
            }));
        }
    };

    const handleRemoveQualification = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            qualifications: prev.qualifications.filter((_, idx) => idx !== indexToRemove)
        }));
    };

    const handleQualificationKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddQualification();
        }
    };

    // Assets handlers
    const handleToggleAsset = (asset) => {
        setFormData(prev => ({
            ...prev,
            assets: prev.assets.includes(asset)
                ? prev.assets.filter(a => a !== asset)
                : [...prev.assets, asset]
        }));
    };

    const handlePreview = () => {
        setShowPreview(true);
    };

    const handleClosePreview = () => {
        setShowPreview(false);
    };

    const performSubmit = async () => {
        const normalizeList = (value) => {
            if (Array.isArray(value)) {
                return value.map(v => String(v).trim()).filter(Boolean);
            }
            if (typeof value === 'string') {
                return value.split(',').map(v => v.trim()).filter(Boolean);
            }
            return [];
        };

        const formDataObj = new FormData();
        formDataObj.append('title', formData.jobTitle);
        formDataObj.append('company', formData.companyName);
        formDataObj.append('description', formData.jobDescription);
        formDataObj.append('location', formData.location);
        formDataObj.append('job_type', formData.jobType || 'Full Time');
        formDataObj.append('openings', formData.openings || 1);
        formDataObj.append('experience', formData.experience);
        const salaryRange = `₹${formData.minSalary} - ₹${formData.maxSalary}/${formData.salaryPeriod}`;
        formDataObj.append('salary', salaryRange);
        formDataObj.append('skills', JSON.stringify(normalizeList(formData.skills)));
        formDataObj.append('perks', JSON.stringify(normalizeList(formData.perks)));
        formDataObj.append('key_responsibilities', JSON.stringify(normalizeList(formData.responsibilities)));
        formDataObj.append('qualifications', JSON.stringify(normalizeList(formData.qualifications)));
        formDataObj.append('last_date', formData.lastDate);
        formDataObj.append('assets', JSON.stringify(formData.assets));
        formDataObj.append('contact_person', formData.contactPerson);
        formDataObj.append('contact_phone', formData.contactPhone);
        formDataObj.append('contact_email', formData.contactEmail);
        formDataObj.append('company_address', formData.companyAddress);

        // Append latitude and longitude if available
        if (locationLatLng.latitude !== null && locationLatLng.longitude !== null) {
            formDataObj.append('latitude', locationLatLng.latitude);
            formDataObj.append('longitude', locationLatLng.longitude);
        }

        if (formData.companyLogo) {
            formDataObj.append('company_image', formData.companyLogo);
        }

        const url = editingJobId ? route('admin.api.jobs.update', editingJobId) : route('admin.api.jobs.store');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                'Accept': 'application/json',
            },
            body: formDataObj,
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            if (data && data.errors) {
                const firstKey = Object.keys(data.errors)[0];
                const firstMessage = firstKey ? (data.errors[firstKey]?.[0] || data.message) : data.message;
                errorAlert(firstMessage || 'Validation failed. Please check the form.');
                return;
            }
            errorAlert((data && data.message) ? data.message : 'Failed to submit job post.');
            return;
        }

        if (!data || !data.success) {
            errorAlert((data && data.message) ? data.message : 'Failed to submit job post.');
            return;
        }

        if (data.data) {
            const apiJob = data.data;
            const mappedJob = {
                id: apiJob.id,
                title: apiJob.title,
                company: apiJob.company,
                companyImage: apiJob.company_image || null,
                location: apiJob.location,
                type: apiJob.job_type,
                openings: apiJob.openings,
                experience: apiJob.experience,
                salary: apiJob.salary,
                skills: Array.isArray(apiJob.skills) ? apiJob.skills : [],
                perks: Array.isArray(apiJob.perks) ? apiJob.perks : [],
                description: apiJob.description,
                keyResponsibilities: Array.isArray(apiJob.key_responsibilities) ? apiJob.key_responsibilities : [],
                qualifications: Array.isArray(apiJob.qualifications) ? apiJob.qualifications : [],
                lastDate: apiJob.last_date,
                assets: Array.isArray(apiJob.assets) ? apiJob.assets : [],
                contactPerson: apiJob.contact_person,
                contactPhone: apiJob.contact_phone,
                contactEmail: apiJob.contact_email,
                companyAddress: apiJob.company_address,
                active: apiJob.status === 'active',
                status: apiJob.status,
                createdAt: apiJob.created_at,
                applicants: apiJob.applicants || 0,
            };

            setJobs(prev => {
                if (editingJobId) {
                    return prev.map(j => (j.id === editingJobId ? { ...j, ...mappedJob } : j));
                }
                return [mappedJob, ...prev];
            });
        }

        setEditingJobId(null);
        setFormData(defaultFormData);

        if (window.location.search.includes('edit=')) {
            window.history.replaceState({}, '', window.location.pathname);
        }

        successAlert(editingJobId ? 'Job post updated successfully!' : 'Job post created successfully and sent for approval!');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setShowSubmitConfirm(true);
    };

    const confirmSubmit = async () => {
        try {
            if (isSubmitting) return;
            setIsSubmitting(true);
            await performSubmit();
        } finally {
            setIsSubmitting(false);
            setShowSubmitConfirm(false);
        }
    };

    const handleLocationLatLngChange = (latlng) => {
        setLocationLatLng(latlng);
    };

    const handleCancel = () => {
        if (editingJobId) {
            setEditingJobId(null);
            setFormData(defaultFormData);
            setLocationLatLng({ latitude: null, longitude: null });
            if (window.location.search.includes('edit=')) {
                window.history.replaceState({}, '', window.location.pathname);
            }
            return;
        }

        window.location.href = '/admin/job-listing';
    };

    const handleViewDetails = (job) => {
        setSelectedJob(job);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedJob(null);
    };

    const handleEdit = (job) => {
        fillFormForEdit(job);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (job) => {
        console.log("Delete job:", job);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Job Posts" />

            <div className="py-6 sm:py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Job Post Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                                {editingJobId ? 'Update Job Post' : 'Post New Job'}
                            </h2>
                        </div>
                        <div className="p-4 sm:p-6">
                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

                                {/* Row 1: Job Title & Company Name */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Job Title */}
                                    <div>
                                        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Job Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="jobTitle"
                                            name="jobTitle"
                                            value={formData.jobTitle}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                                            placeholder="Enter Job Title"
                                        />
                                    </div>

                                    {/* Company Name */}
                                    <div>
                                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Company Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="companyName"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                                            placeholder="Enter company name"
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Company Logo & Location */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Company Logo */}
                                    <div>
                                        <label htmlFor="companyLogo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Company Logo
                                        </label>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                            <input
                                                type="file"
                                                id="companyLogo"
                                                name="companyLogo"
                                                onChange={handleImageUpload}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => document.getElementById('companyLogo').click()}
                                                className="px-4 py-2 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-600 dark:hover:bg-gray-700 text-sm sm:text-base"
                                            >
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <span className="ml-2 text-gray-700 dark:text-gray-300">
                                                    Choose File
                                                </span>
                                            </button>
                                            {formData.companyLogoPreview && (
                                                <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200">
                                                    <img
                                                        src={formData.companyLogoPreview}
                                                        alt="Company logo preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            JPG, PNG, GIF (Max 5MB)
                                        </p>
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Job Location <span className="text-red-500">*</span>
                                        </label>
                                        <LocationInput
                                            value={formData.location}
                                            onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                                            onLatLngChange={handleLocationLatLngChange}
                                            placeholder="Enter job location"
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Job Type & Number of Openings */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Job Type */}
                                    <div>
                                        <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Job Type
                                        </label>
                                        <select
                                            id="jobType"
                                            name="jobType"
                                            value={formData.jobType}
                                            onChange={handleInputChange}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                                        >
                                            <option value="">Select Job Type</option>
                                            <option value="Full Time">Full Time</option>
                                            <option value="Part Time">Part Time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Internship">Internship</option>
                                            <option value="Remote">Remote</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                    </div>

                                    {/* Number of Openings */}
                                    <div>
                                        <label htmlFor="openings" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Number of Openings <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="openings"
                                            name="openings"
                                            value={formData.openings}
                                            onChange={handleInputChange}
                                            min="1"
                                            required
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                                            placeholder="Enter number of openings"
                                        />
                                    </div>
                                </div>

                                {/* Row 4: Experience & Last Date */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Experience */}
                                    <div>
                                        <label
                                            htmlFor="experience"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                        >
                                            Experience Required <span className="text-red-500">*</span>
                                        </label>

                                        <select
                                            id="experience"
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                                        >
                                            <option value="">Select Experience</option>
                                            <option value="0-1 Year">0-1 Year</option>
                                            <option value="1-2 Years">1-2 Years</option>
                                            <option value="2-3 Years">2-3 Years</option>
                                            <option value="3-4 Years">3-4 Years</option>
                                            <option value="4+ Years">4+ Years</option>
                                        </select>
                                    </div>

                                    {/* Last Date to Apply */}
                                    <div>
                                        <label htmlFor="lastDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Last Date to Apply
                                        </label>
                                        <input
                                            type="date"
                                            id="lastDate"
                                            name="lastDate"
                                            value={formData.lastDate}
                                            onChange={handleInputChange}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                                        />
                                    </div>
                                </div>

                                {/* Row 5: Salary Range & Salary Period */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Salary */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Salary Range <span className="text-red-500">*</span>
                                        </label>

                                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_120px] gap-4">
                                            {/* Minimum Salary */}
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                    ₹
                                                </span>
                                                <input
                                                    type="text"
                                                    id="minSalary"
                                                    name="minSalary"
                                                    value={formData.minSalary}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Minimum"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    className="w-full pl-8 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                                                />
                                            </div>

                                            {/* Maximum Salary */}
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                    ₹
                                                </span>
                                                <input
                                                    type="text"
                                                    id="maxSalary"
                                                    name="maxSalary"
                                                    value={formData.maxSalary}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Maximum"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    className="w-full pl-8 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                                                />
                                            </div>

                                            {/* Salary Period */}
                                            <select
                                                id="salaryPeriod"
                                                name="salaryPeriod"
                                                value={formData.salaryPeriod}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                                            >
                                                <option value="Monthly">Monthly</option>
                                                <option value="Weekly">Weekly</option>
                                                <option value="Yearly">Yearly</option>
                                            </select>
                                        </div>
                                    </div>

                                                </div>

                                {/* Assets Required - Chip Multi-Select */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Assets Required <span className="text-gray-400 text-xs">(Optional)</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {ASSETS_OPTIONS.map((asset) => (
                                            <button
                                                key={asset}
                                                type="button"
                                                onClick={() => handleToggleAsset(asset)}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                                                    formData.assets.includes(asset)
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                                                }`}
                                            >
                                                {asset}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Skills Section */}
                                <div>
                                    <label htmlFor="currentSkill" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Skills Required
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                id="currentSkill"
                                                value={formData.currentSkill}
                                                onChange={(e) => {
                                                    setFormData(prev => ({ ...prev, currentSkill: e.target.value }));
                                                    setShowSkillDropdown(true);
                                                }}
                                                onFocus={() => setShowSkillDropdown(true)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        if (formData.currentSkill.trim()) {
                                                            handleAddSkill();
                                                        }
                                                    }
                                                }}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                                                placeholder="Type or select a skill"
                                            />
                                            {showSkillDropdown && formData.currentSkill && (
                                                <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                    {PREDEFINED_SKILLS.filter(s =>
                                                        s.toLowerCase().includes(formData.currentSkill.toLowerCase()) &&
                                                        !formData.skills.includes(s)
                                                    ).map((skill) => (
                                                        <button
                                                            key={skill}
                                                            type="button"
                                                            onClick={() => handleSelectPredefinedSkill(skill)}
                                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            {skill}
                                                        </button>
                                                    ))}
                                                    {formData.currentSkill.trim() && !PREDEFINED_SKILLS.some(s =>
                                                        s.toLowerCase() === formData.currentSkill.toLowerCase()
                                                    ) && (
                                                        <button
                                                            type="button"
                                                            onClick={handleAddSkill}
                                                            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
                                                        >
                                                            + Add "{formData.currentSkill.trim()}"
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddSkill}
                                            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                                        >
                                            Add Skill
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                                            >
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSkill(index)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Perks & Benefits */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Perks & Benefits
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                                        <input
                                            type="text"
                                            id="currentPerk"
                                            value={formData.currentPerk}
                                            onChange={(e) => setFormData(prev => ({ ...prev, currentPerk: e.target.value }))}
                                            onKeyPress={handlePerkKeyPress}
                                            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                                            placeholder="Type a perk and press Enter"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddPerk}
                                            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                                        >
                                            Add Perk
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.perks.map((perk, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2"
                                            >
                                                {perk}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePerk(index)}
                                                    className="text-green-600 hover:text-green-800"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Job Description */}
                                <div>
                                    <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Job Description
                                    </label>
                                    <textarea
                                        id="jobDescription"
                                        name="jobDescription"
                                        value={formData.jobDescription}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                                        placeholder="Describe role, responsibilities, and requirements..."
                                    />
                                </div>

                                {/* Responsibilities */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Key Responsibilities
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                                        <input
                                            type="text"
                                            id="currentResponsibility"
                                            value={formData.currentResponsibility}
                                            onChange={(e) => setFormData(prev => ({ ...prev, currentResponsibility: e.target.value }))}
                                            onKeyPress={handleResponsibilityKeyPress}
                                            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                                            placeholder="Type a responsibility and press Enter"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddResponsibility}
                                            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        {formData.responsibilities.map((item, index) => (
                                            <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                                                <span className="text-blue-500">•</span>
                                                <span className="flex-1">{item}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveResponsibility(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Qualifications */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Qualifications
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                                        <input
                                            type="text"
                                            id="currentQualification"
                                            value={formData.currentQualification}
                                            onChange={(e) => setFormData(prev => ({ ...prev, currentQualification: e.target.value }))}
                                            onKeyPress={handleQualificationKeyPress}
                                            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                                            placeholder="Type a qualification and press Enter"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddQualification}
                                            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        {formData.qualifications.map((item, index) => (
                                            <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                                                <span className="text-blue-500">•</span>
                                                <span className="flex-1">{item}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveQualification(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Company Details Section */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Company Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Company Name */}
                                        <div>
                                            <label htmlFor="compCompanyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Company Name
                                            </label>
                                            <input
                                                type="text"
                                                id="compCompanyName"
                                                name="compCompanyName"
                                                value={formData.compCompanyName}
                                                onChange={handleInputChange}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                                                placeholder="Enter company name"
                                            />
                                        </div>

                                        {/* Company Logo Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Company Logo
                                            </label>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                <input
                                                    type="file"
                                                    id="compLogo"
                                                    onChange={handleCompImageUpload}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => document.getElementById('compLogo').click()}
                                                    className="px-4 py-2 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-600 dark:hover:bg-gray-700 text-sm sm:text-base"
                                                >
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                    <span className="ml-2 text-gray-700 dark:text-gray-300">Choose File</span>
                                                </button>
                                                {formData.compLogoPreview && (
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200">
                                                        <img src={formData.compLogoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Contact Person Name */}
                                        <div>
                                            <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Contact Person Name
                                            </label>
                                            <input
                                                type="text"
                                                id="contactPerson"
                                                name="contactPerson"
                                                value={formData.contactPerson}
                                                onChange={handleInputChange}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                                                placeholder="Enter contact person name"
                                            />
                                        </div>

                                        {/* Phone Number */}
                                        <div>
                                            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Phone Number
                                            </label>
                                            <input
                                                type="text"
                                                id="contactPhone"
                                                name="contactPhone"
                                                value={formData.contactPhone}
                                                onChange={handleInputChange}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                                                placeholder="Enter phone number"
                                            />
                                        </div>

                                        {/* Email Address */}
                                        <div>
                                            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                id="contactEmail"
                                                name="contactEmail"
                                                value={formData.contactEmail}
                                                onChange={handleInputChange}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                                                placeholder="Enter email address"
                                            />
                                        </div>

                                        {/* Company Address */}
                                        <div>
                                            <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Company Address
                                            </label>
                                            <textarea
                                                id="companyAddress"
                                                name="companyAddress"
                                                value={formData.companyAddress}
                                                onChange={handleInputChange}
                                                rows={2}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                                                placeholder="Enter company address"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                                    >
                                        {isSubmitting ? (editingJobId ? 'Updating...' : 'Submitting...') : (editingJobId ? 'Update Job Post' : 'Submit Job Post')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handlePreview}
                                        disabled={isSubmitting}
                                        className={`px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                                    >
                                        Preview
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={isSubmitting}
                                        className={`px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                    >
                                        {editingJobId ? 'Cancel Edit' : 'Cancel'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        <button
                            type="button"
                            onClick={handleClosePreview}
                            className="absolute top-4 right-4 z-20 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="mb-6 pr-14">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Job Post Preview
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Title:</span>
                                        <p className="text-gray-900 dark:text-white">{formData.jobTitle || "N/A"}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Company:</span>
                                        <p className="text-gray-900 dark:text-white">{formData.companyName || "N/A"}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Location:</span>
                                        <p className="text-gray-900 dark:text-white">{formData.location || "N/A"}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Type:</span>
                                        <p className="text-gray-900 dark:text-white">{formData.jobType || "N/A"}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Openings:</span>
                                        <p className="text-gray-900 dark:text-white">{formData.openings || 1}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Salary:</span>
                                        <p className="text-gray-900 dark:text-white">
                                            {formData.minSalary && formData.maxSalary
                                                ? `₹${formData.minSalary} - ₹${formData.maxSalary}/${formData.salaryPeriod}`
                                                : "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience:</span>
                                        <p className="text-gray-900 dark:text-white">{formData.experience || "N/A"}</p>
                                    </div>
                                </div>

                                {formData.assets.length > 0 && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Assets Required:</span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {formData.assets.map((asset, index) => (
                                                <span key={index} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                                                    {asset}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {formData.skills.length > 0 && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Skills:</span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {formData.skills.map((skill, index) => (
                                                <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {formData.perks.length > 0 && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Perks:</span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {formData.perks.map((perk, index) => (
                                                <span key={index} className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                                    {perk}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Description:</span>
                                    <p className="text-gray-700 dark:text-gray-300">{formData.jobDescription || "N/A"}</p>
                                </div>

                                {formData.responsibilities.length > 0 && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Key Responsibilities:</span>
                                        <ul className="mt-1 space-y-1">
                                            {formData.responsibilities.map((item, index) => (
                                                <li key={index} className="text-gray-700 dark:text-gray-300 text-sm flex items-start gap-2">
                                                    <span className="text-blue-500 mt-1">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {formData.qualifications.length > 0 && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Qualifications:</span>
                                        <ul className="mt-1 space-y-1">
                                            {formData.qualifications.map((item, index) => (
                                                <li key={index} className="text-gray-700 dark:text-gray-300 text-sm flex items-start gap-2">
                                                    <span className="text-blue-500 mt-1">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={handleClosePreview}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Job Details Modal */}
            {showDetailsModal && selectedJob && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        <button
                            type="button"
                            onClick={handleCloseDetailsModal}
                            className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="max-h-[90vh] overflow-y-auto">
                        <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                            <div className="absolute top-6 left-6">
                                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white">
                                    {selectedJob.companyImage ? (
                                        <img
                                            src={selectedJob.companyImage}
                                            alt={selectedJob.company}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="absolute bottom-6 left-6 right-6">
                                <h2 className="text-white font-bold text-2xl line-clamp-1 mb-2">{selectedJob.title}</h2>
                                <p className="text-white/95 text-lg font-medium">{selectedJob.company}</p>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{selectedJob.location}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Experience</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{selectedJob.experience}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Job Type</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{selectedJob.type}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Salary</p>
                                            <p className="font-bold text-xl text-green-600 dark:text-green-400">{selectedJob.salary}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 4M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Number of Openings</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{selectedJob.openings || 1}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {selectedJob.skills && selectedJob.skills.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Skills Required</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedJob.skills.map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-800"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedJob.perks && selectedJob.perks.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Perks & Benefits</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedJob.perks.map((perk, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-800 flex items-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        {perk}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedJob.keyResponsibilities && selectedJob.keyResponsibilities.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Responsibilities</h3>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                                        <ul className="space-y-2">
                                            {selectedJob.keyResponsibilities.map((item, index) => (
                                                <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                                    <span className="text-blue-500 mt-1">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {selectedJob.qualifications && selectedJob.qualifications.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Qualifications</h3>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                                        <ul className="space-y-2">
                                            {selectedJob.qualifications.map((item, index) => (
                                                <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                                    <span className="text-blue-500 mt-1">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Description</h3>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {selectedJob.description || "We are looking for a talented professional to join our team. This role offers excellent growth opportunities and a chance to work on exciting projects with cutting-edge technologies."}
                                    </p>
                                </div>
                            </div>

                            {/* Assets Required */}
                            {selectedJob.assets && selectedJob.assets.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assets Required</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedJob.assets.map((asset, index) => (
                                            <span
                                                key={index}
                                                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 dark:from-purple-900/20 dark:to-pink-900/20 dark:text-purple-300 rounded-xl border border-purple-200 dark:border-purple-800"
                                            >
                                                {asset}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Company Details Section */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Information</h3>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600 space-y-4">
                                    {selectedJob.companyAddress && (
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{selectedJob.companyAddress}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact Details - Show only if any contact info exists */}
                            {(selectedJob.contactPerson || selectedJob.contactPhone || selectedJob.contactEmail) && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Details</h3>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600 space-y-3">
                                        {selectedJob.contactPerson && (
                                            <div className="flex items-center gap-3">
                                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{selectedJob.contactPerson}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedJob.contactPhone && (
                                            <div className="flex items-center gap-3">
                                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{selectedJob.contactPhone}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedJob.contactEmail && (
                                            <div className="flex items-center gap-3">
                                                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{selectedJob.contactEmail}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Posted 2 days ago</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 4M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span className="font-semibold">{selectedJob.applicants || 0} applicants</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="px-6 py-3 text-sm font-bold text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 shadow-md hover:shadow-lg">
                                        Apply Now
                                    </button>
                                    <button className="px-6 py-3 text-sm font-bold text-gray-600 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl hover:from-gray-100 hover:to-slate-100 transition-all duration-200 shadow-md hover:shadow-lg">
                                        Save Job
                                    </button>
                                    <button
                                        onClick={handleCloseDetailsModal}
                                        className="px-6 py-3 text-sm font-bold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-all duration-200"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={showSubmitConfirm}
                onClose={() => setShowSubmitConfirm(false)}
                onConfirm={confirmSubmit}
                message={editingJobId ? 'Are you sure you want to update this job post?' : 'Are you sure you want to submit this job post for approval?'}
                confirmText={editingJobId ? 'Yes, Update' : 'Yes, Submit'}
                cancelText="Cancel"
                modalSpinnerMessage={editingJobId ? 'Updating Please Wait....' : 'Submitting Please Wait....'}
            />
        </AuthenticatedLayout>
    );
}