import React, { useState, useMemo } from "react";
import { Head, Link } from "@inertiajs/react";
import HomepageLayout from "@/Layouts/HomepageLayout";
import {
  HelpCircle,
  Search,
  ChevronDown,
  Briefcase,
  UserCheck,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const FAQ_DATA = [
  {
    category: "candidates",
    q: "Is ATS really 100% free for job seekers?",
    a: "Yes, absolutely! Job search, profile creation, resume uploads, direct job applications, and interview scheduling on ATS are completely 100% free for candidates forever. We never charge any registration fees, processing charges, or placement commissions. If anyone asks you for money in exchange for a job, please report them immediately.",
  },
  {
    category: "candidates",
    q: "How do I apply for jobs on ATS?",
    a: "Browse active job openings on our 'Jobs' page or use the search bar to find roles by title, skill, or city (e.g. Jaipur, Delhi NCR, Mumbai, Bengaluru). Click 'Apply Now' on any vacancy, verify your details, attach your updated resume, and submit. Your application is sent directly to the employer's HR team.",
  },
  {
    category: "candidates",
    q: "Can freshers apply for jobs on ATS?",
    a: "Yes! A significant portion of verified job openings on ATS are tailored specifically for freshers and entry-level talent across industries like Customer Support, Telecalling, Sales, IT Development, Digital Marketing, and Operations. You can filter vacancies by 'Fresher Only' or '0-1 Years Experience'.",
  },
  {
    category: "applications",
    q: "How does the live application status tracking work?",
    a: "Once you submit an application, you can track its real-time progress under 'My Applications' in your dashboard. You will see live statuses: 'Submitted', 'Under Review by HR', 'Shortlisted', 'Interview Scheduled', or 'Decision Finalized'. You also receive instant status notifications.",
  },
  {
    category: "applications",
    q: "How will companies contact me for interviews?",
    a: "When a hiring manager reviews and shortlists your application, they can directly contact you via telephone call, WhatsApp, or email based on the verified contact details in your profile. You will also see interview time slots and details right on your ATS dashboard.",
  },
  {
    category: "applications",
    q: "Can I apply to multiple jobs at the same time?",
    a: "Yes, you can apply to as many relevant job openings as you like. We encourage candidates to review job requirements, required skills, and work locations carefully before submitting to maximize their callback rate.",
  },
  {
    category: "privacy",
    q: "Is my personal data and resume safe on ATS?",
    a: "We take privacy very seriously. We strictly DO NOT sell, rent, or trade your contact information to third-party telemarketing agencies or brokers. Your resume and contact details are accessible strictly to registered, verified employers whose jobs you apply to.",
  },
  {
    category: "privacy",
    q: "What should I do if a recruiter asks for registration or security fees?",
    a: "ATS maintains a strict zero-tolerance policy against consultancy fees and fraud. Do not pay any money. Report the job post immediately or email our grievance team at uniquetech.supt@gmail.com with the employer's name and contact information. We take strict legal action and permanently ban offenders.",
  },
  {
    category: "employers",
    q: "How do companies post jobs and verify their employer accounts?",
    a: "Employers can register on the ATS Employer portal by providing their company details, official email, and GST/incorporation information. Once verified by our moderation team, HRs can post verified openings and directly interview applicants.",
  },
  {
    category: "employers",
    q: "How are employers on ATS verified?",
    a: "Our moderation team conducts automated and manual verifications of every business profile, checking corporate website existence, official company domains, and authentic business registrations before approving job vacancies.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Questions", icon: HelpCircle },
  { id: "candidates", label: "For Job Seekers", icon: UserCheck },
  { id: "applications", label: "Applications & Status", icon: Briefcase },
  { id: "privacy", label: "Free Policy & Security", icon: ShieldCheck },
  { id: "employers", label: "For Employers", icon: Building2 },
];

export default function Faq() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(0);

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  // Google Schema.org FAQPage structured data for rich SERP snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_DATA.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a,
      },
    })),
  };

  return (
    <HomepageLayout>
      <Head>
        <title>Frequently Asked Questions (FAQs) | ATS - Direct Hiring</title>
        <meta
          name="description"
          content="Find answers to common questions about ATS job search, 100% free candidate policy, real-time application status tracking, and verified company direct interviews."
        />
        <meta
          name="keywords"
          content="ATS FAQs, job portal questions, free job search help, how to apply ATS, candidate helpdesk India"
        />
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Head>

      <div className="bg-slate-50/50 min-h-screen pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs sm:text-sm font-semibold mb-4 border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Got Questions? We Have Answers</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
              Frequently Asked Questions
            </h1>
            <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-6">
              Everything you need to know about searching, applying, and getting hired through ATS with zero fees.
            </p>

            {/* Instant Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions (e.g. free, apply, status, interviews)..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white text-gray-900 placeholder-gray-400 text-sm font-medium shadow-xl outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>
          </div>

          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* FAQ Navigation & List */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200/70"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Accordion Questions */}
          {filteredFaqs.length > 0 ? (
            <div className="space-y-3.5">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-2xs transition-all hover:border-gray-200"
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(index)}
                      className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                    >
                      <span className="font-bold text-sm sm:text-base text-gray-900">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-blue-600" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-50 bg-slate-50/30">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center bg-white rounded-3xl p-10 border border-gray-100 shadow-xs">
              <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800 mb-1">
                No matching questions found
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                We couldn't find any questions matching &ldquo;{searchQuery}&rdquo;. Try another search term or ask our support team directly.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Need More Help Box */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-100/80 rounded-3xl p-6 sm:p-8 text-center shadow-xs">
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2">
              Still Have Questions?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto mb-5 leading-relaxed">
              Our candidate assistance team is here to help you navigate your job search, interview calls, or profile queries.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-700 transition shadow-md shadow-blue-600/20 inline-flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Helpdesk</span>
              </Link>
              <Link
                href="/job-search"
                className="w-full sm:w-auto px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-50 transition inline-flex items-center justify-center gap-2"
              >
                <span>Browse All Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </HomepageLayout>
  );
}
