import PrimaryButton from "@/Components/PrimaryButton";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";

export default function Login({ status }) {
    const [selectedOption, setSelectedOption] = useState(null);

    const handleAdminLogin = () => {
        window.location.href = route('login');
    };

    const handleSuperAdminLogin = () => {
        window.location.href = route('login');
    };

    return (
        <GuestLayout>
            <Head title="Login Options" />
            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="w-full flex flex-col items-center max-w-md mx-auto bg-gray-100 dark:bg-gray-900 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">
                    Select Login Type
                </h2>

                <div className="w-full space-y-4">
                    <PrimaryButton
                        className="w-full justify-center py-3 text-lg"
                        onClick={handleAdminLogin}
                    >
                        Login as Admin/Member
                    </PrimaryButton>

                    <PrimaryButton
                        className="w-full justify-center py-3 text-lg bg-purple-600 hover:bg-purple-700 focus:bg-purple-700"
                        onClick={handleSuperAdminLogin}
                    >
                        Login as Super Admin
                    </PrimaryButton>
                </div>

                <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                    Select your login type to continue
                </div>
            </div>
        </GuestLayout>
    );
}
