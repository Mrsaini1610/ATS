import { Link, usePage } from '@inertiajs/react';
import { TrendingUp, User, Briefcase, Search, UserCheck } from "lucide-react";

export default function CTASection({ user: propUser }) {
    const { auth, isLoggedIn } = usePage().props;
    const user = propUser || auth?.user;
    const isAuth = Boolean(user || isLoggedIn);

    const displayName = user?.full_name 
        ? user.full_name.split(" ")[0] 
        : (user?.name ? user.name.split(" ")[0] : "");

    return (
        <section className="max-w-6xl mx-auto px-4 mb-16">
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 md:p-12 text-white text-center shadow-xl relative overflow-hidden">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-yellow-300 drop-shadow-sm" />
                
                {isAuth ? (
                    <>
                        <h3 className="text-2xl sm:text-3xl font-extrabold mb-2.5">
                            {displayName ? `Boost Your Career, ${displayName}!` : "Boost Your Career with ATS!"}
                        </h3>
                        <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto mb-6 leading-relaxed">
                            Keep your profile, skills, and resume updated so top verified recruiters can discover you and schedule direct interviews.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                            <Link
                                href="/profile"
                                className="w-full sm:w-auto px-7 py-3 bg-white text-blue-700 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-md flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                <User className="w-4 h-4" />
                                <span>Update My Profile</span>
                            </Link>
                            <Link
                                href="/my-applications"
                                className="w-full sm:w-auto px-7 py-3 border-2 border-white/80 text-white rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                <Briefcase className="w-4 h-4" />
                                <span>My Applications</span>
                            </Link>
                            <Link
                                href="/job-search"
                                className="w-full sm:w-auto px-7 py-3 bg-blue-900/40 hover:bg-blue-900/60 border border-white/20 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm sm:text-base backdrop-blur-xs"
                            >
                                <Search className="w-4 h-4" />
                                <span>Browse All Jobs</span>
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className="text-2xl sm:text-3xl font-extrabold mb-2.5">
                            Ready to Boost Your Career?
                        </h3>
                        <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto mb-6 leading-relaxed">
                            Complete your free profile and get noticed by 15,000+ top verified employers across India with zero consultancy charges.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                            <Link
                                href="/register"
                                className="w-full sm:w-auto px-8 py-3.5 bg-white text-blue-700 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-md flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                <UserCheck className="w-4 h-4" />
                                <span>Create Free Profile</span>
                            </Link>
                            <Link
                                href="/job-search"
                                className="w-full sm:w-auto px-8 py-3.5 border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                <Search className="w-4 h-4" />
                                <span>Browse All Jobs</span>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
