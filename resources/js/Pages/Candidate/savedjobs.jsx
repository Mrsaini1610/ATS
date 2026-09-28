import { useState, useEffect } from "react";
import { Link, router, usePage, Head } from "@inertiajs/react";
import HomepageLayout from "@/Layouts/HomepageLayout";
import {
  Bookmark,
  BookmarkCheck,
  BookmarkX,
  MapPin,
  Clock,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Star,
  Shield,
  Share2,
  IndianRupee,
  Calendar,
  Building2,
  User,
  Phone,
  Mail,
  X,
  Check,
  Eye,
} from "lucide-react";

// Job Detail Panel Component (Shown on the same screen)
function JobDetailPanel({
  job,
  onClose,
  onApply,
  onUnsave,
  isApplied,
  isLoggedIn,
  onLoginRequired,
  onShare,
  copied,
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
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-150">
      {/* Top Header Actions (Clean toolbar with Share, Remove, Close) */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-end gap-2 z-10 shrink-0">
        {/* Share Button */}
        <button
          type="button"
          onClick={() => onShare(job)}
          className="relative p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition cursor-pointer"
          title="Share job link"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
          {copied && (
            <span className="absolute -bottom-8 right-0 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap z-20">
              Link Copied!
            </span>
          )}
        </button>

        {/* Highlighted Saved Button */}
        <button
          type="button"
          onClick={() => onUnsave(job.uuid || job.id)}
          className="flex items-center gap-1.5 px-3 py-2 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 rounded-xl text-xs font-bold transition cursor-pointer group/unsave shadow-2xs"
          title="Saved (Click to remove)"
        >
          <BookmarkCheck className="w-4 h-4 fill-blue-600 group-hover/unsave:hidden" />
          <BookmarkX className="w-4 h-4 hidden group-hover/unsave:inline text-red-600" />
          <span className="group-hover/unsave:hidden"></span>
          <span className="hidden group-hover/unsave:inline"></span>
        </button>

        {/* Explicit Close Button with X */}
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
          title="Close view"
        >
          <X className="w-4 h-4" />
          <span>Close</span>
        </button>
      </div>

      {/* Main Scrollable Content */}
      <div className="overflow-y-auto flex-1 px-5 sm:px-7 py-6 space-y-6">
        {/* Company & Role Overview */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center text-white font-extrabold text-base sm:text-lg shrink-0 shadow-md shadow-blue-500/15 overflow-hidden">
            {job.company_image ? (
              <img
                src={job.company_image}
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
            <p className="text-blue-600 text-sm font-semibold mt-0.5">
              {job.company}
            </p>
            <div className="flex flex-wrap gap-x-3.5 gap-y-1 mt-2 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {job.location || "Multiple Locations"}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                {job.job_type || job.type || "Full Time"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {job.created_at_human || job.posted || "Recently"}
              </span>
            </div>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap gap-2 pt-1">
          {job.hot && (
            <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full font-bold flex items-center gap-1">
              🔥 Hot Opening
            </span>
          )}
          {job.openings && (
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
              {job.openings} Opening{job.openings > 1 ? "s" : ""}
            </span>
          )}
          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-semibold">
            {job.experience || job.exp || "Any Experience"}
          </span>
          {isApplied && (
            <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Applied
            </span>
          )}
        </div>

        {/* Salary Strip */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">
              Offered Salary / CTC
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-900 flex items-center gap-1 mt-0.5">
              <span>{job.salary || "Competitive"}</span>
            </p>
          </div>
          <div className="p-2.5 bg-emerald-100/60 rounded-xl text-emerald-700">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Work Schedule Details */}
        {(job.working_days || job.shift_timing || job.interview_details) && (
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-2.5 text-xs sm:text-sm text-slate-700">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Work Schedule & Interview
            </p>
            {job.working_days && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Working Days:</strong> {job.working_days}
                </span>
              </div>
            )}
            {job.shift_timing && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Shift Timing:</strong> {job.shift_timing}
                </span>
              </div>
            )}
            {job.interview_details && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Interview Details:</strong> {job.interview_details}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Required Skills */}
        {skillsList.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
              Required Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-50 text-blue-700 border border-blue-200/80 px-3 py-1.5 rounded-xl font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* About Role / Description */}
        {(job.description || job.desc) && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              About the Role
            </p>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
              {job.description || job.desc}
            </p>
          </div>
        )}

        {/* Key Responsibilities */}
        {responsibilities.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
              Key Responsibilities
            </p>
            <ul className="space-y-2">
              {responsibilities.map((resp, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-gray-600"
                >
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements / Qualifications */}
        {requirements.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
              Qualifications & Requirements
            </p>
            <ul className="space-y-2">
              {requirements.map((req, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-gray-600"
                >
                  <Star className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Perks & Benefits */}
        {perks.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
              Perks & Benefits
            </p>
            <div className="flex flex-wrap gap-2">
              {perks.map((perk, i) => (
                <span
                  key={i}
                  className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium"
                >
                  ✓ {perk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recruiter Contact */}
        {(job.contact_person || job.contact_phone || job.contact_email) && (
          <div className="p-4 bg-gray-50/90 rounded-2xl border border-gray-200 space-y-2 text-xs text-gray-700">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Recruiter Contact
            </p>
            {job.contact_person && (
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span>{job.contact_person}</span>
              </div>
            )}
            {job.contact_phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>{job.contact_phone}</span>
              </div>
            )}
            {job.contact_email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>{job.contact_email}</span>
              </div>
            )}
          </div>
        )}

        {/* Company About Box */}
        {(job.company_about || job.company_size || job.company_address) && (
          <div className="bg-gray-50/70 border border-gray-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{job.company}</p>
                {job.company_size && (
                  <p className="text-xs text-gray-500">{job.company_size} Employees</p>
                )}
              </div>
            </div>
            {job.company_about && (
              <p className="text-xs text-gray-600 leading-relaxed pt-1">
                {job.company_about}
              </p>
            )}
            {job.company_address && (
              <p className="text-xs text-gray-500 flex items-center gap-1 pt-1 border-t border-gray-200/60">
                <MapPin className="w-3 h-3 text-gray-400" />
                {job.company_address}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Sticky Bottom Apply Action Bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 sm:px-7 py-4 z-10 shadow-lg shrink-0">
        {isApplied ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 py-3 px-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-bold flex-1 justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Application Submitted</span>
            </div>
            <Link
              href="/my-applications"
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold transition"
            >
              View Status
            </Link>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => (isLoggedIn ? onApply(job.uuid || job.id) : onLoginRequired("apply"))}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm sm:text-base font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition cursor-pointer"
          >
            <span>Apply Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Main Saved Jobs Page
export default function SavedJobs({
  savedJobs: propSavedJobs = [],
  appliedJobs: propAppliedJobs = [],
}) {
  const pageProps = usePage()?.props || {};
  const auth = pageProps?.auth;
  const isLoggedIn = !!auth?.user;

  // Saved jobs list from props
  const initialSavedJobs = propSavedJobs.length > 0 ? propSavedJobs : (pageProps?.savedJobs || []);
  const appliedJobsList = Array.isArray(propAppliedJobs) && propAppliedJobs.length > 0
    ? propAppliedJobs
    : (Array.isArray(pageProps?.appliedJobs) ? pageProps.appliedJobs : []);

  const checkIsApplied = (job) => {
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

  const [savedJobs, setSavedJobs] = useState(initialSavedJobs);
  const [selectedJob, setSelectedJob] = useState(null); // null by default -> 4 cards per row
  const [loginGateAction, setLoginGateAction] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync state if props change
  useEffect(() => {
    const list = propSavedJobs.length > 0 ? propSavedJobs : (pageProps?.savedJobs || []);
    setSavedJobs(list);
  }, [propSavedJobs, pageProps?.savedJobs]);

  // Show temporary toast message
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Handle Unsave with optimistic removal
  const handleUnsave = (jobId) => {
    const jobToRemove = savedJobs.find((j) => j.id === jobId || j.uuid === jobId);
    const updated = savedJobs.filter((j) => j.id !== jobId && j.uuid !== jobId);
    setSavedJobs(updated);

    if (selectedJob?.id === jobId || selectedJob?.uuid === jobId) {
      setSelectedJob(null);
    }

    triggerToast(`"${jobToRemove?.title || "Job"}" removed from saved jobs`);

    router.delete(`/saved-jobs/${jobId}`, {
      preserveScroll: true,
      onError: () => {
        setSavedJobs(initialSavedJobs);
        triggerToast("Failed to remove job. Please try again.");
      },
    });
  };

  // Handle Apply
  const handleApply = (jobKey) => {
    router.visit(`/apply/${jobKey}`);
  };

  // Handle Share Job
  const handleShare = (job) => {
    const jobKey = job.uuid || job.id;
    const url = `${window.location.origin}/apply/${jobKey}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(jobKey);
        triggerToast("Job link copied to clipboard!");
        setTimeout(() => setCopiedId(null), 2500);
      });
    } else {
      triggerToast("Job link: " + url);
    }
  };

  // Guest view if not logged in
  if (!isLoggedIn) {
    return (
      <HomepageLayout>
        <Head title="Saved Jobs - ATS.com" />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sign In to View Saved Jobs
          </h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
            Keep track of all your favorite job openings in one place and apply when you are ready.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/login"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition"
            >
              Sign In
            </Link>
            <Link
              href="/job-search"
              className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </HomepageLayout>
    );
  }

  return (
    <HomepageLayout>
      <Head title="Saved Jobs - ATS" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900/95 backdrop-blur text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-3 duration-200 border border-gray-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Login Gate Modal */}
      {loginGateAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4">
          <div className="bg-white rounded-2xl p-7 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1.5">
              Login Required
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Please sign in to {loginGateAction}.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setLoginGateAction(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => router.visit("/login")}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wide container so 4 cards fit naturally on desktop */}
      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Top Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Bookmark className="w-5 h-5 fill-blue-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Saved Jobs
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            {savedJobs.length} {savedJobs.length === 1 ? "job" : "jobs"} saved in your list
          </p>
        </div>

        {/* Global Empty State */}
        {savedJobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-xs max-w-2xl mx-auto my-6 px-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookmarkCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1.5">
              No Saved Jobs Yet
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
              When browsing job vacancies, tap the bookmark icon to save jobs you want to compare or apply to later.
            </p>
            <Link
              href="/job-search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition"
            >
              <Briefcase className="w-4 h-4" />
              <span>Browse Active Vacancies</span>
            </Link>
          </div>
        ) : selectedJob ? (
          /* ============================================================== */
          /*  ON THE SAME SCREEN: CARDS LIST (LEFT) + DETAIL VIEW (RIGHT)   */
          /*  - NO duplicate top toolbar!                                   */
          /*  - Click any card on left to switch view instantly             */
          /*  - Click "Close" on right panel to return to 4 cards grid      */
          /* ============================================================== */
          <div className="flex flex-col lg:flex-row gap-5 items-start animate-in fade-in duration-150">
            {/* Left Column: Saved Jobs Cards */}
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
                Saved Jobs ({savedJobs.length})
              </p>
              {savedJobs.map((job) => {
                const companyInitials = (job.company || "Job").slice(0, 2).toUpperCase();
                const jobKey = job.uuid || job.id;
                const isCurrent =
                  selectedJob?.id === job.id || selectedJob?.uuid === job.uuid;
                const isJobApplied = checkIsApplied(job);

                return (
                  <div
                    key={jobKey}
                    onClick={() => setSelectedJob(job)}
                    className={`bg-white rounded-2xl border p-4 transition-all cursor-pointer shadow-xs ${isCurrent
                      ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/30"
                      : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden shadow-xs">
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
                            <h4 className="font-bold text-sm text-gray-900 truncate">
                              {job.title}
                            </h4>
                            <p className="text-xs text-blue-600 font-semibold truncate mt-0.5">
                              {job.company}
                            </p>
                          </div>

                          {/* Highlighted Save Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnsave(jobKey);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-red-50 border border-blue-200 hover:border-red-200 text-blue-600 hover:text-red-600 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 group/save shadow-2xs"
                            title="Saved (Click to remove)"
                          >
                            <BookmarkCheck className="w-3.5 h-3.5 fill-blue-600 group-hover/save:hidden" />
                            <BookmarkX className="w-3.5 h-3.5 hidden group-hover/save:block text-red-600" />
                            <span className="text-[11px] group-hover/save:hidden"></span>
                            <span className="text-[11px] hidden group-hover/save:inline"></span>
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1.5">
                          <span className="truncate">{job.location || "Multiple"}</span>
                          <span>•</span>
                          <span className="font-bold text-emerald-700">{job.salary}</span>
                        </div>
                        {isJobApplied && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 border border-emerald-200 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Applied
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Full Details Panel on the same screen */}
            <div className="flex-1 w-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] flex flex-col">
              <JobDetailPanel
                job={selectedJob}
                onClose={() => setSelectedJob(null)}
                onApply={handleApply}
                onUnsave={handleUnsave}
                isApplied={checkIsApplied(selectedJob)}
                isLoggedIn={isLoggedIn}
                onLoginRequired={(action) => setLoginGateAction(action)}
                onShare={handleShare}
                copied={copiedId === (selectedJob.uuid || selectedJob.id)}
              />
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /*  DEFAULT VIEW: 4 CARDS PER ROW (ACROSS WIDE SCREEN)            */
          /*  - Mobile: 1 Column                                            */
          /*  - Tablet: 2 Columns                                           */
          /*  - Medium: 3 Columns                                           */
          /*  - Desktop / Laptop: 4 Columns                                 */
          /* ============================================================== */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {savedJobs.map((job) => {
              const companyInitials = (job.company || "Job").slice(0, 2).toUpperCase();
              const jobKey = job.uuid || job.id;
              const isJobApplied = checkIsApplied(job);
              const skillsList = Array.isArray(job.skills) ? job.skills : [];

              return (
                <div
                  key={jobKey}
                  onClick={() => setSelectedJob(job)}
                  className="bg-white rounded-2xl border border-gray-200/90 hover:border-blue-400 hover:shadow-lg transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between cursor-pointer group shadow-xs relative"
                >
                  <div>
                    {/* Header: Avatar + Title + Applied Badge + Unsave Button */}
                    <div className="flex items-start justify-between gap-2.5 mb-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xs sm:text-sm font-extrabold shrink-0 overflow-hidden shadow-xs">
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
                          <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-blue-600 transition truncate leading-snug">
                            {job.title}
                          </h3>
                          <p className="text-xs font-semibold text-blue-600 truncate mt-0.5">
                            {job.company}
                          </p>
                        </div>
                      </div>

                      {/* Highlighted Saved Bookmark Button + Applied Badge */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isJobApplied && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Applied</span>
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnsave(jobKey);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-red-50 border border-blue-200 hover:border-red-200 text-blue-600 hover:text-red-600 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer shrink-0 shadow-2xs group/save"
                          title="Saved (Click to remove)"
                        >
                          <BookmarkCheck className="w-4 h-4 fill-blue-600 group-hover/save:hidden" />
                          <BookmarkX className="w-4 h-4 hidden group-hover/save:block text-red-600" />
                          <span className="group-hover/save:hidden"></span>
                          <span className="hidden group-hover/save:inline"></span>
                        </button>
                      </div>
                    </div>

                    {/* Location & Salary */}
                    <div className="space-y-1 mb-2.5 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{job.location || "Multiple Locations"}</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-emerald-700 text-sm">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{job.salary || "Competitive"}</span>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 mb-2.5">
                      {job.hot && (
                        <span className="text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
                          🔥 Hot
                        </span>
                      )}
                      <span className="text-[10px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                        {job.job_type || job.type || "Full Time"}
                      </span>
                      <span className="text-[10px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                        {job.experience || job.exp || "Fresher"}
                      </span>
                      {isJobApplied && (
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Applied
                        </span>
                      )}
                    </div>

                    {/* Skills Preview */}
                    {skillsList.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {skillsList.slice(0, 2).map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium truncate max-w-[120px]"
                          >
                            {s}
                          </span>
                        ))}
                        {skillsList.length > 2 && (
                          <span className="text-[10px] text-gray-400 self-center">
                            +{skillsList.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-2.5 border-t border-gray-100 flex items-center gap-2 mt-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedJob(job)}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>

                    {isJobApplied ? (
                      <Link
                        href="/my-applications"
                        onClick={(e) => e.stopPropagation()}
                        className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer whitespace-nowrap inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Track Status</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApply(jobKey);
                        }}
                        className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer whitespace-nowrap"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </HomepageLayout>
  );
}
