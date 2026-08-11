import React from "react";
import { Link } from "@inertiajs/react";

const linkClass = (active) =>
    `flex items-center gap-[6px] px-[10px] py-[10px] text-[15px] rounded ${
        active
            ? "text-[#4F46E5] dark:text-[#4F46E5] bg-[#4F46E5]/10"
            : "text-[#727272] hover:text-[#4F46E5] dark:hover:text-[#4F46E5]"
    }`;

export default function Sidebar({ isOpen, onClose }) {
    return (
        <div
            className={`fixed top-0 left-0 h-full w-[288px] bg-white dark:bg-[#03011C] text-white transition-transform duration-300 z-[99] shadow-md ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
            <div className="p-4 text-lg font-bold border-b border-gray-200 dark:border-b-[#5146e64a]">
                <div className="block dark:hidden ">
                    <img
                        className="max-w-[120px]"
                        src="/images/logo.png"
                        alt="Logo"
                    />
                </div>
                <div className="hidden dark:block ">
                    <img
                        className="max-w-[120px]"
                        src="/images/logo-dark.png"
                        alt="Logo"
                    />
                </div>

                <button
                    onClick={onClose}
                    className="absolute right-[5px] top-[16px] flex xl:hidden items-center justify-center bg-white dark:bg-[#61CC681A] w-[48px] h-[38px] border-[1px] border-[#0000001A] dark:border-[#61CC681A] rounded-[8px] transition md:flex text-[#000] dark:text-[#fff] focus:outline-none"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>

            <ul className="px-[5px] py-[8px]">
                <li className="border-b-[1px] border-b-gray-200 dark:border-b-[#5146e64a]">
                    <Link
                        href={route("callingteam.dashboard")}
                        className={linkClass(route().current("callingteam.dashboard"))}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M8.807 2.75H4.932C3.865 2.75 3 3.615 3 4.682V8.557C3 9.624 3.865 10.499 4.932 10.499H8.807C9.874 10.499 10.749 9.624 10.749 8.557V4.682C10.749 3.615 9.874 2.75 8.807 2.75ZM19.568 2.75H15.693C14.626 2.75 13.751 3.615 13.751 4.682V8.557C13.751 9.624 14.626 10.499 15.693 10.499H19.568C20.635 10.499 21.5 9.624 21.5 8.557V4.682C21.5 3.615 20.635 2.75 19.568 2.75ZM8.807 13.501H4.932C3.865 13.501 3 14.366 3 15.433V19.308C3 20.375 3.865 21.25 4.932 21.25H8.807C9.874 21.25 10.749 20.375 10.749 19.308V15.433C10.749 14.366 9.874 13.501 8.807 13.501ZM19.568 13.501H15.693C14.626 13.501 13.751 14.366 13.751 15.433V19.308C13.751 20.375 14.626 21.25 15.693 21.25H19.568C20.635 21.25 21.5 20.375 21.5 19.308V15.433C21.5 14.366 20.635 13.501 19.568 13.501Z"
                                fill="currentColor"
                            />
                        </svg>
                        Dashboard
                    </Link>
                </li>
                <li className="border-b-[1px] border-b-gray-200 dark:border-b-[#5146e64a]">
                    <Link
                        href={route("callingteam.profile")}
                        className={linkClass(route().current("callingteam.profile"))}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                                fill="currentColor"
                            />
                            <path
                                d="M12 14C7.58172 14 4 17.134 4 21H20C20 17.134 16.4183 14 12 14Z"
                                fill="currentColor"
                            />
                        </svg>
                        Profile
                    </Link>
                </li>
            </ul>
        </div>
    );
}
