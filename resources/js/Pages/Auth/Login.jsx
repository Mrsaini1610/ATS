import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { Link } from "@inertiajs/react";

export default function Login({ status,  roles: initialRoles, routeName }) {
    const [roles, setRoles] = useState(initialRoles || []);
    const [loadingRoles, setLoadingRoles] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        identifier: "",
        password: "",
        remember: false,
        role_id: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("auth.login"), {
            onFinish: () => reset("password"),
        });
    };

    const fetchRoles = async () => {
        setLoadingRoles(true);
        try {
            const response = await window.axios.get(route("auth.getRoles"));
            setRoles(response.data.roles);
        } catch (error) {
            console.error("Failed to fetch roles:", error);
        } finally {
            setLoadingRoles(false);
        }
    };

    useEffect(() => {
        if (!roles || roles.length === 0) {
            fetchRoles();
        }
    }, []);

    const getWelcomeMessage = () => {
        if (routeName === "admin.login") return "Welcome Back Admin!";
        if (routeName === "doer.login") return "Welcome Back Member!";
        return "Welcome Back!";
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form
                onSubmit={submit}
                className="w-full flex items-center flex-col max-w-md mx-auto bg-white shadow-md dark:bg-[#080626] rounded-lg p-[15px] md:p-6"
            >
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
                    {getWelcomeMessage()}
                </h2>

                {/* Identifier Input */}
                <div className="mb-6 w-full">
                    <label htmlFor="identifier" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <MdEmail className="mr-2" size={18} />
                        Phone / Username
                    </label>
                    <TextInput
                        id="identifier"
                        type="text"
                        name="identifier"
                        value={data.identifier}
                        placeholder="Enter your phone / username"
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData("identifier", e.target.value)}
                        required
                    />
                    <InputError message={errors.identifier} className="mt-2" />
                </div>

                {/* Password Input */}
                <div className="mb-6 w-full">
                    <label htmlFor="password" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <RiLockPasswordFill className="mr-2" size={18} />
                        Password
                    </label>
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        placeholder="Enter your password"
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        autoComplete="current-password"
                        onChange={(e) => setData("password", e.target.value)}
                        required
                    />
                    <InputError message={errors.password || errors.login} className="mt-2" />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="mb-6 w-full flex items-center justify-between flex-wrap gap-2">
                    <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData("remember", e.target.checked)}
                        />
                        <span className="ml-2">Remember me</span>
                    </label>

                        <Link
                            href={route("password.request")}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Forgot your password?
                        </Link>
                </div>

                {/* Submit Button */}
                <div className="w-full">
                    <PrimaryButton className="w-full justify-center" disabled={processing}>
                        {processing ? "Logging in..." : "Log in"}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
