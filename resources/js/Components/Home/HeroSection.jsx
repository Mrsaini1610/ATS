import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { Search, MapPin, Sparkles, Building2 } from "lucide-react";

const INDIA_CITIES = [
  "All India",
  "Jaipur",
  "Delhi NCR",
  "Noida",
  "Gurugram",
  "Bengaluru",
  "Mumbai",
  "Pune",
  "Hyderabad",
  "Remote",
];

export default function HeroSection({ user }) {
  const [searchQ, setSearchQ] = useState("");
  const [searchCity, setSearchCity] = useState("All India");

  const displayName = user?.full_name ? user.full_name.split(" ")[0] : (user?.name ? user.name.split(" ")[0] : null);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchQ.trim()) params.set("q", searchQ.trim());
    if (searchCity && searchCity !== "All India") params.set("city", searchCity);
    router.visit(`/job-search?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 px-4 pt-10 pb-14 rounded-b-3xl sm:rounded-b-[2.5rem]">
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

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2 text-left"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Job title, skills (e.g. Telecaller, Sales, React)"
              className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-900 bg-transparent outline-none placeholder-gray-400 font-medium"
            />
          </div>

          <div className="relative sm:w-44 border-t sm:border-t-0 sm:border-l border-gray-100 pt-2 sm:pt-0">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
            <select
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="w-full pl-9 pr-2 py-2.5 text-sm text-gray-800 font-medium bg-gray-50 sm:bg-transparent rounded-xl outline-none cursor-pointer"
            >
              {INDIA_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-extrabold transition-all shrink-0 shadow-md shadow-blue-600/30 cursor-pointer"
          >
            <Search className="w-4 h-4" /> Search Jobs
          </button>
        </form>

        {/* Popular Search Tags */}
        <div className="flex flex-wrap justify-center items-center gap-2 mt-4 text-xs text-blue-100">
          <span className="opacity-75 font-medium">Popular:</span>
          {["Telecalling", "Field Sales", "React Developer", "Customer Support", "Data Entry"].map((t) => (
            <Link
              key={t}
              href={`/job-search?q=${encodeURIComponent(t)}`}
              className="text-xs bg-white/15 hover:bg-white/25 text-white border border-white/20 px-3 py-1 rounded-full transition-all backdrop-blur-sm font-medium"
            >
              {t}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}