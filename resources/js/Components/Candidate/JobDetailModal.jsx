import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, router } from "@inertiajs/react";
import {
  X,
  MapPin,
  Briefcase,
  IndianRupee,
  Clock,
  Calendar,
  CalendarDays,
  Users,
  Award,
  Tag,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Phone,
  Mail,
  User,
  Gift,
  HelpCircle,
  FileText,
  Loader2,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { useUserCoords, getJobMinQualification, checkJobEligibility } from "@/Utils/jobHelpers";
import EligibilityAlertModal from "@/Components/Candidate/EligibilityAlertModal";

export default function JobDetailModal({
  job,
  isOpen,
  onClose,
  isLoggedIn = false,
  user = null,
  onRequireLogin,
  onApplicationSuccess,
}) {
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [eligibilityAlertOpen, setEligibilityAlertOpen] = useState(false);

  const { getDistanceTo } = useUserCoords(user);
  const distance = job ? getDistanceTo(job.latitude, job.longitude) : null;
  const minQual = getJobMinQualification(job);
  const eligibility = checkJobEligibility(job, user);

  // Track job detail view in audit logs
  useEffect(() => {
    if (isOpen && job) {
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
  }, [isOpen, job?.id, job?.uuid]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !job) return null;

  const jobKey = job.uuid || job.id;
  const isAlreadyApplied = Boolean(job.is_applied) || applySuccess;

  // Normalize arrays
  const skillsList = Array.isArray(job.skills)
    ? job.skills
    : typeof job.skills === "string"
      ? (job.skills.includes(",") ? job.skills.split(",") : job.skills.split("\n"))
          .map((s) => s.trim())
          .filter(Boolean)
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

  const handleApplyClick = () => {
    setApplyError("");
    if (!isLoggedIn) {
      if (onRequireLogin) {
        onRequireLogin(job);
      }
      return;
    }

    if (eligibility.isRestricted) {
      setEligibilityAlertOpen(true);
      return;
    }

    // Seamlessly navigate to the 4-step comprehensive job application form
    router.visit(`/apply/${jobKey}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overscroll-contain animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden border border-gray-100 relative my-auto animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-start justify-between gap-4 bg-slate-50/60 shrink-0">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-extrabold text-sm sm:text-base shrink-0 shadow-xs overflow-hidden">
              {job.company_image ? (
                <img
                  src={
                    job.company_image.startsWith("http://") || job.company_image.startsWith("https://")
                      ? job.company_image
                      : job.company_image.startsWith("/")
                        ? job.company_image
                        : `/storage/${job.company_image}`
                  }
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

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-snug truncate">
                  {job.title}
                </h2>
                {isAlreadyApplied && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Applied
                  </span>
                )}
              </div>
              <p className="text-sm text-blue-600 font-bold truncate mt-0.5">
                {job.company || "Direct Employer"}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{job.location || "Multiple Locations"}</span>
                  {distance && (
                    <span className="text-blue-600 font-bold">• {distance}</span>
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                  {job.job_type || job.type || "Full Time"}
                </span>
                {job.created_at_human && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {job.created_at_human}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Top Actions: Apply / Applied / Ineligible, and Close */}
          <div className="flex items-center gap-2 shrink-0">
            {isAlreadyApplied ? (
              <Link
                href="/my-applications"
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition shadow-2xs whitespace-nowrap"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Applied</span>
              </Link>
            ) : eligibility.isRestricted ? (
              <button
                type="button"
                onClick={() => setEligibilityAlertOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer whitespace-nowrap"
                title="Minimum qualification requirement not met"
              >
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                <span>Ineligible ({minQual.label})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApplyClick}
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs hover:shadow cursor-pointer whitespace-nowrap"
              >
                <span>Apply Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-5 divide-y divide-gray-100">
          {/* Success Banner if just applied */}
          {applySuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">Application Submitted Successfully!</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  The hiring team has received your application. You can track your interview status in My Applications.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Link
                    href="/my-applications"
                    className="text-xs font-bold text-emerald-800 underline hover:text-emerald-900"
                  >
                    View in My Applications →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {applyError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
              {applyError}
            </div>
          )}

          {/* Ineligible Warning Notice */}
          {isLoggedIn && eligibility.isRestricted && (
            <div className="pt-2">
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-900">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-red-900">Eligibility Requirement Not Met</h4>
                  <p className="text-red-700 mt-0.5 leading-relaxed">
                    This job strictly requires minimum <strong>{minQual.label}</strong>. Your profile qualification is <strong>{eligibility.candidateQual || "Below Requirement"}</strong>. You cannot apply for this job.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Salary Card */}
          <div className="pt-2">
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Offered Salary ({job.salary_type ? job.salary_type.toUpperCase() : "MONTHLY"})
                </p>
                <p className="text-xl sm:text-2xl font-black text-emerald-900 flex items-center gap-1 mt-0.5">
                  {!job.salary?.includes("₹") && (
                    <IndianRupee className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  <span>{job.salary || "Competitive Market Standard"}</span>
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {job.salary_type && (
                  <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {job.salary_type}
                  </span>
                )}
                {job.bonus_offered === "yes" && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    + Performance Bonus
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Key Job Specifications Grid */}
          <div className="pt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Minimum Educational Qualification */}
            <div className={`p-3 rounded-xl border ${
              eligibility.isRestricted
                ? "bg-red-50/70 border-red-200"
                : "bg-purple-50/70 border-purple-100"
            }`}>
              <span className="text-[11px] text-gray-500 flex items-center gap-1 font-medium">
                <GraduationCap className={`w-3.5 h-3.5 ${eligibility.isRestricted ? "text-red-500" : "text-purple-600"}`} />
                Min. Education
              </span>
              <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1">
                {minQual.label}
              </p>
            </div>

            {job.openings ? (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[11px] text-gray-500 flex items-center gap-1 font-medium">
                  <Users className="w-3.5 h-3.5 text-blue-500" /> Open Vacancies
                </span>
                <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1">
                  {job.openings} Openings
                </p>
              </div>
            ) : null}

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[11px] text-gray-500 flex items-center gap-1 font-medium">
                <Award className="w-3.5 h-3.5 text-amber-500" /> Experience
              </span>
              <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1">
                {job.experience || `${job.min_experience || 0} - ${job.max_experience || 3} Yrs`}
              </p>
            </div>

            {job.shift_timing && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[11px] text-gray-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" /> Shift Timing
                </span>
                <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1 truncate">
                  {job.shift_timing}
                </p>
              </div>
            )}

            {job.working_days && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[11px] text-gray-500 flex items-center gap-1 font-medium">
                  <CalendarDays className="w-3.5 h-3.5 text-blue-500" /> Working Days
                </span>
                <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1 truncate">
                  {job.working_days}
                </p>
              </div>
            )}

            {(job.min_age || job.max_age) && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[11px] text-gray-500 flex items-center gap-1 font-medium">
                  <User className="w-3.5 h-3.5 text-purple-500" /> Age Criteria
                </span>
                <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1">
                  {job.min_age || 18} - {job.max_age || 60} Yrs
                </p>
              </div>
            )}

            {job.last_date && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[11px] text-gray-500 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-red-500" /> Apply By
                </span>
                <p className="text-xs sm:text-sm font-bold text-red-600 mt-1">
                  {new Date(job.last_date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Key Skills */}
          {skillsList.length > 0 && (
            <div className="pt-5">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" /> Required Skills & Knowledge
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {skillsList.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50/80 border border-blue-200/70 text-blue-800 rounded-xl text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {job.description && (
            <div className="pt-5">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                Job Overview & Details
              </h4>
              <div className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>
          )}

          {/* Responsibilities */}
          {responsibilities.length > 0 && (
            <div className="pt-5">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                Key Responsibilities
              </h4>
              <ul className="space-y-2">
                {responsibilities.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Qualifications & Requirements */}
          {requirements.length > 0 && (
            <div className="pt-5">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                Qualifications & Requirements
              </h4>
              <ul className="space-y-2">
                {requirements.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Perks / Benefits */}
          {perks.length > 0 && (
            <div className="pt-5">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-amber-500" /> Perks & Additional Benefits
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {perks.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs text-amber-900 flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interview Details / Contact Person */}
          {(job.interview_details || job.contact_person || job.contact_phone || job.contact_email) && (
            <div className="pt-5">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" /> Interview & Recruiter Contact
              </h4>
              <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs text-gray-700 space-y-1.5">
                {job.interview_details && (
                  <p>
                    <strong className="text-gray-900">Interview Mode:</strong> {job.interview_details}
                  </p>
                )}
                {job.contact_person && (
                  <p className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>Contact: {job.contact_person}</span>
                  </p>
                )}
                {job.contact_phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{job.contact_phone}</span>
                  </p>
                )}
                {job.contact_email && (
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{job.contact_email}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Zero Fee Guarantee */}
          <div className="pt-5">
            <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center gap-2.5 text-emerald-800 text-xs font-semibold">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                100% Free Application Guarantee: ATS never charges candidates for job applications or interview calls.
              </span>
            </div>
          </div>
        </div>

        {/* Sleek bottom guarantee strip */}
        <div className="shrink-0 bg-slate-50/80 border-t border-gray-100 px-5 sm:px-6 py-2.5 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            100% Free Application Guarantee
          </span>
          <span className="text-[11px] text-gray-400">Direct hiring partner</span>
        </div>
      </div>

      {/* Qualification Ineligible Alert Modal */}
      <EligibilityAlertModal
        isOpen={eligibilityAlertOpen}
        onClose={() => setEligibilityAlertOpen(false)}
        job={job}
        eligibility={eligibility}
      />
    </div>
  );
}

