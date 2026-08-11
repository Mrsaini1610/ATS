import { Link } from "@inertiajs/react";
import { ArrowRight, Flame, MapPin, Clock } from "lucide-react";

export default function FeaturedJobsSection({ jobs = [] }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Featured Opportunities</h2>
          <p className="text-xs text-gray-500">Handpicked jobs for your career growth</p>
        </div>
        <Link href="/search" className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline">
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {jobs.length > 0 ? (
          jobs.map((job) => {
            // Skills Array safety check
            const skillList = Array.isArray(job.skills) 
              ? job.skills 
              : (typeof job.skills === "string" ? job.skills.split(",") : []);

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                      {job.company ? job.company.substring(0, 2).toUpperCase() : "JP"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 leading-tight hover:text-blue-600 transition-colors truncate">
                            {job.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{job.company || "Hiring Partner"}</p>
                        </div>
                        {job.badge && (
                          <span className="flex items-center gap-0.5 text-[10px] bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded-full shrink-0">
                            <Flame className="w-3 h-3" /> {job.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Skills Display */}
                  {skillList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {skillList.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">
                          {String(s).trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Meta */}
                <div className="pt-3 border-t border-gray-50 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {job.location || "Remote"}
                    </span>
                    <span className="text-green-600 font-bold">
                      {job.salary || "Competitive"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {job.job_type || "Full Time"}
                    </span>
                    <Link
                      href={`/job-search`}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-gray-500 col-span-full text-center py-6">No jobs found right now.</p>
        )}
      </div>
    </section>
  );
}