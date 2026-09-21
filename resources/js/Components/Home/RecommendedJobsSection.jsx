import React from "react";
import { Link } from "@inertiajs/react";
import { Sparkles, MapPin, Briefcase, IndianRupee, ArrowRight, UserCheck, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function RecommendedJobsSection({
  recommendedJobs = [],
  isLoggedIn = false,
  candidateProfile = null,
}) {
  return (
    <section className="relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-1.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Profile-Matched Recommendations</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Recommended For You
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            {isLoggedIn && candidateProfile?.name
              ? `Curated based on your skills, experience, and ${candidateProfile.city || "preferred location"}`
              : "Personalized matching engine based on title, skills, experience, and area"}
          </p>
        </div>

        <Link
          href="/job-search"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-blue-600 font-bold hover:text-blue-700 self-start sm:self-auto"
        >
          Explore all jobs <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Logged in state with matching jobs */}
      {isLoggedIn ? (
        recommendedJobs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedJobs.map((job) => {
              const matchPercent = job.match_percent || 85;
              const reasons = job.match_reasons || ["Profile Match"];

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-emerald-300 hover:shadow-lg transition-all flex flex-col justify-between relative group"
                >
                  <div>
                    {/* Top: Match Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        {matchPercent}% Match
                      </span>
                      <span className="text-[11px] font-semibold text-gray-400">
                        {job.created_at_human}
                      </span>
                    </div>

                    {/* Company & Title */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0 shadow-xs">
                        {job.company ? job.company.substring(0, 2).toUpperCase() : "ATS"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                          {job.company || "Verified Hiring Partner"}
                        </p>
                      </div>
                    </div>

                    {/* Match Reasons Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {reasons.map((reason, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] font-medium bg-gray-50 border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Meta & Action */}
                  <div className="pt-3 border-t border-gray-100 space-y-2.5">
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
                        href={`/job-search`}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                      >
                        Apply Now
                      </Link>
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
        )
      ) : (
        /* Guest Teaser Banner */
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 border border-white/20 text-xs font-bold backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Smart Profile Matcher
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Get Jobs Tailored Specifically For Your Profile
              </h3>
              <p className="text-xs sm:text-sm text-blue-200 max-w-xl leading-relaxed">
                Our matching engine analyzes your <strong>Job Title</strong>, <strong>Technical Skills</strong>, <strong>Experience Level</strong>, and <strong>Preferred Area/City</strong> to recommend the highest-paying, verified jobs.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/login"
                className="px-6 py-3 bg-white hover:bg-blue-50 text-blue-900 rounded-xl text-sm font-extrabold transition shadow-lg text-center"
              >
                Sign In to View Matches
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 bg-blue-600/60 hover:bg-blue-600 text-white border border-white/20 rounded-xl text-sm font-bold transition text-center"
              >
                Create Free Profile
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
