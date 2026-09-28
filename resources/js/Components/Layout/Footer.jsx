import { Link } from "@inertiajs/react";
import {
    Briefcase,
    Facebook,
    Linkedin,
    Instagram,
    Twitter,
    Mail,
    Phone,
    MapPin,
} from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

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
                            <li>
                                <Link href="/mobile-app" className="hover:text-white transition">
                                    Mobile App
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company Links */}
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
                                <Link href="/privacy-policy" className="hover:text-white transition">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-white transition">
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="hover:text-white transition">
                                    FAQs
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
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
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
                    <p>© {currentYear} ATS.com. All Rights Reserved.</p>
                    <div className="flex gap-4 text-xs">
                        <Link href="/privacy-policy" className="hover:text-slate-300 transition">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="hover:text-slate-300 transition">
                            Terms of Service
                        </Link>
                        <Link href="/cookies" className="hover:text-slate-300 transition">
                            Cookies
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
