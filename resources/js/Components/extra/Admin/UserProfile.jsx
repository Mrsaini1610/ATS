import { Head, Link, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "./Layouts/AuthenticatedLayout";
import React, { useState, useRef, useEffect } from "react";
import {
    FiEye,
    FiEyeOff,
    FiEdit2,
    FiSave,
    FiX,
    FiUpload,
    FiTrash2,
    FiZoomIn,
    FiZoomOut,
    FiRotateCw,
    FiCheck,
    FiMinus,
    FiPlus,
} from "react-icons/fi";
import ConfirmDialog from "@/Components/ConfirmDialog";

export default function Dashboard() {
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordMatchError, setPasswordMatchError] = useState("");
    const [isPasswordMatching, setIsPasswordMatching] = useState(false);
    const [showRemoveProfileDialog, setShowRemoveProfileDialog] =
        useState(false);
    const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedImage, setCroppedImage] = useState(null);
    const imageRef = useRef(null);
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const Props = usePage().props;
    const UserDetails = Props?.auth?.user;
    const [passwordValues, setPasswordValues] = useState({
        password: "",
        password_confirmation: "",
    });
    const [formData, setFormData] = useState({
        name: UserDetails?.name || "",
        username: UserDetails?.username || "",
        phone: UserDetails?.phone || "",
        email: UserDetails?.email || "",
    });
    const [passwordErrors, setPasswordErrors] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    useEffect(() => {
        if (croppedImage) {
            const dataURLtoFile = (dataurl, filename) => {
                const arr = dataurl.split(",");
                const mime = arr[0].match(/:(.*?);/)[1];
                const bstr = atob(arr[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                return new File([u8arr], filename, { type: mime });
            };
            const file = dataURLtoFile(croppedImage, "profile-image.jpg");
            const formData = new FormData();
            formData.append("profile_photo", file);
            router.post(route("admin.profile.photo.update"), formData, {
                onSuccess: () => {},
                onError: (errors) => {
                    console.error("Profile photo update failed:", errors);
                },
                preserveScroll: true,
            });
        }
    }, [croppedImage]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        const newValues = {
            ...passwordValues,
            [name]: value,
        };
        setPasswordValues(newValues);
        setPasswordMatchError("");
        if (newValues.password && newValues.password_confirmation) {
            if (newValues.password !== newValues.password_confirmation) {
                setPasswordMatchError("Passwords do not match");
                setIsPasswordMatching(false);
            } else {
                setIsPasswordMatching(true);
            }
        } else {
            setIsPasswordMatching(false);
        }
    };
    const handleProfileUpdate = (e) => {
        e.preventDefault();
        router.post(route("admin.profile.update"), formData, {
            onError: (errors) => {
                console.error("Profile update failed:", errors);
            },
            preserveScroll: true,
        });
    };
    const handlePasswordChange = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        setPasswordErrors({
            current_password: "",
            password: "",
            password_confirmation: "",
        });
        setIsSubmitting(true);
        router.post(route("admin.profile.password.update"), formData, {
            onSuccess: () => {
                setIsModalOpen(false);
                setIsSubmitting(false);
            },
            onError: (errors) => {
                console.error("Password change failed:", errors);
                setPasswordErrors({
                    current_password: errors.current_password || "",
                    password: errors.password || "",
                    password_confirmation: errors.password_confirmation || "",
                });
                setIsSubmitting(false);
            },
            preserveScroll: true,
        });
    };
    const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);
    const handleRemoveProfilePhoto = () => {
        setIsRemovingPhoto(true);
        router.post(
            route("admin.profile.photo.remove"),
            {},
            {
                onSuccess: () => {
                    setShowRemoveProfileDialog(false);
                    setCroppedImage(null);
                    setIsRemovingPhoto(false);
                },
                onError: (errors) => {
                    console.error("Profile photo removal failed:", errors);
                    setShowRemoveProfileDialog(false);
                    setIsRemovingPhoto(false);
                },
                preserveScroll: true,
            }
        );
    };
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target.result);
                setIsImageEditorOpen(true);
                setZoomLevel(1);
                setRotation(0);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleZoomIn = () => {
        setZoomLevel((prev) => Math.min(prev + 0.1, 3));
    };
    const handleZoomOut = () => {
        setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
    };
    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };
    const [isCropping, setIsCropping] = useState(false);
    const handleCrop = () => {
        if (!imageRef.current || !canvasRef.current) return;
        setIsCropping(true);
        const image = imageRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Set canvas dimensions to match the displayed image
        const displayedWidth = image.offsetWidth;
        const displayedHeight = image.offsetHeight;

        canvas.width = displayedWidth;
        canvas.height = displayedHeight;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the image with current transformations
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoomLevel, zoomLevel);
        ctx.drawImage(
            image,
            -image.naturalWidth / 2,
            -image.naturalHeight / 2,
            image.naturalWidth,
            image.naturalHeight
        );
        ctx.restore();
        const croppedImageUrl = canvas.toDataURL("image/jpeg");
        setCroppedImage(croppedImageUrl);
        setIsImageEditorOpen(false);
        setIsCropping(false);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setFormData({
            name: UserDetails?.name || "",
            username: UserDetails?.username || "",
            phone: UserDetails?.phone || "",
            email: UserDetails?.email || "",
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <div className="mt-[75px]">
                <div className="min-h-screen py-[40px] px-[15px]">
                    <div className="p-[0px] md:p-[20px]">
                        <div className="flex gap-[15px] mb-[15px]">
                            <Link
                                href={route("admin.dashboard")}
                                method="get"
                                className="flex gap-[8px] text-[16px] text-prime-color font-[500]"
                            >
                                <svg
                                    width="23"
                                    height="23"
                                    viewBox="0 0 23 23"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g clipPath="url(#clip0_164_908)">
                                        <path
                                            d="M9.82414 4.22156L3 11.463L9.82414 18.7045C9.88577 18.79 9.96408 18.8604 10.0537 18.9111C10.1434 18.9619 10.2424 18.9916 10.3439 18.9985C10.4454 19.0053 10.5471 18.989 10.6422 18.9508C10.7372 18.9125 10.8234 18.8531 10.8948 18.7766C10.9662 18.7002 11.0212 18.6084 11.0561 18.5075C11.091 18.4066 11.105 18.299 11.097 18.192C11.0891 18.0849 11.0595 17.9809 11.0102 17.8869C10.9609 17.793 10.893 17.7114 10.8112 17.6475L5.70551 12.2127L19.2899 12.2127C19.4782 12.2127 19.6588 12.1337 19.792 11.9931C19.9252 11.8525 20 11.6619 20 11.463C20 11.2642 19.9252 11.0736 19.792 10.933C19.6588 10.7924 19.4782 10.7134 19.2899 10.7134L5.70551 10.7134L10.8112 5.27855C10.944 5.13739 11.0182 4.94633 11.0175 4.74741C11.0169 4.54848 10.9414 4.35798 10.8076 4.21782C10.6739 4.07765 10.4929 3.9993 10.3045 4C10.1161 4.00071 9.93561 4.08041 9.80284 4.22156L9.82414 4.22156Z"
                                            fill="currentColor"
                                        />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_164_908">
                                            <rect
                                                width="23"
                                                height="23"
                                                fill="currentColor"
                                                transform="translate(0 23) rotate(-90)"
                                            />
                                        </clipPath>
                                    </defs>
                                </svg>
                                Profile Setting
                            </Link>
                        </div>

                        {/* Profile Header */}
                        <div className="flex items-center justify-between flex-wrap md:flex-nowrap gap-[10px] md:gap-[25px] bg-[#5146E6] dark:bg-[#5146E6] px-[20px] py-[15px] rounded-[15px] shadow-md">
                            <div className="flex items-center gap-4">
                                <img
                                    className="w-16 h-16 md:w-24 md:h-24 rounded-full border-2 border-white object-cover"
                                    src={
                                        croppedImage ||
                                        UserDetails?.profile_photo_url
                                    }
                                    alt="Profile"
                                />
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-white">
                                        {UserDetails?.name}
                                    </h2>
                                    <p className="text-white opacity-90">
                                        @{UserDetails?.username}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <label className="px-4 py-2 bg-white text-[#5146E6] font-medium rounded-lg shadow transition hover:bg-opacity-90 flex items-center gap-2 cursor-pointer">
                                    <FiUpload size={16} />
                                    Change Photo
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                    />
                                </label>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-4 py-2 border border-white text-white font-medium rounded-lg hover:bg-white hover:bg-opacity-10 transition"
                                >
                                    Change Password
                                </button>
                                {/* Add Remove Profile Photo Button */}
                                {(croppedImage ||
                                    UserDetails?.profile_photo_url) && (
                                    <button
                                        onClick={() =>
                                            setShowRemoveProfileDialog(true)
                                        }
                                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                                    >
                                        <FiTrash2 size={16} />
                                        Remove Photo
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Remove Profile Photo Confirmation Dialog */}
                        <ConfirmDialog
                            isOpen={showRemoveProfileDialog}
                            onClose={() => setShowRemoveProfileDialog(false)}
                            onConfirm={handleRemoveProfilePhoto}
                            message="Are you sure you want to remove your profile photo? This action cannot be undone."
                            confirmText={
                                isRemovingPhoto
                                    ? "Removing..."
                                    : "Yes, remove photo"
                            }
                            cancelText="No, keep photo"
                            modalSpinnerMessage="Removing photo..."
                            isDanger={true}
                            isLoading={isRemovingPhoto}
                        />

                        {/* Image Editor Modal */}
                        {isImageEditorOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                                <div className="relative w-full max-w-2xl bg-white dark:bg-[#080626] rounded-xl shadow-xl overflow-hidden mx-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsImageEditorOpen(false)}
                                        className="absolute top-4 right-4 z-20 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    >
                                        <FiX size={20} />
                                    </button>
                                    <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 pr-14">
                                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                                            Edit Profile Image
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex flex-col items-center">
                                            <div
                                                ref={containerRef}
                                                className="relative w-64 h-64 md:w-80 md:h-80 overflow-hidden border border-gray-300 rounded-lg mb-4 flex items-center justify-center"
                                            >
                                                <img
                                                    ref={imageRef}
                                                    src={selectedImage}
                                                    alt="Edit"
                                                    className="max-w-full max-h-full"
                                                    style={{
                                                        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                                                        transformOrigin:
                                                            "center",
                                                    }}
                                                />
                                            </div>

                                            <canvas
                                                ref={canvasRef}
                                                className="hidden"
                                            />

                                            <div className="flex flex-col items-center mb-6">
                                                <div className="flex gap-4 mb-3">
                                                    <button
                                                        onClick={handleZoomOut}
                                                        className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
                                                        title="Zoom Out"
                                                    >
                                                        <FiMinus size={20} />
                                                    </button>
                                                    <button
                                                        onClick={handleZoomIn}
                                                        className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
                                                        title="Zoom In"
                                                    >
                                                        <FiPlus size={20} />
                                                    </button>
                                                    <button
                                                        onClick={handleRotate}
                                                        className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
                                                        title="Rotate"
                                                    >
                                                        <FiRotateCw size={20} />
                                                    </button>
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Zoom:{" "}
                                                    {Math.round(
                                                        zoomLevel * 100
                                                    )}
                                                    % | Rotation: {rotation}°
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() =>
                                                        setIsImageEditorOpen(
                                                            false
                                                        )
                                                    }
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleCrop}
                                                    disabled={isCropping}
                                                    className={`px-4 py-2 text-sm font-medium text-white bg-[#5146E6] rounded-lg hover:bg-[#4339C7] flex items-center gap-2 ${
                                                        isCropping
                                                            ? "opacity-75 cursor-not-allowed"
                                                            : ""
                                                    }`}
                                                >
                                                    {isCropping ? (
                                                        <>
                                                            <svg
                                                                className="animate-spin h-4 w-4 text-white"
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
                                                            Applying...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiCheck
                                                                size={16}
                                                            />
                                                            Apply Changes
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 bg-white dark:bg-[#080626] rounded-[15px] shadow-md overflow-hidden">
                            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                    Account Information
                                </h3>
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={cancelEdit}
                                            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleProfileUpdate}
                                            className="px-3 py-1 text-sm bg-[#5146E6] text-white rounded hover:bg-[#4339C7] flex items-center gap-1"
                                        >
                                            <FiSave size={14} />
                                            Save
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-3 py-1 text-sm text-[#5146E6] border border-[#5146E6] rounded hover:bg-[#5146E6] hover:text-white flex items-center gap-1"
                                    >
                                        <FiEdit2 size={14} />
                                        Edit
                                    </button>
                                )}
                            </div>

                            <div className="p-6">
                                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={`w-full px-4 py-2 rounded-lg border ${
                                                isEditing
                                                    ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                                                    : "border-transparent bg-gray-100 dark:bg-gray-700"
                                            } focus:ring-2 focus:ring-[#5146E6] focus:border-transparent`}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={`w-full px-4 py-2 rounded-lg border ${
                                                isEditing
                                                    ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                                                    : "border-transparent bg-gray-100 dark:bg-gray-700"
                                            } focus:ring-2 focus:ring-[#5146E6] focus:border-transparent`}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            disabled
                                            className={`cursor-not-allowed w-full px-4 py-2 rounded-lg border ${
                                                isEditing
                                                    ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                                                    : "border-transparent bg-gray-100 dark:bg-gray-700"
                                            } focus:ring-2 focus:ring-[#5146E6] focus:border-transparent`}
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className={`w-full px-4 py-2 rounded-lg border ${
                                                isEditing
                                                    ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                                                    : "border-transparent bg-gray-100 dark:bg-gray-700"
                                            } focus:ring-2 focus:ring-[#5146E6] focus:border-transparent`}
                                        />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Change Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                        <div className="relative w-full max-w-md bg-white dark:bg-[#080626] rounded-xl shadow-xl overflow-hidden mx-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 z-20 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <FiX size={20} />
                            </button>
                            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 pr-14">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                                    Change Password
                                </h3>
                            </div>
                            <div className="p-6">
                                <form
                                    onSubmit={handlePasswordChange}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={
                                                    showOld
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="current_password"
                                                placeholder="Enter current password"
                                                className={`w-full px-4 py-3 rounded-lg border ${
                                                    passwordErrors.current_password
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 dark:border-gray-600 focus:ring-[#5146E6]"
                                                } bg-white dark:bg-gray-800 focus:ring-2 focus:border-transparent pr-10`}
                                                required
                                            />
                                            {passwordErrors.current_password && (
                                                <span className="text-red-500 text-xs ml-2">
                                                    {
                                                        passwordErrors.current_password
                                                    }
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                                onClick={() =>
                                                    setShowOld(!showOld)
                                                }
                                            >
                                                {showOld ? (
                                                    <FiEyeOff size={18} />
                                                ) : (
                                                    <FiEye size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={
                                                    showNew
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="password"
                                                placeholder="Enter new password"
                                                value={passwordValues.password}
                                                onChange={
                                                    handlePasswordInputChange
                                                }
                                                className={`w-full px-4 py-3 rounded-lg border ${
                                                    passwordErrors.password
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 dark:border-gray-600 focus:ring-[#5146E6]"
                                                } bg-white dark:bg-gray-800 focus:ring-2 focus:border-transparent pr-10`}
                                                required
                                            />
                                            {passwordErrors.password && (
                                                <span className="text-red-500 text-xs ml-2">
                                                    {passwordErrors.password}
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                                onClick={() =>
                                                    setShowNew(!showNew)
                                                }
                                            >
                                                {showNew ? (
                                                    <FiEyeOff size={18} />
                                                ) : (
                                                    <FiEye size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Confirm New Password
                                            {(passwordErrors.password_confirmation ||
                                                passwordMatchError) && (
                                                <span className="text-red-500 text-xs ml-2">
                                                    {passwordErrors.password_confirmation ||
                                                        passwordMatchError}
                                                </span>
                                            )}
                                            {isPasswordMatching && (
                                                <span className="text-green-500 text-xs ml-2">
                                                    ✓ Passwords match
                                                </span>
                                            )}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={
                                                    showConfirm
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="password_confirmation"
                                                placeholder="Confirm new password"
                                                value={
                                                    passwordValues.password_confirmation
                                                }
                                                onChange={
                                                    handlePasswordInputChange
                                                }
                                                className={`w-full px-4 py-3 rounded-lg border ${
                                                    passwordErrors.password_confirmation ||
                                                    passwordMatchError
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : isPasswordMatching
                                                        ? "border-green-500 focus:ring-green-500"
                                                        : "border-gray-300 dark:border-gray-600 focus:ring-[#5146E6]"
                                                } bg-white dark:bg-gray-800 focus:ring-2 focus:border-transparent pr-10`}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                                onClick={() =>
                                                    setShowConfirm(!showConfirm)
                                                }
                                            >
                                                {showConfirm ? (
                                                    <FiEyeOff size={18} />
                                                ) : (
                                                    <FiEye size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsModalOpen(false)
                                            }
                                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`px-4 py-2 text-sm font-medium text-white bg-[#5146E6] rounded-lg hover:bg-[#4339C7] flex items-center justify-center gap-2 ${
                                                isSubmitting
                                                    ? "opacity-75 cursor-not-allowed"
                                                    : ""
                                            }`}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <svg
                                                        className="animate-spin h-4 w-4 text-white"
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
                                                    Updating...
                                                </>
                                            ) : (
                                                "Update Password"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
