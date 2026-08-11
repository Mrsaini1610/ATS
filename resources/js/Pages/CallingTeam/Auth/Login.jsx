import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        identifier: "",
        password: "",
        remember: false,
    });

    const submit = (event) => {
        event.preventDefault();
        post(route("callingteam.verify"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Calling Team Login" />

            <form
                onSubmit={submit}
                className="w-full flex items-center flex-col max-w-md mx-auto bg-white shadow-md dark:bg-[#080626] rounded-lg p-[15px] md:p-6"
            >
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">
                    Calling Team Portal
                </h2>
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
                    Sign in with your calling team credentials.
                </p>

                <div className="mb-6 w-full">
                    <label
                        htmlFor="identifier"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Email / Phone / Username
                    </label>
                    <TextInput
                        id="identifier"
                        type="text"
                        name="identifier"
                        value={data.identifier}
                        placeholder="Enter your email, phone, or username"
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        autoComplete="username"
                        isFocused
                        onChange={(event) =>
                            setData("identifier", event.target.value)
                        }
                        required
                    />
                    <InputError message={errors.identifier || errors.login} className="mt-2" />
                </div>

                <div className="mb-6 w-full">
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
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
                        onChange={(event) => setData("password", event.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mb-6 w-full flex items-center justify-between gap-2">
                    <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(event) =>
                                setData("remember", event.target.checked)
                            }
                        />
                        <span className="ml-2">Remember me</span>
                    </label>

                    <Link
                        href={route("password.request")}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Forgot password?
                    </Link>
                </div>

                <div className="w-full">
                    <PrimaryButton className="w-full justify-center" disabled={processing}>
                        {processing ? "Signing in..." : "Sign in"}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
