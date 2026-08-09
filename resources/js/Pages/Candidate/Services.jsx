import { Link } from "@inertiajs/react";
import { Search, FileText, Bell, BarChart3, Users, Briefcase, Star, Shield, Zap, ArrowRight, CheckCircle2, Phone, Mail } from "lucide-react";
import HomepageLayout from "@/Layouts/HomepageLayout";
const services = [
  {
    icon: Search,
    title: "Smart Job Search",
    desc: "AI-powered job matching that finds roles based on your skills, experience, and preferences. Never miss the perfect opportunity.",
    features: ["Advanced filters (location, salary, type)", "Keyword search across 12K+ jobs", "Saved searches with alerts", "Remote & hybrid job filtering"],
    color: "text-blue-600", bg: "bg-blue-50", badge: "Free",
  },
  {
    icon: FileText,
    title: "CV Builder & Review",
    desc: "Create a professional, ATS-friendly CV with our templates and get expert feedback to stand out from the crowd.",
    features: ["10+ professional templates", "ATS compatibility check", "Expert CV review service", "Download in PDF/Word"],
    color: "text-purple-600", bg: "bg-purple-50", badge: "Premium",
  },
  {
    icon: Bell,
    title: "Job Alerts",
    desc: "Never miss a job again. Get instant notifications when new jobs matching your profile are posted.",
    features: ["Real-time SMS & email alerts", "Custom keyword alerts", "Daily/weekly digest options", "Company-specific alerts"],
    color: "text-green-600", bg: "bg-green-50", badge: "Free",
  },
  {
    icon: BarChart3,
    title: "Career Insights",
    desc: "Data-driven salary benchmarks, industry trends, and career path guides to help you make informed decisions.",
    features: ["Salary comparison by role & city", "Industry growth trends", "Skills in-demand reports", "Career path guidance"],
    color: "text-orange-600", bg: "bg-orange-50", badge: "Free",
  },
  {
    icon: Users,
    title: "Profile Visibility",
    desc: "Get discovered by top recruiters. A complete profile increases your chances by 5x of being headhunted.",
    features: ["Recruiter search visibility", "Profile completeness score", "Featured candidate badge", "Skills endorsements"],
    color: "text-teal-600", bg: "bg-teal-50", badge: "Premium",
  },
  {
    icon: Shield,
    title: "Application Tracker",
    desc: "Keep track of all your job applications, interview schedules, and follow-ups in one organized dashboard.",
    features: ["Application status tracking", "Interview schedule reminders", "Notes & follow-up tracker", "Success rate analytics"],
    color: "text-indigo-600", bg: "bg-indigo-50", badge: "Free",
  },
];

const plans = [
  {
    name: "Free",
    price: "₹ 0",
    period: "forever",
    desc: "Perfect to get started",
    features: ["Search all jobs", "Apply to 5 jobs/month", "Basic profile", "Email job alerts", "Application tracking"],
    cta: "Get Started Free",
    // ctaLink: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹ 999",
    period: "per month",
    desc: "For serious job seekers",
    features: ["Unlimited job applications", "Priority profile visibility", "CV builder with 10+ templates", "CV expert review (1x/month)", "Real-time SMS alerts", "Salary insights", "Featured candidate badge"],
    cta: "Start Pro Plan",
    // ctaLink: "/register",
    highlighted: true,
  },
  {
    name: "Elite",
    price: "₹ 2,499",
    period: "per month",
    desc: "Accelerate your career",
    features: ["Everything in Pro", "1-on-1 career coaching session", "LinkedIn profile optimization", "Interview preparation kit", "Dedicated recruiter connection", "Priority customer support", "Guaranteed interview within 30 days*"],
    cta: "Go Elite",
    // ctaLink: "/register",
    highlighted: false,
  },
];

const faqs = [
  { q: "Is JobPortal free to use?", a: "Yes! Basic job search and applying is completely free. We offer premium plans for advanced features like unlimited applications and CV review." },
  { q: "How does job matching work?", a: "Our AI analyzes your profile, skills, and past activity to recommend the most relevant jobs. The more complete your profile, the better the matches." },
  { q: "Can employers find me?", a: "Yes, if you enable profile visibility, recruiters can search for and contact you directly based on your skills and experience." },
  { q: "How do I track my applications?", a: "Your dashboard shows all applied jobs with status updates. You'll also get email/SMS notifications when employers view or respond to your application." },
];

export default function Services() {
  return (
        <HomepageLayout>
                <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-700 to-blue-600 text-white py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm px-4 py-1.5 rounded-full mb-4">
            <Zap className="w-4 h-4 text-yellow-300" /> India's Most Comprehensive Job Portal
          </div>
          <h1 className="text-4xl font-bold mb-4">Services Built for Your Success</h1>
          <p className="text-blue-100 text-lg">Everything you need to land your dream job — from search to offer letter</p>
        </div>
      </section>

      {/* Services grid */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">What We Offer</h2>
          <p className="text-gray-500 mt-2">Powerful tools and services designed specifically for Indian job seekers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => (
            <div key={s.title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.badge === "Free" ? "bg-green-50 text-green-700" : "bg-purple-50 text-purple-700"}`}>
                  {s.badge}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{s.desc}</p>
              <ul className="space-y-1.5">
                {s.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
            <p className="text-gray-500 mt-2">Choose a plan that fits your job search needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div key={plan.name} className={`rounded-2xl border p-6 ${plan.highlighted ? "bg-blue-600 border-blue-600 text-white shadow-2xl scale-105" : "bg-white border-gray-100"}`}>
                <div className="mb-4">
                  {plan.highlighted && <span className="text-xs bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded-full mb-2 inline-block">Most Popular</span>}
                  <h3 className={`font-bold text-lg ${plan.highlighted ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
                  <div className={`text-3xl font-bold mt-1 ${plan.highlighted ? "text-white" : "text-gray-900"}`}>{plan.price}</div>
                  <div className={`text-sm ${plan.highlighted ? "text-blue-200" : "text-gray-400"}`}>{plan.period}</div>
                  <p className={`text-sm mt-1 ${plan.highlighted ? "text-blue-100" : "text-gray-500"}`}>{plan.desc}</p>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlighted ? "text-blue-100" : "text-gray-600"}`}>
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlighted ? "text-blue-300" : "text-green-500"}`} />{f}
                    </li>
                  ))}
                </ul>
              <Link href="" className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors ${plan.highlighted ? "bg-white text-blue-700 hover:bg-blue-50" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                  {plan.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="bg-white rounded-2xl border border-gray-100 p-5">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-start gap-2">
                <Star className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />{faq.q}
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Support CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-2">Need Help Choosing?</h3>
          <p className="text-blue-100 mb-6">Our career counselors are here to guide you to the right plan</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+923001234567" className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-xl font-semibold hover:bg-blue-50">
              <Phone className="w-4 h-4" /> +91 9876543210
            </a>
            <a href="mailto:support@jobportal.pk" className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10">
              <Mail className="w-4 h-4" /> support@jobportal.pk
            </a>
          </div>
        </div>
      </section>
    </div></HomepageLayout>
  );
}
