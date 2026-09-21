import React from "react";
import { Link } from "@inertiajs/react";
import { Clock, MapPin, Briefcase, Sparkles, ArrowRight, Flame } from "lucide-react";

export default function RecentJobsSection({ recentJobs = [] }) {
  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-1.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Latest Vacancies</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Recent Job Openings
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Freshly posted verified positions available to apply right now
          </p>
        </div>

        <Link
          href="/job-search"
          className="inline-flex items-center gap-1 text-xs sm:text-sm text-blue-600 font-bold hover:text-blue-700 self-start sm:self-auto"
        >
          View all jobs <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentJobs.length > 0 ? (
          recentJobs.map((job) => {
            const skillList = Array.isArray(job.skills) ? job.skills : [];

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Company Logo, Badges & Time */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs">
                        {job.company ? job.company.substring(0, 2).toUpperCase() : "ATS"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-500 truncate">
                          {job.company || "Hiring Partner"}
                        </p>
                        <span className="text-[11px] font-medium text-gray-400">
                          {job.created_at_human}
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                      <Sparkles className="w-3 h-3 text-amber-500" /> New
                    </span>
                  </div>

                  {/* Job Title */}
                  <h3 className="text-base font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>

                  {/* Skills tags */}
                  {skillList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {skillList.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium bg-gray-50 border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md truncate max-w-[140px]"
                        >
                          {skill}
                        </span>
                      ))}
                      {skillList.length > 3 && (
                        <span className="text-[11px] font-medium text-gray-400 self-center">
                          +{skillList.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Meta & Button */}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="flex items-center gap-1 truncate font-medium">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {job.location}
                    </span>
                    <span className="font-bold text-emerald-700">
                      {job.salary}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                      {job.experience}
                    </span>
                    <Link
                      href="/job-search"
                      className="px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-10 bg-white rounded-2xl border border-gray-100 text-center text-gray-400 text-sm">
            No recent jobs found right now. Check back soon!
          </div>
        )}
      </div>
    </section>
  );
}
