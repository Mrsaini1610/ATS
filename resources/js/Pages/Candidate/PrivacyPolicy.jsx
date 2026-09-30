import React from "react";
import { Head, Link } from "@inertiajs/react";
import HomepageLayout from "@/Layouts/HomepageLayout";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  UserCheck,
  Database,
  Bell,
  Mail,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function PrivacyPolicy() {
  const lastUpdated = "September 28, 2026";

  const sections = [
    { id: "intro", title: "1. Introduction & Overview" },
    { id: "data-collection", title: "2. Information We Collect" },
    { id: "how-we-use", title: "3. How We Use Your Data" },
    { id: "no-data-sale", title: "4. Zero Data Selling Pledge" },
    { id: "profile-visibility", title: "5. Profile & Resume Visibility" },
    { id: "data-security", title: "6. Security & Encryption" },
    { id: "user-rights", title: "7. Your Rights & Data Control" },
    { id: "retention", title: "8. Data Retention & Deletion" },
    { id: "grievance", title: "9. Grievance Redressal & Contact" },
  ];

  return (
    <HomepageLayout>
      <Head>
        <title>Privacy Policy | ATS - Direct Hiring Platform</title>
        <meta
          name="description"
          content="Read ATS (ATS Technology Hiring) Privacy Policy. Learn how we protect your personal information, resume data, and ensure 100% free, secure direct hiring with zero data selling."
        />
        <meta
          name="keywords"
          content="ATS privacy policy, candidate data protection, job portal privacy India, data security ATS"
        />
      </Head>

      <div className="bg-slate-50/50 min-h-screen pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs sm:text-sm font-semibold mb-4 border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>User Trust & Data Protection</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
              Privacy Policy
            </h1>
            <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Your privacy is our priority. We are committed to transparency, strong data protection, and empowering job seekers with direct, secure hiring.
            </p>
            <div className="mt-4 text-xs text-blue-200">
              Last Updated: <span className="font-semibold text-white">{lastUpdated}</span>
            </div>
          </div>

          {/* Decorative background circle */}
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column: Sticky Table of Contents */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3.5">
                  Quick Navigation
                </h3>
                <nav className="space-y-1.5">
                  {sections.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className="block text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50/60 rounded-lg px-2.5 py-1.5 transition-colors"
                    >
                      {sec.title}
                    </a>
                  ))}
                </nav>
                <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500 mb-2">Have a privacy question?</p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <span>Contact Support</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Policy Document Body */}
            <div className="lg:col-span-3 space-y-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-xs leading-relaxed text-gray-700 text-sm sm:text-base">
              {/* 1. Introduction */}
              <section id="intro" className="scroll-mt-28">
                <div className="flex items-center gap-2.5 mb-3 text-blue-600">
                  <FileText className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    1. Introduction & Overview
                  </h2>
                </div>
                <p className="mb-3">
                  Welcome to <strong>ATS</strong> (operated under <em>ATS Technology Hiring</em>, accessible via <a href="https://atstechnologyhiring.com" className="text-blue-600 underline font-semibold">atstechnologyhiring.com</a>). We are dedicated to connecting verified candidates directly with registered employers without third-party brokers, consultancies, or hidden charges.
                </p>
                <p>
                  This Privacy Policy explains how we collect, process, store, and safeguard your personal information when you access our website, create a candidate profile, apply for jobs, or communicate with employers on our portal. By using ATS, you consent to the practices described in this document in compliance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act (DPDP), 2023 of India.
                </p>
              </section>

              <hr className="border-gray-100" />

              {/* 2. Data Collection */}
              <section id="data-collection" className="scroll-mt-28">
                <div className="flex items-center gap-2.5 mb-3 text-blue-600">
                  <Database className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    2. Information We Collect
                  </h2>
                </div>
                <p className="mb-4">
                  We only collect information necessary to facilitate authentic recruitment matches and provide seamless application tracking:
                </p>
                <ul className="space-y-2.5 pl-2">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
                    <span><strong>Personal Identity & Contact:</strong> Full name, verified mobile number, email address, date of birth, gender, and preferred city/locality in India.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
                    <span><strong>Professional & Academic Credentials:</strong> Resume/CV documents, past work experience, educational qualifications, technical & functional skills, portfolio links, and preferred salary expectations.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
                    <span><strong>Application Activity:</strong> Jobs viewed, applications submitted, interview schedules, recruiter messages, and saved job bookmarks.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
                    <span><strong>Device & Log Information:</strong> IP address, device type, browser specifications, and timestamps collected automatically to protect against fraudulent accounts and bots.</span>
                  </li>
                </ul>
              </section>

              <hr className="border-gray-100" />

              {/* 3. How We Use */}
              <section id="how-we-use" className="scroll-mt-28">
                <div className="flex items-center gap-2.5 mb-3 text-blue-600">
                  <UserCheck className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    3. How We Use Your Data
                  </h2>
                </div>
                <p className="mb-3">
                  Your information is utilized solely for genuine career and hiring outcomes:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/70">
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Direct Job Applications</h4>
                    <p className="text-xs text-gray-600">Transmitting your profile and resume directly to the hiring HR of companies you explicitly choose to apply for.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/70">
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Status Alerts & Notifications</h4>
                    <p className="text-xs text-gray-600">Sending SMS, email, and in-app alerts when your application is reviewed, shortlisted, or scheduled for an interview.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100/70">
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Skill-Matched Recommendations</h4>
                    <p className="text-xs text-gray-600">Suggesting high-relevance vacancies in your city based on your verified skills and experience level.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/70">
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Anti-Fraud & Verification</h4>
                    <p className="text-xs text-gray-600">Preventing duplicate accounts, ensuring company genuineness, and protecting candidates against fake consultancies.</p>
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* 4. Zero Data Sale */}
              <section id="no-data-sale" className="scroll-mt-28">
                <div className="flex items-center gap-2.5 mb-3 text-emerald-600">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    4. Zero Data Selling Pledge
                  </h2>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-950">
                  <p className="font-bold mb-1">We Never Sell Your Personal Information</p>
                  <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                    ATS operates strictly as a direct hiring portal. We never sell, rent, lease, or monetize candidate phone numbers, email addresses, or resumes to third-party telemarketers, insurance agents, credit card agencies, or external data brokers. Your profile is accessible strictly to employers with verified active vacancies.
                  </p>
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* 5. Profile Visibility */}
              <section id="profile-visibility" className="scroll-mt-28">
                <div className="flex items-center gap-2.5 mb-3 text-blue-600">
                  <Eye className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    5. Profile & Resume Visibility Controls
                  </h2>
                </div>
                <p className="mb-3">
                  You maintain full authority over how your profile is discovered:
                </p>
                <ul className="space-y-2 text-sm pl-2">
                  <li><strong>Active Applications:</strong> When you click &ldquo;Apply&rdquo; for a job, that company&rsquo;s verified HR team will be able to review your full contact information, experience, and uploaded resume.</li>
                  <li><strong>Privacy Settings:</strong> You can choose whether your profile is discoverable in candidate search databases or restrict visibility exclusively to jobs you submit an application to.</li>
                </ul>
              </section>

              <hr className="border-gray-100" />

              {/* 6. Security & Encryption */}
              <section id="data-security" className="scroll-mt-28">
                <div className="flex items-center gap-2.5 mb-3 text-blue-600">
                  <Lock className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    6. Security & Encryption
                  </h2>
                </div>
                <p>
                  We implement robust enterprise-grade safeguards to protect your data from unauthorized access, alteration, or disclosure. All web traffic is strictly encrypted using industry-standard <strong>SSL/TLS protocols (HTTPS)</strong>. Passwords are cryptographically hashed using modern salted bcrypt hashing. Database records are protected behind strict firewalls and role-based access barriers.
                </p>
              </section>

              <hr className="border-gray-100" />

              {/* 7. User Rights */}
              <section id="user-rights" className="scroll-mt-28">
                <div className="flex items-center gap-2.5 mb-3 text-blue-600">
                  <UserCheck className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    7. Your Rights & Data Control
                  </h2>
                </div>
                <p className="mb-3">
                  Under applicable Indian data privacy regulations, you have comprehensive rights regarding your personal information:
                </p>
                <ul className="space-y-2 text-sm pl-2">
                  <li><strong>Right to Access & Edit:</strong> You can view and update your personal details, resume, and experience anytime from your candidate profile dashboard.</li>
                  <li><strong>Right to Withdraw Consent:</strong> You may update communication preferences or opt-out of promotional alerts.</li>
                  <li><strong>Right to Erasure (Account Deletion):</strong> You can request complete deletion of your account and associated resumes by contacting our support team or through your account settings.</li>
                </ul>
              </section>

              <hr className="border-gray-100" />

              {/* 8. Retention */}
              <section id="retention" className="scroll-mt-28">
                <div className="flex items-center gap-2.5 mb-3 text-blue-600">
                  <Database className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    8. Data Retention & Deletion
                  </h2>
                </div>
                <p>
                  We retain your profile data as long as your account remains active to provide continuous job alerts and application status history. If you choose to delete your account, your personal credentials and uploaded documents are permanently purged from active production databases within 30 days, subject to legal compliance requirements.
                </p>
              </section>

              <hr className="border-gray-100" />

              {/* 9. Grievance */}
              <section id="grievance" className="scroll-mt-28">
                <div className="flex items-center gap-2.5 mb-3 text-blue-600">
                  <Mail className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    9. Grievance Redressal & Contact Us
                  </h2>
                </div>
                <p className="mb-4">
                  For questions, clarifications, or requests regarding this Privacy Policy or handling of your data, please contact our designated Grievance Officer:
                </p>
                <div className="bg-slate-50 rounded-2xl border border-gray-100 p-5 space-y-1.5 text-xs sm:text-sm">
                  <p><strong>Grievance & Privacy Officer:</strong> ATS Support Team</p>
                  <p><strong>Organization:</strong> ATS Technology Hiring</p>
                  <p><strong>Email:</strong> <a href="mailto:uniquetech.supt@gmail.com" className="text-blue-600 font-semibold underline">uniquetech.supt@gmail.com</a></p>
                  <p><strong>Official Helpdesk:</strong> <Link href="/contact" className="text-blue-600 font-semibold underline">https://atstechnologyhiring.com/contact</Link></p>
                  <p><strong>Registered Hub:</strong> Jaipur, Rajasthan, India</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </HomepageLayout>
  );
}
