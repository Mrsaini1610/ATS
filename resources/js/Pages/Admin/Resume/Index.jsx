import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import AuthenticatedLayout from "../Layouts/AuthenticatedLayout";
import ConfirmDialog from "@/Components/ConfirmDialog";
import NoData from "@/Components/NoData";

export default function ResumeIndex({ resumes, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [perPage, setPerPage] = useState(filters?.per_page || 10);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [resumeToDelete, setResumeToDelete] = useState(null);

    const updateUrl = (newPage = 1) => {
        router.get(
            route("admin.resumes.index"),
            { search: searchTerm, per_page: perPage, page: newPage },
            { preserveState: true, replace: true, preserveScroll: true }
        );
    };

    useEffect(() => {
        if (!hasUserInteracted) return;
        const debounce = setTimeout(() => updateUrl(), 500);
        return () => clearTimeout(debounce);
    }, [searchTerm, perPage, hasUserInteracted]);

    const handleDelete = (resume) => {
        setResumeToDelete(resume);
        setShowConfirmDialog(true);
    };

    const confirmDelete = () => {
        if (!resumeToDelete) return Promise.resolve();
        return new Promise((resolve) => {
            router.delete(route("admin.resumes.destroy", resumeToDelete.id), {
                preserveScroll: true,
                onFinish: () => {
                    setShowConfirmDialog(false);
                    setResumeToDelete(null);
                    resolve();
                },
            });
        });
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= resumes.last_page) updateUrl(newPage);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Resume Builder" />
            <div className="min-h-screen py-[40px] memberbg">
                <div className="mt-[64px]">
                    <div className="flex justify-between flex-wrap gap-3 px-[15px] pt-[5px] pb-[15px] items-center">
                        <div className="flex items-center flex-col md:flex-row gap-[15px] w-full md:w-auto">
                            <input
                                type="text"
                                className="w-full md:w-auto sm:min-w-[260px] text-sm selectbg border rounded-md px-[25px] py-[12px] focus:outline-none box-shadow-none"
                                placeholder="Search by name, email, job title..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setHasUserInteracted(true);
                                }}
                            />
                        </div>
                        <Link
                            href={route("admin.resumes.create")}
                            className="bg-[rgb(82_70_230)] hover:bg-[rgb(82_70_230)/0.9] text-white px-4 py-2.5 rounded-md text-sm font-medium"
                        >
                            Create Resume
                        </Link>
                    </div>

                    <div className="p-[15px]">
                        <div className="overflow-x-auto tablebxbg p-[15px] rounded-[15px]">
                            <table className="min-w-full text-black rounded-2xl dark:text-white">
                                <thead className="bg-gray-100 dark:bg-[#0a0e25]">
                                    <tr className="bg-gray-100 dark:bg-[#0a0e25]">
                                        <th className="p-3 text-left">Name</th>
                                        <th className="p-3 text-left">Email</th>
                                        <th className="p-3 text-left">
                                            Job Title
                                        </th>
                                        <th className="p-3 text-left">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resumes.data?.length > 0 ? (
                                        resumes.data.map((resume) => (
                                            <tr
                                                key={resume.id}
                                                className="text-left hover:bg-gray-100 dark:hover:bg-[#0a0e25]"
                                            >
                                                <td className="p-3">
                                                    {resume.name}
                                                </td>
                                                <td className="p-3">
                                                    {resume.email}
                                                </td>
                                                <td className="p-3">
                                                    {resume.job_title || "-"}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        <Link
                                                            href={route(
                                                                "admin.resumes.show",
                                                                resume.id
                                                            )}
                                                            className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm"
                                                        >
                                                            View
                                                        </Link>
                                                        <Link
                                                            href={route(
                                                                "admin.resumes.edit",
                                                                resume.id
                                                            )}
                                                            className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    resume
                                                                )
                                                            }
                                                            className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="p-4 text-center"
                                            >
                                                <NoData message="No resumes found" />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {resumes.data?.length > 0 && (
                        <div className="mt-4 flex justify-between items-center flex-wrap gap-4 p-3 rounded-lg bg-[rgb(228_228_244)] dark:bg-[#5146E64D] mx-[15px]">
                            <div className="flex items-center">
                                <select
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(e.target.value);
                                        setHasUserInteracted(true);
                                    }}
                                    className={`
                                        w-full md:w-auto min-w-[140px] text-sm border rounded-md px-4 py-2.5
                                        focus:outline-none focus:ring-2 transition-all cursor-pointer appearance-none
                                        bg-white text-gray-800 border-gray-300
                                        hover:bg-gray-100
                                        focus:border-blue-500 focus:ring-blue-200
                                        dark:bg-gray-900 dark:text-white dark:border-gray-700
                                        dark:hover:bg-[#0a0e25]
                                    `}
                                >
                                    <option value="10">10 per page</option>
                                    <option value="25">25 per page</option>
                                    <option value="50">50 per page</option>
                                    <option value="100">100 per page</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() =>
                                        handlePageChange(resumes.current_page - 1)
                                    }
                                    disabled={resumes.current_page == 1}
                                    className={`flex items-center justify-center gap-1 px-3 py-1 rounded-full text-sm text-white ${
                                        resumes.current_page == 1
                                            ? "opacity-50 cursor-not-allowed bg-[rgb(74_91_127)]"
                                            : "bg-[rgb(82_70_230)] hover:bg-[rgb(82_70_230)/0.9]"
                                    }`}
                                >
                                    BACK
                                </button>

                                <div className="text-sm text-gray-700 dark:text-gray-200">
                                    Page {resumes.current_page} of{" "}
                                    {resumes.last_page}
                                </div>

                                <button
                                    onClick={() =>
                                        handlePageChange(resumes.current_page + 1)
                                    }
                                    disabled={
                                        resumes.current_page == resumes.last_page
                                    }
                                    className={`flex items-center justify-center gap-1 px-3 py-1 rounded-full text-sm text-white ${
                                        resumes.current_page == resumes.last_page
                                            ? "opacity-50 cursor-not-allowed bg-[rgb(74_91_127)]"
                                            : "bg-[rgb(82_70_230)] hover:bg-[rgb(82_70_230)/0.9]"
                                    }`}
                                >
                                    NEXT
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={confirmDelete}
                message={`Delete resume "${resumeToDelete?.name || ""}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                modalSpinnerMessage="Deleting resume..."
            />
        </AuthenticatedLayout>
    );
}

