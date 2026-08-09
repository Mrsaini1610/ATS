import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, useForm } from "@inertiajs/react";
import { useEffect, useState, useCallback } from "react";
import { MdEmail } from "react-icons/md";
import { Link } from "@inertiajs/react";

export default function SuperForgetPassword({ status }) {
    const [emailValid, setEmailValid] = useState(null);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();

        // Validate email before submission
        if (emailValid !== true) {
            setEmailValid(false);
            return;
        }

        post(route('super.password.email'), {
            onSuccess: () => {
                setSubmitted(true);
                reset();
            },
        });
    };

    const debounce = (func, delay) => {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // Email validation function
    const validateEmail = async (email) => {
        if (!email) {
            setEmailValid(null);
            return;
        }

        // Simple email regex check first
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailValid(false);
            return;
        }

        setCheckingEmail(true);
        try {
            const response = await window.axios.post(route("super.auth.checkEmail"), {
                email: email
            });
            setEmailValid(response.data.exists);
        } catch (error) {
            console.error("Error checking email:", error);
            setEmailValid(false);
        } finally {
            setCheckingEmail(false);
        }
    };

    const debouncedValidateEmail = useCallback(
        debounce(validateEmail, 500),
        []
    );

    const handleEmailChange = (e) => {
        const email = e.target.value;
        setData("email", email);
        debouncedValidateEmail(email);
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            {submitted ? (
                <div className="w-full max-w-md mx-auto bg-white shadow-md dark:bg-[#080626] rounded-lg p-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                        Check Your Email
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        We've emailed you a password reset link. Please check your inbox.
                    </p>
                    <Link
                        href={route('login')}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Return to login
                    </Link>
                </div>
            ) : (
                <form
                    onSubmit={submit}
                    className="w-full flex items-center flex-col max-w-md mx-auto bg-white shadow-md dark:bg-[#080626] rounded-lg p-[15px] md:p-6"
                >
                    <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
                        Forgot Your Password?
                    </h2>

                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                        No problem. Just let us know your email address and we'll email you a password reset link.
                    </p>

                    {/* Email Input */}
                    <div className="mb-6 w-full">
                        <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <MdEmail className="mr-2" size={18} />
                            Email
                        </label>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            placeholder="Enter your Email"
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
                            autoComplete="email"
                            isFocused={true}
                            onChange={handleEmailChange}
                            onBlur={() => validateEmail(data.email)}
                            required
                        />
                        {checkingEmail && (
                            <p className="mt-2 text-sm text-gray-500">Checking email...</p>
                        )}
                        {emailValid === false && (
                            <InputError message="This email is not registered in our system" className="mt-2" />
                        )}
                        {errors.email && (
                            <InputError message={errors.email} className="mt-2" />
                        )}
                    </div>

                    <div className="w-full">
                        <PrimaryButton
                            className="w-full justify-center"
                            disabled={processing || emailValid === false || checkingEmail}
                        >
                            {processing ? "Sending..." : "Email Password Reset Link"}
                        </PrimaryButton>
                    </div>

                    <div className="mt-4 text-center">
                        <Link
                            href={route('home')}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Remember your password? Login here
                        </Link>
                    </div>
                </form>
            )}
        </GuestLayout>
    );
}
