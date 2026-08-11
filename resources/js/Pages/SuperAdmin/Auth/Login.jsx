import { Head, useForm } from "@inertiajs/react";
import { useTheme } from "next-themes";
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaApple, FaSun } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import GuestLayout from "../Layouts/GuestLayout";
import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { useEffect, useRef, useState } from 'react';
import { IoMoon } from "react-icons/io5";
import { toast } from "react-hot-toast";


export default function Login({ status, errors: serverErrors }) {
    const { theme, setTheme } = useTheme();
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        identifier: "",
        password: "",
        remember: false,
    });

   const submit = (e) => {
    e.preventDefault();
    post(route("super.verify"), {
        onFinish: () => reset("password"),
        onError: (errors) => {
            if (errors.identifier || errors.password || errors.login) {
                toast.error(errors.login);
                toast.error(errors.identifier || errors.password || errors.login, {
                    position: 'top-right'
                });
            }
            if (errors.message) {
                toast.error(errors.message, {
                    position: 'top-right'
                });
            }
        },
        onSuccess: () => {

        }
    });
};

    const [darkMode, setDarkMode] = useState(() =>
        localStorage.theme == "dark" ||
        (!("theme" in localStorage) &&
            window.matchMedia("(prefers-color-scheme: dark)").matches)
    );

    useEffect(() => {
        const root = window.document.documentElement;
        if (darkMode) {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    return (
        <GuestLayout>
            <Head title="Login" />
            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
            <div className="flex min-h-screen w-full">
                {/* Left side - Banner */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-purple-600/80 z-10"></div>
                    <img
                        src="https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?q=80&w=1470&auto=format&fit=crop"
                        alt="Login"
                        width={1000}
                        height={1000}
                        className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-12">
                        <div className="max-w-md text-center">
                            <h1 className="text-4xl font-bold mb-6">Welcome Back</h1>
                            <p className="text-lg opacity-90 mb-8">
                                Sign in to continue to your dashboard.
                            </p>
                            <div className="flex justify-center space-x-3">
                                {/* <span className="w-3 h-3 rounded-full bg-white opacity-50"></span>
                                <span className="w-3 h-3 rounded-full bg-white"></span>
                                <span className="w-3 h-3 rounded-full bg-white opacity-50"></span> */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center dark:bg-[#0a0e25] bg-gray-100 px-6 transition-colors duration-300">
                    <div className="w-full max-w-md">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-3xl font-bold dark:text-white text-gray-800">Login</h2>
                                <p className="text-sm mt-2 dark:text-gray-400 text-gray-600">Welcome back! Please enter your details.</p>
                            </div>

                            {/* Dark/Light Toggle */}
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className=" flex items-center gap-2 px-4 py-3 rounded-3xl text-sm hover:bg-gray-200 dark:hover:bg-blue-950 transition "
                            >
                                {darkMode ? (
                                    <FaSun size={20} className="text-gray-200" />
                                ) : (
                                    <IoMoon size={20} className="text-gray-800" />
                                )}
                                <span className="text-gray-800 dark:text-gray-100">
                                    {darkMode ? "Light" : "Dark"}
                                </span>
                            </button>

                        </div>

                        {status && (
                            <div className="mb-4 text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="text-sm font-medium dark:text-gray-300 text-gray-700 mb-2 flex items-center gap-2">
                                    <MdEmail size={18} />  Email / Phone / Username:
                                </label>
                                <TextInput
                                    id="identifier"
                                    type="identifier"
                                    name="identifier"
                                    value={data.identifier}
                                    onChange={(e) => setData("identifier", e.target.value)}
                                    placeholder="Enter your  phone / username"
                                    className="w-full px-4 py-3 rounded-lg dark:bg-[#131836] bg-white border dark:border-gray-700 border-gray-300 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    autoComplete="username"
                                    isFocused
                                    required
                                />
                                <InputError message={errors.identifier} className="mt-2" />

                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="text-sm font-medium dark:text-gray-300 text-gray-700 mb-2 flex items-center gap-2">
                                    <RiLockPasswordFill size={18} /> Password
                                </label>
                                <div className="relative">
                                    <TextInput
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg dark:bg-[#131836] bg-white border dark:border-gray-700 border-gray-300 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        autoComplete="current-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                                    >
                                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                    </button>
                                </div>
                                <InputError message={errors.password || errors.login} className="mt-2" />
                            </div>

                            {/* Remember Me */}
                          <div className="flex items-center justify-between">
    {/* Remember Me */}
    <div className="flex items-center">
        <Checkbox
            id="remember"
            name="remember"
            checked={data.remember}
            onChange={(e) => setData("remember", e.target.checked)}
        />
        <label
            htmlFor="remember"
            className="ml-2 block text-sm dark:text-gray-300 text-gray-700"
        >
            Remember me
        </label>
    </div>

    {/* Forgot Password */}
    <a
        href={route('super.password.request')}
        className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
    >
        Forgot password?
    </a>
</div>
                            {/* Login Button */}
                            <div >
                                <PrimaryButton className="justify-center text-center w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" disabled={processing}>
                                    Log in
                                </PrimaryButton>
                            </div>

                            {/* Sign Up */}
                            {/* <div className="text-center">
                                <p className="text-sm dark:text-gray-400 text-gray-600">
                                    Don’t have an account?{" "}
                                    <a
                                        href="#"
                                        className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        Sign up
                                    </a>
                                </p>
                            </div> */}
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
