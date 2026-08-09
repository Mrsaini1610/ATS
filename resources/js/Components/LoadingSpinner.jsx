import React from 'react';

const LoadingSpinner = ({ message = "Loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center py-8">
            <svg
                className="animate-spin h-10 w-10 text-blue-500 dark:text-blue-300"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
            </svg>
            <span className="mt-4 text-blue-600 dark:text-blue-300 font-medium text-base">
                {message}
            </span>
        </div>
    );
};

export default LoadingSpinner;
