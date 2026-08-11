import { Head, Link } from '@inertiajs/react';
import { ThemeProvider } from '@/Contexts/ThemeContext';
import HomepageLayout from '@/Layouts/HomepageLayout';
import Footer from '@/Components/Layout/Footer';

export default function About() {
    return (
        <ThemeProvider>
            <Head title="About Us | ATS" />
            <HomepageLayout>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">About Us</h1>
                    <p className="mt-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                        ATS helps candidates discover the right opportunities and helps teams hire faster with a simple,
                        modern workflow. We focus on clear job discovery, a smooth application experience, and tools that
                        make hiring decisions easier.
                    </p>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-6">
                            <div className="text-lg font-semibold text-slate-900 dark:text-white">For Candidates</div>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                Search jobs, track applications, and keep your profile ready to apply.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-6">
                            <div className="text-lg font-semibold text-slate-900 dark:text-white">For Employers</div>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                Manage job posts and applications with a clean workflow and clear visibility.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-6">
                            <div className="text-lg font-semibold text-slate-900 dark:text-white">For Teams</div>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                Keep hiring aligned with simple status tracking and communication.
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-wrap gap-3">
                        <Link
                            href={route('job.search')}
                            className="px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                            Browse Jobs
                        </Link>
                        <Link
                            href={route('contact.show')}
                            className="px-6 py-3 rounded-lg font-semibold bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
                <Footer />
            </HomepageLayout>
        </ThemeProvider>
    );
}
