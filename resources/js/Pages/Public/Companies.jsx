import { Head, Link } from '@inertiajs/react';
import { ThemeProvider } from '@/Contexts/ThemeContext';
import HomepageLayout from '@/Layouts/HomepageLayout';
import Footer from '@/Components/Layout/Footer';

export default function Companies({ companies }) {
    return (
        <ThemeProvider>
            <Head title="Companies | ATS" />
            <HomepageLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex items-end justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Companies</h1>
                            <p className="mt-2 text-slate-600 dark:text-slate-400">
                                Browse companies currently hiring on ATS.
                            </p>
                        </div>
                        <Link
                            href={route('jobs.index')}
                            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                            Browse Jobs
                        </Link>
                    </div>

                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(companies ?? []).map((company) => {
                            const params = new URLSearchParams();
                            params.set('search', company.company);
                            const jobsHref = `${route('jobs.index')}?${params.toString()}`;

                            return (
                                <div
                                    key={company.company}
                                    className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                                            {company.company_image ? (
                                                <img
                                                    src={company.company_image}
                                                    alt={company.company}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                (company.company ?? 'C').charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                                                {company.company}
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                                {company.jobs_count} open role{Number(company.jobs_count) === 1 ? '' : 's'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center justify-end">
                                        <Link
                                            href={jobsHref}
                                            className="px-4 py-2 rounded-lg text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                        >
                                            View Jobs
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {(!companies || companies.length === 0) && (
                        <div className="mt-10 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-10 text-center">
                            <div className="text-lg font-semibold text-slate-900 dark:text-white">No companies found</div>
                            <div className="mt-2 text-slate-600 dark:text-slate-400">Check back later.</div>
                        </div>
                    )}
                </div>
                <Footer />
            </HomepageLayout>
        </ThemeProvider>
    );
}
