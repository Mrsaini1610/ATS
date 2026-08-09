import { usePage } from '@inertiajs/react';

export default function DataNotExist({ className = '' }) {
    const { auth } = usePage().props; // 👈 get auth user from global props


    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <div className="flex justify-center">
                <img src="/images/common/data_not_found.png" className="w-40 md:w-52" alt="Data Not Found" />
            </div>
            <h5 className="block text-xl font-semibold leading-snug tracking-normal text-gray-900 dark:text-white">
                {/* Sorry, {auth?.user?.name || 'User'} data does not exist. */}
                Sorry, data does not exist.
            </h5>
        </div>
    );
}
