import { useAlerts } from "@/Components/Alerts";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import { useHelpers } from "@/Components/Helpers";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState, useContext } from "react";
import { Toaster } from "react-hot-toast";
import { IoMoon } from "react-icons/io5";
import { FaChevronDown, FaSun } from "react-icons/fa6";
import { FaBell } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import { SettingsProvider, useSettings } from "@/Components/SettingsProvider";
import UserDropdown from "./UserDropdown";
import Sidebar from "./Sidebar";
import { route } from "ziggy-js";
import { SlDocs } from "react-icons/sl";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NavDropdown from "@/Components/NavDropdown";

function isValidationError(error) {
    return typeof error == "object" && error !== null;
}

export default function AuthenticatedLayout({ header, children }) {
    const { hasPermissionLike, hasPermission, hasAnyPermission } = useHelpers();
    const user = usePage().props;
    const permissions = usePage().props.auth?.permissions ?? [];

    const { successAlert, errorAlert, warningAlert, infoAlert } = useAlerts();

    const { ziggy, flash, errors, messages } = usePage().props;
    const { url } = usePage();

    useEffect(() => {
        if (flash?.success) successAlert(flash.success);
        if (flash?.error && !isValidationError(flash.error))
            errorAlert(flash.error);
        if (flash?.warning) warningAlert(flash.warning);
        if (flash?.info) infoAlert(flash.info);
        if (messages?.envelopes?.length > 0) {
            messages.envelopes.forEach(({ type, message }) => {
                switch (type) {
                    case "success":
                        successAlert(message);
                        break;
                    case "error":
                        if (!isValidationError(message)) errorAlert(message);
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

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [darkMode, setDarkMode] = useState(
        () =>
            localStorage.theme == "dark" ||
            (!("theme" in localStorage) &&
                window.matchMedia("(prefers-color-scheme: dark)").matches)
    );

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

    const [openMenu, setOpenMenu] = useState(null);

    const handleMouseEnter = (menu) => setOpenMenu(menu);
    const handleMouseLeave = () => setOpenMenu(null);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const handleToggle = () => {
        setIsMenuOpen((prev) => !prev);
    };

    // Dropdown
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    // Close dropdown on outside click
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

    // Sidebar
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);
    const closeSidebar = () => setSidebarOpen(false);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    const isInitialMount = useRef(true);

    const [bellOpen, setBellOpen] = useState(false);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);

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

    const superPrefix = (() => {
        if (typeof window === "undefined") return "";
        const path = window.location.pathname || "";
        const idx = path.indexOf("/super/");
        return idx >= 0 ? path.slice(0, idx) : "";
    })();

    const withSuperPrefix = (path) => `${superPrefix}${path}`;

    const getCsrfToken = () => {
        const token = document
            ?.querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");
        return token || "";
    };

    const fetchUnreadCount = async () => {
        try {
            const res = await fetch(withSuperPrefix("/super/notifications/api/unread-count"), {
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
        } catch (e) {}
    };

    const fetchNotifications = async () => {
        setNotificationsLoading(true);
        try {
            const res = await fetch(
                withSuperPrefix("/super/notifications/api/list") + "?per_page=10",
                {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                }
            );
            const payload = await res.json();
            if (payload?.success) {
                const page = payload.data;
                const items = Array.isArray(page?.data) ? page.data : [];
                setNotifications(items);
                setUnreadCount(Number(payload.unread ?? 0));
            }
        } catch (e) {
            setNotifications([]);
        } finally {
            setNotificationsLoading(false);
        }
    };

    const markNotificationRead = async (notificationUuid) => {
        try {
            await fetch(withSuperPrefix(`/super/notifications/api/${notificationUuid}/read`), {
                method: "PATCH",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": getCsrfToken(),
                },
            });
        } catch (e) {}
    };

    const markAllRead = async () => {
        try {
            const res = await fetch(withSuperPrefix("/super/notifications/api/read-all"), {
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
        } catch (e) {}
    };

    const notificationText = (n) => {
        const title = n?.job?.title || n?.data?.title || n?.data?.job_title || "Job";
        switch (n?.type) {
            case "job_created":
                return `New job created: ${title}`;
            case "job_resubmitted":
                return `Job resubmitted: ${title}`;
            case "job_pending":
                return `Job pending: ${title}`;
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

    // useEffect(() => {
    //     const fetchSettings = async () => {
    //         try {
    //             const response = await axios.get(route("super.settings.list"));
    //             setSettings(response.data.settings);
    //         } catch (error) {
    //             console.error("Error fetching settings:", error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     if (isInitialMount.current || settings === null) {
    //         fetchSettings();
    //         isInitialMount.current = false;
    //     }
    // }, [settings]);
    return (
        <>
                <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
                <SettingsProvider>
                    <div className="min-h-screen mainbg">
                        <nav className="headerbg fixed top-0 left-0 right-0 z-50 py-[15px] px-[15px] rounded-[10px] print:hidden">
                            <div className="navbg rounded-[10px] border border-[1px]  borderbx ">
                                <div className="mx-auto max-w-full px-[8px] py-[0]  ">
                                    <div className="flex h-16 justify-between border-gray-200 dark:border-gray-700 ">
                                        <div className="flex gap-[45px] items-center">
                                            {/* Logo */}
                                            <button
                                                onClick={toggleSidebar}
                                                className="flex xl:hidden items-center justify-center bg-white dark:bg-[#61CC681A] w-[40px] h-[40px] border-[1px] border-[#0000001A] dark:border-[#61CC681A] rounded-[8px] transition text-[currentColor] dark:text-[currentColor] focus:outline-none hover:bg-gray-100 dark:hover:bg-[#61CC6820]"
                                                aria-label="Toggle sidebar"
                                            >
                                                <svg
                                                    className="w-6 h-6"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4 6h16M4 12h16M4 18h16"
                                                    />
                                                </svg>
                                            </button>

                                            {/* Logo */}
                                            <div className="flex shrink-0 items-center">
                                                <Link
                                                    href={route(
                                                        "super.dashboard"
                                                    )}
                                                >
                                                    <ApplicationLogo
                                                        props={settings}
                                                        className="block w-auto fill-current"
                                                    />
                                                </Link>
                                            </div>
{/* Navigation Links */}
<div className="hidden xl:flex items-center gap-3 xl:gap-4">

    {/* Dashboard */}
    <NavLink
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            route().current("super.dashboard")
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        href={route("super.dashboard")}
        active={route().current("super.dashboard")}
    >
        Dashboard
    </NavLink>

    {/* Roles */}
    {/* <NavLink
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            route().current("super.role.list")
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        href={route("super.role.list")}
        active={route().current("super.role.list")}
    >
        Roles
    </NavLink> */}

    {/* Departments */}
    <NavLink
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            route().current("super.departments")
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        href={route("super.departments")}
        active={route().current("super.departments")}
    >
        Departments
    </NavLink>

    {/* Designations */}
    <NavLink
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            route().current("super.designation.list")
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        href={route("super.designation.list")}
        active={route().current("super.designation.list")}
    >
        Designations
    </NavLink>

    {/* Members */}
    <NavLink
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            route().current("super.members.list") ||
            route().current("super.members.details")
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        href={route("super.members.list")}
        active={
            route().current("super.members.list") ||
            route().current("super.members.details")
        }
    >
        Members
    </NavLink>

    {/* Job Requests */}
    <NavLink
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            route().current("super.job.requests.index")
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        href={route("super.job.requests.index")}
        active={route().current("super.job.requests.index")}
    >
        Job Requests
    </NavLink>

    {/* All Jobs */}
    <NavLink
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            route().current("super.job.requests.all.jobs")
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        href={route("super.job.requests.all.jobs")}
        active={route().current("super.job.requests.all.jobs")}
    >
        All Jobs
    </NavLink>

    {/* Job Applications */}
    <NavLink
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            route().current("super.job.applications.index")
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        href={route("super.job.applications.index")}
        active={route().current("super.job.applications.index")}
    >
        Job Applications
    </NavLink>
</div>
</div>

                                        <div className="flex items-center gap-2 relative">
                                            <DropdownMenu open={bellOpen} onOpenChange={setBellOpen}>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="relative flex items-center justify-center bg-white dark:bg-[#61CC681A] w-[48px] h-[38px] border-[1px] border-[#0000001A] dark:border-[#61CC681A] rounded-[8px] transition text-[currentColor] dark:text-[currentColor]"
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
                                                            {notifications.map((n) => (
                                                                <DropdownMenuItem
                                                                    key={n.uuid}
                                                                    className="flex flex-col items-start gap-1 py-3 cursor-pointer"
                                                                    onSelect={async (e) => {
                                                                        e.preventDefault();
                                                                        await markNotificationRead(n.uuid);
                                                                        setUnreadCount((prev) =>
                                                                            Math.max(
                                                                                0,
                                                                                prev -
                                                                                    (n.status === "unread" &&
                                                                                    !n.viewed_at
                                                                                        ? 1
                                                                                        : 0)
                                                                            )
                                                                        );
                                                                        setNotifications((prev) =>
                                                                            prev.map((x) =>
                                                                                x.uuid === n.uuid
                                                                                    ? {
                                                                                          ...x,
                                                                                          status: "read",
                                                                                          viewed_at:
                                                                                              x.viewed_at ??
                                                                                              new Date().toISOString(),
                                                                                      }
                                                                                    : x
                                                                            )
                                                                        );
                                                                         window.location.href = withSuperPrefix(
                                                                             "/super/job-requests"
                                                                         );
                                                                    }}
                                                                >
                                                                    <div className="w-full flex items-start justify-between gap-2">
                                                                        <div
                                                                            className={
                                                                                "text-sm " +
                                                                                (n.status === "unread" &&
                                                                                !n.viewed_at
                                                                                    ? "font-semibold"
                                                                                    : "font-normal")
                                                                            }
                                                                        >
                                                                            {notificationText(n)}
                                                                        </div>
                                                                        {n.status === "unread" && !n.viewed_at && (
                                                                            <span className="mt-[6px] w-2 h-2 rounded-full bg-blue-600" />
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {formatRelativeTime(n.created_at)}
                                                                    </div>
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </div>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            <button
                                                onClick={() =>
                                                    setDarkMode(!darkMode)
                                                }
                                                className="flex items-center justify-center bg-white dark:bg-[#61CC681A] w-[48px] h-[38px] border-[1px] border-[#0000001A] dark:border-[#61CC681A] rounded-[8px] transition md:flex text-[currentColor] dark:text-[currentColor]"
                                            >
                                                {darkMode ? (
                                                    <FaSun
                                                        size={18}
                                                        className="text-gray-200"
                                                    />
                                                ) : (
                                                    <svg
                                                        width="24"
                                                        height="24"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M12.0015 2L14.6365 4.635H19.365V9.363L22 11.998L19.365 14.637V19.365H14.637L12.002 22L9.363 19.365H4.635V14.637L2 11.9985L4.635 9.3635V4.635H9.363L12.0015 2Z"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeMiterlimit="10"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                        <path
                                                            d="M13.5 8.5C13.5 12.5 11 13 8.5 13C8.5 15 11.75 17 14.5 15C17.25 13 15.5 8.5 13.5 8.5Z"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeMiterlimit="10"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                )}
                                            </button>

                                            {/* Settings button */}
                                            <div className="relative">
                                                <a

                                                >
                                                    <button
                                                        className="w-[30px] h-[30px] rounded-full p-0 mt-[5px] focus:outline-none overflow-hidden
                bg-transparent text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            width="24"
                                                            height="24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="1.5"
                                                        >
                                                            <path d="M15.5 12C15.5 13.933 13.933 15.5 12 15.5C10.067 15.5 8.5 13.933 8.5 12C8.5 10.067 10.067 8.5 12 8.5C13.933 8.5 15.5 10.067 15.5 12Z" />
                                                            <path
                                                                d="M21.011 14.0965C21.5329 13.9558 21.7939 13.8854 21.8969 13.7508C22 13.6163 22 13.3998 22 12.9669V11.0332C22 10.6003 22 10.3838 21.8969 10.2493C21.7938 10.1147 21.5329 10.0443 21.011 9.90358C19.0606 9.37759 17.8399 7.33851 18.3433 5.40087C18.4817 4.86799 18.5509 4.60156 18.4848 4.44529C18.4187 4.28902 18.2291 4.18134 17.8497 3.96596L16.125 2.98673C15.7528 2.77539 15.5667 2.66972 15.3997 2.69222C15.2326 2.71472 15.0442 2.90273 14.6672 3.27873C13.208 4.73448 10.7936 4.73442 9.33434 3.27864C8.95743 2.90263 8.76898 2.71463 8.60193 2.69212C8.43489 2.66962 8.24877 2.77529 7.87653 2.98663L6.15184 3.96587C5.77253 4.18123 5.58287 4.28891 5.51678 4.44515C5.45068 4.6014 5.51987 4.86787 5.65825 5.4008C6.16137 7.3385 4.93972 9.37763 2.98902 9.9036C2.46712 10.0443 2.20617 10.1147 2.10308 10.2492C2 10.3838 2 10.6003 2 11.0332V12.9669C2 13.3998 2 13.6163 2.10308 13.7508C2.20615 13.8854 2.46711 13.9558 2.98902 14.0965C4.9394 14.6225 6.16008 16.6616 5.65672 18.5992C5.51829 19.1321 5.44907 19.3985 5.51516 19.5548C5.58126 19.7111 5.77092 19.8188 6.15025 20.0341L7.87495 21.0134C8.24721 21.2247 8.43334 21.3304 8.6004 21.3079C8.76746 21.2854 8.95588 21.0973 9.33271 20.7213C10.7927 19.2644 13.2088 19.2643 14.6689 20.7212C15.0457 21.0973 15.2341 21.2853 15.4012 21.3078C15.5682 21.3303 15.7544 21.2246 16.1266 21.0133L17.8513 20.034C18.2307 19.8187 18.4204 19.711 18.4864 19.5547C18.5525 19.3984 18.4833 19.132 18.3448 18.5991C17.8412 16.6616 19.0609 14.6226 21.011 14.0965Z"
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                    </button>
                                                </a>
                                            </div>

                                            {/* User dropdown */}
                                            <div
                                                className="relative"
                                                ref={dropdownRef}
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent event bubbling
                                                        setDropdownOpen(
                                                            !dropdownOpen
                                                        );
                                                    }}
                                                    className="w-[30px] h-[30px] rounded-full bg-none p-0 mt-[5px] focus:outline-none overflow-hidden"
                                                >
                                                    <img
                                                        src={
                                                            user?.auth?.user
                                                                ?.profile_photo_url ||
                                                            user?.auth
                                                                ?.profile_photo_url
                                                        }
                                                        alt="User"
                                                        className="w-full h-full object-cover rounded-full"
                                                    />
                                                </button>

                                                {/* Dropdown */}
                                                {dropdownOpen && (
                                                    <div
                                                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        } // Prevent clicks inside dropdown from closing it
                                                    >
                                                        <ul className="py-1">
                                                            <li className="border-b border-gray-200 dark:border-gray-700">
                                                                <NavLink
                                                                    href={route(
                                                                        "super.profile"
                                                                    )}
                                                                    method="get"
                                                                    as="button"
                                                                    className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                >
                                                                    Profile
                                                                </NavLink>
                                                            </li>
                                                            <li>
                                                                <NavLink
                                                                    href={route(
                                                                        "super.logout"
                                                                    )}
                                                                    method="post"
                                                                    as="button"
                                                                    className="block w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                >
                                                                    Logout
                                                                </NavLink>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={
                                        (showingNavigationDropdown
                                            ? "block"
                                            : "hidden") + " sm:hidden"
                                    }
                                >
                                    <div className="space-y-1 pb-3 pt-2">
                                        <ResponsiveNavLink
                                            href={route("super.dashboard")}
                                            active={route().current(
                                                "super.dashboard"
                                            )}
                                        >
                                            Dashboard
                                        </ResponsiveNavLink>
                                        <ResponsiveNavLink
                                            href={route("super.job.requests.all.jobs")}
                                            active={route().current(
                                                "super.job.requests.all.jobs"
                                            )}
                                        >
                                            All Jobs
                                        </ResponsiveNavLink>
                                        <ResponsiveNavLink
                                            href={route("super.job.applications.index")}
                                            active={route().current(
                                                "super.job.applications.index"
                                            )}
                                        >
                                            Job Applications
                                        </ResponsiveNavLink>
                                    </div>

                                    <div className="border-t border-gray-200 pb-1 pt-4 dark:border-gray-600">
                                        <div className="px-4">
                                            <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                                                {user?.name}
                                            </div>
                                            <div className="text-sm font-medium text-gray-500">
                                                {user?.email}
                                            </div>
                                        </div>

                                        <div className="mt-3 space-y-1"></div>
                                    </div>
                                </div>
                            </div>
                        </nav>

                        {header && (
                            <header className="bg-white shadow dark:bg-gray-800">
                                <div className="mx-auto max-w-full px-4 py-6 sm:px-6 lg:px-8">
                                    {header}
                                </div>
                            </header>
                        )}

                        <main>{children}</main>

                        <Toaster
                            position="top-right"
                            reverseOrder={false}
                            gutter={8}
                        />
                    </div>
                </SettingsProvider>
        </>
    );
}
