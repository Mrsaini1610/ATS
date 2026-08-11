import { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import {
  BookmarkCheck,
  BookmarkX,
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  Search,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  Star,
  Shield,
  Share2,
} from "lucide-react";

// Job Detail Drawer Component
function JobDetailDrawer({
  job,
  onClose,
  onApply,
  onUnsave,
  isApplied,
  isLoggedIn,
  onLoginRequired,
}) {
  return (
    <div className="fixed inset-0 z-50 flex lg:relative lg:inset-auto lg:flex-1 lg:flex-col">
      <div
        className="absolute inset-0 bg-black/40 lg:hidden"
        onClick={onClose}
      />
      <div className="absolute bottom-0 left-0 right-0 lg:relative bg-white rounded-t-3xl lg:rounded-2xl shadow-2xl lg:shadow-sm border border-gray-100 flex flex-col max-h-[90vh] lg:max-h-none lg:h-full overflow-hidden">
        {/* Header Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex gap-2">
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Share2 className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={onUnsave}
              className="p-2 border border-red-200 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
            >
              <BookmarkX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="overflow-y-auto flex-1 px-5 py-5">
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`w-14 h-14 ${job.companyColor || "bg-blue-600"} rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0`}
            >
              {job.companyLogo || "Job"}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{job.title}</h2>
              <p className="text-blue-600 text-sm font-medium">{job.company}</p>
              <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {job.type}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {job.posted}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {job.hot && (
              <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-full">
                🔥 Hot
              </span>
            )}
            <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
              {job.openings} Opening{job.openings > 1 ? "s" : ""}
            </span>
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
              {job.exp}
            </span>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
            <p className="text-xs text-green-600 font-medium">Annual CTC</p>
            <p className="text-xl font-bold text-green-700">{job.salary}</p>
          </div>

          {job.skills && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Required Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((s) => (
                  <span
                    key={s}
                    className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.desc && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                About the Role
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">{job.desc}</p>
            </div>
          )}

          {job.requirements && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Requirements
              </p>
              <ul className="space-y-1.5">
                {job.requirements.map((r) => (
                  <li
                    key={r}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <Star className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.benefits && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Perks & Benefits
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job.benefits.map((b) => (
                  <span
                    key={b}
                    className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-full"
                  >
                    ✓ {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-9 h-9 ${job.companyColor || "bg-blue-600"} rounded-lg flex items-center justify-center text-white text-xs font-bold`}
              >
                {job.companyLogo || "Job"}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {job.company}
                </p>
                <p className="text-xs text-gray-500">
                  {job.companyIndustry} · {job.companySize}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">{job.companyAbout}</p>
          </div>
        </div>

        {/* Footer Apply CTA */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          {isApplied ? (
            <div className="flex items-center justify-center gap-2 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Application Submitted
            </div>
          ) : (
            <button
              onClick={() =>
                isLoggedIn ? onApply() : onLoginRequired("apply")
              }
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200"
            >
              <ArrowRight className="w-4 h-4" /> Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Saved Jobs Component
export default function SavedJobs() {
  const { props } = usePage();
  const auth = props?.auth;
  const isLoggedIn = !!auth?.user;

  // Real data comes via props in Inertia, fallback empty arrays
  const savedJobsList = props?.savedJobs || [];
  const appliedJobsList = props?.appliedJobs || [];

  const [selectedJob, setSelectedJob] = useState(null);
  const [loginGateAction, setLoginGateAction] = useState(null);

  const handleUnsave = (jobId) => {
    router.delete(`/saved-jobs/${jobId}`, {
      preserveScroll: true,
      onSuccess: () => {
        if (selectedJob?.id === jobId) setSelectedJob(null);
      },
    });
  };

  const handleApply = (jobId) => {
    router.visit(`/apply/${jobId}`);
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Login to View Saved Jobs
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Sign in to access your saved job listings and apply with one tap.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/login"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
          >
            Sign In
          </Link>
          <Link
            href="/job-search"
            className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
          >
            Browse Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pt-16">
      {/* Login Requirement Modal */}
      {loginGateAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-7 max-w-sm w-full text-center shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-2">Login Required</h3>
            <p className="text-sm text-gray-500 mb-5">
              Please sign in to {loginGateAction}.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setLoginGateAction(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => router.visit("/login")}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Heading */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {savedJobsList.length} job{savedJobsList.length !== 1 ? "s" : ""} saved
        </p>
      </div>

      {/* Empty State */}
      {savedJobsList.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <BookmarkCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">
            No Saved Jobs Yet
          </h3>
          <p className="text-sm text-gray-400 mb-5">
            Browse jobs and tap the bookmark icon to save them here.
          </p>
          <Link
            href="/job-search"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
          >
            <Search className="w-4 h-4" /> Browse Jobs
          </Link>
        </div>
      ) : (
        /* Jobs List & Detail Panel */
        <div className="flex gap-4">
          {/* List Section */}
          <div
            className={`${
              selectedJob ? "hidden lg:flex" : "flex"
            } flex-col flex-1 lg:max-w-[420px] shrink-0 gap-3`}
          >
            {savedJobsList.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedJob?.id === job.id
                    ? "border-blue-400"
                    : "border-gray-100 hover:border-blue-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 ${
                      job.companyColor || "bg-blue-600"
                    } rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0`}
                  >
                    {job.companyLogo || "Job"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900">
                          {job.title}
                        </h3>
                        <p className="text-xs text-gray-500">{job.company}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnsave(job.id);
                        }}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"
                      >
                        <BookmarkX className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-gray-500">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <DollarSign className="w-3 h-3" />
                        {job.salary}
                      </span>
                    </div>

                    <div className="flex gap-1 mt-2">
                      {job.hot && (
                        <span className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full">
                          🔥 Hot
                        </span>
                      )}
                      {appliedJobsList.includes(job.id) && (
                        <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">
                          ✓ Applied
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Details Drawer / Container */}
          <div
            className={`${
              selectedJob ? "flex" : "hidden lg:flex"
            } flex-1`}
          >
            {selectedJob ? (
              <JobDetailDrawer
                job={selectedJob}
                onClose={() => setSelectedJob(null)}
                onApply={() => handleApply(selectedJob.id)}
                onUnsave={() => handleUnsave(selectedJob.id)}
                isApplied={appliedJobsList.includes(selectedJob.id)}
                isLoggedIn={isLoggedIn}
                onLoginRequired={(action) => setLoginGateAction(action)}
              />
            ) : (
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BookmarkCheck className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Select a job to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
