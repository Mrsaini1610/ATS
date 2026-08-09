import React, { useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "../Layouts/AuthenticatedLayout";
import ConfirmDialog from "@/Components/ConfirmDialog";

export default function Index({ messages, filters, counts }) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedToDelete, setSelectedToDelete] = useState(null);
    const [preview, setPreview] = useState(null);

    const statusTabs = useMemo(
        () => [
            { key: "", label: `All (${counts?.total ?? 0})` },
            { key: "unread", label: `Unread (${counts?.unread ?? 0})` },
            { key: "read", label: `Read (${counts?.read ?? 0})` },
        ],
        [counts]
    );

    const currentStatus = filters?.status ?? "";

    const applyStatus = (status) => {
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        const url = `${route("super.contact.messages.index")}${params.toString() ? `?${params.toString()}` : ""}`;
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    const toggleRead = (message) => {
        router.patch(route("super.contact.messages.toggle-read", message.uuid), {}, { preserveScroll: true });
    };

    const requestDelete = (message) => {
        setSelectedToDelete(message);
        setConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedToDelete) return Promise.resolve();
        return new Promise((resolve) => {
            router.delete(route("super.contact.messages.destroy", selectedToDelete.uuid), {
                preserveScroll: true,
                onFinish: () => {
                    setConfirmOpen(false);
                    setSelectedToDelete(null);
                    resolve();
                },
            });
        });
    };

    const openPreview = (message) => {
        setPreview(message);
        if (!message.is_read) {
            toggleRead(message);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Contact Messages" />

            <div className="py-6 sm:py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Messages</h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                View submissions from the contact form and manage read/unread status.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {statusTabs.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => applyStatus(tab.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                                    currentStatus === tab.key
                                        ? "bg-[#5146E6] text-white border-[#5146E6]"
                                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900/30">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            From
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            Subject
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {(messages?.data ?? []).map((message) => (
                                        <tr key={message.uuid} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        message.is_read
                                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                                    }`}
                                                >
                                                    {message.is_read ? "Read" : "Unread"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {message.name}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                                    {message.email}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {message.subject || "—"}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1 max-w-[520px]">
                                                    {message.message}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                                                {message.created_at
                                                    ? new Date(message.created_at).toLocaleString()
                                                    : "—"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openPreview(message)}
                                                        className="px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleRead(message)}
                                                        className="px-3 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        {message.is_read ? "Mark Unread" : "Mark Read"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => requestDelete(message)}
                                                        className="px-3 py-2 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {(!messages?.data || messages.data.length === 0) && (
                            <div className="p-10 text-center text-gray-600 dark:text-gray-300">
                                No messages found.
                            </div>
                        )}
                    </div>

                    {messages?.links?.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2">
                            {messages.links.map((link, index) => (
                                <button
                                    key={`${link.label}-${index}`}
                                    type="button"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true })}
                                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                                        link.active
                                            ? "bg-[#5146E6] text-white border-[#5146E6]"
                                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    } ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {preview && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm px-4 py-8 overflow-y-auto">
                    <div className="relative max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl max-h-[90vh] overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setPreview(null)}
                            className="absolute top-4 right-4 z-20 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="max-h-[90vh] overflow-y-auto">
                        <div className="p-5 pr-14 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-4">
                            <div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {preview.subject || "Contact Message"}
                                </div>
                                <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                    {preview.name} • {preview.email}
                                </div>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                                {preview.message}
                            </div>
                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => toggleRead(preview)}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {preview.is_read ? "Mark Unread" : "Mark Read"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => requestDelete(preview)}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setSelectedToDelete(null);
                }}
                onConfirm={confirmDelete}
                message="Delete this message?"
                confirmText="Delete"
                cancelText="Cancel"
            />
        </AuthenticatedLayout>
    );
}
