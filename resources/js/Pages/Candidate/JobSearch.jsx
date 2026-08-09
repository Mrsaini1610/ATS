import { useState, useEffect } from "react";
import HomepageLayout from "@/Layouts/HomepageLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import useLocation from "@/Hooks/useLocation";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  X,
  BookmarkPlus,
  ArrowRight,
  SlidersHorizontal,
  CheckCircle2,
  Star,
  Share2,
  ChevronLeft,
  Shield,
} from "lucide-react";

/* ── Login Gate Modal ── */
function LoginGateModal({ action, onClose, onLogin }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-7 max-w-sm w-full text-center">
        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-7 h-7 text-amber-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Login Required</h3>
        <p className="text-sm text-gray-500 mb-5">
          Please sign in to your account to <strong>{action}</strong>.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onLogin}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Job Detail Panel ── */
function JobDetailPanel({
  job,
  onClose,
  isLoggedIn,
  onLoginRequired,
  getCountdown,
}) {
  const handleSave = () => {
    if (!isLoggedIn) {
      onLoginRequired("save this job");
      return;
    }
    router.post(route("jobs.save", job.id));
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto w-full bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-5 py-3 flex items-center justify-between z-10 shadow-sm">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 lg:hidden"
        >
          <ChevronLeft className="w-5 h-5" /> Back to jobs
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
          >
            <BookmarkPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 flex-1">
        {/* Company + Title */}
        <div className="flex items-start gap-3 sm:gap-4 mb-4">
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 ${job.color} rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0`}
          >
            {job.logo}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
              {job.title}
            </h2>
            <p className="text-blue-600 text-sm font-medium mt-0.5">{job.company}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
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

        {/* Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {job.hot && (
            <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-full font-medium">
              🔥 Hot Job
            </span>
          )}
          {job.openings && (
            <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium">
              {job.openings} Opening{job.openings > 1 ? "s" : ""}
            </span>
          )}
          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
            {job.exp}
          </span>
        </div>

        {/* Salary */}
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
          <p className="text-xs text-green-600 font-medium">Annual CTC / Salary</p>
          <p className="text-lg sm:text-xl font-bold text-green-700">{job.salary}</p>
        </div>

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="mb-5">
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

        {/* Job Description */}
        {job.desc && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              About the Role
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">{job.desc}</p>
          </div>
        )}

        {/* Responsibilities */}
        {job.responsibilities && job.responsibilities.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Key Responsibilities
            </p>
            <ul className="space-y-2">
              {job.responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Requirements
            </p>
            <ul className="space-y-2">
              {job.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <Star className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Perks & Benefits
            </p>
            <div className="flex flex-wrap gap-1.5">
              {job.benefits.map((b, i) => (
                <span
                  key={i}
                  className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-full"
                >
                  ✓ {b}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Apply Action CTA */}
        <div className="pt-4 border-t border-gray-100 mt-6 pb-4">
          {job.can_apply ? (
            <Link
              href={isLoggedIn ? `/apply/${job.id}` : "#"}
              onClick={(e) => {
                if (!isLoggedIn) {
                  e.preventDefault();
                  onLoginRequired("apply for this job");
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-md shadow-blue-200"
            >
              {job.application_status === "rejected" ? "Apply Again" : "Apply Now"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              disabled
              className={`w-full py-3 rounded-xl text-white text-sm font-semibold cursor-not-allowed flex items-center justify-center text-center ${
                job.application_status === "pending" || job.application_status === "applied"
                  ? "bg-yellow-500"
                  : job.application_status === "selected"
                  ? "bg-green-600"
                  : job.application_status === "rejected"
                  ? "bg-red-600"
                  : job.application_status === "cancelled"
                  ? "bg-gray-600"
                  : "bg-gray-400"
              }`}
            >
              {job.application_status === "pending" && "Pending"}
              {job.application_status === "applied" && "Applied"}
              {job.application_status === "selected" && "Selected"}
              {job.application_status === "cancelled" && "Cancelled"}
              {job.application_status === "rejected" &&
                `Reapply in ${getCountdown(job.reapply_at)}`}
            </button>
          )}

          {!isLoggedIn && (
            <p className="text-xs text-center text-gray-400 mt-2 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" /> Login required to apply or save jobs
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function JobSearch({
  jobs = [],
  categories = [],
  locations = [],
  jobTypes = [],
  experiences = [],
  filters = {},
}) {
  const { auth } = usePage().props;
  const user = auth?.user;
  const isLoggedIn = !!user;

  // Filter States initialized from backend filters prop
  const [keyword, setKeyword] = useState(filters?.search || filters?.skill || "");
  const [city, setCity] = useState(filters?.location || "All Cities");
  const [selectedCategory, setSelectedCategory] = useState(filters?.category || "All");
  const [selectedJobType, setSelectedJobType] = useState(filters?.job_type || "All Types");
  const [selectedExperience, setSelectedExperience] = useState(filters?.experience || "All Levels");
  const [salary, setSalary] = useState(filters?.salary || "Any Salary");

  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loginGateAction, setLoginGateAction] = useState(null);

  const [now, setNow] = useState(Date.now());
  const userLocation = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Construct Options from Props
  const locationList = ["All Cities", ...locations];
  const jobTypeList = ["All Types", ...jobTypes];
  const experienceList = ["All Levels", ...experiences];

  const categoryList = isLoggedIn
    ? [{ id: "Recommended Jobs", name: "Recommended Jobs" }, { id: "All", name: "All" }, ...categories]
    : [{ id: "All", name: "All" }, ...categories];

  const salaryRanges = [
    "Any Salary",
    "₹25,000 - ₹40,000",
    "₹28,000 - ₹40,000",
    "₹30,000 - ₹45,000",
    "₹35,000 - ₹50,000",
    "₹40,000 - ₹55,000",
    "₹50,000 - ₹70,000",
    "₹60,000 - ₹80,000",
    "₹60,000 - ₹90,000",
  ];

  // Map backend jobs data safely
  const allJobs = jobs.map((job) => {
    let parsedSkills = [];
    if (Array.isArray(job.skills)) {
      parsedSkills = job.skills;
    } else if (typeof job.skills === "string") {
      parsedSkills = job.skills.split(",").map((s) => s.trim());
    }

    return {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      type: job.job_type,
      exp: job.experience,
      skills: parsedSkills,
      category_id: job.category_id,
      category_name: job.category?.name || job.job_category || job.category || "",
      logo: job.company?.substring(0, 2).toUpperCase() || "JB",
      color: "bg-blue-600",
      posted: job.created_at ? new Date(job.created_at).toLocaleDateString() : "",
      hot: job.hot || false,
      openings: job.openings || 1,
      desc: job.description || job.desc || "",
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
      requirements: Array.isArray(job.requirements) ? job.requirements : [],
      benefits: Array.isArray(job.benefits) ? job.benefits : [],
      can_apply: job.can_apply,
      application_status: job.application_status,
      reapply_at: job.reapply_at,
    };
  });

  const filtered = allJobs.filter((job) => {
    const kw = keyword.toLowerCase();
    if (
      kw &&
      !job.title.toLowerCase().includes(kw) &&
      !job.company.toLowerCase().includes(kw) &&
      !job.skills.some((s) => s.toLowerCase().includes(kw))
    )
      return false;

    if (city !== "All Cities" && job.location !== city) return false;

    // Flexible Category Filter (supports string comparison as well as ID)
    if (selectedCategory === "Recommended Jobs") {
      const candidateField = user?.job_title?.toLowerCase() || "";
      const matched =
        job.title?.toLowerCase().includes(candidateField) ||
        job.skills?.some((skill) =>
          skill.toLowerCase().includes(candidateField)
        );
      if (!matched) return false;
    } else if (selectedCategory !== "All") {
      if (
        String(job.category_id) !== String(selectedCategory) &&
        job.category_name !== selectedCategory
      ) {
        return false;
      }
    }

    if (selectedJobType !== "All Types" && job.type !== selectedJobType) return false;
    if (selectedExperience !== "All Levels" && job.exp !== selectedExperience) return false;

    if (salary !== "Any Salary") {
      const amount = parseInt(job.salary?.replace(/[₹,]/g, "").split("-")[0] || 0);
      switch (salary) {
        case "₹25,000 - ₹40,000":
          if (amount < 25000 || amount > 40000) return false;
          break;
        case "₹28,000 - ₹40,000":
          if (amount < 28000 || amount > 40000) return false;
          break;
        case "₹30,000 - ₹45,000":
          if (amount < 30000 || amount > 45000) return false;
          break;
        case "₹35,000 - ₹50,000":
          if (amount < 35000 || amount > 50000) return false;
          break;
        case "₹40,000 - ₹55,000":
          if (amount < 40000 || amount > 55000) return false;
          break;
        case "₹50,000 - ₹70,000":
          if (amount < 50000 || amount > 70000) return false;
          break;
        case "₹60,000 - ₹80,000":
          if (amount < 60000 || amount > 80000) return false;
          break;
        case "₹60,000 - ₹90,000":
          if (amount < 60000 || amount > 90000) return false;
          break;
        default:
          break;
      }
    }
    return true;
  });

  const rankedJobs = [...filtered].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (userLocation?.city) {
      if (a.location?.toLowerCase().includes(userLocation.city.toLowerCase())) scoreA += 100;
      if (b.location?.toLowerCase().includes(userLocation.city.toLowerCase())) scoreB += 100;
    }

    const candidateTitle = user?.job_title?.toLowerCase() || "";
    if (candidateTitle) {
      if (a.title?.toLowerCase().includes(candidateTitle)) scoreA += 50;
      if (b.title?.toLowerCase().includes(candidateTitle)) scoreB += 50;
    }

    const candidateSkills = user?.skills || [];
    candidateSkills.forEach((skill) => {
      if (a.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))) scoreA += 20;
      if (b.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))) scoreB += 20;
    });

    return scoreB - scoreA;
  });

  /* Auto-select first job on desktop view */
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      if (rankedJobs.length > 0) {
        const exists = rankedJobs.some((j) => j.id === selectedJob?.id);
        if (!selectedJob || !exists) {
          setSelectedJob(rankedJobs[0]);
        }
      } else {
        setSelectedJob(null);
      }
    }
  }, [rankedJobs]);

  const getCountdown = (date) => {
    if (!date) return "";
    const diff = new Date(date).getTime() - now;
    if (diff <= 0) return "Apply Again";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const clearFilters = () => {
    setKeyword("");
    setCity("All Cities");
    setSelectedCategory("All");
    setSelectedJobType("All Types");
    setSelectedExperience("All Levels");
    setSalary("Any Salary");
    router.get(route("job.search"));
  };

  const hasFilters =
    city !== "All Cities" ||
    selectedCategory !== "All" ||
    selectedJobType !== "All Types" ||
    selectedExperience !== "All Levels" ||
    salary !== "Any Salary" ||
    keyword !== "";

  const handleSaveJob = (e, jobId) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      setLoginGateAction("save this job");
      return;
    }
    router.post(route("jobs.save", jobId));
  };

  return (
    <>
      <Head title="Find Jobs" />
      <HomepageLayout>
        {/* Login Gate Modal */}
        {loginGateAction && (
          <LoginGateModal
            action={loginGateAction}
            onClose={() => setLoginGateAction(null)}
            onLogin={() => {
              setLoginGateAction(null);
              router.get(route("login"));
            }}
          />
        )}

        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Header */}
          <div className="mb-4 sm:mb-5">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Find Jobs in India</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Explore {allJobs.length}+ opportunities from top companies
            </p>
          </div>

          {/* Search bar & Filters */}
          <div className="bg-white rounded-2xl border border-gray-200 p-2.5 sm:p-3 mb-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-xl px-3 py-2 sm:py-2.5 focus-within:ring-2 focus-within:ring-blue-500">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Job title, skill, or company..."
                  className="flex-1 outline-none text-sm text-gray-900 bg-transparent"
                />
                {keyword && (
                  <button onClick={() => setKeyword("")}>
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 sm:py-2.5 flex-1 sm:w-48 focus-within:ring-2 focus-within:ring-blue-500">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full outline-none text-sm text-gray-600 bg-transparent cursor-pointer"
                  >
                    {locationList.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center justify-center gap-2 px-3.5 py-2 sm:py-2.5 border rounded-xl text-sm font-medium transition-colors ${
                    showFilters || hasFilters
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {hasFilters && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
                </button>
              </div>
            </div>

            {/* Filter Drawer / Panel */}
            {showFilters && (
              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm outline-none bg-white cursor-pointer"
                  >
                    {categoryList.map((cat) => (
                      <option key={cat.id || cat.name} value={cat.id || cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Job Type
                  </label>
                  <select
                    value={selectedJobType}
                    onChange={(e) => setSelectedJobType(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm outline-none bg-white cursor-pointer"
                  >
                    {jobTypeList.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Experience
                  </label>
                  <select
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm outline-none bg-white cursor-pointer"
                  >
                    {experienceList.map((exp) => (
                      <option key={exp} value={exp}>
                        {exp}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Salary Range
                  </label>
                  <select
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm outline-none bg-white cursor-pointer"
                  >
                    {salaryRanges.map((sal) => (
                      <option key={sal} value={sal}>
                        {sal}
                      </option>
                    ))}
                  </select>
                </div>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="col-span-2 sm:col-span-4 flex items-center gap-1 text-xs sm:text-sm text-red-500 hover:underline mt-1"
                  >
                    <X className="w-4 h-4" /> Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Categories Horizontal Scroll (`x-scroll`) */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none whitespace-nowrap">
            {categoryList.map((cat) => (
              <button
                key={cat.id || cat.name}
                onClick={() => setSelectedCategory(cat.id || cat.name)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  String(selectedCategory) === String(cat.id || cat.name)
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Master-Detail Layout */}
          <div className="flex gap-5 items-start lg:h-[calc(100vh-220px)]">
            {/* Left Column: Job Cards List */}
            <div
              className={`${
                selectedJob ? "hidden lg:flex" : "flex"
              } flex-col flex-1 lg:max-w-[420px] xl:max-w-[460px] shrink-0 h-full w-full`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs sm:text-sm text-gray-600">
                  <span className="font-bold text-gray-900">
                    {rankedJobs.length}
                  </span>{" "}
                  jobs found
                </p>
              </div>

              <div className="space-y-3 overflow-y-auto pr-0 lg:pr-1 flex-1">
                {rankedJobs.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium text-sm">No jobs found</p>
                    <button
                      onClick={clearFilters}
                      className="mt-3 text-blue-600 text-xs sm:text-sm hover:underline font-medium"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  rankedJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`bg-white rounded-2xl border p-3.5 sm:p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedJob?.id === job.id
                          ? "border-blue-500 shadow-sm ring-1 ring-blue-500"
                          : "border-gray-100 hover:border-blue-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 ${job.color} rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0`}
                        >
                          {job.logo}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                                {job.title}
                              </h3>
                              <p className="text-xs text-gray-500 mt-0.5">{job.company}</p>
                            </div>
                            <button
                              onClick={(e) => handleSaveJob(e, job.id)}
                              className="p-1.5 rounded-lg shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
                            >
                              <BookmarkPlus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <DollarSign className="w-3 h-3" />
                              {job.salary}
                            </span>
                            {job.posted && (
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                {job.posted}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1.5 mt-2.5 flex-wrap">
                            {job.hot && (
                              <span className="text-[11px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">
                                🔥 Hot
                              </span>
                            )}
                            <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {job.type}
                            </span>
                            {job.application_status && job.application_status !== "not_applied" && (
                              <span className="text-[11px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full capitalize font-medium">
                                ✓ {job.application_status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Job Detail Panel */}
            <div
              className={`${
                selectedJob ? "flex" : "hidden lg:flex"
              } flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full w-full`}
            >
              {selectedJob ? (
                <JobDetailPanel
                  job={selectedJob}
                  onClose={() => setSelectedJob(null)}
                  isLoggedIn={isLoggedIn}
                  onLoginRequired={(action) => setLoginGateAction(action)}
                  getCountdown={getCountdown}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 h-full">
                  <Briefcase className="w-14 h-14 mb-3 opacity-20" />
                  <p className="font-medium text-gray-600 text-base">
                    Select a job to view details
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Click any job card on the left to see full information
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </HomepageLayout>
    </>
  );
}