import { Head, useForm, usePage } from '@inertiajs/react';
import { ThemeProvider } from '@/Contexts/ThemeContext';
import HomepageLayout from '@/Layouts/HomepageLayout';
import Footer from '@/Components/Layout/Footer';

export default function Contact() {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('contact.submit'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <ThemeProvider>
            <Head title="Contact Us | ATS" />
            <HomepageLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Contact Us</h1>
                    <p className="mt-2 text-slate-700 dark:text-slate-300">
                        Send your message and our team will get back to you.
                    </p>

                    {flash?.success && (
                        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-3">
                            {flash.success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-8 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-6 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Name</label>
                                <input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-2 w-full rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.name && <div className="mt-1 text-sm text-red-600">{errors.name}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-2 w-full rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.email && <div className="mt-1 text-sm text-red-600">{errors.email}</div>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Subject</label>
                            <input
                                value={data.subject}
                                onChange={(e) => setData('subject', e.target.value)}
                                className="mt-2 w-full rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.subject && <div className="mt-1 text-sm text-red-600">{errors.subject}</div>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Message</label>
                            <textarea
                                rows={6}
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                className="mt-2 w-full rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.message && <div className="mt-1 text-sm text-red-600">{errors.message}</div>}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                            >
                                {processing ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
                <Footer />
            </HomepageLayout>
        </ThemeProvider>
    );
}

