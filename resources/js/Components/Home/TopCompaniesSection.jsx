import React from "react";
import { Link } from "@inertiajs/react";
import { Building2, ArrowRight, MapPin, Briefcase } from "lucide-react";

export default function TopCompaniesSection({ topCompanies = [] }) {
  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold mb-1.5 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Featured Employers</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Top Companies Hiring
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Work directly with verified corporate partners and fast-growing startups
          </p>
        </div>

        <Link
          href="/companies"
          className="inline-flex items-center gap-1 text-xs sm:text-sm text-blue-600 font-bold hover:text-blue-700 self-start sm:self-auto"
        >
          View all companies <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {topCompanies.length > 0 ? (
          topCompanies.map((comp, idx) => {
            const hasImageLogo = comp.logo && (comp.logo.includes("/") || comp.logo.includes("."));
            const targetUrl = `/companies/${encodeURIComponent(comp.uuid || comp.name)}`;

            return (
              <Link
                key={comp.uuid || idx}
                href={targetUrl}
                className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center font-black text-sm text-white overflow-hidden shadow-xs bg-gradient-to-br from-indigo-600 to-purple-700 group-hover:scale-105 transition-transform">
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

                  <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                    {comp.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">
                    {comp.industry}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 mt-3 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-gray-500 text-[11px] truncate">
                    <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                    {comp.location}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-100 shrink-0">
                    {comp.jobs} {comp.jobs === 1 ? "Job" : "Jobs"}
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full py-8 text-center text-gray-400 text-xs bg-white rounded-2xl border border-gray-100">
            No companies listed yet.
          </div>
        )}
      </div>
    </section>
  );
}
