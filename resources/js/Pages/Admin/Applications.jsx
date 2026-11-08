import React, { useState, useEffect } from "react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";
import { Head, usePage, router } from "@inertiajs/react";
import {
  Search,
  CheckCircle2,
  Phone,
  Calendar,
  X,
  Eye,
  MessageCircle,
  Mail,
  FileText,
  Users,
  MapPin,
  Building2,
  Send,
  Briefcase,
  GraduationCap,
  ExternalLink,
  Download,
  Globe,
  Linkedin,
  Clock,
  User,
  Tag,
  Sparkles,
  Video,
} from "lucide-react";

const STATUS_CFG = {
  applied: { label: "Applied", color: "bg-gray-100 text-gray-600" },
  viewed: { label: "Viewed", color: "bg-blue-50 text-blue-700" },
  shortlisted: { label: "Shortlisted", color: "bg-yellow-50 text-yellow-700" },
  assigned_to_calling_member: { label: "Assigned", color: "bg-indigo-50 text-indigo-700" },
  calling_in_progress: { label: "Calling In Progress", color: "bg-purple-50 text-purple-700" },
  admin_review: { label: "Admin Review", color: "bg-purple-50 text-purple-700" },
  interview_scheduled: { label: "Interview Scheduled", color: "bg-purple-50 text-purple-700" },
  offer_letter_generated: { label: "Offer Letter Generated", color: "bg-green-50 text-green-700" },
  hired: { label: "Hired ✓", color: "bg-green-50 text-green-700" },
  rejected: { label: "Rejected", color: "bg-red-50 text-red-600" },
  cancelled: { label: "Cancelled", color: "bg-rose-50 text-rose-700" },
  not_selected: { label: "Not Selected", color: "bg-red-50 text-red-600" },
  waiting_list: { label: "Waiting List", color: "bg-orange-50 text-orange-700" },
};

const ALL_STATUSES = Object.keys(STATUS_CFG);

const toWANum = (phone) => {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
};
const waUrl = (phone, msg) =>
  `https://wa.me/${toWANum(phone)}?text=${encodeURIComponent(msg)}`;
const mailUrl = (email, subject, body) =>
  `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/* ── Offer Letter Modal ── */
function OfferLetterModal({ app, onClose }) {
  const [designation, setDesignation] = useState(app.jobTitle || "");
  const [salary, setSalary] = useState(app.offerSalaryPackage || "");
  const [joiningDate, setJoiningDate] = useState(app.offerJoiningDate ? app.offerJoiningDate.slice(0, 10) : "");
  const [workLocation, setWorkLocation] = useState(app.jobLocation || app.userCity || "Head Office / On-site");
  const [selectedFacilities, setSelectedFacilities] = useState([
    "Health Insurance (Mediclaim)",
    "Provident Fund (PF) & ESI",
    "Paid Leaves (CL/SL/PL)",
  ]);
  const [customFacility, setCustomFacility] = useState("");
  const [terms, setTerms] = useState("Offer valid for 48 hours. Subject to document verification. Standard 3 months probation period.");
  const [sent, setSent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const COMMON_PERKS = [
    "Health Insurance (Mediclaim)",
    "Provident Fund (PF) & ESI",
    "Annual Performance Bonus",
    "Paid Leaves (CL/SL/PL)",
    "Laptop / Workstation",
    "Travel / Cab Allowance",
    "Free Meals / Snacks",
    "Flexible Work Timings",
  ];

  const togglePerk = (perk) => {
    setSelectedFacilities((prev) =>
      prev.includes(perk) ? prev.filter((p) => p !== perk) : [...prev, perk]
    );
  };

  const addCustomPerk = (e) => {
    e.preventDefault();
    if (customFacility.trim() && !selectedFacilities.includes(customFacility.trim())) {
      setSelectedFacilities((prev) => [...prev, customFacility.trim()]);
      setCustomFacility("");
    }
  };

  const canSend = () => {
    if (!salary || salary.toString().trim() === "") {
      setValidationError("Please enter offered salary / CTC.");
      return false;
    }
    if (!joiningDate) {
      setValidationError("Please select joining date.");
      return false;
    }
    setValidationError("");
    return true;
  };

  const letterText = `Dear ${app.userName},

We are pleased to extend this offer of employment for the position of ${designation || app.jobTitle} at ${app.company}.

Offer Details:
• Role: ${designation || app.jobTitle}
• Company: ${app.company}
• Work Location: ${workLocation}
• Compensation: ₹${salary}${salary.toString().toLowerCase().includes("lpa") ? "" : " LPA"}
• Date of Joining: ${joiningDate}

Perks & Facilities:
${selectedFacilities.length > 0 ? selectedFacilities.map((f) => `• ${f}`).join("\n") : "• Standard Company Benefits"}

Notes / Terms:
${terms || "Standard employment terms apply."}

Please confirm your acceptance. Congratulations!

Warm regards,
${app.company} Hiring Team / ATS Recruitment`;

  const handleGenerateAndSend = () => {
    if (!canSend()) return;
    setIsSubmitting(true);

    router.post(
      route("admin.applications.save-offer", app.uuid),
      {
        salary: salary.toString().includes("LPA") || salary.toString().includes("₹") ? salary : `₹${salary} LPA`,
        joining_date: joiningDate,
        designation,
        work_location: workLocation,
        facilities: selectedFacilities,
        terms,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setIsSubmitting(false);
          setSent("system");
        },
        onError: () => {
          setIsSubmitting(false);
        },
      }
    );
  };

  const handleSendWA = () => {
    if (!canSend()) return;
    handleGenerateAndSend();
    window.open(
      waUrl(app.userPhone, `🎉 *Official Job Offer – ${app.company}*\n\n${letterText}`),
      "_blank"
    );
    setSent("wa");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[92vh] overflow-y-auto border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-linear-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Generate & Send Offer Letter</h3>
              <p className="text-xs text-gray-500">{app.userName} • {app.company}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:bg-gray-200/60 rounded-lg cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Designation / Position
              </label>
              <input
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Offered CTC / Salary
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₹</span>
                <input
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. 6.5 LPA or 45,000 / month"
                  className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Joining Date
              </label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Work Location / Mode
              </label>
              <input
                value={workLocation}
                onChange={(e) => setWorkLocation(e.target.value)}
                placeholder="e.g. Noida / Hybrid / On-site"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Facilities / Perks */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Employee Facilities & Perks (Choose or Add)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_PERKS.map((perk) => {
                const isSelected = selectedFacilities.includes(perk);
                return (
                  <button
                    key={perk}
                    type="button"
                    onClick={() => togglePerk(perk)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {perk}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                value={customFacility}
                onChange={(e) => setCustomFacility(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addCustomPerk(e); }}
                placeholder="Add other perk (e.g. Relocation bonus)..."
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={addCustomPerk}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Terms / Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Offer Terms / Notes
            </label>
            <textarea
              rows={2}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Terms, probation details, validity..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            />
          </div>

          {/* Live Preview Snippet */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Letter Preview Preview
            </label>
            <pre className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed max-h-40 overflow-y-auto">
              {letterText}
            </pre>
          </div>

          {sent && (
            <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 px-3.5 py-2.5 rounded-xl font-medium border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Offer Letter successfully generated & sent! Formal HTML email dispatched to {app.userEmail || "candidate"} and alerts sent to Admin.
              </span>
            </div>
          )}

          {validationError && <p className="text-xs text-red-500 font-medium">{validationError}</p>}

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleGenerateAndSend}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold cursor-pointer transition shadow-md shadow-emerald-600/20 disabled:opacity-60"
            >
              <Mail className="w-4 h-4" />
              {isSubmitting ? "Generating & Sending..." : "Send Official Offer Email"}
            </button>

            <button
              type="button"
              onClick={handleSendWA}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold cursor-pointer transition shadow-md shadow-green-500/20"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Assign Modal ── */
function AssignModal({ app, teamMembers = [], onAssign, onClose }) {
  const [filter, setFilter] = useState("all");
  const [areaInput, setAreaInput] = useState("");
  const [companyInput, setCompanyInput] = useState(app.company || "");
  const [selected, setSelected] = useState(app.assignedTo || "");

  const activeMembers = teamMembers.filter((m) => m.role === "team_member" || m.role === "admin");

  const save = () => {
    const tm = activeMembers.find((m) => String(m.id) === String(selected));
    if (tm) onAssign(tm.id, tm.name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-gray-900">Assign Application</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="font-semibold text-gray-900 text-sm">{app.userName}</p>
            <p className="text-xs text-gray-500">
              {app.jobTitle} · {app.company}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Filter by</label>
            <div className="flex gap-2 mb-3">
              {["all", "area", "company"].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFilter(k)}
                  className={`flex-1 py-1.5 text-xs rounded-xl font-semibold border capitalize cursor-pointer transition ${
                    filter === k
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {k === "all" ? "All Staff" : k === "area" ? "City / Area" : "Company"}
                </button>
              ))}
            </div>
            {filter === "area" && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  placeholder="e.g. Jaipur, Delhi…"
                  className="bg-transparent flex-1 outline-none text-sm"
                />
              </div>
            )}
            {filter === "company" && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  placeholder="Company name…"
                  className="bg-transparent flex-1 outline-none text-sm"
                />
              </div>
            )}
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto">
            {activeMembers.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No team members available</p>
            ) : (
              activeMembers.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelected(m.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    String(selected) === String(m.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-100 hover:border-gray-200 bg-white"
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {(m.name || "U").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                    <p className="text-xs text-gray-400 truncate">{m.phone || m.email || "Available"}</p>
                  </div>
                  {String(selected) === String(m.id) && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!selected}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 cursor-pointer shadow-md shadow-blue-600/30"
            >
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Schedule Interview Modal ── */
function ScheduleInterviewModal({ app, teamMembers = [], currentUser, onClose, onScheduled }) {
  const defaultInterviewer = currentUser?.name
    ? `${currentUser.name} (${(currentUser.role || "Admin").replace("_", " ")})`
    : (teamMembers[0]?.name ? `${teamMembers[0].name} (${(teamMembers[0].role || "Staff").replace("_", " ")})` : "Admin Staff");

  const todayStr = new Date().toISOString().split("T")[0];
  const cleanPhone = (app.userPhone || "").replace(/\D/g, "").slice(0, 10);

  const [candidateName, setCandidateName] = useState(app.userName || "");
  const [candidatePhone, setCandidatePhone] = useState(cleanPhone);
  const [candidateEmail, setCandidateEmail] = useState(app.userEmail || "");
  const [jobTitle, setJobTitle] = useState(app.jobTitle || "");
  const [company, setCompany] = useState(app.company || "");
  const [companyAddress, setCompanyAddress] = useState(app.companyAddress || app.jobLocation || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState(app.interviewMode || "phone");
  const [round, setRound] = useState("HR Screening");
  const [interviewer, setInterviewer] = useState(app.interviewContact || defaultInterviewer);
  const [meetingLink, setMeetingLink] = useState(
    app.interviewMode === "in_person"
      ? (app.interviewAddress || app.companyAddress || app.jobLocation || "")
      : (app.interviewAddress || "")
  );
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === "in_person") {
      setMeetingLink(companyAddress || meetingLink || "Company Office Premises");
    } else if (newMode === "phone") {
      setMeetingLink("");
    }
  };

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    setCandidatePhone(digitsOnly);
    if (!digitsOnly) {
      setErrors((prev) => ({ ...prev, candidatePhone: "10-digit mobile number is required." }));
    } else if (digitsOnly.length < 10) {
      setErrors((prev) => ({ ...prev, candidatePhone: `Must be exactly 10 digits (${digitsOnly.length}/10).` }));
    } else if (!/^[6-9]/.test(digitsOnly)) {
      setErrors((prev) => ({ ...prev, candidatePhone: "Mobile number must start with 6, 7, 8, or 9." }));
    } else {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.candidatePhone;
        return copy;
      });
    }
  };

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
    setCandidatePhone(digits);
    if (digits.length === 10 && /^[6-9]/.test(digits)) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.candidatePhone;
        return copy;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!candidateName.trim()) {
      newErrors.candidateName = "Candidate name is required.";
    }
    if (!candidatePhone) {
      newErrors.candidatePhone = "10-digit mobile number is required.";
    } else if (candidatePhone.length !== 10) {
      newErrors.candidatePhone = "Mobile number must be exactly 10 digits.";
    } else if (!/^[6-9]/.test(candidatePhone)) {
      newErrors.candidatePhone = "Mobile number must start with 6, 7, 8, or 9.";
    }

    if (!date) {
      newErrors.date = "Interview date is required.";
    } else if (date < todayStr) {
      newErrors.date = "Interview date cannot be in the past.";
    }

    if (!time) {
      newErrors.time = "Interview time is required.";
    }

    if (!interviewer.trim()) {
      newErrors.interviewer = "Please specify who will conduct the interview.";
    }

    if (mode === "video" && meetingLink.trim() && !/^https?:\/\//i.test(meetingLink.trim())) {
      newErrors.meetingLink = "Please enter a valid link starting with https://";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const payload = {
      candidateName,
      candidatePhone,
      candidateEmail: candidateEmail || null,
      jobTitle,
      company,
      companyAddress,
      date,
      time,
      mode,
      interviewer,
      round,
      meetingLink: mode === "in_person" ? (meetingLink || companyAddress || "Company Premises") : meetingLink,
      applicationId: app.uuid || app.id,
    };

    router.post(route("admin.interviews.store"), payload, {
      preserveScroll: true,
      onSuccess: () => {
        setIsSubmitting(false);
        if (onScheduled) {
          onScheduled({
            status: "interview_scheduled",
            interviewDate: `${date} at ${time}`,
            interviewMode: mode,
            interviewAddress: payload.meetingLink,
            interviewContact: interviewer,
            round,
          });
        }
        onClose();
      },
      onError: (errs) => {
        setIsSubmitting(false);
        setErrors(errs || {});
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 sm:px-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-xl shadow-2xl border-2 border-purple-100 max-h-[92vh] overflow-y-auto [scrollbar-width:thin]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-md shadow-purple-600/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Schedule Candidate Interview</h3>
              <p className="text-xs text-purple-700 font-medium">
                {app.userName} • {app.jobTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl cursor-pointer transition"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Job & Candidate Pre-filled Snapshot */}
        <div className="bg-gradient-to-br from-purple-50/70 via-indigo-50/40 to-blue-50/50 border border-purple-100 rounded-2xl p-3.5 mb-4 space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-200/50 pb-2">
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="font-bold text-gray-900">{jobTitle}</span>
              <span className="text-gray-400">•</span>
              <span className="font-semibold text-purple-800">{company}</span>
            </div>
            {app.id && (
              <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-purple-200 text-purple-900">
                Application #{app.id}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-gray-600 text-[11px]">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-gray-400" /> {candidateName}
            </span>
            <span className="flex items-center gap-1 font-mono font-semibold text-gray-800">
              <Phone className="w-3 h-3 text-gray-400" /> +91 {candidatePhone}
            </span>
            {candidateEmail && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-gray-400" /> {candidateEmail}
              </span>
            )}
            {companyAddress && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400" /> {companyAddress}
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Timing & Mode */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5 space-y-3">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-600" />
              Interview Timing & Mode
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Interview Mode *
                </label>
                <select
                  value={mode}
                  onChange={(e) => handleModeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-gray-800"
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
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (e.target.value) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.date;
                        return copy;
                      });
                    }
                  }}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-gray-800"
                />
                {errors.date && <p className="text-[10px] text-red-500 mt-0.5">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    if (e.target.value) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.time;
                        return copy;
                      });
                    }
                  }}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-gray-800"
                />
                {errors.time && <p className="text-[10px] text-red-500 mt-0.5">{errors.time}</p>}
              </div>
            </div>

            {/* Round & Interviewer Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Round / Stage
                </label>
                <select
                  value={round}
                  onChange={(e) => setRound(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-gray-800"
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
                  Interviewer / Panel Conductor *
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      setInterviewer(e.target.value);
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.interviewer;
                        return copy;
                      });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-purple-500 outline-none text-gray-800"
                >
                  <option value="">-- Quick Choose Staff --</option>
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
                value={interviewer}
                onChange={(e) => {
                  setInterviewer(e.target.value);
                  if (e.target.value.trim()) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.interviewer;
                      return copy;
                    });
                  }
                }}
                placeholder="Type or customize interviewer name / panel details"
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-800 outline-none focus:ring-1 focus:ring-purple-500"
              />
              {errors.interviewer && <p className="text-[10px] text-red-500 mt-0.5">{errors.interviewer}</p>}
            </div>

            {/* In-Person Venue Address */}
            {mode === "in_person" && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-amber-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    Company Office / Venue Address (Auto-filled) *
                  </label>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                    Venue
                  </span>
                </div>
                <input
                  type="text"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="Company premises address / Floor / Cabin..."
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg text-xs bg-white text-gray-900 outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
                <p className="text-[10px] text-amber-800 font-medium">
                  {companyAddress ? "✓ Auto-filled from company profile. You can edit room or landmark." : "Enter venue address for the candidate."}
                </p>
              </div>
            )}

            {/* Video Call Meeting Link */}
            {mode === "video" && (
              <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-3 space-y-1">
                <label className="block text-[11px] font-bold text-purple-900 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-purple-700" />
                  Meeting Link (Google Meet / Zoom / MS Teams)
                </label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg text-xs bg-white text-gray-900 outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
                {errors.meetingLink && <p className="text-[10px] text-red-500 mt-0.5">{errors.meetingLink}</p>}
              </div>
            )}
          </div>

          {/* Candidate Verification */}
          <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-3.5 space-y-2">
            <label className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-600" />
              Candidate Verification & Notification Contact
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white border border-indigo-100 rounded-xl p-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
                  Candidate Name *
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {errors.candidateName && <p className="text-[10px] text-red-500 mt-0.5">{errors.candidateName}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
                  10-Digit Mobile Number *
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={candidatePhone}
                  onChange={handlePhoneChange}
                  onPaste={handlePhonePaste}
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-mono font-semibold text-gray-900 outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {errors.candidatePhone && <p className="text-[10px] text-red-500 mt-0.5">{errors.candidatePhone}</p>}
              </div>
              <div className="col-span-full">
                <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
                  Candidate Email (For Official Email Invitation)
                </label>
                <input
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30 cursor-pointer transition disabled:opacity-60"
            >
              <Calendar className="w-4 h-4" />
              {isSubmitting ? "Scheduling & Notifying..." : "Confirm & Schedule Interview"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function Applications({
  applications = [],
  teamMembers = [],
  canViewAll = false,
  scope = "your",
  filters = {},
}) {
  const { auth, flash } = usePage().props;
  const currentUser = auth?.admin;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState(null);
  const [remark, setRemark] = useState("");
  const [assigningApp, setAssigningApp] = useState(null);
  const [offerApp, setOfferApp] = useState(null);
  const [scheduleInterviewApp, setScheduleInterviewApp] = useState(null);

  const isTeamMember = currentUser?.role === "team_member";

  const updateStatus = (uuid, status) => {
    router.post(
      route("admin.applications.update-status", uuid),
      { status },
      {
        preserveScroll: true,
        onSuccess: () => {
          if (selectedApp?.uuid === uuid) {
            setSelectedApp((prev) => (prev ? { ...prev, status } : null));
          }
        },
      }
    );
  };

  const saveRemark = (uuid) => {
    if (!remark.trim()) return;
    router.post(
      route("admin.applications.update-remark", uuid),
      { remark },
      {
        preserveScroll: true,
        onSuccess: () => {
          if (selectedApp?.uuid === uuid) {
            setSelectedApp((prev) => (prev ? { ...prev, remark } : null));
          }
          setRemark("");
        },
      }
    );
  };

  const doAssign = (uuid, tmId, name) => {
    router.post(
      route("admin.applications.assign", uuid),
      { team_member_id: tmId },
      {
        preserveScroll: true,
        onSuccess: () => {
          if (selectedApp?.uuid === uuid) {
            setSelectedApp((prev) =>
              prev ? { ...prev, assignedTo: tmId, assignedToName: name } : null
            );
          }
          setAssigningApp(null);
        },
      }
    );
  };

  const followUpWA = (app) =>
    waUrl(
      app.userPhone,
      `👋 Hi ${app.userName},\n\nThis is the ATS recruitment team regarding your application for *${app.jobTitle}* at *${app.company}*. We would like to update you on your application status. Please reply to connect.\n\n– ATS Recruitment Team`
    );

  const interviewWA = (app) => {
    const venueText =
      app.interviewMode === "in_person"
        ? `🏢 Venue / Address: ${app.interviewAddress || "Company Premises"}`
        : app.interviewMode === "video"
        ? `🎥 Meeting Link: ${app.interviewAddress || "Will be shared shortly"}`
        : "📞 Mode: Telephonic Interview";

    const msg =
      `🎯 *Interview Scheduled – ${app.company || "Job Position"}*\n\n` +
      `Dear ${app.userName || "Candidate"},\n\n` +
      `Your interview for *${app.jobTitle || "Role"}* at *${app.company || "ATS Partner"}* is confirmed!\n\n` +
      `📅 Date & Time: *${app.interviewDate || "Scheduled Soon"}*\n` +
      `${venueText}\n` +
      `👤 Interviewer / Panel: *${app.interviewContact || "HR Team"}*\n\n` +
      `Please be prepared 10 minutes prior.\nBest regards,\nATS Hiring Team`;

    return waUrl(app.userPhone, msg);
  };

  const filtered = applications.filter((a) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (a.userName || "").toLowerCase().includes(q) ||
      (a.jobTitle || "").toLowerCase().includes(q) ||
      (a.company || "").toLowerCase().includes(q) ||
      (a.userPhone || "").toLowerCase().includes(q) ||
      (a.userEmail || "").toLowerCase().includes(q) ||
      (a.userCity || "").toLowerCase().includes(q) ||
      (a.currentTitle || "").toLowerCase().includes(q) ||
      (a.lastCompany || "").toLowerCase().includes(q) ||
      (Array.isArray(a.skills) && a.skills.some((s) => (s || "").toLowerCase().includes(q)));

    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Head title="Candidate Applications - ATS Admin" />

      <div className="p-3.5 sm:p-5 lg:p-6 pb-25">
        {flash?.success && (
          <div className="mb-5 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> {flash.success}
          </div>
        )}

        {assigningApp && (
          <AssignModal
            app={assigningApp}
            teamMembers={teamMembers}
            onClose={() => setAssigningApp(null)}
            onAssign={(tmId, name) => doAssign(assigningApp.uuid, tmId, name)}
          />
        )}

        {offerApp && (
          <OfferLetterModal
            app={offerApp}
            onClose={() => setOfferApp(null)}
          />
        )}

        {scheduleInterviewApp && (
          <ScheduleInterviewModal
            app={scheduleInterviewApp}
            teamMembers={teamMembers}
            currentUser={currentUser}
            onClose={() => setScheduleInterviewApp(null)}
            onScheduled={(updated) => {
              if (selectedApp?.uuid === scheduleInterviewApp.uuid) {
                setSelectedApp((prev) => (prev ? { ...prev, ...updated } : null));
              }
            }}
          />
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">
              {isTeamMember ? "My Assigned Applications" : "Job Applications"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {applications.length} total · {filtered.length} shown
            </p>
          </div>
        </div>

        {filters?.job_id && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2.5 rounded-xl text-xs font-semibold mb-4">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              Showing {applications.length} applicant{applications.length !== 1 ? "s" : ""} for Job #{filters.job_id}
            </span>
            <button
              type="button"
              onClick={() => router.get(route("admin.applications.index"))}
              className="text-blue-600 hover:text-blue-900 underline font-bold cursor-pointer"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* All vs Your Scope Tab (Visible when canViewAll is true) */}
        {canViewAll && (
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl w-fit mb-5">
            <button
              type="button"
              onClick={() =>
                router.get(
                  route("admin.applications.index"),
                  { scope: "all" },
                  { preserveState: true, preserveScroll: true }
                )
              }
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                scope === "all"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              All Applications
            </button>
            <button
              type="button"
              onClick={() =>
                router.get(
                  route("admin.applications.index"),
                  { scope: "your" },
                  { preserveState: true, preserveScroll: true }
                )
              }
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                scope === "your"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Your Applications
            </button>
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
          {[
            ["all", `All (${applications.length})`],
            ...ALL_STATUSES.map((s) => [
              s,
              `${STATUS_CFG[s].label} (${applications.filter((a) => a.status === s).length})`,
            ]),
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition ${
                statusFilter === key
                  ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative mb-5 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate, job, or company…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Applications Table (Independent Scroll in View Mode) */}
          <div
            className={`w-full min-w-0 ${
              selectedApp
                ? "hidden lg:block lg:w-1/2 xl:w-7/12 overflow-y-auto h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] pr-2 [scrollbar-width:thin]"
                : "w-full"
            }`}
          >
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  {filtered.length > 0 && (
                    <thead className="bg-gray-50/75 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                          Candidate
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                          Job Applied
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                          Status
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                          Applied
                        </th>
                        <th className={`text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap ${selectedApp ? "hidden xl:table-cell" : ""}`}>
                          Assigned Staff
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                          {/* Actions */}
                        </th>
                      </tr>
                    </thead>
                  )}
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((app) => (
                      <tr
                        key={app.uuid}
                        className={`hover:bg-gray-50/80 cursor-pointer transition ${
                          selectedApp?.uuid === app.uuid ? "bg-blue-50/50" : ""
                        }`}
                        onClick={() => setSelectedApp(app)}
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-semibold text-gray-900 leading-tight">{app.userName}</p>
                            {app.presence?.is_online ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Online
                              </span>
                            ) : app.presence?.status_text && app.presence.status_text !== "Never active" ? (
                              <span className="text-[10px] text-gray-400 font-medium">
                                • {app.presence.status_text}
                              </span>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1 text-gray-500">
                              <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                              {app.userPhone}
                            </span>
                            {app.userCity && (
                              <span className="text-gray-400">
                                · 📍 {app.userCity}
                              </span>
                            )}
                          </div>
                          {(app.experience || app.expectedSalary) && (
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              {app.experience && (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                                  {app.experience}
                                </span>
                              )}
                              {app.expectedSalary && (
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  ₹{Number(app.expectedSalary).toLocaleString("en-IN")}
                                  <span className="text-[9px] font-normal text-emerald-600 ml-0.5">
                                    {app.jobSalaryType === "yearly" ? "/yr" : "/mo"}
                                  </span>
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-semibold text-gray-800 leading-tight">
                              {app.jobTitle}
                            </p>
                            {app.isJobClosed && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Job Closed
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{app.company}</p>
                          {app.currentTitle && (
                            <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
                              Role: {app.currentTitle}
                            </p>
                          )}
                          {selectedApp && app.assignedToName && (
                            <p className="text-[10px] text-blue-600 xl:hidden mt-0.5 font-medium">
                              Staff: {app.assignedToName}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                              STATUS_CFG[app.status]?.color || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {STATUS_CFG[app.status]?.label || app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-500 font-medium whitespace-nowrap">
                          {app.appliedAt}
                        </td>
                        <td className={`px-4 py-3.5 text-xs ${selectedApp ? "hidden xl:table-cell" : ""}`}>
                          {app.assignedToName ? (
                            <span className="text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 whitespace-nowrap">
                              {app.assignedToName}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div
                            className="flex gap-1 justify-end items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {app.resumeUrl && (
                              <a
                                href={app.resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="View Candidate Resume PDF"
                              >
                                <FileText className="w-4 h-4" />
                              </a>
                            )}
                            {!isTeamMember && (
                              <button
                                type="button"
                                onClick={() => setAssigningApp(app)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition"
                                title="Assign to staff"
                              >
                                <Users className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setScheduleInterviewApp(app)}
                              className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition cursor-pointer"
                              title={app.status === "interview_scheduled" ? "Reschedule / View Interview" : "Schedule Candidate Interview"}
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                            <a
                              href={followUpWA(app)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition cursor-pointer"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                            <a
                              href={`tel:${app.userPhone}`}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Call Candidate"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                          Koi application nahi mili.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Application Detail Side View (Independent Smooth Scroll & Distinct Contrast Header) */}
          {selectedApp && (
            <div
              id="admin-application-detail-panel"
              className="w-full lg:w-1/2 xl:w-5/12 bg-white border-2 border-blue-400/80 rounded-3xl shadow-2xl shadow-blue-950/20 flex flex-col lg:sticky lg:top-3 h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] z-20 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300 ease-out"
            >
              {/* Header with High-Contrast Navy/Blue Gradient */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shrink-0 z-10">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="text-xs font-semibold text-blue-200 hover:text-white px-2.5 py-1 bg-white/10 border border-white/20 rounded-lg lg:hidden cursor-pointer shrink-0"
                  >
                    ← Back
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-white text-base truncate">
                        {selectedApp.candidateName || `Application #${selectedApp.id}`}
                      </h3>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                          STATUS_CFG[selectedApp.status]?.color || "bg-white/20 text-white"
                        }`}
                      >
                        {STATUS_CFG[selectedApp.status]?.label || selectedApp.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-cyan-300 font-medium mt-0.5">
                      Applied: {selectedApp.appliedAt} • #{selectedApp.id}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer shrink-0 transition"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Independent Scrollable Content Area */}
              <div className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
                {/* Hero Candidate Profile Card */}
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-purple-50/50 border border-blue-100">
                  <div className="relative shrink-0">
                    <div className="w-13 h-13 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-blue-500/20">
                      {(selectedApp.userName || "U").slice(0, 2).toUpperCase()}
                    </div>
                    {selectedApp.presence?.is_online && (
                      <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-gray-900 text-base sm:text-lg leading-tight truncate">
                        {selectedApp.userName}
                      </h4>
                      {selectedApp.currentTitle && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          {selectedApp.currentTitle}
                        </span>
                      )}
                      {selectedApp.presence?.is_online ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          {selectedApp.presence.status_text}
                        </span>
                      ) : selectedApp.presence?.status_text && selectedApp.presence.status_text !== "Never active" ? (
                        <span className="text-xs text-gray-500 font-medium">
                          {selectedApp.presence.status_text}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <a href={`tel:${selectedApp.userPhone}`} className="hover:text-blue-600 font-medium">
                          {selectedApp.userPhone}
                        </a>
                      </div>
                      {selectedApp.userEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <a href={`mailto:${selectedApp.userEmail}`} className="hover:text-blue-600 font-medium truncate">
                            {selectedApp.userEmail}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">
                          {[selectedApp.userCity, selectedApp.userArea, selectedApp.userState].filter(Boolean).join(", ") || "India"}
                        </span>
                      </div>
                      {(selectedApp.userGender || selectedApp.userDob) && (
                        <div className="flex items-center gap-2 text-gray-400 text-[11px] pt-0.5">
                          {selectedApp.userGender && <span className="capitalize">{selectedApp.userGender}</span>}
                          {selectedApp.userGender && selectedApp.userDob && <span>·</span>}
                          {selectedApp.userDob && <span>DOB: {selectedApp.userDob}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Candidate Resume Action Box */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-white shadow-xs">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm">Resume / CV Document</p>
                        <p className="text-xs text-gray-400 truncate">
                          {selectedApp.resumeUrl ? "Candidate uploaded resume" : "No resume document uploaded"}
                        </p>
                      </div>
                    </div>
                    {selectedApp.resumeUrl ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={selectedApp.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View PDF
                        </a>
                        <a
                          href={selectedApp.resumeUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                          title="Download Resume"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Not available</span>
                    )}
                  </div>
                </div>

                {/* Compensation & Experience Highlights */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Compensation & Availability
                    </span>
                    {selectedApp.noticePeriod && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-orange-100 text-orange-800 border border-orange-200">
                        Notice: {selectedApp.noticePeriod}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3">
                      <span className="text-[10px] font-bold text-emerald-800 block uppercase">
                        Expected Salary
                      </span>
                      <p className="text-base font-extrabold text-emerald-900 mt-0.5">
                        {selectedApp.expectedSalary
                          ? `₹${Number(selectedApp.expectedSalary).toLocaleString("en-IN")}`
                          : "Not specified"}
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-3">
                      <span className="text-[10px] font-bold text-gray-500 block uppercase">
                        Current Salary
                      </span>
                      <p className="text-base font-extrabold text-gray-900 mt-0.5">
                        {selectedApp.currentSalary
                          ? `₹${Number(selectedApp.currentSalary).toLocaleString("en-IN")}`
                          : "—"}
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-3 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-bold text-gray-500 block uppercase">
                        Total Experience
                      </span>
                      <p className="text-base font-extrabold text-gray-900 mt-0.5">
                        {selectedApp.experience || "Fresher"}
                      </p>
                    </div>
                  </div>

                  {selectedApp.lastWorkingDay && (
                    <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-900 px-3 py-2 rounded-xl border border-amber-200 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Last Working Day: <strong>{selectedApp.lastWorkingDay}</strong></span>
                    </div>
                  )}
                </div>

                {/* Professional Background */}
                {(selectedApp.currentTitle || selectedApp.lastCompany || selectedApp.experience) && (
                  <div className="border border-gray-200 rounded-2xl p-4 bg-white space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                      Professional Details
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Current / Latest Role</span>
                        <span className="font-semibold text-gray-900 text-sm">{selectedApp.currentTitle || "—"}</span>
                      </div>
                      <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Previous / Current Company</span>
                        <span className="font-semibold text-gray-900 text-sm">{selectedApp.lastCompany || "—"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Candidate Skills */}
                {selectedApp.skills && selectedApp.skills.length > 0 && (
                  <div className="border border-gray-200 rounded-2xl p-4 bg-white space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <Tag className="w-3.5 h-3.5 text-blue-500" />
                      Candidate Skills ({selectedApp.skills.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedApp.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-100"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education Background */}
                {(selectedApp.qualification || selectedApp.educationDegree || selectedApp.educationInstitute) && (
                  <div className="border border-gray-200 rounded-2xl p-4 bg-white space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                      Education & Qualifications
                    </div>
                    <div className="space-y-2 text-xs">
                      {selectedApp.qualification && (
                        <div className="flex items-baseline justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                          <span className="text-gray-400">Level:</span>
                          <span className="font-semibold text-gray-900">{selectedApp.qualification}</span>
                        </div>
                      )}
                      {selectedApp.educationDegree && (
                        <div className="flex items-baseline justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                          <span className="text-gray-400">Degree / Branch:</span>
                          <span className="font-semibold text-gray-900">{selectedApp.educationDegree}</span>
                        </div>
                      )}
                      {selectedApp.educationInstitute && (
                        <div className="flex items-baseline justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                          <span className="text-gray-400">College / Institute:</span>
                          <span className="font-semibold text-gray-900 text-right">{selectedApp.educationInstitute}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cover Letter / Statement */}
                {selectedApp.coverLetter && (
                  <div className="border border-amber-200 rounded-2xl p-4 bg-amber-50/40 space-y-2">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                      Candidate Note / Why Apply
                    </span>
                    <p className="text-xs text-gray-800 leading-relaxed italic whitespace-pre-line bg-white/80 p-3 rounded-xl border border-amber-100">
                      "{selectedApp.coverLetter}"
                    </p>
                  </div>
                )}

                {/* Links: LinkedIn & Portfolio */}
                {(selectedApp.linkedin || selectedApp.portfolio) && (
                  <div className="flex gap-2">
                    {selectedApp.linkedin && (
                      <a
                        href={selectedApp.linkedin.startsWith("http") ? selectedApp.linkedin : `https://${selectedApp.linkedin}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition"
                      >
                        <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                      </a>
                    )}
                    {selectedApp.portfolio && (
                      <a
                        href={selectedApp.portfolio.startsWith("http") ? selectedApp.portfolio : `https://${selectedApp.portfolio}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition"
                      >
                        <Globe className="w-3.5 h-3.5" /> Portfolio
                      </a>
                    )}
                  </div>
                )}

                {/* Applied Job Details & Complete Specs */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/70 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                      Job Post Details
                    </span>
                    {selectedApp.isJobClosed ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                        Job Post Closed / Deleted
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Active Opening
                      </span>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-extrabold text-gray-900 text-sm sm:text-base">{selectedApp.jobTitle}</p>
                      <p className="text-xs font-semibold text-blue-600 mt-0.5">{selectedApp.company}</p>
                    </div>
                    {selectedApp.jobType && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                        {selectedApp.jobType}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 pt-1 border-t border-gray-200/60 flex-wrap">
                    {selectedApp.jobLocation && (
                      <span className="flex items-center gap-1">📍 {selectedApp.jobLocation}</span>
                    )}
                    {selectedApp.jobSalary && (
                      <span className="flex items-center gap-1 font-semibold text-emerald-700">
                        💰 {selectedApp.jobSalary} ({selectedApp.jobSalaryType})
                      </span>
                    )}
                    {selectedApp.jobPost?.experience && (
                      <span className="flex items-center gap-1">🎯 Exp: {selectedApp.jobPost.experience}</span>
                    )}
                    {selectedApp.jobPost?.openings && (
                      <span className="flex items-center gap-1">👥 {selectedApp.jobPost.openings} Openings</span>
                    )}
                  </div>

                  {/* Job Description (Full Post Specs for Admin) */}
                  {selectedApp.jobPost?.description && (
                    <div className="pt-2 border-t border-gray-200/60">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                        Job Description / About the Role
                      </p>
                      <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-white p-3 rounded-xl border border-gray-200/80 max-h-48 overflow-y-auto">
                        {selectedApp.jobPost.description}
                      </p>
                    </div>
                  )}

                  {/* Skills Required */}
                  {selectedApp.jobPost?.skills && selectedApp.jobPost.skills.length > 0 && (
                    <div className="pt-2 border-t border-gray-200/60">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        Required Skills
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedApp.jobPost.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-lg font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Responsibilities */}
                  {selectedApp.jobPost?.responsibilities && selectedApp.jobPost.responsibilities.length > 0 && (
                    <div className="pt-2 border-t border-gray-200/60">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                        Key Responsibilities
                      </p>
                      <ul className="text-xs text-gray-700 space-y-1 list-disc pl-4 bg-white p-3 rounded-xl border border-gray-200/80 max-h-36 overflow-y-auto">
                        {selectedApp.jobPost.responsibilities.map((r, idx) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Qualifications & Requirements */}
                  {selectedApp.jobPost?.qualifications && selectedApp.jobPost.qualifications.length > 0 && (
                    <div className="pt-2 border-t border-gray-200/60">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                        Qualifications & Requirements
                      </p>
                      <ul className="text-xs text-gray-700 space-y-1 list-disc pl-4 bg-white p-3 rounded-xl border border-gray-200/80 max-h-36 overflow-y-auto">
                        {selectedApp.jobPost.qualifications.map((q, idx) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Perks & Benefits */}
                  {selectedApp.jobPost?.perks && selectedApp.jobPost.perks.length > 0 && (
                    <div className="pt-2 border-t border-gray-200/60">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        Perks & Benefits
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedApp.jobPost.perks.map((p, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg font-medium"
                          >
                            ✓ {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Interview Information (if scheduled) */}
                {(selectedApp.interviewDate || selectedApp.interviewMode || selectedApp.status === "interview_scheduled") && (
                  <div className="border border-purple-200 rounded-2xl p-4 bg-purple-50/50 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-purple-800 uppercase tracking-wider">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        Interview Details
                      </div>
                      <button
                        type="button"
                        onClick={() => setScheduleInterviewApp(selectedApp)}
                        className="text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-white px-2 py-0.5 rounded-md border border-purple-200 cursor-pointer shadow-2xs hover:bg-purple-50 transition"
                      >
                        Edit Details ↗
                      </button>
                    </div>
                    <div className="space-y-1.5 text-gray-700">
                      {selectedApp.interviewDate && (
                        <p><strong>Scheduled:</strong> {selectedApp.interviewDate}</p>
                      )}
                      {selectedApp.interviewMode && (
                        <p><strong>Mode:</strong> {selectedApp.interviewMode}</p>
                      )}
                      {selectedApp.interviewAddress && (
                        <p><strong>Address / Link:</strong> {selectedApp.interviewAddress}</p>
                      )}
                      {selectedApp.interviewContact && (
                        <p><strong>Contact Person:</strong> {selectedApp.interviewContact}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Recruiter Actions */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Quick Actions
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Dedicated Schedule / Reschedule Button */}
                    <button
                      type="button"
                      onClick={() => setScheduleInterviewApp(selectedApp)}
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-purple-700 rounded-xl text-xs font-bold border border-purple-200 transition cursor-pointer col-span-2 shadow-2xs"
                    >
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      {selectedApp.status === "interview_scheduled"
                        ? "Reschedule / Edit Interview Details"
                        : "Schedule Candidate Interview"}
                    </button>

                    <a
                      href={followUpWA(selectedApp)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-green-50 text-green-700 rounded-xl text-xs font-semibold hover:bg-green-100 border border-green-200 transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                    {selectedApp.userEmail && (
                      <a
                        href={mailUrl(
                          selectedApp.userEmail,
                          `Regarding your application – ${selectedApp.jobTitle}`,
                          `Dear ${selectedApp.userName},\n\nThis is ATS recruitment team regarding your application for ${selectedApp.jobTitle} at ${selectedApp.company}.\n\nWe would like to connect with you for next steps.\n\n– ATS Team`
                        )}
                        className="flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold hover:bg-blue-100 border border-blue-200 transition"
                      >
                        <Mail className="w-3.5 h-3.5" /> Email
                      </a>
                    )}
                    {selectedApp.status === "interview_scheduled" && (
                      <a
                        href={interviewWA(selectedApp)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition col-span-2 shadow-xs cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Send Interview WA Reminder
                      </a>
                    )}
                    {(selectedApp.status === "hired" || selectedApp.status === "offer_letter_generated") && (
                      <button
                        type="button"
                        onClick={() => setOfferApp(selectedApp)}
                        className="flex items-center justify-center gap-1.5 py-2.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold hover:bg-amber-100 border border-amber-200 transition cursor-pointer col-span-2"
                      >
                        <FileText className="w-3.5 h-3.5" /> Generate / Send Offer Letter
                      </button>
                    )}
                  </div>
                </div>

                {/* Assignment Info */}
                {selectedApp.assignedToName ? (
                  <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3.5 py-2.5 border border-blue-100">
                    <Users className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-blue-400">Assigned Recruiter</p>
                      <p className="text-sm font-semibold text-blue-800 truncate">
                        {selectedApp.assignedToName}
                      </p>
                    </div>
                    {!isTeamMember && (
                      <button
                        type="button"
                        onClick={() => setAssigningApp(selectedApp)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 bg-white border border-blue-200 rounded-lg shrink-0 cursor-pointer"
                      >
                        Change
                      </button>
                    )}
                  </div>
                ) : (
                  !isTeamMember && (
                    <button
                      type="button"
                      onClick={() => setAssigningApp(selectedApp)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-500 hover:border-blue-400 hover:text-blue-600 font-semibold cursor-pointer transition"
                    >
                      <Users className="w-3.5 h-3.5" /> Assign Staff Member
                    </button>
                  )
                )}

                {/* Status Update Pipeline */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Update Pipeline Status
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ALL_STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          if (s === "interview_scheduled") {
                            setScheduleInterviewApp(selectedApp);
                          } else {
                            updateStatus(selectedApp.uuid, s);
                          }
                        }}
                        className={`text-xs py-2 px-2 rounded-xl font-semibold border transition-all cursor-pointer ${
                          selectedApp.status === s
                            ? "ring-2 ring-blue-500 font-bold " + STATUS_CFG[s].color
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {STATUS_CFG[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Remarks & History */}
                {selectedApp.remark && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                    <p className="text-xs font-semibold text-yellow-700 mb-1">Previous Remark / Note</p>
                    <p className="text-sm text-yellow-800 whitespace-pre-line">{selectedApp.remark}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Add Remark
                  </p>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    rows={3}
                    placeholder="e.g. Cleared round 1, agreed on offered CTC, documents verified…"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                  />
                  <button
                    type="button"
                    onClick={() => saveRemark(selectedApp.uuid)}
                    disabled={!remark.trim()}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" /> Save Remark
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Applications.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;