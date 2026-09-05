import React, { useState } from "react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";
import { Head, usePage, useForm, Link, router } from "@inertiajs/react";
import {
  Plus,
  X,
  ArrowLeft,
  Briefcase,
  IndianRupee,
  Users,
  CheckCircle2,
  Flame,
} from "lucide-react";

const INDIAN_CITIES = [
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Noida",
  "Gurugram",
  "Jaipur",
  "Lucknow",
  "Indore",
  "Bhopal",
  "Chandigarh",
];

const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
];

const WORK_MODES = ["On-site", "Remote", "Hybrid"];

const EXP_OPTIONS = [
  "Fresher",
  "0-1 Year",
  "1-2 Years",
  "2-3 Years",
  "3-5 Years",
  "5-7 Years",
  "7-10 Years",
  "10+ Years",
];

export default function CreateJob({
  companies: propCompanies = [],
  categories: propCategories = [],
  skills: propSkills = [],
  teamMembers: propTeamMembers = [],
}) {
  const { auth } = usePage().props;
  const currentUser = auth?.admin;

  // Fallbacks if props are empty
  const defaultCompanies = [
    { id: 1, name: "TechMahindra", industry: "IT Services", active: true },
    { id: 2, name: "Apex Corp", industry: "Logistics", active: true },
    { id: 3, name: "FinVeda Solutions", industry: "Fintech", active: true },
  ];

  const defaultCategories = [
    {
      id: 1,
      name: "IT & Software",
      icon: "💻",
      subcategories: [
        { id: 101, name: "Frontend Developer" },
        { id: 102, name: "Backend Developer" },
        { id: 103, name: "Full Stack Engineer" },
      ],
    },
    {
      id: 2,
      name: "Telecalling & BPO",
      icon: "📞",
      subcategories: [
        { id: 201, name: "Inbound Support" },
        { id: 202, name: "Outbound Sales" },
      ],
    },
  ];

  const defaultSkills = [
    { id: 1, name: "React", active: true, demand: "high" },
    { id: 2, name: "Node.js", active: true, demand: "high" },
    { id: 3, name: "Telecalling", active: true, demand: "high" },
    { id: 4, name: "Sales & Negotiation", active: true, demand: "medium" },
    { id: 5, name: "Customer Support", active: true, demand: "high" },
  ];

  const defaultTeamMembers = [
    { id: 101, name: "Calling Team 1", role: "calling_team", active: true },
    { id: 102, name: "Calling Team 2", role: "calling_team", active: true },
  ];

  const companiesList = propCompanies.length > 0 ? propCompanies : defaultCompanies;
  const categoriesList = propCategories.length > 0 ? propCategories : defaultCategories;
  const skillsList = propSkills.length > 0 ? propSkills : defaultSkills;
  const activeTM = propTeamMembers.length > 0 ? propTeamMembers : defaultTeamMembers;

  const { data, setData, post, processing, errors } = useForm({
    title: "",
    company: "",
    category: "",
    subcategory: "",
    location: "",
    workMode: "On-site",
    type: "Full-time",
    exp: "2-3 Years",
    salaryMin: "",
    salaryMax: "",
    openings: "1",
    deadline: "",
    isHot: false,
    desc: "",
    responsibilities: [""],
    requirements: [""],
    skills: [],
    benefits: [],
    assignedTeamMemberId: "",
    is_draft: false,
  });

  const [benefitInput, setBenefitInput] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const addList = (key) => {
    setData(key, [...data[key], ""]);
  };

  const updateList = (key, idx, val) => {
    const list = [...data[key]];
    list[idx] = val;
    setData(key, list);
  };

  const removeList = (key, idx) => {
    setData(key, data[key].filter((_, i) => i !== idx));
  };

  const toggleSkill = (s) => {
    setData(
      "skills",
      data.skills.includes(s)
        ? data.skills.filter((x) => x !== s)
        : [...data.skills, s]
    );
  };

  const addBenefit = () => {
    if (!benefitInput.trim()) return;
    setData("benefits", [...data.benefits, benefitInput.trim()]);
    setBenefitInput("");
  };

  const selCat = categoriesList.find((c) => c.name === data.category);
  const canSubmit =
    data.title &&
    data.company &&
    data.category &&
    data.location &&
    data.desc &&
    data.salaryMin &&
    data.salaryMax;

  const handleSubmit = (isDraft) => {
    data.is_draft = isDraft;

    post(route("admin.jobs.store", {}, false) || "/admin/jobs", {
      preserveScroll: true,
      onSuccess: () => {
        showToast(isDraft ? "Saved as draft" : "Job submitted for review");
        setTimeout(() => router.visit("/admin/jobs"), 1200);
      },
      onError: () => {
        showToast("Please fill all required fields correctly.");
      },
    });
  };

  const Section = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
      <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-base">
        {Icon && <Icon className="w-4 h-4 text-blue-600" />}
        {title}
      </h2>
      {children}
    </div>
  );

  const Label = ({ children }) => (
    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
      {children}
    </label>
  );

  return (
    <>
      <Head title="Post a New Job - WorkIndia Admin" />

      <div className="p-6 pb-28 max-w-4xl mx-auto">
        {toast && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> {toast}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/admin/jobs"
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Post a New Job</h1>
            <p className="text-sm text-gray-500">
              Posted by {currentUser?.name || "Admin"} · Will go for review
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* ── Basic Info ── */}
          <Section title="Basic Information" icon={Briefcase}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Job Title *</Label>
                <input
                  value={data.title}
                  onChange={(e) => setData("title", e.target.value)}
                  placeholder="e.g. Senior Telecaller / React Developer"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <Label>Company *</Label>
                <select
                  value={data.company}
                  onChange={(e) => setData("company", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select company</option>
                  {companiesList.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} {c.industry ? `– ${c.industry}` : ""}
                    </option>
                  ))}
                </select>
                {errors.company && (
                  <p className="text-xs text-red-500 mt-1">{errors.company}</p>
                )}
              </div>

              <div>
                <Label>Category *</Label>
                <select
                  value={data.category}
                  onChange={(e) => {
                    setData((prev) => ({
                      ...prev,
                      category: e.target.value,
                      subcategory: "",
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select category</option>
                  {categoriesList.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-xs text-red-500 mt-1">{errors.category}</p>
                )}
              </div>

              {selCat && selCat.subcategories && selCat.subcategories.length > 0 && (
                <div>
                  <Label>Subcategory</Label>
                  <select
                    value={data.subcategory}
                    onChange={(e) => setData("subcategory", e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select subcategory</option>
                    {selCat.subcategories.map((sc) => (
                      <option key={sc.id} value={sc.name}>
                        {sc.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <Label>Location / City *</Label>
                <select
                  value={data.location}
                  onChange={(e) => setData("location", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select city</option>
                  {INDIAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.location && (
                  <p className="text-xs text-red-500 mt-1">{errors.location}</p>
                )}
              </div>

              <div>
                <Label>Job Type</Label>
                <select
                  value={data.type}
                  onChange={(e) => setData("type", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {JOB_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Work Mode */}
              <div>
                <Label>Work Mode</Label>
                <div className="flex gap-2">
                  {WORK_MODES.map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setData("workMode", m)}
                      className={`flex-1 py-2.5 text-xs rounded-xl font-semibold border transition-all cursor-pointer ${
                        data.workMode === m
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hot Job Toggle */}
              <div className="flex items-center gap-3 pt-5">
                <button
                  type="button"
                  onClick={() => setData("isHot", !data.isHot)}
                  className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${
                    data.isHot ? "bg-orange-500" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${
                      data.isHot ? "left-[26px]" : "left-0.5"
                    }`}
                  />
                </button>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 select-none">
                  <Flame
                    className={`w-4 h-4 ${
                      data.isHot ? "text-orange-500" : "text-gray-400"
                    }`}
                  />{" "}
                  Hot Job Priority
                </label>
              </div>
            </div>
          </Section>

          {/* ── Compensation & Requirements ── */}
          <Section title="Compensation & Requirements" icon={IndianRupee}>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label>Min Salary (LPA) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={data.salaryMin}
                    onChange={(e) => setData("salaryMin", e.target.value)}
                    placeholder="3.5"
                    className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <Label>Max Salary (LPA) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={data.salaryMax}
                    onChange={(e) => setData("salaryMax", e.target.value)}
                    placeholder="6.0"
                    className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <Label>Experience Required</Label>
                <select
                  value={data.exp}
                  onChange={(e) => setData("exp", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {EXP_OPTIONS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Number of Openings</Label>
                <input
                  type="number"
                  min="1"
                  value={data.openings}
                  onChange={(e) => setData("openings", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <Label>Application Deadline</Label>
                <input
                  type="date"
                  value={data.deadline}
                  onChange={(e) => setData("deadline", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </Section>

          {/* ── Job Content ── */}
          <Section title="Job Content">
            <div className="space-y-5">
              <div>
                <Label>Job Description *</Label>
                <textarea
                  value={data.desc}
                  onChange={(e) => setData("desc", e.target.value)}
                  rows={5}
                  placeholder="Describe the role, candidate day-to-day work, target metrics and job overview..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {errors.desc && (
                  <p className="text-xs text-red-500 mt-1">{errors.desc}</p>
                )}
              </div>

              {["responsibilities", "requirements"].map((key) => (
                <div key={key}>
                  <Label>
                    {key === "responsibilities"
                      ? "Responsibilities"
                      : "Requirements / Qualifications"}
                  </Label>
                  <div className="space-y-2">
                    {data[key].map((item, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="text-xs text-gray-400 w-5 shrink-0 text-right">
                          {i + 1}.
                        </span>
                        <input
                          value={item}
                          onChange={(e) => updateList(key, i, e.target.value)}
                          placeholder={
                            key === "responsibilities"
                              ? "e.g. Conduct outbound candidate verification calls"
                              : "e.g. 12th pass / Graduate with fluent Hindi communication"
                          }
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {data[key].length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeList(key, i)}
                            className="p-1.5 text-gray-300 hover:text-red-400 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addList(key)}
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold ml-7 mt-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add{" "}
                      {key === "responsibilities"
                        ? "Responsibility"
                        : "Requirement"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Skills & Benefits ── */}
          <Section title="Skills & Perks">
            <div className="space-y-5">
              <div>
                <Label>Required Skills</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {skillsList.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => toggleSkill(s.name)}
                      className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl font-medium border transition-all cursor-pointer ${
                        data.skills.includes(s.name)
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {s.name}
                      {s.demand === "high" && (
                        <Flame
                          className={`w-3 h-3 ${
                            data.skills.includes(s.name)
                              ? "text-orange-300"
                              : "text-orange-400"
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>
                {data.skills.length > 0 && (
                  <p className="text-xs text-gray-400">
                    Selected:{" "}
                    <span className="text-blue-600 font-medium">
                      {data.skills.join(", ")}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <Label>Perks & Benefits</Label>
                <div className="flex gap-2 mb-3">
                  <input
                    value={benefitInput}
                    onChange={(e) => setBenefitInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addBenefit();
                      }
                    }}
                    placeholder="e.g. Health Insurance, Incentives, Flexible Hours…"
                    className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                {data.benefits.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {data.benefits.map((b, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1.5 rounded-xl font-medium"
                      >
                        {b}
                        <button
                          type="button"
                          onClick={() =>
                            setData(
                              "benefits",
                              data.benefits.filter((_, idx) => idx !== i)
                            )
                          }
                          className="text-green-400 hover:text-green-700 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* ── Team Assignment ── */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-xs">
            <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2 text-base">
              <Users className="w-4 h-4 text-blue-600" /> Assign to Calling Team Member
              <span className="text-xs font-normal text-blue-400 ml-1">
                (Optional)
              </span>
            </h2>
            <p className="text-xs text-blue-700/70 mb-4">
              Applications for this job will automatically route to the selected calling team member.
            </p>
            <select
              value={data.assignedTeamMemberId}
              onChange={(e) => setData("assignedTeamMemberId", e.target.value)}
              className="w-full sm:w-96 px-3.5 py-2.5 border border-blue-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">— No assignment (Admin handles) —</option>
              {activeTM.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} · {m.activeTask ? m.activeTask : "Available"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3 justify-end shadow-xl z-20">
          <Link
            href="/admin/jobs"
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={processing}
            className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-100 font-medium cursor-pointer transition"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={!canSubmit || processing}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            {processing ? "Submitting..." : "Submit for Review"}
          </button>
        </div>
      </div>
    </>
  );
}

// Sidebar Layout Wrapper
CreateJob.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;
