import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { MdOutlineNavigateNext, MdOutlineSecurity } from "react-icons/md";
import { FaEdit, FaExchangeAlt, FaRegUser } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { CiSettings } from "react-icons/ci";
import { GiHamburgerMenu } from "react-icons/gi";
import UserProfileForm from './Partials/UserProfileForm';
import UpdateProfileInformation from './Partials/UpdateProfileInformationForm';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import SecurityForm from './Partials/SecurityForm';
import { useState } from 'react';
import SettingForm from './Partials/SettingForm';

export default function Edit({ mustVerifyEmail, status }) {
     const [selectedTab, setSelectedTab] = useState('user-info');
    const renderContent = () => {
        switch (selectedTab) {
            case 'user-info':
                return <UserProfileForm />;
            case 'edit-info':
                return <UpdateProfileInformation />;
            case 'change-password':
                return <UpdatePasswordForm />;
            case 'delete-account':
                return <DeleteUserForm />;
            case 'security':
                return <SecurityForm />;
            case 'settings':
                return <SettingForm />;
            default:
                return <div>Select a section</div>;
        }
    };
    return (
        <AuthenticatedLayout>
            <Head title="Profile" />

            <div className="py-6 flex  md:pt-[132px] pt-[145px] items-start flex-col md:flex-row px-5">
                {/* Sidebar */}
                <div className="w-full md:w-auto flex md:flex-col  items-center md:ml-0 md:mr-1 py-5 px-7 rounded-lg gap-5 text-lg bg-white dark:bg-gray-800 overflow-x-auto overflow-hidden">
                    <h2 className="flex items-center justify-between w-full md:pb-3 md:border-b-2 border-gray-200 dark:border-gray-600 md:mb-3 text-2xl"><GiHamburgerMenu /> <MdOutlineNavigateNext className="text-2xl" /></h2>
                    <button className="whitespace-nowrap px-6 py-1 w-full text-start rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-3" onClick={() => setSelectedTab('user-info')}><FaRegUser /> User Info</button>
                    <button className="whitespace-nowrap px-6 py-1 w-full text-start rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-3" onClick={() => setSelectedTab('edit-info')}><FaEdit /> Info Edit</button>
                    <button className="whitespace-nowrap px-6 py-1 w-full text-start rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-3" onClick={() => setSelectedTab('change-password')}><FaExchangeAlt /> Password change</button>
                    <button className="whitespace-nowrap px-6 py-1 w-full text-start rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-3" onClick={() => setSelectedTab('delete-account')}><MdDelete />Delete Account</button>
                    <button className="whitespace-nowrap px-6 py-1 w-full text-start rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-3" onClick={() => setSelectedTab('security')}><MdOutlineSecurity />Security</button>
                    <button className="whitespace-nowrap px-6 py-1 w-full text-start rounded-lg bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-3" onClick={() => setSelectedTab('settings')}><CiSettings />Settings</button>
                </div>

                {/* Right Content */}
                <div className="md:ml-5 mt-3 md:mt-0  w-full md:flex-1 ">
                    {/* <div className="h-full w-full bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                        <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} className="w-full" />
                    </div> */}

                    <div className="h-full w-full bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                         {renderContent()}
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
