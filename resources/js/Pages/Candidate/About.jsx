import React from "react";
import { Link, Head } from "@inertiajs/react";
import HomepageLayout from "@/Layouts/HomepageLayout";
import {
  Users,
  Award,
  Target,
  Heart,
  CheckCircle2,
  ArrowRight,
  Star,
  Briefcase,
  TrendingUp,
  Globe,
  ShieldCheck,
  Zap,
  Building2,
  Sparkles,
  MapPin,
  Clock,
  Compass,
} from "lucide-react";

const STATS = [
  { value: "10 Lakh+", label: "Verified Job Seekers" },
  { value: "15,000+", label: "Partner Companies" },
  { value: "35,000+", label: "Live Job Openings" },
  { value: "₹0", label: "Fee for Candidates (100% Free)" },
];

const VALUES = [
  {
    icon: Target,
    title: "Direct Employer Access",
    desc: "We connect you directly to company HRs and hiring managers. No middleman agencies, no consultancies, and zero hidden charges.",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
  },
  {
    icon: ShieldCheck,
    title: "100% Verified Vacancies",
    desc: "Every company profile and job post undergoes automated and manual verification to guarantee genuine, safe employment opportunities.",
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-100",
  },
  {
    icon: Zap,
    title: "Fast-Track Hiring",
    desc: "Instant status updates on your applications. Get notified when your resume is viewed, shortlisted, or scheduled for interview.",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-100",
  },
  {
    icon: Globe,
    title: "Pan-India Reach",
    desc: "Deep coverage across Tier-1 metros (Bengaluru, Delhi NCR, Mumbai) and fast-growing hubs (Jaipur, Pune, Hyderabad, Ahmedabad).",
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-100",
  },
];

const COMPARISON = [
  {
    traditional: "Expensive consultancy fees & fake job promises",
    ats: "100% Free for candidates with verified real employers",
  },
  {
    traditional: "Zero feedback on resume status or ghosting",
    ats: "Real-time application tracking with SMS/WhatsApp alerts",
  },
  {
    traditional: "Vague salaries and undisclosed compensations",
    ats: "Transparent salary ranges & verified CTC benchmarks",
  },
  {
    traditional: "Lengthy multi-step third-party form fills",
    ats: "One-click apply with your verified digital profile",
  },
];

const MILESTONES = [
  {
    year: "2021",
    title: "Platform Launch",
    desc: "Founded in Jaipur & Bengaluru with 100 pioneer enterprise & tech employers committed to direct hiring.",
  },
  {
    year: "2022",
    title: "1 Lakh Candidates",
    desc: "Reached our first 100,000 registered professionals and introduced instant WhatsApp interview reminders.",
  },
  {
    year: "2023",
    title: "Mobile App Rollout",
    desc: "Launched native iOS and Android apps with 5 Lakh+ downloads across India.",
  },
  {
    year: "2024",
    title: "AI-Powered Matching",
    desc: "Integrated smart skill-based matching and locality search across 25+ top Indian cities.",
  },
  {
    year: "2025-2026",
    title: "Nationwide Scale",
    desc: "Over 10 Lakh job seekers, 15,000+ verified partner enterprises, and India's highest direct placement ratio.",
  },
];

const TEAM = [
  {
    name: "Rajesh Sharma",
    role: "Founder & CEO",
    exp: "15+ yrs in HR Tech & Enterprise Software",
    avatar: "RS",
    color: "from-blue-600 to-indigo-600",
  },
  {
    name: "Neha Patel",
    role: "Co-Founder & Head of Product",
    exp: "12+ yrs in UX & Candidate Platforms",
    avatar: "NP",
    color: "from-purple-600 to-pink-600",
  },
  {
    name: "Amit Verma",
    role: "Chief Technology Officer",
    exp: "14+ yrs in AI Matching & Cloud Systems",
    avatar: "AV",
    color: "from-indigo-600 to-blue-700",
  },
  {
    name: "Pooja Iyer",
    role: "Head of Employer Relations",
    exp: "10+ yrs in Corporate Talent Partnerships",
    avatar: "PI",
    color: "from-emerald-600 to-teal-600",
  },
];

const TESTIMONIALS = [
  {
    name: "Rohit Joshi",
    role: "Frontend Engineer",
    company: "Razorpay, Bengaluru",
    text: "Applied directly to tech openings without dealing with annoying consultancy calls. Got interview scheduled in 48 hours and received the offer in 2 weeks!",
    rating: 5,
  },
  {
    name: "Kavita Mathur",
    role: "HR & Operations Specialist",
    company: "Corporate Services, Jaipur",
    text: "The locality filter allowed me to find a verified corporate role just 15 minutes away from my home in Vaishali Nagar with full salary transparency.",
    rating: 5,
  },
  {
    name: "Siddharth Nair",
    role: "Product Analyst",
    company: "Fintech Startup, Mumbai",
    text: "The real-time status tracker was incredible. I knew the moment the HR opened my resume. The best and most authentic job platform in India!",
    rating: 5,
  },
];

export default function About() {
  return (
    <>
      <Head title="About Us - ATS" />
      <HomepageLayout>
        <div className="bg-slate-50/50">
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs sm:text-sm font-semibold mb-6 border border-white/20 shadow-inner">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>India's Trusted Direct Hiring Platform</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
                Connecting India's Talent With <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-purple-200">Verified Careers</span>
              </h1>

              <p className="text-base sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed mb-8">
                We believe that finding meaningful work should be direct, transparent, and completely free of third-party middlemen. Built for ambitious Indian job seekers and genuine employers.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/job-search"
                  className="px-6 py-3.5 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-2xl text-sm transition-all shadow-md inline-flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Explore Open Jobs</span>
                </Link>
                <Link
                  href="/companies"
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold rounded-2xl text-sm transition-all backdrop-blur-xs inline-flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>View Verified Employers</span>
                </Link>
              </div>
            </div>

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          </section>

          {/* Quick Metrics Bar */}
          <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {STATS.map((s) => (
                <div key={s.label} className="space-y-1">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                    {s.value}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-500">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Why We Are Different: Comparison Card */}
          <section className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3 border border-blue-100">
                <Compass className="w-3.5 h-3.5" />
                <span>The ATS Difference</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Why Job Seekers Choose Us
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Say goodbye to ghost jobs, middleman charges, and endless unverified listings.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm divide-y divide-gray-100">
              {COMPARISON.map((c, i) => (
                <div key={i} className="py-4 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="flex items-center gap-3 text-sm text-gray-500 line-through decoration-red-400">
                    <span className="w-6 h-6 rounded-full bg-red-50 text-red-600 font-bold flex items-center justify-center shrink-0 text-xs">
                      ✕
                    </span>
                    <span>{c.traditional}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm font-bold text-gray-900">
                    <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0 text-xs">
                      ✓
                    </span>
                    <span className="text-emerald-900">{c.ats}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Core Values */}
          <section className="max-w-6xl mx-auto px-4 pb-16 sm:pb-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Our Core Commitments
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Guiding principles that power our candidate-first ecosystem
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {VALUES.map((v) => (
                <div
                  key={v.title}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-2xl ${v.bg} border flex items-center justify-center mb-4`}>
                      <v.icon className={`w-6 h-6 ${v.color}`} />
                    </div>
                    <h3 className="font-bold text-base text-gray-900 mb-2">
                      {v.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Milestones / Journey */}
          <section className="bg-white border-y border-gray-100 py-16 sm:py-20 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3 border border-blue-100">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Growth & Impact</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Our Journey Across India
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Building the future of recruitment from ground up
                </p>
              </div>

              <div className="relative pl-6 sm:pl-8 border-l-2 border-blue-200 space-y-7">
                {MILESTONES.map((m, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-[31px] sm:-left-[39px] w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-full border-4 border-white shadow-xs group-hover:scale-125 transition-transform" />
                    <div className="bg-slate-50/80 rounded-2xl border border-gray-100 p-5 hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="text-xs font-extrabold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full">
                          {m.year}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                          {m.title}
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {m.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Leadership Team */}
          <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Leadership Team
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Seasoned technology and talent leaders building a better hiring future for India
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {TEAM.map((member) => (
                <div
                  key={member.name}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-6 text-center hover:shadow-lg transition-all"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.color} text-white flex items-center justify-center font-bold text-lg mx-auto mb-4 shadow-sm`}>
                    {member.avatar}
                  </div>
                  <h4 className="font-bold text-gray-900 text-base">
                    {member.name}
                  </h4>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">
                    {member.role}
                  </p>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    {member.exp}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Verified Testimonials */}
          <section className="bg-slate-100/60 border-t border-gray-100 py-16 sm:py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Trusted by Job Seekers
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Real experiences from candidates placed at top Indian organizations
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TESTIMONIALS.map((t) => (
                  <div
                    key={t.name}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex gap-1 mb-3">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 italic mb-5 leading-relaxed">
                        "{t.text}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-sm font-bold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t.role} • {t.company}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* High-Converting CTA */}
          <section className="max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">
                Ready to Accelerate Your Career?
              </h2>
              <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto mb-8 leading-relaxed">
                Join 10 Lakh+ professionals discovering direct career opportunities without third-party fees.
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
                <Link
                  href="/register"
                  className="px-8 py-3.5 bg-white text-blue-700 font-bold rounded-2xl text-sm hover:bg-blue-50 transition shadow-sm inline-flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Create Free Account</span>
                </Link>

                <Link
                  href="/job-search"
                  className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold rounded-2xl text-sm transition backdrop-blur-xs inline-flex items-center justify-center gap-2"
                >
                  <span>Browse Jobs</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <p className="mt-6 text-xs text-blue-100">
                Have questions or need assistance?{" "}
                <Link href="/contact" className="text-white underline font-bold hover:text-blue-50 transition">
                  Contact Support &rarr;
                </Link>
              </p>

              {/* Decorative Circle */}
              <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            </div>
          </section>
        </div>
      </HomepageLayout>
    </>
  );
}
