import React, { useState, useMemo, useEffect } from "react";
import HomepageLayout from "@/Layouts/HomepageLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  IndianRupee,
  SlidersHorizontal,
  X,
  Bookmark,
  BookmarkCheck,
  BookmarkX,
  CheckCircle2,
  Star,
  Shield,
  ArrowRight,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  User,
  Sparkles,
  ChevronLeft,
  ChevronDown,
  Building2,
  RotateCcw,
} from "lucide-react";

/* ── Login Gate Modal ── */
function LoginGateModal({ action, onClose, onLogin }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-7 max-w-sm w-full text-center animate-in fade-in zoom-in-95 duration-150">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <Shield className="w-7 h-7 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Login Required</h3>
        <p className="text-sm text-gray-500 mb-5">
          Please sign in to your candidate account to <strong>{action}</strong>.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onLogin}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition cursor-pointer shadow-xs"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Job Detail Panel ── */
function JobDetailPanel({
  job,
  onClose,
  isLoggedIn,
  onLoginRequired,
  onSaveJob,
  isSaved,
  isApplied,
  getCountdown,
}) {
  if (!job) return null;

  const skillsList = Array.isArray(job.skills)
    ? job.skills
    : typeof job.skills === "string"
      ? job.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  const responsibilities = Array.isArray(job.key_responsibilities)
    ? job.key_responsibilities
    : Array.isArray(job.responsibilities)
      ? job.responsibilities
      : typeof job.key_responsibilities === "string"
        ? job.key_responsibilities.split("\n").map((s) => s.trim()).filter(Boolean)
        : [];

  const requirements = Array.isArray(job.qualifications)
    ? job.qualifications
    : Array.isArray(job.requirements)
      ? job.requirements
      : typeof job.qualifications === "string"
        ? job.qualifications.split("\n").map((s) => s.trim()).filter(Boolean)
        : [];

  const perks = Array.isArray(job.perks)
    ? job.perks
    : Array.isArray(job.benefits)
      ? job.benefits
      : typeof job.perks === "string"
        ? job.perks.split("\n").map((s) => s.trim()).filter(Boolean)
        : [];

  const companyInitials = (job.company || "Job").slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full overflow-y-auto w-full bg-white animate-in fade-in duration-150 overscroll-contain">
      {/* Top Header Bar */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 flex items-center justify-between z-10 shadow-2xs">
        {/* Left: Category Tag */}
        <div>
          {job.category_name && (
            <span className="inline-flex text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100 items-center gap-1">
              {job.category_icon || "💼"} {job.category_name}
            </span>
          )}
        </div>

        {/* Right: Save Bookmark and Close Button */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Highlighted Save Bookmark */}
          <button
            type="button"
            onClick={() => onSaveJob(job.uuid || job.id)}
            className={`p-2 border rounded-xl transition-all duration-200 cursor-pointer shadow-2xs ${
              isSaved
                ? "bg-blue-50 hover:bg-red-50 border-blue-200 hover:border-red-200 text-blue-600 hover:text-red-600 group/save"
                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-500 hover:text-blue-600"
            }`}
            title={isSaved ? "Saved (Click to remove)" : "Save Job"}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-4 h-4 fill-blue-600 text-blue-600 group-hover/save:hidden" />
                <BookmarkX className="w-4 h-4 hidden group-hover/save:block text-red-600" />
              </>
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold transition cursor-pointer"
            title="Close view (X)"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-5 sm:px-7 py-5 flex-1 space-y-5">
        {/* Company + Title */}
        <div className="flex items-start gap-4">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-extrabold text-sm sm:text-base shrink-0 shadow-sm shadow-blue-500/10 overflow-hidden">
            {job.company_image ? (
              <img
                src={job.company_image}
                alt={job.company}
                className="w-full h-full object-cover"
              />
            ) : (
              companyInitials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
              {job.title}
            </h2>
            <p className="text-blue-600 text-sm font-semibold mt-0.5">{job.company}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {job.location || "Multiple"}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                {job.job_type || job.type || "Full Time"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {job.created_at_human || "Recently posted"}
              </span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {isApplied && (
            <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full font-bold shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Already Applied
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Verified Opening
          </span>
          {job.openings && (
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
              {job.openings} Opening{job.openings > 1 ? "s" : ""}
            </span>
          )}
          <span className="text-xs bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-full font-medium">
            {job.experience || job.exp || "Any Experience"}
          </span>
        </div>

        {/* Salary Strip */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl px-4 py-3">
          <p className="text-xs text-emerald-700 font-medium">Monthly / Annual Salary</p>
          <p className="text-lg sm:text-xl font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
            <IndianRupee className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{job.salary || "Competitive"}</span>
          </p>
        </div>

        {/* Skills */}
        {skillsList.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Required Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skillsList.map((s, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-xl font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Work Schedule Details */}
        {(job.working_days || job.shift_timing || job.interview_details) && (
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs sm:text-sm text-gray-700">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Work Schedule & Interview
            </p>
            {job.working_days && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <span><strong>Working Days:</strong> {job.working_days}</span>
              </div>
            )}
            {job.shift_timing && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span><strong>Shift Timing:</strong> {job.shift_timing}</span>
              </div>
            )}
            {job.interview_details && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span><strong>Interview:</strong> {job.interview_details}</span>
              </div>
            )}
          </div>
        )}

        {/* Job Description */}
        {job.description && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              About the Role
            </p>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50/50 p-3.5 rounded-2xl border border-gray-100">
              {job.description}
            </p>
          </div>
        )}

        {/* Key Responsibilities */}
        {responsibilities.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Key Responsibilities
            </p>
            <ul className="space-y-2">
              {responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        {requirements.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Requirements
            </p>
            <ul className="space-y-2">
              {requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <Star className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Perks & Benefits */}
        {perks.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Perks & Benefits
            </p>
            <div className="flex flex-wrap gap-1.5">
              {perks.map((b, i) => (
                <span
                  key={i}
                  className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-xl font-medium"
                >
                  ✓ {b}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recruiter Contact */}
        {(job.contact_person || job.contact_phone || job.contact_email) && (
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5 text-xs text-gray-600">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Recruiter Contact
            </p>
            {job.contact_person && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span>{job.contact_person}</span>
              </div>
            )}
            {job.contact_phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>{job.contact_phone}</span>
              </div>
            )}
            {job.contact_email && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>{job.contact_email}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Bar: Apply Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 sm:px-7 py-3.5 z-10 shadow-md">
        {isApplied ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-bold flex-1 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Application Submitted ({job.application_status ? (job.application_status.charAt(0).toUpperCase() + job.application_status.slice(1)) : 'Applied'})</span>
            </div>
            <Link
              href="/my-applications"
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs whitespace-nowrap"
            >
              Track Status
            </Link>
          </div>
        ) : job.can_apply ? (
          <Link
            href={isLoggedIn ? `/apply/${job.uuid || job.id}` : "#"}
            onClick={(e) => {
              if (!isLoggedIn) {
                e.preventDefault();
                onLoginRequired("apply for this job");
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer"
          >
            <span>{job.application_status === "rejected" ? "Apply Again" : "Apply Now"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="w-full py-3 rounded-xl text-white text-xs sm:text-sm font-semibold cursor-not-allowed flex items-center justify-center gap-2 bg-gray-400"
          >
            {job.application_status === "rejected"
              ? `Reapply in ${getCountdown ? getCountdown(job.reapply_at) : "a few weeks"}`
              : "Application Closed"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Filter Controls Component (Reused in Sidebar & Mobile Drawer) ── */
function FilterSidebar({
  categories,
  selectedCategory,
  setSelectedCategory,
  availableJobTypes,
  selectedJobType,
  setSelectedJobType,
  availableExperiences,
  selectedExperience,
  setSelectedExperience,
  salaryOptions,
  salaryRange,
  setSalaryRange,
  availableLocations,
  location,
  setLocation,
  hasActiveFilters,
  clearAllFilters,
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-sm text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
          Category
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between cursor-pointer ${selectedCategory === "all" || selectedCategory === "All"
              ? "bg-blue-50 text-blue-700 font-bold"
              : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => {
            const catKey = cat.uuid || cat.id || cat.name;
            const isSelected =
              (cat.uuid && String(selectedCategory).toLowerCase() === String(cat.uuid).toLowerCase()) ||
              (cat.id && String(selectedCategory).toLowerCase() === String(cat.id).toLowerCase()) ||
              String(selectedCategory).toLowerCase() === String(cat.name).toLowerCase();
            const count = cat.count ?? cat.job_posts_count ?? 0;

            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? "all" : catKey)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between cursor-pointer ${isSelected
                  ? "bg-blue-50 text-blue-700 font-bold"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <span className="truncate flex items-center gap-1.5">
                  <span>{cat.icon || "💼"}</span>
                  <span className="truncate">{cat.name}</span>
                </span>
                {count > 0 && (
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-bold ml-1 shrink-0">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Job Type Filter */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
          Job Type
        </label>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setSelectedJobType("all")}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between cursor-pointer ${selectedJobType === "all"
              ? "bg-blue-50 text-blue-700 font-bold"
              : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            <span>All Types</span>
          </button>
          {availableJobTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedJobType(selectedJobType === type ? "all" : type)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between cursor-pointer ${selectedJobType.toLowerCase() === type.toLowerCase()
                ? "bg-blue-50 text-blue-700 font-bold"
                : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              <span>{type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Experience Filter */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
          Experience Level
        </label>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setSelectedExperience("all")}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between cursor-pointer ${selectedExperience === "all"
              ? "bg-blue-50 text-blue-700 font-bold"
              : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            <span>All Levels</span>
          </button>
          {availableExperiences.map((exp) => (
            <button
              key={exp}
              type="button"
              onClick={() => setSelectedExperience(selectedExperience === exp ? "all" : exp)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between cursor-pointer ${selectedExperience.toLowerCase() === exp.toLowerCase()
                ? "bg-blue-50 text-blue-700 font-bold"
                : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              <span>{exp}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
          Salary Range
        </label>
        <div className="space-y-1.5">
          {salaryOptions.map((sal) => (
            <button
              key={sal.value}
              type="button"
              onClick={() => setSalaryRange(sal.value)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between cursor-pointer ${salaryRange === sal.value
                ? "bg-blue-50 text-blue-700 font-bold"
                : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              <span>{sal.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      {availableLocations.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
            City / Location
          </label>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => setLocation("all")}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between cursor-pointer ${location === "all"
                ? "bg-blue-50 text-blue-700 font-bold"
                : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              <span>All Cities</span>
            </button>
            {availableLocations.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocation(location.toLowerCase() === loc.toLowerCase() ? "all" : loc)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between cursor-pointer ${location.toLowerCase() === loc.toLowerCase()
                  ? "bg-blue-50 text-blue-700 font-bold"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <span>{loc}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Named Export for Backward Compatibility ── */
export function CategoriesGrid({ categories = [] }) {
  return null;
}

/* ── Main Dynamic JobListings Component ── */
export default function JobListings({
  jobs = [],
  categories = [],
  locations = [],
  jobTypes = [],
  experiences = [],
  filters = {},
  auth = {},
  savedJobs: initialSavedJobs = [],
  appliedJobs = [],
}) {
  const pageProps = usePage()?.props || {};
  const user = auth?.user || pageProps?.auth?.user;
  const isLoggedIn = !!user;
  const appliedJobsList = Array.isArray(appliedJobs) && appliedJobs.length > 0
    ? appliedJobs
    : (Array.isArray(pageProps?.appliedJobs) ? pageProps.appliedJobs : []);

  const isJobApplied = (job) => {
    if (!job) return false;
    if (job.is_applied) return true;
    const jid = job.id;
    const juuid = job.uuid;
    return Boolean(
      appliedJobsList.includes(jid) ||
      appliedJobsList.includes(String(jid)) ||
      appliedJobsList.includes(Number(jid)) ||
      (juuid && appliedJobsList.includes(juuid))
    );
  };

  // Filter States
  const [search, setSearch] = useState(filters?.search || filters?.skill || "");
  const [location, setLocation] = useState(filters?.location || "all");
  const [selectedCategory, setSelectedCategory] = useState(filters?.category || "all");
  const [selectedJobType, setSelectedJobType] = useState(filters?.job_type || "all");
  const [selectedExperience, setSelectedExperience] = useState(filters?.experience || "all");
  const [salaryRange, setSalaryRange] = useState(filters?.salary || "all");

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loginGateAction, setLoginGateAction] = useState(null);
  const [savedJobs, setSavedJobs] = useState(initialSavedJobs);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (Array.isArray(initialSavedJobs)) {
      setSavedJobs(initialSavedJobs);
    }
  }, [initialSavedJobs]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getCountdown = (date) => {
    if (!date) return "";
    const diff = new Date(date).getTime() - now;
    if (diff <= 0) return "Ready to apply";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  const salaryOptions = [
    { label: "Any Salary", value: "all" },
    { label: "₹10,000 - ₹25,000", value: "10000-25000" },
    { label: "₹25,000 - ₹40,000", value: "25000-40000" },
    { label: "₹40,000 - ₹60,000", value: "40000-60000" },
    { label: "₹60,000 - ₹1,00,000", value: "60000-100000" },
    { label: "₹1,00,000+", value: "100000" },
  ];

  const availableLocations = useMemo(() => {
    const set = new Set();
    locations.forEach((loc) => loc && set.add(loc.trim()));
    jobs.forEach((j) => j.location && set.add(j.location.trim()));
    return Array.from(set);
  }, [locations, jobs]);

  const availableJobTypes = useMemo(() => {
    const set = new Set();
    jobTypes.forEach((t) => t && set.add(t.trim()));
    jobs.forEach((j) => (j.job_type || j.type) && set.add((j.job_type || j.type).trim()));
    return Array.from(set);
  }, [jobTypes, jobs]);

  const availableExperiences = useMemo(() => {
    const set = new Set();
    experiences.forEach((e) => e && set.add(e.trim()));
    jobs.forEach((j) => (j.experience || j.exp) && set.add((j.experience || j.exp).trim()));
    return Array.from(set);
  }, [experiences, jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const q = search.toLowerCase().trim();
      if (q) {
        const titleMatch = job.title && job.title.toLowerCase().includes(q);
        const compMatch = job.company && job.company.toLowerCase().includes(q);
        const descMatch = job.description && job.description.toLowerCase().includes(q);
        const skillsList = Array.isArray(job.skills)
          ? job.skills
          : typeof job.skills === "string"
            ? job.skills.split(",")
            : [];
        const skillsMatch = skillsList.some(
          (s) => typeof s === "string" && s.toLowerCase().includes(q)
        );
        if (!titleMatch && !compMatch && !skillsMatch && !descMatch) {
          return false;
        }
      }

      if (location !== "all") {
        if (
          !job.location ||
          !job.location.toLowerCase().includes(location.toLowerCase())
        ) {
          return false;
        }
      }

      if (selectedJobType !== "all") {
        const jType = (job.job_type || job.type || "").toLowerCase();
        if (jType !== selectedJobType.toLowerCase()) {
          return false;
        }
      }

      if (selectedExperience !== "all") {
        const jExp = (job.experience || job.exp || "").toLowerCase();
        if (jExp !== selectedExperience.toLowerCase()) {
          return false;
        }
      }

      if (selectedCategory !== "all" && selectedCategory !== "All") {
        const catVal = String(selectedCategory).toLowerCase();
        const catUuidMatch = job.category_uuid && String(job.category_uuid).toLowerCase() === catVal;
        const catIdMatch = (job.category_id || job.uuid) && String(job.category_id || job.uuid).toLowerCase() === catVal;
        const catName = (
          job.category_name ||
          job.category?.name ||
          job.category ||
          ""
        ).toLowerCase();
        const catMatch =
          catName === catVal ||
          catName.includes(catVal);
        if (!catUuidMatch && !catIdMatch && !catMatch) {
          return false;
        }
      }

      if (salaryRange !== "all") {
        const minSal = parseFloat(job.min_salary || 0);
        const maxSal = parseFloat(job.max_salary || 99999999);
        const [lowStr, highStr] = salaryRange.split("-");
        const filterLow = parseFloat(lowStr || 0);
        const filterHigh = highStr ? parseFloat(highStr) : Infinity;

        if (minSal && maxSal) {
          if (maxSal < filterLow || minSal > filterHigh) {
            return false;
          }
        }
      }

      return true;
    });
  }, [jobs, search, location, selectedJobType, selectedExperience, selectedCategory, salaryRange]);

  useEffect(() => {
    if (selectedJob) {
      const selectedKey = selectedJob.uuid || selectedJob.id;
      const exists = filteredJobs.find((j) => (j.uuid || j.id) === selectedKey);
      if (!exists) {
        setSelectedJob(null);
      } else {
        setSelectedJob(exists);
      }
    }
  }, [filteredJobs]);

  const hasActiveFilters =
    search.trim() !== "" ||
    location !== "all" ||
    selectedCategory !== "all" ||
    selectedJobType !== "all" ||
    selectedExperience !== "all" ||
    salaryRange !== "all";

  const clearAllFilters = () => {
    setSearch("");
    setLocation("all");
    setSelectedCategory("all");
    setSelectedJobType("all");
    setSelectedExperience("all");
    setSalaryRange("all");
    setSelectedJob(null);
  };

  const handleToggleSaveJob = (e, jobIdentifier) => {
    if (e) e.stopPropagation();
    if (!isLoggedIn) {
      setLoginGateAction("save jobs to your candidate wishlist");
      return;
    }
    const isAlreadySaved = savedJobs.includes(jobIdentifier);
    if (isAlreadySaved) {
      setSavedJobs(savedJobs.filter((id) => id !== jobIdentifier));
      router.post(route("jobs.unsave", jobIdentifier), {}, { preserveScroll: true });
    } else {
      setSavedJobs([...savedJobs, jobIdentifier]);
      router.post(route("jobs.save", jobIdentifier), {}, { preserveScroll: true });
    }
  };

  const handleItemClick = (job) => {
    const jobKey = job.uuid || job.id;
    const currentKey = selectedJob?.uuid || selectedJob?.id;
    if (currentKey === jobKey) {
      setSelectedJob(null);
    } else {
      setSelectedJob(job);
    }
  };

  return (
    <>
      <Head title="Find Jobs in India - ATS" />
      <HomepageLayout>
        {/* Login Gate Modal */}
        {loginGateAction && (
          <LoginGateModal
            action={loginGateAction}
            onClose={() => setLoginGateAction(null)}
            onLogin={() => {
              setLoginGateAction(null);
              router.get(route("login"));
            }}
          />
        )}

        <div className="w-full max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* Header Title Section */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Verified Direct Openings</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                Find Jobs in{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  India
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Explore {jobs.length}+ opportunities from top companies & direct recruiters
              </p>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-800 shadow-xs hover:bg-gray-50 transition cursor-pointer self-start sm:self-auto"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              )}
            </button>
          </div>

          {/* Full-Width Hero Search Bar */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-2 sm:p-3 shadow-xs">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
              {/* Keyword Search */}
              <div className="flex items-center gap-2.5 flex-1 px-3 py-2 bg-gray-50/70 rounded-xl border border-transparent focus-within:border-blue-400 focus-within:bg-white transition-all">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Job title, skill, or company name..."
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
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/70 rounded-xl border border-transparent focus-within:border-blue-400 focus-within:bg-white md:w-52 transition-all">
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

              {/* Category Select */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50/70 rounded-xl border border-transparent focus-within:border-blue-400 focus-within:bg-white md:w-56 transition-all">
                <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs sm:text-sm text-gray-700 bg-transparent border-0 ring-0 focus:ring-0 cursor-pointer outline-none font-medium"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.uuid || cat.id || cat.name} value={cat.uuid || cat.name}>
                      {cat.name} ({cat.count ?? 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset or Action Button */}
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              ) : (
                <div className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-xs shrink-0 select-none">
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Category Tabs Bar */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${selectedCategory === "all" || selectedCategory === "All"
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                }`}
            >
              All Roles {jobs.length > 0 && `(${jobs.length})`}
            </button>

            {categories.map((cat) => {
              const catKey = cat.uuid || cat.name;
              const isSelected =
                (cat.uuid && String(selectedCategory).toLowerCase() === String(cat.uuid).toLowerCase()) ||
                (cat.id && String(selectedCategory).toLowerCase() === String(cat.id).toLowerCase()) ||
                String(selectedCategory).toLowerCase() === String(cat.name).toLowerCase();
              const count = cat.count ?? cat.job_posts_count ?? 0;

              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? "all" : catKey)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                    }`}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  <span>{cat.name}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Main 2-Column Portal Section */}
          <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
            {/* Desktop Left Sidebar: Permanent Filters */}
            <aside className="hidden lg:block w-56 xl:w-60 shrink-0 bg-white rounded-2xl border border-gray-200/90 p-3.5 sm:p-4 shadow-2xs sticky top-20">
              <FilterSidebar
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                availableJobTypes={availableJobTypes}
                selectedJobType={selectedJobType}
                setSelectedJobType={setSelectedJobType}
                availableExperiences={availableExperiences}
                selectedExperience={selectedExperience}
                setSelectedExperience={setSelectedExperience}
                salaryOptions={salaryOptions}
                salaryRange={salaryRange}
                setSalaryRange={setSalaryRange}
                availableLocations={availableLocations}
                location={location}
                setLocation={setLocation}
                hasActiveFilters={hasActiveFilters}
                clearAllFilters={clearAllFilters}
              />
            </aside>

            {/* Right Main Job Area */}
            <main className="flex-1 min-w-0 w-full space-y-4">
              {/* Results Status Bar */}
              {/* <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-gray-200/80 shadow-2xs">
                <p className="text-xs sm:text-sm text-gray-600">
                  Showing <span className="font-extrabold text-gray-900">{filteredJobs.length}</span> open positions
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
              </div> */}

              {/* No Jobs Found State */}
              {filteredJobs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-6 max-w-lg mx-auto">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-3">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">No matching jobs found</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                    Try adjusting your search keywords, location, or selected category filters.
                  </p>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : selectedJob ? (
                /* Split View when a job is clicked */
                <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
                  {/* Left Column in split view: Job List */}
                  <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1">
                    {filteredJobs.map((job) => {
                      const companyInitials = (job.company || "Job").slice(0, 2).toUpperCase();
                      const jobKey = job.uuid || job.id;
                      const selectedKey = selectedJob ? selectedJob.uuid || selectedJob.id : null;
                      const isSelected = selectedKey === jobKey;
                      const isSaved = savedJobs.includes(job.uuid) || savedJobs.includes(job.id);
                      const applied = isJobApplied(job);

                      return (
                        <div
                          key={jobKey}
                          onClick={() => handleItemClick(job)}
                          className={`bg-white rounded-2xl border p-4 transition-all cursor-pointer shadow-2xs ${isSelected
                            ? "border-blue-600 ring-2 ring-blue-100 bg-blue-50/30"
                            : "border-gray-200 hover:border-blue-300 hover:shadow-xs"
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                              {job.company_image ? (
                                <img
                                  src={job.company_image}
                                  alt={job.company}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                companyInitials
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-1.5">
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-bold text-sm text-gray-900 truncate">
                                    {job.title}
                                  </h3>
                                  <p className="text-xs text-blue-600 font-semibold truncate mt-0.5">
                                    {job.company}
                                  </p>
                                </div>

                                {/* Highlighted Save Button on Split Card */}
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleSaveJob(e, job.uuid || job.id)}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-bold transition cursor-pointer shrink-0 shadow-2xs ${isSaved
                                    ? "bg-blue-50 hover:bg-red-50 border-blue-200 hover:border-red-200 text-blue-600 hover:text-red-600 group/save"
                                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-500 hover:text-blue-600"
                                    }`}
                                  title={isSaved ? "Saved (Click to remove)" : "Save Job"}
                                >
                                  {isSaved ? (
                                    <>
                                      <BookmarkCheck className="w-3.5 h-3.5 fill-blue-600 text-blue-600 group-hover/save:hidden" />
                                      <BookmarkX className="w-3.5 h-3.5 hidden group-hover/save:block text-red-600" />
                                      <span className="text-[11px] group-hover/save:hidden"></span>
                                      <span className="text-[11px] hidden group-hover/save:inline"></span>
                                    </>
                                  ) : (
                                    <>
                                      <Bookmark className="w-3.5 h-3.5" />
                                      <span className="text-[11px]"></span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1.5">
                                <span className="flex items-center gap-0.5 truncate">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  {job.location || "Multiple"}
                                </span>
                                <span>•</span>
                                <span className="font-bold text-emerald-700">
                                  {job.salary || "Competitive"}
                                </span>
                              </div>
                              {applied && (
                                <div className="mt-2">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shadow-2xs">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Applied
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Column in split view: Job Detail Panel */}
                  <div className="flex-1 w-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] flex flex-col overscroll-contain">
                    <JobDetailPanel
                      job={selectedJob}
                      onClose={() => setSelectedJob(null)}
                      isLoggedIn={isLoggedIn}
                      onLoginRequired={(action) => setLoginGateAction(action)}
                      onSaveJob={(id) => handleToggleSaveJob(null, id)}
                      isSaved={savedJobs.includes(selectedJob.uuid) || savedJobs.includes(selectedJob.id)}
                      isApplied={isJobApplied(selectedJob)}
                      getCountdown={getCountdown}
                    />
                  </div>
                </div>
              ) : (
                /* Default View: Rich Responsive 3-Column Grid of Job Cards */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredJobs.map((job) => {
                    const companyInitials = (job.company || "Job").slice(0, 2).toUpperCase();
                    const jobKey = job.uuid || job.id;
                    const isSaved = savedJobs.includes(job.uuid) || savedJobs.includes(job.id);
                    const applied = isJobApplied(job);

                    return (
                      <div
                        key={jobKey}
                        onClick={() => handleItemClick(job)}
                        className="bg-white rounded-2xl border border-gray-200/90 p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer group shadow-2xs"
                      >
                        <div>
                          {/* Card Header: Avatar + Title + Bookmark */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-start gap-3.5 min-w-0">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-sm font-black shrink-0 overflow-hidden shadow-2xs">
                                {job.company_image ? (
                                  <img
                                    src={job.company_image}
                                    alt={job.company}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  companyInitials
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-base text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                                  {job.title}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-xs font-semibold text-blue-600 truncate">
                                    {job.company}
                                  </span>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                </div>
                              </div>
                            </div>

                            {/* Header Actions: Applied Badge + Highlighted Bookmark Button */}
                            <div className="flex items-center gap-2 shrink-0">
                              {applied && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Applied</span>
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => handleToggleSaveJob(e, job.uuid || job.id)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer shrink-0 font-bold text-xs shadow-2xs ${isSaved
                                  ? "bg-blue-50 hover:bg-red-50 border-blue-200 hover:border-red-200 text-blue-600 hover:text-red-600 group/save"
                                  : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-500 hover:text-blue-600"
                                  }`}
                                title={isSaved ? "Saved (Click to remove)" : "Save Job"}
                              >
                                {isSaved ? (
                                  <>
                                    <BookmarkCheck className="w-4 h-4 fill-blue-600 text-blue-600 group-hover/save:hidden" />
                                    <BookmarkX className="w-4 h-4 hidden group-hover/save:block text-red-600" />
                                    <span className="group-hover/save:hidden"></span>
                                    <span className="hidden group-hover/save:inline"></span>
                                  </>
                                ) : (
                                  <>
                                    <Bookmark className="w-4 h-4" />
                                    <span></span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Meta Tags Row */}
                          <div className="flex flex-wrap items-center gap-2 mb-3.5 text-xs text-gray-600">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              <span>{job.location || "Multiple Locations"}</span>
                            </span>

                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100">
                              <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                              <span>{job.job_type || job.type || "Full Time"}</span>
                            </span>

                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span>{job.experience || job.exp || "Fresher / Any Exp"}</span>
                            </span>
                          </div>
                        </div>

                        {/* Card Bottom: Salary & Action Buttons */}
                        <div className="pt-3.5 border-t border-gray-100 mt-2 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] text-gray-400 block font-medium">Offered Salary</span>
                            <div className="text-sm font-extrabold text-emerald-700 flex items-center gap-0.5">
                              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{job.salary || "Competitive"}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {applied && (
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 shadow-2xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Applied</span>
                              </span>
                            )}
                            <span className="text-xs font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                              <span>Details</span>
                              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Mobile Filter Slide-Over Drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setShowMobileFilters(false)}
            />

            {/* Drawer Container */}
            <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                  <h3 className="font-bold text-base text-gray-900">Filter Jobs</h3>
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <FilterSidebar
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  availableJobTypes={availableJobTypes}
                  selectedJobType={selectedJobType}
                  setSelectedJobType={setSelectedJobType}
                  availableExperiences={availableExperiences}
                  selectedExperience={selectedExperience}
                  setSelectedExperience={setSelectedExperience}
                  salaryOptions={salaryOptions}
                  salaryRange={salaryRange}
                  setSalaryRange={setSalaryRange}
                  availableLocations={availableLocations}
                  location={location}
                  setLocation={setLocation}
                  hasActiveFilters={hasActiveFilters}
                  clearAllFilters={clearAllFilters}
                />
              </div>

              <div className="pt-4 border-t border-gray-100 mt-6 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition shadow-xs cursor-pointer"
                >
                  Show {filteredJobs.length} Results
                </button>
              </div>
            </div>
          </div>
        )}
      </HomepageLayout>
    </>
  );
}