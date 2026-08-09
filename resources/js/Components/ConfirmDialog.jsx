import { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner"; // adjust path

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    message = "Are you sure you want to proceed?",
    confirmText = "Yes, I'm sure",
    cancelText = "No, cancel",
    modalSpinnerMessage = "Processing Please Wait...."
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "auto";
        if (!isOpen) setIsSubmitting(false); // reset state on close
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        try {
            setIsSubmitting(true);
            await onConfirm(); // make sure parent returns a promise
        } catch (err) {
            console.error("Error during confirm:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed z-50 inset-0 backdrop-blur-sm bg-black bg-opacity-50 dark:bg-opacity-70 overflow-y-auto h-full w-full px-4">
            <div className="relative top-40 mx-auto shadow-xl rounded-md bg-white dark:bg-gray-800 max-w-md transition-all duration-300">
                <div className="flex justify-end p-2">
                    <button
                        onClick={onClose}
                        type="button"
                        className="text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                        disabled={isSubmitting}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>

                <div className="p-2 md:p-6 pt-0 text-center">
                    {isSubmitting ? (
                        <LoadingSpinner message={modalSpinnerMessage} />
                    ) : (
                        <>
                            <svg className="w-20 h-20 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>

                            <h3 className="text-xl font-normal text-gray-700 dark:text-gray-200 mt-5 mb-6">
                                {message}
                            </h3>

                            <button
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                                className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-500 font-medium rounded-lg text-base inline-flex items-center px-4 py-2.5 mr-2 transition-all"
                            >
                                {confirmText}
                            </button>

                            <button
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:ring-4 focus:ring-cyan-200 dark:focus:ring-cyan-700 border border-gray-200 dark:border-gray-600 font-medium inline-flex items-center rounded-lg text-base px-4 py-2.5 transition-all"
                            >
                                {cancelText}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
