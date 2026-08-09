import { useState } from "react";
import { Link } from "@inertiajs/react";
import { Search, MapPin } from "lucide-react";

const INDIA_CITIES = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Pune", "Chennai", "Kolkata", "Remote"];

export default function HeroSection({ user }) {
  const [searchQ, setSearchQ] = useState("");
  const [searchCity, setSearchCity] = useState("Bengaluru");

  const displayName = user?.fullName ? user.fullName.split(" ")[0] : null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-4 pt-8 pb-12 rounded-b-3xl sm:rounded-b-[2.5rem]">
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {displayName ? (
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white text-sm px-4 py-1.5 rounded-full mb-4 font-medium backdrop-blur-sm">
            👋 Welcome back, {displayName}!
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white text-xs px-3 py-1 rounded-full mb-4 backdrop-blur-sm">
            🇮🇳 India's Smart Job Platform
          </div>
        )}

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 leading-tight tracking-tight">
          Find Your Dream Job<br className="hidden sm:block" /> in India
        </h1>
        <p className="text-blue-100 text-xs sm:text-sm mb-6 max-w-md mx-auto">
          12,000+ live jobs · 3,200+ companies · Mumbai, Delhi, Bengaluru & more
        </p>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Job title, skill, or company"
              className="w-full pl-9 pr-4 py-2.5 text-sm text-gray-900 bg-transparent outline-none placeholder-gray-400"
            />
          </div>
          <div className="relative sm:w-40 border-t sm:border-t-0 sm:border-l border-gray-100 pt-2 sm:pt-0">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <select
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="w-full pl-8 pr-2 py-2.5 text-sm text-gray-700 bg-gray-50 sm:bg-transparent rounded-xl outline-none cursor-pointer"
            >
              {INDIA_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <Link
            href={`/search?q=${encodeURIComponent(searchQ)}&city=${searchCity}`}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shrink-0 shadow-md"
          >
            <Search className="w-4 h-4" /> Search
          </Link>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {["React Developer", "UI/UX Designer", "Data Analyst", "DevOps"].map((t) => (
            <Link
              key={t}
              href={`/search?q=${encodeURIComponent(t)}`}
              className="text-xs bg-white/15 hover:bg-white/25 text-white border border-white/20 px-3 py-1 rounded-full transition-colors backdrop-blur-sm"
            >
              {t}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}