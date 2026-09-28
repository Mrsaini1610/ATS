import React, { useState, useMemo } from "react";
import HomepageLayout from "@/Layouts/HomepageLayout";
import { Head, Link } from "@inertiajs/react";
import {
  Search,
  Building2,
  MapPin,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Users,
  Sparkles,
  RotateCcw,
} from "lucide-react";

export default function CompaniesList({ companies = [] }) {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("all");

  const totalOpenings = useMemo(() => {
    return companies.reduce((acc, c) => acc + (Number(c.jobs_count) || 0), 0);
  }, [companies]);

  const availableLocations = useMemo(() => {
    const set = new Set();
    companies.forEach((c) => {
      if (c.location && typeof c.location === "string") {
        set.add(c.location.trim());
      }
    });
    return Array.from(set);
  }, [companies]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return companies.filter((c) => {
      if (q) {
        const nameMatch = (c.name || "").toLowerCase().includes(q);
        const locMatch = (c.location || "").toLowerCase().includes(q);
        const indMatch = (c.industry || "").toLowerCase().includes(q);
        const roleMatch =
          Array.isArray(c.open_roles) &&
          c.open_roles.some((r) => (r || "").toLowerCase().includes(q));
        if (!nameMatch && !locMatch && !indMatch && !roleMatch) {
          return false;
        }
      }

      if (location !== "all") {
        if (!c.location || !c.location.toLowerCase().includes(location.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [companies, search, location]);

  const hasActiveFilters = search.trim() !== "" || location !== "all";

  const clearAllFilters = () => {
    setSearch("");
    setLocation("all");
  };

  return (
    <>
      <Head title="Top Companies Hiring - ATS" />

      <HomepageLayout>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* Top Title & Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>100% Verified Direct Employers</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                Top Companies Hiring in{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600">
                  India
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Explore {companies.length} verified companies offering {totalOpenings.toLocaleString()}+ active vacancies, transparent hiring processes, and competitive salaries.
              </p>
            </div>
          </div>

          {/* Full-Width Search & Filter Bar */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-2 sm:p-2.5 shadow-xs w-full">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
              {/* Keyword Search */}
              <div className="flex items-center gap-2.5 flex-1 px-3 py-2 bg-gray-50/70 rounded-xl border border-transparent focus-within:border-blue-400 focus-within:bg-white transition-all">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by company name, role, skill, or industry..."
                  className="w-full text-xs sm:text-sm text-gray-900 bg-transparent border-0 ring-0 focus:ring-0 placeholder-gray-400 outline-none"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Location Select */}
              {availableLocations.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/70 rounded-xl border border-transparent focus-within:border-blue-400 focus-within:bg-white md:w-56 transition-all">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs sm:text-sm text-gray-700 bg-transparent border-0 ring-0 focus:ring-0 cursor-pointer outline-none font-medium"
                  >
                    <option value="all">All Locations</option>
                    {availableLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              ) : (
                <div className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-xs shrink-0 select-none">
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </div>
              )}
            </div>
          </div>

          {/* Full-Width Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 sm:p-4 text-center shadow-2xs hover:shadow-xs transition-shadow">
              <p className="text-xl sm:text-2xl font-black text-blue-600">{companies.length}</p>
              <p className="text-[11px] sm:text-xs font-semibold text-gray-500 mt-0.5">Active Employers</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 sm:p-4 text-center shadow-2xs hover:shadow-xs transition-shadow">
              <p className="text-xl sm:text-2xl font-black text-blue-700">{totalOpenings.toLocaleString()}+</p>
              <p className="text-[11px] sm:text-xs font-semibold text-gray-500 mt-0.5">Open Vacancies</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 sm:p-4 text-center shadow-2xs hover:shadow-xs transition-shadow">
              <p className="text-xl sm:text-2xl font-black text-emerald-600">100%</p>
              <p className="text-[11px] sm:text-xs font-semibold text-gray-500 mt-0.5">Verified Profiles</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 sm:p-4 text-center shadow-2xs hover:shadow-xs transition-shadow">
              <p className="text-xl sm:text-2xl font-black text-amber-500">Fast</p>
              <p className="text-[11px] sm:text-xs font-semibold text-gray-500 mt-0.5">Candidate Response</p>
            </div>
          </div>

          {/* Section Subheader with Results Count */}
          <div className="flex items-center justify-between w-full pt-1">
            <p className="text-xs sm:text-sm font-bold text-gray-800">
              Showing <span className="text-blue-600">{filtered.length}</span> {filtered.length === 1 ? "Company" : "Companies"}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Full-Width 3-Column Companies Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
            {filtered.length > 0 ? (
              filtered.map((comp) => {
                const compKey = comp.uuid || comp.id || comp.name;
                const hasImageLogo = comp.logo && (comp.logo.includes("/") || comp.logo.includes("."));
                const targetProfileUrl = `/companies/${encodeURIComponent(comp.uuid || comp.name)}`;
                const targetJobsUrl = `/job-listings?company=${encodeURIComponent(comp.uuid || comp.name)}`;
                const openings = Number(comp.jobs_count) || 0;
                const openRoles = Array.isArray(comp.open_roles) ? comp.open_roles : [];

                return (
                  <div
                    key={compKey}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 hover:border-blue-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group shadow-2xs w-full"
                  >
                    {/* Top Subtle Brand Ribbon */}
                    <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 opacity-90 group-hover:opacity-100 transition-opacity" />

                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Card Header: Logo, Name & Openings Badge */}
                        <div className="flex items-start justify-between gap-2.5 mb-3">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm text-white overflow-hidden shadow-xs bg-gradient-to-br from-blue-600 to-indigo-700 shrink-0">
                              {hasImageLogo ? (
                                <img
                                  src={`/storage/${comp.logo}`}
                                  alt={comp.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <span>{comp.logo || comp.name?.substring(0, 2).toUpperCase() || "CO"}</span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                  {comp.name}
                                </h3>
                                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" title="Verified Employer" />
                              </div>
                              <p className="text-xs font-semibold text-gray-500 mt-0.5 truncate">
                                {comp.industry || "Corporate Services & Tech"}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span className="truncate">{comp.location || "Multiple Locations, India"}</span>
                              </div>
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full shrink-0">
                            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                            <span>{openings} {openings === 1 ? "Opening" : "Openings"}</span>
                          </span>
                        </div>

                        {/* Open Roles Preview Tags */}
                        {openRoles.length > 0 && (
                          <div className="pt-3 border-t border-gray-100 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                Hiring for:
                              </span>
                              {openRoles.map((role, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] px-2.5 py-0.5 rounded-lg bg-gray-50 border border-gray-200/80 text-gray-700 font-semibold truncate max-w-[160px]"
                                >
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Explore Jobs & Profile Buttons */}
                      <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between gap-3">
                        <Link
                          href={targetJobsUrl}
                          className="flex-1 text-center py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-xs"
                        >
                          Explore Jobs ({openings})
                        </Link>

                        <Link
                          href={targetProfileUrl}
                          className="inline-flex items-center justify-center gap-1 py-2.5 px-4 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200 hover:border-blue-200 rounded-xl text-xs sm:text-sm font-bold transition-all"
                        >
                          <span>Profile</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 px-4 text-center bg-white rounded-3xl border border-gray-200 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">No employers found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                  We couldn't find any companies matching your search filters. Try resetting the filters.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </HomepageLayout>
    </>
  );
}
