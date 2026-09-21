import React, { useState } from "react";
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

export default function Interviews({ interviews = [], teamMembers = [], jobs = [] }) {
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

  const defaultInterviewer = currentUser?.name
    ? `${currentUser.name} (${(currentUser.role || "Admin").replace("_", " ")})`
    : "Admin Staff";

  const { data, setData, post, processing, reset, errors, clearErrors, setError } = useForm({
    applicationId: "",
    candidateName: "",
    candidatePhone: "",
    jobTitle: "",
    company: "",
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
    reset();
    clearErrors();
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

  const handleJobSelect = (jobId) => {
    const selectedJob = jobs.find((j) => String(j.id) === String(jobId));
    if (selectedJob) {
      setData((prev) => ({
        ...prev,
        jobTitle: selectedJob.title,
        company: selectedJob.company || prev.company || "Company",
      }));
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
        {flash?.success && (
          <div className="mb-5 flex items-center gap-2 bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium border border-emerald-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> {flash.success}
          </div>
        )}

        {/* Schedule Modal */}
        {scheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 sm:px-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Schedule New Interview</h3>
                    <p className="text-xs text-gray-500">Candidate, phone validation & interviewer panel</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeScheduleModal}
                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSchedule} className="space-y-4">
                {/* Candidate Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Candidate Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.candidateName}
                    onChange={handleNameChange}
                    placeholder="e.g. Priya Mehta"
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition focus:ring-2 ${
                      errors.candidateName
                        ? "border-red-500 focus:ring-red-400 bg-red-50/20"
                        : "border-gray-200 focus:ring-blue-500"
                    }`}
                    autoFocus
                  />
                  {errors.candidateName && (
                    <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.candidateName}
                    </p>
                  )}
                </div>

                {/* Candidate Phone Number (Digits Only, Max 10 digits) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Candidate Phone (10 Digits Only) <span className="text-red-500">*</span>
                    </label>
                    <span
                      className={`text-xs font-bold flex items-center gap-1 ${
                        data.candidatePhone?.length === 10
                          ? "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md"
                          : "text-gray-400"
                      }`}
                    >
                      {data.candidatePhone?.length === 10 && <Check className="w-3 h-3 text-emerald-600" />}
                      {data.candidatePhone?.length || 0} / 10 digits
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-md select-none border border-gray-200">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={data.candidatePhone}
                      onChange={handlePhoneChange}
                      onPaste={handlePhonePaste}
                      onKeyDown={(e) => {
                        // Strictly prevent any non-numeric character
                        if (
                          !/[0-9]/.test(e.key) &&
                          !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Enter"].includes(e.key) &&
                          !e.ctrlKey &&
                          !e.metaKey
                        ) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="9876543210"
                      className={`w-full pl-20 pr-4 py-2.5 border rounded-xl text-sm font-semibold tracking-wider outline-none transition focus:ring-2 ${
                        errors.candidatePhone
                          ? "border-red-500 focus:ring-red-400 bg-red-50/20 text-red-900"
                          : data.candidatePhone?.length === 10
                          ? "border-emerald-300 focus:ring-emerald-400 bg-emerald-50/10"
                          : "border-gray-200 focus:ring-blue-500"
                      }`}
                    />
                  </div>
                  {errors.candidatePhone ? (
                    <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.candidatePhone}
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-400 mt-1">
                      Only 10 digits allowed (no spaces, letters, or special characters).
                    </p>
                  )}
                </div>

                {/* Interviewer Details ("kon kon lega us ki details") */}
                <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-100 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      Who will take interview? (Interviewer / Panel) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-blue-800 bg-blue-100 font-bold px-2 py-0.5 rounded-full">
                      Panel Details
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Select Staff / Interviewer
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setData("interviewer", e.target.value);
                            clearErrors("interviewer");
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">-- Select Member --</option>
                        {teamMembers.map((m) => (
                          <option key={m.id} value={`${m.name} (${(m.role || "Staff").replace("_", " ")})`}>
                            {m.name} — {(m.role || "Staff").replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Interview Round / Stage
                      </label>
                      <select
                        value={data.round}
                        onChange={(e) => setData("round", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="HR Screening">1. HR Screening (Phone)</option>
                        <option value="Technical Round 1">2. Technical Round 1</option>
                        <option value="Technical Round 2">3. Technical Round 2</option>
                        <option value="Managerial Round">4. Managerial / HOD</option>
                        <option value="Final / Culture Fit">5. Final / Culture Fit</option>
                        <option value="Client Interview">6. Client Interview</option>
                      </select>
                    </div>
                  </div>

                  {/* Multi-member panel quick append */}
                  {teamMembers.length > 0 && (
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">
                        Quick Add Co-interviewer to Panel:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {teamMembers.slice(0, 5).map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => appendInterviewer(`${m.name} (${(m.role || "Staff").replace("_", " ")})`)}
                            className="text-[11px] px-2 py-0.5 bg-white hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg cursor-pointer transition flex items-center gap-1 font-medium"
                          >
                            + {m.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Interviewer Details / Panel Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.interviewer}
                      onChange={(e) => {
                        setData("interviewer", e.target.value);
                        if (e.target.value.trim()) clearErrors("interviewer");
                      }}
                      placeholder="e.g. Rahul Sharma (HR) & Amit Verma (Tech Lead)"
                      className={`w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 outline-none transition ${
                        errors.interviewer
                          ? "border-red-500 focus:ring-red-400 bg-red-50/20"
                          : "border-gray-200 focus:ring-blue-500"
                      }`}
                    />
                    {errors.interviewer && (
                      <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.interviewer}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mode, Date, and Time */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Mode <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={data.mode}
                      onChange={(e) => setData("mode", e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="phone">📞 Phone Call</option>
                      <option value="video">🎥 Video Call</option>
                      <option value="in_person">🏢 In Person</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={data.date}
                      onChange={handleDateChange}
                      className={`w-full px-3 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 transition ${
                        errors.date ? "border-red-500 focus:ring-red-400 bg-red-50/20" : "border-gray-200 focus:ring-blue-500"
                      }`}
                    />
                    {errors.date && (
                      <p className="text-xs text-red-500 mt-1 font-medium">{errors.date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={data.time}
                      onChange={(e) => {
                        setData("time", e.target.value);
                        if (e.target.value) clearErrors("time");
                      }}
                      className={`w-full px-3 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 transition ${
                        errors.time ? "border-red-500 focus:ring-red-400 bg-red-50/20" : "border-gray-200 focus:ring-blue-500"
                      }`}
                    />
                    {errors.time && (
                      <p className="text-xs text-red-500 mt-1 font-medium">{errors.time}</p>
                    )}
                  </div>
                </div>

                {/* Meeting Link or Office Address */}
                {data.mode === "video" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Video Meeting Link (Google Meet / Zoom / MS Teams)
                    </label>
                    <input
                      type="url"
                      value={data.meetingLink}
                      onChange={(e) => setData("meetingLink", e.target.value)}
                      placeholder="https://meet.google.com/abc-defg-hij"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}

                {data.mode === "in_person" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Interview Location / Office Address / Cabin
                    </label>
                    <input
                      type="text"
                      value={data.meetingLink}
                      onChange={(e) => setData("meetingLink", e.target.value)}
                      placeholder="e.g. ATS Head Office, 3rd Floor, Malviya Nagar, Jaipur"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}

                {/* Job Link & Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Select Job Post (Auto-fill)
                    </label>
                    <select
                      onChange={(e) => handleJobSelect(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">-- Choose Job --</option>
                      {jobs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.title} {j.company ? `(${j.company})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={data.jobTitle}
                      onChange={(e) => setData("jobTitle", e.target.value)}
                      placeholder="e.g. Telecalling Executive"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={data.company}
                    onChange={(e) => setData("company", e.target.value)}
                    placeholder="e.g. Tech Solutions Pvt Ltd"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeScheduleModal}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 cursor-pointer shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      "Scheduling..."
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Confirm Schedule
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
          {/* Interview List Cards */}
          <div className={`flex-1 w-full ${selected ? "hidden lg:block" : ""} space-y-3`}>
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
                  className={`bg-white border rounded-2xl p-4.5 cursor-pointer hover:shadow-md transition-all relative ${
                    selected?.uuid === iv.uuid
                      ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/15"
                      : "border-gray-100 hover:border-blue-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
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
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-base">{iv.candidateName}</h4>
                          {isToday && (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-500 text-white animate-pulse">
                              Today
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
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
                      <p className="text-xs text-gray-600 flex items-center gap-1.5 font-medium mb-2">
                        <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{iv.jobTitle}</span>
                        <span className="text-gray-300">•</span>
                        <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-gray-700 font-semibold">{iv.company}</span>
                      </p>

                      {/* Round & Interviewer Panel ("kon kon lega") */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2.5 bg-gray-50/80 border border-gray-100 rounded-xl p-2.5">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-400 font-medium shrink-0">Round:</span>
                          <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            {iv.round || "HR Screening"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs truncate">
                          <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="text-gray-500 text-[11px]">Interviewer:</span>
                          <span className="font-bold text-gray-800 truncate" title={iv.interviewer}>
                            {iv.interviewer || iv.scheduledBy || "Admin"}
                          </span>
                        </div>
                      </div>

                      {/* Date, Time, Phone Info */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1 font-semibold text-gray-700">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          {iv.date}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-gray-700">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          {iv.time}
                        </span>
                        <span className="flex items-center gap-1 font-mono font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">
                          <Phone className="w-3 h-3 text-gray-500" />
                          +91 {iv.candidatePhone}
                        </span>
                        {iv.mode === "video" && iv.meetingLink && (
                          <span className="text-blue-600 font-medium flex items-center gap-1">
                            <Video className="w-3.5 h-3.5" /> Video Call Link Attached
                          </span>
                        )}
                      </div>

                      {/* Action Bar (Direct Call, WhatsApp, Open Meeting) */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 flex-wrap">
                        <div className="flex items-center gap-2">
                          {/* Direct Call */}
                          <a
                            href={`tel:+91${(iv.candidatePhone || "").replace(/\D/g, "")}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer"
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
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer"
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
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Join Meeting
                            </a>
                          )}
                        </div>

                        {/* Candidate Interest Badge */}
                        {iv.interested !== null && iv.interested !== undefined && (
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
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

          {/* Details Drawer */}
          {selected && (
            <div className="w-full lg:w-96 shrink-0 bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col max-h-[calc(100vh-100px)] sticky top-20 shadow-md">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/70">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="text-xs font-semibold text-blue-600 hover:underline px-2 py-1 bg-blue-50 rounded-lg lg:hidden cursor-pointer"
                  >
                    ← Back
                  </button>
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-gray-900 text-sm">Interview Details</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="p-1.5 text-gray-400 hover:bg-gray-200 rounded-lg cursor-pointer transition shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-5 space-y-4 pb-8">
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
