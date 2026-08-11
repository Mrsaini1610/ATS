import { usePage } from "@inertiajs/react";
import { useHelpers } from "../Helpers";

export default function AuthInfo() {
    const auth = usePage().props.auth.user;
    const { capitalizeWords, hasPermission } = useHelpers();



    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <div className="flex items-center space-x-4">
                <img
                    src={auth?.profile_photo_url}
                    alt="Profile"
                    className="w-20 h-20 rounded-full border"
                />
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{ capitalizeWords(auth?.name) }</h2>
                    <p className="text-sm text-gray-800 dark:text-gray-200">Email: {auth?.email ?? '--'}</p>
                    {auth?.role ? (<>
                        <p className="text-sm text-gray-800 dark:text-gray-200">Role: { capitalizeWords(auth?.role) ?? '--'}</p>
                    </>) : ('')}
                    <p className="text-xs text-gray-600 dark:text-gray-400">Created: {auth?.received_at ?? '--'}</p>
                </div>
            </div>
        </div>
    );
}
