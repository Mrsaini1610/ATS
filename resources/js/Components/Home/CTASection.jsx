import { Link } from '@inertiajs/react';
import { TrendingUp } from "lucide-react";

export default function CTASection() {
    return (
        <section className="max-w-6xl mx-auto px-4 mb-16">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
                <h3 className="text-3xl font-bold mb-2">
                    Ready to Boost Your Career?
                </h3>
                <p className="text-blue-100 mb-6">
                    Complete your profile and get noticed by top employers in India
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/register"
                        className="px-8 py-3 bg-white text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                    >
                        Create Free Profile
                    </Link>
                    <Link
                        href="/job-search"
                        className="px-8 py-3 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
                    >
                        Browse All Jobs
                    </Link>
                </div>
            </div>
        </section>
    );
}
