import React from "react";
import HomepageLayout from "@/Layouts/HomepageLayout";
import { Head, Link } from "@inertiajs/react";
import {
  MapPin,
  Globe,
  Users,
  Star,
  Briefcase,
  Building2,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Award,
} from "lucide-react";

export default function Companies({ company = {} }) {
  const comp = company || {};
  const jobs = Array.isArray(comp.jobs) ? comp.jobs : [];
  const perks = Array.isArray(comp.perks) ? comp.perks : [];
  const compUuid = comp.uuid || comp.id;

  const hasLogoImage = comp.logo && (comp.logo.includes("/") || comp.logo.includes("."));

  return (
    <>
      <Head title={`${comp.name || "Company"} - Employer Profile`} />
      <HomepageLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Breadcrumb / Back Link */}
          <div className="mb-5">
            <Link
              href="/companies"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to all companies</span>
            </Link>
          </div>

          {/* Hero Banner Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 overflow-hidden mb-6 shadow-sm">
            {/* Gradient Cover */}
            <div className={`h-32 sm:h-40 bg-gradient-to-r ${comp.bgGradient || "from-blue-600 via-indigo-600 to-purple-700"} relative`}>
              <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Profile Info Container */}
            <div className="px-5 sm:px-8 pb-6 sm:pb-7 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  {/* Logo Box */}
                  <div className="-mt-12 sm:-mt-14 relative z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-white p-1 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden shrink-0">
                    {hasLogoImage ? (
                      <img
                        src={`/storage/${comp.logo}`}
                        alt={comp.name}
                        className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl sm:text-2xl font-black">
                        {comp.logo || comp.name?.substring(0, 2).toUpperCase() || "CO"}
                      </div>
                    )}
                  </div>

                  {/* Title & Verified */}
                  <div className="pt-1 sm:pt-0">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
                        {comp.name}
                      </h1>
                      <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Verified</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">
                      {comp.tagline || "Leading employer verified on ATS platform."}
                    </p>
                  </div>
                </div>

                {/* Right Hero CTA */}
                <div className="flex items-center gap-2.5 sm:self-center">
                  <a
                    href="#open-vacancies"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
                  >
                    View Open Roles ({jobs.length})
                  </a>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-100">
                <div className="bg-blue-50/70 border border-blue-100/60 rounded-xl p-3.5 text-center">
                  <Briefcase className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{jobs.length}</p>
                  <p className="text-[11px] font-semibold text-gray-500">Open Jobs</p>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-100/60 rounded-xl p-3.5 text-center">
                  <Users className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{comp.size || "Growing"}</p>
                  <p className="text-[11px] font-semibold text-gray-500">Company Size</p>
                </div>

                <div className="bg-amber-50/70 border border-amber-100/60 rounded-xl p-3.5 text-center">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500 mx-auto mb-1.5" />
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{comp.rating || "4.8"}</p>
                  <p className="text-[11px] font-semibold text-gray-500">Rating</p>
                </div>

                <div className="bg-purple-50/70 border border-purple-100/60 rounded-xl p-3.5 text-center">
                  <MapPin className="w-5 h-5 text-purple-600 mx-auto mb-1.5" />
                  <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{comp.hq || "India"}</p>
                  <p className="text-[11px] font-semibold text-gray-500">Headquarters</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Layout Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Highlights & Vacancies */}
            <div className="lg:col-span-2 space-y-6">
              {/* Company Highlights Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Company Highlights & Overview</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-gray-100">
                    <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-gray-500">Industry</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                        {comp.industry || "Corporate Services"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-gray-100">
                    <MapPin className="w-5 h-5 text-rose-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-gray-500">Primary Location</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                        {comp.hq || "India"}
                      </p>
                    </div>
                  </div>

                  {comp.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-gray-100">
                      <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-gray-500">Contact Number</p>
                        <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                          {comp.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {comp.email && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-gray-100">
                      <Mail className="w-5 h-5 text-indigo-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-gray-500">Official HR Email</p>
                        <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                          {comp.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Open Vacancies Section */}
              <div id="open-vacancies" className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      Open Vacancies at {comp.name}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Direct application with verified ATS processing.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                    {jobs.length} Available
                  </span>
                </div>

                <div className="space-y-3">
                  {jobs.length > 0 ? (
                    jobs.map((job) => {
                      const jobKey = job.uuid || job.id;
                      return (
                        <div
                          key={jobKey}
                          className="p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {job.title}
                              </h3>
                              {job.category && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                  {job.category}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                {job.loc}
                              </span>
                              <span className="text-emerald-700 font-bold">
                                {job.salary}
                              </span>
                              {job.type && (
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                  {job.type}
                                </span>
                              )}
                              {job.exp && <span>• {job.exp}</span>}
                            </div>
                          </div>

                          <Link
                            href={`/apply/${job.uuid || job.id}`}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-2xs shrink-0 self-start sm:self-center"
                          >
                            <span>Apply Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-10 px-4 bg-slate-50/50 rounded-xl border border-gray-100">
                      <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-gray-700">No active job posts right now</p>
                      <p className="text-xs text-gray-400 mt-0.5">Check back soon or explore other verified employers.</p>
                      <Link
                        href="/job-listings"
                        className="mt-3 inline-block text-xs font-bold text-blue-600 hover:underline"
                      >
                        Explore all job vacancies →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar Contacts & Perks */}
            <div className="space-y-6">
              {/* Corporate Connect */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>Corporate Details</span>
                </h3>

                <div className="space-y-3 text-xs text-gray-600">
                  {comp.website && (
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                      <a
                        href={comp.website.startsWith("http") ? comp.website : `https://${comp.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline truncate font-medium"
                      >
                        {comp.website}
                      </a>
                    </div>
                  )}

                  {comp.email && (
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="truncate">{comp.email}</span>
                    </div>
                  )}

                  {comp.phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{comp.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{comp.hq || "India"}</span>
                  </div>
                </div>
              </div>

              {/* Benefits & Perks */}
              {perks.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Benefits & Perks</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {perks.map((p, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100"
                      >
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust Badge */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-5 text-white shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Direct Employer Guarantee
                  </h4>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Applications submitted on this portal go directly to {comp.name}'s verified HR desk without any third-party fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </HomepageLayout>
    </>
  );
}
