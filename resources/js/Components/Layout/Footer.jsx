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
        <footer className="bg-gray-900 text-gray-300 mt-16">
            {/* Top Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* Company */}
                    <div>
                        <Link href="/candidate/home" className="flex items-center gap-2 mb-5">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    JobPortal
                                </h2>

                                <p className="text-xs text-gray-400">
                                    Candidate Portal
                                </p>
                            </div>
                        </Link>

                        <p className="text-sm leading-6 text-gray-400">
                            Find your dream job with top companies. Search jobs,
                            apply online, manage your profile and grow your
                            career with JobPortal.
                        </p>

                        <div className="flex gap-3 mt-6">

                            <a href="#" className="p-2 rounded-lg bg-gray-800 hover:bg-blue-600 transition">
                                <Facebook size={18} />
                            </a>

                            <a href="#" className="p-2 rounded-lg bg-gray-800 hover:bg-blue-600 transition">
                                <Linkedin size={18} />
                            </a>

                            <a href="#" className="p-2 rounded-lg bg-gray-800 hover:bg-pink-600 transition">
                                <Instagram size={18} />
                            </a>

                            <a href="#" className="p-2 rounded-lg bg-gray-800 hover:bg-sky-500 transition">
                                <Twitter size={18} />
                            </a>

                        </div>
                    </div>

                    {/* Candidate */}

                    <div>

                        <h3 className="text-white font-semibold text-lg mb-5">
                            Candidate
                        </h3>

                        <ul className="space-y-3">

                            <li>
                                <Link href="/" className="hover:text-white">
                                    Home
                                </Link>
                            </li>

                            <li>
                                <Link href="/job-search" className="hover:text-white">
                                    Search Jobs
                                </Link>
                            </li>

                            <li>
                                <Link href="/categories" className="hover:text-white">
                                    Categories
                                </Link>
                            </li>

                            <li>
                                <Link href="/services" className="hover:text-white">
                                    Services
                                </Link>
                            </li>

                            <li>
                                <Link href="/candidate/profile" className="hover:text-white">
                                    My Profile
                                </Link>
                            </li>

                        </ul>

                    </div>

                    {/* Company */}

                    <div>

                        <h3 className="text-white font-semibold text-lg mb-5">
                            Company
                        </h3>

                        <ul className="space-y-3">

                            <li>
                                <Link href="/about" className="hover:text-white">
                                    About Us
                                </Link>
                            </li>

                            <li>
                                <Link href="/contact" className="hover:text-white">
                                    Contact Us
                                </Link>
                            </li>

                            <li>
                                <Link href="/privacy-policy" className="hover:text-white">
                                    Privacy Policy
                                </Link>
                            </li>

                            <li>
                                <Link href="/terms" className="hover:text-white">
                                    Terms & Conditions
                                </Link>
                            </li>

                            <li>
                                <Link href="/faq" className="hover:text-white">
                                    FAQ
                                </Link>
                            </li>

                        </ul>

                    </div>

                    {/* Contact */}

                    <div>

                        <h3 className="text-white font-semibold text-lg mb-5">
                            Contact
                        </h3>

                        <ul className="space-y-4">

                            <li className="flex gap-3">
                                <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
                                <span>support@jobportal.com</span>
                            </li>

                            <li className="flex gap-3">
                                <Phone className="w-5 h-5 text-blue-500 mt-0.5" />
                                <span>+91 98765 43210</span>
                            </li>

                            <li className="flex gap-3">
                                <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                                <span>Jaipur, Rajasthan, India</span>
                            </li>

                        </ul>

                    </div>

                </div>

            </div>

            {/* Bottom Footer */}

            <div className="border-t border-gray-800">

                <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">

                    <p className="text-sm text-gray-500">
                        © {currentYear} JobPortal. All Rights Reserved.
                    </p>

                    <div className="flex gap-6 text-sm">

                        <Link href="/privacy-policy" className="hover:text-white">
                            Privacy
                        </Link>

                        <Link href="/terms" className="hover:text-white">
                            Terms
                        </Link>

                        <Link href="/cookies" className="hover:text-white">
                            Cookies
                        </Link>

                    </div>

                </div>

            </div>

        </footer>
    );
}
