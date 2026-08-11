import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, useForm } from "@inertiajs/react";
import UserProfileRounded from "@/Components/UserProfileRounded";
import { MdLock, MdLockOutline } from "react-icons/md";

export default function SuperPasswordReset({ token, user }) {
    const { data, setData, post, processing, errors } = useForm({
        token: token,
        email: user.email,
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("super.password.update"));
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <div className="w-full max-w-md mx-auto space-y-6">
                {/* Centered User Profile */}


                {/* Password Reset Form */}
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                    <div className="flex justify-center">
                    <UserProfileRounded
                        user={user}
                        className="w-full max-w-xs"
                    />
                </div>
                    <h2 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-4">
                        Reset Your Password
                    </h2>

                    <form onSubmit={submit} className="space-y-4">
                        <input type="hidden" name="email" value={data.email} />

                        <div>
                            <InputLabel
                                htmlFor="password"
                                value="New Password"
                            />
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MdLock className="text-gray-400" />
                                </div>
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="pl-10 w-full"
                                    autoComplete="new-password"
                                    isFocused={true}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>
                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Minimum 8 characters with at least one uppercase, one lowercase, one number and one special character.
                            </p>
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="Confirm Password"
                            />
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MdLockOutline className="text-gray-400" />
                                </div>
                                <TextInput
                                    type="password"
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="pl-10 w-full"
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-6">
                            <PrimaryButton
                                className="w-full justify-center"
                                disabled={processing}
                            >
                                {processing
                                    ? "Updating Password..."
                                    : "Update Password"}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}
