import { useAlerts } from '@/Components/Alerts';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { IoMoon } from "react-icons/io5";
import { FaSun } from "react-icons/fa6";

export default function GuestLayout({ children }) {
    const { flash } = usePage().props;
    const { successAlert, errorAlert, warningAlert, infoAlert } = useAlerts();
    useEffect(() => {
        if (flash?.success) {
            successAlert(flash.success);
        }
        if (flash?.error) {
            errorAlert(flash.error);
        }
        if (flash?.warning) {
            warningAlert(flash.success);
        }
        if (flash?.info) {
            infoAlert(flash.error);
        }
    }, [flash])

    const [darkMode, setDarkMode] = useState(() =>
        localStorage.theme === "dark" ||
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

    return (
        <>
            <div className="flex min-h-screen flex-col items-center  bg-gray-100 dark:bg-gray-900 relative px-4 sm:px-6 lg:px-8">

                {/* Login Navbar */}
                <div className="w-full absolute top-0 left-0 flex items-center justify-between p-3 bg-white dark:bg-gray-800 shadow sm:px-8 border-b-2 dark:border-gray-600">

                    {/* Logo */}
                    <Link href={route('home')}>
                        <ApplicationLogo className="h-12 w-12 sm:h-16 sm:w-16 fill-current text-gray-500" />
                    </Link>

                    {/* Dark/Light Toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-xl text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                        {darkMode ? (
                            <FaSun size={18} className="text-gray-200" />
                        ) : (
                            <IoMoon size={18} className="text-gray-800" />
                        )}
                        <span className="text-gray-800 dark:text-gray-100">
                            {darkMode ? "Light" : "Dark"}
                        </span>
                    </button>
                </div>

                {/* Form Container */}
                <div className="mt-24 w-full  px-[10px] md:px-6 py-8 bg-gray-100 dark:bg-gray-900 transition-all duration-300">
                    {children}
                </div>
            </div>
        </>
    );
}
