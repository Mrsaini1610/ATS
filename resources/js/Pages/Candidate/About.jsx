import { Link } from "@inertiajs/react";
import HomepageLayout from "@/Layouts/HomepageLayout";
import { Users, Award, Target, Heart, CheckCircle2, ArrowRight, Star, Briefcase, TrendingUp, Globe } from "lucide-react";

const team = [
  { name: "Farhan Ahmed", role: "CEO & Founder", exp: "15 years in HR Tech", emoji: "👨‍💼" },
  { name: "Sachin ", role: "CTO", exp: "12 years in Software", emoji: "👩‍💻" },
  { name: "Bilal Hassan", role: "Head of Operations", exp: "10 years in Operations", emoji: "👨‍🔧" },
  { name: "Amina Siddiq", role: "Head of Marketing", exp: "8 years in Digital Marketing", emoji: "👩‍🎨" },
];

const values = [
  { icon: Target, title: "Our Mission", desc: "To connect every talented Indian professional with their dream employer through technology and human insight.", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Heart, title: "Our Vision", desc: "A India where no talent goes to waste — where every skilled person finds meaningful, well-paying work.", color: "text-red-600", bg: "bg-red-50" },
  { icon: Award, title: "Our Values", desc: "Transparency, integrity, and candidate-first approach in everything we do. Your success is our success.", color: "text-purple-600", bg: "bg-purple-50" },
  { icon: Globe, title: "Our Reach", desc: "Operating across all major cities in India with growing presence in UAE, Saudi Arabia, and the UK.", color: "text-green-600", bg: "bg-green-50" },
];

const milestones = [
  { year: "2018", title: "Founded", desc: "JobPortal launched in India with 50 listed companies" },
  { year: "2019", title: "Expansion", desc: "Expanded to Jaipur $ Raipur, 500+ companies onboarded" },
  { year: "2020", title: "Digital Surge", desc: "Remote jobs feature launched during pandemic, 300% growth" },
  { year: "2021", title: "10,000 Placements", desc: "Celebrated 10,000 successful job placements" },
  { year: "2022", title: "Mobile App", desc: "Launched iOS & Android apps with 100K+ downloads" },
  { year: "2023", title: "AI Features", desc: "Introduced AI-powered job matching and resume screening" },
  { year: "2024", title: "Top Award", desc: "Won India's Best HR Tech Platform award" },
  { year: "2026", title: "Today", desc: "85,000+ candidates placed, 3,200+ partner companies" },
];

const testimonials = [
  { name: "Zainab M.", role: "Software Engineer", company: "TechCorp PK", text: "JobPortal ne meri zindagi badal di! 3 hafte mein dream job mil gaya. Filters aur search bahut easy hai.", rating: 5 },
  { name: "Omar F.", role: "Marketing Manager", company: "E-commerce PK", text: "Best platform for job search in India. Got 5 interview calls within a week of registering!", rating: 5 },
  { name: "Hina R.", role: "UI/UX Designer", company: "Creative Studio", text: "The company profiles are so detailed. I knew exactly what I was applying to. Highly recommended!", rating: 5 },
];

export default function About() {
  return (
    <HomepageLayout><div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">About JobPortal India</h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            We started with a simple belief: every talented Indian deserves a job that matches their potential. Since 2018, we've been building that bridge — one placement at a time.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-100 py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "85K+", label: "Candidates Placed" },
            { value: "3,200+", label: "Partner Companies" },
            { value: "12K+", label: "Live Jobs" },
            { value: "94%", label: "Satisfaction Rate" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-blue-700">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">What Drives Us</h2>
          <p className="text-gray-500 mt-2">The principles and purpose behind everything we build</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v) => (
            <div key={v.title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all">
              <div className={`w-12 h-12 ${v.bg} rounded-xl flex items-center justify-center mb-4`}>
                <v.icon className={`w-6 h-6 ${v.color}`} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Journey / Milestones */}
      <section className="bg-gray-50 py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" /> Our Journey
            </h2>
            <p className="text-gray-500 mt-2">From a small startup to India's leading job portal</p>
          </div>
          <div className="relative pl-8 border-l-2 border-blue-200 space-y-6">
            {milestones.map((m, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[29px] w-5 h-5 bg-blue-600 rounded-full border-4 border-white shadow" />
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{m.year}</span>
                    <h4 className="font-semibold text-gray-900 text-sm">{m.title}</h4>
                  </div>
                  <p className="text-sm text-gray-500">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Meet Our Team</h2>
          <p className="text-gray-500 mt-2">The passionate people building India's job future</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {team.map((member) => (
            <div key={member.name} className="bg-white rounded-2xl border border-gray-100 p-5 text-center hover:shadow-md transition-all">
              <div className="text-4xl mb-3">{member.emoji}</div>
              <h4 className="font-semibold text-gray-900 text-sm">{member.name}</h4>
              <p className="text-xs text-blue-600 mt-0.5">{member.role}</p>
              <p className="text-xs text-gray-400 mt-1">{member.exp}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-blue-50 py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">What Candidates Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                </div>
                <p className="text-sm text-gray-600 italic mb-4">"{t.text}"</p>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role} at {t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-14 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to Start Your Journey?</h2>
        <p className="text-gray-500 mb-8">Join 85,000+ professionals who found their dream jobs through JobPortal</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href=""
            className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Create Free Account
          </Link>

          <Link
            href="/job-search"
            className="px-8 py-3.5 border-2 border-blue-600 text-blue-600 rounded-2xl font-semibold hover:bg-blue-50 flex items-center justify-center gap-2"
          >
            Browse Jobs
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div></HomepageLayout>
  );
}
