import { useAlerts } from "@/Components/Alerts";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import { useHelpers } from "@/Components/Helpers";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";
import { IoMoon } from "react-icons/io5";
import { FaChevronDown, FaSun } from "react-icons/fa6";
import { FaBell } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import { route } from "ziggy-js";
import UserDropdown from "./UserDropdown";
import Sidebar from "./Sidebar";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NavDropdown from "@/Components/NavDropdown";

export default function AuthenticatedLayout({ header, children }) {
    const { hasPermissionLike, hasPermission, hasAnyPermission } = useHelpers();
    const user = usePage().props;
    const guard = user?.auth?.guard;
    const permissions = usePage().props.auth?.permissions ?? [];
    const { successAlert, errorAlert, warningAlert, infoAlert } = useAlerts();
    const { ziggy, flash, errors, messages } = usePage().props;
    const { url } = usePage();
    useEffect(() => {
        if (errors) {
            Object.entries(errors).forEach(([key, value]) => {
                errorAlert(value);
            });
        }
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
    const toggleSidebar = () => setSidebarOpen((prev) => !prev);
    const dropdownRef = useRef(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
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
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = () => setSidebarOpen(false);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    const isInitialMount = useRef(true);

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

    //     if (isInitialMount.current || settings == null) {
    //         fetchSettings();
    //         isInitialMount.current = false;
    //     }
    // }, [settings]);
    return (
        <>
                    <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        <div className="min-h-screen dark:bg-[#0a0e25] bg-gray-100">
            <nav className="border-b border-gray-300 dark:border-blue-950 dark:bg-[#0a0e25] bg-gray-100 fixed top-0 left-0 right-0 z-50 print:hidden">
                <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 ">
                    <div className="flex h-16 justify-between border-gray-200 dark:border-gray-700 ">
                        <div className="flex items-center gap-[45px] ">
                             <button
                                            onClick={toggleSidebar}
                                            className="flex xl:hidden items-center justify-center bg-white dark:bg-[#61CC681A] w-[48px] h-[38px] border-[1px] border-[#0000001A] dark:border-[#61CC681A] rounded-[8px] transition md:flex text-current focus:outline-none"
                                        >
                                            <svg
                                                className="w-6 h-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M4 6h16M4 12h16M4 18h16"
                                                />{" "}
                                            </svg>
                                        </button>
                            <div className="flex shrink-0 items-center">
                                <Link href={route("member.dashboard")}>
                                    <ApplicationLogo  props={settings} className="block w-auto fill-current text-gray-800 dark:text-gray-200" />
                                </Link>
                            </div>
                            <div className="hidden xl:flex items-center space-x-8 ms-10">
                                <NavLink
                                    href={route("member.dashboard")}
                                    active={route().current("member.dashboard")}
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    href={route('member.jobs.index')}
                                    active={route().current('member.jobs.index')}
                                >
                                    Browse Jobs
                                </NavLink>
                                <NavLink
                                    href={route("member.applications.index")}
                                    active={route().current("member.applications.index")}
                                >
                                    My Applications
                                </NavLink>
                                <NavLink
                                    href={route("member.task.dashboard")}
                                    active={
                                        route().current(
                                            "member.task.dashboard"
                                        ) ||
                                        route().current("member.task.tasklist")
                                    }
                                >
                                    Tasks
                                </NavLink>
                            </div>
                        </div>



                         <div className="flex items-center gap-2 relative">
                                    <div className="flex items-center gap-2 relative">


                                        <button
                                            onClick={() =>
                                                setDarkMode(!darkMode)
                                            }
                                            className="flex  items-center justify-center bg-white  dark:bg-[#61CC681A] w-[48px] h-[38px] border-[1px] border-[#0000001A] dark:border-[#61CC681A] rounded-[8px]  transition md:flex text-[currentColor] dark:text-[currentColor] "
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
                                                        stroke-width="2"
                                                        stroke-miterlimit="10"
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                    />
                                                    <path
                                                        d="M13.5 8.5C13.5 12.5 11 13 8.5 13C8.5 15 11.75 17 14.5 15C17.25 13 15.5 8.5 13.5 8.5Z"
                                                        stroke="currentColor"
                                                        stroke-width="2"
                                                        stroke-miterlimit="10"
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                    />
                                                </svg>
                                            )}
                                            <span className="text-gray-800 dark:text-gray-100">
                                                {darkMode ? "" : ""}
                                            </span>
                                        </button>

                                        <div
                                            className="relative"
                                            ref={dropdownRef}
                                        >
                                            <button
                                                onClick={() =>
                                                    setDropdownOpen(
                                                        !dropdownOpen
                                                    )
                                                }
                                                className="w-[40px] h-[40px] rounded-[70px] bg-none p-0 mt-[5px] focus:outline-none"
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
                        <div className="-me-2 flex items-center sm:hidden gap-2">
                            <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-1 rounded-xl text-xl text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition cursor-pointer ">
                            </div>
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-400 dark:focus:bg-gray-900 dark:focus:text-gray-400"
                            >
                                <GiHamburgerMenu className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                            </button>
                        </div>
                    </div>
                </div>
                <div
                    className={
                        (showingNavigationDropdown ? "block" : "hidden") +
                        " sm:hidden"
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route("member.dashboard")}
                            active={route().current("member.dashboard")}
                        >
                            Dashboard
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
                        <div className="mt-3 space-y-1">
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
            <Toaster position="top-right" reverseOrder={false} gutter={8} />
        </div>
        </>
    );
}
