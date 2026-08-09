import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "./Layouts/AuthenticatedLayout";
import { useAlerts } from "../../Components/Alerts";

const STATUS_META = {
    assigned_to_calling_member: {
        label: "Assigned To Calling Member",
        badge: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-200 dark:border-indigo-500/30",
    },
    calling_in_progress: {
        label: "Calling In Progress",
        badge: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-500/20 dark:text-sky-200 dark:border-sky-500/30",
    },
    calling_approved: {
        label: "Calling Approved",
        badge: "bg-green-100 text-green-800 border-green-200 dark:bg-green-500/20 dark:text-green-200 dark:border-green-500/30",
    },
    calling_rejected: {
        label: "Calling Rejected",
        badge: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-500/30",
    },
    approved: {
        label: "Approved",
        badge: "bg-green-100 text-green-800 border-green-200 dark:bg-green-500/20 dark:text-green-200 dark:border-green-500/30",
    },
    rejected: {
        label: "Rejected",
        badge: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-500/30",
    },
    follow_up: {
        label: "Follow Up",
        badge: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-500/30",
    },
    no_response: {
        label: "No Response",
        badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/40 dark:text-slate-200 dark:border-slate-600",
    },
};

const FILTERS = [
    { key: "", label: "All", countKey: "total" },
    { key: "assigned_to_calling_member", label: "Assigned", countKey: "assigned_to_calling_member" },
    { key: "calling_in_progress", label: "In Progress", countKey: "calling_in_progress" },
    { key: "calling_approved", label: "Calling Approved", countKey: "calling_approved" },
    { key: "calling_rejected", label: "Calling Rejected", countKey: "calling_rejected" },
];

function StatusBadge({ status }) {
    const meta = STATUS_META[status] || {
        label: status,
        badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/40 dark:text-slate-200 dark:border-slate-600",
    };

    return (
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${meta.badge}`}>
            {meta.label}
        </span>
    );
}

function CandidateCard({ application, onOpen }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#080626]">
            <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {application.candidate_name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-300">{application.candidate_email}</p>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            {application.candidate_phone || "Phone not provided"}
                        </p>
                    </div>
                    <StatusBadge status={application.status} />
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Job</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-white">
                        {application.job?.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-300">{application.job?.company}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Interview</p>
                        <p className="mt-1">
                            {application.interview_date_time
                                ? new Date(application.interview_date_time).toLocaleString("en-IN")
                                : "Not scheduled"}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Outcome</p>
                        <p className="mt-1">{application.call_outcome || "Pending call update"}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Applied {new Date(application.created_at).toLocaleDateString("en-IN")}
                </p>
                <button
                    onClick={() => onOpen(application)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Open Candidate
                </button>
            </div>
        </div>
    );
}

export default function Dashboard({
    applications: initialApplications,
    statusCounts: initialStatusCounts,
    filters: initialFilters,
}) {
    const [applications, setApplications] = useState(initialApplications?.data || []);
    const [statusCounts, setStatusCounts] = useState(initialStatusCounts || {});
    const [pagination, setPagination] = useState({
        current_page: initialApplications?.current_page || 1,
        last_page: initialApplications?.last_page || 1,
        total: initialApplications?.total || 0,
    });
    const [selectedStatus, setSelectedStatus] = useState(initialFilters?.status || "");
    const [search, setSearch] = useState(initialFilters?.search || "");
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [saving, setSaving] = useState(false);
    const [callForm, setCallForm] = useState({
        call_outcome: "interested",
        call_outcome_reason: "",
        call_notes: "",
    });
    const [interviewForm, setInterviewForm] = useState({
        interview_date_time: "",
        interview_mode: "offline",
        interview_address: "",
        interview_instructions: "",
        interview_contact_person: "",
        call_notes: "",
    });
    const [decisionForm, setDecisionForm] = useState({
        decision: "follow_up",
        decision_reason: "",
        call_notes: "",
    });

    const { successAlert, errorAlert } = useAlerts();

    const visibleFilters = useMemo(
        () => FILTERS.map((item) => ({ ...item, count: statusCounts[item.countKey] || 0 })),
        [statusCounts]
    );

    const fetchApplications = async (page = 1, customSearch = search) => {
        setLoading(true);
        try {
            const response = await axios.get(route("callingteam.applications.list"), {
                params: {
                    page,
                    ...(selectedStatus ? { status: selectedStatus } : {}),
                    ...(customSearch.trim().length >= 2 ? { search: customSearch.trim() } : {}),
                },
            });

            if (response.data.success) {
                setApplications(response.data.data.data || []);
                setStatusCounts(response.data.statusCounts || {});
                setPagination({
                    current_page: response.data.data.current_page,
                    last_page: response.data.data.last_page,
                    total: response.data.data.total,
                });
            }
        } catch (error) {
            errorAlert("Failed to load assigned candidates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications(1);
    }, [selectedStatus]);

    useEffect(() => {
        const timeout = setTimeout(() => fetchApplications(1, search), 400);
        return () => clearTimeout(timeout);
    }, [search]);

    const openApplication = async (application) => {
        try {
            const response = await axios.get(route("callingteam.applications.show", application.id));
            if (response.data.success) {
                const payload = response.data.data;
                setSelectedApplication(payload);
                setCallForm({
                    call_outcome: payload.call_outcome || "interested",
                    call_outcome_reason: payload.call_outcome_reason || "",
                    call_notes: payload.call_notes || "",
                });
                setInterviewForm({
                    interview_date_time: payload.interview_date_time
                        ? payload.interview_date_time.slice(0, 16)
                        : "",
                    interview_mode: payload.interview_mode || "offline",
                    interview_address: payload.interview_address || "",
                    interview_instructions: payload.interview_instructions || "",
                    interview_contact_person: payload.interview_contact_person || "",
                    call_notes: payload.call_notes || "",
                });
                setDecisionForm({
                    decision: payload.hiring_decision || "follow_up",
                    decision_reason: payload.hiring_decision_reason || "",
                    call_notes: payload.call_notes || "",
                });
                setShowModal(true);
            }
        } catch (error) {
            errorAlert("Failed to load candidate details");
        }
    };

    const refreshAll = async () => {
        await fetchApplications(pagination.current_page || 1);
    };

    const submitCallOutcome = async () => {
        if (!selectedApplication) return;
        setSaving(true);
        try {
            const response = await axios.patch(
                route("callingteam.applications.call-outcome", selectedApplication.id),
                callForm
            );
            if (response.data.success) {
                successAlert("Call outcome updated");
                setSelectedApplication(response.data.data);
                await refreshAll();
            }
        } catch (error) {
            errorAlert(error?.response?.data?.message || "Failed to update call outcome");
        } finally {
            setSaving(false);
        }
    };

    const submitInterview = async () => {
        if (!selectedApplication) return;
        setSaving(true);
        try {
            const response = await axios.patch(
                route("callingteam.applications.schedule-interview", selectedApplication.id),
                interviewForm
            );
            if (response.data.success) {
                successAlert("Interview scheduled successfully");
                setSelectedApplication(response.data.data);
                await refreshAll();
            }
        } catch (error) {
            errorAlert(error?.response?.data?.message || "Failed to schedule interview");
        } finally {
            setSaving(false);
        }
    };

    const submitDecision = async () => {
        if (!selectedApplication) return;
        setSaving(true);
        try {
            const response = await axios.patch(
                route("callingteam.applications.final-decision", selectedApplication.id),
                decisionForm
            );
            if (response.data.success) {
                successAlert("Candidate status updated");
                setSelectedApplication(response.data.data);
                await refreshAll();
            }
        } catch (error) {
            errorAlert(error?.response?.data?.message || "Failed to update final decision");
        } finally {
            setSaving(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Calling Team Dashboard" />

            <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8 dark:bg-gray-900">
                <div className="mx-auto max-w-7xl space-y-6 pt-20">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Calling Team Dashboard
                        </h1>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            Manage assigned candidates, record call outcomes, schedule
                            interviews, and update final results.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {visibleFilters.map((filter) => (
                            <button
                                key={filter.label}
                                onClick={() => setSelectedStatus(filter.key)}
                                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium ${
                                    selectedStatus === filter.key
                                        ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200"
                                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#080626] dark:text-slate-300 dark:hover:bg-slate-900"
                                }`}
                            >
                                <span>{filter.label}</span>
                                <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs dark:bg-slate-800">
                                    {filter.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#080626]">
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search candidate, email, phone, job title"
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 dark:border-slate-700 dark:bg-[#080626]">
                            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center dark:border-slate-700 dark:bg-[#080626]">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                No assigned candidates found
                            </h3>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                                When admin assigns candidates to you, they will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            {applications.map((application) => (
                                <CandidateCard
                                    key={application.id}
                                    application={application}
                                    onOpen={openApplication}
                                />
                            ))}
                        </div>
                    )}

                    {!loading && pagination.last_page > 1 && (
                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-[#080626]">
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                Page {pagination.current_page} of {pagination.last_page}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => fetchApplications(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => fetchApplications(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showModal && selectedApplication && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-10">
                    <div className="mx-auto max-w-5xl rounded-3xl bg-white shadow-xl dark:bg-[#080626]">
                        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                    {selectedApplication.candidate_name}
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-300">
                                    {selectedApplication.job?.title} - {selectedApplication.job?.company}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-200"
                            >
                                Close
                            </button>
                        </div>

                        <div className="grid gap-6 px-6 py-6 lg:grid-cols-3">
                            <div className="space-y-5 lg:col-span-2">
                                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                                Current Status
                                            </p>
                                            <div className="mt-2">
                                                <StatusBadge status={selectedApplication.status} />
                                            </div>
                                        </div>
                                        <div className="text-sm text-slate-600 dark:text-slate-300">
                                            Candidate phone:{" "}
                                            {selectedApplication.candidate_phone || "Not provided"}
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                        Call Outcome
                                    </p>
                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        <select
                                            value={callForm.call_outcome}
                                            onChange={(event) =>
                                                setCallForm((prev) => ({
                                                    ...prev,
                                                    call_outcome: event.target.value,
                                                }))
                                            }
                                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                        >
                                            <option value="interested">Interested</option>
                                            <option value="not_interested">Not Interested</option>
                                        </select>
                                        <input
                                            value={callForm.call_outcome_reason}
                                            onChange={(event) =>
                                                setCallForm((prev) => ({
                                                    ...prev,
                                                    call_outcome_reason: event.target.value,
                                                }))
                                            }
                                            placeholder="Reason if not interested"
                                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <textarea
                                        value={callForm.call_notes}
                                        onChange={(event) =>
                                            setCallForm((prev) => ({
                                                ...prev,
                                                call_notes: event.target.value,
                                            }))
                                        }
                                        rows={4}
                                        placeholder="Call notes"
                                        className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                    />
                                    <button
                                        onClick={submitCallOutcome}
                                        disabled={saving}
                                        className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Save Call Outcome
                                    </button>
                                </div>

                                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                        Interview Scheduling
                                    </p>
                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        <input
                                            type="datetime-local"
                                            value={interviewForm.interview_date_time}
                                            onChange={(event) =>
                                                setInterviewForm((prev) => ({
                                                    ...prev,
                                                    interview_date_time: event.target.value,
                                                }))
                                            }
                                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                        />
                                        <select
                                            value={interviewForm.interview_mode}
                                            onChange={(event) =>
                                                setInterviewForm((prev) => ({
                                                    ...prev,
                                                    interview_mode: event.target.value,
                                                }))
                                            }
                                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                        >
                                            <option value="offline">Offline</option>
                                            <option value="online">Online</option>
                                        </select>
                                    </div>
                                    <textarea
                                        value={interviewForm.interview_address}
                                        onChange={(event) =>
                                            setInterviewForm((prev) => ({
                                                ...prev,
                                                interview_address: event.target.value,
                                            }))
                                        }
                                        rows={3}
                                        placeholder="Full address / location"
                                        className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                    />
                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        <input
                                            value={interviewForm.interview_contact_person}
                                            onChange={(event) =>
                                                setInterviewForm((prev) => ({
                                                    ...prev,
                                                    interview_contact_person: event.target.value,
                                                }))
                                            }
                                            placeholder="Contact person"
                                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                        />
                                        <input
                                            value={interviewForm.call_notes}
                                            onChange={(event) =>
                                                setInterviewForm((prev) => ({
                                                    ...prev,
                                                    call_notes: event.target.value,
                                                }))
                                            }
                                            placeholder="Notes to save"
                                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <textarea
                                        value={interviewForm.interview_instructions}
                                        onChange={(event) =>
                                            setInterviewForm((prev) => ({
                                                ...prev,
                                                interview_instructions: event.target.value,
                                            }))
                                        }
                                        rows={3}
                                        placeholder="Additional instructions"
                                        className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                    />
                                    <button
                                        onClick={submitInterview}
                                        disabled={saving}
                                        className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        Schedule Interview
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                        Final Decision
                                    </p>
                                    <select
                                        value={decisionForm.decision}
                                        onChange={(event) =>
                                            setDecisionForm((prev) => ({
                                                ...prev,
                                                decision: event.target.value,
                                            }))
                                        }
                                        className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                    >
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="follow_up">Follow Up</option>
                                        <option value="no_response">No Response</option>
                                    </select>
                                    <textarea
                                        value={decisionForm.decision_reason}
                                        onChange={(event) =>
                                            setDecisionForm((prev) => ({
                                                ...prev,
                                                decision_reason: event.target.value,
                                            }))
                                        }
                                        rows={5}
                                        placeholder={
                                            decisionForm.decision === "approved"
                                                ? "Approval reason (required)"
                                                : decisionForm.decision === "rejected"
                                                ? "Rejection reason (optional)"
                                                : "Reason (optional)"
                                        }
                                        className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                    />
                                    <textarea
                                        value={decisionForm.call_notes}
                                        onChange={(event) =>
                                            setDecisionForm((prev) => ({
                                                ...prev,
                                                call_notes: event.target.value,
                                            }))
                                        }
                                        rows={4}
                                        placeholder="Internal notes"
                                        className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                    />
                                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                        Approval reason is mandatory. Rejection reason is optional.
                                    </p>
                                    <div className="mt-4 grid gap-2">
                                        <button
                                            onClick={submitDecision}
                                            disabled={saving}
                                            className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                        >
                                            Save Hiring Decision
                                        </button>
                                    </div>
                                </div>

                                {(selectedApplication.interview_date_time ||
                                    selectedApplication.call_outcome ||
                                    selectedApplication.call_notes ||
                                    selectedApplication.hiring_decision) && (
                                    <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
                                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                            Latest Update
                                        </p>
                                        <div className="mt-3 space-y-2">
                                            <p>
                                                <span className="font-semibold">Decision:</span>{" "}
                                                {STATUS_META[selectedApplication.hiring_decision]?.label ||
                                                    selectedApplication.hiring_decision ||
                                                    "—"}
                                            </p>
                                            <p>
                                                <span className="font-semibold">Decision Reason:</span>{" "}
                                                {selectedApplication.hiring_decision_reason || "—"}
                                            </p>
                                            <p>
                                                <span className="font-semibold">Outcome:</span>{" "}
                                                {selectedApplication.call_outcome || "—"}
                                            </p>
                                            <p>
                                                <span className="font-semibold">Reason:</span>{" "}
                                                {selectedApplication.call_outcome_reason || "—"}
                                            </p>
                                            <p>
                                                <span className="font-semibold">Interview:</span>{" "}
                                                {selectedApplication.interview_date_time
                                                    ? new Date(
                                                          selectedApplication.interview_date_time
                                                      ).toLocaleString("en-IN")
                                                    : "—"}
                                            </p>
                                            <p>
                                                <span className="font-semibold">Mode:</span>{" "}
                                                {selectedApplication.interview_mode || "—"}
                                            </p>
                                            <p>
                                                <span className="font-semibold">Address:</span>{" "}
                                                {selectedApplication.interview_address || "—"}
                                            </p>
                                            <p>
                                                <span className="font-semibold">Notes:</span>{" "}
                                                {selectedApplication.call_notes || "—"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
