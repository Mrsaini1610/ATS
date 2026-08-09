import { Head, Link, router, usePage } from "@inertiajs/react";
import React, { useEffect, useRef, useState } from "react";
import {
    FiCheck,
    FiEdit2,
    FiEye,
    FiEyeOff,
    FiMinus,
    FiPlus,
    FiRotateCw,
    FiSave,
    FiTrash2,
    FiUpload,
    FiX,
} from "react-icons/fi";
import ConfirmDialog from "@/Components/ConfirmDialog";
import AuthenticatedLayout from "./Layouts/AuthenticatedLayout";

export default function UserProfile() {
    const props = usePage().props;
    const userDetails = props?.auth?.user;
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
    const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);
    const [isCropping, setIsCropping] = useState(false);
    const imageRef = useRef(null);
    const canvasRef = useRef(null);
    const [passwordValues, setPasswordValues] = useState({
        password: "",
        password_confirmation: "",
    });
    const [formData, setFormData] = useState({
        name: userDetails?.name || "",
        username: userDetails?.username || "",
        phone: userDetails?.phone || "",
        email: userDetails?.email || "",
    });
    const [passwordErrors, setPasswordErrors] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    useEffect(() => {
        if (!croppedImage) return;

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
        const payload = new FormData();
        payload.append("profile_photo", file);

        router.post(route("callingteam.profile.photo.update"), payload, {
            preserveScroll: true,
        });
    }, [croppedImage]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordInputChange = (event) => {
        const { name, value } = event.target;
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

    const handleProfileUpdate = (event) => {
        event.preventDefault();
        router.post(route("callingteam.profile.update"), formData, {
            preserveScroll: true,
            onSuccess: () => setIsEditing(false),
        });
    };

    const handlePasswordChange = (event) => {
        event.preventDefault();
        const payload = new FormData(event.target);
        setPasswordErrors({
            current_password: "",
            password: "",
            password_confirmation: "",
        });
        setIsSubmitting(true);

        router.post(route("callingteam.profile.password.update"), payload, {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                setIsSubmitting(false);
                setPasswordValues({
                    password: "",
                    password_confirmation: "",
                });
            },
            onError: (errors) => {
                setPasswordErrors({
                    current_password: errors.current_password || "",
                    password: errors.password || "",
                    password_confirmation: errors.password_confirmation || "",
                });
                setIsSubmitting(false);
            },
        });
    };

    const handleRemoveProfilePhoto = () => {
        setIsRemovingPhoto(true);
        router.post(
            route("callingteam.profile.photo.remove"),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowRemoveProfileDialog(false);
                    setCroppedImage(null);
                    setIsRemovingPhoto(false);
                },
                onError: () => {
                    setShowRemoveProfileDialog(false);
                    setIsRemovingPhoto(false);
                },
            }
        );
    };

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            setSelectedImage(loadEvent.target.result);
            setIsImageEditorOpen(true);
            setZoomLevel(1);
            setRotation(0);
        };
        reader.readAsDataURL(file);
    };

    const handleCrop = () => {
        if (!imageRef.current || !canvasRef.current) return;

        setIsCropping(true);
        const image = imageRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const displayedWidth = image.offsetWidth;
        const displayedHeight = image.offsetHeight;

        canvas.width = displayedWidth;
        canvas.height = displayedHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
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

        setCroppedImage(canvas.toDataURL("image/jpeg"));
        setIsImageEditorOpen(false);
        setIsCropping(false);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setFormData({
            name: userDetails?.name || "",
            username: userDetails?.username || "",
            phone: userDetails?.phone || "",
            email: userDetails?.email || "",
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Calling Team Profile" />

            <div className="mt-[75px] min-h-screen bg-slate-100 px-[15px] py-[40px] dark:bg-[#0a0e25]">
                <div className="p-[0px] md:p-[20px]">
                    <div className="mb-[15px] flex gap-[15px]">
                        <Link
                            href={route("callingteam.dashboard")}
                            method="get"
                            className="flex gap-[8px] text-[16px] font-[500] text-indigo-600 dark:text-indigo-400"
                        >
                            <svg
                                width="23"
                                height="23"
                                viewBox="0 0 23 23"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M9.82414 4.22156L3 11.463L9.82414 18.7045C9.95692 18.8457 10.1374 18.9254 10.3258 18.9247C10.5142 18.924 10.6952 18.8457 10.8289 18.7055C10.9627 18.5653 11.0382 18.3748 11.0388 18.1759C11.0395 17.977 10.9653 17.7859 10.8325 17.6447L5.72681 12.2099L19.3112 12.2099C19.4995 12.2099 19.6801 12.1309 19.8133 11.9903C19.9465 11.8497 20.0213 11.6591 20.0213 11.4603C20.0213 11.2614 19.9465 11.0708 19.8133 10.9302C19.6801 10.7896 19.4995 10.7106 19.3112 10.7106L5.72681 10.7106L10.8325 5.27577C10.9653 5.13461 11.0395 4.94355 11.0388 4.74463C11.0382 4.54571 10.9627 4.3552 10.8289 4.21504C10.6952 4.07487 10.5142 3.99652 10.3258 3.99723C10.1374 3.99794 9.95691 4.07764 9.82414 4.21879V4.22156Z"
                                    fill="currentColor"
                                />
                            </svg>
                            Profile Setting
                        </Link>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-[16px] rounded-[15px] bg-[#5146E6] px-[20px] py-[15px] shadow-md">
                        <div className="flex items-center gap-4">
                            <img
                                className="h-16 w-16 rounded-full border-2 border-white object-cover md:h-24 md:w-24"
                                src={croppedImage || userDetails?.profile_photo_url}
                                alt="Profile"
                            />
                            <div>
                                <h2 className="text-xl font-bold text-white md:text-2xl">
                                    {userDetails?.name}
                                </h2>
                                <p className="text-white/90">@{userDetails?.username}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-[#5146E6] shadow transition hover:bg-white/90">
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
                                className="rounded-lg border border-white px-4 py-2 font-medium text-white transition hover:bg-white/10"
                            >
                                Change Password
                            </button>
                            {(croppedImage || userDetails?.profile_photo_url) && (
                                <button
                                    onClick={() => setShowRemoveProfileDialog(true)}
                                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
                                >
                                    <FiTrash2 size={16} />
                                    Remove Photo
                                </button>
                            )}
                        </div>
                    </div>

                    <ConfirmDialog
                        isOpen={showRemoveProfileDialog}
                        onClose={() => setShowRemoveProfileDialog(false)}
                        onConfirm={handleRemoveProfilePhoto}
                        message="Are you sure you want to remove your profile photo? This action cannot be undone."
                        confirmText={
                            isRemovingPhoto ? "Removing..." : "Yes, remove photo"
                        }
                        cancelText="No, keep photo"
                        modalSpinnerMessage="Removing photo..."
                        isDanger={true}
                        isLoading={isRemovingPhoto}
                    />

                    {isImageEditorOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
                            <div className="relative w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl dark:bg-[#080626]">
                                <button
                                    type="button"
                                    onClick={() => setIsImageEditorOpen(false)}
                                    className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-lg hover:text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                >
                                    <FiX size={20} />
                                </button>
                                <div className="border-b border-gray-200 px-6 py-4 pr-14 dark:border-gray-700">
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                                        Edit Profile Image
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="flex flex-col items-center">
                                        <div className="relative mb-4 flex h-64 w-64 items-center justify-center overflow-hidden rounded-lg border border-gray-300 md:h-80 md:w-80 dark:border-gray-700">
                                            <img
                                                ref={imageRef}
                                                src={selectedImage}
                                                alt="Edit"
                                                className="max-h-full max-w-full"
                                                style={{
                                                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                                                    transformOrigin: "center",
                                                }}
                                            />
                                        </div>

                                        <canvas ref={canvasRef} className="hidden" />

                                        <div className="mb-6 flex flex-col items-center">
                                            <div className="mb-3 flex gap-4">
                                                <button
                                                    onClick={() =>
                                                        setZoomLevel((prev) =>
                                                            Math.max(prev - 0.1, 0.5)
                                                        )
                                                    }
                                                    className="rounded-full bg-gray-200 p-2 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                                                    title="Zoom Out"
                                                >
                                                    <FiMinus size={20} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setZoomLevel((prev) =>
                                                            Math.min(prev + 0.1, 3)
                                                        )
                                                    }
                                                    className="rounded-full bg-gray-200 p-2 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                                                    title="Zoom In"
                                                >
                                                    <FiPlus size={20} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setRotation((prev) => (prev + 90) % 360)
                                                    }
                                                    className="rounded-full bg-gray-200 p-2 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                                                    title="Rotate"
                                                >
                                                    <FiRotateCw size={20} />
                                                </button>
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                Zoom: {Math.round(zoomLevel * 100)}% | Rotation:{" "}
                                                {rotation}°
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setIsImageEditorOpen(false)}
                                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleCrop}
                                                disabled={isCropping}
                                                className={`flex items-center gap-2 rounded-lg bg-[#5146E6] px-4 py-2 text-sm font-medium text-white hover:bg-[#4339C7] ${
                                                    isCropping
                                                        ? "cursor-not-allowed opacity-75"
                                                        : ""
                                                }`}
                                            >
                                                {isCropping ? (
                                                    "Applying..."
                                                ) : (
                                                    <>
                                                        <FiCheck size={16} />
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

                    <div className="mt-6 overflow-hidden rounded-[15px] bg-white shadow-md dark:bg-[#080626]">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                Account Information
                            </h3>
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={cancelEdit}
                                        className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleProfileUpdate}
                                        className="flex items-center gap-1 rounded bg-[#5146E6] px-3 py-1 text-sm text-white hover:bg-[#4339C7]"
                                    >
                                        <FiSave size={14} />
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-1 rounded border border-[#5146E6] px-3 py-1 text-sm text-[#5146E6] hover:bg-[#5146E6] hover:text-white"
                                >
                                    <FiEdit2 size={14} />
                                    Edit
                                </button>
                            )}
                        </div>

                        <div className="p-6">
                            <form className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                                        className={`w-full rounded-lg border px-4 py-2 text-gray-900 dark:text-white ${
                                            isEditing
                                                ? "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                                                : "border-transparent bg-gray-100 dark:bg-gray-700"
                                        }`}
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
                                        className={`w-full rounded-lg border px-4 py-2 text-gray-900 dark:text-white ${
                                            isEditing
                                                ? "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                                                : "border-transparent bg-gray-100 dark:bg-gray-700"
                                        }`}
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
                                        disabled
                                        className="w-full cursor-not-allowed rounded-lg border border-transparent bg-gray-100 px-4 py-2 text-gray-900 dark:bg-gray-700 dark:text-white"
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
                                        className={`w-full rounded-lg border px-4 py-2 text-gray-900 dark:text-white ${
                                            isEditing
                                                ? "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                                                : "border-transparent bg-gray-100 dark:bg-gray-700"
                                        }`}
                                    />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
                        <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl dark:bg-[#080626]">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-lg hover:text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                                <FiX size={20} />
                            </button>
                            <div className="border-b border-gray-200 px-6 py-4 pr-14 dark:border-gray-700">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                                    Change Password
                                </h3>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handlePasswordChange} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showOld ? "text" : "password"}
                                                name="current_password"
                                                placeholder="Enter current password"
                                                className={`w-full rounded-lg border bg-white px-4 py-3 pr-10 text-gray-900 dark:bg-gray-800 dark:text-white ${
                                                    passwordErrors.current_password
                                                        ? "border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                }`}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-300"
                                                onClick={() => setShowOld(!showOld)}
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
                                                type={showNew ? "text" : "password"}
                                                name="password"
                                                placeholder="Enter new password"
                                                value={passwordValues.password}
                                                onChange={handlePasswordInputChange}
                                                className={`w-full rounded-lg border bg-white px-4 py-3 pr-10 text-gray-900 dark:bg-gray-800 dark:text-white ${
                                                    passwordErrors.password
                                                        ? "border-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                }`}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-300"
                                                onClick={() => setShowNew(!showNew)}
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
                                                <span className="ml-2 text-xs text-red-500">
                                                    {passwordErrors.password_confirmation ||
                                                        passwordMatchError}
                                                </span>
                                            )}
                                            {isPasswordMatching && (
                                                <span className="ml-2 text-xs text-green-500">
                                                    ✓ Passwords match
                                                </span>
                                            )}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirm ? "text" : "password"}
                                                name="password_confirmation"
                                                placeholder="Confirm new password"
                                                value={passwordValues.password_confirmation}
                                                onChange={handlePasswordInputChange}
                                                className={`w-full rounded-lg border bg-white px-4 py-3 pr-10 text-gray-900 dark:bg-gray-800 dark:text-white ${
                                                    passwordErrors.password_confirmation ||
                                                    passwordMatchError
                                                        ? "border-red-500"
                                                        : isPasswordMatching
                                                        ? "border-green-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                }`}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-300"
                                                onClick={() => setShowConfirm(!showConfirm)}
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
                                            onClick={() => setIsModalOpen(false)}
                                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`rounded-lg bg-[#5146E6] px-4 py-2 text-sm font-medium text-white hover:bg-[#4339C7] ${
                                                isSubmitting
                                                    ? "cursor-not-allowed opacity-75"
                                                    : ""
                                            }`}
                                        >
                                            {isSubmitting ? "Updating..." : "Update Password"}
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
