import React, { useState, useMemo, useEffect, useRef } from "react";
import HomepageLayout from "@/Layouts/HomepageLayout";
import CandidateLoginModal from "@/Components/Candidate/CandidateLoginModal";
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
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  User,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  RotateCcw,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { useUserCoords, getJobMinQualification, checkJobEligibility } from "@/Utils/jobHelpers";
import EligibilityAlertModal from "@/Components/Candidate/EligibilityAlertModal";

/* ── Login Gate Modal ── */
function LoginGateModal({ action, onClose, onLogin }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-7 max-w-sm w-full text-center border border-gray-100 animate-in zoom-in-95 duration-150">
        <div className="w-13 h-13 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3.5 border border-blue-100 shadow-xs">
          <Shield className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">Candidate Sign In Required</h3>
        <p className="text-xs text-gray-500 mt-1 mb-5 leading-relaxed">
          Please verify your mobile number to <strong>{action}</strong>. Instant OTP login — 100% free.
        </p>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onLogin}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer shadow-md shadow-blue-600/25"
          >
            Continue with OTP
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
  user,
  onLoginRequired,
  onSaveJob,
  isSaved,
  isApplied,
  getCountdown,
  onIneligibleClick,
}) {
  if (!job) return null;

  const { getDistanceTo } = useUserCoords(user);
  const distance = job ? getDistanceTo(job.latitude, job.longitude) : null;
  const minQual = getJobMinQualification(job);
  const eligibility = checkJobEligibility(job, user);

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
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [job?.uuid || job?.id]);

  // Track job view in audit logs
  useEffect(() => {
    if (job) {
      const jobKey = job.uuid || job.id;
      if (jobKey) {
        fetch(`/jobs/${jobKey}/track-view`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          },
        }).catch(() => {});
      }
    }
  }, [job?.uuid || job?.id]);

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      {/* Top Header Bar */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 flex items-center justify-between z-10">
        {/* Left: Category Tag */}
        <div>
          {job.category_name && (
            <span className="inline-flex text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100 items-center gap-1">
              {job.category_icon || "💼"} {job.category_name}
            </span>
          )}
        </div>

        {/* Right: Apply Button, Save Bookmark and Close Button */}
        <div className="flex items-center gap-2 ml-auto flex-wrap sm:flex-nowrap justify-end">
          {isApplied ? (
            <Link
              href="/my-applications"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition shadow-2xs whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Applied</span>
            </Link>
          ) : job.can_apply ? (
            eligibility.isRestricted ? (
              <button
                type="button"
                onClick={() => onIneligibleClick && onIneligibleClick(job, eligibility)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer whitespace-nowrap"
                title="Minimum qualification requirement not met"
              >
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                <span>Ineligible ({minQual.label})</span>
              </button>
            ) : (
              <Link
                href={isLoggedIn ? `/apply/${job.uuid || job.id}` : "#"}
                onClick={(e) => {
                  if (!isLoggedIn) {
                    e.preventDefault();
                    onLoginRequired("apply for this job");
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs hover:shadow cursor-pointer whitespace-nowrap"
              >
                <span>{job.application_status === "rejected" ? "Apply Again" : "Apply Now"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )
          ) : (
            <span className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-500 rounded-xl text-xs font-semibold">
              Closed
            </span>
          )}

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

      {/* Main Content Area (Independent Scroller) */}
      <div ref={contentRef} className="flex-1 overflow-y-auto custom-scrollbar overscroll-contain px-5 sm:px-7 py-5 space-y-5">
        {/* Company + Title */}
        <div className="flex items-start gap-4">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-extrabold text-sm sm:text-base shrink-0 shadow-sm shadow-blue-500/10 overflow-hidden">
            {job.company_image ? (
              <img
                src={job.company_image.startsWith('http://') || job.company_image.startsWith('https://') ? job.company_image : (job.company_image.startsWith('/') ? job.company_image : `/storage/${job.company_image}`)}
                alt={job.company}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
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
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{job.location || "Multiple"}</span>
                {distance && <span className="text-blue-600 font-bold">• {distance}</span>}
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
          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${
            eligibility.isRestricted
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-purple-50 text-purple-700 border-purple-200"
          }`}>
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Min. {minQual.label}</span>
          </span>
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

        {/* Ineligible Warning Notice */}
        {isLoggedIn && eligibility.isRestricted && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-red-900">Ineligible: Minimum {minQual.label} Required</p>
              <p className="mt-0.5 text-red-700 text-[11px] leading-relaxed">
                Your profile indicates <strong>{eligibility.candidateQual || "Below requirement"}</strong>. Employer requires candidates to have at least <strong>{minQual.label}</strong> to apply.
              </p>
            </div>
          </div>
        )}

        {/* Salary Strip */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
            <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">
              Offered Salary ({job.salary_type ? job.salary_type.toUpperCase() : "MONTHLY"})
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {job.salary_type && (
                <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {job.salary_type}
                </span>
              )}
              {job.bonus_offered === "yes" && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  + Bonus
                </span>
              )}
            </div>
          </div>
          <p className="text-lg sm:text-xl font-extrabold text-emerald-900 flex items-center gap-1">
            {(!job.salary || !job.salary.includes("₹")) && (
              <IndianRupee className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{job.salary || "Competitive"}</span>
          </p>
        </div>

        {/* Age Criteria */}
        {(job.min_age || job.max_age) && (
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center gap-2 text-xs text-blue-900">
            <span className="font-bold">Age Criteria:</span>
            <span>{job.min_age || 18} - {job.max_age || 60} Years</span>
          </div>
        )}

        {/* Languages */}
        {job.languages && job.languages.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Languages Known
            </p>
            <div className="flex flex-wrap gap-1.5">
              {job.languages.map((lang, i) => (
                <span key={i} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-xl font-medium">
                  🗣️ {lang}
                </span>
              ))}
            </div>
          </div>
        )}

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

        {/* Mandatory Assets / Documents */}
        {job.assets && job.assets.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Mandatory Assets / Documents
            </p>
            <div className="flex flex-wrap gap-1.5">
              {job.assets.map((asset, i) => (
                <span key={i} className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-xl font-medium">
                  📦 {asset}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {job.certifications && job.certifications.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Certifications
            </p>
            <div className="flex flex-wrap gap-1.5">
              {job.certifications.map((cert, i) => (
                <span key={i} className="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-xl font-medium">
                  📜 {cert}
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

      {/* Sleek bottom guarantee strip */}
      <div className="shrink-0 bg-slate-50/80 border-t border-gray-100 px-5 sm:px-7 py-2.5 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          100% Free Application Guarantee
        </span>
        <span className="text-[11px] text-gray-400">Direct hiring partner</span>
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
          {categories.filter((cat) => (cat.count ?? cat.job_posts_count ?? 0) > 0).map((cat) => {
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
  const [activeUser, setActiveUser] = useState(auth?.user || pageProps?.auth?.user || null);
  const user = activeUser || auth?.user || pageProps?.auth?.user;
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
  const safeFilters = Array.isArray(filters) ? {} : (filters || {});
  const [search, setSearch] = useState(safeFilters?.search || safeFilters?.skill || "");
  const [location, setLocation] = useState(safeFilters?.location || "all");
  const [selectedCategory, setSelectedCategory] = useState(safeFilters?.category || "all");
  const [selectedCompany, setSelectedCompany] = useState(safeFilters?.company || "all");
  const [selectedJobType, setSelectedJobType] = useState(safeFilters?.job_type || "all");
  const [selectedExperience, setSelectedExperience] = useState(safeFilters?.experience || "all");
  const [salaryRange, setSalaryRange] = useState(safeFilters?.salary || "all");
  const [sortBy, setSortBy] = useState(typeof safeFilters?.sort === "string" ? safeFilters.sort : "latest");

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loginGateAction, setLoginGateAction] = useState(null);
  const [candidateLoginOpen, setCandidateLoginOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState(initialSavedJobs);
  const [now, setNow] = useState(Date.now());
  const [ineligibleModal, setIneligibleModal] = useState({ isOpen: false, job: null, eligibility: null });
  const categoryScrollRef = useRef(null);
  const categoryButtonRefs = useRef({});

  const { getDistanceTo } = useUserCoords(user);

  // Preserve natural category order - do not reorder selected item to front
  const sortedCategories = useMemo(() => {
    return categories.filter((cat) => (cat.count ?? cat.job_posts_count ?? 0) > 0);
  }, [categories]);

  // Identify currently selected category object for clean badge rendering
  const selectedCategoryObj = useMemo(() => {
    if (!selectedCategory || selectedCategory === "all" || selectedCategory === "All") return null;
    const catVal = String(selectedCategory).toLowerCase().trim();
    return sortedCategories.find(
      (c) =>
        (c.uuid && String(c.uuid).toLowerCase().trim() === catVal) ||
        (c.id && String(c.id).toLowerCase().trim() === catVal) ||
        String(c.name).toLowerCase().trim() === catVal ||
        String(c.name).toLowerCase().trim().includes(catVal) ||
        catVal.includes(String(c.name).toLowerCase().trim())
    );
  }, [selectedCategory, sortedCategories]);

  // Restore any clean filter passed via sessionStorage (e.g. from Categories, Skills, Companies)
  useEffect(() => {
    try {
      const savedFilter = sessionStorage.getItem("ats_job_filter");
      if (savedFilter) {
        const parsed = JSON.parse(savedFilter);
        if (parsed.search) setSearch(parsed.search);
        if (parsed.category) setSelectedCategory(parsed.category);
        if (parsed.company) setSelectedCompany(parsed.company);
        if (parsed.location) setLocation(parsed.location);
        sessionStorage.removeItem("ats_job_filter");
      }
    } catch (e) {
      // Ignore
    }

    // Keep URL clean without visible IDs or query parameters in browser address bar
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // When selected category changes, smoothly scroll the container to center the selected category without reordering
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!categoryScrollRef.current) return;
      if (!selectedCategory || selectedCategory === "all" || selectedCategory === "All") {
        categoryScrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }
      const catVal = String(selectedCategory).toLowerCase().trim();
      const matchedKey = Object.keys(categoryButtonRefs.current).find(
        (k) => k.toLowerCase() === catVal
      );
      const targetEl = matchedKey ? categoryButtonRefs.current[matchedKey] : null;
      if (targetEl && categoryScrollRef.current) {
        const container = categoryScrollRef.current;
        const targetScroll =
          targetEl.offsetLeft - container.offsetWidth / 2 + targetEl.offsetWidth / 2;
        container.scrollTo({ left: Math.max(0, targetScroll), behavior: "smooth" });
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

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
    const list = jobs.filter((job) => {
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

      if (selectedCompany !== "all" && selectedCompany !== "All") {
        const compVal = String(selectedCompany).toLowerCase().trim();
        const jComp = (job.company || "").toLowerCase().trim();
        const jCompUuid = (job.company_uuid || "").toLowerCase().trim();
        const compMatch =
          jComp !== "" &&
          (jComp === compVal || jComp.includes(compVal) || compVal.includes(jComp) || (jCompUuid && jCompUuid === compVal));
        if (!compMatch) {
          return false;
        }
      }

      if (selectedCategory !== "all" && selectedCategory !== "All") {
        const catVal = String(selectedCategory).toLowerCase().trim();
        const catUuidMatch = job.category_uuid && String(job.category_uuid).toLowerCase().trim() === catVal;
        const catIdMatch = job.category_id && String(job.category_id).toLowerCase().trim() === catVal;
        const catName = (
          job.category_name ||
          job.category?.name ||
          (typeof job.category === "string" ? job.category : "") ||
          ""
        ).toLowerCase().trim();
        const catMatch =
          catName !== "" &&
          (catName === catVal || catName.includes(catVal) || catVal.includes(catName));
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

    return [...list].sort((a, b) => {
      if (sortBy === "popular") {
        const appA = Number(a.applicants || 0);
        const appB = Number(b.applicants || 0);
        if (appA !== appB) return appB - appA;
        return (Number(b.id) || 0) - (Number(a.id) || 0);
      }
      if (sortBy === "salary_high") {
        const salA = parseFloat(a.max_salary || a.min_salary || 0);
        const salB = parseFloat(b.max_salary || b.min_salary || 0);
        if (salA !== salB) return salB - salA;
        return (Number(b.id) || 0) - (Number(a.id) || 0);
      }
      if (sortBy === "salary_low") {
        const salA = parseFloat(a.min_salary || a.max_salary || 0);
        const salB = parseFloat(b.min_salary || b.max_salary || 0);
        if (salA !== salB) return salA - salB;
        return (Number(b.id) || 0) - (Number(a.id) || 0);
      }
      // Default: 'latest' -> Newest posts first
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });
  }, [jobs, search, location, selectedJobType, selectedExperience, selectedCategory, selectedCompany, salaryRange, sortBy]);

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

  // Handle Escape key to close in-page job details
  useEffect(() => {
    if (selectedJob) {
      const handleKeyDown = (e) => {
        if (e.key === "Escape") setSelectedJob(null);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [selectedJob]);

  const hasActiveFilters =
    search.trim() !== "" ||
    location !== "all" ||
    selectedCategory !== "all" ||
    selectedCompany !== "all" ||
    selectedJobType !== "all" ||
    selectedExperience !== "all" ||
    salaryRange !== "all";

  const clearAllFilters = () => {
    setSearch("");
    setLocation("all");
    setSelectedCategory("all");
    setSelectedCompany("all");
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
              setCandidateLoginOpen(true);
            }}
          />
        )}

        {/* Inline Candidate Phone & OTP Login Modal */}
        <CandidateLoginModal
          isOpen={candidateLoginOpen}
          onClose={() => setCandidateLoginOpen(false)}
          onSuccess={(loggedInUser) => {
            setActiveUser(loggedInUser);
            setCandidateLoginOpen(false);
          }}
          jobTitle={selectedJob?.title || ""}
          jobKey={selectedJob?.uuid || selectedJob?.id || ""}
        />

        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 space-y-2">
          {/* Header Title Section - Sleek & Space-Efficient */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-gray-900 tracking-tight flex items-center gap-1.5">
                Find Jobs in{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  India
                </span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] sm:text-[11px] font-bold">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>{jobs.length}+ Verified Openings</span>
              </span>
            </div>

            {/* Mobile / Tablet Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className={`${selectedJob ? "flex 2xl:hidden" : "lg:hidden flex"} items-center justify-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800 shadow-2xs hover:bg-gray-50 transition cursor-pointer`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </button>
          </div>

          {/* Compact Hero Search Bar */}
          <div className="bg-white rounded-xl border border-gray-200/90 p-1 sm:p-1.5 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-1.5">
              {/* Keyword Search */}
              <div className="flex items-center gap-2 flex-1 px-2.5 py-1 sm:py-1.5 bg-gray-50/70 rounded-lg border border-transparent focus-within:border-blue-400 focus-within:bg-white transition-all">
                <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Job title, skill, or company name..."
                  className="w-full text-xs text-gray-900 bg-transparent border-0 ring-0 focus:ring-0 placeholder-gray-400 outline-none"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Location Select */}
              <div className="flex items-center gap-1 px-2.5 py-1 sm:py-1.5 bg-gray-50/70 rounded-lg border border-transparent focus-within:border-blue-400 focus-within:bg-white sm:w-40 md:w-44 transition-all">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs text-gray-700 bg-transparent border-0 ring-0 focus:ring-0 cursor-pointer outline-none font-medium truncate"
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
              <div className="hidden md:flex items-center gap-1 px-2.5 py-1 sm:py-1.5 bg-gray-50/70 rounded-lg border border-transparent focus-within:border-blue-400 focus-within:bg-white sm:w-44 md:w-48 transition-all">
                <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs text-gray-700 bg-transparent border-0 ring-0 focus:ring-0 cursor-pointer outline-none font-medium truncate"
                >
                  <option value="all">All Categories</option>
                  {sortedCategories.map((cat) => (
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
                  className="px-3 py-1 sm:py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              ) : (
                <div className="px-3.5 py-1 sm:py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-2xs shrink-0 select-none">
                  <Search className="w-3 h-3" />
                  <span>Search</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Category Tabs Bar with Smooth Centering & Controls */}
          <div className="relative flex items-center gap-1 w-full">
            {/* Scroll Left Button */}
            <button
              type="button"
              onClick={() => categoryScrollRef.current?.scrollBy({ left: -220, behavior: "smooth" })}
              aria-label="Scroll categories left"
              className="hidden sm:flex shrink-0 p-1 bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-full shadow-2xs transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Scrollable Tabs */}
            <div
              ref={categoryScrollRef}
              className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none whitespace-nowrap scroll-smooth flex-1"
            >
              <button
                type="button"
                data-selected={selectedCategory === "all" || selectedCategory === "All" ? "true" : "false"}
                onClick={() => setSelectedCategory("all")}
                className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  selectedCategory === "all" || selectedCategory === "All"
                    ? "bg-blue-600 text-white border-blue-600 shadow-2xs ring-1 ring-blue-300"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                }`}
              >
                All Roles {jobs.length > 0 && `(${jobs.length})`}
              </button>

              {sortedCategories.map((cat) => {
                  const catKey = cat.uuid || cat.name;
                  const isSelected =
                    (cat.uuid && String(selectedCategory).toLowerCase() === String(cat.uuid).toLowerCase()) ||
                    (cat.id && String(selectedCategory).toLowerCase() === String(cat.id).toLowerCase()) ||
                    String(selectedCategory).toLowerCase() === String(cat.name).toLowerCase();
                  const count = cat.count ?? cat.job_posts_count ?? 0;

                  return (
                    <button
                      key={catKey}
                      ref={(el) => {
                        if (el) {
                          categoryButtonRefs.current[catKey] = el;
                          if (cat.name) categoryButtonRefs.current[cat.name] = el;
                          if (cat.uuid) categoryButtonRefs.current[cat.uuid] = el;
                        }
                      }}
                      type="button"
                      data-selected={isSelected ? "true" : "false"}
                      onClick={() => setSelectedCategory(isSelected ? "all" : catKey)}
                      className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1 ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs ring-1 ring-blue-300 font-bold"
                          : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      {cat.icon && <span>{cat.icon}</span>}
                      <span>{cat.name}</span>
                      {count > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>

            {/* Scroll Right Button */}
            <button
              type="button"
              onClick={() => categoryScrollRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
              aria-label="Scroll categories right"
              className="hidden sm:flex shrink-0 p-1 bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-full shadow-2xs transition cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Content Layout */}
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-start w-full">
            {/* Desktop Left Sidebar: Permanent Filters (Collapses on laptop screens when a job is viewed to prevent horizontal squeezing) */}
            <aside
              className={`${
                selectedJob ? "hidden 2xl:block 2xl:w-56" : "hidden lg:block w-52 xl:w-56"
              } shrink-0 bg-white rounded-2xl border border-gray-200/90 p-3 shadow-2xs sticky top-16 max-h-[calc(100vh-4.5rem)] overflow-y-auto custom-scrollbar transition-all duration-200`}
            >
              <FilterSidebar
                categories={sortedCategories}
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
            <main className="flex-1 min-w-0 w-full space-y-2.5">
              {/* Results Status & Sorting Bar - Compact */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200/80 shadow-2xs text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-xs text-gray-600">
                    Showing <span className="font-extrabold text-gray-900">{filteredJobs.length}</span> positions
                  </p>

                  {selectedCategoryObj && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                      <span>Category: {selectedCategoryObj.name}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedCategory("all")}
                        className="hover:text-red-600 transition cursor-pointer"
                        title="Remove category filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedCompany !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                      <span>Company: {selectedCompany}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedCompany("all")}
                        className="hover:text-red-600 transition cursor-pointer"
                        title="Remove company filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {search.trim() !== "" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                      <span>Search: "{search}"</span>
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="hover:text-red-600 transition cursor-pointer"
                        title="Clear search"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer ml-1"
                    >
                      Clear filters
                    </button>
                  )}
                </div>

                {/* Sort By Dropdown */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-[11px] text-gray-500 font-medium">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs font-semibold bg-gray-50 text-gray-800 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="latest">🕒 Latest Jobs</option>
                    <option value="popular">🔥 Most Popular / Applied</option>
                    <option value="salary_high">💰 Salary: High to Low</option>
                    <option value="salary_low">💵 Salary: Low to High</option>
                  </select>
                </div>
              </div>

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
              ) : (
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 items-start">
                  {/* Left Column: Job Cards List with Independent Scroller when Details Open */}
                  <div
                    className={`w-full ${
                      selectedJob
                        ? "lg:w-[42%] xl:w-[38%] 2xl:w-[36%] lg:h-[calc(100vh-5rem)] lg:sticky lg:top-16 lg:overflow-y-auto custom-scrollbar pr-1"
                        : "w-full"
                    } transition-all duration-300 ease-out`}
                  >
                    <div className={selectedJob ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5"}>
                      {filteredJobs.map((job) => {
                        const companyInitials = (job.company || "Job").slice(0, 2).toUpperCase();
                        const jobKey = job.uuid || job.id;
                        const isSaved = savedJobs.includes(job.uuid) || savedJobs.includes(job.id);
                        const applied = isJobApplied(job);
                        const isCurrentSelected = selectedJob?.uuid === job.uuid || selectedJob?.id === job.id;
                        const minQual = getJobMinQualification(job);
                        const distance = getDistanceTo(job.latitude, job.longitude);
                        const eligibility = checkJobEligibility(job, user);
                        const skillsList = Array.isArray(job.skills)
                          ? job.skills
                          : typeof job.skills === "string"
                            ? (job.skills.includes(",") ? job.skills.split(",") : job.skills.split("\n")).map((s) => s.trim()).filter(Boolean)
                            : [];

                        return (
                          <div
                            key={jobKey}
                            onClick={() => handleItemClick(job)}
                            className={`bg-white rounded-2xl border p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer group shadow-2xs ${
                              isCurrentSelected
                                ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50/20"
                                : eligibility.isRestricted
                                  ? "border-red-100/90 hover:border-red-300"
                                  : "border-gray-200/90"
                            }`}
                          >
                        <div>
                          {/* Card Header: Avatar + Company Name on Left, Bookmark on Right */}
                          <div className="flex items-center justify-between gap-2.5 mb-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xs font-black shrink-0 overflow-hidden shadow-2xs">
                                {job.company_image ? (
                                  <img
                                    src={job.company_image.startsWith('http://') || job.company_image.startsWith('https://') ? job.company_image : (job.company_image.startsWith('/') ? job.company_image : `/storage/${job.company_image}`)}
                                    alt={job.company}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  companyInitials
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-bold text-gray-800 truncate max-w-[170px]">
                                    {job.company}
                                  </span>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                </div>
                                {job.created_at_human && (
                                  <span className="text-[10px] text-gray-400 block">{job.created_at_human}</span>
                                )}
                              </div>
                            </div>

                            {/* Top Right: Applied Badge + Bookmark Button */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {applied && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Applied</span>
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => handleToggleSaveJob(e, job.uuid || job.id)}
                                className={`p-1.5 rounded-xl border transition-all duration-200 cursor-pointer shrink-0 ${
                                  isSaved
                                    ? "bg-blue-50 text-blue-600 border-blue-200"
                                    : "bg-white text-gray-400 border-gray-200 hover:text-blue-600 hover:border-blue-300"
                                }`}
                                title={isSaved ? "Saved (Click to remove)" : "Save Job"}
                              >
                                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-blue-600 text-blue-600" : ""}`} />
                              </button>
                            </div>
                          </div>

                          {/* Post Name / Job Title - FULL WIDTH, NEVER SQUEEZED */}
                          <h3 className="font-extrabold text-base text-gray-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 mb-2">
                            {job.title}
                          </h3>

                          {/* Salary & Job Details Strip (Set Prominently right below title) */}
                          <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
                            <div className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg">
                              {(!job.salary || !job.salary.includes("₹")) && (
                                <IndianRupee className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              )}
                              <span>{job.salary || "Competitive Salary"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600">
                              <span className="px-2 py-0.5 bg-gray-100 rounded-md">{job.job_type || job.type || "Full Time"}</span>
                              <span className="px-2 py-0.5 bg-gray-100 rounded-md">{job.experience || job.exp || "Fresher"}</span>
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

                            {/* Requirements / Skills Row */}
                            {skillsList.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider shrink-0">
                                  Requirements:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {skillsList.slice(0, 3).map((skill, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md truncate max-w-[130px]"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {skillsList.length > 3 && (
                                    <span className="text-[10px] font-semibold text-gray-400 self-center">
                                      +{skillsList.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Bottom: Location & Distance ON LEFT (Where salary was) + Action ON RIGHT */}
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

                          {/* Right Action Button */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isLoggedIn && eligibility.isRestricted ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIneligibleModal({ isOpen: true, job, eligibility });
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 shadow-2xs transition cursor-pointer"
                              >
                                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                <span>Ineligible</span>
                              </button>
                            ) : (
                              <span className="text-xs font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                                <span>{isCurrentSelected ? "Viewing" : "Details"}</span>
                                <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isCurrentSelected ? "translate-x-1 text-blue-700" : "group-hover:translate-x-0.5"}`} />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                    </div>
                  </div>

                  {/* Right Column: In-Page Side View for Job Details (Fixed to Screen Height with Inner Scroller) */}
                  {selectedJob && (
                    <div className="hidden lg:flex w-full lg:w-[58%] xl:w-[62%] 2xl:w-[64%] bg-white rounded-2xl border border-gray-200/90 shadow-xl overflow-hidden lg:sticky lg:top-16 lg:h-[calc(100vh-5rem)] flex-col animate-in fade-in slide-in-from-right-4 duration-300 ease-out">
                      <JobDetailPanel
                        job={selectedJob}
                        onClose={() => setSelectedJob(null)}
                        isLoggedIn={isLoggedIn}
                        user={user}
                        onLoginRequired={(action) => setLoginGateAction(action)}
                        onSaveJob={(id) => handleToggleSaveJob(null, id)}
                        isSaved={savedJobs.includes(selectedJob.uuid) || savedJobs.includes(selectedJob.id)}
                        isApplied={isJobApplied(selectedJob)}
                        getCountdown={getCountdown}
                        onIneligibleClick={(j, e) => setIneligibleModal({ isOpen: true, job: j, eligibility: e })}
                      />
                    </div>
                  )}
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
                  categories={sortedCategories}
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

        {/* Mobile Job Details Full-Screen Sheet */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-white animate-in slide-in-from-bottom duration-300">
            <JobDetailPanel
              job={selectedJob}
              onClose={() => setSelectedJob(null)}
              isLoggedIn={isLoggedIn}
              user={user}
              onLoginRequired={(action) => setLoginGateAction(action)}
              onSaveJob={(id) => handleToggleSaveJob(null, id)}
              isSaved={savedJobs.includes(selectedJob.uuid) || savedJobs.includes(selectedJob.id)}
              isApplied={isJobApplied(selectedJob)}
              getCountdown={getCountdown}
              onIneligibleClick={(j, e) => setIneligibleModal({ isOpen: true, job: j, eligibility: e })}
            />
          </div>
        )}

        {/* Qualification Ineligible Alert Modal */}
        <EligibilityAlertModal
          isOpen={ineligibleModal.isOpen}
          onClose={() => setIneligibleModal({ isOpen: false, job: null, eligibility: null })}
          job={ineligibleModal.job}
          eligibility={ineligibleModal.eligibility}
        />
      </HomepageLayout>
    </>
  );
}