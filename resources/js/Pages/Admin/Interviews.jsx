import React, { useState, useEffect } from "react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";
import { Head, usePage, useForm, router } from "@inertiajs/react";
import {
  Plus,
  CheckCircle2,
  X,
  Phone,
  Video,
  MapPin,
  Clock,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Users,
  UserCheck,
  Search,
  MessageSquare,
  ExternalLink,
  Briefcase,
  Building2,
  Sparkles,
  Check,
  Copy,
  AlertCircle,
  Filter,
  User,
  ShieldCheck,
} from "lucide-react";

const STATUS_CFG = {
  scheduled: { label: "Scheduled", color: "bg-blue-50 text-blue-700 border-blue-200" },
  done: { label: "Done", color: "bg-green-50 text-green-700 border-green-200" },
  no_show: { label: "No Show", color: "bg-red-50 text-red-600 border-red-200" },
  rescheduled: { label: "Rescheduled", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-500 border-gray-200" },
};

const MODE_ICON = { phone: Phone, video: Video, in_person: MapPin };

export default function Interviews({ interviews = [], teamMembers = [], jobs = [], canViewAll = false, scope = "your", candidates = [] }) {
  const { auth, flash } = usePage().props;
  const currentUser = auth?.admin;
  const permissions = currentUser?.permissions || [];
  const can = (permission) => currentUser?.role === "super_admin" || permissions.includes(permission);

  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all"); // all | today | upcoming | past
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [remarkText, setRemarkText] = useState("");
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Close inspection drawer or modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (selected) setSelected(null);
        if (scheduleModal) closeScheduleModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, scheduleModal]);

  // Auto-fill searchable combobox states
  const [jobSearch, setJobSearch] = useState("");
  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateDropdownOpen, setCandidateDropdownOpen] = useState(false);

  const defaultInterviewer = currentUser?.name
    ? `${currentUser.name} (${(currentUser.role || "Admin").replace("_", " ")})`
    : "Admin Staff";

  const { data, setData, post, processing, reset, errors, clearErrors, setError } = useForm({
    jobId: "",
    jobTitle: "",
    company: "",
    companyAddress: "",
    applicationId: "",
    candidateName: "",
    candidatePhone: "",
    candidateEmail: "",
    date: "",
    time: "",
    mode: "phone",
    interviewer: defaultInterviewer,
    round: "HR Screening",
    meetingLink: "",
  });

  const openScheduleModal = () => {
    clearErrors();
    reset();
    setJobSearch("");
    setCandidateSearch("");
    setJobDropdownOpen(false);
    setCandidateDropdownOpen(false);
    setData((prev) => ({
      ...prev,
      interviewer: defaultInterviewer,
      round: "HR Screening",
      mode: "phone",
    }));
    setScheduleModal(true);
  };

  const closeScheduleModal = () => {
    setScheduleModal(false);
    setJobDropdownOpen(false);
    setCandidateDropdownOpen(false);
    reset();
    clearErrors();
  };

  const handleJobSelect = (job) => {
    const address = job.company_address || job.location || "";
    setData((prev) => {
      const updated = {
        ...prev,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company || "ATS Partner",
        companyAddress: address,
      };
      if (prev.mode === "in_person") {
        updated.meetingLink = address;
      }
      return updated;
    });
    setJobSearch(`${job.title} (${job.company || "Client"})`);
    setJobDropdownOpen(false);
    clearErrors("jobTitle");
  };

  const handleCandidateSelect = (cand) => {
    const digits = (cand.phone || "").replace(/\D/g, "").slice(0, 10);
    setData((prev) => ({
      ...prev,
      candidateName: cand.name || "",
      candidatePhone: digits,
      candidateEmail: cand.email || "",
      applicationId: cand.application_id || prev.applicationId || "",
    }));
    setCandidateSearch(`${cand.name} (${digits})`);
    setCandidateDropdownOpen(false);
    clearErrors("candidateName");
    clearErrors("candidatePhone");
  };

  const handleModeChange = (newMode) => {
    setData((prev) => ({
      ...prev,
      mode: newMode,
      meetingLink:
        newMode === "in_person"
          ? prev.companyAddress || prev.meetingLink || ""
          : newMode === "phone"
          ? ""
          : prev.meetingLink,
    }));
  };

  // Strictly allow digits only (0-9) and limit to max 10 digits
  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    setData("candidatePhone", digitsOnly);

    if (!digitsOnly) {
      setError("candidatePhone", "10-digit mobile number is required.");
    } else if (digitsOnly.length < 10) {
      setError("candidatePhone", `Must be exactly 10 digits (currently ${digitsOnly.length}/10).`);
    } else if (!/^[6-9]/.test(digitsOnly)) {
      setError("candidatePhone", "Mobile number must start with 6, 7, 8, or 9.");
    } else {
      clearErrors("candidatePhone");
    }
  };

  // Smart paste handler: strips country codes (+91, 0), spaces, dashes and takes 10 digits
  const handlePhonePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text") || "";
    let digits = pasted.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length === 12) {
      digits = digits.slice(2);
    } else if (digits.startsWith("0") && digits.length === 11) {
      digits = digits.slice(1);
    }
    digits = digits.slice(0, 10);
    setData("candidatePhone", digits);

    if (!digits) {
      setError("candidatePhone", "10-digit mobile number is required.");
    } else if (digits.length < 10) {
      setError("candidatePhone", `Must be exactly 10 digits (currently ${digits.length}/10).`);
    } else if (!/^[6-9]/.test(digits)) {
      setError("candidatePhone", "Mobile number must start with 6, 7, 8, or 9.");
    } else {
      clearErrors("candidatePhone");
    }
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setData("candidateName", val);
    if (!val.trim()) {
      setError("candidateName", "Candidate name is required.");
    } else if (val.trim().length < 2) {
      setError("candidateName", "Candidate name must be at least 2 characters.");
    } else {
      clearErrors("candidateName");
    }
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    setData("date", val);
    const today = new Date().toISOString().split("T")[0];
    if (!val) {
      setError("date", "Interview date is required.");
    } else if (val < today) {
      setError("date", "Interview date cannot be in the past.");
    } else {
      clearErrors("date");
    }
  };

  const appendInterviewer = (staffName) => {
    if (!data.interviewer.trim()) {
      setData("interviewer", staffName);
    } else if (!data.interviewer.includes(staffName)) {
      setData("interviewer", `${data.interviewer}, ${staffName}`);
    }
    clearErrors("interviewer");
  };

  const handleSchedule = (e) => {
    e.preventDefault();
    clearErrors();

    let hasErr = false;
    if (!data.candidateName.trim()) {
      setError("candidateName", "Candidate name is required.");
      hasErr = true;
    }
    if (!data.candidatePhone) {
      setError("candidatePhone", "10-digit mobile number is required.");
      hasErr = true;
    } else if (data.candidatePhone.length !== 10) {
      setError("candidatePhone", "Mobile number must be exactly 10 digits.");
      hasErr = true;
    } else if (!/^[6-9]/.test(data.candidatePhone)) {
      setError("candidatePhone", "Mobile number must start with 6, 7, 8, or 9.");
      hasErr = true;
    }

    if (!data.date) {
      setError("date", "Interview date is required.");
      hasErr = true;
    }
    if (!data.time) {
      setError("time", "Interview time is required.");
      hasErr = true;
    }
    if (!data.interviewer.trim()) {
      setError("interviewer", "Please specify who will conduct the interview.");
      hasErr = true;
    }

    if (hasErr) return;

    post(route("admin.interviews.store"), {
      preserveScroll: true,
      onSuccess: () => closeScheduleModal(),
    });
  };

  const updateStatus = (uuid, status) => {
    router.post(
      route("admin.interviews.update-status", uuid),
      { status },
      {
        preserveScroll: true,
        onSuccess: () => {
          if (selected?.uuid === uuid) {
            setSelected((prev) => (prev ? { ...prev, status } : null));
          }
        },
      }
    );
  };

  const saveRemark = (uuid, interestedVal = null) => {
    const payload = {};
    if (remarkText.trim()) payload.remark = remarkText;
    if (interestedVal !== null) payload.interested = interestedVal;

    router.post(
      route("admin.interviews.update-remark", uuid),
      payload,
      {
        preserveScroll: true,
        onSuccess: () => {
          if (selected?.uuid === uuid) {
            setSelected((prev) =>
              prev
                ? {
                    ...prev,
                    ...(payload.remark !== undefined && { remark: payload.remark }),
                    ...(payload.interested !== undefined && { interested: payload.interested }),
                  }
                : null
            );
          }
          setRemarkText("");
        },
      }
    );
  };

  const copyPhoneNumber = (phone) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const filtered = interviews.filter((iv) => {
    const matchStatus = statusFilter === "all" || iv.status === statusFilter;

    let matchDate = true;
    if (dateFilter === "today") {
      matchDate = iv.date === todayStr;
    } else if (dateFilter === "upcoming") {
      matchDate = iv.date >= todayStr;
    } else if (dateFilter === "past") {
      matchDate = iv.date < todayStr;
    }

    const q = search.toLowerCase().trim();
    const matchQuery =
      !q ||
      (iv.candidateName || "").toLowerCase().includes(q) ||
      (iv.candidatePhone || "").toLowerCase().includes(q) ||
      (iv.jobTitle || "").toLowerCase().includes(q) ||
      (iv.company || "").toLowerCase().includes(q) ||
      (iv.interviewer || "").toLowerCase().includes(q) ||
      (iv.round || "").toLowerCase().includes(q);

    return matchStatus && matchDate && matchQuery;
  });

  const todayInterviews = interviews.filter((iv) => iv.date === todayStr);
  const scheduledCount = interviews.filter((iv) => iv.status === "scheduled").length;
  const doneCount = interviews.filter((iv) => iv.status === "done").length;

  const buildWhatsAppLink = (iv) => {
    const phone = (iv.candidatePhone || "").replace(/\D/g, "");
    if (!phone) return "#";
    const msg = `Hello ${iv.candidateName || "Candidate"}, your interview for *${iv.jobTitle || "Job"}* at *${iv.company || "our client"}* is scheduled for *${iv.date}* at *${iv.time}* (${(iv.mode || "phone").replace("_", " ")} round: ${iv.round || "Screening"}). ${iv.meetingLink ? "Meeting Link: " + iv.meetingLink : ""} Interviewer / Panel: ${iv.interviewer || "HR Team"}. Best regards, ATS Team.`;
    return `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <>
      <Head title="Interview Scheduling - ATS Admin" />

      <div className="p-3.5 sm:p-5 lg:p-6 pb-25">
        {/* Flash Message & Instant WhatsApp Invite Link */}
        {flash?.success && (
          <div className="mb-5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-900 text-white p-4 rounded-2xl shadow-xl text-sm font-medium border border-emerald-700">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{flash.success}</span>
            </div>
            {flash?.whatsapp_url && (
              <a
                href={flash.whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition shrink-0 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" /> Open WhatsApp Invite ↗
              </a>
            )}
          </div>
        )}

        {/* Schedule Modal (Step-by-step Auto-fill Flow) */}
        {scheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 sm:px-4 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-xl shadow-2xl border-2 border-blue-100 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/30">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Schedule Interview (Step-by-Step)</h3>
                    <p className="text-xs text-gray-500">1. Job Selection → 2. Candidate Selection → 3. Process & Venue</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeScheduleModal}
                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl cursor-pointer transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSchedule} className="space-y-4">
                {/* STEP 1: Select Job Post */}
                <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      Step 1: Select Job Post (Auto-fills Company & Address) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] bg-blue-200/60 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                      Step 1
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type to search job by title or company..."
                      value={jobSearch}
                      onChange={(e) => {
                        setJobSearch(e.target.value);
                        setJobDropdownOpen(true);
                      }}
                      onFocus={() => setJobDropdownOpen(true)}
                      className="w-full px-3.5 py-2.5 border border-blue-200 bg-white rounded-xl text-xs font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                    />
                    {jobDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl z-30 divide-y divide-gray-100">
                        {jobs
                          .filter((j) =>
                            !jobSearch ||
                            (j.title || "").toLowerCase().includes(jobSearch.toLowerCase()) ||
                            (j.company || "").toLowerCase().includes(jobSearch.toLowerCase()) ||
                            (j.location || "").toLowerCase().includes(jobSearch.toLowerCase())
                          )
                          .slice(0, 15)
                          .map((j) => (
                            <div
                              key={j.id}
                              onClick={() => handleJobSelect(j)}
                              className="p-2.5 hover:bg-blue-50 cursor-pointer transition text-left"
                            >
                              <p className="font-bold text-xs text-gray-900">{j.title}</p>
                              <p className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                                <span className="text-blue-600 font-semibold">{j.company || "ATS Partner"}</span>
                                <span>•</span>
                                <span>{j.location || "Location N/A"}</span>
                              </p>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {data.jobTitle && (
                    <div className="bg-white border border-blue-100 rounded-xl p-2.5 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Auto-filled Job:</span>
                        <span className="font-bold text-blue-900">{data.jobTitle}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Company:</span>
                        <span className="font-bold text-gray-800">{data.company || "—"}</span>
                      </div>
                      {data.companyAddress && (
                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span className="font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-blue-500" /> Venue / Address:
                          </span>
                          <span className="text-right truncate max-w-[240px] text-gray-700 font-medium">{data.companyAddress}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* STEP 2: Select Candidate (Searchable List) */}
                <div className="bg-indigo-50/50 border border-indigo-200/80 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-600" />
                      Step 2: Select Candidate (Searchable List) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] bg-indigo-200/60 text-indigo-900 font-bold px-2 py-0.5 rounded-full">
                      Step 2
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type candidate name or 10-digit phone to search..."
                      value={candidateSearch}
                      onChange={(e) => {
                        setCandidateSearch(e.target.value);
                        setCandidateDropdownOpen(true);
                      }}
                      onFocus={() => setCandidateDropdownOpen(true)}
                      className={`w-full px-3.5 py-2.5 border bg-white rounded-xl text-xs font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs ${
                        errors.candidateName || errors.candidatePhone ? "border-red-400 bg-red-50/20" : "border-indigo-200"
                      }`}
                    />
                    {candidateDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl z-30 divide-y divide-gray-100">
                        {candidates
                          .filter((c) => {
                            if (!candidateSearch) return true;
                            const q = candidateSearch.toLowerCase();
                            return (
                              (c.name || "").toLowerCase().includes(q) ||
                              (c.phone || "").includes(q) ||
                              (c.email || "").toLowerCase().includes(q)
                            );
                          })
                          .sort((a, b) => {
                            const aApplied = data.jobId && a.applied_job_ids?.includes(Number(data.jobId));
                            const bApplied = data.jobId && b.applied_job_ids?.includes(Number(data.jobId));
                            if (aApplied && !bApplied) return -1;
                            if (!aApplied && bApplied) return 1;
                            return 0;
                          })
                          .slice(0, 20)
                          .map((c) => {
                            const isApplicant = data.jobId && c.applied_job_ids?.includes(Number(data.jobId));
                            return (
                              <div
                                key={c.id}
                                onClick={() => handleCandidateSelect(c)}
                                className={`p-2.5 hover:bg-indigo-50 cursor-pointer transition text-left flex items-center justify-between ${
                                  isApplicant ? "bg-emerald-50/50" : ""
                                }`}
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-bold text-xs text-gray-900">{c.name}</p>
                                    {isApplicant && (
                                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                                        Applied for this Job
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-500 mt-0.5">
                                    📞 +91 {c.phone} {c.email ? `• ✉️ ${c.email}` : ""} {c.city ? `• 📍 ${c.city}` : ""}
                                  </p>
                                </div>
                                <span className="text-xs text-indigo-600 font-bold">Select →</span>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Candidate Auto-filled Preview and Manual Edit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white border border-indigo-100 rounded-xl p-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
                        Candidate Name *
                      </label>
                      <input
                        type="text"
                        value={data.candidateName}
                        onChange={handleNameChange}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {errors.candidateName && (
                        <p className="text-[11px] text-red-500 mt-0.5">{errors.candidateName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
                        Phone (10 Digits) *
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={data.candidatePhone}
                        onChange={handlePhoneChange}
                        onPaste={handlePhonePaste}
                        placeholder="9876543210"
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-mono font-semibold text-gray-900 outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {errors.candidatePhone && (
                        <p className="text-[11px] text-red-500 mt-0.5">{errors.candidatePhone}</p>
                      )}
                    </div>

                    <div className="col-span-full">
                      <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
                        Candidate Email (Optional - For Email Invitation)
                      </label>
                      <input
                        type="email"
                        value={data.candidateEmail}
                        onChange={(e) => setData("candidateEmail", e.target.value)}
                        placeholder="candidate@example.com"
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-800 outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* STEP 3: Process Details & Venue */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-600" />
                      Step 3: Interview Process, Round & Venue
                    </label>
                    <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded-full">
                      Step 3
                    </span>
                  </div>

                  {/* Mode, Date, Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Interview Mode *
                      </label>
                      <select
                        value={data.mode}
                        onChange={(e) => handleModeChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-800"
                      >
                        <option value="phone">📞 Phone Call</option>
                        <option value="video">🎥 Video Call</option>
                        <option value="in_person">🏢 In Person</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        min={todayStr}
                        value={data.date}
                        onChange={handleDateChange}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-800"
                      />
                      {errors.date && <p className="text-[10px] text-red-500 mt-0.5">{errors.date}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Time *
                      </label>
                      <input
                        type="time"
                        value={data.time}
                        onChange={(e) => {
                          setData("time", e.target.value);
                          if (e.target.value) clearErrors("time");
                        }}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-800"
                      />
                      {errors.time && <p className="text-[10px] text-red-500 mt-0.5">{errors.time}</p>}
                    </div>
                  </div>

                  {/* Round & Interviewer Panel */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Round / Stage
                      </label>
                      <select
                        value={data.round}
                        onChange={(e) => setData("round", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-800"
                      >
                        <option value="HR Screening">1. HR Screening</option>
                        <option value="Technical Round 1">2. Technical Round 1</option>
                        <option value="Technical Round 2">3. Technical Round 2</option>
                        <option value="Managerial Round">4. Managerial / HOD</option>
                        <option value="Final / Culture Fit">5. Final / Culture Fit</option>
                        <option value="Client Interview">6. Client Interview</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Interviewer / Panel *
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setData("interviewer", e.target.value);
                            clearErrors("interviewer");
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                      >
                        <option value="">-- Choose Member --</option>
                        {teamMembers.map((m) => (
                          <option key={m.id} value={`${m.name} (${(m.role || "Staff").replace("_", " ")})`}>
                            {m.name} — {(m.role || "Staff").replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={data.interviewer}
                      onChange={(e) => {
                        setData("interviewer", e.target.value);
                        if (e.target.value.trim()) clearErrors("interviewer");
                      }}
                      placeholder="Interviewer name or panel details"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-800 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    {errors.interviewer && <p className="text-[10px] text-red-500 mt-0.5">{errors.interviewer}</p>}
                  </div>

                  {/* IN-PERSON MODE: Company Address Auto-filled */}
                  {data.mode === "in_person" && (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-amber-900 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-700" />
                          Company Address (Auto-filled for In-Person) *
                        </label>
                        <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                          Venue Address
                        </span>
                      </div>
                      <input
                        type="text"
                        value={data.meetingLink}
                        onChange={(e) => setData("meetingLink", e.target.value)}
                        placeholder="Company address / Interview cabin location..."
                        className="w-full px-3 py-2 border border-amber-300 rounded-lg text-xs bg-white text-gray-900 outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                      />
                      <p className="text-[10px] text-amber-800 font-medium">
                        {data.companyAddress
                          ? "✓ Automatically loaded from company profile. You can customize room or floor number."
                          : "Please enter company office address for the candidate."}
                      </p>
                    </div>
                  )}

                  {/* VIDEO MODE: Meeting Link */}
                  {data.mode === "video" && (
                    <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-3 space-y-1">
                      <label className="block text-[11px] font-bold text-purple-900 flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-purple-700" />
                        Meeting Link (Google Meet / Zoom / MS Teams)
                      </label>
                      <input
                        type="url"
                        value={data.meetingLink}
                        onChange={(e) => setData("meetingLink", e.target.value)}
                        placeholder="https://meet.google.com/xyz-abcd-efg"
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg text-xs bg-white text-gray-900 outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                      />
                    </div>
                  )}
                </div>

                {/* Confirm Dispatch Notice */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold">Interview will be confirmed via Email & WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                    <span>✉️ Email</span> • <span>💬 WhatsApp</span>
                  </div>
                </div>

                {/* Submit and Cancel Buttons */}
                <div className="flex gap-3 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeScheduleModal}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 cursor-pointer font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      "Scheduling..."
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Confirm & Schedule Interview
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
              <Calendar className="w-6 h-6 text-blue-600" />
              Interview Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Schedule, validate candidate phone numbers, assign interview panels, and track rounds
            </p>
          </div>

          {can("schedule_interviews") && (
            <button
              type="button"
              onClick={openScheduleModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/30 transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Schedule Interview
            </button>
          )}
        </div>

        {/* All vs Your Scope Tab (Visible when canViewAll is true) */}
        {canViewAll && (
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl w-fit mb-6">
            <button
              type="button"
              onClick={() => router.get(route("admin.interviews.index"), { scope: "all" }, { preserveState: true, preserveScroll: true })}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                scope === "all" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              All Interviews
            </button>
            <button
              type="button"
              onClick={() => router.get(route("admin.interviews.index"), { scope: "your" }, { preserveState: true, preserveScroll: true })}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                scope === "your" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Your Interviews
            </button>
          </div>
        )}

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Scheduled</p>
            <div className="flex items-center justify-between mt-1">
              <h3 className="text-2xl font-black text-gray-900">{interviews.length}</h3>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Today's Interviews
            </p>
            <div className="flex items-center justify-between mt-1">
              <h3 className="text-2xl font-black text-emerald-600">{todayInterviews.length}</h3>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Upcoming Pending</p>
            <div className="flex items-center justify-between mt-1">
              <h3 className="text-2xl font-black text-blue-600">{scheduledCount}</h3>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Completed / Done</p>
            <div className="flex items-center justify-between mt-1">
              <h3 className="text-2xl font-black text-gray-800">{doneCount}</h3>
              <div className="w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters Toolbar */}
        <div className="bg-white border border-gray-100 rounded-2xl p-3.5 mb-5 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate name, 10-digit phone, interviewer panel, job, or round..."
                className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Date Filter Tabs */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
              {[
                { id: "all", label: "All Dates" },
                { id: "today", label: `Today (${todayInterviews.length})` },
                { id: "upcoming", label: "Upcoming" },
                { id: "past", label: "Past" },
              ].map((df) => (
                <button
                  key={df.id}
                  type="button"
                  onClick={() => setDateFilter(df.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    dateFilter === df.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {df.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-gray-100">
            {[
              ["all", "All Statuses"],
              ...Object.entries(STATUS_CFG).map(([k, v]) => [k, v.label]),
            ].map(([k, l]) => {
              const count =
                k === "all"
                  ? interviews.length
                  : interviews.filter((iv) => iv.status === k).length;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setStatusFilter(k)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === k
                      ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span>{l}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      statusFilter === k ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main List and Details Drawer */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Interview List Cards (Independent Scroll in View Mode) */}
          <div
            className={`w-full min-w-0 ${
              selected
                ? "hidden lg:block lg:w-1/2 xl:w-7/12 overflow-y-auto h-[calc(100vh-14rem)] max-h-[calc(100vh-14rem)] pr-2 [scrollbar-width:thin] space-y-3"
                : "space-y-3.5"
            }`}
          >
            {filtered.map((iv) => {
              const ModeIcon = MODE_ICON[iv.mode] || Phone;
              const isToday = iv.date === todayStr;

              return (
                <div
                  key={iv.uuid}
                  onClick={() => {
                    setSelected(iv);
                    setRemarkText(iv.remark || "");
                  }}
                  className={`bg-white border rounded-2xl p-4 sm:p-4.5 cursor-pointer hover:shadow-md transition-all relative overflow-hidden ${
                    selected?.uuid === iv.uuid
                      ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/15"
                      : "border-gray-200/80 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
                    {/* Mode Icon */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                        iv.status === "done"
                          ? "bg-emerald-100 text-emerald-700"
                          : iv.status === "cancelled"
                          ? "bg-gray-100 text-gray-400"
                          : isToday
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      <ModeIcon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Candidate Name & Status */}
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className="font-bold text-gray-900 text-base truncate" title={iv.candidateName}>
                            {iv.candidateName}
                          </h4>
                          {isToday && (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-500 text-white animate-pulse shrink-0">
                              Today
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-bold border capitalize shrink-0 ${
                              STATUS_CFG[iv.status]?.color || "bg-gray-100 border-gray-200"
                            }`}
                          >
                            {STATUS_CFG[iv.status]?.label || iv.status}
                          </span>
                        </div>
                      </div>

                      {/* Job & Company */}
                      <div className="text-xs text-gray-600 flex flex-wrap items-center gap-x-2 gap-y-1 font-medium mb-2.5 min-w-0">
                        <span className="inline-flex items-center gap-1.5 min-w-0">
                          <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[200px] sm:max-w-none">{iv.jobTitle}</span>
                        </span>
                        <span className="text-gray-300 hidden sm:inline">•</span>
                        <span className="inline-flex items-center gap-1.5 min-w-0">
                          <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="text-gray-800 font-semibold truncate max-w-[200px] sm:max-w-none">{iv.company}</span>
                        </span>
                      </div>

                      {/* Round & Interviewer Panel ("kon kon lega") */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 my-2.5 bg-gray-50/80 border border-gray-100 rounded-xl p-2.5 text-xs min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-gray-400 font-medium shrink-0">Round:</span>
                          <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 truncate">
                            {iv.round || "HR Screening"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 min-w-0">
                          <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="text-gray-500 text-[11px] shrink-0">Interviewer:</span>
                          <span className="font-bold text-gray-800 truncate" title={iv.interviewer || iv.scheduledBy || "Admin"}>
                            {iv.interviewer || iv.scheduledBy || "Admin"}
                          </span>
                        </div>
                      </div>

                      {/* Date, Time, Phone Info */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs text-gray-500 mb-3 min-w-0">
                        <span className="flex items-center gap-1 font-semibold text-gray-700 shrink-0">
                          <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          {iv.date}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-gray-700 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          {iv.time}
                        </span>
                        <span className="flex items-center gap-1 font-mono font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md shrink-0">
                          <Phone className="w-3 h-3 text-gray-500 shrink-0" />
                          +91 {iv.candidatePhone}
                        </span>
                        {iv.mode === "video" && iv.meetingLink && (
                          <span className="text-blue-600 font-medium flex items-center gap-1 shrink-0">
                            <Video className="w-3.5 h-3.5 shrink-0" /> Video Call Link Attached
                          </span>
                        )}
                      </div>

                      {/* Action Bar (Direct Call, WhatsApp, Open Meeting) */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-gray-100 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          {/* Direct Call */}
                          <a
                            href={`tel:+91${(iv.candidatePhone || "").replace(/\D/g, "")}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer shrink-0"
                            title="Call Candidate"
                          >
                            <Phone className="w-3.5 h-3.5" /> Call
                          </a>

                          {/* Direct WhatsApp */}
                          <a
                            href={buildWhatsAppLink(iv)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer shrink-0"
                            title="Send Interview Details on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Invite
                          </a>

                          {/* Open Video Meeting */}
                          {iv.mode === "video" && iv.meetingLink && (
                            <a
                              href={iv.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition cursor-pointer shrink-0"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Join Meeting
                            </a>
                          )}
                        </div>

                        {/* Candidate Interest Badge */}
                        {iv.interested !== null && iv.interested !== undefined && (
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                              iv.interested
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-red-50 text-red-600 border border-red-200"
                            }`}
                          >
                            {iv.interested ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
                            {iv.interested ? "Interested" : "Not Interested"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-xs">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <h4 className="text-base font-bold text-gray-700">No interviews match your filters</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Try adjusting your search query, status tab, or date filter, or schedule a new interview.
                </p>
                <button
                  type="button"
                  onClick={openScheduleModal}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Schedule New Interview
                </button>
              </div>
            )}
          </div>

          {/* Details Drawer (Independent Smooth Scroll & Distinct Contrast Header) */}
          {selected && (
            <div
              id="admin-interview-detail-panel"
              className="w-full lg:w-1/2 xl:w-5/12 bg-white border-2 border-blue-400/80 rounded-3xl shadow-2xl shadow-blue-950/20 flex flex-col lg:sticky lg:top-4 h-[calc(100vh-14rem)] max-h-[calc(100vh-14rem)] z-20 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300 ease-out"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shrink-0 z-10">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="text-xs font-semibold text-blue-200 hover:text-white px-2.5 py-1 bg-white/10 border border-white/20 rounded-lg lg:hidden cursor-pointer shrink-0"
                  >
                    ← Back
                  </button>
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">Interview Inspection</h3>
                    <span className="text-[10px] text-cyan-300 font-medium truncate block">Candidate & Process Details</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer transition shrink-0"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-5 space-y-4 pb-8 overscroll-contain [scrollbar-width:thin]">
                {/* Candidate Profile Header */}
                <div className="flex items-center gap-3.5 bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-blue-600/30 shrink-0">
                    {(selected.candidateName || "U")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-gray-900 text-base truncate">{selected.candidateName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-mono font-bold text-gray-700 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                        +91 {selected.candidatePhone}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyPhoneNumber(selected.candidatePhone)}
                        className="p-1 text-gray-400 hover:text-blue-600 cursor-pointer"
                        title="Copy Phone"
                      >
                        {copiedPhone ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:+91${(selected.candidatePhone || "").replace(/\D/g, "")}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Candidate
                  </a>

                  <a
                    href={buildWhatsAppLink(selected)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Invite
                  </a>
                </div>

                {/* Interview Information Card */}
                <div className="bg-gray-50 rounded-2xl p-3.5 space-y-2.5 text-xs border border-gray-100">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                    <span className="text-gray-500 font-medium">Status</span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border capitalize ${
                        STATUS_CFG[selected.status]?.color || "bg-gray-100 border-gray-200"
                      }`}
                    >
                      {STATUS_CFG[selected.status]?.label || selected.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Stage / Round</span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {selected.round || "HR Screening"}
                    </span>
                  </div>

                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-500 font-medium shrink-0">Interviewer / Panel</span>
                    <span className="font-bold text-gray-900 text-right">
                      {selected.interviewer || selected.scheduledBy || "Admin"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Job Post</span>
                    <span className="font-bold text-gray-800">{selected.jobTitle}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Company</span>
                    <span className="font-bold text-gray-800">{selected.company}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Date & Time</span>
                    <span className="font-bold text-gray-900">
                      {selected.date} at {selected.time}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Mode</span>
                    <span className="font-bold text-gray-800 capitalize">
                      {selected.mode.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Scheduled By</span>
                    <span className="font-bold text-gray-600">{selected.scheduledBy}</span>
                  </div>

                  {selected.meetingLink && (
                    <div className="pt-2 border-t border-gray-200/60">
                      <span className="text-gray-500 font-medium block mb-1">
                        {selected.mode === "video" ? "Meeting Link:" : "Location / Address:"}
                      </span>
                      {selected.mode === "video" ? (
                        <a
                          href={selected.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 font-semibold underline break-all flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          {selected.meetingLink}
                        </a>
                      ) : (
                        <p className="font-semibold text-gray-800">{selected.meetingLink}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Candidate Interest Toggle */}
                {can("status_interviews") && (
                  <div>
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                      Candidate Interest
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => saveRemark(selected.uuid, true)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                          selected.interested === true
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" /> Interested
                      </button>
                      <button
                        type="button"
                        onClick={() => saveRemark(selected.uuid, false)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                          selected.interested === false
                            ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                            : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" /> Not Interested
                      </button>
                    </div>
                  </div>
                )}

                {/* Status Update */}
                {can("status_interviews") && (
                  <div>
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                      Update Status
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.keys(STATUS_CFG).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => updateStatus(selected.uuid, s)}
                          className={`text-xs py-2 rounded-xl font-bold border cursor-pointer transition ${
                            selected.status === s
                              ? STATUS_CFG[s].color + " ring-2 ring-blue-500 shadow-xs"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {STATUS_CFG[s].label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Remarks Section */}
                {selected.remark && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-amber-800 mb-1">Interview Remark / Feedback</p>
                    <p className="text-xs text-amber-900 leading-relaxed">{selected.remark}</p>
                  </div>
                )}

                {can("status_interviews") && (
                  <div>
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                      Add Interview Notes
                    </p>
                    <textarea
                      value={remarkText}
                      onChange={(e) => setRemarkText(e.target.value)}
                      rows={3}
                      placeholder="e.g. Cleared HR round, good communication. Proceeding to Tech Round 1."
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs resize-none focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                    />
                    <button
                      type="button"
                      onClick={() => saveRemark(selected.uuid, null)}
                      disabled={!remarkText.trim()}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer shadow-xs transition"
                    >
                      Save Note
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Interviews.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;
