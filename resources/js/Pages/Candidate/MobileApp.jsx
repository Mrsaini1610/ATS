import { useState } from "react";
import { Link, Head } from "@inertiajs/react";
import HomepageLayout from "@/Layouts/HomepageLayout"; // Aapke project layout path ke according adjust karein
import {
  Smartphone, Star, Shield, Bell, Briefcase, MapPin, ChevronRight,
  CheckCircle2, Download, Users, TrendingUp, Zap, Globe, Search,
  BookmarkCheck, FileText, MessageSquare, Award,
} from "lucide-react";

const FEATURES = [
  { icon: Search, title: "Smart Job Search", desc: "AI-powered search finds jobs that match your skills, location & salary expectations.", color: "bg-blue-100 text-blue-600" },
  { icon: Bell, title: "Instant Alerts", desc: "Get notified the moment a new job matching your profile is posted. Never miss an opportunity.", color: "bg-purple-100 text-purple-600" },
  { icon: Briefcase, title: "One-Tap Apply", desc: "Apply to multiple jobs in seconds with your saved profile. No forms, no hassle.", color: "bg-orange-100 text-orange-600" },
  { icon: BookmarkCheck, title: "Save & Track", desc: "Bookmark jobs and track your application status — shortlisted, viewed, and more.", color: "bg-green-100 text-green-600" },
  { icon: FileText, title: "Digital Resume", desc: "Build and share your professional resume. Recruiters can download it directly.", color: "bg-indigo-100 text-indigo-600" },
  { icon: MessageSquare, title: "Chat with Recruiters", desc: "Get direct messages from hiring managers and schedule interviews inside the app.", color: "bg-pink-100 text-pink-600" },
];

const STATS = [
  { value: "50L+", label: "Job Seekers" },
  { value: "2L+", label: "Companies" },
  { value: "10L+", label: "Jobs Posted" },
  { value: "4.8★", label: "App Rating" },
];

const TESTIMONIALS = [
  { name: "Priya Mehta", role: "Software Engineer at Razorpay", city: "Bengaluru", avatar: "PM", color: "bg-blue-500", text: "Got my dream job in 3 weeks! The app sent me the exact right alert at the right time. Highly recommend for anyone in tech." },
  { name: "Rahul Verma", role: "Business Analyst at Meesho", city: "Pune", avatar: "RV", color: "bg-purple-500", text: "The one-tap apply feature is a game changer. Applied to 12 companies in one afternoon and got 4 callbacks!" },
  { name: "Ananya Krishnan", role: "UX Designer at CRED", city: "Chennai", avatar: "AK", color: "bg-teal-500", text: "Best job app in India. The AI job matching is incredibly accurate. Found my dream design role in just 10 days." },
];

const SCREENSHOTS = [
  { label: "Home Feed", bg: "from-blue-600 to-indigo-700", icon: TrendingUp, desc: "Personalized job feed" },
  { label: "Job Search", bg: "from-purple-600 to-violet-700", icon: Search, desc: "Advanced filters" },
  { label: "Notifications", bg: "from-orange-500 to-red-600", icon: Bell, desc: "Real-time alerts" },
  { label: "My Profile", bg: "from-teal-500 to-cyan-600", icon: Users, desc: "Professional profile" },
];

function PhoneMockup({ screen }) {
  return (
    <div className="relative w-36 h-64 mx-auto">
      {/* Phone frame */}
      <div className="absolute inset-0 bg-gray-900 rounded-[2rem] border-4 border-gray-800 shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-gray-800 rounded-full z-10" />
        {/* Screen */}
        <div className={`absolute inset-0 bg-gradient-to-br ${screen.bg} flex flex-col items-center justify-center p-4`}>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-2">
            <screen.icon className="w-6 h-6 text-white" />
          </div>
          <p className="text-white text-xs font-bold text-center">{screen.label}</p>
          <p className="text-white/70 text-xs text-center mt-0.5">{screen.desc}</p>
          {/* Mock UI elements */}
          <div className="mt-3 space-y-1.5 w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-5 bg-white/20 rounded-lg w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MobileApp() {
  const [activeScreen, setActiveScreen] = useState(0);
  const [downloadPlatform, setDownloadPlatform] = useState(null);

  return (
    <>
      <Head title="Mobile App" />
      <HomepageLayout>
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-20">
          {/* Hero */}
          <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 sm:p-12 text-white text-center">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs px-4 py-1.5 rounded-full mb-6 font-medium">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Now Available on Android & iOS · 🇮🇳 Made in India
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
                Find Your Dream Job<br />From Your Pocket
              </h1>
              <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                India's fastest-growing job search app. Browse 10 lakh+ jobs, apply in one tap, and get hired faster — all on your phone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {/* Play Store button */}
                <button onClick={() => setDownloadPlatform("android")} className="group flex items-center gap-3 bg-white text-gray-900 hover:bg-gray-100 px-6 py-3.5 rounded-2xl font-semibold shadow-lg transition-all hover:scale-105">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M3 3.5L13.5 12 3 20.5V3.5Z" fill="#34A853" />
                      <path d="M3 3.5L13.5 12 17.5 8.2 5.2 2.1A1.5 1.5 0 003 3.5Z" fill="#EA4335" />
                      <path d="M3 20.5L13.5 12 17.5 15.8 5.2 21.9A1.5 1.5 0 013 20.5Z" fill="#FBBC05" />
                      <path d="M17.5 8.2L21 10.1a1.9 1.9 0 010 3.8l-3.5 1.9L13.5 12l4-3.8Z" fill="#4285F4" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500">Get it on</p>
                    <p className="text-sm font-bold">Google Play</p>
                  </div>
                </button>
                {/* App Store button */}
                <button onClick={() => setDownloadPlatform("ios")} className="group flex items-center gap-3 bg-white text-gray-900 hover:bg-gray-100 px-6 py-3.5 rounded-2xl font-semibold shadow-lg transition-all hover:scale-105">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500">Download on the</p>
                    <p className="text-sm font-bold">App Store</p>
                  </div>
                </button>
              </div>
              <p className="text-xs text-blue-300 mt-4">Free to download · No subscription · 50L+ happy job seekers</p>
            </div>

            {/* Floating phone preview */}
            <div className="relative mt-10 flex justify-center">
              <div className="relative w-40 h-72 mx-auto">
                <div className="absolute inset-0 bg-gray-900 rounded-[2.5rem] border-4 border-gray-700 shadow-2xl overflow-hidden">
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-800 rounded-full z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col">
                    <div className="h-14" />
                    <div className="px-4 py-3 space-y-2">
                      <div className="h-8 bg-white/90 rounded-xl flex items-center px-3 gap-2">
                        <Search className="w-3.5 h-3.5 text-gray-400" />
                        <div className="h-2 bg-gray-200 rounded flex-1" />
                      </div>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white/20 rounded-xl p-2 flex items-center gap-2">
                          <div className="w-7 h-7 bg-white/30 rounded-lg shrink-0" />
                          <div className="flex-1 space-y-1">
                            <div className="h-2 bg-white/70 rounded w-3/4" />
                            <div className="h-1.5 bg-white/40 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Rating badge */}
              <div className="absolute -right-2 top-8 bg-white text-gray-900 rounded-2xl px-3 py-2 shadow-lg text-xs font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> 4.8/5
              </div>
              <div className="absolute -left-2 bottom-10 bg-white text-gray-900 rounded-2xl px-3 py-2 shadow-lg text-xs font-bold">50L+ Downloads</div>
            </div>
          </section>

          {/* Stats */}
          <section>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STATS.map((s) => (
                <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-3xl font-extrabold text-blue-600">{s.value}</p>
                  <p className="text-sm text-gray-500 mt-1 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* App Screenshots */}
          <section>
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Everything You Need in One App</h2>
              <p className="text-gray-500">Explore the key screens designed for your job hunt</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {SCREENSHOTS.map((s, i) => (
                <button key={i} onClick={() => setActiveScreen(i)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeScreen === i ? "bg-blue-600 text-white shadow-md" : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"}`}>
                  {s.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {SCREENSHOTS.map((s, i) => (
                <div key={i} onClick={() => setActiveScreen(i)} className={`cursor-pointer transition-transform hover:scale-105 ${activeScreen === i ? "scale-105" : ""}`}>
                  <PhoneMockup screen={s} />
                  <p className="text-center text-sm font-medium text-gray-700 mt-3">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section>
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Why 50 Lakh People Trust ATS Jobs</h2>
              <p className="text-gray-500 max-w-xl mx-auto">Purpose-built for India's job market — from freshers to senior professionals</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow group">
                  <div className={`w-11 h-11 ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1.5">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 sm:p-12">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Get Hired in 3 Simple Steps</h2>
              <p className="text-gray-500">The fastest way from download to offer letter</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-8 relative">
              {[
                { step: "01", icon: Download, title: "Download the App", desc: "Install ATS Jobs free on Android or iOS. No hidden charges, ever.", color: "bg-blue-600" },
                { step: "02", icon: Users, title: "Build Your Profile", desc: "Add your skills, experience, and preferred location in under 5 minutes.", color: "bg-purple-600" },
                { step: "03", icon: Zap, title: "Apply & Get Hired", desc: "Apply to matching jobs with one tap. Interviews, offers — right on the app.", color: "bg-green-600" },
              ].map((s, i) => (
                <div key={i} className="text-center relative">
                  {i < 2 && <div className="hidden sm:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent -translate-x-1/2 z-0" />}
                  <div className={`relative z-10 w-16 h-16 ${s.color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                    <s.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.step}</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Testimonials */}
          <section>
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Real Success Stories from India 🇮🇳</h2>
              <p className="text-gray-500">Join lakhs of professionals who found their dream jobs</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-5 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${t.color} rounded-xl flex items-center justify-center text-white text-xs font-bold`}>{t.avatar}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {t.city}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Banner */}
          <section className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="dots2" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="3" cy="3" r="1.5" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots2)" />
              </svg>
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Globe className="w-4 h-4" /> Available across all of India 🇮🇳
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-3">Ready to Find Your Next Job?</h2>
              <p className="text-blue-100 mb-8 max-w-xl mx-auto">Download ATS Jobs now and join 50 lakh+ job seekers across India who are already getting hired.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-2xl font-bold shadow-xl transition-all hover:scale-105">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3.5L13.5 12 3 20.5V3.5Z" fill="#34A853" />
                    <path d="M3 3.5L13.5 12 17.5 8.2 5.2 2.1A1.5 1.5 0 003 3.5Z" fill="#EA4335" />
                    <path d="M3 20.5L13.5 12 17.5 15.8 5.2 21.9A1.5 1.5 0 013 20.5Z" fill="#FBBC05" />
                    <path d="M17.5 8.2L21 10.1a1.9 1.9 0 010 3.8l-3.5 1.9L13.5 12l4-3.8Z" fill="#4285F4" />
                  </svg>
                  <div className="text-left">
                    <p className="text-xs text-gray-500">Get it on</p>
                    <p className="font-bold">Google Play</p>
                  </div>
                </button>
                <button className="flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-2xl font-bold shadow-xl transition-all hover:scale-105">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-xs text-gray-500">Download on the</p>
                    <p className="font-bold">App Store</p>
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* Back to web */}
          <div className="text-center pb-4">
            <p className="text-sm text-gray-500 mb-3">Or continue using our web platform</p>
            <Link href="/candidate/search" className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline">
              Browse Jobs on Web <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Download modal */}
          {downloadPlatform && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
              <div className="bg-white rounded-2xl p-7 max-w-sm w-full text-center shadow-2xl">
                <div className={`w-16 h-16 ${downloadPlatform === "android" ? "bg-green-50" : "bg-gray-100"} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Smartphone className={`w-8 h-8 ${downloadPlatform === "android" ? "text-green-600" : "text-gray-700"}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Coming Soon! 🚀</h3>
                <p className="text-sm text-gray-500 mb-2">
                  ATS Jobs for <strong>{downloadPlatform === "android" ? "Android" : "iOS"}</strong> is currently in development.
                </p>
                <p className="text-sm text-gray-400 mb-6">Leave your number and we'll notify you the moment it launches.</p>
                <div className="flex gap-2 mb-4">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-x-1/2 text-gray-400 text-sm">+91</span>
                    <input type="tel" placeholder="Phone number" className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <button className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium">Notify Me</button>
                </div>
                <button onClick={() => setDownloadPlatform(null)} className="text-xs text-gray-400 hover:text-gray-600">
                  Maybe later
                </button>
              </div>
            </div>
          )}
        </div>
      </HomepageLayout>
    </>
  );
}