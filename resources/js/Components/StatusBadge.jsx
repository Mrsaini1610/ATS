// StatusBadge.jsx
import { FaCheck, FaTimes, FaHistory } from "react-icons/fa";

export default function StatusBadge({ status }) {
    const statusClasses = {
        completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    };

    const statusIcons = {
        completed: <FaCheck className="inline ml-1" />,
        pending: <FaHistory className="inline ml-1" />,
        overdue: <FaTimes className="inline ml-1" />,
        in_progress: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="inline ml-1 animate-spin"
            >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
        ),
    };

    const statusText = {
        completed: "Completed",
        pending: "Pending",
        overdue: "Overdue",
        in_progress: "In Progress",
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs ${statusClasses[status]}`}>
            {statusText[status]}
            {statusIcons[status]}
        </span>
    );
}
