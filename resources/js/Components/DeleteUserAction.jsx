import Modal from "@/Components/Modal";
import { useForm } from "@inertiajs/react";
import { useState } from "react";
import { MdErrorOutline } from "react-icons/md";

export default function DeleteUserAction({
    update,
    btntext,
    btnclasses,
    action,
    paylod = null,
    tooltip = null,
    message = "Are you sure to delete this user?",
    refreshAction = () => { },
}) {
    const { data, post, errors, processing } = useForm(paylod);
    const [open, setOpen] = useState(false);
    const handleDelete = (e) => {
        e.preventDefault();
        post(action, {
            preserveScroll: true,
            onSuccess: (resp) => {
                update && update();
                setOpen(false);
                refreshAction();
            },
        });
    };
    return (
        <>
            <button
                type="button"
                className={
                    btnclasses
                        ? btnclasses
                        : "w-10 h-10 flex items-center justify-center rounded-lg hover:bg-red-600 dark:hover:bg-red/10 text-gray-900 dark:text-gray-200 hover:text-white transition duration-150"
                }
                data-tooltip-target={tooltip}
                onClick={(e) => setOpen(true)}
            >
                {btntext ? (
                    btntext
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                    </svg>
                )}
            </button>

            <Modal show={open} maxWidth="sm" zindex={"99999"} >
                <div className="btn p-4 md:p-5 flex items-center flex-col dark:bg-gray-700">
                    <MdErrorOutline className="h-20 w-20 " />
                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                        {message}
                    </h3>
                    <div>
                        <span className="text-xs text-red-600 mb-4">
                            {errors?.message}
                        </span>
                        <form
                            onSubmit={handleDelete}
                            method="post"
                            className="inline-flex items-center"
                        >
                            <button
                                type="submit"
                                className="text-white bg-red-600 hover:bg-red-800 focus:ring-0 focus:outline-none dark:focus:ring-0 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                disabled={processing}
                            >
                                {processing ? "Deleting..." : "Yes, I'm sure"}
                            </button>
                        </form>
                        <button
                            onClick={(e) => setOpen(false)}
                            type="button"
                            className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-tks-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                        >
                            No, cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
