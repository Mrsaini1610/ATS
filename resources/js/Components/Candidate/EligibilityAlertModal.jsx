import React from "react";
import { Link } from "@inertiajs/react";
import { AlertTriangle, X, GraduationCap, CheckCircle, ArrowRight, UserCheck } from "lucide-react";

export default function EligibilityAlertModal({
  isOpen,
  onClose,
  job,
  eligibility,
}) {
  if (!isOpen || !eligibility) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overscroll-contain animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-7 max-w-[460px] w-full border border-gray-100 relative my-auto animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
            Qualification Requirement Not Met
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            You do not meet the minimum educational qualification required for this position.
          </p>
        </div>

        {/* Job Title Box */}
        {job && (
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 mb-4 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Applied Position
            </span>
            <p className="text-sm font-bold text-gray-900 truncate mt-0.5">{job.title}</p>
            <p className="text-xs text-blue-600 font-semibold">{job.company}</p>
          </div>
        )}

        {/* Qualification Comparison Card */}
        <div className="space-y-2.5 mb-5">
          <div className="p-3.5 rounded-2xl bg-red-50/80 border border-red-200 flex items-center justify-between text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block">
                  Required Minimum Education
                </span>
                <span className="text-sm font-extrabold text-red-900">
                  {eligibility.jobMinQual || "Graduate"}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-200/80 text-red-800">
              Mandatory
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Your Profile Qualification
                </span>
                <span className="text-sm font-extrabold text-slate-800">
                  {eligibility.candidateQual || "Not Specified / 10th"}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              Lower
            </span>
          </div>
        </div>

        {/* Note */}
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 text-left leading-relaxed mb-5">
          <strong>Kripya Dhyan Dein:</strong> Is company ne is post ke liye kam se kam{" "}
          <strong className="underline">{eligibility.jobMinQual}</strong> mangi hai. Jo candidates is qualification se niche hain, ve is post par apply nahi kar sakte.
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Link
            href="/profile"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs"
          >
            <span>Update My Education in Profile</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Close & View Other Jobs
          </button>
        </div>
      </div>
    </div>
  );
}

