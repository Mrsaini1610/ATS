import AuthenticatedLayout from "../Layouts/AuthenticatedLayout";
import { Head, useForm, router } from "@inertiajs/react";
import { useState, useRef } from "react";
import {
    FaSave,
    FaUpload,
    FaGlobe,
    FaEnvelope,
    FaWhatsapp,
    FaCalendarAlt,
    FaClock,
    FaWrench,
    FaSearch,
    FaUndo,
    FaImage,
    FaTimes,
} from "react-icons/fa";
import { Switch } from "@headlessui/react";

export default function SettingsIndex({ auth, settings, timezones }) {
   const { data, setData, errors, processing, recentlySuccessful } = useForm({
    site_name: settings?.site_name || "",
    site_email: settings?.site_email || "",
    site_phone: settings?.site_phone || "",
    enable_email: settings?.enable_email ?? true,
    enable_whatsapp: settings?.enable_whatsapp ?? true,
    dark_logo_path: settings?.dark_logo_path || null,
    light_logo_path: settings?.light_logo_path || null,
    favicon_path: settings?.favicon_path || null,
    facebook_url: settings?.facebook_url || "",
    twitter_url: settings?.twitter_url || "",
    instagram_url: settings?.instagram_url || "",
    linkedin_url: settings?.linkedin_url || "",
    site_description: settings?.site_description || "",
    timezone: settings?.timezone || "UTC",
    date_format: settings?.date_format || "Y-m-d",
    time_format: settings?.time_format || "H:i:s",
    maintenance_mode: settings?.maintenance_mode || false,
    maintenance_message: settings?.maintenance_message || "",
    meta_title: settings?.meta_title || "",
    meta_description: settings?.meta_description || "",
    meta_keywords: settings?.meta_keywords || "",
    dark_logo_preview: null,
    light_logo_preview: null,
    favicon_preview: null,
});
    const [isSubmittingGeneral, setIsSubmittingGeneral] = useState(false);
    const [isSubmittingContact, setIsSubmittingContact] = useState(false);
    const [isSubmittingSocial, setIsSubmittingSocial] = useState(false);
    const darkLogoRef = useRef();
    const lightLogoRef = useRef();
    const faviconRef = useRef(null);

    const dateFormats = [
        { value: "Y-m-d", label: "YYYY-MM-DD (2023-12-31)" },
        { value: "d/m/Y", label: "DD/MM/YYYY (31/12/2023)" },
        { value: "m/d/Y", label: "MM/DD/YYYY (12/31/2023)" },
        { value: "d M Y", label: "DD Mon YYYY (31 Dec 2023)" },
        { value: "M d, Y", label: "Mon DD, YYYY (Dec 31, 2023)" },
    ];

    const timeFormats = [
        { value: "H:i:s", label: "24-hour (14:30:00)" },
        { value: "h:i:s A", label: "12-hour (02:30:00 PM)" },
    ];

   const handleSubmit = (e, section = null) => {
    e.preventDefault();
    const formData = new FormData();
    switch (section) {
        case "general":
            setIsSubmittingGeneral(true);
            break;
        case "contact":
            setIsSubmittingContact(true);
            break;
        case "social":
            setIsSubmittingSocial(true);
            break;
        default:
            break;
    }
    if (section) {
        const sectionFields = {
            general: [
                "site_name",
                "site_email",
                "site_description",
                "dark_logo",
                "light_logo",
                "favicon",
            ],
            contact: ["site_phone", "enable_email", "enable_whatsapp"],
            social: [
                "facebook_url",
                "twitter_url",
                "instagram_url",
                "linkedin_url",
            ],
            datetime: ["timezone", "date_format", "time_format"],
            maintenance: ["maintenance_mode", "maintenance_message"],
            seo: ["meta_title", "meta_description", "meta_keywords"],
        };

        Object.keys(data).forEach((key) => {
            if (sectionFields[section].includes(key)) {
                if (key == "dark_logo" || key == "light_logo" || key == "favicon") {
                    if (data[key] instanceof File) {
                        formData.append(key, data[key]);
                    }
                } else {
                    formData.append(key, data[key]);
                }
            }
        });
    } else {
        Object.keys(data).forEach((key) => {
            if (key == "dark_logo" || key == "light_logo" || key == "favicon") {
                if (data[key] instanceof File) {
                    formData.append(key, data[key]);
                }
            } else {
                formData.append(key, data[key]);
            }
        });
    }

    router.post(route("super.settings.update"), formData, {
        preserveScroll: true,
        forceFormData: true,
        onFinish: () => {
            switch (section) {
                case "general":
                    setIsSubmittingGeneral(false);
                    break;
                case "contact":
                    setIsSubmittingContact(false);
                    break;
                case "social":
                    setIsSubmittingSocial(false);
                    break;
                default:
                    break;
            }
        },
        onError: () => {
            switch (section) {
                case "general":
                    setIsSubmittingGeneral(false);
                    break;
                case "contact":
                    setIsSubmittingContact(false);
                    break;
                case "social":
                    setIsSubmittingSocial(false);
                    break;
                default:
                    break;
            }
        },
    });
};

    const handleFileChange = (field, e) => {
    if (e.target.files && e.target.files[0]) {
        setData(field, e.target.files[0]);
    }
};
    const resetSection = (section) => {
        const defaultValues = {
            general: {
                site_name: "",
                site_email: "",
                site_description: "",
                logo_path: null,
                favicon_path: null,
            },
            contact: {
                site_phone: "",
                enable_email: true,
                enable_whatsapp: true,
            },
            social: {
                facebook_url: "",
                twitter_url: "",
                instagram_url: "",
                linkedin_url: "",
            },
            datetime: {
                timezone: "UTC",
                date_format: "Y-m-d",
                time_format: "H:i:s",
            },
            maintenance: {
                maintenance_mode: false,
                maintenance_message: "",
            },
            seo: {
                meta_title: "",
                meta_description: "",
                meta_keywords: "",
            },
        };

        setData({
            ...data,
            ...defaultValues[section],
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Site Settings" />

            <div className="min-h-screen py-[40px] memberbg">
                <div className="mt-[64px]">
                    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                        {recentlySuccessful && (
                            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                                Settings updated successfully!
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                        <FaGlobe className="inline mr-2 text-blue-500" />
                                        General Settings
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Basic information about your site
                                    </p>
                                </div>
                                <div className="px-6 py-4">
                                    <form
                                        onSubmit={(e) =>
                                            handleSubmit(e, "general")
                                        }
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
                                            <div className="sm:col-span-3">
                                                <label
                                                    htmlFor="site_name"
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Site Name
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="text"
                                                        id="site_name"
                                                        value={data.site_name}
                                                        onChange={(e) =>
                                                            setData(
                                                                "site_name",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                    />
                                                    {errors.site_name && (
                                                        <p className="mt-2 text-sm text-red-600">
                                                            {errors.site_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="sm:col-span-3">
                                                <label
                                                    htmlFor="site_email"
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Site Email
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="email"
                                                        id="site_email"
                                                        value={data.site_email}
                                                        onChange={(e) =>
                                                            setData(
                                                                "site_email",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                    />
                                                    {errors.site_email && (
                                                        <p className="mt-2 text-sm text-red-600">
                                                            {errors.site_email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="sm:col-span-3">
                                                <label
                                                    htmlFor="dark_logo"
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Dark Logo
                                                </label>
                                                <div className="mt-1">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="relative">
                                                            {data.dark_logo_preview ? (
                                                                <img
                                                                    src={
                                                                        data.dark_logo_preview
                                                                    }
                                                                    alt="Dark Logo Preview"
                                                                    className="h-12 w-auto rounded-md object-contain border border-gray-200 dark:border-gray-600"
                                                                />
                                                            ) : data.dark_logo_path ? (
                                                                <img
                                                                    src={`/storage/${data.dark_logo_path}`}
                                                                    alt="Dark Logo"
                                                                    className="h-12 w-auto rounded-md object-contain border border-gray-200 dark:border-gray-600"
                                                                />
                                                            ) : (
                                                                <div className="h-12 w-12 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                                    <FaImage className="h-5 w-5 text-gray-400" />
                                                                </div>
                                                            )}
                                                            {data.dark_logo_preview && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setData(
                                                                            "dark_logo_preview",
                                                                            null
                                                                        );
                                                                        setData(
                                                                            "dark_logo",
                                                                            null
                                                                        );
                                                                        if (
                                                                            darkLogoRef.current
                                                                        )
                                                                            darkLogoRef.current.value =
                                                                                "";
                                                                    }}
                                                                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 focus:outline-none"
                                                                    title="Remove image"
                                                                >
                                                                    <FaTimes className="h-3 w-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <input
                                                                type="file"
                                                                id="dark_logo"
                                                                ref={
                                                                    darkLogoRef
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    handleFileChange(
                                                                        "dark_logo",
                                                                        e
                                                                    );
                                                                    if (
                                                                        e.target
                                                                            .files &&
                                                                        e.target
                                                                            .files[0]
                                                                    ) {
                                                                        const reader =
                                                                            new FileReader();
                                                                        reader.onload =
                                                                            (
                                                                                event
                                                                            ) => {
                                                                                setData(
                                                                                    "dark_logo_preview",
                                                                                    event
                                                                                        .target
                                                                                        .result
                                                                                );
                                                                            };
                                                                        reader.readAsDataURL(
                                                                            e
                                                                                .target
                                                                                .files[0]
                                                                        );
                                                                    }
                                                                }}
                                                                className="hidden"
                                                                accept="image/*"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    darkLogoRef.current.click()
                                                                }
                                                                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                            >
                                                                <FaUpload className="mr-2" />
                                                                {data.dark_logo_path ||
                                                                data.dark_logo_preview
                                                                    ? "Change"
                                                                    : "Upload"}
                                                            </button>
                                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                Recommended:
                                                                200px × 50px
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="sm:col-span-3">
                                                <label
                                                    htmlFor="light_logo"
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Light Logo
                                                </label>
                                                <div className="mt-1">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="relative">
                                                            {data.light_logo_preview ? (
                                                                <img
                                                                    src={
                                                                        data.light_logo_preview
                                                                    }
                                                                    alt="Light Logo Preview"
                                                                    className="h-12 w-auto rounded-md object-contain border border-gray-200 dark:border-gray-600"
                                                                />
                                                            ) : data.light_logo_path ? (
                                                                <img
                                                                    src={`/storage/${data.light_logo_path}`}
                                                                    alt="Light Logo"
                                                                    className="h-12 w-auto rounded-md object-contain border border-gray-200 dark:border-gray-600"
                                                                />
                                                            ) : (
                                                                <div className="h-12 w-12 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                                    <FaImage className="h-5 w-5 text-gray-400" />
                                                                </div>
                                                            )}
                                                            {data.light_logo_preview && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setData(
                                                                            "light_logo_preview",
                                                                            null
                                                                        );
                                                                        setData(
                                                                            "light_logo",
                                                                            null
                                                                        );
                                                                        if (
                                                                            lightLogoRef.current
                                                                        )
                                                                            lightLogoRef.current.value =
                                                                                "";
                                                                    }}
                                                                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 focus:outline-none"
                                                                    title="Remove image"
                                                                >
                                                                    <FaTimes className="h-3 w-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <input
                                                                type="file"
                                                                id="light_logo"
                                                                ref={
                                                                    lightLogoRef
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    handleFileChange(
                                                                        "light_logo",
                                                                        e
                                                                    );
                                                                    if (
                                                                        e.target
                                                                            .files &&
                                                                        e.target
                                                                            .files[0]
                                                                    ) {
                                                                        const reader =
                                                                            new FileReader();
                                                                        reader.onload =
                                                                            (
                                                                                event
                                                                            ) => {
                                                                                setData(
                                                                                    "light_logo_preview",
                                                                                    event
                                                                                        .target
                                                                                        .result
                                                                                );
                                                                            };
                                                                        reader.readAsDataURL(
                                                                            e
                                                                                .target
                                                                                .files[0]
                                                                        );
                                                                    }
                                                                }}
                                                                className="hidden"
                                                                accept="image/*"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    lightLogoRef.current.click()
                                                                }
                                                                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                            >
                                                                <FaUpload className="mr-2" />
                                                                {data.light_logo_path ||
                                                                data.light_logo_preview
                                                                    ? "Change"
                                                                    : "Upload"}
                                                            </button>
                                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                Recommended:
                                                                200px × 50px
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="sm:col-span-3">
                                                <label
                                                    htmlFor="favicon"
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Favicon
                                                </label>
                                                <div className="mt-1">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="relative">
                                                            {data.favicon_preview ? (
                                                                <img
                                                                    src={
                                                                        data.favicon_preview
                                                                    }
                                                                    alt="Favicon Preview"
                                                                    className="h-8 w-8 rounded-md object-contain border border-gray-200 dark:border-gray-600"
                                                                />
                                                            ) : data.favicon_path ? (
                                                                <img
                                                                    src={`/storage/${data.favicon_path}`}
                                                                    alt="Site Favicon"
                                                                    className="h-8 w-8 rounded-md object-contain border border-gray-200 dark:border-gray-600"
                                                                />
                                                            ) : (
                                                                <div className="h-8 w-8 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                                    <FaImage className="h-4 w-4 text-gray-400" />
                                                                </div>
                                                            )}
                                                            {data.favicon_preview && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setData(
                                                                            "favicon_preview",
                                                                            null
                                                                        );
                                                                        setData(
                                                                            "favicon",
                                                                            null
                                                                        );
                                                                        if (
                                                                            faviconRef.current
                                                                        )
                                                                            faviconRef.current.value =
                                                                                "";
                                                                    }}
                                                                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 focus:outline-none"
                                                                    title="Remove image"
                                                                >
                                                                    <FaTimes className="h-3 w-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <input
                                                                type="file"
                                                                id="favicon"
                                                                ref={faviconRef}
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    handleFileChange(
                                                                        "favicon",
                                                                        e
                                                                    );
                                                                    if (
                                                                        e.target
                                                                            .files &&
                                                                        e.target
                                                                            .files[0]
                                                                    ) {
                                                                        const reader =
                                                                            new FileReader();
                                                                        reader.onload =
                                                                            (
                                                                                event
                                                                            ) => {
                                                                                setData(
                                                                                    "favicon_preview",
                                                                                    event
                                                                                        .target
                                                                                        .result
                                                                                );
                                                                            };
                                                                        reader.readAsDataURL(
                                                                            e
                                                                                .target
                                                                                .files[0]
                                                                        );
                                                                    }
                                                                }}
                                                                className="hidden"
                                                                accept="image/*,.ico"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    faviconRef.current.click()
                                                                }
                                                                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                            >
                                                                <FaUpload className="mr-2" />
                                                                {data.favicon_path ||
                                                                data.favicon_preview
                                                                    ? "Change"
                                                                    : "Upload"}
                                                            </button>
                                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                Recommended:
                                                                32px × 32px
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    resetSection("general")
                                                }
                                                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <FaUndo className="mr-2" />{" "}
                                                Reset
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={
                                                    processing ||
                                                    isSubmittingGeneral
                                                }
                                                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                                    processing ||
                                                    isSubmittingGeneral
                                                        ? "opacity-75 cursor-not-allowed"
                                                        : ""
                                                }`}
                                            >
                                                {isSubmittingGeneral ? (
                                                    <>
                                                        <svg
                                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                            ></path>
                                                        </svg>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaSave className="mr-2" />{" "}
                                                        Save General Settings
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Contact Settings Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                        <FaEnvelope className="inline mr-2 text-green-500" />
                                        Contact Settings
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Configure how users can contact you
                                    </p>
                                </div>
                                <div className="px-6 py-4">
                                    <form
                                        onSubmit={(e) =>
                                            handleSubmit(e, "contact")
                                        }
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
                                            <div className="sm:col-span-3">
                                                <label
                                                    htmlFor="site_phone"
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Phone Number
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="tel"
                                                        id="site_phone"
                                                        value={data.site_phone}
                                                        onChange={(e) =>
                                                            setData(
                                                                "site_phone",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                    />
                                                </div>
                                            </div>

                                            <div className="sm:col-span-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <label
                                                            htmlFor="enable_email"
                                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                                        >
                                                            Email Contact
                                                        </label>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Allow users to
                                                            contact via email
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={
                                                            data.enable_email
                                                        }
                                                        onChange={(value) =>
                                                            setData(
                                                                "enable_email",
                                                                value
                                                            )
                                                        }
                                                        className={`${
                                                            data.enable_email
                                                                ? "bg-indigo-600"
                                                                : "bg-gray-200 dark:bg-gray-600"
                                                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                                                    >
                                                        <span className="sr-only">
                                                            Enable email
                                                        </span>
                                                        <span
                                                            className={`${
                                                                data.enable_email
                                                                    ? "translate-x-6"
                                                                    : "translate-x-1"
                                                            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                                                        />
                                                    </Switch>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    resetSection("contact")
                                                }
                                                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <FaUndo className="mr-2" />{" "}
                                                Reset
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={
                                                    processing ||
                                                    isSubmittingContact
                                                }
                                                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                                    processing ||
                                                    isSubmittingContact
                                                        ? "opacity-75 cursor-not-allowed"
                                                        : ""
                                                }`}
                                            >
                                                {isSubmittingContact ? (
                                                    <>
                                                        <svg
                                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                            ></path>
                                                        </svg>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaSave className="mr-2" />{" "}
                                                        Save Contact Settings
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Social Media Settings Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                        <FaWhatsapp className="inline mr-2 text-blue-400" />
                                        Social Media Settings
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Connect your social media profiles
                                    </p>
                                </div>
                                <div className="px-6 py-4">
                                    <form
                                        onSubmit={(e) =>
                                            handleSubmit(e, "social")
                                        }
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
                                            <div className="sm:col-span-3">
                                                <label
                                                    htmlFor="facebook_url"
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Facebook URL
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="url"
                                                        id="facebook_url"
                                                        value={
                                                            data.facebook_url
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "facebook_url",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                    />
                                                    {errors.facebook_url && (
                                                        <p className="mt-2 text-sm text-red-600">
                                                            {
                                                                errors.facebook_url
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="sm:col-span-3">
                                                <label
                                                    htmlFor="twitter_url"
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Twitter URL
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="url"
                                                        id="twitter_url"
                                                        value={data.twitter_url}
                                                        onChange={(e) =>
                                                            setData(
                                                                "twitter_url",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                    />
                                                    {errors.twitter_url && (
                                                        <p className="mt-2 text-sm text-red-600">
                                                            {errors.twitter_url}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="sm:col-span-3">
                                                <label
                                                    htmlFor="instagram_url"
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    Instagram URL
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="url"
                                                        id="instagram_url"
                                                        value={
                                                            data.instagram_url
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "instagram_url",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                    />
                                                    {errors.instagram_url && (
                                                        <p className="mt-2 text-sm text-red-600">
                                                            {
                                                                errors.instagram_url
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="sm:col-span-3">
                                                <label
                                                    htmlFor="linkedin_url"
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                                >
                                                    LinkedIn URL
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="url"
                                                        id="linkedin_url"
                                                        value={
                                                            data.linkedin_url
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "linkedin_url",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                    />
                                                    {errors.linkedin_url && (
                                                        <p className="mt-2 text-sm text-red-600">
                                                            {
                                                                errors.linkedin_url
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    resetSection("social")
                                                }
                                                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <FaUndo className="mr-2" />{" "}
                                                Reset
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={
                                                    processing ||
                                                    isSubmittingSocial
                                                }
                                                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                                    processing ||
                                                    isSubmittingSocial
                                                        ? "opacity-75 cursor-not-allowed"
                                                        : ""
                                                }`}
                                            >
                                                {isSubmittingSocial ? (
                                                    <>
                                                        <svg
                                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                            ></path>
                                                        </svg>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaSave className="mr-2" />{" "}
                                                        Save Social Settings
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
