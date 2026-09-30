import React, { useState } from "react";
import { Link, Head } from "@inertiajs/react";
import HomepageLayout from "@/Layouts/HomepageLayout";
import {
  Search,
  FileText,
  Bell,
  BarChart3,
  Users,
  Briefcase,
  Star,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Phone,
  Mail,
  ChevronDown,
  Sparkles,
  Award,
  Headphones,
  Check,
} from "lucide-react";

const SERVICES = [
  {
    icon: Search,
    title: "AI Job Matching",
    desc: "Intelligent matchmaking that evaluates your skills, experience, and preferred Indian cities to suggest jobs where you have highest interview chances.",
    features: [
      "Custom match score for every job post",
      "City & locality filtering (e.g. Vaishali Nagar, Koramangala)",
      "Remote, hybrid & on-site role preferences",
      "Salary expectation alignment",
    ],
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
    badge: "Free",
  },
  {
    icon: FileText,
    title: "ATS Resume Builder & Checker",
    desc: "Create clean, ATS-compliant resumes designed to pass corporate applicant tracking systems without getting filtered out.",
    features: [
      "ATS-friendly formatting and templates",
      "Keyword optimization for target job roles",
      "Instant PDF download ready for recruiters",
      "Resume parsing score feedback",
    ],
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-100",
    badge: "Free",
  },
  {
    icon: Bell,
    title: "Instant WhatsApp & SMS Alerts",
    desc: "Never miss an opportunity. Get real-time notifications the minute verified employers in your city post jobs matching your domain.",
    features: [
      "Zero-latency WhatsApp interview alerts",
      "Custom skill & location alert preferences",
      "Daily or instant digest options",
      "Notice when HR reviews your application",
    ],
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-100",
    badge: "Free",
  },
  {
    icon: BarChart3,
    title: "Verified Salary Benchmarks",
    desc: "Data-driven compensation insights across major Indian metropolitan areas so you always negotiate with confidence.",
    features: [
      "In-hand vs CTC breakdowns for India",
      "City-wise salary comparisons (Tier-1 vs Tier-2)",
      "Experience-based compensation brackets",
      "Annual increment trends by industry",
    ],
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-100",
    badge: "Free",
  },
  {
    icon: Users,
    title: "Direct Recruiter Discovery",
    desc: "Make your verified candidate profile visible directly to verified HR managers actively hiring for your specialization.",
    features: [
      "Direct employer connection without consultants",
      "Profile completeness badge for top search ranking",
      "Verified skill endorsements",
      "Privacy controls to hide from current employer",
    ],
    color: "text-teal-600",
    bg: "bg-teal-50 border-teal-100",
    badge: "Pro",
  },
  {
    icon: ShieldCheck,
    title: "End-to-End Application Tracker",
    desc: "Track every job application with transparent milestone steps: Submitted, Viewed, Shortlisted, Interview Scheduled, and Offer.",
    features: [
      "Live status updates in your dashboard",
      "Interview calendar & countdown timer",
      "Direct reapply eligibility notifications",
      "Application history and documentation vault",
    ],
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-100",
    badge: "Free",
  },
];

const PLANS = [
  {
    name: "Candidate Basic",
    price: "₹ 0",
    period: "Forever Free",
    desc: "Everything you need to search and apply for verified jobs across India.",
    features: [
      "Search all 35,000+ verified active jobs",
      "Unlimited job applications with zero fees",
      "Verified digital candidate profile",
      "Email & dashboard status notifications",
      "Real-time application progress tracking",
      "Direct employer connections (No consultants)",
    ],
    cta: "Get Started Free",
    ctaLink: "/register",
    highlighted: false,
  },
  {
    name: "Career Pro",
    price: "₹ 499",
    period: "for 3 months",
    desc: "Accelerate your callbacks with priority profile placement and ATS review.",
    features: [
      "Everything in Candidate Basic",
      "Priority candidate badge on recruiter dashboards",
      "Instant WhatsApp interview & status alerts",
      "Professional ATS resume scorecard review",
      "Direct profile visibility to 15,000+ HRs",
      "Detailed salary & compensation benchmark reports",
      "3x higher callback rate from top employers",
    ],
    cta: "Join Career Pro",
    ctaLink: "/register",
    highlighted: true,
  },
  {
    name: "Career Accelerator",
    price: "₹ 1,499",
    period: "one-time guidance",
    desc: "Personalized 1-on-1 career assistance for senior & specialized roles.",
    features: [
      "Everything in Career Pro",
      "1-on-1 resume & portfolio revamp by senior HR expert",
      "Mock technical & HR interview preparation session",
      "Dedicated talent advisor for target companies",
      "LinkedIn profile optimization guide",
      "Priority customer & callback support",
    ],
    cta: "Contact Career Advisor",
    ctaLink: "/contact",
    highlighted: false,
  },
];

const FAQS = [
  {
    q: "Is applying to jobs on ATS 100% free?",
    a: "Yes! Job searching, applying, and tracking applications is completely free for all candidates. We never charge any placement or application fees from job seekers.",
  },
  {
    q: "How does the platform prevent fake or consultancy job posts?",
    a: "All employers registered on our platform undergo business verification (GST / CIN / Official domain). We strictly ban third-party fee-charging consultancies, ensuring you connect only with genuine direct employers.",
  },
  {
    q: "How quickly do recruiters respond to applications?",
    a: "Because employers manage their hiring directly through our ATS portal, candidates typically receive application feedback or interview invites within 2 to 5 business days.",
  },
  {
    q: "Can my current employer see that I am looking for a job?",
    a: "You have full control over your profile visibility. You can choose to apply privately to select jobs or block specific companies from discovering your profile in recruiter search.",
  },
  {
    q: "What is an ATS-friendly resume and why does it matter?",
    a: "An Applicant Tracking System (ATS) scans resumes for relevant keywords, clear typography, and standard section headings before human HRs see it. Our builder ensures your resume parses cleanly with high relevance scores.",
  },
];

export default function Services() {
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  return (
    <>
      <Head>
        <title>Career Services & Candidate Tools | ATS Job Portal India</title>
        <meta
          name="description"
          content="Explore career services on ATS: verified digital candidate profiles, real-time application tracking, direct recruiter chat, and interview scheduling."
        />
        <meta
          name="keywords"
          content="career services, resume review, ATS job tools, job application tracking, candidate tools India"
        />
      </Head>
      <HomepageLayout>
        <div className="bg-slate-50/50">
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-700 to-indigo-800 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs sm:text-sm font-semibold mb-6 border border-white/20 shadow-inner">
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>Career Acceleration Tools for Indian Professionals</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
                Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-purple-200">Get Hired Faster</span>
              </h1>

              <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed mb-8">
                From intelligent job matching and ATS resume optimization to direct recruiter connect and salary benchmarks — built to power your career growth.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/job-search"
                  className="px-6 py-3.5 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-2xl text-sm transition-all shadow-md inline-flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Start Job Search</span>
                </Link>
                <a
                  href="#plans-section"
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold rounded-2xl text-sm transition-all backdrop-blur-xs inline-flex items-center gap-2"
                >
                  <span>Explore Plans</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[250px] bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          </section>

          {/* Services Grid */}
          <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3 border border-blue-100">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Feature Suite</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Tools Designed for Candidate Success
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Cutting-edge recruitment technology tailored specifically for the Indian job market
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SERVICES.map((s) => (
                <div
                  key={s.title}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-6 sm:p-7 hover:shadow-xl hover:border-blue-200 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div className={`w-13 h-13 rounded-2xl ${s.bg} border flex items-center justify-center shrink-0`}>
                        <s.icon className={`w-6 h-6 ${s.color}`} />
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        s.badge === "Free"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-purple-50 text-purple-700 border border-purple-100"
                      }`}>
                        {s.badge}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      {s.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-5">
                      {s.desc}
                    </p>

                    <ul className="space-y-2 pt-4 border-t border-gray-100 mb-4">
                      {s.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Transparent Plans */}
          <section id="plans-section" className="bg-white border-y border-gray-100 py-16 sm:py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3 border border-blue-100">
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                  <span>Transparent Pricing</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Choose the Plan That Fits Your Ambition
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  100% free for standard job search. Upgrade anytime for priority discovery.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {PLANS.map((plan) => (
                  <div
                    key={plan.name}
                    className={`rounded-3xl border p-7 flex flex-col justify-between transition-all duration-200 relative ${
                      plan.highlighted
                        ? "bg-gradient-to-b from-blue-600 to-indigo-700 border-blue-600 text-white shadow-2xl scale-102 sm:scale-105 z-10"
                        : "bg-white border-gray-200/90 text-gray-900 shadow-sm hover:shadow-lg"
                    }`}
                  >
                    <div>
                      {plan.highlighted && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider bg-amber-400 text-amber-950 px-3 py-0.5 rounded-full mb-3">
                          <Sparkles className="w-3 h-3" /> Most Popular
                        </div>
                      )}

                      <h3 className={`font-bold text-xl ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                        {plan.name}
                      </h3>

                      <div className="flex items-baseline gap-1 mt-2 mb-1">
                        <span className={`text-3xl sm:text-4xl font-black ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                          {plan.price}
                        </span>
                        <span className={`text-xs ${plan.highlighted ? "text-blue-200" : "text-gray-500"}`}>
                          / {plan.period}
                        </span>
                      </div>

                      <p className={`text-xs sm:text-sm mt-1 mb-6 ${plan.highlighted ? "text-blue-100" : "text-gray-500"}`}>
                        {plan.desc}
                      </p>

                      <ul className="space-y-2.5 mb-8 pt-4 border-t border-gray-100/20">
                        {plan.features.map((f, i) => (
                          <li
                            key={i}
                            className={`flex items-start gap-2.5 text-xs sm:text-sm ${
                              plan.highlighted ? "text-blue-50" : "text-gray-600"
                            }`}
                          >
                            <Check
                              className={`w-4 h-4 shrink-0 mt-0.5 ${
                                plan.highlighted ? "text-amber-300" : "text-emerald-500"
                              }`}
                            />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* <Link
                      href={plan.ctaLink}
                      className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                        plan.highlighted
                          ? "bg-white text-blue-700 hover:bg-blue-50"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      <span>{plan.cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link> */}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Interactive FAQs Accordion */}
          <section className="max-w-3xl mx-auto px-4 py-16 sm:py-20">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Have questions about our services? We have got you covered.
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-2xs transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
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
                      <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-50 bg-slate-50/30">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Support Helpline & Counseling */}
          <section className="max-w-4xl mx-auto px-4 pb-16 sm:pb-20 text-center">
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-6 h-6 text-yellow-300" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold mb-2">
                Need Help Choosing the Right Path?
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 max-w-md mx-auto mb-6 leading-relaxed">
                Our career counselors and support executives in India are available to assist you Monday through Saturday, 9:00 AM – 6:30 PM IST.
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
                <a
                  href="tel:+9118002004567"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-50 transition shadow-xs"
                >
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>Toll-Free: 1800-200-4567</span>
                </a>

                <a
                  href="mailto:support@atsjobs.in"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/25 text-white rounded-xl text-xs sm:text-sm font-bold transition backdrop-blur-xs"
                >
                  <Mail className="w-4 h-4" />
                  <span>support@atsjobs.in</span>
                </a>
              </div>
            </div>
          </section>
        </div>
      </HomepageLayout>
    </>
  );
}
