import { useState, useEffect } from "react";
import { Link, usePage, router, Head } from "@inertiajs/react";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  Briefcase,
  MapPin,
  DollarSign,
  User,
  Mail,
  Phone,
  FileText,
  Globe,
  Linkedin,
  Send,
  Building2,
  Calendar,
  Clock,
  Edit3,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Check,
  Users,
  Award,
  Tag,
  CalendarDays,
  FileCheck,
  GraduationCap,
  Plus,
  X,
  ExternalLink,
} from "lucide-react";
import HomepageLayout from "@/Layouts/HomepageLayout";

const steps = ["Personal Info", "Professional Experience", "Qualifications & Resume", "Review & Submit"];

export default function JobApply({ jobDataFromBackend, candidate, loggedIn }) {
  const { props } = usePage();

  const job = jobDataFromBackend || {
    id: "1",
    uuid: "1",
    title: "Senior React Developer",
    company: "TechCorp Partner",
    location: "Jaipur",
    salary: "INR 80K - 120K",
    type: "Full-time",
    logo: "TC",
    color: "bg-blue-600",
    openings: 3,
    experience: "2-4 Years",
    shift_timing: "Day Shift",
    working_days: "5 Days (Mon-Fri)",
    description: "Looking for an experienced frontend developer to build responsive web applications using React and Tailwind.",
    skills: ["React", "JavaScript", "Tailwind CSS", "Redux", "REST APIs"],
    requirements: ["2+ years React experience", "TypeScript proficiency", "Git workflow"]
  };

  const jobKey = job.uuid || job.id;

  const rawRequirements = job.requirements || job.qualifications || [];
  const requirementsList = Array.isArray(rawRequirements)
    ? rawRequirements
    : typeof rawRequirements === "string"
      ? (rawRequirements.includes("\n")
          ? rawRequirements.split("\n")
          : rawRequirements.split(",")
        ).map((s) => s.trim()).filter(Boolean)
      : [];

  const rawSkills = job.skills || [];
  const jobSkillsList = Array.isArray(rawSkills)
    ? rawSkills
    : typeof rawSkills === "string"
      ? (rawSkills.includes(",") ? rawSkills.split(",") : rawSkills.split("\n"))
          .map((s) => s.trim()).filter(Boolean)
      : [];

  // Candidate Resumes from Profile
  const candidateResumes = candidate?.resumes || [];
  const defaultResume =
    candidate?.default_resume ||
    candidateResumes.find((r) => r.is_default) ||
    candidateResumes[0] ||
    null;

  // Candidate Profile Skills Initial List
  const profileSkills = Array.isArray(candidate?.skills)
    ? candidate.skills
    : typeof candidate?.skills === "string" && candidate.skills.trim()
    ? (candidate.skills.includes(",") ? candidate.skills.split(",") : [candidate.skills]).map((s) => s.trim()).filter(Boolean)
    : [];

  // Candidate Initial Education
  const initialEdu = candidate?.educations?.[0] || null;
  const initialDegree = initialEdu?.degree || candidate?.education || "";
  const initialInstitution = initialEdu?.institution || "";

  const [step, setStep] = useState(0);
  const [showForm, setShowForm] = useState(loggedIn);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginPopup, setLoginPopup] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [errors, setErrors] = useState({});

  // Skill input state
  const [newSkillInput, setNewSkillInput] = useState("");

  // Resume selection mode: "profile" (use existing) or "upload" (upload new file)
  const [resumeMode, setResumeMode] = useState(defaultResume ? "profile" : "upload");

  // Capture referrer URL to redirect back to the page where they clicked "Apply"
  const [previousUrl, setPreviousUrl] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("apply_from_url_" + jobKey);
      if (stored && !stored.includes("/apply/")) {
        return stored;
      }
      const ref = document.referrer;
      if (ref && !ref.includes("/apply/") && (ref.startsWith(window.location.origin) || ref.startsWith("/"))) {
        return ref;
      }
    }
    return "/jobs";
  });

  // Guard against reopening the apply process via the browser Back button
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("just_applied_" + jobKey)) {
        window.location.replace(previousUrl || "/jobs");
        return;
      }

      const ref = document.referrer;
      if (ref && !ref.includes("/apply/") && (ref.startsWith(window.location.origin) || ref.startsWith("/"))) {
        sessionStorage.setItem("apply_from_url_" + jobKey, ref);
        setPreviousUrl(ref);
      }

      const handlePageShow = (e) => {
        if (e.persisted || sessionStorage.getItem("just_applied_" + jobKey)) {
          window.location.replace(previousUrl || "/jobs");
        }
      };

      window.addEventListener("pageshow", handlePageShow);
      return () => window.removeEventListener("pageshow", handlePageShow);
    }
  }, [jobKey, previousUrl]);

  useEffect(() => {
    if (loggedIn) {
      setShowForm(true);
    }
  }, [loggedIn]);

  const [form, setForm] = useState({
    fullName: candidate?.full_name || candidate?.name || "",
    email: candidate?.email || "",
    phone: candidate?.phone || "",
    city: candidate?.city || "",

    currentTitle: candidate?.current_title || candidate?.job_title || "",
    experience: candidate?.experience || candidate?.total_experience_years || "",
    currentSalary: candidate?.current_salary || candidate?.current_ctc ? String(candidate?.current_salary || candidate?.current_ctc).replace(/\D/g, "").slice(0, 9) : "",
    expectedSalary: candidate?.expected_ctc ? String(candidate.expected_ctc).replace(/\D/g, "").slice(0, 9) : "",
    lastCompany: candidate?.current_company || "",
    notice: candidate?.notice_period || candidate?.notice_period_days || "",
    lastWorkingDay: "",

    // Education Qualifications
    qualification: initialDegree ? (initialDegree.toLowerCase().includes("b.") || initialDegree.toLowerCase().includes("bachelor") ? "Graduate / Bachelor's" : "Graduate / Bachelor's") : "Graduate / Bachelor's",
    educationDegree: initialDegree,
    educationInstitute: initialInstitution,

    // Skills
    skills: profileSkills.length > 0 ? profileSkills : jobSkillsList.slice(0, 3),

    // Resumes
    selectedResumeId: defaultResume ? String(defaultResume.id || defaultResume.uuid) : "",
    cvFile: null,

    portfolio: candidate?.portfolio || "",
    linkedin: candidate?.linkedin || "",

    whyApply: "",
    coverLetter: "",
  });

  const update = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const clearError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Determine if candidate is a fresher
  const isFresher = form.experience === "Fresher" || form.experience === "Fresh Graduate";

  // Determine if candidate is currently serving notice period
  const isServingNotice = form.notice === "Currently Serving Notice" || form.notice === "Serving Notice";

  // Handle experience selection change
  const handleExperienceChange = (exp) => {
    update("experience", exp);
    clearError("experience");

    // If candidate chooses Fresher, reset salary & experience specific fields
    if (exp === "Fresher" || exp === "Fresh Graduate") {
      setForm((p) => ({
        ...p,
        experience: exp,
        currentSalary: "",
        lastCompany: "",
        notice: "",
        lastWorkingDay: "",
      }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.currentSalary;
        delete next.lastCompany;
        delete next.notice;
        delete next.lastWorkingDay;
        return next;
      });
    }
  };

  // Handle Notice Period change: only show and keep lastWorkingDay when Currently Serving Notice
  const handleNoticeChange = (val) => {
    update("notice", val);
    clearError("notice");

    if (val !== "Currently Serving Notice" && val !== "Serving Notice") {
      update("lastWorkingDay", "");
      clearError("lastWorkingDay");
    }
  };

  // Salary numeric input with strict 9-digit limit (up to ₹99,99,99,999)
  const handleSalaryChange = (field, val) => {
    const numericOnly = val.replace(/\D/g, "").slice(0, 9);
    update(field, numericOnly);
    clearError(field);
  };

  // Add Skill
  const handleAddSkill = (skillText) => {
    const trimmed = (skillText || newSkillInput).trim();
    if (!trimmed) return;
    if (!form.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setForm((p) => ({ ...p, skills: [...p.skills, trimmed] }));
    }
    setNewSkillInput("");
  };

  // Remove Skill
  const handleRemoveSkill = (skillToRemove) => {
    setForm((p) => ({ ...p, skills: p.skills.filter((s) => s !== skillToRemove) }));
  };

  // Comprehensive Step Validation
  const validateStep = (currentStep) => {
    const errs = {};

    if (currentStep === 0) {
      if (!form.fullName || !form.fullName.trim()) {
        errs.fullName = "Full name is required";
      } else if (form.fullName.trim().length < 2) {
        errs.fullName = "Full name must be at least 2 characters";
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!form.email || !form.email.trim()) {
        errs.email = "Email address is required";
      } else if (!emailRegex.test(form.email.trim())) {
        errs.email = "Please enter a valid email address (e.g. name@example.com)";
      }

      const phoneDigits = (form.phone || "").replace(/\D/g, "");
      if (!form.phone || !form.phone.trim()) {
        errs.phone = "Phone number is required";
      } else if (phoneDigits.length < 10) {
        errs.phone = "Phone number must have at least 10 digits";
      }

      if (!form.city || !form.city.trim()) {
        errs.city = "Please select or enter your city";
      }
    }

    if (currentStep === 1) {
      if (!form.experience) {
        errs.experience = "Please select your experience level";
      }

      if (!isFresher) {
        if (!form.currentTitle || !form.currentTitle.trim()) {
          errs.currentTitle = "Current or last job title is required";
        }
        if (!form.lastCompany || !form.lastCompany.trim()) {
          errs.lastCompany = "Last / Current company name is required";
        }

        // Salary Limit Validations (Min ₹10,000 - Max ₹5 Crore)
        const currNum = Number(form.currentSalary);
        if (!form.currentSalary || form.currentSalary.trim() === "") {
          errs.currentSalary = "Current salary is required (numbers only)";
        } else if (currNum < 10000) {
          errs.currentSalary = "Current annual salary must be at least ₹10,000";
        } else if (currNum > 50000000) {
          errs.currentSalary = "Current annual salary cannot exceed ₹5,00,00,000 (5 Crore)";
        }

        const expNum = Number(form.expectedSalary);
        if (!form.expectedSalary || form.expectedSalary.trim() === "") {
          errs.expectedSalary = "Expected salary is required (numbers only)";
        } else if (expNum < 10000) {
          errs.expectedSalary = "Expected annual salary must be at least ₹10,000";
        } else if (expNum > 50000000) {
          errs.expectedSalary = "Expected annual salary cannot exceed ₹5,00,00,000 (5 Crore)";
        }

        if (!form.notice || !form.notice.trim()) {
          errs.notice = "Please select notice period";
        }

        // ONLY validate lastWorkingDay IF the candidate is currently serving notice!
        if (isServingNotice && (!form.lastWorkingDay || !form.lastWorkingDay.trim())) {
          errs.lastWorkingDay = "Last working day is required when serving notice";
        }
      } else {
        // Fresher: Expected salary is optional but if filled, must be between limits
        if (form.expectedSalary) {
          const expNum = Number(form.expectedSalary);
          if (expNum < 10000) {
            errs.expectedSalary = "Expected salary must be at least ₹10,000";
          } else if (expNum > 50000000) {
            errs.expectedSalary = "Expected salary cannot exceed ₹5,00,00,000 (5 Crore)";
          }
        }
      }
    }

    if (currentStep === 2) {
      if (!form.qualification) {
        errs.qualification = "Please select highest qualification";
      }

      if (!form.whyApply || !form.whyApply.trim()) {
        errs.whyApply = "Please explain why you want this job";
      } else if (form.whyApply.trim().length < 10) {
        errs.whyApply = "Please write at least 10 characters";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();

    if (!validateStep(step)) {
      return;
    }

    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 120, behavior: "smooth" });
      return;
    }

    // Step 3: Final validation check across all steps
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      return;
    }

    setIsSubmitting(true);

    router.post(`/apply/${job.id}`, form, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("just_applied_" + jobKey, "true");
          window.history.replaceState(null, "", previousUrl);
        }
        setSubmitted(true);
        setIsSubmitting(false);
      },
      onError: (backendErrors) => {
        setErrors(backendErrors || {});
        setIsSubmitting(false);
      },
      onFinish: () => {
        setIsSubmitting(false);
      },
    });
  };

  // 5-second countdown timer and automatic redirect after submission
  useEffect(() => {
    if (!submitted) return;

    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.replace(previousUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted, previousUrl]);

  // Selected Profile Resume object lookup
  const selectedProfileResume = candidateResumes.find(
    (r) => String(r.id) === String(form.selectedResumeId) || String(r.uuid) === String(form.selectedResumeId)
  );

  // Success Screen with 5-Second Hold & Live Countdown
  if (submitted) {
    return (
      <HomepageLayout>
        <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
          <div className="text-center max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-green-100/50 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-blue-100/50 rounded-full blur-2xl pointer-events-none" />

            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <h2 className="text-2xl font-black text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-sm text-gray-600 mb-3">
              Your application for <span className="font-bold text-gray-900">{job.title}</span> at{" "}
              <span className="font-bold text-blue-600">{job.company}</span> has been successfully saved.
            </p>

            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              The employer's recruitment team will review your credentials and contact you directly.
            </p>

            {/* 5-Second Hold Countdown Banner */}
            <div className="mb-6 p-4 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md animate-pulse">
                  {countdown}s
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-900">Redirecting to previous page...</p>
                  <p className="text-[11px] text-blue-600">Holding screen for 5 seconds</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => window.location.replace(previousUrl)}
                className="px-3 py-1.5 bg-white text-blue-600 hover:bg-blue-100/60 font-semibold text-xs rounded-xl border border-blue-200 shadow-2xs transition cursor-pointer"
              >
                Go Now
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => window.location.replace(previousUrl)}
                className="w-full px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 transition cursor-pointer"
              >
                Return to Job Post
              </button>
              <Link
                href="/jobs"
                className="w-full px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition text-center inline-flex items-center justify-center"
              >
                Browse All Jobs
              </Link>
            </div>
          </div>
        </div>
      </HomepageLayout>
    );
  }

  const jobPostingSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description || job.title,
    datePosted: job.created_at || new Date().toISOString(),
    validThrough: job.last_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType: job.job_type === "Part Time" ? "PART_TIME" : "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.company || "Verified Employer",
      logo: job.company_image || "https://atstechnologyhiring.com/images/logo.png",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location || "India",
        addressCountry: "IN",
      },
    },
    ...(job.min_salary
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "INR",
            value: {
              "@type": "QuantitativeValue",
              minValue: Number(job.min_salary),
              maxValue: Number(job.max_salary || job.min_salary),
              unitText: job.salary_type === "yearly" ? "YEAR" : "MONTH",
            },
          },
        }
      : {}),
  };

  return (
    <HomepageLayout>
      <Head>
        <title>{`${job.title} at ${job.company || "Verified Employer"} | ATS Jobs`}</title>
        <meta
          name="description"
          content={`Apply for ${job.title} at ${job.company} in ${job.location || "India"}. Direct HR hiring, transparent salary, zero consultancy fee.`}
        />
        <script type="application/ld+json">{JSON.stringify(jobPostingSchema)}</script>
      </Head>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => window.location.replace(previousUrl)}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 mb-5 font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Previous Page
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Info Left Card - Rich Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 ${
                    job.color || "bg-gradient-to-br from-blue-600 to-indigo-700"
                  } rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden shadow-xs`}
                >
                  {job.company_image ? (
                    <img src={job.company_image} alt={job.company} className="w-full h-full object-cover" />
                  ) : (
                    job.logo || (job.company || "Job").slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{job.title}</h3>
                  <p className="text-xs text-blue-600 font-semibold truncate">{job.company}</p>
                </div>
              </div>

              {/* Core Badges Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-gray-100">
                <div className="p-2 rounded-xl bg-gray-50 flex items-center gap-1.5 text-gray-700">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{job.location || "Multiple Cities"}</span>
                </div>
                <div className="p-2 rounded-xl bg-gray-50 flex items-center gap-1.5 text-gray-700">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{job.job_type || job.type || "Full Time"}</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50/70 flex items-center gap-1.5 text-emerald-800 font-bold col-span-2">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {job.salary ||
                      (job.min_salary && job.max_salary
                        ? `₹${Number(job.min_salary).toLocaleString("en-IN")} - ₹${Number(job.max_salary).toLocaleString("en-IN")}`
                        : "Competitive Package")}
                  </span>
                </div>
              </div>

              {/* Extended Post Details */}
              <div className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                {job.openings ? (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-500" /> Vacancies:
                    </span>
                    <span className="font-semibold text-gray-800 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                      {job.openings} Openings
                    </span>
                  </div>
                ) : null}

                {(job.experience || job.min_experience) && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" /> Experience:
                    </span>
                    <span className="font-semibold text-gray-800">
                      {job.experience || `${job.min_experience} - ${job.max_experience || ""} Yrs`}
                    </span>
                  </div>
                )}

                {job.shift_timing && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" /> Shift & Timing:
                    </span>
                    <span className="font-semibold text-gray-800">{job.shift_timing}</span>
                  </div>
                )}

                {job.working_days && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400 flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-gray-400" /> Working Days:
                    </span>
                    <span className="font-semibold text-gray-800">{job.working_days}</span>
                  </div>
                )}

                {job.last_date && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-red-400" /> Apply Deadline:
                    </span>
                    <span className="font-semibold text-red-600">
                      {new Date(job.last_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Skills Tags */}
              {jobSkillsList.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <h4 className="text-[11px] font-bold text-gray-700 mb-2 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3 h-3 text-blue-600" /> Key Skills Required
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {jobSkillsList.slice(0, 8).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-[10px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description Snippet */}
              {job.description && (
                <div className="pt-2 border-t border-gray-100">
                  <h4 className="text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    About This Role
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">
                    {job.description}
                  </p>
                </div>
              )}

              {/* Core Requirements */}
              {requirementsList.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <h4 className="text-[11px] font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Key Requirements
                  </h4>
                  <ul className="space-y-1.5">
                    {requirementsList.slice(0, 4).map((r, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-500">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-[11px] text-emerald-700 font-semibold bg-emerald-50/60 p-2.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>100% Free Application · Direct HR</span>
              </div>
            </div>
          </div>

          {/* Application Form Wizard */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
              {showForm ? (
                <>
                  <h2 className="text-lg font-bold text-gray-900 mb-0.5">Apply for {job.title}</h2>
                  <p className="text-xs text-gray-400 mb-5">
                    {job.company} · Step {step + 1} of {steps.length}
                  </p>

                  {/* Stepper */}
                  <div className="flex items-center mb-6 max-w-md">
                    {steps.map((s, i) => (
                      <div key={s} className="flex items-center flex-1 last:flex-none">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                            i < step
                              ? "bg-emerald-600 text-white"
                              : i === step
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {i < step ? "✓" : i + 1}
                        </div>
                        {i < steps.length - 1 && (
                          <div
                            className={`flex-1 h-0.5 mx-1.5 transition-all ${
                              i < step ? "bg-emerald-500" : "bg-gray-100"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Step {step + 1}: {steps[step]}
                    </p>
                    {step === 3 && (
                      <span className="text-[11px] text-blue-600 font-medium">Please review all details</span>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
                  <p className="text-gray-500 mb-6">{job.company}</p>
                </div>
              )}

              {showForm ? (
                <form onSubmit={handleNext} className="space-y-4">
                  {/* Step 0 - Personal Info */}
                  {step === 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type="text"
                            value={form.fullName}
                            onChange={(e) => {
                              update("fullName", e.target.value);
                              clearError("fullName");
                            }}
                            placeholder="Your full name"
                            className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 ${
                              errors.fullName
                                ? "border-red-400 focus:ring-red-400 bg-red-50/10"
                                : "border-gray-200 focus:ring-blue-500"
                            }`}
                          />
                        </div>
                        {errors.fullName && <p className="text-[11px] text-red-500 mt-1">{errors.fullName}</p>}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) => {
                              update("email", e.target.value);
                              clearError("email");
                            }}
                            placeholder="your@email.com"
                            className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 ${
                              errors.email
                                ? "border-red-400 focus:ring-red-400 bg-red-50/10"
                                : "border-gray-200 focus:ring-blue-500"
                            }`}
                          />
                        </div>
                        {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => {
                              update("phone", e.target.value);
                              clearError("phone");
                            }}
                            placeholder="+91 98765 43210"
                            className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 ${
                              errors.phone
                                ? "border-red-400 focus:ring-red-400 bg-red-50/10"
                                : "border-gray-200 focus:ring-blue-500"
                            }`}
                          />
                        </div>
                        {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Current City <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={form.city}
                          onChange={(e) => {
                            update("city", e.target.value);
                            clearError("city");
                          }}
                          className={`w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-1 ${
                            errors.city
                              ? "border-red-400 focus:ring-red-400 bg-red-50/10"
                              : "border-gray-200 focus:ring-blue-500"
                          }`}
                        >
                          <option value="">Select your city</option>
                          {[
                            "Jaipur",
                            "Delhi NCR",
                            "Mumbai",
                            "Bangalore",
                            "Hyderabad",
                            "Pune",
                            "Chennai",
                            "Kolkata",
                            "Ahmedabad",
                            "Chandigarh",
                            "Indore",
                            "Lucknow",
                            "Remote",
                            "Other",
                          ].map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        {errors.city && <p className="text-[11px] text-red-500 mt-1">{errors.city}</p>}
                      </div>
                    </div>
                  )}

                  {/* Step 1 - Professional Experience */}
                  {step === 1 && (
                    <div className="space-y-4">
                      {/* Experience & Title */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Experience Level <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={form.experience}
                            onChange={(e) => handleExperienceChange(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-1 ${
                              errors.experience
                                ? "border-red-400 focus:ring-red-400 bg-red-50/10"
                                : "border-gray-200 focus:ring-blue-500"
                            }`}
                          >
                            <option value="">Select experience</option>
                            <option value="Fresher">Fresher (No Prior Experience)</option>
                            <option value="1-2 Years">1 - 2 Years</option>
                            <option value="3-5 Years">3 - 5 Years</option>
                            <option value="5+ Years">5+ Years</option>
                          </select>
                          {errors.experience && (
                            <p className="text-[11px] text-red-500 mt-1">{errors.experience}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            {isFresher ? "Target / Preferred Role" : "Current / Last Job Title"}{" "}
                            {!isFresher && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="text"
                            value={form.currentTitle}
                            onChange={(e) => {
                              update("currentTitle", e.target.value);
                              clearError("currentTitle");
                            }}
                            placeholder={isFresher ? "e.g. Junior Developer, Trainee" : "e.g. Senior React Developer"}
                            className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 ${
                              errors.currentTitle
                                ? "border-red-400 focus:ring-red-400 bg-red-50/10"
                                : "border-gray-200 focus:ring-blue-500"
                            }`}
                          />
                          {errors.currentTitle && (
                            <p className="text-[11px] text-red-500 mt-1">{errors.currentTitle}</p>
                          )}
                        </div>
                      </div>

                      {/* Fields ONLY shown when candidate is EXPERIENCED */}
                      {!isFresher && form.experience && (
                        <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-4 animate-in fade-in duration-150">
                          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            Work Experience Details
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Last Company Name */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Last / Current Company Name <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                  type="text"
                                  value={form.lastCompany}
                                  onChange={(e) => {
                                    update("lastCompany", e.target.value);
                                    clearError("lastCompany");
                                  }}
                                  placeholder="e.g. Infosys, TCS, TechCorp"
                                  className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 bg-white ${
                                    errors.lastCompany
                                      ? "border-red-400 focus:ring-red-400 bg-red-50/10"
                                      : "border-gray-200 focus:ring-blue-500"
                                  }`}
                                />
                              </div>
                              {errors.lastCompany && (
                                <p className="text-[11px] text-red-500 mt-1">{errors.lastCompany}</p>
                              )}
                            </div>

                            {/* Notice Period */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Notice Period <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <select
                                  value={form.notice}
                                  onChange={(e) => handleNoticeChange(e.target.value)}
                                  className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-1 ${
                                    errors.notice
                                      ? "border-red-400 focus:ring-red-400 bg-red-50/10"
                                      : "border-gray-200 focus:ring-blue-500"
                                  }`}
                                >
                                  <option value="">Select notice period</option>
                                  <option value="Immediate Joiner">Immediate Joiner</option>
                                  <option value="15 Days">15 Days</option>
                                  <option value="30 Days">30 Days</option>
                                  <option value="45 Days">45 Days</option>
                                  <option value="60 Days">60 Days</option>
                                  <option value="90 Days">90 Days</option>
                                  <option value="Currently Serving Notice">Currently Serving Notice</option>
                                </select>
                              </div>
                              {errors.notice && <p className="text-[11px] text-red-500 mt-1">{errors.notice}</p>}
                            </div>
                          </div>

                          {/* Last Working Day - ONLY shown when candidate is Currently Serving Notice */}
                          {isServingNotice && (
                            <div className="animate-in fade-in duration-150 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                              <label className="block text-xs font-semibold text-amber-900 mb-1">
                                Last Working Day (LWD) <span className="text-red-500">*</span>
                              </label>
                              <div className="relative max-w-sm">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                  type="date"
                                  value={form.lastWorkingDay}
                                  onChange={(e) => {
                                    update("lastWorkingDay", e.target.value);
                                    clearError("lastWorkingDay");
                                  }}
                                  className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-1 ${
                                    errors.lastWorkingDay
                                      ? "border-red-400 focus:ring-red-400 bg-red-50/10"
                                      : "border-gray-200 focus:ring-blue-500"
                                  }`}
                                />
                              </div>
                              {errors.lastWorkingDay && (
                                <p className="text-[11px] text-red-500 mt-1">{errors.lastWorkingDay}</p>
                              )}
                              <p className="text-[10px] text-amber-700 mt-1">
                                As you are serving notice, please select your confirmed last working date.
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Current Salary (Salary Limit Fixed: max 9 digits, clean input) */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-semibold text-gray-700">
                                  Current Annual Salary (₹) <span className="text-red-500">*</span>
                                </label>
                                <span className="text-[10px] text-gray-400">Min ₹10K · Max ₹5 Cr</span>
                              </div>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                                  ₹
                                </span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  maxLength={9}
                                  value={form.currentSalary}
                                  onChange={(e) => handleSalaryChange("currentSalary", e.target.value)}
                                  placeholder="e.g. 500000"
                                  className={`w-full pl-8 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 bg-white ${
                                    errors.currentSalary
                                      ? "border-red-400 focus:ring-red-400 bg-red-50/10"
                                      : "border-gray-200 focus:ring-blue-500"
                                  }`}
                                />
                              </div>
                              {errors.currentSalary && (
                                <p className="text-[11px] text-red-500 mt-1">{errors.currentSalary}</p>
                              )}
                            </div>

                            {/* Expected Salary (Salary Limit Fixed: max 9 digits, clean input) */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-semibold text-gray-700">
                                  Expected Annual Salary (₹) <span className="text-red-500">*</span>
                                </label>
                                <span className="text-[10px] text-gray-400">Min ₹10K · Max ₹5 Cr</span>
                              </div>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                                  ₹
                                </span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  maxLength={9}
                                  value={form.expectedSalary}
                                  onChange={(e) => handleSalaryChange("expectedSalary", e.target.value)}
                                  placeholder="e.g. 700000"
                                  className={`w-full pl-8 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 bg-white ${
                                    errors.expectedSalary
                                      ? "border-red-400 focus:ring-red-400 bg-red-50/10"
                                      : "border-gray-200 focus:ring-blue-500"
                                  }`}
                                />
                              </div>
                              {errors.expectedSalary && (
                                <p className="text-[11px] text-red-500 mt-1">{errors.expectedSalary}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Freshers Note: No Current Salary or Company Details */}
                      {isFresher && (
                        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100/80 animate-in fade-in duration-150">
                          <div className="flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-emerald-900">Fresher Candidate Profile</p>
                              <p className="text-[11px] text-emerald-700 mt-0.5">
                                As a fresher, prior salary and notice period are not required. You can optionally
                                mention your expected salary below.
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 max-w-xs">
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-semibold text-gray-700">
                                Expected Annual Salary (₹) <span className="text-gray-400 font-normal">(Optional)</span>
                              </label>
                              <span className="text-[10px] text-gray-400">Max ₹5 Cr</span>
                            </div>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                                ₹
                              </span>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={9}
                                value={form.expectedSalary}
                                onChange={(e) => handleSalaryChange("expectedSalary", e.target.value)}
                                placeholder="e.g. 350000"
                                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                              />
                            </div>
                            {errors.expectedSalary && (
                              <p className="text-[11px] text-red-500 mt-1">{errors.expectedSalary}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Links */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Portfolio / Website <span className="text-gray-400 font-normal">(Optional)</span>
                          </label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                              type="url"
                              value={form.portfolio}
                              onChange={(e) => update("portfolio", e.target.value)}
                              placeholder="https://yourportfolio.com"
                              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            LinkedIn Profile <span className="text-gray-400 font-normal">(Optional)</span>
                          </label>
                          <div className="relative">
                            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                              type="url"
                              value={form.linkedin}
                              onChange={(e) => update("linkedin", e.target.value)}
                              placeholder="https://linkedin.com/in/username"
                              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2 - Qualifications, Skills & Resume */}
                  {step === 2 && (
                    <div className="space-y-4">
                      {/* Education Qualifications Section */}
                      <div className="p-4 bg-slate-50/80 rounded-2xl border border-gray-100 space-y-3">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-blue-600" />
                          <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                            Educational Qualifications <span className="text-red-500">*</span>
                          </h4>
                        </div>

                        {/* Display profile education card if available */}
                        {candidate?.educations && candidate.educations.length > 0 && (
                          <div className="p-2.5 bg-blue-50/60 border border-blue-100 rounded-xl text-xs flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-blue-900 block">
                                {candidate.educations[0].degree}
                              </span>
                              <span className="text-[11px] text-blue-700">
                                {candidate.educations[0].institution || "Registered University"} · ({candidate.educations[0].start_year || ""} - {candidate.educations[0].end_year || "Present"})
                              </span>
                            </div>
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                              Profile Record
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Highest Qualification Select */}
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                              Highest Qualification Level <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={form.qualification}
                              onChange={(e) => {
                                update("qualification", e.target.value);
                                clearError("qualification");
                              }}
                              className={`w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none focus:ring-1 ${
                                errors.qualification
                                  ? "border-red-400 focus:ring-red-400 bg-red-50/10"
                                  : "border-gray-200 focus:ring-blue-500"
                              }`}
                            >
                              <option value="">Select Qualification</option>
                              <option value="10th Pass">10th Pass (High School)</option>
                              <option value="12th Pass">12th Pass (Intermediate / 10+2)</option>
                              <option value="Diploma">Diploma / Polytechnic</option>
                              <option value="Graduate / Bachelor's">Graduate / Bachelor's (B.Tech, BCA, B.Sc, B.Com, B.A, BBA)</option>
                              <option value="Post Graduate / Master's">Post Graduate / Master's (M.Tech, MCA, MBA, M.Sc, M.Com)</option>
                              <option value="Doctorate / PhD">Doctorate / PhD</option>
                              <option value="Other">Other / Professional Certification</option>
                            </select>
                            {errors.qualification && (
                              <p className="text-[11px] text-red-500 mt-1">{errors.qualification}</p>
                            )}
                          </div>

                          {/* Degree / Stream Name */}
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                              Degree / Field of Study
                            </label>
                            <input
                              type="text"
                              value={form.educationDegree}
                              onChange={(e) => update("educationDegree", e.target.value)}
                              placeholder="e.g. B.Tech in CSE, B.Com, 12th PCM"
                              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          {/* Institute / University Name */}
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                              College / University
                            </label>
                            <input
                              type="text"
                              value={form.educationInstitute}
                              onChange={(e) => update("educationInstitute", e.target.value)}
                              placeholder="e.g. Delhi University, RTU, CBSE"
                              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Candidate Skills Section - Profile Skills + Add Extra */}
                      <div className="p-4 bg-slate-50/80 rounded-2xl border border-gray-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-blue-600" />
                            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                              Your Skills & Competencies
                            </h4>
                          </div>
                          <span className="text-[11px] text-gray-400">
                            {form.skills.length} skills added
                          </span>
                        </div>

                        {/* Active Skills Chips */}
                        <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-white rounded-xl border border-gray-200">
                          {form.skills.length > 0 ? (
                            form.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkill(skill)}
                                  className="text-blue-400 hover:text-blue-700 transition cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 py-1">No skills added yet. Add your skills below.</span>
                          )}
                        </div>

                        {/* Add Skill Input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSkillInput}
                            onChange={(e) => setNewSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddSkill();
                              }
                            }}
                            placeholder="Type a skill (e.g. React, Python, Sales, Excel) and click Add..."
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddSkill()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1 shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Skill
                          </button>
                        </div>

                        {/* Recommended Skills from Job Post */}
                        {jobSkillsList.filter((s) => !form.skills.some((fs) => fs.toLowerCase() === s.toLowerCase())).length > 0 && (
                          <div className="pt-1">
                            <span className="text-[11px] text-gray-500 block mb-1">
                              Quick-add relevant skills from this job:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {jobSkillsList
                                .filter((s) => !form.skills.some((fs) => fs.toLowerCase() === s.toLowerCase()))
                                .slice(0, 6)
                                .map((s, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleAddSkill(s)}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-800 text-[11px] font-medium transition cursor-pointer border border-gray-200"
                                  >
                                    <Plus className="w-2.5 h-2.5" /> {s}
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Resume Section with Profile Resumes List & Default Selection */}
                      <div className="p-4 bg-slate-50/80 rounded-2xl border border-gray-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                              Resume / Curriculum Vitae <span className="text-gray-400 font-normal">(Optional)</span>
                            </h4>
                          </div>
                          {candidateResumes.length > 0 && (
                            <div className="flex bg-gray-200/80 p-0.5 rounded-lg text-[11px] font-semibold">
                              <button
                                type="button"
                                onClick={() => setResumeMode("profile")}
                                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                                  resumeMode === "profile"
                                    ? "bg-white text-blue-600 shadow-2xs"
                                    : "text-gray-600 hover:text-gray-900"
                                }`}
                              >
                                Saved Resumes ({candidateResumes.length})
                              </button>
                              <button
                                type="button"
                                onClick={() => setResumeMode("upload")}
                                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                                  resumeMode === "upload"
                                    ? "bg-white text-blue-600 shadow-2xs"
                                    : "text-gray-600 hover:text-gray-900"
                                }`}
                              >
                                Upload New
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Option 1: Profile Resumes List (Default Selected) */}
                        {candidateResumes.length > 0 && resumeMode === "profile" && (
                          <div className="space-y-2 pt-1">
                            <p className="text-[11px] text-gray-500">
                              Select from your profile resumes. Your default resume is selected automatically:
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                              {candidateResumes.map((r) => {
                                const isSelected =
                                  String(form.selectedResumeId) === String(r.id) ||
                                  String(form.selectedResumeId) === String(r.uuid);
                                return (
                                  <label
                                    key={r.id || r.uuid}
                                    onClick={() => {
                                      update("selectedResumeId", String(r.id || r.uuid));
                                      update("cvFile", null);
                                    }}
                                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${
                                      isSelected
                                        ? "border-blue-600 bg-blue-50/40 shadow-xs"
                                        : "border-gray-200 bg-white hover:border-gray-300"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div
                                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                          isSelected
                                            ? "border-blue-600 bg-blue-600 text-white"
                                            : "border-gray-300 bg-white"
                                        }`}
                                      >
                                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                      </div>
                                      <FileText className={`w-5 h-5 shrink-0 ${isSelected ? "text-blue-600" : "text-gray-400"}`} />
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-gray-800 truncate block">
                                            {r.title || "Resume Document"}
                                          </span>
                                          {r.is_default && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 shrink-0">
                                              ★ Default
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-gray-400 uppercase">
                                          {r.file_type || "PDF/DOC"} · Added {new Date(r.created_at).toLocaleDateString("en-IN")}
                                        </span>
                                      </div>
                                    </div>

                                    {r.file_url && (
                                      <a
                                        href={r.file_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 shrink-0 p-1.5 hover:bg-blue-100/50 rounded-lg transition"
                                      >
                                        <ExternalLink className="w-3 h-3" /> Preview
                                      </a>
                                    )}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Option 2: Upload New Resume */}
                        {(candidateResumes.length === 0 || resumeMode === "upload") && (
                          <div className="pt-1">
                            <label
                              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                                form.cvFile
                                  ? "border-emerald-500 bg-emerald-50/20"
                                  : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/40"
                              }`}
                            >
                              {form.cvFile ? (
                                <div className="text-center p-3">
                                  <FileCheck className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
                                  <span className="text-xs font-bold text-gray-800 block truncate max-w-xs">
                                    {form.cvFile.name}
                                  </span>
                                  <span className="text-[11px] text-emerald-600 font-semibold">
                                    File attached ({(form.cvFile.size / 1024).toFixed(1)} KB) · Click to change
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <Upload className="w-7 h-7 text-gray-400 mb-1.5" />
                                  <span className="text-xs font-semibold text-gray-700">
                                    Click to attach a new CV / Resume (Optional)
                                  </span>
                                  <span className="text-[11px] text-gray-400 mt-0.5">
                                    Supports PDF, DOC, DOCX up to 5MB
                                  </span>
                                </>
                              )}
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  setForm((p) => ({ ...p, cvFile: file }));
                                }}
                              />
                            </label>
                            {form.cvFile && (
                              <div className="flex justify-end mt-1">
                                <button
                                  type="button"
                                  onClick={() => setForm((p) => ({ ...p, cvFile: null }))}
                                  className="text-[11px] text-red-500 hover:text-red-700 font-medium cursor-pointer"
                                >
                                  Remove file
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Why Apply Statement */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Why do you want this job & why are you a great fit? <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={4}
                          value={form.whyApply}
                          onChange={(e) => {
                            update("whyApply", e.target.value);
                            clearError("whyApply");
                          }}
                          placeholder="Briefly highlight your core skills, recent projects, or motivation for applying..."
                          className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-1 resize-none ${
                            errors.whyApply
                              ? "border-red-400 focus:ring-red-400 bg-red-50/10"
                              : "border-gray-200 focus:ring-blue-500"
                          }`}
                        />
                        <div className="flex items-center justify-between mt-1">
                          {errors.whyApply ? (
                            <p className="text-[11px] text-red-500">{errors.whyApply}</p>
                          ) : (
                            <span className="text-[10px] text-gray-400">Min 10 characters recommended</span>
                          )}
                          <span className="text-[10px] text-gray-400">{form.whyApply.length} characters</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3 - Full Detailed Review & Submit */}
                  {step === 3 && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-900 leading-relaxed">
                          Please review your application details thoroughly before submitting. You can click{" "}
                          <span className="font-bold underline cursor-pointer" onClick={() => setStep(0)}>
                            Edit
                          </span>{" "}
                          on any section to make updates.
                        </p>
                      </div>

                      {/* Card 1: Personal Information */}
                      <div className="bg-slate-50/80 rounded-2xl p-4 border border-gray-200/80">
                        <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200/60">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                              Personal Information
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStep(0)}
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:text-blue-800 transition cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-gray-400 block text-[11px]">Full Name</span>
                            <span className="font-semibold text-gray-800">{form.fullName || "—"}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[11px]">Email Address</span>
                            <span className="font-semibold text-gray-800">{form.email || "—"}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[11px]">Phone Number</span>
                            <span className="font-semibold text-gray-800">{form.phone || "—"}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[11px]">City / Location</span>
                            <span className="font-semibold text-gray-800">{form.city || "—"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card 2: Professional Experience Profile */}
                      <div className="bg-slate-50/80 rounded-2xl p-4 border border-gray-200/80">
                        <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200/60">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-600" />
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                              Professional Experience
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:text-blue-800 transition cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-gray-400 block text-[11px]">Experience Level</span>
                            <span className="inline-block px-2.5 py-0.5 mt-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                              {form.experience || "Fresher"}
                            </span>
                          </div>

                          <div>
                            <span className="text-gray-400 block text-[11px]">
                              {isFresher ? "Target Role" : "Current / Last Job Title"}
                            </span>
                            <span className="font-semibold text-gray-800">
                              {form.currentTitle || (isFresher ? "Entry Level" : "—")}
                            </span>
                          </div>

                          {/* Extra info for experienced */}
                          {!isFresher ? (
                            <>
                              <div>
                                <span className="text-gray-400 block text-[11px]">Last / Current Company</span>
                                <span className="font-semibold text-gray-800">{form.lastCompany || "—"}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[11px]">Notice Period</span>
                                <span className="font-semibold text-gray-800">{form.notice || "—"}</span>
                              </div>
                              {/* Only show Last Working Day if they are serving notice */}
                              {isServingNotice && (
                                <div>
                                  <span className="text-gray-400 block text-[11px]">Last Working Day</span>
                                  <span className="font-semibold text-gray-800">{form.lastWorkingDay || "—"}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-gray-400 block text-[11px]">Current Salary</span>
                                <span className="font-semibold text-emerald-700">
                                  {form.currentSalary
                                    ? `₹ ${Number(form.currentSalary).toLocaleString("en-IN")}`
                                    : "—"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[11px]">Expected Salary</span>
                                <span className="font-semibold text-emerald-700">
                                  {form.expectedSalary
                                    ? `₹ ${Number(form.expectedSalary).toLocaleString("en-IN")}`
                                    : "—"}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div>
                              <span className="text-gray-400 block text-[11px]">Expected Salary</span>
                              <span className="font-semibold text-emerald-700">
                                {form.expectedSalary
                                  ? `₹ ${Number(form.expectedSalary).toLocaleString("en-IN")}`
                                  : "As per company standards"}
                              </span>
                            </div>
                          )}

                          {form.portfolio && (
                            <div className="sm:col-span-2">
                              <span className="text-gray-400 block text-[11px]">Portfolio Link</span>
                              <a
                                href={form.portfolio}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-blue-600 hover:underline truncate block"
                              >
                                {form.portfolio}
                              </a>
                            </div>
                          )}

                          {form.linkedin && (
                            <div className="sm:col-span-2">
                              <span className="text-gray-400 block text-[11px]">LinkedIn Profile</span>
                              <a
                                href={form.linkedin}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-blue-600 hover:underline truncate block"
                              >
                                {form.linkedin}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card 3: Qualifications, Skills & Resume */}
                      <div className="bg-slate-50/80 rounded-2xl p-4 border border-gray-200/80">
                        <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200/60">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-blue-600" />
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                              Qualifications, Skills & Application Note
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:text-blue-800 transition cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                        </div>

                        <div className="space-y-3 text-xs">
                          {/* Education */}
                          <div>
                            <span className="text-gray-400 block text-[11px]">Highest Qualification</span>
                            <span className="font-semibold text-gray-800">
                              {form.qualification} {form.educationDegree ? `(${form.educationDegree})` : ""}
                            </span>
                            {form.educationInstitute && (
                              <span className="text-[11px] text-gray-500 block">{form.educationInstitute}</span>
                            )}
                          </div>

                          {/* Skills */}
                          <div>
                            <span className="text-gray-400 block text-[11px] mb-1">Skills Included</span>
                            <div className="flex flex-wrap gap-1">
                              {form.skills && form.skills.length > 0 ? (
                                form.skills.map((s, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100"
                                  >
                                    {s}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-[11px]">None specified</span>
                              )}
                            </div>
                          </div>

                          {/* Attached Resume */}
                          <div>
                            <span className="text-gray-400 block text-[11px] mb-1">Attached Resume</span>
                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 w-fit">
                              <FileCheck className="w-4 h-4 text-emerald-600" />
                              <span className="font-bold text-gray-800">
                                {form.cvFile
                                  ? form.cvFile.name
                                  : selectedProfileResume
                                  ? `${selectedProfileResume.title} (Profile Resume)`
                                  : "No resume attached (Optional)"}
                              </span>
                              {form.cvFile && (
                                <span className="text-[10px] text-gray-400">
                                  ({(form.cvFile.size / 1024).toFixed(1)} KB)
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Why Apply */}
                          <div>
                            <span className="text-gray-400 block text-[11px] mb-1">Why do you want this job?</span>
                            <div className="bg-white p-3 rounded-xl border border-gray-200 text-gray-700 leading-relaxed text-xs">
                              {form.whyApply || "—"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Final Direct Guarantee Badge */}
                      <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-800">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>
                          Your profile will be directly sent to the hiring manager of <strong>{job.company}</strong>.
                          We never share your information with unverified third parties.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Wizard Bottom Action Buttons */}
                  <div className="flex gap-3 pt-3">
                    {step > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setStep(step - 1);
                          window.scrollTo({ top: 120, behavior: "smooth" });
                        }}
                        className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                      >
                        Back
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting Application...</span>
                        </>
                      ) : step < 3 ? (
                        <>
                          <span>Continue</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Confirm & Submit Application</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-5">Login to apply for this job.</p>
                  <button
                    type="button"
                    onClick={() => setLoginPopup(true)}
                    className="px-8 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm shadow-md transition"
                  >
                    Login to Apply
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Login Popup Modal */}
      {loginPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-7 max-w-sm w-full text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <User className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Login Required</h3>
            <p className="text-sm text-gray-500 mb-5">
              Please sign in to your candidate account to apply for <strong>{job.title}</strong>.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setLoginPopup(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <Link
                href={`/login?redirect=/apply/${job.uuid || job.id}`}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition cursor-pointer shadow-xs inline-flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </HomepageLayout>
  );
}
