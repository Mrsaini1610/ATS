import Modal from "@/Components/Modal";
import { useForm } from "@inertiajs/react";
import { useState } from "react";
import { MdOutlineRestorePage } from "react-icons/md";

export default function RestoreUserAction({ update, btntext, btnclasses, action, paylod = null, tooltip = null, message = "Are you sure to restore this?", refreshAction = () => { } }) {
    const { data, post, errors, processing } = useForm(paylod);
    const [open, setOpen] = useState(false);
    const handleRestore = (e) => {
        e.preventDefault();
        post(action, {
            preserveScroll: true,
            onSuccess: (resp) => {
                update && update();
                setOpen(false);
                refreshAction();
            }
        });
    }
    return (
        <>
            <button type="button" className={btnclasses ? btnclasses : "w-10 h-10 flex items-center justify-center rounded-lg hover:bg-red-900 dark:hover:bg-red/10 text-gray-900 dark:text-gray-200 hover:text-white transition duration-150"} data-tooltip-target={tooltip} onClick={(e) => setOpen(true)}>
                {btntext ? btntext :
                    <MdOutlineRestorePage className="w-4 h-4"/>}
            </button>

            <Modal show={open} maxWidth="sm" zindex={'99999'}>
                <div className="p-4 md:p-5 text-center dark:bg-gray-700">
                    <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">{message}</h3>
                    <span className="text-xs text-red-600 mb-4">{errors?.message}</span>
                    <form onSubmit={handleRestore} method="post" className="inline-flex items-center">
                        <button type="submit" className="text-white bg-red-600 hover:bg-red-800 focus:ring-0 focus:outline-none dark:focus:ring-0 font-medium rounded-lg text-sm px-5 py-2.5 text-center" disabled={processing}>
                            {processing ? 'Restoring...' : 'Yes, I\'m sure'}
                        </button>
                    </form>
                    <button onClick={(e) => setOpen(false)} type="button" className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-tks-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">No, cancel</button>
                </div>
            </Modal>
        </>
    )
}
