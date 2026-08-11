import { Head, router } from "@inertiajs/react";
import axios from "axios";
import { useState, useEffect } from "react";
import AuthenticatedLayout from "../Layouts/AuthenticatedLayout";
import Modal from "@/Components/Modal";
import NoData from "@/Components/NoData";
import ConfirmDialog from "@/Components/ConfirmDialog";
import ShowUserProfile from "@/Components/ShowUserProfile";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

const getDefaultCreateForm = (departmentIds = []) => ({
    name: "",
    phone: "",
    email: "",
    dob: "",
    gender: "male",
    status: "1",
    password: "",
    confirm_password: "",
    departments: departmentIds,
    designations: [],
});

export default function MembersList({ members, filters, departments }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [statusFilter, setStatusFilter] = useState(filters.status || "");
    const [perPage, setPerPage] = useState(filters.per_page || 10);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [memberToUpdate, setMemberToUpdate] = useState(null);
    const [newStatus, setNewStatus] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const adminDepartmentIds = departments.map((department) =>
        String(department.id)
    );
    const adminDepartmentNames = departments.map((department) => department.name);
    const [createForm, setCreateForm] = useState(() =>
        getDefaultCreateForm(adminDepartmentIds)
    );
    const [designations, setDesignations] = useState([]);
    const [createErrors, setCreateErrors] = useState({});
    const [isCreating, setIsCreating] = useState(false);

    const updateUrl = (newPage = 1) => {
        const params = {
            search: searchTerm,
            status: statusFilter,
            per_page: perPage,
            page: newPage,
        };
        router.get(route("admin.members.dashboard"), params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    useEffect(() => {
        if (hasUserInteracted) {
            const debounceTimer = setTimeout(() => {
                updateUrl();
            }, 500);

            return () => clearTimeout(debounceTimer);
        }
    }, [searchTerm, statusFilter, perPage, hasUserInteracted]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setHasUserInteracted(true);
    };

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setHasUserInteracted(true);
    };

    const handlePerPageChange = (e) => {
        setPerPage(e.target.value);
        setHasUserInteracted(true);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= members.last_page) {
            updateUrl(newPage);
        }
    };

    const toggleStatus = (id, currentStatus) => {
        setMemberToUpdate(id);
        setNewStatus(currentStatus == 1 ? 0 : 1);
        setShowConfirmDialog(true);
    };

    const confirmStatusChange = () => {
        router.post(
            route("admin.members.update-status", memberToUpdate),
            { status: newStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowConfirmDialog(false);
                    updateUrl(members.current_page);
                },
            }
        );
    };
    const getRoleName = (roleId) => {
        const roleMap = {
            "1": "Admin",
            "2": "Super Admin",
            "3": "Doer",
        };
        return roleMap[roleId] || `Role ${roleId}`;
    };

    const getRoleBadgeColor = (roleId) => {
        const colorMap = {
            "1": "bg-blue-600 text-white",
            "2": "bg-purple-600 text-white",
            "3": "bg-green-600 text-white",
        };
        return colorMap[roleId] || "bg-gray-600 text-white";
    };

    const fetchDesignations = async (departmentIds) => {
        if (!departmentIds.length) {
            setDesignations([]);
            return;
        }

        try {
            const response = await axios.get(
                route("admin.designations.by_departments"),
                {
                    params: {
                        department_ids: departmentIds,
                    },
                }
            );
            setDesignations(response.data || []);
        } catch (error) {
            setDesignations([]);
        }
    };

    useEffect(() => {
        if (!isCreateModalOpen) {
            return;
        }

        if (createForm.departments.length > 0) {
            fetchDesignations(createForm.departments);
            return;
        }

        setDesignations([]);
        setCreateForm((prev) =>
            prev.designations.length > 0
                ? { ...prev, designations: [] }
                : prev
        );
    }, [isCreateModalOpen, createForm.departments]);

    const handleCreateOpen = () => {
        setCreateErrors({});
        setCreateForm(getDefaultCreateForm(adminDepartmentIds));
        setDesignations([]);
        setIsCreateModalOpen(true);
    };

    const handleCreateClose = () => {
        setIsCreateModalOpen(false);
        setCreateErrors({});
        setCreateForm(getDefaultCreateForm(adminDepartmentIds));
        setDesignations([]);
        setIsCreating(false);
    };

    const handleCreateChange = (e) => {
        const { name, value } = e.target;

        if (name === "phone" && (!/^\d*$/.test(value) || value.length > 10)) {
            return;
        }

        setCreateForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreateArraySelect = (field, value) => {
        setCreateForm((prev) => ({
            ...prev,
            [field]: value ? [value] : [],
            ...(field === "departments" ? { designations: [] } : {}),
        }));
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        setIsCreating(true);

        const data = new FormData();
        Object.entries(createForm).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((item) => data.append(`${key}[]`, item));
                return;
            }

            data.append(key, value);
        });

        router.post(route("admin.members.store"), data, {
            preserveScroll: true,
            preserveState: true,
            forceFormData: true,
            onSuccess: () => {
                handleCreateClose();
                updateUrl(members.current_page);
            },
            onError: (errors) => {
                setCreateErrors(errors);
            },
            onFinish: () => {
                setIsCreating(false);
            },
        });
    };

    const getStatusDisplay = (status) => {
        const statusMap = {
            1: {
                text: "Active",
                class: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            },
            0: {
                text: "Inactive",
                class: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
            },
        };
        return statusMap[status] || statusMap[1];
    };

    return (
        <AuthenticatedLayout>
            <Head title="Members" />
            <div className="min-h-screen py-[40px] memberbg">
                <div className="mt-[64px]">
                    <div className="flex justify-between flex-wrap md:flex-nowrap px-[15px] pt-[5px] pb-[15px]">
                        <div className="flex items-center flex-col md:flex-row gap-[15px] w-full md:w-auto">
                            <select
                                value={statusFilter}
                                onChange={handleStatusFilterChange}
                                className="w-full md:w-auto sm:min-w-[120px] text-sm selectbg border rounded-md px-[25px] py-[12px] focus:outline-none box-shadow-none"
                            >
                                <option value="">All Status</option>
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>



                            <input
                                type="text"
                                className="w-full md:w-auto sm:min-w-[120px] text-sm selectbg border rounded-md px-[25px] py-[12px] focus:outline-none box-shadow-none"
                                placeholder="Search Members..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>

                        <div className="mt-[10px] md:mt-0">
                            <button
                                type="button"
                                onClick={handleCreateOpen}
                                className="flex items-center gap-[5px] px-[20px] py-[12px] text-[15px] text-white rounded-[10px] bluebtbg"
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M11.9997 8.66671H8.66634V12C8.66634 12.3667 8.36634 12.6667 7.99968 12.6667C7.63301 12.6667 7.33301 12.3667 7.33301 12V8.66671H3.99967C3.63301 8.66671 3.33301 8.36671 3.33301 8.00004C3.33301 7.63338 3.63301 7.33337 3.99967 7.33337H7.33301V4.00004C7.33301 3.63337 7.63301 3.33337 7.99968 3.33337C8.36634 3.33337 8.66634 3.63337 8.66634 4.00004V7.33337H11.9997C12.3663 7.33337 12.6663 7.63338 12.6663 8.00004C12.6663 8.36671 12.3663 8.66671 11.9997 8.66671Z"
                                        fill="white"
                                    />
                                </svg>
                                Create Member
                            </button>
                        </div>
                    </div>

                    <div className="p-[15px]">
                        <div className="overflow-x-auto tablebxbg p-[15px] rounded-[15px]">
                            <table className="min-w-full text-black rounded-2xl dark:text-white">
                                <thead className="bg-gray-100 dark:bg-gray-800">
                                    <tr className="bg-gray-100 dark:bg-[#0a0e25]">
                                        <th className="p-3 text-left">SR No.</th>
                                        <th className="p-3 text-left">Name</th>
                                        <th className="p-3 text-left">Phone</th>
                                        <th className="p-3 text-left">Departments</th>
                                        <th className="p-3 text-left">Designations</th>
                                         <th className="p-3 text-left">Roles</th>
                                        <th className="p-3 text-left">Status</th>
                                        <th className="p-3 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.data.length > 0 ? (
                                        members.data.map((member, index) => (
                                            <tr
                                                key={member.id}
                                                className="text-left hover:bg-gray-100 dark:hover:bg-[#0a0e25]"
                                            >
                                                <td className="p-3 text-left">{index + 1}</td>
                                                <td className="p-3">
                                                    <div className="flex items-center">
                                                        {member.profile_photo_url ? (
                                                            <img
                                                                src={
                                                                    member.profile_photo_url
                                                                }
                                                                alt={member.name}
                                                                className="w-8 h-8 rounded-full mr-2"
                                                            />
                                                        ) : (
                                                            <ShowUserProfile
                                                                user={member}
                                                                className="!w-8 !h-8 mr-2"
                                                            />
                                                        )}
                                                        <span>{member.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-left">
                                                    {member.phone || "-"}
                                                </td>
                                                <td className="p-3 text-left">
                                                    <div className="relative group">
                                                        <div className="flex flex-wrap gap-1">
                                                            {member.departments_data
                                                                ?.slice(0, 2)
                                                                .map((dept) => (
                                                                    <span
                                                                        key={dept.id}
                                                                        className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded"
                                                                    >
                                                                        {dept.name}
                                                                    </span>
                                                                ))}
                                                            {member.departments_data
                                                                ?.length > 2 && (
                                                                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded">
                                                                    +
                                                                    {member
                                                                        .departments_data
                                                                        .length - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {member.departments_data
                                                            ?.length > 2 && (
                                                            <div className="absolute z-10 hidden group-hover:block bottom-full left-0 mb-2 w-max max-w-xs bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                                                                <div className="flex flex-wrap gap-1">
                                                                    {member.departments_data?.map(
                                                                        (dept) => (
                                                                            <span
                                                                                key={
                                                                                    dept.id
                                                                                }
                                                                                className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded"
                                                                            >
                                                                                {
                                                                                    dept.name
                                                                                }
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </div>
                                                                <div className="absolute w-3 h-3 bg-white dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 transform rotate-45 -bottom-1.5 left-3"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-left">
                                                    <div className="relative group">
                                                        <div className="flex flex-wrap gap-1">
                                                            {member.designations_data
                                                                ?.slice(0, 2)
                                                                .map((designation) => (
                                                                    <span
                                                                        key={
                                                                            designation.id
                                                                        }
                                                                        className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-0.5 rounded transition-colors duration-200"
                                                                    >
                                                                        {
                                                                            designation.name
                                                                        }
                                                                    </span>
                                                                ))}
                                                            {member.designations_data
                                                                ?.length > 2 && (
                                                                <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-0.5 rounded cursor-pointer">
                                                                    +
                                                                    {member
                                                                        .designations_data
                                                                        .length - 2}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Enhanced Tooltip */}
                                                        {member.designations_data
                                                            ?.length > 2 && (
                                                            <div className="absolute z-20 hidden group-hover:block bottom-full left-0 mb-2 min-w-[200px] max-w-xs bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                                    All Designations (
                                                                    {
                                                                        member
                                                                            .designations_data
                                                                            .length
                                                                    }
                                                                    )
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {member.designations_data.map(
                                                                        (
                                                                            designation
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    designation.id
                                                                                }
                                                                                className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2.5 py-1 rounded-full flex items-center"
                                                                            >
                                                                                {
                                                                                    designation.name
                                                                                }
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </div>
                                                                <div className="absolute w-3 h-3 bg-white dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 transform rotate-45 -bottom-1.5 left-4"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                 <td className="p-3">
  <div className="flex justify-center gap-2 flex-wrap">
    {member.roles && member.roles.length > 0 ? (
      member.roles.map((roleId) => (
        <span
          key={roleId}
          className={`inline-flex items-center gap-x-1 py-1 px-3 rounded-full text-xs font-medium ${getRoleBadgeColor(
            roleId
          )}`}
        >
          {getRoleName(roleId)}
        </span>
      ))
    ) : (
      <span className="text-gray-400">No roles assigned</span>
    )}
  </div>
</td>
                                                <td className="p-3 text-left">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs ${
                                                            getStatusDisplay(
                                                                member.status
                                                            ).class
                                                        }`}
                                                    >
                                                        {
                                                            getStatusDisplay(
                                                                member.status
                                                            ).text
                                                        }
                                                    </span>
                                                </td>
                                                <td className="p-3 text-left">
                                                    <div className="flex gap-2">
                                                    <button
                                                        onClick={() => toggleStatus(member.id, member.status)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                                                            member.status == 1 ? 'bg-green-500' : 'bg-red-500'
                                                        }`}
                                                        >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                                                            member.status == 1 ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                        />
                                                        </button>

                                                    {/* <a href={route("admin.members.details", {  member.uuid, })} className="flex items-center gap-[8px] text-black dark:text-white"> */}
                                                    <a href={route("admin.members.details", )} className="flex items-center gap-[8px] text-black dark:text-white">
                                                    <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 576 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"></path></svg>
                                                    </a></div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="p-4 text-center">
                                                <NoData message="No members found" />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                  {members.data.length > 0 && (
    <div className="mt-4 flex justify-between items-center flex-wrap gap-4 p-3 rounded-lg bg-[rgb(228_228_244)] dark:bg-[#5146E64D]">
        <div className="flex items-center">
                   <select
                       value={perPage}
                       onChange={handlePerPageChange}
                       className={`
                           w-full md:w-auto min-w-[120px] text-sm border rounded-md px-4 py-2.5
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

        <div className="flex items-center gap-4">
            {/* Replace the static "10/Page" box with the select dropdown */}


            <div className="flex items-center gap-2">
                <button
                    onClick={() => handlePageChange(members.current_page - 1)}
                    disabled={members.current_page == 1}
                    className={`flex items-center justify-center gap-1 px-3 py-1 rounded-full text-sm text-white ${
                        members.current_page == 1
                            ? "opacity-50 cursor-not-allowed bg-[rgb(74_91_127)]"
                            : "bg-[rgb(82_70_230)] hover:bg-[rgb(82_70_230)/0.9]"
                    }`}
                >
                    <ChevronLeftIcon className="size-4" />
                    <span>BACK</span>
                </button>
<div className="flex items-center gap-1">
                    {Array.from({ length: members.last_page }, (_, i) => i + 1).map((page) => {
                        if (
                            page == 1 ||
                            page == 2 ||
                            page == members.last_page - 1 ||
                            page == members.last_page ||
                            (page >= members.current_page - 1 && page <= members.current_page + 1)
                        ) {
                            return (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm text-white ${
                                        page === members.current_page
                                            ? "bg-[rgb(82_70_230)]"
                                            : "bg-[rgb(74_91_127)] hover:bg-[rgb(74_91_127)/0.9]"
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        }
                        if (
                            (page == 3 && members.current_page > 4) ||
                            (page == members.last_page - 2 && members.current_page < members.last_page - 3)
                        ) {
                            return (
                                <span
                                    key={`ellipsis-${page}`}
                                    className="flex items-center justify-center w-8 h-8 rounded-full text-sm text-gray-500"
                                >
                                    ...
                                </span>
                            );
                        }
                        return null;
                    })}
                </div>

                <button
                    onClick={() => handlePageChange(members.current_page + 1)}
                    disabled={members.current_page == members.last_page}
                    className={`flex items-center justify-center gap-1 px-3 py-1 rounded-full text-sm text-white ${
                        members.current_page == members.last_page
                            ? "opacity-50 cursor-not-allowed bg-[rgb(74_91_127)]"
                            : "bg-[rgb(82_70_230)] hover:bg-[rgb(82_70_230)/0.9]"
                    }`}
                >
                    <span>NEXT</span>
                    <ChevronRightIcon className="size-4" />
                </button>
            </div>
        </div>
    </div>
)}
                </div>
            </div>

            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={confirmStatusChange}
                title="Confirm Status Change"
                message={`Are you sure you want to ${
                    newStatus == 1 ? "activate" : "deactivate"
                } this member?`}
                confirmText="Confirm"
                cancelText="Cancel"
            />

            <Modal
                show={isCreateModalOpen}
                onClose={handleCreateClose}
                maxWidth="4xl"
                topCloseButton={true}
                handleTopClose={handleCreateClose}
            >
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                        Create New Member
                    </h2>

                    <form onSubmit={handleCreateSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={createForm.name}
                                    onChange={handleCreateChange}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                                />
                                {createErrors.name && (
                                    <p className="mt-1 text-sm text-red-600">{createErrors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={createForm.phone}
                                    onChange={handleCreateChange}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                                />
                                {createErrors.phone && (
                                    <p className="mt-1 text-sm text-red-600">{createErrors.phone}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={createForm.email}
                                    onChange={handleCreateChange}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                                />
                                {createErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">{createErrors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={createForm.dob}
                                    onChange={handleCreateChange}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={createForm.gender}
                                    onChange={handleCreateChange}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={createForm.status}
                                    onChange={handleCreateChange}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={createForm.password}
                                    onChange={handleCreateChange}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                                />
                                {createErrors.password && (
                                    <p className="mt-1 text-sm text-red-600">{createErrors.password}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Confirm Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="confirm_password"
                                    value={createForm.confirm_password}
                                    onChange={handleCreateChange}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                                />
                                {createErrors.confirm_password && (
                                    <p className="mt-1 text-sm text-red-600">{createErrors.confirm_password}</p>
                                )}
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
                                Departments <span className="text-red-500">*</span>
                            </h3>
                            <div className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-white">
                                {adminDepartmentNames.length > 0
                                    ? adminDepartmentNames.join(", ")
                                    : "No department assigned"}
                            </div>
                            {createErrors.departments && (
                                <p className="mt-1 text-sm text-red-600">{createErrors.departments}</p>
                            )}
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
                                Designations <span className="text-red-500">*</span>
                            </h3>
                            <select
                                value={createForm.designations[0] || ""}
                                onChange={(e) =>
                                    handleCreateArraySelect("designations", e.target.value)
                                }
                                disabled={createForm.departments.length === 0 || designations.length === 0}
                                className="w-full px-3 py-2 border rounded-md disabled:opacity-60 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">
                                    {createForm.departments.length === 0
                                        ? "Select department first"
                                        : designations.length === 0
                                        ? "No designations available"
                                        : "Select Designation"}
                                </option>
                                {designations.map((designation) => (
                                    <option key={designation.id} value={String(designation.id)}>
                                        {designation.name}
                                    </option>
                                ))}
                            </select>
                            {createErrors.designations && (
                                <p className="mt-1 text-sm text-red-600">{createErrors.designations}</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCreateClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 dark:border-gray-600 dark:text-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isCreating}
                                className={`px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 ${
                                    isCreating ? "opacity-70 cursor-not-allowed" : ""
                                }`}
                            >
                                {isCreating ? "Creating..." : "Create Member"}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
