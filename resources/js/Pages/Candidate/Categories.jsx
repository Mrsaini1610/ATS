import React, { useState, useMemo } from "react";
import HomepageLayout from "@/Layouts/HomepageLayout";
import { Head, Link } from "@inertiajs/react";
import {
  Search,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Layers,
  Sparkles,
  ChevronRight,
  X,
  Compass,
} from "lucide-react";

export default function Categories({ categories = [], topSkills = [] }) {
  const [search, setSearch] = useState("");
  const [expandedCat, setExpandedCat] = useState(null);

  // Only display categories that have active/approved job posts
  const categoriesWithJobs = useMemo(() => {
    return (categories || []).filter((c) => (Number(c.jobs) || 0) > 0);
  }, [categories]);

  const totalJobs = useMemo(() => {
    return categoriesWithJobs.reduce((acc, c) => acc + (Number(c.jobs) || 0), 0);
  }, [categoriesWithJobs]);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categoriesWithJobs;
    return categoriesWithJobs.filter((c) => {
      const nameMatch = (c.name || "").toLowerCase().includes(q);
      const subMatch = Array.isArray(c.subcategories)
        ? c.subcategories.some((s) => (s || "").toLowerCase().includes(q))
        : false;
      return nameMatch || subMatch;
    });
  }, [categoriesWithJobs, search]);

  const toggleExpand = (catIdentifier) => {
    setExpandedCat((prev) => (prev === catIdentifier ? null : catIdentifier));
  };

  return (
    <>
      <Head title="Explore Job Categories - ATS" />
      <HomepageLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-4 shadow-2xs">
              <Compass className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
              <span>Explore Opportunities by Domain</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
              Browse Job Categories in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">India</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Explore {totalJobs.toLocaleString()}+ active career vacancies across {categoriesWithJobs.length} specialized job sectors. Find roles that match your passion and experience.
            </p>

            {/* Search Bar */}
            <div className="mt-7 max-w-xl mx-auto">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by category, role or keyword (e.g. IT, Design, Sales)..."
                  className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3.5 p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Trending Highlight Banner */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 sm:p-6 mb-10 shadow-lg text-white">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
                  <TrendingUp className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-white">
                      Trending
                    </span>
                    <h3 className="font-bold text-base sm:text-lg">Most In-Demand Domains</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-100">
                    IT & Software, Sales & Marketing, and Healthcare roles are seeing record hiring this quarter.
                  </p>
                </div>
              </div>
              <Link
                href="/job-listings"
                className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-blue-700 rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-50 transition shadow-xs cursor-pointer self-start sm:self-center"
              >
                <span>Browse All Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {/* Subtle background glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
            {filteredCategories.map((cat) => {
              const catKey = cat.uuid || cat.id || cat.name;
              const isExpanded = expandedCat === catKey;
              const subcats = Array.isArray(cat.subcategories) ? cat.subcategories : [];
              const jobsCount = Number(cat.jobs) || 0;

              return (
                <div
                  key={catKey}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                    isExpanded
                      ? "border-blue-400 ring-2 ring-blue-100 shadow-md"
                      : "border-gray-100 hover:border-blue-200 hover:shadow-lg"
                  }`}
                >
                  <div className="p-5 sm:p-6">
                    {/* Top Row: Icon + Job Count */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-2xl shadow-2xs shrink-0">
                        {cat.icon || "💼"}
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                        {jobsCount.toLocaleString()} {jobsCount === 1 ? "Job" : "Jobs"}
                      </span>
                    </div>

                    {/* Category Title */}
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1.5">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                      Verified hiring from top companies and startups in {cat.name}.
                    </p>

                    {/* Subcategory Pills Preview */}
                    {subcats.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {subcats.slice(0, 3).map((sub, idx) => (
                          <Link
                            key={idx}
                            href={`/job-listings?category=${encodeURIComponent(cat.uuid || cat.name)}&search=${encodeURIComponent(sub)}`}
                            className="text-[11px] font-medium text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 px-2.5 py-1 rounded-lg border border-gray-100 transition-colors"
                          >
                            {sub}
                          </Link>
                        ))}
                        {subcats.length > 3 && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(catKey)}
                            className="text-[11px] font-semibold text-blue-600 bg-blue-50/80 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            +{subcats.length - 3} more
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Accordion / Expanded Details */}
                  {isExpanded && subcats.length > 0 && (
                    <div className="px-5 sm:px-6 pb-4 pt-3 bg-slate-50/60 border-t border-gray-100 animate-in fade-in duration-150">
                      <p className="text-xs font-bold text-gray-700 mb-2.5 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        All Sub-roles in {cat.name}:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-4">
                        {subcats.map((sub, idx) => (
                          <Link
                            key={idx}
                            href={`/job-listings?category=${encodeURIComponent(cat.uuid || cat.name)}&search=${encodeURIComponent(sub)}`}
                            className="text-xs text-gray-600 hover:text-blue-600 flex items-center gap-1.5 py-1 px-1.5 rounded-md hover:bg-white transition-all group"
                          >
                            <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-blue-600 transition-colors shrink-0" />
                            <span className="truncate">{sub}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Card Bottom Bar */}
                  <div className="px-5 sm:px-6 py-3.5 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleExpand(catKey)}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition cursor-pointer"
                    >
                      {isExpanded ? "Collapse" : "Explore roles"}
                    </button>

                    <Link
                      href={`/job-listings?category=${encodeURIComponent(cat.uuid || cat.name)}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition group"
                    >
                      <span>View Openings</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty Search State */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-gray-100 mb-12">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">No categories match your search</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                We couldn't find any job category matching "<strong>{search}</strong>". Try searching with a different term.
              </p>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* In-Demand Skills Section */}
          {topSkills && topSkills.length > 0 && (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Top In-Demand Skills
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Keywords employers in India are actively looking for right now.
                  </p>
                </div>
                <Link
                  href="/job-listings"
                  className="text-xs font-bold text-blue-600 hover:underline shrink-0"
                >
                  Explore all job listings →
                </Link>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {topSkills.map((skill, idx) => (
                  <Link
                    key={idx}
                    href={`/job-listings?search=${encodeURIComponent(skill)}`}
                    className="group inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-blue-50 border border-gray-200/80 hover:border-blue-300 rounded-xl text-xs font-semibold text-gray-700 hover:text-blue-700 transition-all shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                    <span>{skill}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </HomepageLayout>
    </>
  );
}
