import React, { useEffect, useMemo, useRef, useState } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "../Layouts/AuthenticatedLayout";
import ConfirmDialog from "../../../Components/ConfirmDialog";
import ResumePreviewModal from "../../../Components/ResumePreviewModal";
import { useAlerts } from "../../../Components/Alerts";

export default function Index({ auth }) {
    const { successAlert, errorAlert } = useAlerts();

    const [jobs, setJobs] = useState([]);
    const [applicationsPage, setApplicationsPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [jobsLoading, setJobsLoading] = useState(true);

    const [filters, setFilters] = useState({
        search: "",
        status: "",
        jobId: "",
        dateFrom: "",
        dateTo: "",
        perPage: 15,
        page: 1,
    });

    const [jobSearch, setJobSearch] = useState("");
    const [showJobDropdown, setShowJobDropdown] = useState(false);
    const jobSearchRef = useRef(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmApp, setConfirmApp] = useState(null);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewFallbackUrl, setPreviewFallbackUrl] = useState(null);

    const lastSearchRef = useRef({ mode: "all", value: "" });

    const statusOptions = useMemo(
        () => [
            { value: "", label: "All Status" },
            { value: "applied", label: "Applied" },
            { value: "viewed", label: "Viewed" },
            { value: "shortlisted", label: "Shortlisted" },
            { value: "assigned_to_calling_member", label: "Assigned To Calling Member" },
            { value: "calling_in_progress", label: "Calling In Progress" },
            { value: "calling_approved", label: "Calling Approved" },
            { value: "calling_rejected", label: "Calling Rejected" },
            { value: "admin_review", label: "Admin Review" },
            { value: "offer_letter_generated", label: "Offer Letter Generated" },
            { value: "waiting_list", label: "Waiting List" },
            { value: "hired", label: "Hired" },
            { value: "not_selected", label: "Not Selected" },
            { value: "rejected", label: "Rejected" },
        ],
        []
    );

    const loadJobs = async () => {
        setJobsLoading(true);
        try {
            const res = await fetch(route("super.job.requests.api.all"), {
                headers: { Accept: "application/json" },
            });
            const data = await res.json().catch(() => null);
            if (!res.ok || !data?.success) {
                setJobs([]);
                return;
            }
            setJobs(Array.isArray(data.data) ? data.data : []);
        } catch (e) {
            setJobs([]);
        } finally {
            setJobsLoading(false);
        }
    };

    const loadApplications = async (nextFilters = filters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            // Only send search parameter if 3+ chars
            const search = String(nextFilters.search || "").trim();
            if (search.length >= 3) params.set("search", search);
            if (nextFilters.status) params.set("status", nextFilters.status);
            if (nextFilters.jobId) params.set("job_id", nextFilters.jobId);
            if (nextFilters.dateFrom) params.set("date_from", nextFilters.dateFrom);
            if (nextFilters.dateTo) params.set("date_to", nextFilters.dateTo);
            params.set("per_page", String(nextFilters.perPage));
            params.set("page", String(nextFilters.page));

            const res = await fetch(
                `${route("super.job.applications.api.list")}?${params.toString()}`,
                { headers: { Accept: "application/json" } }
            );
            const data = await res.json().catch(() => null);
            if (!res.ok || !data?.success) {
                setApplicationsPage(null);
                errorAlert(data?.message || "Failed to load applications.");
                return;
            }
            setApplicationsPage(data.data);
        } catch (e) {
            setApplicationsPage(null);
            errorAlert("Failed to load applications.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, []);

    useEffect(() => {
        loadApplications();
    }, [filters.page, filters.perPage, filters.status, filters.jobId, filters.dateFrom, filters.dateTo]);

    // Auto-search: filter when search has 3+ chars and show all when less than 3
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            const search = String(filters.search || "").trim();
            const mode = search.length >= 3 ? "filtered" : "all";

            if (mode === "filtered") {
                if (filters.page !== 1) {
                    setFilters((prev) => ({ ...prev, page: 1 }));
                    return;
                }
                if (
                    lastSearchRef.current.mode === "filtered" &&
                    lastSearchRef.current.value === search
                ) {
                    return;
                }
                lastSearchRef.current = { mode: "filtered", value: search };
                loadApplications({ ...filters, page: 1, search });
                return;
            }

            if (filters.page !== 1) {
                setFilters((prev) => ({ ...prev, page: 1 }));
                return;
            }
            if (lastSearchRef.current.mode === "all") {
                return;
            }
            lastSearchRef.current = { mode: "all", value: "" };
            loadApplications({ ...filters, page: 1, search: "" });
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [filters.search]);

    const applyFilters = () => {
        setFilters((prev) => ({ ...prev, page: 1 }));
        setTimeout(loadApplications, 0);
    };

    const clearFilters = () => {
        setFilters(prev => ({
            ...prev,
            search: "",
            status: "",
            jobId: "",
            dateFrom: "",
            dateTo: "",
            page: 1,
        }));
        setJobSearch("");
        setTimeout(loadApplications, 0);
    };

    const filteredJobs = useMemo(() => {
        if (!jobSearch.trim()) return [];
        const searchLower = jobSearch.toLowerCase();
        return jobs.filter(j =>
            j.title?.toLowerCase().includes(searchLower) ||
            j.company?.toLowerCase().includes(searchLower)
        ).slice(0, 10);
    }, [jobSearch, jobs]);

    const handleJobSelect = (job) => {
        setFilters(prev => ({ ...prev, jobId: String(job.id), page: 1 }));
        setJobSearch(`${job.title} — ${job.company}`);
        setShowJobDropdown(false);
    };

    const handleJobSearchChange = (e) => {
        const value = e.target.value;
        setJobSearch(value);
        if (!value.trim()) {
            setFilters(prev => ({ ...prev, jobId: "", page: 1 }));
            loadApplications(); // Immediate reload when job search is cleared
        }
        setShowJobDropdown(true);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (jobSearchRef.current && !jobSearchRef.current.contains(e.target)) {
                setShowJobDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const openDecision = (app, action) => {
        setConfirmApp(app);
        setConfirmAction(action);
        setConfirmOpen(true);
    };

    const confirmDecision = async () => {
        if (!confirmApp || !confirmAction) return;
        try {
            const res = await fetch(
                route("super.job.requests.api.applications.decision", confirmApp.id),
                {
                    method: "PATCH",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content"),
                    },
                    body: JSON.stringify({ action: confirmAction }),
                }
            );
            const data = await res.json().catch(() => null);
            if (!res.ok || !data?.success) {
                errorAlert(data?.message || "Failed to update application.");
                return;
            }

            setApplicationsPage((prev) => {
                if (!prev?.data) return prev;
                return {
                    ...prev,
                    data: prev.data.map((a) =>
                        a.id === confirmApp.id ? { ...a, status: data.data.status } : a
                    ),
                };
            });
            successAlert("Application updated successfully!");
        } catch (e) {
            errorAlert("Failed to update application.");
        } finally {
            setConfirmOpen(false);
            setConfirmAction(null);
            setConfirmApp(null);
        }
    };

    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    const handleStatusChangeDirectly = async (app, newStatus) => {
        if (app.status === newStatus) return;
        setUpdatingStatusId(app.id);
        try {
            const res = await fetch(
                route("super.job.applications.api.status", app.id),
                {
                    method: "PATCH",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content"),
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );
            const data = await res.json().catch(() => null);
            if (!res.ok || !data?.success) {
                console.log(data);
                errorAlert(data?.message || "Failed to update status.");
                return;
            }

            setApplicationsPage((prev) => {
                if (!prev?.data) return prev;
                return {
                    ...prev,
                    data: prev.data.map((a) =>
                        a.id === app.id ? { ...a, status: newStatus } : a
                    ),
                };
            });
            successAlert("Status updated successfully!");
        } catch (e) {
            console.log(e);
            errorAlert("Failed to update status.");
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const isPreviewable = (url) => {
        const u = String(url || "");
        const lower = u.toLowerCase();
        return lower.endsWith(".pdf") || lower.endsWith(".html") || lower.includes("generated-resumes");
    };

    const openResume = (url, applicationId) => {
        const resolved = url
            ? (String(url).startsWith("/") || /^https?:\/\//i.test(String(url))
                  ? String(url)
                  : `/${url}`)
            : null;
        const fallbackUrl = applicationId
            ? route("super.job.applications.api.resume-preview", applicationId)
            : null;

        if (resolved && !isPreviewable(resolved)) {
            window.open(resolved, "_blank");
            return;
        }

        setPreviewUrl(resolved);
        setPreviewFallbackUrl(fallbackUrl);
        setPreviewOpen(true);
    };

    const apps = Array.isArray(applicationsPage?.data) ? applicationsPage.data : [];

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title="Job Applicants" />

            <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                            Total Job Applicants
                        </h1>
                        <p className="text-slate-500 mt-1">
                            View and filter job applications
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                            <div className="md:col-span-2">
                                <input
                                    value={filters.search}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            search: e.target.value,
                                        }))
                                    }
                                    placeholder="Search candidate, email, job..."
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <select
                                    value={filters.status}
                                    onChange={(e) => {
                                        setFilters((prev) => ({
                                            ...prev,
                                            status: e.target.value,
                                            page: 1,
                                        }));
                                    }}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {statusOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div ref={jobSearchRef} className="md:col-span-2 relative">
                                <input
                                    type="text"
                                    value={jobSearch}
                                    onChange={handleJobSearchChange}
                                    onFocus={() => setShowJobDropdown(true)}
                                    placeholder={jobsLoading ? "Loading jobs..." : "Search job by title or company..."}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={jobsLoading}
                                />
                                {showJobDropdown && filteredJobs.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                                        {filteredJobs.map((j) => (
                                            <button
                                                key={j.id}
                                                type="button"
                                                onClick={() => handleJobSelect(j)}
                                                className="w-full px-4 py-2 text-left hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
                                            >
                                                <div className="font-medium">{j.title}</div>
                                                <div className="text-sm text-slate-500">{j.company}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {showJobDropdown && jobSearch.trim() && filteredJobs.length === 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg px-4 py-2 text-slate-500">
                                        No jobs found
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-2 flex-1">
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            dateFrom: e.target.value,
                                        }))
                                    }
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                                <span className="text-slate-400">to</span>
                                <input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            dateTo: e.target.value,
                                        }))
                                    }
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm"
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        {loading ? (
                            <div className="py-12 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                            </div>
                        ) : apps.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50">
                                        <tr className="text-left text-slate-600 whitespace-nowrap">
                                            <th className="px-5 py-3 font-medium">
                                                Candidate
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Job
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Status
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Applied
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Resume
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {apps.map((app) => (
                                            <tr key={app.id} className="align-top">
                                                <td className="px-5 py-3">
                                                    <div className="font-semibold text-slate-900">
                                                        {app.candidate_name || "-"}
                                                    </div>
                                                    <div className="text-slate-500">
                                                        {app.candidate_email || "-"}
                                                    </div>
                                                    <div className="text-slate-500">
                                                        {app.candidate_phone || "-"}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="font-medium text-slate-900">
                                                        {app.job?.title || "-"}
                                                    </div>
                                                    <div className="text-slate-500">
                                                        {app.job?.company || "-"}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="relative">
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
                                                                {statusOptions.filter(opt => opt.value !== '').map(opt => (
                                                                    <option key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    {app.created_at
                                                        ? new Date(
                                                              app.created_at
                                                          ).toLocaleString(
                                                              "en-US"
                                                          )
                                                        : "-"}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openResume(
                                                                app.resume_url,
                                                                app.id
                                                            )
                                                        }
                                                        className="px-2 py-1 rounded text-blue-600 hover:bg-blue-50 font-medium text-sm"
                                                    >
                                                        {app.resume_url ? "Preview" : "Generated Preview"}
                                                    </button>
                                                </td>
                                                <td className="px-5 py-3">
                                                    {app.status === "applied" || app.status === "viewed" ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openDecision(
                                                                        app,
                                                                        "approve"
                                                                    )
                                                                }
                                                                className="px-2 py-1 rounded bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                                                            >
                                                                Shortlist
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openDecision(
                                                                        app,
                                                                        "reject"
                                                                    )
                                                                }
                                                                className="px-2 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-12 text-center text-slate-500">
                                No applications found.
                            </div>
                        )}
                    </div>

                    {applicationsPage && (
                        <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
                            <div>
                                Page {applicationsPage.current_page} of{" "}
                                {applicationsPage.last_page}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={!applicationsPage.prev_page_url}
                                    onClick={() =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            page: Math.max(1, prev.page - 1),
                                        }))
                                    }
                                    className="px-2 py-1 rounded border border-slate-300 disabled:opacity-50 text-sm"
                                >
                                    Prev
                                </button>
                                <button
                                    type="button"
                                    disabled={!applicationsPage.next_page_url}
                                    onClick={() =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            page: prev.page + 1,
                                        }))
                                    }
                                    className="px-2 py-1 rounded border border-slate-300 disabled:opacity-50 text-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setConfirmAction(null);
                    setConfirmApp(null);
                }}
                onConfirm={confirmDecision}
                message={
                    confirmApp
                        ? `${confirmAction === "approve" ? "Approve" : "Reject"} application of "${confirmApp.candidate_name}"?`
                        : "Are you sure?"
                }
                confirmText={
                    confirmAction === "approve" ? "Yes, Approve" : "Yes, Reject"
                }
                cancelText="Cancel"
                modalSpinnerMessage="Processing Please Wait...."
            />

            <ResumePreviewModal
                isOpen={previewOpen}
                sourceUrl={previewUrl}
                fallbackUrl={previewFallbackUrl}
                onClose={() => {
                    setPreviewOpen(false);
                    setPreviewUrl(null);
                    setPreviewFallbackUrl(null);
                }}
            />
        </AuthenticatedLayout>
    );
}
