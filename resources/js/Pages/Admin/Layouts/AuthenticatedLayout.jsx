import { useAlerts } from "@/Components/Alerts";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Modal from "@/Components/Modal";
import NavLink from "@/Components/NavLink";
import { Link, router, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";
import { FaSun } from "react-icons/fa6";
import { FaBell } from "react-icons/fa";

import UserDropdown from "./UserDropdown";
import Sidebar from "./Sidebar";
import { route } from "ziggy-js";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props;
    const authUser = user.auth?.user;

    const { successAlert, errorAlert, warningAlert, infoAlert } = useAlerts();
    const { flash, errors, messages } = usePage().props;

    const [darkMode, setDarkMode] = useState(
        () =>
            localStorage.theme === "dark" ||
            (!("theme" in localStorage) &&
                window.matchMedia("(prefers-color-scheme: dark)").matches)
    );

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [settings] = useState(null);
    const [bellOpen, setBellOpen] = useState(false);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [mustChangePassword, setMustChangePassword] = useState(
        Boolean(authUser?.must_change_password)
    );
    const [forcePasswordForm, setForcePasswordForm] = useState({
        password: "",
        password_confirmation: "",
    });
    const [forcePasswordErrors, setForcePasswordErrors] = useState({});
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const formatRelativeTime = (value) => {
        if (!value) return "";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }

        const diffInSeconds = Math.floor((date.getTime() - Date.now()) / 1000);
        const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

        const units = [
            { unit: "year", seconds: 60 * 60 * 24 * 365 },
            { unit: "month", seconds: 60 * 60 * 24 * 30 },
            { unit: "week", seconds: 60 * 60 * 24 * 7 },
            { unit: "day", seconds: 60 * 60 * 24 },
            { unit: "hour", seconds: 60 * 60 },
            { unit: "minute", seconds: 60 },
        ];

        for (const { unit, seconds } of units) {
            if (Math.abs(diffInSeconds) >= seconds) {
                return rtf.format(
                    Math.round(diffInSeconds / seconds),
                    unit
                );
            }
        }

        return rtf.format(diffInSeconds, "second");
    };

    useEffect(() => {
        if (flash?.success) successAlert(flash.success);
        if (flash?.error) errorAlert(flash.error);
        if (flash?.warning) warningAlert(flash.warning);
        if (flash?.info) infoAlert(flash.info);

        if (messages?.envelopes?.length > 0) {
            messages.envelopes.forEach(({ type, message }) => {
                switch (type) {
                    case "success":
                        successAlert(message);
                        break;
                    case "error":
                        errorAlert(message);
                        break;
                    case "warning":
                        warningAlert(message);
                        break;
                    case "info":
                        infoAlert(message);
                        break;
                    default:
                        console.warn("Unknown message type:", type);
                }
            });
        }
    }, [messages, flash, errors]);

    useEffect(() => {
        const root = window.document.documentElement;
        if (darkMode) {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);
    const closeSidebar = () => setSidebarOpen(false);

    const getCsrfToken = () => {
        const token = document
            ?.querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");
        return token || "";
    };

    const fetchUnreadCount = async () => {
        try {
            const res = await fetch("/admin/api/notifications/unread-count", {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });
            const payload = await res.json();
            if (payload?.success) {
                setUnreadCount(Number(payload.unread ?? 0));
            }
        } catch (error) {}
    };

    const fetchNotifications = async () => {
        setNotificationsLoading(true);
        try {
            const res = await fetch("/admin/api/notifications/list?per_page=10", {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });
            const payload = await res.json();
            if (payload?.success) {
                const page = payload.data;
                const items = Array.isArray(page?.data) ? page.data : [];
                setNotifications(items);
                setUnreadCount(Number(payload.unread ?? 0));
            }
        } catch (error) {
            setNotifications([]);
        } finally {
            setNotificationsLoading(false);
        }
    };

    const markNotificationRead = async (notificationUuid) => {
        try {
            await fetch(`/admin/api/notifications/${notificationUuid}/read`, {
                method: "PATCH",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": getCsrfToken(),
                },
            });
        } catch (error) {}
    };

    const markAllRead = async () => {
        try {
            const res = await fetch("/admin/api/notifications/read-all", {
                method: "PATCH",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": getCsrfToken(),
                },
            });
            const payload = await res.json();
            if (payload?.success) {
                setUnreadCount(Number(payload.unread ?? 0));
                setNotifications((prev) =>
                    prev.map((n) => ({
                        ...n,
                        status: "read",
                        viewed_at: n.viewed_at ?? new Date().toISOString(),
                    }))
                );
            }
        } catch (error) {}
    };

    const notificationText = (notification) => {
        const title =
            notification?.job?.title ||
            notification?.data?.title ||
            notification?.data?.job_title ||
            "Job";

        switch (notification?.type) {
            case "job_approved":
                return `Job approved: ${title}`;
            case "job_rejected":
                return `Job rejected: ${title}`;
            case "job_deactivated":
                return `Job deactivated: ${title}`;
            case "job_pending":
                return `Job pending: ${title}`;
            case "job_resubmitted":
                return `Job resubmitted: ${title}`;
            case "candidate_interested":
                return `Candidate interested: ${notification?.data?.candidate_name || title}`;
            case "candidate_not_interested":
                return `Candidate not interested: ${notification?.data?.candidate_name || title}`;
            case "interview_scheduled":
                return `Interview scheduled: ${notification?.data?.candidate_name || title}`;
            case "candidate_selected":
                return `Candidate selected: ${notification?.data?.candidate_name || title}`;
            case "candidate_not_selected":
                return `Candidate not selected: ${notification?.data?.candidate_name || title}`;
            case "candidate_approved":
                return `Candidate approved: ${notification?.data?.candidate_name || title}`;
            case "candidate_rejected":
                return `Candidate rejected: ${notification?.data?.candidate_name || title}`;
            case "candidate_follow_up":
                return `Candidate follow up: ${notification?.data?.candidate_name || title}`;
            case "candidate_no_response":
                return `Candidate no response: ${notification?.data?.candidate_name || title}`;
            case "offer_letter_generation_requested":
                return `Offer flow requested: ${notification?.data?.candidate_name || title}`;
            default:
                return title;
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const id = setInterval(() => fetchUnreadCount(), 30000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        if (bellOpen) {
            fetchNotifications();
        }
    }, [bellOpen]);

    useEffect(() => {
        setMustChangePassword(Boolean(authUser?.must_change_password));
    }, [authUser?.must_change_password]);

    const handleForcePasswordUpdate = (event) => {
        event.preventDefault();
        setIsUpdatingPassword(true);
        setForcePasswordErrors({});

        router.post(route("admin.profile.password.update"), forcePasswordForm, {
            preserveScroll: true,
            onSuccess: () => {
                setMustChangePassword(false);
                setForcePasswordForm({
                    password: "",
                    password_confirmation: "",
                });
                successAlert("Password updated successfully.");
            },
            onError: (nextErrors) => {
                setForcePasswordErrors(nextErrors);
            },
            onFinish: () => {
                setIsUpdatingPassword(false);
            },
        });
    };

    return (
        <>
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

            <div className="min-h-screen mainbg">
                <nav className="headerbg fixed top-0 left-0 right-0 z-50 py-[15px] px-[15px] rounded-[10px] print:hidden">
                    <div className="navbg rounded-[10px]  border-[1px] borderbx">
                        <div className="mx-auto max-w-full px-[8px] py-[0]">
                            <div className="flex h-16 justify-between items-center border-gray-200 dark:border-gray-700">

                                {/* Left Section */}
                                <div className="flex gap-[45px] items-center">
                                    <button
                                        onClick={toggleSidebar}
                                        className="flex xl:hidden items-center justify-center bg-white dark:bg-[#61CC681A] w-[48px] h-[38px] border border-[#0000001A] dark:border-[#61CC681A] rounded-[8px]"
                                    >
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 6h16M4 12h16M4 18h16"
                                            />
                                        </svg>
                                    </button>

                                    <div className="flex shrink-0 items-center">
                                        <Link href={route("admin.dashboard")}>
                                            <ApplicationLogo
                                                props={settings}
                                                className="block w-auto fill-current text-gray-800 dark:text-gray-200"
                                            />
                                        </Link>
                                    </div>

                                    <div className="hidden xl:flex items-center gap-[25px] xl:gap-[40px]">
                                        <NavLink
                                            href={route("admin.dashboard")}
                                            active={route().current("admin.dashboard")}
                                        >
                                            Dashboard
                                        </NavLink>

                                        <NavLink
                                            href={route("admin.job.posts.listing")}
                                            active={route().current("admin.job.posts.listing")}
                                        >
                                            Job Listing
                                        </NavLink>

                                        <NavLink
                                            href={route("admin.job.applications.index")}
                                            active={
                                                route().current("admin.job.applications.index") ||
                                                route().current("admin.job.applicants")
                                            }
                                        >
                                            Job Applications
                                        </NavLink>

                                        <NavLink
                                            href={route("admin.calling-team.index")}
                                            active={route().current("admin.calling-team.index")}
                                        >
                                            Calling Team
                                        </NavLink>
{/* 
                                        <NavLink
                                            href={route("admin.members.dashboard")}
                                            active={
                                                route().current("admin.members.dashboard") ||
                                                route().current("admin.members.details")
                                            }
                                        >
                                            Members
                                        </NavLink> */}
                                    </div>
                                </div>

                                {/* Right Section */}
                                <div className="flex items-center gap-2 relative">
                                    <DropdownMenu open={bellOpen} onOpenChange={setBellOpen}>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                className="relative flex items-center justify-center bg-white dark:bg-[#61CC681A] w-[48px] h-[38px] border border-[#0000001A] dark:border-[#61CC681A] rounded-[8px]"
                                            >
                                                <FaBell size={18} />
                                                {unreadCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[11px] leading-[18px] text-center">
                                                        {unreadCount > 99 ? "99+" : unreadCount}
                                                    </span>
                                                )}
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[360px] p-0">
                                            <DropdownMenuLabel className="flex items-center justify-between">
                                                <span>Notifications</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        markAllRead();
                                                    }}
                                                    className="text-xs text-blue-600 hover:underline"
                                                >
                                                    Mark all read
                                                </button>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />

                                            {notificationsLoading ? (
                                                <div className="p-4 text-sm text-gray-500">Loading...</div>
                                            ) : notifications.length === 0 ? (
                                                <div className="p-4 text-sm text-gray-500">
                                                    No notifications
                                                </div>
                                            ) : (
                                                <div className="max-h-[420px] overflow-auto">
                                                    {notifications.map((notification) => (
                                                        <DropdownMenuItem
                                                            key={notification.uuid}
                                                            className="flex flex-col items-start gap-1 py-3 cursor-pointer"
                                                            onSelect={async (e) => {
                                                                e.preventDefault();
                                                                await markNotificationRead(notification.uuid);
                                                                setUnreadCount((prev) =>
                                                                    Math.max(
                                                                        0,
                                                                        prev -
                                                                            (notification.status === "unread" &&
                                                                            !notification.viewed_at
                                                                                ? 1
                                                                                : 0)
                                                                    )
                                                                );
                                                                setNotifications((prev) =>
                                                                    prev.map((item) =>
                                                                        item.uuid === notification.uuid
                                                                            ? {
                                                                                  ...item,
                                                                                  status: "read",
                                                                                  viewed_at:
                                                                                      item.viewed_at ??
                                                                                      new Date().toISOString(),
                                                                              }
                                                                            : item
                                                                    )
                                                                );
                                                                 // Redirect based on notification type
                                                                 if (notification.type === "job_applied") {
                                                                     window.location.href = route(
                                                                         "admin.job.applications.index"
                                                                     );
                                                                 } else {
                                                                     window.location.href = route(
                                                                         "admin.job.posts.listing"
                                                                     );
                                                                 }
                                                            }}
                                                        >
                                                            <div className="w-full flex items-start justify-between gap-2">
                                                                <div
                                                                    className={
                                                                        "text-sm " +
                                                                        (notification.status === "unread" &&
                                                                        !notification.viewed_at
                                                                            ? "font-semibold"
                                                                            : "font-normal")
                                                                    }
                                                                >
                                                                    {notificationText(notification)}
                                                                </div>
                                                                {notification.status === "unread" &&
                                                                    !notification.viewed_at && (
                                                                        <span className="mt-[6px] w-2 h-2 rounded-full bg-blue-600" />
                                                                    )}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {formatRelativeTime(notification.created_at)}
                                                            </div>
                                                        </DropdownMenuItem>
                                                    ))}
                                                </div>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <button
                                        onClick={() => setDarkMode(!darkMode)}
                                        className="flex items-center justify-center bg-white dark:bg-[#61CC681A] w-[48px] h-[38px] border border-[#0000001A] dark:border-[#61CC681A] rounded-[8px]"
                                    >
                                        {darkMode ? (
                                            <FaSun
                                                size={18}
                                                className="text-gray-200"
                                            />
                                        ) : (
                                            <svg width="24"height="24"viewBox="0 0 24 24"fill="none">
                                                <path
                                                    d="M12.0015 2L14.6365 4.635H19.365V9.363L22 11.998L19.365 14.637V19.365H14.637L12.002 22L9.363 19.365H4.635V14.637L2 11.9985L4.635 9.3635V4.635H9.363L12.0015 2Z"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeMiterlimit="10"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                    </button>

                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() =>
                                                setDropdownOpen(!dropdownOpen)
                                            }
                                            className="w-[40px] h-[40px] rounded-[70px] bg-none p-0 mt-[5px]"
                                        >
                                            <img
                                                src={
                                                    user?.auth?.user
                                                        ?.profile_photo_url
                                                }
                                                alt="User"
                                            />
                                        </button>

                                        <UserDropdown open={dropdownOpen} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {header && (
                    <header className="bg-white shadow dark:bg-gray-800 mt-16">
                        <div className="mx-auto max-w-full px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                <main className="mt-8">{children}</main>

                <Modal show={mustChangePassword} closeable={false} maxWidth="md">
                    <div className="p-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Reset Password
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            Please set a new password before using the admin panel.
                        </p>

                        <form onSubmit={handleForcePasswordUpdate} className="mt-6 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={forcePasswordForm.password}
                                    onChange={(event) =>
                                        setForcePasswordForm((prev) => ({
                                            ...prev,
                                            password: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                />
                                {forcePasswordErrors.password && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {forcePasswordErrors.password}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={forcePasswordForm.password_confirmation}
                                    onChange={(event) =>
                                        setForcePasswordForm((prev) => ({
                                            ...prev,
                                            password_confirmation: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                />
                                {forcePasswordErrors.password_confirmation && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {forcePasswordErrors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdatingPassword}
                                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isUpdatingPassword ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    </div>
                </Modal>

                <Toaster position="top-right" reverseOrder={false} gutter={8} />
            </div>
        </>
    );
}
