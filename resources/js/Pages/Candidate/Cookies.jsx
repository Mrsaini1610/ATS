import React from "react";
import { Head, Link } from "@inertiajs/react";
import HomepageLayout from "@/Layouts/HomepageLayout";
import {
  Cookie,
  ShieldCheck,
  Settings,
  Lock,
  BarChart,
  Sliders,
  Mail,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function Cookies() {
  const lastUpdated = "September 28, 2026";

  const cookieTypes = [
    {
      title: "Strictly Necessary Cookies",
      icon: Lock,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      description:
        "These cookies are essential for you to navigate the portal, authenticate securely into your candidate dashboard, and use core security features like CSRF token protection. Without these cookies, services like login and job application submissions cannot be provided.",
      examples: ["ats_session (Session management)", "XSRF-TOKEN (Security verification)"],
    },
    {
      title: "Functional & Preference Cookies",
      icon: Sliders,
      color: "text-purple-600 bg-purple-50 border-purple-100",
      description:
        "These cookies enable ATS to remember your preferences and customize your job search experience. For example, remembering your selected city, locality, search filters, and theme preferences so you do not have to re-enter them on every visit.",
      examples: ["selected_city", "job_filter_prefs", "theme"],
    },
    {
      title: "Performance & Analytics Cookies",
      icon: BarChart,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      description:
        "These cookies collect aggregated, anonymous information about how visitors interact with ATS—such as which job categories are most visited and whether pages encounter loading errors. This helps us optimize platform speed and improve user experience.",
      examples: ["_ga (Anonymous traffic stats)", "performance_timing"],
    },
  ];

  return (
    <HomepageLayout>
      <Head>
        <title>Cookies Policy | ATS - Direct Hiring Platform</title>
        <meta
          name="description"
          content="Learn about ATS (ATS Technology Hiring) Cookies Policy. Discover how we use cookies and local storage to secure your sessions, remember your job search preferences, and protect your account."
        />
        <meta
          name="keywords"
          content="ATS cookies policy, web cookies ATS, tracking technologies, candidate session cookies"
        />
      </Head>

      <div className="bg-slate-50/50 min-h-screen pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-800 via-blue-800 to-slate-900 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs sm:text-sm font-semibold mb-4 border border-white/20">
              <Cookie className="w-4 h-4 text-amber-300" />
              <span>Cookies & Tracking Technologies</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
              Cookies Policy
            </h1>
            <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Understand how ATS uses cookies and browser storage to deliver a secure, fast, and personalized job hunting experience.
            </p>
            <div className="mt-4 text-xs text-blue-200">
              Last Updated: <span className="font-semibold text-white">{lastUpdated}</span>
            </div>
          </div>

          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* Content Body */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-xs leading-relaxed text-gray-700 text-sm sm:text-base mt-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2.5">
              <Cookie className="w-5 h-5 text-blue-600" />
              <span>1. What Are Cookies?</span>
            </h2>
            <p className="mb-3">
              Cookies are small text files stored on your computer, smartphone, or tablet when you visit websites. They are widely used to make websites work efficiently, remember your session credentials, and provide essential security protections during online transactions and form submissions.
            </p>
            <p>
              Along with cookies, we may use related browser storage mechanisms (such as <code>localStorage</code> and <code>sessionStorage</code>) to maintain your preferences across page navigations without requiring constant server roundtrips.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 2 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2.5">
              <Settings className="w-5 h-5 text-blue-600" />
              <span>2. Categories of Cookies We Use</span>
            </h2>

            <div className="space-y-4">
              {cookieTypes.map((type, i) => {
                const Icon = type.icon;
                return (
                  <div
                    key={i}
                    className="p-5 rounded-2xl border border-gray-100 bg-slate-50/50 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`p-2 rounded-xl border ${type.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-base text-gray-900">
                        {type.title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 leading-relaxed">
                      {type.description}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="font-semibold text-gray-500">Key examples:</span>
                      {type.examples.map((ex, j) => (
                        <span
                          key={j}
                          className="px-2.5 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700 font-mono text-[11px]"
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 3 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>3. How to Manage or Disable Cookies</span>
            </h2>
            <p className="mb-3">
              Most web browsers automatically accept cookies by default. However, you can modify your browser settings to reject cookies or prompt you before accepting a cookie:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm pl-2 mb-4">
              <li><strong>Google Chrome:</strong> Settings &rarr; Privacy and security &rarr; Cookies and other site data.</li>
              <li><strong>Apple Safari:</strong> Preferences &rarr; Privacy &rarr; Manage Website Data / Block all cookies.</li>
              <li><strong>Mozilla Firefox:</strong> Settings &rarr; Privacy & Security &rarr; Enhanced Tracking Protection.</li>
              <li><strong>Microsoft Edge:</strong> Settings &rarr; Cookies and site permissions &rarr; Manage and delete cookies.</li>
            </ul>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm text-amber-900">
              <p className="font-semibold mb-1">Important Note:</p>
              <p className="leading-relaxed">
                If you choose to block or disable strictly necessary cookies, essential features such as logging in to your candidate account, saving job applications, or receiving interview alerts may not function properly.
              </p>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 4 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2.5">
              <Mail className="w-5 h-5 text-blue-600" />
              <span>4. Contact Us</span>
            </h2>
            <p className="mb-4">
              If you have any questions regarding our use of cookies or tracking technologies, please feel free to reach out to our team:
            </p>
            <div className="bg-slate-50 rounded-2xl border border-gray-100 p-5 space-y-1.5 text-xs sm:text-sm">
              <p><strong>Support & Privacy Team:</strong> ATS Technology Hiring</p>
              <p><strong>Email:</strong> <a href="mailto:uniquetech.supt@gmail.com" className="text-blue-600 font-semibold underline">uniquetech.supt@gmail.com</a></p>
              <p><strong>Official Helpdesk:</strong> <Link href="/contact" className="text-blue-600 font-semibold underline">https://atstechnologyhiring.com/contact</Link></p>
            </div>
          </section>
        </div>
      </div>
    </HomepageLayout>
  );
}
