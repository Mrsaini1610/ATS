import { useState } from 'react';
import { Switch } from '@headlessui/react';
import PrimaryButton from '@/Components/PrimaryButton';
export default function SecurityForm(){
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    return(
        <div>
            <div className='flex flex-col w-full mb-4'>
                <h2 className="text-lg text-start font-medium text-gray-900 dark:text-gray-100">
                    Security Information
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Secure your account with advanced protection settings and monitor all security activities in one place.
                </p>
            </div>


            {/* 2FA */}
            <div className="border-b border-gray-300 pb-4">
                <h3 className="text-lg font-semibold mb-2">Two-Factor Authentication (2FA)</h3>
                <div className="flex items-center justify-between">
                    <span>Enable 2FA for additional security</span>
                    <Switch
                        checked={twoFAEnabled}
                        onChange={setTwoFAEnabled}
                        className={`${
                            twoFAEnabled ? 'bg-blue-600' : 'bg-gray-300'
                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                    >
                        <span
                            className={`${
                                twoFAEnabled ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                        />
                    </Switch>
                </div>
                {twoFAEnabled && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        OTP will be sent to your registered email.
                    </div>
                )}
            </div>

            {/* Password */}
            <div className="border-b border-gray-300 pb-4 mt-4">
                <h3 className="text-lg font-semibold">Password</h3>
                <p className="text-sm">Last changed: March 15, 2025</p>
                {/* <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Change Password
                </button> */}
                <PrimaryButton className='mt-3'>Change Password</PrimaryButton>
            </div>

            {/* Login Activity */}
            <div className="border-b border-gray-300 pb-4 mt-4">
                <h3 className="text-lg font-semibold mb-2">Recent Login Activity</h3>
                <ul className="text-sm space-y-1">
                    <li>📍 Jaipur · Chrome · Success · 27 May 2025 - 11:32 AM</li>
                    <li>📍 Delhi · Safari · Failed · 26 May 2025 - 10:15 PM</li>
                    <li>📍 Chennai · Firefox · Success · 25 May 2025 - 09:44 AM</li>
                </ul>
            </div>

            {/* Device Management */}
            <div className="border-b border-gray-300 pb-4 mt-4">
                <h3 className="text-lg font-semibold">Active Devices</h3>
                <ul className="text-sm space-y-1">
                    <li>🖥️ Chrome on Windows (current)</li>
                    <li>📱 Safari on iPhone</li>
                </ul>
                {/* <button className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    Logout from All Devices
                </button> */}
                <PrimaryButton className='mt-3'>Logout from All Devices</PrimaryButton>
            </div>

            {/* KYC Status */}
            <div className="border-b border-gray-300 pb-4 mt-4">
                <h3 className="text-lg font-semibold">KYC Verification</h3>
                <p className="text-sm text-yellow-500">Status: Pending</p>
                {/* <button className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                    View KYC Details
                </button> */}

                <PrimaryButton className='mt-3'>View KYC Details</PrimaryButton>
            </div>

            {/* Security Question */}
            <div className='mt-4'>
                <h3 className="text-lg font-semibold">Security Question</h3>
                <p className="text-sm">You haven't set up any recovery questions.</p>
                {/* <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    Set Security Question
                </button> */}

                 <PrimaryButton className='mt-3'>Set Security Question</PrimaryButton>
            </div>
        </div>
    )
}