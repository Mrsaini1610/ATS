import React from "react";
import { Link } from "@inertiajs/react";
import { Sparkles, MapPin, Briefcase, ArrowRight, CheckCircle2, UserCheck, GraduationCap, AlertCircle } from "lucide-react";
import { useUserCoords, getJobMinQualification, checkJobEligibility } from "@/Utils/jobHelpers";

export default function RecommendedJobsSection({
  recommendedJobs = [],
  isLoggedIn = false,
  candidateProfile = null,
  onSelectJob,
  onApplyJob,
  onIneligible,
}) {
  const { getDistanceTo } = useUserCoords(candidateProfile);

  // Strictly filter: ONLY jobs the candidate can apply for (exclude applied & ineligible)
  const visibleJobs = (recommendedJobs || []).filter((job) => {
    if (job.application_status || job.is_applied) return false;
    const eligibility = checkJobEligibility(job, candidateProfile);
    if (eligibility.isRestricted) return false;
    return true;
  });

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-1.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Match for You</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Recommended Jobs
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Tailored specifically based on your skills, preferences, and locality
          </p>
        </div>

        <Link
          href="/job-search"
          className="inline-flex items-center gap-1 text-xs sm:text-sm text-blue-600 font-bold hover:text-blue-700 self-start sm:self-auto"
        >
          Explore more matches <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {visibleJobs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleJobs.map((job) => {
            const matchPercent = job.match_percent || 85;
            const reasons = Array.isArray(job.match_reasons) ? job.match_reasons : [];
            const minQual = getJobMinQualification(job);
            const distance = getDistanceTo(job.latitude, job.longitude);
            const eligibility = checkJobEligibility(job, candidateProfile);

            return (
              <div
                key={job.id}
                onClick={() => onSelectJob && onSelectJob(job)}
                className={`bg-white rounded-2xl border p-5 hover:border-emerald-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between relative group cursor-pointer shadow-2xs ${
                  eligibility.isRestricted ? "border-red-100 hover:border-red-300" : "border-gray-100"
                }`}
              >
                <div>
                  {/* Top Bar: Company Avatar & Match % */}
                  <div className="flex items-center justify-between gap-2.5 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-xs">
                        {job.company ? job.company.substring(0, 2).toUpperCase() : "ATS"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate max-w-[170px]">
                          {job.company || "Verified Hiring Partner"}
                        </p>
                        {job.created_at_human && (
                          <span className="text-[10px] text-gray-400 block">
                            {job.created_at_human}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        {matchPercent}% Match
                      </span>
                    </div>
                  </div>

                  {/* Job Title - FULL WIDTH, NEVER SQUEEZED */}
                  <h3 className="text-base font-extrabold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                    {job.title}
                  </h3>

                  {/* Salary & Details Strip (Set Prominently right below title) */}
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
                    <div className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg">
                      <span>{job.salary || "Competitive Salary"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600">
                      <span className="px-2 py-0.5 bg-gray-100 rounded-md">{job.job_type || "Full Time"}</span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded-md">{job.experience || "Fresher"}</span>
                    </div>
                  </div>

                  {/* Qualifications & Requirements Box - Shown Outside on Card */}
                  <div className="space-y-1.5 mb-3 bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
                    {/* Qualification Row */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                        <span>Qualification:</span>
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          isLoggedIn && eligibility.isRestricted
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-purple-50 text-purple-700 border-purple-200"
                        }`}
                      >
                        {isLoggedIn && eligibility.isRestricted ? (
                          <>
                            <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                            <span>Min. {minQual.label} (Ineligible)</span>
                          </>
                        ) : (
                          <span>Min. {minQual.label}</span>
                        )}
                      </span>
                    </div>

                    {/* Requirements / Match Reasons */}
                    {reasons.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider shrink-0">
                          Highlights:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {reasons.slice(0, 3).map((reason, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md truncate max-w-[130px]"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Location & Distance ON LEFT (Where salary was) + Action Button ON RIGHT */}
                <div className="pt-2.5 border-t border-gray-100 mt-auto flex items-center justify-between gap-2">
                  {/* Location & Distance */}
                  <div className="flex items-center gap-1 text-xs text-gray-600 min-w-0 flex-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate font-medium">{job.location || "Multiple Locations"}</span>
                    {distance && (
                      <span className="text-blue-600 font-bold shrink-0 bg-blue-50 px-2 py-0.5 rounded-full text-[11px]">
                        • {distance}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {job.is_applied ? (
                      <Link
                        href="/my-applications"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Applied</span>
                      </Link>
                    ) : eligibility.isRestricted ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onIneligible) {
                            onIneligible(job, eligibility);
                          } else if (onApplyJob) {
                            onApplyJob(job);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                        title="You do not meet the minimum qualification"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        <span>Ineligible</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onApplyJob) {
                            onApplyJob(job);
                          } else if (onSelectJob) {
                            onSelectJob(job);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        <span>Apply</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-xl mx-auto shadow-xs">
          <UserCheck className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 text-base mb-1">
            Add your skills & location for instant matching
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            We couldn't find an exact match yet. Update your profile with your preferred job title, skills, and city.
          </p>
          <Link
            href="/profile"
            className="inline-flex px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Update Profile
          </Link>
        </div>
      )}
    </section>
  );
}
