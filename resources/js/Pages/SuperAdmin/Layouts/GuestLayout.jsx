import { useAlerts } from '@/Components/Alerts';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { IoMoon } from "react-icons/io5";
import { FaSun } from "react-icons/fa6";

export default function GuestLayout({ children }) {
    const { successAlert, errorAlert, warningAlert, infoAlert } = useAlerts();

    const { ziggy, flash, errors, messages } = usePage().props;
    useEffect(() => {
        if (errors) {
            Object.entries(errors).forEach(([key, value]) => {
                errorAlert(value);
            });
        }

        // 1. Standard Laravel flash messages
        if (flash?.success) successAlert(flash.success);
        if (flash?.error) errorAlert(flash.error);
        if (flash?.warning) warningAlert(flash.warning);
        if (flash?.info) infoAlert(flash.info);

        // 2. Laravel Flasher messages
        if (messages?.envelopes?.length > 0) {
            messages.envelopes.forEach(({ type, message }) => {
                switch (type) {
                    case 'success':
                        successAlert(message);
                        break;
                    case 'error':
                        errorAlert(message);
                        break;
                    case 'warning':
                        warningAlert(message);
                        break;
                    case 'info':
                        infoAlert(message);
                        break;
                    default:
                        console.warn('Unknown message type:', type);
                }
            });
        }
    }, [messages, flash, errors]);

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
                <div className="  w-full  px-6 py-8 bg-gray-100 dark:bg-gray-900 transition-all duration-300">
                    {children}
                </div>
            </div>
        </>
    );
}
