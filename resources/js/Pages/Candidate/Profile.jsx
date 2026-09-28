import React, { useState, useEffect, useRef } from "react";
import { Link, router, usePage, Head } from "@inertiajs/react";
import HomepageLayout from "@/Layouts/HomepageLayout";
import {
  User, Phone, MapPin, Briefcase, GraduationCap, Edit3, Save, X,
  Camera, Plus, Trash2, CheckCircle2, Star, Award, Globe, Linkedin,
  Github, Mail, Calendar, Clock, FileText, Download, Eye, Upload,
  Building2, TrendingUp, Shield, BookmarkCheck, ChevronRight, School,
  BookOpen, AlertCircle, ChevronDown, ChevronUp, ExternalLink,
  IndianRupee, Loader2, Sparkles, Maximize2, Minimize2, FileCheck,
} from "lucide-react";

const EDU_LEVELS = [
  "10th Pass",
  "12th Pass",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD / Doctorate",
  "Other"
];

const INDIA_CITIES = [
  "Jaipur", "Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Pune",
  "Chennai", "Kolkata", "Ahmedabad", "Noida", "Gurugram", "Lucknow",
  "Chandigarh", "Indore", "Bhopal", "Kochi", "Surat", "Other"
];

const EXP_OPTIONS = [
  "Fresher (0 Years)",
  "0-1 Year",
  "1-2 Years",
  "2-4 Years",
  "4-6 Years",
  "6-10 Years",
  "10+ Years"
];

/* ─── Helpers ─── */
function SkillChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs px-3 py-1.5 rounded-full font-medium shadow-xs transition hover:bg-blue-100/70">
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:text-red-600 transition-colors ml-0.5 focus:outline-none"
          title="Remove"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </span>
  );
}

function Section({ title, icon: Icon, children, action }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:border-gray-200">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm tracking-tight">{title}</h3>
        </div>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function SaveBtn({ onSave, onCancel, loading = false }) {
  return (
    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
      <button
        type="button"
        onClick={onSave}
        disabled={loading}
        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        Save Changes
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-xs font-medium transition cursor-pointer"
      >
        <X className="w-3.5 h-3.5" /> Cancel
      </button>
    </div>
  );
}

export default function Profile({
  candidate = {},
  educations = [],
  experiences = [],
  certificates = [],
  resume = null,
  applications = [],
  savedJobs = [],
}) {
  const { auth, flash } = usePage().props;
  const user = candidate?.id ? candidate : auth?.user || {};

  /* ─ Notification Toast ─ */
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg, type = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    if (flash?.success) triggerToast(flash.success, "success");
    else if (flash?.error) triggerToast(flash.error, "error");
  }, [flash]);

  /* ─ Parse helpers ─ */
  const parseArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return val.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  /* ─ Dynamic Hero State ─ */
  const [hero, setHero] = useState({
    fullName: user.full_name || user.name || "",
    jobTitle: user.job_title || "",
    city: user.city || "",
    area: user.area || "",
    phone: user.phone || "",
    email: user.email || "",
    bio: user.bio || "",
    available: user.is_open_to_work ?? true,
    avatar: user.profile_picture_url || user.profile_picture || null,
  });
  const [editHero, setEditHero] = useState(false);
  const [draftHero, setDraftHero] = useState(hero);
  const [savingHero, setSavingHero] = useState(false);
  const avatarInputRef = useRef(null);

  /* ─ Dynamic Preferences State ─ */
  const [prefs, setPrefs] = useState({
    experience: user.total_experience_years || user.experience || "Fresher (0 Years)",
    jobType: user.job_type || "Full-time",
    workMode: user.work_mode || "On-site",
    notice: user.notice_period_days !== null && user.notice_period_days !== undefined
      ? (user.notice_period_days === 0 ? "Immediately" : `${user.notice_period_days} Days`)
      : "Immediately",
    salary: user.expected_ctc || "",
    available: user.is_open_to_work ?? true,
  });
  const [editPrefs, setEditPrefs] = useState(false);
  const [draftPrefs, setDraftPrefs] = useState(prefs);
  const [savingPrefs, setSavingPrefs] = useState(false);

  /* ─ Dynamic Skills & Languages ─ */
  const [skills, setSkills] = useState(parseArray(user.skills));
  const [langs, setLangs] = useState(parseArray(user.languages));
  const [editSkills, setEditSkills] = useState(false);
  const [draftSkills, setDraftSkills] = useState(skills);
  const [draftLangs, setDraftLangs] = useState(langs);
  const [newSkill, setNewSkill] = useState("");
  const [newLang, setNewLang] = useState("");
  const [savingSkills, setSavingSkills] = useState(false);

  /* ─ Dynamic Online Presence / Links ─ */
  const [personal, setPersonal] = useState({
    address: user.address || (user.area && user.city ? `${user.area}, ${user.city}` : user.city || ""),
    linkedin: user.linkedin || "",
    github: user.github || "",
    portfolio: user.portfolio || "",
  });
  const [editPersonal, setEditPersonal] = useState(false);
  const [draftPersonal, setDraftPersonal] = useState(personal);
  const [savingPersonal, setSavingPersonal] = useState(false);

  /* ─ Dynamic Educations ─ */
  const normalizeEduList = (list) => {
    if (!Array.isArray(list) || list.length === 0) return [];
    return list.map((item) => ({
      id: item.id || Date.now(),
      uuid: item.uuid,
      level: item.degree || "Bachelor's Degree",
      institute: item.institution || "",
      field: item.field_of_study || "",
      startYear: item.start_year ? String(item.start_year) : "",
      endYear: item.end_year ? String(item.end_year) : "",
      grade: item.percentage_or_cgpa || "",
    }));
  };
  const [eduList, setEduList] = useState(normalizeEduList(educations));
  const [editEduId, setEditEduId] = useState(null);
  const [addingEdu, setAddingEdu] = useState(false);
  const [draftEdu, setDraftEdu] = useState({ id: 0, level: "Bachelor's Degree", institute: "", field: "", startYear: "", endYear: "", grade: "" });
  const [savingEdu, setSavingEdu] = useState(false);

  /* ─ Dynamic Work Experience ─ */
  const normalizeWorkList = (list) => {
    if (!Array.isArray(list) || list.length === 0) return [];
    return list.map((item) => ({
      id: item.id || Date.now(),
      uuid: item.uuid,
      title: item.designation || "",
      company: item.company_name || "",
      location: item.location || "",
      startDate: item.start_date ? String(item.start_date).slice(0, 10) : "",
      endDate: item.end_date ? String(item.end_date).slice(0, 10) : "",
      current: Boolean(item.is_current),
      desc: item.description || "",
    }));
  };
  const [workList, setWorkList] = useState(normalizeWorkList(experiences));
  const [editWorkId, setEditWorkId] = useState(null);
  const [addingWork, setAddingWork] = useState(false);
  const [draftWork, setDraftWork] = useState({ id: 0, title: "", company: "", location: "", startDate: "", endDate: "", current: false, desc: "" });
  const [savingWork, setSavingWork] = useState(false);

  /* ─ Dynamic Certificates ─ */
  const normalizeCertList = (list) => {
    if (!Array.isArray(list) || list.length === 0) return [];
    return list.map((item) => ({
      id: item.id || Date.now(),
      uuid: item.uuid,
      name: item.title || "",
      issuer: item.issuing_organization || "",
      issueDate: item.issue_date ? String(item.issue_date).slice(0, 10) : "",
      expiry: item.expiration_date ? String(item.expiration_date).slice(0, 10) : "",
      credId: item.credential_id || "",
      url: item.credential_url || "",
    }));
  };
  const [certList, setCertList] = useState(normalizeCertList(certificates));
  const [addingCert, setAddingCert] = useState(false);
  const [editCertId, setEditCertId] = useState(null);
  const [draftCert, setDraftCert] = useState({ id: 0, name: "", issuer: "", issueDate: "", expiry: "", credId: "", url: "" });
  const [savingCert, setSavingCert] = useState(false);

  /* ─ Dynamic Resume ─ */
  const [currentResume, setCurrentResume] = useState(resume);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(true);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const resumeInputRef = useRef(null);

  const resolveResumeUrl = (res) => {
    if (!res) return null;
    let url = res.file_url || res.file_path;
    if (!url) return null;
    if (url.startsWith("blob:")) return url;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      try {
        const parsed = new URL(url);
        return parsed.pathname;
      } catch (e) {
        return url;
      }
    }
    return "/" + String(url).replace(/^\//, "");
  };

  const resumeUrl = resolveResumeUrl(currentResume);
  const isPdf = Boolean(
    (currentResume?.file_type && String(currentResume.file_type).toLowerCase() === "pdf") ||
    (currentResume?.title && String(currentResume.title).toLowerCase().endsWith(".pdf")) ||
    (currentResume?.file_path && String(currentResume.file_path).toLowerCase().endsWith(".pdf"))
  );

  /* ─ Sync reactive state with fresh props from Inertia ─ */
  useEffect(() => {
    if (candidate && candidate.id) {
      const freshHero = {
        fullName: candidate.full_name || candidate.name || "",
        jobTitle: candidate.job_title || "",
        city: candidate.city || "",
        area: candidate.area || "",
        phone: candidate.phone || "",
        email: candidate.email || "",
        bio: candidate.bio || "",
        available: candidate.is_open_to_work ?? true,
        avatar: candidate.profile_picture_url || candidate.profile_picture || null,
      };
      setHero(freshHero);
      setDraftHero(freshHero);

      const freshPrefs = {
        experience: candidate.total_experience_years || candidate.experience || "Fresher (0 Years)",
        jobType: candidate.job_type || "Full-time",
        workMode: candidate.work_mode || "On-site",
        notice: candidate.notice_period_days !== null && candidate.notice_period_days !== undefined
          ? (candidate.notice_period_days === 0 ? "Immediately" : `${candidate.notice_period_days} Days`)
          : "Immediately",
        salary: candidate.expected_ctc || "",
        available: candidate.is_open_to_work ?? true,
      };
      setPrefs(freshPrefs);
      setDraftPrefs(freshPrefs);

      const freshPersonal = {
        address: candidate.address || (candidate.area && candidate.city ? `${candidate.area}, ${candidate.city}` : candidate.city || ""),
        linkedin: candidate.linkedin || "",
        github: candidate.github || "",
        portfolio: candidate.portfolio || "",
      };
      setPersonal(freshPersonal);
      setDraftPersonal(freshPersonal);

      const parsedS = parseArray(candidate.skills);
      setSkills(parsedS);
      setDraftSkills(parsedS);

      const parsedL = parseArray(candidate.languages);
      setLangs(parsedL);
      setDraftLangs(parsedL);
    }

    if (educations) {
      setEduList(normalizeEduList(educations));
    }
    if (experiences) {
      setWorkList(normalizeWorkList(experiences));
    }
    if (certificates) {
      setCertList(normalizeCertList(certificates));
    }
    if (resume !== undefined) {
      setCurrentResume(resume);
    }
  }, [candidate, educations, experiences, certificates, resume]);

  /* ─ Profile Completion Calculation ─ */
  const completion = Math.min(100, Math.round([
    Boolean(hero.fullName),
    Boolean(hero.phone),
    Boolean(hero.email),
    Boolean(hero.city),
    Boolean(hero.jobTitle),
    Boolean(hero.bio),
    skills.length > 0,
    Boolean(prefs.experience),
    eduList.length > 0 || Boolean(user.education),
    workList.length > 0 || Boolean(currentResume),
  ].filter(Boolean).length / 10 * 100));

  /* ── Dynamic Handlers ── */

  // 1. Hero Save
  const saveHeroHandler = () => {
    setSavingHero(true);
    router.post(
      "/profile/update",
      {
        full_name: draftHero.fullName,
        job_title: draftHero.jobTitle,
        city: draftHero.city,
        phone: draftHero.phone,
        email: draftHero.email,
        bio: draftHero.bio,
        is_open_to_work: draftHero.available,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setHero(draftHero);
          setEditHero(false);
          setSavingHero(false);
          triggerToast("Profile information updated successfully!");
        },
        onError: () => {
          setSavingHero(false);
          triggerToast("Failed to update profile", "error");
        },
      }
    );
  };

  // Avatar Photo Upload
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    router.post("/profile/avatar", formData, {
      preserveScroll: true,
      onSuccess: () => {
        const previewUrl = URL.createObjectURL(file);
        setHero((h) => ({ ...h, avatar: previewUrl }));
        triggerToast("Profile photo updated!");
      },
      onError: () => {
        triggerToast("Failed to upload photo", "error");
      },
    });
  };

  // 2. Preferences Save
  const savePrefsHandler = () => {
    setSavingPrefs(true);
    router.post(
      "/profile/update",
      {
        total_experience_years: draftPrefs.experience,
        job_type: draftPrefs.jobType,
        work_mode: draftPrefs.workMode,
        notice: draftPrefs.notice,
        expected_ctc: draftPrefs.salary,
        is_open_to_work: draftPrefs.available,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setPrefs(draftPrefs);
          setEditPrefs(false);
          setSavingPrefs(false);
          triggerToast("Job preferences updated!");
        },
        onError: () => {
          setSavingPrefs(false);
          triggerToast("Failed to save preferences", "error");
        },
      }
    );
  };

  // 3. Skills & Languages Save
  const saveSkillsHandler = () => {
    setSavingSkills(true);
    router.post(
      "/profile/update",
      {
        skills: draftSkills,
        languages: draftLangs,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setSkills(draftSkills);
          setLangs(draftLangs);
          setEditSkills(false);
          setSavingSkills(false);
          triggerToast("Skills & languages saved!");
        },
        onError: () => {
          setSavingSkills(false);
          triggerToast("Failed to save skills", "error");
        },
      }
    );
  };

  // 4. Online Presence Save
  const savePersonalHandler = () => {
    setSavingPersonal(true);
    router.post(
      "/profile/update",
      {
        address: draftPersonal.address,
        linkedin: draftPersonal.linkedin,
        github: draftPersonal.github,
        portfolio: draftPersonal.portfolio,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setPersonal(draftPersonal);
          setEditPersonal(false);
          setSavingPersonal(false);
          triggerToast("Links & address updated!");
        },
        onError: () => {
          setSavingPersonal(false);
          triggerToast("Failed to save links", "error");
        },
      }
    );
  };

  // 5. Education Save / Delete
  const saveEduHandler = () => {
    setSavingEdu(true);
    router.post(
      "/profile/education",
      {
        id: addingEdu ? null : draftEdu.id,
        degree: draftEdu.level,
        institution: draftEdu.institute,
        field_of_study: draftEdu.field,
        start_year: draftEdu.startYear,
        end_year: draftEdu.endYear,
        percentage_or_cgpa: draftEdu.grade,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          if (addingEdu) {
            setEduList((prev) => [...prev, { ...draftEdu, id: Date.now() }]);
            setAddingEdu(false);
          } else {
            setEduList((prev) => prev.map((e) => (e.id === editEduId ? draftEdu : e)));
            setEditEduId(null);
          }
          setSavingEdu(false);
          triggerToast("Education qualification saved!");
        },
        onError: () => {
          setSavingEdu(false);
          triggerToast("Failed to save education", "error");
        },
      }
    );
  };

  const deleteEduHandler = (id) => {
    if (!confirm("Delete this education entry?")) return;
    router.delete(`/profile/education/${id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setEduList((prev) => prev.filter((e) => e.id !== id));
        triggerToast("Education removed!");
      },
      onError: () => {
        setEduList((prev) => prev.filter((e) => e.id !== id));
        triggerToast("Education removed!");
      },
    });
  };

  // 6. Work Experience Save / Delete
  const saveWorkHandler = () => {
    setSavingWork(true);
    router.post(
      "/profile/experience",
      {
        id: addingWork ? null : draftWork.id,
        designation: draftWork.title,
        company_name: draftWork.company,
        location: draftWork.location,
        start_date: draftWork.startDate,
        end_date: draftWork.endDate,
        is_current: draftWork.current,
        description: draftWork.desc,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          if (addingWork) {
            setWorkList((prev) => [...prev, { ...draftWork, id: Date.now() }]);
            setAddingWork(false);
          } else {
            setWorkList((prev) => prev.map((w) => (w.id === editWorkId ? draftWork : w)));
            setEditWorkId(null);
          }
          setSavingWork(false);
          triggerToast("Work experience saved!");
        },
        onError: () => {
          setSavingWork(false);
          triggerToast("Failed to save work experience", "error");
        },
      }
    );
  };

  const deleteWorkHandler = (id) => {
    if (!confirm("Delete this work experience entry?")) return;
    router.delete(`/profile/experience/${id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setWorkList((prev) => prev.filter((w) => w.id !== id));
        triggerToast("Work experience removed!");
      },
      onError: () => {
        setWorkList((prev) => prev.filter((w) => w.id !== id));
        triggerToast("Work experience removed!");
      },
    });
  };

  // 7. Certificate Save / Delete
  const saveCertHandler = () => {
    setSavingCert(true);
    router.post(
      "/profile/certificate",
      {
        id: addingCert ? null : draftCert.id,
        title: draftCert.name,
        issuing_organization: draftCert.issuer,
        issue_date: draftCert.issueDate,
        expiration_date: draftCert.expiry,
        credential_id: draftCert.credId,
        credential_url: draftCert.url,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          if (addingCert) {
            setCertList((prev) => [...prev, { ...draftCert, id: Date.now() }]);
            setAddingCert(false);
          } else {
            setCertList((prev) => prev.map((c) => (c.id === editCertId ? draftCert : c)));
            setEditCertId(null);
          }
          setSavingCert(false);
          triggerToast("Certificate saved!");
        },
        onError: () => {
          setSavingCert(false);
          triggerToast("Failed to save certificate", "error");
        },
      }
    );
  };

  const deleteCertHandler = (id) => {
    if (!confirm("Delete this certificate entry?")) return;
    router.delete(`/profile/certificate/${id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setCertList((prev) => prev.filter((c) => c.id !== id));
        triggerToast("Certificate removed!");
      },
      onError: () => {
        setCertList((prev) => prev.filter((c) => c.id !== id));
        triggerToast("Certificate removed!");
      },
    });
  };

  // 8. Resume Upload & Download
  const handleResumeFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    setUploadingResume(true);
    router.post("/profile/resume", formData, {
      preserveScroll: true,
      onSuccess: () => {
        setUploadingResume(false);
        const localBlob = URL.createObjectURL(file);
        const ext = file.name.split(".").pop().toLowerCase();
        setCurrentResume({
          title: file.name,
          updated_at: new Date().toISOString(),
          file_path: localBlob,
          file_type: ext,
        });
        setShowResumePreview(true);
        triggerToast("Resume uploaded successfully!");
      },
      onError: () => {
        setUploadingResume(false);
        triggerToast("Failed to upload resume file", "error");
      },
    });
  };

  const handleDownloadCV = () => {
    if (currentResume?.file_path) {
      window.location.href = "/profile/resume/download";
    } else {
      window.print();
    }
  };

  const getEduIcon = (level) => {
    if (level.includes("10th") || level.includes("12th") || level.includes("Pass")) return School;
    if (level.includes("Diploma") || level.includes("Certificate")) return BookOpen;
    return GraduationCap;
  };

  const getEduColor = (level) => {
    if (level.includes("PhD")) return "bg-purple-100 text-purple-700";
    if (level.includes("Master")) return "bg-blue-100 text-blue-700";
    if (level.includes("Bachelor") || level.includes("Degree")) return "bg-emerald-100 text-emerald-700";
    if (level.includes("12th") || level.includes("10th")) return "bg-amber-100 text-amber-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <HomepageLayout>
      <Head title={`${hero.fullName || "My Profile"} | Candidate Profile`} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Toast Alert */}
        {showToast && (
          <div
            className={`fixed top-20 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold text-white transition-all transform animate-in fade-in slide-in-from-top-4 ${
              toastType === "error" ? "bg-red-600" : "bg-emerald-600"
            }`}
          >
            {toastType === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">My Profile</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your verified information and job search preferences</p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                completion === 100
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : completion >= 60
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-red-50 text-red-600 border-red-200"
              }`}
            >
              {completion}% Complete
            </div>
            <button
              type="button"
              onClick={handleDownloadCV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download CV
            </button>
          </div>
        </div>

        {/* ── PROFILE OVERVIEW ── */}
        <div className="space-y-6">
            {/* Hero Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 relative overflow-hidden">
                <div className="absolute inset-0 opacity-15">
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="grid-pattern" width="28" height="28" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="white" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                  </svg>
                </div>
              </div>

              <div className="px-6 pb-6">
                {/* Top Row: Avatar (overlapping banner) + Edit Profile Action */}
                <div className="flex items-end justify-between -mt-14 sm:-mt-16 mb-4">
                  {/* Avatar with Camera Trigger */}
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-2xl sm:text-3xl font-black">
                      {hero.avatar ? (
                        <img
                          src={hero.avatar}
                          alt={hero.fullName || "Candidate"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (hero.fullName || "Candidate")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center shadow-md transition cursor-pointer"
                      title="Update avatar"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>

                  {/* Edit Profile Button (Visible in View Mode) */}
                  {!editHero && (
                    <button
                      type="button"
                      onClick={() => {
                        setDraftHero(hero);
                        setEditHero(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition shadow-xs cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 text-gray-500" /> Edit Profile
                    </button>
                  )}
                </div>

                {/* Candidate Info / Edit Form (Guaranteed below banner on white card) */}
                {editHero ? (
                  <div className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={draftHero.fullName}
                          onChange={(e) => setDraftHero({ ...draftHero, fullName: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="e.g. Suresh Saini"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Designation / Preferred Job Title</label>
                        <input
                          type="text"
                          value={draftHero.jobTitle}
                          onChange={(e) => setDraftHero({ ...draftHero, jobTitle: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="e.g. IT Executive, Software Developer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">City</label>
                        <select
                          value={draftHero.city}
                          onChange={(e) => setDraftHero({ ...draftHero, city: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">Select City</option>
                          {INDIA_CITIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number *</label>
                        <input
                          type="text"
                          value={draftHero.phone}
                          onChange={(e) => setDraftHero({ ...draftHero, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
                        <input
                          type="email"
                          value={draftHero.email}
                          onChange={(e) => setDraftHero({ ...draftHero, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">About Me / Bio</label>
                      <textarea
                        value={draftHero.bio}
                        onChange={(e) => setDraftHero({ ...draftHero, bio: e.target.value })}
                        rows={3}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        placeholder="Write a brief professional summary about your key skills and background..."
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="heroAvailable"
                        checked={draftHero.available}
                        onChange={(e) => setDraftHero({ ...draftHero, available: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="heroAvailable" className="text-xs font-semibold text-gray-700 cursor-pointer">
                        Mark profile as "Open to Work" (Visible to recruiters)
                      </label>
                    </div>

                    <SaveBtn
                      onSave={saveHeroHandler}
                      onCancel={() => {
                        setDraftHero(hero);
                        setEditHero(false);
                      }}
                      loading={savingHero}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                        {hero.fullName || "Candidate Name"}
                      </h2>
                      {hero.available && (
                        <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-2xs">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          Open to Work
                        </span>
                      )}
                    </div>

                    <p className="text-blue-600 text-sm sm:text-base font-bold">
                      {hero.jobTitle || <span className="text-gray-400 italic font-normal">Job Title not specified (e.g. IT Executive)</span>}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-xs sm:text-sm text-gray-600 font-medium">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        {hero.city ? `${hero.city}${hero.area ? `, ${hero.area}` : ""}` : "Location not set"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-blue-600" />
                        {hero.phone || "Phone not set"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-blue-600" />
                        {hero.email || "Email not set"}
                      </span>
                    </div>

                    {hero.bio ? (
                      <p className="text-sm text-gray-600 pt-2 leading-relaxed max-w-3xl">
                        {hero.bio}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 italic pt-2">
                        No bio added yet. Click "Edit Profile" to add an introduction.
                      </p>
                    )}
                  </div>
                )}

                {/* Profile Completion Bar */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-500 mb-2">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                      Profile Completion
                    </span>
                    <span className="text-gray-900 font-bold">{completion}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        completion === 100 ? "bg-emerald-500" : "bg-blue-600"
                      }`}
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Job Preferences */}
            <Section
              title="Job Preferences"
              icon={Briefcase}
              action={
                !editPrefs && (
                  <button
                    type="button"
                    onClick={() => {
                      setDraftPrefs(prefs);
                      setEditPrefs(true);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Preferences
                  </button>
                )
              }
            >
              {editPrefs ? (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Total Experience</label>
                      <select
                        value={draftPrefs.experience}
                        onChange={(e) => setDraftPrefs({ ...draftPrefs, experience: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        {EXP_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Job Type</label>
                      <select
                        value={draftPrefs.jobType}
                        onChange={(e) => setDraftPrefs({ ...draftPrefs, jobType: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        {["Full-time", "Part-time", "Contract", "Freelance", "Internship"].map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Work Mode</label>
                      <select
                        value={draftPrefs.workMode}
                        onChange={(e) => setDraftPrefs({ ...draftPrefs, workMode: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        {["On-site", "Remote", "Hybrid"].map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Notice Period</label>
                      <select
                        value={draftPrefs.notice}
                        onChange={(e) => setDraftPrefs({ ...draftPrefs, notice: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        {["Immediately", "1 Week", "2 Weeks", "1 Month", "2 Months", "3 Months"].map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Expected CTC (Annual)</label>
                      <input
                        type="text"
                        value={draftPrefs.salary}
                        onChange={(e) => setDraftPrefs({ ...draftPrefs, salary: e.target.value })}
                        placeholder="e.g. ₹5,00,000 or 3-5 LPA"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-6">
                      <button
                        type="button"
                        onClick={() => setDraftPrefs((p) => ({ ...p, available: !p.available }))}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          draftPrefs.available ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            draftPrefs.available ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className="text-xs font-semibold text-gray-700">Open to Opportunities</span>
                    </div>
                  </div>

                  <SaveBtn
                    onSave={savePrefsHandler}
                    onCancel={() => setEditPrefs(false)}
                    loading={savingPrefs}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { label: "Experience", value: prefs.experience },
                    { label: "Job Type", value: prefs.jobType },
                    { label: "Work Mode", value: prefs.workMode },
                    { label: "Notice Period", value: prefs.notice },
                    { label: "Expected CTC", value: prefs.salary || <span className="text-gray-400 italic">Not set</span> },
                    {
                      label: "Availability",
                      value: prefs.available ? (
                        <span className="text-emerald-700 font-semibold">Open to Work</span>
                      ) : (
                        <span className="text-gray-500">Not Looking</span>
                      ),
                    },
                  ].map((r) => (
                    <div key={r.label} className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{r.label}</p>
                      <p className="text-sm font-bold text-gray-800">{r.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Skills & Languages */}
            <Section
              title="Skills & Languages"
              icon={Star}
              action={
                !editSkills && (
                  <button
                    type="button"
                    onClick={() => {
                      setDraftSkills([...skills]);
                      setDraftLangs([...langs]);
                      setEditSkills(true);
                      setNewSkill("");
                      setNewLang("");
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Skills
                  </button>
                )
              }
            >
              {editSkills ? (
                <div className="space-y-6">
                  {/* Skills Editor */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">Technical & Job Skills</label>
                    <div className="flex flex-wrap gap-2 mb-3 min-h-[38px] p-2.5 bg-gray-50 rounded-xl border border-gray-200/70">
                      {draftSkills.map((s) => (
                        <SkillChip
                          key={s}
                          label={s}
                          onRemove={() => setDraftSkills((p) => p.filter((x) => x !== s))}
                        />
                      ))}
                      {draftSkills.length === 0 && (
                        <span className="text-xs text-gray-400 italic">No skills added. Type below and press Enter.</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const s = newSkill.trim();
                            if (s && !draftSkills.includes(s)) {
                              setDraftSkills((p) => [...p, s]);
                              setNewSkill("");
                            }
                          }
                        }}
                        placeholder="Add a skill (Press Enter or click +)"
                        className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const s = newSkill.trim();
                          if (s && !draftSkills.includes(s)) {
                            setDraftSkills((p) => [...p, s]);
                            setNewSkill("");
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Languages Editor */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">Languages Known</label>
                    <div className="flex flex-wrap gap-2 mb-3 min-h-[38px] p-2.5 bg-purple-50/40 rounded-xl border border-purple-100">
                      {draftLangs.map((l) => (
                        <span
                          key={l}
                          className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 text-xs px-3 py-1.5 rounded-full font-semibold"
                        >
                          {l}
                          <button
                            type="button"
                            onClick={() => setDraftLangs((p) => p.filter((x) => x !== l))}
                            className="hover:text-red-600 transition ml-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                      {draftLangs.length === 0 && (
                        <span className="text-xs text-gray-400 italic">No languages added. Type below and press Enter.</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newLang}
                        onChange={(e) => setNewLang(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const l = newLang.trim();
                            if (l && !draftLangs.includes(l)) {
                              setDraftLangs((p) => [...p, l]);
                              setNewLang("");
                            }
                          }
                        }}
                        placeholder="Add language (e.g. Hindi, English)"
                        className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const l = newLang.trim();
                          if (l && !draftLangs.includes(l)) {
                            setDraftLangs((p) => [...p, l]);
                            setNewLang("");
                          }
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <SaveBtn
                    onSave={saveSkillsHandler}
                    onCancel={() => setEditSkills(false)}
                    loading={savingSkills}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s) => (
                        <SkillChip key={s} label={s} />
                      ))}
                      {skills.length === 0 && (
                        <span className="text-xs text-gray-400 italic">No skills listed yet</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {langs.map((l) => (
                        <span
                          key={l}
                          className="bg-purple-50 text-purple-700 border border-purple-200 text-xs px-3 py-1.5 rounded-full font-semibold"
                        >
                          {l}
                        </span>
                      ))}
                      {langs.length === 0 && (
                        <span className="text-xs text-gray-400 italic">No languages listed yet</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Section>

            {/* Education (Multi-entry) */}
            <Section
              title="Education Qualifications"
              icon={GraduationCap}
              action={
                <button
                  type="button"
                  onClick={() => {
                    setDraftEdu({
                      id: 0,
                      level: "Bachelor's Degree",
                      institute: "",
                      field: "",
                      startYear: "",
                      endYear: "",
                      grade: "",
                    });
                    setAddingEdu(true);
                    setEditEduId(null);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Education
                </button>
              }
            >
              <div className="space-y-4">
                {eduList.map((edu) => {
                  const EduIcon = getEduIcon(edu.level);
                  const isEditing = editEduId === edu.id;
                  return (
                    <div key={edu.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-100 transition">
                      <div className="flex items-start gap-4 p-4 sm:p-5">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${getEduColor(
                            edu.level
                          )}`}
                        >
                          <EduIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-gray-900 text-sm">
                                {edu.institute || <span className="text-gray-400 italic">Institute not specified</span>}
                              </p>
                              <p className="text-xs text-blue-600 font-semibold mt-0.5">{edu.level}</p>
                              {edu.field && <p className="text-xs text-gray-500 mt-0.5">{edu.field}</p>}
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setDraftEdu({ ...edu });
                                  setEditEduId(edu.id);
                                  setAddingEdu(false);
                                }}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteEduHandler(edu.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                            {(edu.startYear || edu.endYear) && (
                              <span className="flex items-center gap-1 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                {edu.startYear} {edu.endYear ? `– ${edu.endYear}` : ""}
                              </span>
                            )}
                            {edu.grade && (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                                {edu.grade}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Inline Edit Form */}
                      {isEditing && (
                        <div className="p-4 sm:p-5 bg-blue-50/40 border-t border-blue-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2">
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Education Level *</label>
                              <select
                                value={draftEdu.level}
                                onChange={(e) => setDraftEdu({ ...draftEdu, level: e.target.value })}
                                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                              >
                                {EDU_LEVELS.map((l) => (
                                  <option key={l} value={l}>{l}</option>
                                ))}
                              </select>
                            </div>

                            <div className="sm:col-span-2">
                              <label className="text-xs font-semibold text-gray-600 block mb-1">School / College / University *</label>
                              <input
                                type="text"
                                value={draftEdu.institute}
                                onChange={(e) => setDraftEdu({ ...draftEdu, institute: e.target.value })}
                                placeholder="e.g. University of Rajasthan"
                                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Field / Stream / Major</label>
                              <input
                                type="text"
                                value={draftEdu.field}
                                onChange={(e) => setDraftEdu({ ...draftEdu, field: e.target.value })}
                                placeholder="e.g. Computer Science, Commerce, Arts"
                                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Start Year</label>
                              <input
                                type="text"
                                value={draftEdu.startYear}
                                onChange={(e) => setDraftEdu({ ...draftEdu, startYear: e.target.value })}
                                placeholder="e.g. 2018"
                                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">End / Passing Year</label>
                              <input
                                type="text"
                                value={draftEdu.endYear}
                                onChange={(e) => setDraftEdu({ ...draftEdu, endYear: e.target.value })}
                                placeholder="e.g. 2022"
                                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Grade / Percentage / CGPA</label>
                              <input
                                type="text"
                                value={draftEdu.grade}
                                onChange={(e) => setDraftEdu({ ...draftEdu, grade: e.target.value })}
                                placeholder="e.g. 75% or 8.0 CGPA"
                                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>
                          </div>

                          <SaveBtn
                            onSave={saveEduHandler}
                            onCancel={() => setEditEduId(null)}
                            loading={savingEdu}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add Education Form */}
                {addingEdu && (
                  <div className="p-4 sm:p-5 bg-blue-50/50 border border-blue-200 rounded-2xl">
                    <p className="text-sm font-bold text-gray-900 mb-3">Add Education Qualification</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Education Level *</label>
                        <select
                          value={draftEdu.level}
                          onChange={(e) => setDraftEdu({ ...draftEdu, level: e.target.value })}
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          {EDU_LEVELS.map((l) => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-600 block mb-1">School / College / University *</label>
                        <input
                          type="text"
                          value={draftEdu.institute}
                          onChange={(e) => setDraftEdu({ ...draftEdu, institute: e.target.value })}
                          placeholder="e.g. University / College name"
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Field / Stream / Major</label>
                        <input
                          type="text"
                          value={draftEdu.field}
                          onChange={(e) => setDraftEdu({ ...draftEdu, field: e.target.value })}
                          placeholder="e.g. Commerce, Computer Science"
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Start Year</label>
                        <input
                          type="text"
                          value={draftEdu.startYear}
                          onChange={(e) => setDraftEdu({ ...draftEdu, startYear: e.target.value })}
                          placeholder="e.g. 2018"
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">End / Passing Year</label>
                        <input
                          type="text"
                          value={draftEdu.endYear}
                          onChange={(e) => setDraftEdu({ ...draftEdu, endYear: e.target.value })}
                          placeholder="e.g. 2022"
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Grade / Percentage / CGPA</label>
                        <input
                          type="text"
                          value={draftEdu.grade}
                          onChange={(e) => setDraftEdu({ ...draftEdu, grade: e.target.value })}
                          placeholder="e.g. 78% or 8.2 CGPA"
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    <SaveBtn
                      onSave={saveEduHandler}
                      onCancel={() => setAddingEdu(false)}
                      loading={savingEdu}
                    />
                  </div>
                )}

                {eduList.length === 0 && !addingEdu && (
                  <div className="text-center py-8 px-4 border border-dashed border-gray-200 rounded-2xl">
                    <GraduationCap className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-semibold text-gray-700">No education qualifications added yet</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {user.education ? `Your registered status: ${user.education}. Add your school/college details.` : "Add your degree, diploma, or school background."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setAddingEdu(true)}
                      className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Qualification
                    </button>
                  </div>
                )}
              </div>
            </Section>

            {/* Work Experience (Multi-entry) */}
            <Section
              title="Work Experience"
              icon={Building2}
              action={
                <button
                  type="button"
                  onClick={() => {
                    setDraftWork({
                      id: 0,
                      title: "",
                      company: "",
                      location: "",
                      startDate: "",
                      endDate: "",
                      current: false,
                      desc: "",
                    });
                    setAddingWork(true);
                    setEditWorkId(null);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Experience
                </button>
              }
            >
              <div className="space-y-4">
                {workList.map((work, idx) => {
                  const isEditing = editWorkId === work.id;
                  const companyColors = [
                    "bg-blue-600", "bg-indigo-600", "bg-purple-600",
                    "bg-teal-600", "bg-emerald-600", "bg-amber-600",
                  ];
                  const colorClass = companyColors[idx % companyColors.length];

                  return (
                    <div key={work.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-100 transition">
                      <div className="flex gap-4 p-4 sm:p-5">
                        <div
                          className={`w-11 h-11 ${colorClass} rounded-xl flex items-center justify-center text-white text-xs font-bold tracking-wider shrink-0 shadow-xs`}
                        >
                          {(work.company || "CO").slice(0, 2).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-gray-900 text-sm">
                                {work.title || <span className="text-gray-400 italic">Title not specified</span>}
                              </p>
                              <p className="text-xs text-gray-600 font-semibold mt-0.5">
                                {work.company}
                                {work.location ? ` · ${work.location}` : ""}
                              </p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setDraftWork({ ...work });
                                  setEditWorkId(work.id);
                                  setAddingWork(false);
                                }}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteWorkHandler(work.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {(work.startDate || work.endDate || work.current) && (
                            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1.5 font-medium">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {work.startDate}
                              {work.current ? " – Present" : work.endDate ? ` – ${work.endDate}` : ""}
                              {work.current && (
                                <span className="ml-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  Current Role
                                </span>
                              )}
                            </p>
                          )}

                          {work.desc && (
                            <p className="text-sm text-gray-600 mt-2 leading-relaxed whitespace-pre-line">
                              {work.desc}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Inline Work Edit Form */}
                      {isEditing && (
                        <div className="p-4 sm:p-5 bg-purple-50/40 border-t border-purple-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2">
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Job Title *</label>
                              <input
                                type="text"
                                value={draftWork.title}
                                onChange={(e) => setDraftWork({ ...draftWork, title: e.target.value })}
                                placeholder="e.g. Sales Executive, Software Developer"
                                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Company Name *</label>
                              <input
                                type="text"
                                value={draftWork.company}
                                onChange={(e) => setDraftWork({ ...draftWork, company: e.target.value })}
                                placeholder="e.g. Company name"
                                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Location</label>
                              <input
                                type="text"
                                value={draftWork.location}
                                onChange={(e) => setDraftWork({ ...draftWork, location: e.target.value })}
                                placeholder="e.g. Jaipur, Rajasthan"
                                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Start Date</label>
                              <input
                                type="text"
                                value={draftWork.startDate}
                                onChange={(e) => setDraftWork({ ...draftWork, startDate: e.target.value })}
                                placeholder="e.g. Jan 2022 or 2022-01-01"
                                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">End Date</label>
                              <input
                                type="text"
                                value={draftWork.endDate}
                                onChange={(e) => setDraftWork({ ...draftWork, endDate: e.target.value })}
                                placeholder="e.g. Dec 2023 or Present"
                                disabled={draftWork.current}
                                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                              />
                            </div>

                            <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                              <input
                                type="checkbox"
                                id={`current-${work.id}`}
                                checked={draftWork.current}
                                onChange={(e) =>
                                  setDraftWork({
                                    ...draftWork,
                                    current: e.target.checked,
                                    endDate: e.target.checked ? "" : draftWork.endDate,
                                  })
                                }
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                              />
                              <label htmlFor={`current-${work.id}`} className="text-xs font-semibold text-gray-700 cursor-pointer">
                                I currently work here
                              </label>
                            </div>

                            <div className="sm:col-span-2">
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Responsibilities & Achievements</label>
                              <textarea
                                value={draftWork.desc}
                                onChange={(e) => setDraftWork({ ...draftWork, desc: e.target.value })}
                                rows={3}
                                placeholder="Describe your responsibilities, tasks, and achievements..."
                                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                              />
                            </div>
                          </div>

                          <SaveBtn
                            onSave={saveWorkHandler}
                            onCancel={() => setEditWorkId(null)}
                            loading={savingWork}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add Work Form */}
                {addingWork && (
                  <div className="p-4 sm:p-5 bg-purple-50/50 border border-purple-200 rounded-2xl">
                    <p className="text-sm font-bold text-gray-900 mb-3">Add Work Experience</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Job Title *</label>
                        <input
                          type="text"
                          value={draftWork.title}
                          onChange={(e) => setDraftWork({ ...draftWork, title: e.target.value })}
                          placeholder="e.g. Marketing Executive, Developer"
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Company Name *</label>
                        <input
                          type="text"
                          value={draftWork.company}
                          onChange={(e) => setDraftWork({ ...draftWork, company: e.target.value })}
                          placeholder="e.g. Tech Solution Pvt Ltd"
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Location</label>
                        <input
                          type="text"
                          value={draftWork.location}
                          onChange={(e) => setDraftWork({ ...draftWork, location: e.target.value })}
                          placeholder="e.g. Jaipur, India"
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Start Date</label>
                        <input
                          type="text"
                          value={draftWork.startDate}
                          onChange={(e) => setDraftWork({ ...draftWork, startDate: e.target.value })}
                          placeholder="e.g. 2022-01 or Jan 2022"
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">End Date</label>
                        <input
                          type="text"
                          value={draftWork.endDate}
                          onChange={(e) => setDraftWork({ ...draftWork, endDate: e.target.value })}
                          placeholder="e.g. 2023-12"
                          disabled={draftWork.current}
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="addWorkCurrent"
                          checked={draftWork.current}
                          onChange={(e) =>
                            setDraftWork({
                              ...draftWork,
                              current: e.target.checked,
                              endDate: e.target.checked ? "" : draftWork.endDate,
                            })
                          }
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="addWorkCurrent" className="text-xs font-semibold text-gray-700 cursor-pointer">
                          I currently work here
                        </label>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Description</label>
                        <textarea
                          value={draftWork.desc}
                          onChange={(e) => setDraftWork({ ...draftWork, desc: e.target.value })}
                          rows={3}
                          placeholder="Describe your role, key responsibilities, and achievements..."
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                      </div>
                    </div>

                    <SaveBtn
                      onSave={saveWorkHandler}
                      onCancel={() => setAddingWork(false)}
                      loading={savingWork}
                    />
                  </div>
                )}

                {workList.length === 0 && !addingWork && (
                  <div className="text-center py-8 px-4 border border-dashed border-gray-200 rounded-2xl">
                    <Building2 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-semibold text-gray-700">No work experience added yet</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {prefs.experience.includes("Fresher") ? "Marked as Fresher. If you completed internships or part-time roles, add them here." : "Add your previous companies and job roles."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setAddingWork(true)}
                      className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Experience
                    </button>
                  </div>
                )}
              </div>
            </Section>

            {/* Certifications & Awards */}
            <Section
              title="Certifications & Awards"
              icon={Award}
              action={
                <button
                  type="button"
                  onClick={() => {
                    setDraftCert({
                      id: 0,
                      name: "",
                      issuer: "",
                      issueDate: "",
                      expiry: "",
                      credId: "",
                      url: "",
                    });
                    setAddingCert(true);
                    setEditCertId(null);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Certificate
                </button>
              }
            >
              <div className="space-y-3">
                {certList.map((cert) => {
                  const isEditing = editCertId === cert.id;
                  return (
                    <div key={cert.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-100 transition">
                      <div className="flex items-start gap-4 p-4 sm:p-5">
                        <div className="w-11 h-11 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{cert.name}</p>
                              <p className="text-xs text-gray-500 font-semibold mt-0.5">{cert.issuer}</p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setDraftCert({ ...cert });
                                  setEditCertId(cert.id);
                                  setAddingCert(false);
                                }}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteCertHandler(cert.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500 font-medium">
                            {cert.issueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                Issued: {cert.issueDate}
                              </span>
                            )}
                            {cert.expiry && (
                              <span className="text-gray-400">Expires: {cert.expiry}</span>
                            )}
                            {cert.credId && (
                              <span className="text-blue-600 font-medium">ID: {cert.credId}</span>
                            )}
                          </div>

                          {cert.url && (
                            <a
                              href={cert.url.startsWith("http") ? cert.url : `https://${cert.url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold mt-2 underline"
                            >
                              Verify Certificate <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Inline Edit Form */}
                      {isEditing && (
                        <div className="p-4 sm:p-5 bg-amber-50/40 border-t border-amber-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2">
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Certificate Name *</label>
                              <input
                                type="text"
                                value={draftCert.name}
                                onChange={(e) => setDraftCert({ ...draftCert, name: e.target.value })}
                                placeholder="e.g. Certified Data Analyst"
                                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Issuing Organization *</label>
                              <input
                                type="text"
                                value={draftCert.issuer}
                                onChange={(e) => setDraftCert({ ...draftCert, issuer: e.target.value })}
                                placeholder="e.g. Google, Coursera, NIIT"
                                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Issue Date</label>
                              <input
                                type="text"
                                value={draftCert.issueDate}
                                onChange={(e) => setDraftCert({ ...draftCert, issueDate: e.target.value })}
                                placeholder="e.g. 2023-05"
                                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Expiry Date</label>
                              <input
                                type="text"
                                value={draftCert.expiry}
                                onChange={(e) => setDraftCert({ ...draftCert, expiry: e.target.value })}
                                placeholder="e.g. 2026-05 or No Expiry"
                                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Credential ID</label>
                              <input
                                type="text"
                                value={draftCert.credId}
                                onChange={(e) => setDraftCert({ ...draftCert, credId: e.target.value })}
                                placeholder="e.g. CERT-12345"
                                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Verification URL</label>
                              <input
                                type="text"
                                value={draftCert.url}
                                onChange={(e) => setDraftCert({ ...draftCert, url: e.target.value })}
                                placeholder="https://verify.example.com/certificate/123"
                                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>
                          </div>

                          <SaveBtn
                            onSave={saveCertHandler}
                            onCancel={() => setEditCertId(null)}
                            loading={savingCert}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add Certificate Form */}
                {addingCert && (
                  <div className="p-4 sm:p-5 bg-amber-50/50 border border-amber-200 rounded-2xl">
                    <p className="text-sm font-bold text-gray-900 mb-3">Add Certificate</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Certificate Name *</label>
                        <input
                          type="text"
                          value={draftCert.name}
                          onChange={(e) => setDraftCert({ ...draftCert, name: e.target.value })}
                          placeholder="e.g. Python Developer Certificate"
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Issuing Organization *</label>
                        <input
                          type="text"
                          value={draftCert.issuer}
                          onChange={(e) => setDraftCert({ ...draftCert, issuer: e.target.value })}
                          placeholder="e.g. IBM, Microsoft, Coursera"
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Issue Date</label>
                        <input
                          type="text"
                          value={draftCert.issueDate}
                          onChange={(e) => setDraftCert({ ...draftCert, issueDate: e.target.value })}
                          placeholder="e.g. 2023-01"
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={draftCert.expiry}
                          onChange={(e) => setDraftCert({ ...draftCert, expiry: e.target.value })}
                          placeholder="e.g. No Expiry"
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Credential ID</label>
                        <input
                          type="text"
                          value={draftCert.credId}
                          onChange={(e) => setDraftCert({ ...draftCert, credId: e.target.value })}
                          placeholder="e.g. ID-9876"
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Verification URL</label>
                        <input
                          type="text"
                          value={draftCert.url}
                          onChange={(e) => setDraftCert({ ...draftCert, url: e.target.value })}
                          placeholder="https://verify.example.com/..."
                          className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    <SaveBtn
                      onSave={saveCertHandler}
                      onCancel={() => setAddingCert(false)}
                      loading={savingCert}
                    />
                  </div>
                )}

                {certList.length === 0 && !addingCert && (
                  <div className="text-center py-8 px-4 border border-dashed border-gray-200 rounded-2xl">
                    <Award className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-semibold text-gray-700">No certifications added yet</p>
                    <p className="text-xs text-gray-400 mt-0.5">Showcase professional licenses, course completions, and awards.</p>
                    <button
                      type="button"
                      onClick={() => setAddingCert(true)}
                      className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Certificate
                    </button>
                  </div>
                )}
              </div>
            </Section>

            {/* Online Presence & Links */}
            <Section
              title="Online Presence & Links"
              icon={Globe}
              action={
                !editPersonal && (
                  <button
                    type="button"
                    onClick={() => {
                      setDraftPersonal(personal);
                      setEditPersonal(true);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Links
                  </button>
                )
              }
            >
              {editPersonal ? (
                <div className="space-y-4">
                  {[
                    { label: "Portfolio / Personal Website", field: "portfolio", icon: Globe, placeholder: "https://yourportfolio.dev" },
                    { label: "LinkedIn Profile", field: "linkedin", icon: Linkedin, placeholder: "https://linkedin.com/in/username" },
                    { label: "GitHub Profile", field: "github", icon: Github, placeholder: "https://github.com/username" },
                    { label: "Current Address", field: "address", icon: MapPin, placeholder: "Area, City, State" },
                  ].map((f) => (
                    <div key={f.field}>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                      <div className="relative">
                        <f.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={draftPersonal[f.field]}
                          onChange={(e) => setDraftPersonal({ ...draftPersonal, [f.field]: e.target.value })}
                          placeholder={f.placeholder}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  ))}

                  <SaveBtn
                    onSave={savePersonalHandler}
                    onCancel={() => setEditPersonal(false)}
                    loading={savingPersonal}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Portfolio", value: personal.portfolio, icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "LinkedIn", value: personal.linkedin, icon: Linkedin, color: "text-blue-700", bg: "bg-blue-50" },
                    { label: "GitHub", value: personal.github, icon: Github, color: "text-gray-900", bg: "bg-gray-100" },
                    { label: "Address", value: personal.address, icon: MapPin, color: "text-rose-600", bg: "bg-rose-50" },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-100 bg-gray-50/50">
                      <div className={`w-9 h-9 ${l.bg} rounded-xl flex items-center justify-center shrink-0`}>
                        <l.icon className={`w-4 h-4 ${l.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{l.label}</p>
                        {l.value ? (
                          l.label === "Address" ? (
                            <p className="text-sm font-semibold text-gray-800 truncate">{l.value}</p>
                          ) : (
                            <a
                              href={l.value.startsWith("http") ? l.value : `https://${l.value}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 truncate"
                            >
                              <span className="truncate">{l.value}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          )
                        ) : (
                          <span className="text-sm text-gray-400 italic">Not added yet</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* CV / Resume Section with Compact In-Page Document Preview */}
            <Section
              title="CV / Resume"
              icon={FileText}
              action={
                currentResume && resumeUrl ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowResumePreview(!showResumePreview)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition px-2.5 py-1 rounded-lg hover:bg-blue-50 cursor-pointer"
                    >
                      {showResumePreview ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" /> Hide Preview
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Show Preview
                        </>
                      )}
                    </button>
                  </div>
                ) : null
              }
            >
              <div className="space-y-3">
                {/* Resume Status Card & Action Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 p-4 bg-gradient-to-r from-blue-50/60 via-indigo-50/30 to-blue-50/20 border border-blue-200/80 rounded-2xl shadow-xs">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Mini Document Paper Thumbnail */}
                    {resumeUrl && isPdf ? (
                      <div
                        onClick={() => setShowResumePreview(!showResumePreview)}
                        className="relative w-12 sm:w-14 h-16 sm:h-18 bg-white rounded-lg border border-blue-200 shadow-2xs overflow-hidden shrink-0 group cursor-pointer hover:border-blue-400 transition"
                        title="Click to toggle in-page preview"
                      >
                        <iframe
                          src={`${resumeUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                          className="w-[200%] h-[200%] origin-top-left scale-50 border-0 pointer-events-none bg-white"
                          title="Resume Thumbnail"
                        />
                        <div className="absolute inset-0 bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-3.5 h-3.5 drop-shadow" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-11 h-11 bg-white rounded-xl shadow-xs border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {currentResume?.title || "No resume uploaded yet"}
                        </p>
                        {currentResume && (
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active CV
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">
                        {currentResume?.updated_at
                          ? `Updated: ${new Date(currentResume.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                          : "Upload your resume in PDF, DOC, or DOCX format (Max 10MB)"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto flex-wrap">
                    {resumeUrl && (
                      <>
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1 px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 transition shadow-2xs"
                          title="Open in full tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-gray-500" /> Full Tab
                        </a>

                        <button
                          type="button"
                          onClick={handleDownloadCV}
                          className="flex items-center justify-center gap-1 px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 transition shadow-2xs cursor-pointer"
                          title="Download file"
                        >
                          <Download className="w-3.5 h-3.5 text-gray-500" /> Download
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => resumeInputRef.current?.click()}
                      disabled={uploadingResume}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                    >
                      {uploadingResume ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      {currentResume ? "Replace CV" : "Upload Resume"}
                    </button>

                    <input
                      ref={resumeInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Compact In-Page Live Preview Viewport */}
                {currentResume && resumeUrl && showResumePreview && (
                  <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden transition-all">
                    {/* Compact Top Bar */}
                    <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50/90 border-b border-gray-200 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        <span className="text-[11px] font-bold text-gray-800">Mini Preview</span>
                        <span className="text-[9px] font-mono uppercase bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.2 rounded font-semibold">
                          {isPdf ? "PDF" : (currentResume.file_type || "DOC")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewExpanded(!previewExpanded)}
                          className="text-gray-600 hover:text-gray-900 font-semibold px-2 py-0.5 rounded hover:bg-gray-200/60 inline-flex items-center gap-1 text-[11px] cursor-pointer"
                        >
                          {previewExpanded ? (
                            <>
                              <Minimize2 className="w-3 h-3" /> Compact
                            </>
                          ) : (
                            <>
                              <Maximize2 className="w-3 h-3" /> Expand
                            </>
                          )}
                        </button>
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 text-[11px] ml-1"
                        >
                          Full Tab <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* PDF Embedded Viewport - Compact & Lightweight */}
                    {isPdf ? (
                      <div className={`relative w-full ${previewExpanded ? "h-[380px] sm:h-[420px]" : "h-[190px] sm:h-[220px]"} bg-gray-100 transition-all duration-200 flex items-center justify-center`}>
                        <object
                          data={`${resumeUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                          type="application/pdf"
                          className="w-full h-full border-0 bg-white"
                        >
                          <iframe
                            src={`${resumeUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                            className="w-full h-full border-0 bg-white"
                            title="Resume Document Preview"
                          />
                        </object>
                      </div>
                    ) : (
                      /* Word or Other Document Fallback View */
                      <div className="p-4 bg-gray-50 text-center flex items-center justify-center gap-3">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <span className="text-xs text-gray-700 font-medium truncate max-w-xs">{currentResume.title}</span>
                        <button
                          type="button"
                          onClick={handleDownloadCV}
                          className="px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> Download
                        </button>
                      </div>
                    )}

                    {/* Compact Bottom Bar */}
                    <div className="px-3 py-1 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
                      <span className="flex items-center gap-1 font-medium truncate">
                        <FileCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{currentResume.title}</span>
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowResumePreview(false)}
                          className="text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
                        >
                          Hide
                        </button>
                        <a
                          href="/profile/resume/download"
                          className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-0.5 ml-1"
                        >
                          <Download className="w-3 h-3" /> Download
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Section>
          </div>
        </div>
      </HomepageLayout>
    );
  }
