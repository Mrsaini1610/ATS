import ApplicationLogo from "@/Components/ApplicationLogo";
import Modal from "@/Components/Modal";
import NavLink from "@/Components/NavLink";
import { useAlerts } from "@/Components/Alerts";
import { Link, router, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";
import { FaBell, FaSun } from "react-icons/fa";
import Sidebar from "./Sidebar";
import UserDropdown from "./Userdropdown";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AuthenticatedLayout({ children }) {
    const page = usePage().props;
    const authUser = page.auth?.user;
    const { flash, errors, messages } = page;
    const { successAlert, errorAlert, warningAlert, infoAlert } = useAlerts();

    const [darkMode, setDarkMode] = useState(
        () =>
            localStorage.theme === "dark" ||
            (!("theme" in localStorage) &&
                window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [bellOpen, setBellOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [mustChangePassword, setMustChangePassword] = useState(
        Boolean(authUser?.must_change_password)
    );
    const [forcePasswordForm, setForcePasswordForm] = useState({
        password: "",
        password_confirmation: "",
    });
    const [forcePasswordErrors, setForcePasswordErrors] = useState({});
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (errors) {
            Object.values(errors).forEach((value) => errorAlert(value));
        }
        if (flash?.success) successAlert(flash.success);
        if (flash?.error) errorAlert(flash.error);
        if (flash?.warning) warningAlert(flash.warning);
        if (flash?.info) infoAlert(flash.info);

        if (messages?.envelopes?.length > 0) {
            messages.envelopes.forEach(({ type, message }) => {
                if (type === "success") successAlert(message);
                if (type === "error") errorAlert(message);
                if (type === "warning") warningAlert(message);
                if (type === "info") infoAlert(message);
            });
        }
    }, [errors, flash, messages]);

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
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getCsrfToken = () =>
        document?.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

    const notificationText = (notification) => {
        const title =
            notification?.data?.candidate_name ||
            notification?.data?.job_title ||
            "Candidate";

        switch (notification?.type) {
            case "candidate_assigned_to_calling_team":
                return `New candidate assigned: ${title}`;
            case "candidate_approved":
                return `Candidate approved: ${title}`;
            case "candidate_rejected":
                return `Candidate rejected: ${title}`;
            case "candidate_follow_up":
                return `Candidate follow up: ${title}`;
            case "candidate_no_response":
                return `Candidate no response: ${title}`;
            default:
                return title;
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch("/calling-team/api/notifications/unread-count", {
                headers: { Accept: "application/json" },
            });
            const payload = await response.json();
            if (payload?.success) {
                setUnreadCount(Number(payload.unread ?? 0));
            }
        } catch (_) {}
    };

    const fetchNotifications = async () => {
        setNotificationsLoading(true);
        try {
            const response = await fetch("/calling-team/api/notifications/list?per_page=10", {
                headers: { Accept: "application/json" },
            });
            const payload = await response.json();
            if (payload?.success) {
                setNotifications(Array.isArray(payload?.data?.data) ? payload.data.data : []);
                setUnreadCount(Number(payload.unread ?? 0));
            }
        } catch (_) {
            setNotifications([]);
        } finally {
            setNotificationsLoading(false);
        }
    };

    const markAllRead = async () => {
        try {
            const response = await fetch("/calling-team/api/notifications/read-all", {
                method: "PATCH",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": getCsrfToken(),
                },
            });
            const payload = await response.json();
            if (payload?.success) {
                setUnreadCount(Number(payload.unread ?? 0));
                setNotifications((prev) =>
                    prev.map((notification) => ({
                        ...notification,
                        status: "read",
                        viewed_at: notification.viewed_at ?? new Date().toISOString(),
                    }))
                );
            }
        } catch (_) {}
    };

    useEffect(() => {
        fetchUnreadCount();
        const intervalId = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(intervalId);
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

        router.post(route("callingteam.profile.password.update"), forcePasswordForm, {
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
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="min-h-screen dark:bg-[#0a0e25] bg-gray-100">
                <nav className="border-b border-gray-300 dark:border-blue-950 dark:bg-[#0a0e25] bg-gray-100 fixed top-0 left-0 right-0 z-50 print:hidden">
                    <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex items-center gap-[45px]">
                                <button
                                    onClick={() => setSidebarOpen((prev) => !prev)}
                                    className="flex xl:hidden items-center justify-center bg-white dark:bg-[#61CC681A] w-[48px] h-[38px] border-[1px] border-[#0000001A] dark:border-[#61CC681A] rounded-[8px] transition md:flex text-current focus:outline-none"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>

                                <div className="flex shrink-0 items-center">
                                    <Link href={route("callingteam.dashboard")}>
                                        <ApplicationLogo
                                            className="block w-auto fill-current text-gray-800 dark:text-gray-200"
                                        />
                                    </Link>
                                </div>

                                <div className="hidden xl:flex items-center space-x-8 ms-10">
                                    <NavLink
                                        href={route("callingteam.dashboard")}
                                        active={route().current("callingteam.dashboard")}
                                    >
                                        Dashboard
                                    </NavLink>
                                    <NavLink
                                        href={route("callingteam.profile")}
                                        active={route().current("callingteam.profile")}
                                    >
                                        Profile
                                    </NavLink>
                                </div>
                            </div>

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
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();
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
                                            <div className="p-4 text-sm text-gray-500">No notifications</div>
                                        ) : (
                                            <div className="max-h-[420px] overflow-auto">
                                                {notifications.map((notification) => (
                                                    <DropdownMenuItem
                                                        key={notification.uuid}
                                                        className="flex flex-col items-start gap-1 py-3 cursor-pointer"
                                                    >
                                                        <div className="w-full flex items-start justify-between gap-2">
                                                            <div className="text-sm">
                                                                {notificationText(notification)}
                                                            </div>
                                                            {notification.status === "unread" &&
                                                                !notification.viewed_at && (
                                                                    <span className="mt-[6px] w-2 h-2 rounded-full bg-blue-600" />
                                                                )}
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
                                        <FaSun size={18} className="text-gray-200" />
                                    ) : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
                                        onClick={() => setDropdownOpen((prev) => !prev)}
                                        className="w-[40px] h-[40px] rounded-[70px] bg-none p-0 mt-[5px]"
                                    >
                                        <img
                                            src={page?.auth?.user?.profile_photo_url}
                                            alt="User"
                                            className="h-full w-full rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                        />
                                    </button>

                                    <UserDropdown open={dropdownOpen} />
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                <main>{children}</main>
                <Modal show={mustChangePassword} closeable={false} maxWidth="md">
                    <div className="p-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Reset Password
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            Please set a new password before using the calling team panel.
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
