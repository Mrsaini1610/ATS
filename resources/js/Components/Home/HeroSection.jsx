import { Link } from "@inertiajs/react";
import { Sparkles, Briefcase, Building2, ArrowRight } from "lucide-react";

export default function HeroSection({ user }) {
  const displayName = user?.full_name ? user.full_name.split(" ")[0] : (user?.name ? user.name.split(" ")[0] : null);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 px-4 pt-10 pb-12 rounded-b-3xl sm:rounded-b-[2.5rem]">
      {/* Decorative Grid SVG */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {displayName ? (
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white text-xs sm:text-sm px-4 py-1.5 rounded-full mb-4 font-semibold backdrop-blur-sm shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Welcome back, {displayName}!
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white text-xs px-3.5 py-1.5 rounded-full mb-4 backdrop-blur-sm font-semibold">
            🇮🇳 India's Direct Hiring Platform
          </div>
        )}

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3.5 leading-tight tracking-tight">
          Find Your Dream Job<br className="hidden sm:block" /> Across India
        </h1>
        <p className="text-blue-100 text-xs sm:text-sm mb-6 max-w-lg mx-auto leading-relaxed">
          10,000+ verified active vacancies · Direct company HR contact · Free application & instant interview scheduling
        </p>

        {/* Quick Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-blue-50 text-blue-700 rounded-xl text-sm font-extrabold transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Briefcase className="w-4 h-4" /> Explore All Jobs <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-xl text-sm font-extrabold transition-all backdrop-blur-sm hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Building2 className="w-4 h-4" /> Top Hiring Companies
          </Link>
        </div>
      </div>
    </section>
  );
}