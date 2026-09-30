import { Link, usePage } from "@inertiajs/react";
import {
    Briefcase,
    Facebook,
    Linkedin,
    Instagram,
    Twitter,
    Mail,
    Phone,
    MapPin,
    Smartphone,
    ArrowRight,
} from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const { url = "" } = usePage();
    const isAppPage = url.startsWith("/mobile-app") || url.startsWith("/apps") || url === "/app";

    return (
        <footer className="mt-auto bg-slate-950 text-slate-300 border-t border-slate-800/80 w-full shrink-0">
            {/* Top Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-9">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
                            <img
                                src="/images/logo.png"
                                alt="ATS.com"
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform"
                            />
                            <div className="flex items-baseline gap-0.5">
                                <span className="text-lg font-black text-white tracking-tight">
                                    ATS
                                </span>
                                <span className="text-xs font-bold text-blue-400">
                                    .com
                                </span>
                            </div>
                        </Link>

                        <p className="text-xs leading-relaxed text-slate-400 max-w-xs">
                            Direct candidate hiring platform connecting job seekers directly with verified HRs & startups with zero consultancy charges.
                        </p>

                        <div className="flex gap-2 mt-3.5">
                            <a
                                href="#"
                                aria-label="Facebook"
                                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 hover:bg-blue-600 hover:border-blue-600 flex items-center justify-center text-slate-400 hover:text-white transition"
                            >
                                <Facebook size={13} />
                            </a>
                            <a
                                href="#"
                                aria-label="LinkedIn"
                                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 hover:bg-blue-600 hover:border-blue-600 flex items-center justify-center text-slate-400 hover:text-white transition"
                            >
                                <Linkedin size={13} />
                            </a>
                            <a
                                href="#"
                                aria-label="Instagram"
                                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 hover:bg-pink-600 hover:border-pink-600 flex items-center justify-center text-slate-400 hover:text-white transition"
                            >
                                <Instagram size={13} />
                            </a>
                            <a
                                href="#"
                                aria-label="Twitter"
                                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 hover:bg-sky-500 hover:border-sky-500 flex items-center justify-center text-slate-400 hover:text-white transition"
                            >
                                <Twitter size={13} />
                            </a>
                        </div>
                    </div>

                    {/* Candidate Links */}
                    <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                            Candidates
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-400">
                            <li>
                                <Link href="/" className="hover:text-white transition">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/job-search" className="hover:text-white transition">
                                    Search Jobs
                                </Link>
                            </li>
                            <li>
                                <Link href="/categories" className="hover:text-white transition">
                                    Browse Categories
                                </Link>
                            </li>
                            <li>
                                <Link href="/companies" className="hover:text-white transition">
                                    Top Companies
                                </Link>
                            </li>
                            <li>
                                <Link href="/services" className="hover:text-white transition">
                                    Career Services
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company Links (Legal pages removed from here and placed in bottom bar) */}
                    <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                            Company
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-400">
                            <li>
                                <Link href="/about" className="hover:text-white transition">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-white transition">
                                    Contact Support
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="hover:text-white transition">
                                    FAQs
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info & Conditional App Download */}
                    <div className="col-span-2 md:col-span-1">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                            Contact Us
                        </h4>
                        <ul className="space-y-2 text-xs text-slate-400">
                            <li className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                <a href="mailto:support@ats.com" className="hover:text-white transition">
                                    support@ats.com
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                                <span>Jaipur, Rajasthan, India</span>
                            </li>
                        </ul>

                        {/* Direct Play Store & App Store Buttons - Hidden when already on the Mobile App page */}
                        {!isAppPage && (
                            <div className="mt-4 pt-3.5 border-t border-slate-800/80">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                                    Download App
                                </p>
                                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2">
                                    {/* Google Play */}
                                    <Link
                                        href="/mobile-app"
                                        className="flex items-center gap-2.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-white transition-all shadow-xs group"
                                        title="Download on Google Play"
                                    >
                                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                                            <path d="M3 3.5L13.5 12 3 20.5V3.5Z" fill="#34A853" />
                                            <path d="M3 3.5L13.5 12 17.5 8.2 5.2 2.1A1.5 1.5 0 003 3.5Z" fill="#EA4335" />
                                            <path d="M3 20.5L13.5 12 17.5 15.8 5.2 21.9A1.5 1.5 0 013 20.5Z" fill="#FBBC05" />
                                            <path d="M17.5 8.2L21 10.1a1.9 1.9 0 010 3.8l-3.5 1.9L13.5 12l4-3.8Z" fill="#4285F4" />
                                        </svg>
                                        <div className="text-left leading-none">
                                            <span className="text-[9px] text-slate-400 block mb-0.5 font-medium">GET IT ON</span>
                                            <span className="text-xs font-extrabold text-white tracking-tight">Google Play</span>
                                        </div>
                                    </Link>

                                    {/* App Store */}
                                    <Link
                                        href="/mobile-app"
                                        className="flex items-center gap-2.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-white transition-all shadow-xs group"
                                        title="Download on the App Store"
                                    >
                                        <svg className="w-5 h-5 shrink-0 fill-current text-white" viewBox="0 0 24 24">
                                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                        </svg>
                                        <div className="text-left leading-none">
                                            <span className="text-[9px] text-slate-400 block mb-0.5 font-medium">Download on the</span>
                                            <span className="text-xs font-extrabold text-white tracking-tight">App Store</span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
                    <p>© {currentYear} ATS.com. All Rights Reserved.</p>
                    <div className="flex flex-wrap gap-4 text-xs">
                        <Link href="/privacy-policy" className="hover:text-slate-300 transition">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="hover:text-slate-300 transition">
                            Terms & Conditions
                        </Link>
                        <Link href="/cookies" className="hover:text-slate-300 transition">
                            Cookies Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
