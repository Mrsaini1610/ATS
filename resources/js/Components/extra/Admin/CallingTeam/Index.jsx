import { Head, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import AuthenticatedLayout from "../Layouts/AuthenticatedLayout";
import Modal from "@/Components/Modal";
import ConfirmDialog from "@/Components/ConfirmDialog";

const emptyForm = {
    name: "",
    phone: "",
    email: "",
    dob: "",
    gender: "male",
    status: "1",
    image: null,
};

export default function Index({ members, filters }) {
    const [search, setSearch] = useState(filters.search || "");
    const [status, setStatus] = useState(filters.status || "");
    const [perPage, setPerPage] = useState(filters.per_page || 10);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [isCreating, setIsCreating] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [targetStatus, setTargetStatus] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (!hasInteracted) return;

        const timeout = setTimeout(() => {
            router.get(
                route("admin.calling-team.index"),
                {
                    search,
                    status,
                    per_page: perPage,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [search, status, perPage, hasInteracted]);

    const handlePageChange = (page) => {
        router.get(
            route("admin.calling-team.index"),
            {
                search,
                status,
                per_page: perPage,
                page,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const openStatusConfirm = (member) => {
        setSelectedMember(member);
        setTargetStatus(Number(member.status) === 1 ? 0 : 1);
        setConfirmOpen(true);
    };

    const updateStatus = () => {
        if (!selectedMember) return;

        router.post(
            route("admin.calling-team.status", selectedMember.id),
            { status: targetStatus },
            {
                preserveScroll: true,
                onSuccess: () => setConfirmOpen(false),
            }
        );
    };

    const submit = (event) => {
        event.preventDefault();
        setIsCreating(true);
        const payload = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
                payload.append(key, value);
            }
        });

        router.post(route("admin.calling-team.store"), payload, {
            preserveScroll: true,
            preserveState: true,
            forceFormData: true,
            onSuccess: () => {
                handleCreateModalClose();
            },
            onError: (nextErrors) => setErrors(nextErrors),
            onFinish: () => setIsCreating(false),
        });
    };

    const handleCreateModalClose = () => {
        setShowCreateModal(false);
        setForm(emptyForm);
        setErrors({});
        setSelectedFile(null);
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0] || null;
        setSelectedFile(file);
        setForm((prev) => ({ ...prev, image: file }));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Calling Team" />

            <div className="min-h-screen bg-slate-100 p-4 pt-20 sm:p-6 sm:pt-24 dark:bg-[#0a0e25]">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" style={{ marginTop: "30px" }}>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
                                Calling Team
                            </h1>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setShowCreateModal(true);
                                setErrors({});
                            }}
                            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Create Calling Team Member
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4 dark:border-slate-700 dark:bg-[#080626]">
                        <input
                            type="text"
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setHasInteracted(true);
                            }}
                            placeholder="Search name, email, phone, username"
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />

                        <select
                            value={status}
                            onChange={(event) => {
                                setStatus(event.target.value);
                                setHasInteracted(true);
                            }}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                            <option value="">All Status</option>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>

                        <select
                            value={perPage}
                            onChange={(event) => {
                                setPerPage(event.target.value);
                                setHasInteracted(true);
                            }}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                            <option value="10">10 per page</option>
                            <option value="25">25 per page</option>
                            <option value="50">50 per page</option>
                        </select>

                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setStatus("");
                                setPerPage(10);
                                setHasInteracted(true);
                            }}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            Reset Filters
                        </button>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-[#080626]">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50 text-left text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">Name</th>
                                        <th className="px-5 py-3 font-medium">Phone</th>
                                        <th className="px-5 py-3 font-medium">Email</th>
                                        <th className="px-5 py-3 font-medium">Username</th>
                                        <th className="px-5 py-3 font-medium">Status</th>
                                        <th className="px-5 py-3 font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {members.data.length > 0 ? (
                                        members.data.map((member) => (
                                            <tr key={member.id}>
                                                <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={member.profile_photo_url}
                                                            alt={member.name}
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                        <span>{member.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                                                    {member.phone || "-"}
                                                </td>
                                                <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                                                    {member.email || "-"}
                                                </td>
                                                <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                                                    {member.username}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                                            Number(member.status) === 1
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                        } dark:border dark:border-transparent`}
                                                    >
                                                        {Number(member.status) === 1 ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => openStatusConfirm(member)}
                                                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                                    >
                                                        {Number(member.status) === 1 ? "Deactivate" : "Activate"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-5 py-12 text-center text-slate-500 dark:text-slate-400">
                                                No calling team members found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {members.last_page > 1 && (
                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-[#080626] dark:text-slate-300">
                            <p>
                                Page {members.current_page} of {members.last_page}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={members.current_page === 1}
                                    onClick={() => handlePageChange(members.current_page - 1)}
                                    className="rounded-lg border border-slate-200 px-4 py-2 disabled:opacity-50 dark:border-slate-700"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    disabled={members.current_page === members.last_page}
                                    onClick={() => handlePageChange(members.current_page + 1)}
                                    className="rounded-lg border border-slate-200 px-4 py-2 disabled:opacity-50 dark:border-slate-700"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                show={showCreateModal}
                onClose={handleCreateModalClose}
                maxWidth="5xl"
                topCloseButton
                handleTopClose={handleCreateModalClose}
            >
                <div className="p-6 dark:bg-[#080626]">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 dark:text-white">
                        Create Calling Team Member
                    </h2>
                    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
                        Password will be auto-generated and login details will be sent to the member email. On first login, password reset will be required.
                    </div>

                    <form onSubmit={submit} className="grid gap-4">
                        <div className="mb-2 flex justify-center">
                            <div className="text-center">
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Profile Image
                                </label>
                                <div className="relative mx-auto">
                                    <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-slate-300 transition-colors hover:border-blue-500 dark:border-slate-600">
                                        {selectedFile ? (
                                            <img
                                                src={URL.createObjectURL(selectedFile)}
                                                alt="Profile Preview"
                                                className="h-full w-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                                <svg
                                                    className="mb-2 h-8 w-8"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                    />
                                                </svg>
                                                <span className="text-xs">Upload Image</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            name="image"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                    </label>
                                </div>
                                {errors.image && (
                                    <p className="mt-2 text-sm text-red-600">{errors.image}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, name: event.target.value }))
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    value={form.phone}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, phone: event.target.value }))
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, email: event.target.value }))
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={form.dob}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, dob: event.target.value }))
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                />
                                {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Gender
                                </label>
                                <select
                                    value={form.gender}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, gender: event.target.value }))
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Status
                            </label>
                            <select
                                value={form.status}
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, status: event.target.value }))
                                }
                                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            >
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleCreateModalClose}
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isCreating ? "Creating..." : "Create Calling Team Member"}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={updateStatus}
                title="Confirm Status Change"
                message={`Are you sure you want to ${
                    targetStatus ? "activate" : "deactivate"
                } this calling team member?`}
                confirmText="Confirm"
                cancelText="Cancel"
            />
        </AuthenticatedLayout>
    );
}
