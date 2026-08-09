import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            // number: user.number
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header className=''>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Update Profile 
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="image" value="Profile Image Url" />

                    <TextInput
                        id="profile-pic"
                        className="mt-1 block w-full"
                        value={"https://profilepic-example.png"}
                        // onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div>
                    <InputLabel htmlFor="number" value={"Mobile Number"} />
                    <TextInput 
                        id="number" 
                        type="number"
                        className="mt-1 block w-full" 
                        value={"6546543515"} 
                        // onChange={(e)=> setData('number', e.target.value)}
                        required
                        autoComplete="username"  />
                </div>


                <div>
                    <InputLabel htmlFor="number" value={"Whatsapp Number"} />
                    <TextInput 
                        id="number2" 
                        type="number"
                        className="mt-1 block w-full" 
                        value={"6546543515"} 
                        // onChange={(e)=> setData('number', e.target.value)}
                        required
                        autoComplete="username"  />
                </div>


                <div>
                    <InputLabel htmlFor="number" value={"KYC Verified"} />
                    <TextInput 
                        id="kyc" 
                        type="text"
                        className="mt-1 block w-full" 
                        value={"Verified"} 
                        // onChange={(e)=> setData('number', e.target.value)}
                        required
                        autoComplete="username"  />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="w-full flex items-center justify-end gap-4">
                   <div className='flex space-x-2 items-center'>
                     <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Saved.
                        </p>
                    </Transition>
                   </div>
                </div>
            </form>
        </section>
    );
}
