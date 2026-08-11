import { Head, Link } from '@inertiajs/react';
import GuestLayout from "@/Layouts/GuestLayout";
import { useState, useEffect, useMemo } from "react";
import { FaChartLine, FaUsers, FaFileAlt, FaClock, FaHome } from "react-icons/fa";

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    const launchDate = useMemo(() => {
        const launch = new Date();
        launch.setDate(launch.getDate() + 60);
        launch.setHours(0, 0, 0, 0);
        return launch.getTime();
    }, []);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const distance = launchDate - now;

            if (distance < 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [launchDate]);

    const features = [
        { icon: FaChartLine, title: "Analytics Dashboard", description: "Real-time recruitment metrics and insights" },
        { icon: FaUsers, title: "Candidate Management", description: "Streamlined applicant tracking and filtering" },
        { icon: FaFileAlt, title: "Automated Screening", description: "AI-powered resume parsing and evaluation" },
        { icon: FaClock, title: "Interview Scheduling", description: "Smart calendar integration and reminders" },
    ];

    return (
        <GuestLayout>
            <Head title="ATS - Coming Soon" />

            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="container mx-auto px-4 py-16">
                    <div className="mb-12 text-center">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                            ATS
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Applicant Tracking System</p>
                    </div>

                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-8">
                            <span className="inline-block rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                Coming Soon
                            </span>
                        </div>

                        <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
                            Revolutionizing Recruitment
                        </h2>
                        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
                            The next-generation platform for seamless talent acquisition,
                            candidate management, and data-driven hiring decisions.
                        </p>

                        {/* Simple Countdown Timer */}
                        <div className="mb-12">
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <CountdownBox value={timeLeft.days} label="Days" />
                                <CountdownBox value={timeLeft.hours} label="Hours" />
                                <CountdownBox value={timeLeft.minutes} label="Minutes" />
                                <CountdownBox value={timeLeft.seconds} label="Seconds" />
                            </div>
                        </div>

                        <div className="mx-auto mb-12 max-w-md">
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email for early access"
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                />
                                <button className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                    Notify Me
                                </button>
                            </div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Be the first to know when we launch. No spam, ever.
                            </p>
                        </div>
                        
                        {/* View Homepage Button */}
                        <div className="text-center mt-8">
                            <Link 
                                href={route('homepage')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                <FaHome className="w-5 h-5" />
                                View Homepage
                            </Link>
                        </div>
                    </div>

                    <div className="mt-20">
                        <h3 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
                            What to Expect
                        </h3>
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div
                                        key={index}
                                        className="rounded-xl bg-white p-6 text-center shadow-lg transition transform hover:-translate-y-1 dark:bg-gray-800"
                                    >
                                        <div className="mb-4 inline-block rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/30">
                                            <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <h4 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                                            {feature.title}
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {feature.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-20 border-t border-gray-200 pt-8 text-center dark:border-gray-700">
                        <p className="text-gray-600 dark:text-gray-400">
                            © {new Date().getFullYear()} ATS. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}

// Simple Countdown Box Component
const CountdownBox = ({ value, label }) => {
    const formattedValue = String(Math.floor(value)).padStart(2, '0');

    return (
        <div className="countdown-box">
            <div className="countdown-value">
                {formattedValue}
            </div>
            <div className="countdown-label">{label}</div>

            <style jsx>{`
                .countdown-box {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .countdown-value {
                    background: linear-gradient(145deg, #1e1a4b 0%, #2d2a5e 100%);
                    border-radius: 16px;
                    padding: 1rem 0.5rem;
                    min-width: 100px;
                    text-align: center;
                    font-size: 3rem;
                    font-weight: 800;
                    color: white;
                    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
                    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.2);
                    letter-spacing: 0.1em;
                }

                @media (min-width: 640px) {
                    .countdown-value {
                        min-width: 120px;
                        font-size: 3.5rem;
                        padding: 1.25rem 0.75rem;
                    }
                }

                @media (min-width: 768px) {
                    .countdown-value {
                        min-width: 140px;
                        font-size: 4rem;
                        padding: 1.5rem 1rem;
                    }
                }

                .countdown-label {
                    margin-top: 1rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    color: #6b7280;
                    text-align: center;
                }

                @media (min-width: 640px) {
                    .countdown-label {
                        font-size: 0.875rem;
                        margin-top: 1.25rem;
                    }
                }

                @media (min-width: 768px) {
                    .countdown-label {
                        font-size: 1rem;
                        margin-top: 1.5rem;
                    }
                }

                .dark .countdown-label {
                    color: #9ca3af;
                }
            `}</style>
        </div>
    );
};
