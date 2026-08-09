import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IoCloseSharp } from "react-icons/io5";

export default function Modal({
    zindex,
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
    topCloseButton = false,
    handleTopClose = () => {},
    className = ''
}) {
    const close = () => {
        if (closeable) {
            onClose();
            handleTopClose();
        }
    };

    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
        '3xl': 'sm:max-w-3xl',
        '4xl': 'sm:max-w-4xl',
        '5xl': 'sm:max-w-5xl',
        '6xl': 'sm:max-w-6xl',
        '7xl': 'sm:max-w-7xl',

    }[maxWidth];

    return (
        <Transition show={show} as={Fragment} leave="duration-200">
            <Dialog
                as="div"
                id="modal"
                className={`fixed backdrop-blur-sm inset-0 flex flex-col overflow-y-auto px-4 py-6 sm:px-0 items-center
                    justify-center ${zindex ? `z-[${zindex}]` : "z-[50]"} transform transition-all`}
                onClose={close}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0 bg-gray-500/75 dark:bg-gray-900/80" />
                </Transition.Child>

                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <Dialog.Panel
                        className={`relative bg-white dark:bg-[#080626] rounded-lg overflow-hidden shadow-xl transform transition-all w-full sm:mx-auto ${maxWidthClass} ${className}`}
                    >
                        {topCloseButton && (
                            <button
                                type="button"
                                className="absolute top-4 right-4 z-[60] w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={close}
                            >
                                <IoCloseSharp className="text-xl text-gray-600 dark:text-gray-400" />
                            </button>
                        )}

                        <div className="max-h-[calc(100vh-3rem)] overflow-y-auto">
                            <div className={`p-[10px] md:p-[15px] dark:text-gray-100 ${topCloseButton ? "pr-12 md:pr-14" : ""}`}>
                                {children}
                            </div>
                        </div>
                    </Dialog.Panel>
                </Transition.Child>
            </Dialog>
        </Transition>
    );
}
