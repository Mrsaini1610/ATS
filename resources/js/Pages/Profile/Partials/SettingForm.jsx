import { useState } from 'react';
export default function SettingForm() {
    const [formData, setFormData] = useState({
        theme: 'dark',
        language: 'English',
        emailNotifications: true,
        smsNotifications: false,
        inAppNotifications: true,
        dataSharing: false,
        privacy: 'limited',
        autoLogout: '10',
        contrastMode: false,
        fontSize: 'medium',
    });

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };
    return (
        <div>
            <div className='flex flex-col w-full border-b-2 border-gray-200 dark:border-gray-600 pb-3'>
                <h2 className="text-lg text-start font-medium text-gray-900 dark:text-gray-100">
                    Setting's
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Customize your account preferences and control your user experience from the settings panel.
                </p>
            </div>


            {/* Theme */}
            <div className="w-full flex flex-col justify-start items-start mt-2">
                <label className="font-medium text-gray-700 dark:text-gray-300">Theme</label>
                <select name="theme" value={formData.theme} onChange={handleChange} className="mt-2  md:w-1/2 w-full  rounded border dark:bg-gray-700 dark:text-white">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </div>

            {/* Language */}
            <div className="w-full flex flex-col justify-start items-start mt-2 border-b-2 border-gray-200 dark:border-gray-600 pb-3">
                <label className="font-medium text-gray-700 dark:text-gray-300">Language</label>
                <select name="language" value={formData.language} onChange={handleChange} className="mt-2 md:w-1/2 w-full  rounded border dark:bg-gray-700 dark:text-white">
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Tamil</option>
                    <option>Marathi</option>
                </select>
            </div>

            {/* Notifications */}
            <div className=" space-y-2 mt-3 border-b-2 border-gray-200 dark:border-gray-600 pb-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Notifications</h3>
                {['emailNotifications', 'smsNotifications', 'inAppNotifications'].map((key) => (
                    <label key={key} className="md:w-1/2 w-full flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300 capitalize">
                            {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <input
                            type="checkbox"
                            name={key}
                            checked={formData[key]}
                            onChange={handleChange}
                            className="form-checkbox h-5 w-5 text-gray-500 "
                        />
                    </label>
                ))}
            </div>

            {/* Data Sharing */}
            <label className="md:w-1/2 w-full flex items-center justify-between mt-4">
                <span className="text-gray-700 dark:text-gray-300">Allow Data Sharing</span>
                <input
                    type="checkbox"
                    name="dataSharing"
                    checked={formData.dataSharing}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-gray-500"
                />
            </label>

            {/* Privacy Level */}
            <div className="flex flex-col mt-2 justify-start items-start">
                <label className="font-medium text-gray-700 dark:text-gray-300">Privacy</label>
                <select name="privacy" value={formData.privacy} onChange={handleChange} className="mt-2 md:w-1/2 w-full p-2 rounded border dark:bg-gray-700 dark:text-white">
                    <option value="public">Public</option>
                    <option value="limited">Limited</option>
                    <option value="private">Private</option>
                </select>
            </div>

            {/* Auto Logout */}
            <div className="flex flex-col mt-2 justify-start items-start border-b-2 border-gray-200 dark:border-gray-600 pb-3">
                <label className="font-medium text-gray-700 dark:text-gray-300">Auto Logout (min)</label>
                <select name="autoLogout" value={formData.autoLogout} onChange={handleChange} className="mt-2  md:w-1/2 w-full p-2 rounded border dark:bg-gray-700 dark:text-white">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="30">30</option>
                </select>
            </div>

            {/* Accessibility */}
            <div className="space-y-2 mt-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Accessibility</h3>
                <label className="flex items-center justify-between md:w-1/2 w-full">
                    <span className="text-gray-700 dark:text-gray-300">High Contrast Mode</span>
                    <input
                        type="checkbox"
                        name="contrastMode"
                        checked={formData.contrastMode}
                        onChange={handleChange}
                        className="form-checkbox h-5 w-5 text-gray-500"
                    />
                </label>

                <div className="flex flex-col  justify-start items-start">
                    <label className="font-medium text-gray-700 dark:text-gray-300">Font Size</label>
                    <select name="fontSize" value={formData.fontSize} onChange={handleChange} className="mt-2  md:w-1/2 w-full p-2 rounded border dark:bg-gray-700 dark:text-white">
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>
                </div>
            </div>
        </div>
    )
}