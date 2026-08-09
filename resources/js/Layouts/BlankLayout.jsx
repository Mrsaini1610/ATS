import { useAlerts } from '@/Components/Alerts';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { IoMoon } from "react-icons/io5";
import { FaSun } from "react-icons/fa6";

export default function BlankLayout({ children }) {
    const { flash } = usePage().props;
    const { successAlert, errorAlert, warningAlert, infoAlert } = useAlerts();

    useEffect(() => {
        if (flash?.success) successAlert(flash.success);
        if (flash?.error) errorAlert(flash.error);
        if (flash?.warning) warningAlert(flash.warning);
        if (flash?.info) infoAlert(flash.info);
    }, [flash]);

    // Default to light mode
    const [darkMode, setDarkMode] = useState(() => localStorage.theme === "light");

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
        <div className="flex min-h-screen flex-col items-center bg-gray-100 dark:bg-gray-900 relative px-4 sm:px-6 lg:px-8">
            <div className="mt-24 w-full px-6 py-8 bg-gray-100 dark:bg-gray-900 transition-all duration-300">
                {children}
            </div>
        </div>
    );
}
