import React, { useState } from "react";
import HomepageLayout from "@/Layouts/HomepageLayout";
import { Head, Link } from "@inertiajs/react";
import { Search, Building2, MapPin, Briefcase, ArrowRight, Star, ExternalLink } from "lucide-react";

export default function CompaniesList({ companies = [] }) {
  const [search, setSearch] = useState("");

  const filtered = companies.filter((c) =>
    (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.location || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.industry || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head title="Browse Companies - ATS WorkIndia" />

      <HomepageLayout>
        <div className="max-w-7xl mx-auto px-4 pt-28 pb-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold mb-3 shadow-2xs">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>Verified Employers</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Top Companies Hiring in India
            </h1>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Explore {companies.length} verified companies offering direct job opportunities, competitive salaries, and career growth.
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto mt-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search company name, location, industry..."
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.length > 0 ? (
              filtered.map((comp, idx) => {
                const hasImageLogo = comp.logo && (comp.logo.includes("/") || comp.logo.includes("."));
                const targetUrl = `/companies/${encodeURIComponent(comp.uuid || comp.name)}`;

                return (
                  <div
                    key={comp.uuid || idx}
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-purple-300 hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-base text-white overflow-hidden shadow-xs bg-gradient-to-br from-indigo-600 to-purple-700">
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

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full">
                          <Briefcase className="w-3.5 h-3.5" />
                          {comp.jobs_count || 0} Openings
                        </span>
                      </div>

                      <h3 className="font-bold text-lg text-gray-900 mb-1">{comp.name}</h3>
                      <p className="text-xs text-gray-400 mb-3">{comp.industry || "Corporate Services"}</p>

                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {comp.location || "Multiple Locations"}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
                      <Link
                        href={`/job-search?q=${encodeURIComponent(comp.name)}`}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        View Jobs ({comp.jobs_count || 0})
                      </Link>

                      <Link
                        href={targetUrl}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        Profile <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-100">
                No companies found matching "{search}".
              </div>
            )}
          </div>
        </div>
      </HomepageLayout>
    </>
  );
}
