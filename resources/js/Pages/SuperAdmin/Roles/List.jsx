import AuthenticatedLayout from "../Layouts/AuthenticatedLayout";
import { Head, usePage, router } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import Modal from "@/Components/Modal";
import NoData from "@/Components/NoData";
import { toast } from "react-hot-toast";
import { FaEdit } from "react-icons/fa";
import ConfirmDialog from "@/Components/ConfirmDialog";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
export default function List({ roles, auth, filters }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [statusFilter, setStatusFilter] = useState(filters.status || "");
    const [perPage, setPerPage] = useState(filters.per_page || 10);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [roleToUpdate, setRoleToUpdate] = useState(null);
    const [newStatus, setNewStatus] = useState(null);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        status: "active",
    });
    const [hasUserInteracted, setHasUserInteracted] = useState(false);

    const updateUrl = (newPage = 1) => {
        const params = {
            search: searchTerm,
            status: statusFilter,
            per_page: perPage,
            page: newPage,
        };
        router.get(route("super.role.list"), params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };
    useEffect(() => {
        if (hasUserInteracted) {
            updateUrl();
        }
    }, [searchTerm, statusFilter, perPage]);

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

    useEffect(() => {
        if (currentRole) {
            setFormData({
                name: currentRole.name,
                status: currentRole.status == 1 ? "active" : "inactive",
            });
        }
    }, [currentRole]);

    const handleCreate = () => {
        setCurrentRole(null);
        setIsOpen(true);
    };

    const handleEdit = (role) => {
        setCurrentRole(role);
        setIsOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const endpoint = currentRole
            ? route("super.role.update", currentRole.uuid)
            : route("super.role.add");

        const method = currentRole ? "put" : "post";

        router[method](
            endpoint,
            {
                ...formData,
                created_by: auth.user.id,
            },
            {
                onSuccess: () => {
                    setErrors({});
                    setFormData({
                        name: "",
                        status: "active",
                    });
                    setIsSubmitting(false);
                    handleClose();
                    setHasUserInteracted(true);
                    updateUrl(roles.current_page);
                },
                onError: (err) => {
                    setErrors(err);
                    setIsSubmitting(false);
                },
            }
        );
    };

    const getStatusDisplay = (status) => {
        const statusMap = {
            1: { text: "Active", class: "bg-green-100 text-green-800" },
            0: { text: "Inactive", class: "bg-red-100 text-red-800" },
        };
        return statusMap[status] || statusMap[0];
    };

    const handleClose = () => {
        setIsOpen(false);
        setCurrentRole(null);
        setFormData({
            name: "",
            status: "active",
        });
        setErrors({});
    };

    const handlePageChange = (page) => {
        setHasUserInteracted(true);
        updateUrl(page);
    };

    const toggleStatus = (uuid, currentStatus) => {
        const updatedStatus = currentStatus == 1 ? 0 : 1;
        setRoleToUpdate(uuid);
        setNewStatus(updatedStatus);
        setShowConfirmDialog(true);
    };

    const handleStatusUpdate = async () => {
        try {
            await router.post(
                route("super.role.status", roleToUpdate),
                { status: newStatus },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        updateUrl(roles.current_page);
                    },
                    onError: () => {},
                }
            );
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setShowConfirmDialog(false);
        }
    };

    const handleDelete = async () => {
        try {
            await router.delete(
                route("super.role.destroy", memberToDelete),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        updateUrl(roles.current_page);
                    },
                    onError: () => {},
                }
            );
        } catch (error) {
            console.error("Error deleting member:", error);
        } finally {
            setShowDeleteDialog(false);
            setMemberToDelete(null);
        }
    };

    const DownMenuItem = ({
        taskItem,
        index,
        handleEdit,
        toggleStatus,
        setMemberToDelete,
        setShowDeleteDialog,
    }) => {
           const [isDropdownOpen, setIsDropdownOpen] = useState(false);
              const [position, setPosition] = useState({ top: 0, left: 0 });
              const [activeButton, setActiveButton] = useState(null);
                 const toggleDropdown = (e) => {
                    e.stopPropagation();
                    const button = e.currentTarget;
                    const rect = button.getBoundingClientRect();
                    const newTop = rect.bottom + window.scrollY;
                    const newLeft = rect.right - 165;

                    setPosition({ top: newTop, left: newLeft });
                    setIsDropdownOpen(!isDropdownOpen);
                };
                const dropdownRef = useRef(null);

                useEffect(() => {
                           const handleClickOutside = (event) => {
                               if (
                                   dropdownRef.current &&
                                   !dropdownRef.current.contains(event.target)
                               ) {
                                   setIsDropdownOpen(false);
                               }
                           };

                           document.addEventListener("mousedown", handleClickOutside);
                           return () => {
                               document.removeEventListener("mousedown", handleClickOutside);
                           };
                       }, []);
        return (
            <>
                <button
                    onClick={toggleDropdown}
                    className="text-sm bg-none text-white p-[0]"
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect
                            x="0.5"
                            y="0.5"
                            width="23"
                            height="23"
                            rx="4.5"
                            stroke="#727272"
                        />
                        <path
                            d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z"
                            stroke="#727272"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M11.9004 13C12.4527 13 12.9004 12.5523 12.9004 12C12.9004 11.4477 12.4527 11 11.9004 11C11.3481 11 10.9004 11.4477 10.9004 12C10.9004 12.5523 11.3481 13 11.9004 13Z"
                            stroke="#727272"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M18.8008 13C19.3531 13 19.8008 12.5523 19.8008 12C19.8008 11.4477 19.3531 11 18.8008 11C18.2485 11 17.8008 11.4477 17.8008 12C17.8008 12.5523 18.2485 13 18.8008 13Z"
                            stroke="#727272"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>

                {isDropdownOpen && (
                    <div
                        ref={dropdownRef}
                        className="absolute min-w-[120px] z-50 px-[10px] py-[8px] dropDown rounded-[8px] mt-[5px] shadow-md"
                        style={{
                            top: `${position.top}px`,
                            left: `${position.left}px`,
                        }}
                    >
                        <ul>
                            <li className="flex items-center gap-[5px] p-2 text-[12px] text-black hover:bg-gray-100 cursor-pointer border-b border-b-[#f2f2f2]">
                                <button
                                    className="flex items-center gap-[8px]"
                                    onClick={() => handleEdit(taskItem)}
                                >
                                    <svg
                                        className="w-[18px]"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M16.7574 2.99678L14.7574 4.99678H5V18.9968H19V9.23943L21 7.23943V19.9968C21 20.5491 20.5523 20.9968 20 20.9968H4C3.44772 20.9968 3 20.5491 3 19.9968V3.99678C3 3.4445 3.44772 2.99678 4 2.99678H16.7574ZM20.4853 2.09729L21.8995 3.5115L12.7071 12.7039L11.2954 12.7064L11.2929 11.2897L20.4853 2.09729Z"></path>
                                    </svg>
                                    Edit Role
                                </button>
                            </li>

                            <li className="flex items-center gap-[5px] p-2 text-[12px] text-black hover:bg-gray-100 cursor-pointer border-b border-b-[#f2f2f2]">
                                <button
                                    onClick={() =>
                                        toggleStatus(
                                            taskItem.uuid,
                                            taskItem.status
                                        )
                                    }
                                    className="flex items-center gap-[8px]"
                                >
                                    {taskItem.status == 0 ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            className="w-[18px]"
                                            color="currentColor"
                                            fill="none"
                                        >
                                            <path
                                                d="M5 14.5C5 14.5 6.5 14.5 8.5 18C8.5 18 14.0588 8.83333 19 7"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            ></path>
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            className="w-[18px]"
                                            color="currentColor"
                                            fill="none"
                                        >
                                            <path
                                                d="M10.2471 6.7402C11.0734 7.56657 11.4866 7.97975 12.0001 7.97975C12.5136 7.97975 12.9268 7.56658 13.7531 6.74022L13.7532 6.7402L15.5067 4.98669L15.5067 4.98668C15.9143 4.5791 16.1182 4.37524 16.3302 4.25283C17.3966 3.63716 18.2748 4.24821 19.0133 4.98669C19.7518 5.72518 20.3628 6.60345 19.7472 7.66981C19.6248 7.88183 19.421 8.08563 19.0134 8.49321L17.26 10.2466C16.4336 11.073 16.0202 11.4864 16.0202 11.9999C16.0202 12.5134 16.4334 12.9266 17.2598 13.7529L19.0133 15.5065C19.4209 15.9141 19.6248 16.1179 19.7472 16.3299C20.3628 17.3963 19.7518 18.2746 19.0133 19.013C18.2749 19.7516 17.3965 20.3626 16.3302 19.7469C16.1182 19.6246 15.9143 19.4208 15.5067 19.013L13.7534 17.2598L13.7533 17.2597C12.9272 16.4336 12.5136 16.02 12.0001 16.02C11.4867 16.02 11.073 16.4336 10.2469 17.2598L10.2469 17.2598L8.49353 19.013C8.0859 19.4208 7.88208 19.6246 7.67005 19.7469C6.60377 20.3626 5.72534 19.7516 4.98693 19.013C4.2484 18.2746 3.63744 17.3963 4.25307 16.3299C4.37549 16.1179 4.5793 15.9141 4.98693 15.5065L6.74044 13.7529C7.56681 12.9266 7.98 12.5134 7.98 11.9999C7.98 11.4864 7.5666 11.073 6.74022 10.2466L4.98685 8.49321C4.57928 8.08563 4.37548 7.88183 4.25307 7.66981C3.63741 6.60345 4.24845 5.72518 4.98693 4.98669C5.72542 4.24821 6.60369 3.63716 7.67005 4.25283C7.88207 4.37524 8.08593 4.5791 8.49352 4.98668L8.49353 4.98669L10.2471 6.7402Z"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            ></path>
                                        </svg>
                                    )}
                                    {taskItem.status == 0
                                        ? "Activate Role"
                                        : "Deactivate Role"}
                                </button>
                            </li>

                            <li className="flex items-center gap-[5px] p-2 text-[12px] text-black hover:bg-gray-100 cursor-pointer">
                                <button
                                    onClick={() => {
                                        setMemberToDelete(taskItem.uuid);
                                        setShowDeleteDialog(true);
                                    }}
                                    className="flex items-center gap-[8px]"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-[18px] text-red-600 bg-[rgb(3 1 28)] hover:bg-[rgb(3 1 28)] hover:text-white dark:hover:bg-[rgb(3 1 28)] dark:hover:text-white"
                                        viewBox="0 0 24 24"
                                        width="22"
                                        height="22"
                                        color="currentColor"
                                        fill="none"
                                    >
                                        <path
                                            d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71728 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M9.5 16.5L9.5 10.5"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M14.5 16.5L14.5 10.5"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    Delete Role
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Roles" />

            <div className="min-h-screen  py-[40px] memberbg">
                <div className="mt-[64px]">
                    <div className="flex justify-between flex-wrap md:flex-nowrap px-[15px]  pt-[5px] pb-[15px]">
                        <div className="flex items-center flex-col md:flex-row gap-[15px] w-full md:w-auto">
                            <select
                                value={statusFilter}
                                onChange={handleStatusFilterChange}
 className={`
    w-full md:w-auto min-w-[120px] text-sm border rounded-md px-4 py-2.5
    focus:outline-none focus:ring-2 transition-all cursor-pointer appearance-none
    bg-white text-gray-800 border-gray-300
    hover:bg-gray-100  // Light theme hover
    focus:border-blue-500 focus:ring-blue-200
    dark:bg-gray-900 dark:text-white dark:border-gray-700
    dark:hover:bg-[#0a0e25]  // Dark theme hover
    ${
      errors?.departments
        ? "border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:ring-red-900/30"
        : ""
    }
  `}    >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            <select
                                value={perPage}
                                onChange={handlePerPageChange}
className={`
    w-full md:w-auto min-w-[120px] text-sm border rounded-md px-4 py-2.5
    focus:outline-none focus:ring-2 transition-all cursor-pointer appearance-none
    bg-white text-gray-800 border-gray-300
    hover:bg-gray-100  // Light theme hover
    focus:border-blue-500 focus:ring-blue-200
    dark:bg-gray-900 dark:text-white dark:border-gray-700
    dark:hover:bg-[#0a0e25]  // Dark theme hover
    ${
      errors?.departments
        ? "border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:ring-red-900/30"
        : ""
    }
  `}                          >
                                <option value="10">10 per page</option>
                                <option value="25">25 per page</option>
                                <option value="50">50 per page</option>
                                <option value="100">100 per page</option>
                            </select>

                            <input
                                type="text"
className={`
    w-full md:w-auto sm:min-w-[120px] text-sm rounded-md px-4 py-3
    focus:outline-none focus:ring-2 transition-all
    bg-white text-gray-800 placeholder-gray-500
    border border-gray-300 hover:border-gray-400
    focus:border-blue-500 focus:ring-blue-200
    dark:bg-gray-900 dark:text-white dark:placeholder-gray-400
    dark:border-gray-700 dark:hover:border-gray-600
    dark:focus:border-blue-600 dark:focus:ring-blue-900/30
    ${errors?.departments ?
      "border-red-500 focus:border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:border-red-600" :
      ""}
  `}                                placeholder="Search Roles..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>

                        {/* <div className="flex items-center space-x-1 mt-[10px] md:mt-[0]">
                            <button
                                onClick={handleCreate}
                                className="flex items-center gap-[5px] px-[20px] py-[12px] text-[15px] text-white rounded-[10px] bluebtbg"
                            >
                                Create Roles
                            </button>
                        </div> */}
                    </div>

                    <div class="p-[15px]">
                        <div className="overflow-x-auto tablebxbg p-[15px] rounded-[15px]">
                            <table className="min-w-full text-black rounded-2xl dark:text-white">
                                <thead>
                                    <tr class="whitespace-nowrap text-left">
                                        <th className="p-3">SR No.</th>
                                        <th className="p-3">Name</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Created By</th>
                                        <th className="p-3 text-center">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.data.length > 0 ? (
                                        roles.data.map((role, index) => (
                                            <tr
                                                key={role.id}
                                                className="hover:bg-gray-100 dark:hover:bg-[#0a0e25]"
                                            >
                                                <td className="p-3">
                                                    {index + 1}
                                                </td>

                                                <td className="p-3">
                                                    {role.name}
                                                </td>
                                                <td className="p-3">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs ${
                                                            getStatusDisplay(
                                                                role.status
                                                            ).class
                                                        }`}
                                                    >
                                                        {
                                                            getStatusDisplay(
                                                                role.status
                                                            ).text
                                                        }
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    {role.creator?.name ||
                                                        "System"}
                                                </td>
                                                <td className="p-3 flex items-center justify-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <DownMenuItem
                                                            taskItem={role}
                                                            index={index}
                                                            handleEdit={
                                                                handleEdit
                                                            }
                                                            toggleStatus={
                                                                toggleStatus
                                                            }
                                                            setMemberToDelete={
                                                                setMemberToDelete
                                                            }
                                                            setShowDeleteDialog={
                                                                setShowDeleteDialog
                                                            }
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="p-4">
                                                <NoData
                                                    message="No Roles found"
                                                    iconSize={48}
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {roles.data.length > 0 && (
    <div className="mt-4 flex justify-between items-center flex-wrap gap-4" style={{ padding: '0px 34px' }}>
        <span className="dark:text-white text-black">
            Showing {roles.from} to {roles.to} of {roles.total} entries
        </span>
        <nav aria-label="Pagination" className="flex items-center gap-2">
            <button
                onClick={() => handlePageChange(roles.current_page - 1)}
                disabled={roles.current_page == 1}
                className={`flex items-center justify-center gap-1 px-3 py-1 rounded-full text-sm text-white ${
                    roles.current_page == 1
                        ? "opacity-50 cursor-not-allowed bg-[rgb(74_91_127)]"
                        : "bg-[rgb(82_70_230)] hover:bg-[rgb(82_70_230)/0.9]"
                }`}
            >
                <ChevronLeftIcon className="size-4" />
                <span>BACK</span>
            </button>
            <div className="flex items-center gap-1">
                {Array.from({ length: roles.last_page }, (_, i) => i + 1).map((page) => {
                    if (
                        page == 1 ||
                        page == 2 ||
                        page == roles.last_page - 1 ||
                        page == roles.last_page ||
                        (page >= roles.current_page - 1 &&
                            page <= roles.current_page + 1)
                    ) {
                        return (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm text-white ${
                                    page == roles.current_page
                                        ? "bg-[rgb(82_70_230)]"
                                        : "bg-[rgb(74_91_127)] hover:bg-[rgb(74_91_127)/0.9]"
                                }`}
                            >
                                {page}
                            </button>
                        );
                    }
                    if (
                        (page == 3 && roles.current_page > 4) ||
                        (page == roles.last_page - 2 &&
                            roles.current_page < roles.last_page - 3)
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
                onClick={() => handlePageChange(roles.current_page + 1)}
                disabled={roles.current_page == roles.last_page}
                className={`flex items-center justify-center gap-1 px-3 py-1 rounded-full text-sm text-white ${
                    roles.current_page == roles.last_page
                        ? "opacity-50 cursor-not-allowed bg-[rgb(74_91_127)]"
                        : "bg-[rgb(82_70_230)] hover:bg-[rgb(82_70_230)/0.9]"
                }`}
            >
                <span>NEXT</span>
                <ChevronRightIcon className="size-4" />
            </button>
        </nav>
    </div>
)}
                </div>
            </div>
            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={handleStatusUpdate}
               message={`Do you want to ${newStatus == 1 ? "activate" : "deactivate"} this role?`}
                confirmText={`Yes, ${
                    newStatus == 1 ? "activate" : "deactivate"
                }`}
                cancelText="No, cancel"
                modalSpinnerMessage="Updating role status..."
            />
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setMemberToDelete(null);
                }}
                onConfirm={handleDelete}
                message="Are you sure you want to delete this Role?."
                confirmText="Yes, delete"
                cancelText="No, cancel"
                modalSpinnerMessage="Deleting Role..."
                isDanger={true}
            />
            <Modal
                show={isOpen}
                onClose={handleClose}
                maxWidth="md"
                topCloseButton={true}
                handleTopClose={handleClose}
            >
                <h2 className="text-xl font-bold mb-4 dark:text-white">
                    {currentRole ? "Edit Role" : "Create Role"}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">
                            Name <em className="text-red-500">*</em>
                        </label>
                        <input
  type="text"
  name="name"
  value={formData.name}
  onChange={handleChange}
  className={`
    w-full px-3 py-2 text-[12px] md:text-[13px] rounded-md
    bg-white text-gray-800 placeholder-gray-500
    border border-gray-300 hover:border-gray-400
    focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-200
    transition-all duration-200 ease-in-out

    dark:bg-gray-900 dark:text-white dark:placeholder-gray-400
    dark:border-gray-700 dark:hover:border-gray-600
    dark:focus:border-blue-600 dark:focus:ring-blue-900/30

    ${errors.name
      ? "border-red-500 focus:border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:border-red-600"
      : ""}
  `}
  required
/>
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 canclebtn rounded-[7px]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`flex items-center gap-[5px] px-[20px] py-[12px] text-[15px] text-white rounded-[10px] bluebtbg  ${
                                isSubmitting
                                    ? "opacity-75 cursor-not-allowed"
                                    : ""
                            }`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    {currentRole
                                        ? "Updating..."
                                        : "Creating..."}
                                </span>
                            ) : currentRole ? (
                                "Update"
                            ) : (
                                "Create"
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
