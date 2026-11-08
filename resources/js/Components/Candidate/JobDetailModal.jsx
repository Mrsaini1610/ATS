import React, { useState } from "react";
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
} from "lucide-react";

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

  const handleApplyClick = async () => {
    setApplyError("");
    if (!isLoggedIn) {
      if (onRequireLogin) {
        onRequireLogin(job);
      }
      return;
    }

    try {
      setApplying(true);
      const payload = {
        fullName: user?.full_name || user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        city: user?.city || "",
        qualification: user?.qualification || user?.education || "",
      };

      const res = await axios.post(`/apply/${jobKey}`, payload, {
        headers: { Accept: "application/json" },
      });

      if (res.data?.success || res.status === 200) {
        setApplySuccess(true);
        job.is_applied = true;
        if (onApplicationSuccess) {
          onApplicationSuccess(job);
        }
      } else {
        setApplyError(res.data?.message || "Failed to submit application.");
      }
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(", ")
          : "An error occurred while submitting your application. Please try again.");
      setApplyError(msg);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-100 relative my-auto animate-in zoom-in-95 duration-200">
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
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {job.location || "Multiple Locations"}
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

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 divide-y divide-gray-100">
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

        {/* Sticky Action Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-500 w-full sm:w-auto">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Direct recruiter hiring</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Link
              href={`/apply/${jobKey}`}
              className="px-4 py-2.5 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5"
            >
              <span>Full Form</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {isAlreadyApplied ? (
              <Link
                href="/my-applications"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Applied • View Status</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleApplyClick}
                disabled={applying}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {applying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Apply Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

