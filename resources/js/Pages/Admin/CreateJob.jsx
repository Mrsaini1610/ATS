
import React, { useState, useEffect } from "react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";
import { Head, usePage, useForm, Link } from "@inertiajs/react";
import {
  ArrowLeft,
  CheckCircle2,
  Plus,
  X,
  Search,
  Briefcase,
  UserCheck,
  Building2,
  Clock,
  FileText,
  ChevronDown,
} from "lucide-react";

const JOB_TYPES = ["Full Time", "Part Time", "Contract", "Freelance", "Internship"];
const EXP_OPTIONS = ["Any", "Fresher Only", "Experienced Only"];
const EDUCATION_LEVELS = ["10th Pass", "12th Pass", "Graduate", "Postgraduate"];
const LANGUAGES_LIST = ["Hindi", "English"];
const SALARY_TYPES = [
  { label: "Monthly", value: "monthly" },
  { label: "Weekly", value: "weekly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Half Yearly", value: "halfyearly" },
  { label: "Yearly", value: "yearly" }
];

const ASSETS_LIST = [
  "Bike", "License", "Identity Document", "PAN Card", "Heavy Driver License",
  "Camera", "Laptop", "Auto / Rickshaw", "Tempo", "Tempo Traveller / Van", "Yulu / E-Bike"
];

const CERTIFICATIONS_LIST = [
  "Accountant (CCA)", "ANM Certificate", "AutoCAD (CCA)", "Basic Excel", "Computer Certificate",
  "Digital Marketing", "DMLT", "GNM Certificate", "Sales and Marketing (CSM)", "Tally ERP 9 (Tally)",
  "3D Visualization and Rendering (C3VR)", "ADCA", "Adobe Illustrator (CAI)", "Adobe InDesign (CAI)",
  "Adobe Photoshop (CAP)", "Advanced Excel", "Advanced Excel for Accounting (CAEA)", "Architectural Drafting and Design (CADD)",
  "Architectural Visualization (CAV)", "Articleship", "Auditing and Taxation (CAT)", "AutoCAD and 3D Modeling (CADM)",
  "Automobile Servicing (CAS)", "Back-end Development (CBD)", "Baking and Pastry (CBP)", "Banking and Finance (CBF)",
  "Beauty and Wellness (CBW)", "Beauty Therapy (CBT)", "Blogging and SEO (CBSEO)", "Blood Banking and Immunology (CBBI)",
  "Building Codes and Regulations (CBCR)", "Business Development (CBD)", "Business Proposal Writing (CBPW)", "C++",
  "Career Counselling (CCC)", "CCC", "CCNA", "Certified Chartered Accountant (CCA)", "Certified Financial Accountant (CFA)",
  "Clinical Pathology (CCP)", "Clinical Pathology and Diagnostics (CCPD)", "Clinical Research and Trials (CCRT)",
  "CNC Machining (CCNC)", "Compensation and Benefits Management (CCBM)", "Computer Hardware and Networking (CCHN)",
  "Computer Programming (CCP)", "Computer Typing (CCT)", "Construction Materials and Techniques (CMT)", "Content Marketing (CCM)",
  "Content Writing (CCW)", "Contract Law (CCL)", "COPA", "Copywriting and Editing (CCE)", "Corporate Finance and Investment Banking (CCFIB)",
  "Course On Computer Concepts", "Customer Relationship Management (CCRM)", "Customer Service Skills (CCSS)", "Data Entry and Typing Skills (CDETS)",
  "Data Entry Operator", "Database Management (CDM)", "Dental Hygiene and Assisting (CDHA)", "DRA", "DTP", "Email Marketing (CEM)",
  "Employee Relations and Labor Laws (CERLL)", "Engine Overhauling and Repair (CEOR)", "Event Production and Execution (CEPE)",
  "Fashion Designing (CFD)", "Financial Analysis and Reporting (CFAR)", "Food and Beverage Service (CFBS)", "Food Safety and Hygiene (CFSH)",
  "Front Office Operations (CFOO)", "Front-end Development (CFD)", "Front-end Web Development (CFWD)", "Full Stack Development (CFSD)",
  "Google Ads (CGA)", "Google Analytics (CGA)", "Graphic Design (CGD)", "GST (Goods and Services Tax) (GST)", "Hair Styling and Designing (CHSD)",
  "Hardware And Networking", "History of Architecture and Art (CHAA)", "Hotel Front Office Management (CHFOM)", "Hotel Management",
  "Hotel Operations (CHO)", "HR Analytics (CHRA)", "Human Resource Management (CHRM)", "Industrial Training (CIT)", "Intellectual Property Rights (CIPR)",
  "International Cuisine (CIC)", "International Financial Reporting Standards (IFRS) (CIFRS)", "Java Programming (CJP)", "Laundry Operations (CLO)",
  "Leadership and Management Development (CLMD)", "Legal and Medical Transcription (CLMT)", "Legal Studies (CLS)", "Machine Operation (CMO)",
  "Makeup Artistry (CMA)", "Manufacturing Processes (CMP)", "Market Research and Analysis (CMRA)", "Marketing Management (CMM)",
  "Marriage and Family Counselling (CMFC)", "Medical Ethics and Professionalism (CMEP)", "Medical Lab Technology (CMLT)", "Microbiology and Serology (CMS)",
  "Mobile App Development (CMAD)", "MS CIT", "Ms Office", "Nail Art and Extensions (CNAE)", "National Trade Certificate", "NCC", "NCVT",
  "Negotiation and Persuasion Skills (CNPS)", "Negotiation Skills and Techniques (CNST)", "Network Administration (CNA)", "NSS",
  "Online Advertising and PPC (COAP)", "Pattern Making and Garment Construction (CPMGC)", "Payroll Management (CPM)", "Performance Management and Appraisal (CPMA)",
  "PGDCA", "Pharmaceutical Analysis (CPA)", "Photography Lighting and Composition (CPLC)", "Print Production (CPP)", "Project Management for Architects (CPMA)",
  "Python Programming (CPP)", "Quality Control and Assurance (CQCA)", "Recruitment and Selection (CRS)", "Relationship Selling (CRS)", "RS-CIT", "Sales",
  "SAP FICO", "Search Engine Optimization (CSEO)", "Skin and Hair Care (CSHC)", "Social Media Marketing (CSMM)", "Soft Skills Training (CSST)",
  "Software Development (CSD)", "Software Testing", "Sustainable Design and Green Building (CSDGB)", "Talent Acquisition and Recruitment (CTAR)",
  "Taxation and Audit (CTA)", "Telephone Etiquette and Customer Service (CTECS)", "Textile Designing (CTD)", "Training and Development (CTD)",
  "Troubleshooting and Repairing of Computer Systems (CTRC)", "Typewriting (CT)", "Vehicle Diagnostics (CVD)", "Vendor Management and Coordination (CVMC)",
  "Video Editing and Post Production (CVEPP)", "Web Development (CWD)"
];

const SKILLS_LIST = [
  "Telecalling", "Sales", "Business Development", "React JS", "Node JS",
  "Graphic Design", "Digital Marketing", "Accounting", "Data Entry", "Customer Support",
  "Python", "Java", "PHP", "Laravel", "MySQL", "Content Writing", "HR Recruiting", "Communication", "English Speaking"
];

const INDUSTRIES_LIST = [
  "Any Industry", "Retail", "Finance", "Health Care", "Real Estate",
  "Consumer Goods (FMCG)", "BPO / Call Centre", "Banking", "Advertising and Marketing",
  "Insurance", "Telecom / ISP", "Credit Card", "Automobile", "Loan"
];

const getToday = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

const validateJob = (data, activeFields) => {
  const validationErrors = {};
  const trimmed = (value) => String(value || "").trim();
  const numberValue = (value) => Number(value);
  const isValidNumber = (value) => value !== "" && Number.isFinite(numberValue(value));

  if (!trimmed(data.title)) validationErrors.title = "Job title is required.";
  else if (!/[A-Za-z]/.test(data.title) || !/^[A-Za-z0-9\s&'().,+/-]+$/.test(data.title)) validationErrors.title = "Enter a valid job title.";
  if (!trimmed(data.categoryId)) validationErrors.categoryId = "Category is required.";
  if (!trimmed(data.company_uuid)) validationErrors.company_uuid = "Company is required.";
  if (!trimmed(data.location)) validationErrors.location = "Location is required.";
  if (!isValidNumber(data.openings) || !Number.isInteger(numberValue(data.openings)) || numberValue(data.openings) < 1) validationErrors.openings = "Enter at least 1 whole opening.";
  if (!trimmed(data.lastDate)) validationErrors.lastDate = "Last date is required.";
  else if (new Date(`${data.lastDate}T00:00:00`) < getToday()) validationErrors.lastDate = "Last date cannot be in the past.";

  if (data.exp === "Any") {
    if (!isValidNumber(data.maxExp) || numberValue(data.maxExp) < 0) validationErrors.maxExp = "Enter a valid maximum experience.";
  } else if (data.exp === "Experienced Only") {
    if (!isValidNumber(data.minExp) || numberValue(data.minExp) < 0) validationErrors.minExp = "Enter a valid minimum experience.";
    if (!isValidNumber(data.maxExp) || numberValue(data.maxExp) < 0) validationErrors.maxExp = "Enter a valid maximum experience.";
    if (!validationErrors.minExp && !validationErrors.maxExp && numberValue(data.maxExp) < numberValue(data.minExp)) validationErrors.maxExp = "Maximum experience must be at least the minimum.";
  }
  if (!isValidNumber(data.salaryMin) || numberValue(data.salaryMin) <= 0) validationErrors.salaryMin = "Enter a positive minimum salary.";
  if (!isValidNumber(data.salaryMax) || numberValue(data.salaryMax) <= 0) validationErrors.salaryMax = "Enter a positive maximum salary.";
  if (!validationErrors.salaryMin && !validationErrors.salaryMax && numberValue(data.salaryMax) < numberValue(data.salaryMin)) validationErrors.salaryMax = "Maximum salary must be at least the minimum.";
  if (!trimmed(data.desc)) validationErrors.desc = "Description is required.";
  else if (data.desc.length > 350) validationErrors.desc = "Description cannot exceed 350 characters.";
  if (!data.skills.length) validationErrors.skills = "Select at least one skill.";

  if (activeFields.age) {
    if (!isValidNumber(data.minAge) || numberValue(data.minAge) < 0) validationErrors.minAge = "Enter a valid minimum age.";
    if (!isValidNumber(data.maxAge) || numberValue(data.maxAge) < 0) validationErrors.maxAge = "Enter a valid maximum age.";
    if (!validationErrors.minAge && !validationErrors.maxAge && numberValue(data.maxAge) < numberValue(data.minAge)) validationErrors.maxAge = "Maximum age must be at least the minimum.";
  }
  if (activeFields.language && !data.languages.length) validationErrors.languages = "Select at least one language.";
  if (activeFields.assets && !data.assets.length) validationErrors.assets = "Select at least one asset.";
  if (activeFields.degree && !data.qualifications.length) validationErrors.qualifications = "Select at least one degree.";
  if (activeFields.certification && !data.certifications.length) validationErrors.certifications = "Select at least one certification.";
  if (activeFields.industry && !data.preferredIndustry.length) validationErrors.preferredIndustry = "Select at least one industry.";
  if (!trimmed(data.shiftTiming)) validationErrors.shiftTiming = "Shift timing is required.";
  if (!trimmed(data.interviewDetails)) validationErrors.interviewDetails = "Interview details are required.";
  if (!trimmed(data.contactPersonName)) validationErrors.contactPersonName = "Contact person is required.";
  if (!/^\d{10}$/.test(trimmed(data.contactPhone))) validationErrors.contactPhone = "Phone must contain exactly 10 digits.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed(data.contactEmail))) validationErrors.contactEmail = "Enter a valid email address.";
  if (!trimmed(data.companyAddress)) validationErrors.companyAddress = "Company address is required.";

  return validationErrors;
};

export default function CreateJob({ companies = [], categories = [], teamMembers = [] }) {
  const { auth } = usePage().props;
  const currentUser = auth?.admin;

  const { data, setData, post, processing, errors } = useForm({
    title: "",
    company_uuid: "",
    location: "",
    categoryId: "",
    subCategoryId: "",
    type: "Full Time",
    exp: "Any",
    minExp: "0",
    maxExp: "",
    salaryMin: "",
    salaryMax: "",
    salaryType: "monthly",
    openings: "",
    lastDate: "",
    desc: "",
    skills: [],
    languages: [],
    qualifications: [],
    minAge: "",
    maxAge: "",
    assets: [],
    certifications: [],
    preferredIndustry: [], // <-- Ab yeh array ban gaya hai multi-select ke liye
    shiftTiming: "9:30 AM - 6:30 PM | Monday to Saturday",
    interviewDetails: "11:00 AM - 4:00 PM | Monday to Saturday",

    contactPersonName: "",
    contactPhone: "",
    contactEmail: "",
    assignedToId: "",
    company_size: "1 - 10 employees",
    fillPositionUrgency: "Immediately (1-2 weeks)",
    hiringFrequency: "Every Month",
    companyAddress: "",
    activeFields: {
      skills: false,
      age: false,
      language: false,
      assets: false,
      degree: false,
      certification: false,
      industry: false,
    },
    is_draft: false,
  });

  const [activeFields, setActiveFields] = useState({
    skills: false,
    age: false,
    language: false,
    assets: false,
    degree: false,
    certification: false,
    industry: false,
  });

  const [openDropdowns, setOpenDropdowns] = useState({
    contactPerson: false,
  });

  const toggleDropdown = (field) => {
    setOpenDropdowns(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleField = (field) => {
    setActiveFields((prev) => {
      const next = { ...prev, [field]: !prev[field] };
      setData("activeFields", next);
      return next;
    });
  };

  const [toast, setToast] = useState(null);
  const [clientErrors, setClientErrors] = useState({});
  const [certSearch, setCertSearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");

  useEffect(() => {
    if (Object.keys(clientErrors).length > 0) {
      setClientErrors(validateJob(data, activeFields));
    }
  }, [data, activeFields]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const selectedCategoryObj = categories.find(c => String(c.id) === String(data.categoryId));
  const subcategoriesList = selectedCategoryObj ? selectedCategoryObj.subcategories : [];

  const handleCompanyChange = (uuid) => {
    setData("company_uuid", uuid);
    const selectedCompany = companies.find(c => c.uuid === uuid);
    if (selectedCompany) {
      setData(prev => ({
        ...prev,
        company_uuid: uuid,
        location: selectedCompany.location || prev.location,
        companyAddress: selectedCompany.location || prev.companyAddress,
        company_size: selectedCompany.company_size || prev.company_size
      }));
    }
  };

  const handleStaffSelect = (staff) => {
    let roleLabel = staff.role === 'super_admin' ? 'Super Admin' : (staff.role === 'admin' ? 'Admin' : 'HR/Recruiter');
    const formattedName = `${staff.name} (${roleLabel})`;

    setData(prev => ({
      ...prev,
      contactPersonName: formattedName,
      contactPhone: staff.phone ? staff.phone.replace("+91", "").trim() : prev.contactPhone,
      contactEmail: staff.email || prev.contactEmail,
      assignedToId: staff.id
    }));
    setOpenDropdowns(prev => ({ ...prev, contactPerson: false }));
  };

  const filteredStaff = teamMembers.filter(staff =>
    staff.name.toLowerCase().includes(staffSearch.toLowerCase())
  );

  const toggleSelection = (key, value) => {
    const current = data[key];
    if (current.includes(value)) {
      setData(key, current.filter((item) => item !== value));
    } else {
      setData(key, [...current, value]);
    }
  };

  const filteredCerts = CERTIFICATIONS_LIST.filter(cert =>
    cert.toLowerCase().includes(certSearch.toLowerCase())
  );

  const filteredSkills = SKILLS_LIST.filter(skill =>
    skill.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const validationErrors = validateJob(data, activeFields);

  const getFieldError = (field) => clientErrors[field] || errors[field];
  const fieldClass = (field, className) => `${className} ${getFieldError(field) ? "border-red-500 focus:ring-red-500" : ""}`;

  const handleSubmit = (isDraft) => {
    if (!isDraft) {
      const nextErrors = validateJob(data, activeFields);
      setClientErrors(nextErrors);
      if (Object.keys(nextErrors).length) {
        showToast("Please check all required fields.");
        return;
      }
    }

    data.is_draft = isDraft;
    post(route("admin.jobs.store"), {
      preserveScroll: true,
      onSuccess: () => {
        showToast(isDraft ? "Saved as draft" : "Job submitted successfully");
      },
      onError: () => {
        showToast("Please check all required fields.");
      },
    });
  };

  return (
    <>
      <Head title="Post a New Job - ATS Admin" />

      <div className="w-full px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-32 space-y-4 font-sans text-gray-800 bg-gray-50/50 min-h-screen">
        {toast && (
          <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm max-w-[90vw]">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /> <span className="truncate">{toast}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 bg-white px-4 sm:px-6 py-4 rounded-2xl sm:rounded-3xl border border-indigo-50 shadow-xs">
          <Link href={route("admin.jobs.index")} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight truncate">Post a New Job</h1>
            <p className="text-xs text-gray-500 truncate">Created by {currentUser?.name || "Admin"}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Basic Job Details */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-indigo-50 p-4 sm:p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-xs uppercase tracking-wider text-indigo-600 border-b border-indigo-50 pb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-500" /> Basic Job Detail
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Job Type *</label>
                <div className="flex flex-wrap gap-2.5">
                  {JOB_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setData("type", t)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${data.type === t ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Job Title *</label>
                <input
                  value={data.title}
                  onChange={(e) => setData("title", e.target.value)}
                  placeholder="Enter the Job Title (e.g. Senior Telecaller)"
                  className={fieldClass("title", "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50")}
                />
                {getFieldError("title") && <p className="text-xs text-red-500 mt-1">{getFieldError("title")}</p>}
              </div>

              {/* Dynamic Category & Subcategory Selection */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Category *</label>
                  <select
                    value={data.categoryId}
                    onChange={(e) => setData(prev => ({ ...prev, categoryId: e.target.value, subCategoryId: "" }))}
                    className={fieldClass("categoryId", "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/50 outline-none focus:ring-2 focus:ring-indigo-500")}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                  {getFieldError("categoryId") && <p className="text-xs text-red-500 mt-1">{getFieldError("categoryId")}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Subcategory</label>
                  <select
                    value={data.subCategoryId}
                    onChange={(e) => setData("subCategoryId", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/50 outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={!subcategoriesList.length}
                  >
                    <option value="">Select Subcategory</option>
                    {subcategoriesList.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">No Of Openings *</label>
                  <input
                    type="number"
                    value={data.openings}
                    onChange={(e) => setData("openings", e.target.value)}
                    placeholder="e.g. 2"
                    className={fieldClass("openings", "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50")}
                  />
                  {getFieldError("openings") && <p className="text-xs text-red-500 mt-1">{getFieldError("openings")}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Last Date to Apply *</label>
                  <input
                    type="date"
                    value={data.lastDate}
                    onChange={(e) => setData("lastDate", e.target.value)}
                    className={fieldClass("lastDate", "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50/50")}
                  />
                  {getFieldError("lastDate") && <p className="text-xs text-red-500 mt-1">{getFieldError("lastDate")}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Candidate Requirement & Salary Type */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-indigo-50 p-4 sm:p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-xs uppercase tracking-wider text-blue-600 border-b border-indigo-50 pb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-500" /> Candidate Requirement & Salary
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Total Experience of Candidate *</label>
                <div className="flex flex-wrap gap-2.5">
                  {EXP_OPTIONS.map((exp) => (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => setData("exp", exp)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${data.exp === exp ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>

              {data.exp === "Any" && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-100 text-xs text-blue-800 font-semibold">
                    ✓ Both freshers and experienced candidates will be able to Call/Apply.
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Minimum Experience</label>
                      <input type="text" value="0 Years (Fresher)" disabled className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-500 font-medium cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Maximum Experience (Years) *</label>
                      <input type="number" value={data.maxExp} onChange={(e) => setData("maxExp", e.target.value)} placeholder="e.g. 5" className={fieldClass("maxExp", "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50")} />
                      {getFieldError("maxExp") && <p className="text-xs text-red-500 mt-1">{getFieldError("maxExp")}</p>}
                    </div>
                  </div>
                </div>
              )}

              {data.exp === "Fresher Only" && (
                <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-100 text-xs text-blue-800 font-semibold">
                  ✓ Only Fresher candidates upto 6 months of experience will be able to Call/Apply.
                </div>
              )}

              {data.exp === "Experienced Only" && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Minimum Experience (Years) *</label>
                    <input type="number" value={data.minExp} onChange={(e) => setData("minExp", e.target.value)} placeholder="e.g. 1" className={fieldClass("minExp", "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50")} />
                    {getFieldError("minExp") && <p className="text-xs text-red-500 mt-1">{getFieldError("minExp")}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Maximum Experience (Years) *</label>
                    <input type="number" value={data.maxExp} onChange={(e) => setData("maxExp", e.target.value)} placeholder="e.g. 5" className={fieldClass("maxExp", "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50")} />
                    {getFieldError("maxExp") && <p className="text-xs text-red-500 mt-1">{getFieldError("maxExp")}</p>}
                  </div>
                </div>
              )}

              {/* Salary Type Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Salary Type *</label>
                <div className="flex flex-wrap gap-2.5">
                  {SALARY_TYPES.map((st) => (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => setData("salaryType", st.value)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${data.salaryType === st.value ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">In-hand salary (Min) *</label>
                    <input
                    type="number"
                    value={data.salaryMin}
                    onChange={(e) => setData("salaryMin", e.target.value)}
                    placeholder="e.g. 15000"
                    className={fieldClass("salaryMin", "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50")}
                  />
                  {getFieldError("salaryMin") && <p className="text-xs text-red-500 mt-1">{getFieldError("salaryMin")}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">In-hand salary (Max) *</label>
                  <input
                    type="number"
                    value={data.salaryMax}
                    onChange={(e) => setData("salaryMax", e.target.value)}
                    placeholder="e.g. 30000"
                    className={fieldClass("salaryMax", "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50")}
                  />
                  {getFieldError("salaryMax") && <p className="text-xs text-red-500 mt-1">{getFieldError("salaryMax")}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Job Info / Job Description *</label>
                <textarea
                  value={data.desc}
                  onChange={(e) => setData("desc", e.target.value)}
                  rows={3}
                  maxLength={350}
                  placeholder="Write clear description about role, duties and expectations..."
                  className={fieldClass("desc", "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50")}
                />
                {getFieldError("desc") && <p className="text-xs text-red-500 mt-1">{getFieldError("desc")}</p>}
                <p className="text-right text-xs text-gray-400 mt-1">Remaining characters: {350 - data.desc.length}</p>
              </div>

              {/* Skills Selector */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Skills Required *</label>
                  <button
                    type="button"
                    onClick={() => toggleField("skills")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-all ${activeFields.skills ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                      }`}
                  >
                    <Plus className="w-3.5 h-3.5" /> {activeFields.skills ? "Close Skills" : "Add Skills"}
                  </button>
                </div>
                {getFieldError("skills") && <p className="text-xs text-red-500 mt-1">{getFieldError("skills")}</p>}

                {data.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-blue-50/30 rounded-2xl border border-blue-100/50">
                    {data.skills.map((s, i) => (
                      <span key={i} className="bg-blue-600 text-white px-3 py-1 rounded-xl text-xs flex items-center gap-1.5 font-bold shadow-xs">
                        {s} <button onClick={() => toggleSelection("skills", s)} className="cursor-pointer hover:bg-blue-700 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}

                {activeFields.skills && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 mt-2">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={skillSearch}
                        onChange={(e) => setSkillSearch(e.target.value)}
                        placeholder="Search skills..."
                        className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 border border-gray-200 rounded-xl p-2 bg-white">
                      {filteredSkills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSelection("skills", skill)}
                          className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-between ${data.skills.includes(skill) ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-gray-50 text-gray-700"
                            }`}
                        >
                          <span>{skill}</span>
                          {data.skills.includes(skill) && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personal details, Education, additional info */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-indigo-50 p-4 sm:p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-xs uppercase tracking-wider text-teal-600 border-b border-indigo-50 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-500" /> Personal Details, Education & Additional Info
            </h2>

            <div className="flex flex-wrap gap-2.5">
              {[
                { key: "age", label: "Age" },
                { key: "language", label: "Preferred Language" },
                { key: "assets", label: "Assets" },
                { key: "degree", label: "Degree and Specialisation" },
                { key: "certification", label: "Certification" },
                { key: "industry", label: "Preferred Industry" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleField(item.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${activeFields[item.key] ? "bg-teal-600 text-white border-teal-600 shadow-sm" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                >
                  {item.label} <Plus className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            {activeFields.age && (
              <div className="p-4 bg-teal-50/30 rounded-2xl border border-teal-100 space-y-3 mt-2">
                <div className="flex justify-between items-center"><span className="text-xs font-bold text-teal-900 uppercase">Age Limit</span><button onClick={() => toggleField("age")} className="cursor-pointer text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="number" placeholder="Min Age" value={data.minAge} onChange={(e) => setData("minAge", e.target.value)} className={fieldClass("minAge", "p-3 border border-gray-200 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-teal-500")} />
                  <input type="number" placeholder="Max Age" value={data.maxAge} onChange={(e) => setData("maxAge", e.target.value)} className={fieldClass("maxAge", "p-3 border border-gray-200 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-teal-500")} />
                </div>
                {getFieldError("minAge") && <p className="text-xs text-red-500">{getFieldError("minAge")}</p>}
                {getFieldError("maxAge") && <p className="text-xs text-red-500">{getFieldError("maxAge")}</p>}
              </div>
            )}

            {activeFields.language && (
              <div className="p-4 bg-teal-50/30 rounded-2xl border border-teal-100 space-y-3 mt-2">
                <div className="flex justify-between items-center"><span className="text-xs font-bold text-teal-900 uppercase">Preferred Language</span><button onClick={() => toggleField("language")} className="cursor-pointer text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button></div>
                <div className="flex gap-2.5">
                  {LANGUAGES_LIST.map((lang) => (
                    <button key={lang} type="button" onClick={() => toggleSelection("languages", lang)} className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition ${data.languages.includes(lang) ? "bg-teal-600 text-white border-teal-600 shadow-sm" : "bg-white text-gray-600 border-gray-200"}`}>
                      {lang} {data.languages.includes(lang) && "✓"}
                    </button>
                  ))}
                </div>
                {getFieldError("languages") && <p className="text-xs text-red-500">{getFieldError("languages")}</p>}
              </div>
            )}

            {activeFields.assets && (
              <div className="p-4 bg-teal-50/30 rounded-2xl border border-teal-100 space-y-3 mt-2">
                <div className="flex justify-between items-center"><span className="text-xs font-bold text-teal-900 uppercase">Assets Required</span><button onClick={() => toggleField("assets")} className="cursor-pointer text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button></div>
                <div className="flex flex-wrap gap-2">
                  {ASSETS_LIST.map((asset) => (
                    <button key={asset} type="button" onClick={() => toggleSelection("assets", asset)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition ${data.assets.includes(asset) ? "bg-teal-600 text-white border-teal-600 shadow-sm" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}>
                      {asset} {data.assets.includes(asset) && "✓"}
                    </button>
                  ))}
                </div>
                {getFieldError("assets") && <p className="text-xs text-red-500">{getFieldError("assets")}</p>}
              </div>
            )}

            {activeFields.degree && (
              <div className="p-4 bg-teal-50/30 rounded-2xl border border-teal-100 space-y-3 mt-2">
                <div className="flex justify-between items-center"><span className="text-xs font-bold text-teal-900 uppercase">Degree and Specialisation</span><button onClick={() => toggleField("degree")} className="cursor-pointer text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button></div>
                <div className="flex flex-wrap gap-2">
                  {EDUCATION_LEVELS.map((edu) => (
                    <button key={edu} type="button" onClick={() => toggleSelection("qualifications", edu)} className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition ${data.qualifications.includes(edu) ? "bg-teal-600 text-white border-teal-600 shadow-sm" : "bg-white text-gray-600 border-gray-200"}`}>
                      {edu} {data.qualifications.includes(edu) && "✓"}
                    </button>
                  ))}
                </div>
                {getFieldError("qualifications") && <p className="text-xs text-red-500">{getFieldError("qualifications")}</p>}
              </div>
            )}

            {activeFields.certification && (
              <div className="p-4 bg-teal-50/30 rounded-2xl border border-teal-100 space-y-3 mt-2">
                <div className="flex justify-between items-center"><span className="text-xs font-bold text-teal-900 uppercase">Certification</span><button onClick={() => toggleField("certification")} className="cursor-pointer text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button></div>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={certSearch} onChange={(e) => setCertSearch(e.target.value)} placeholder="Search certifications..." className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1.5 border border-gray-200 rounded-xl p-2 bg-white">
                  {filteredCerts.map((cert) => (
                    <button key={cert} type="button" onClick={() => toggleSelection("certifications", cert)} className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${data.certifications.includes(cert) ? "bg-teal-50 text-teal-700 font-bold" : "hover:bg-gray-50 text-gray-700"}`}>
                      {cert} {data.certifications.includes(cert) && "✓"}
                    </button>
                  ))}
                </div>
                {getFieldError("certifications") && <p className="text-xs text-red-500">{getFieldError("certifications")}</p>}
              </div>
            )}

            {activeFields.industry && (
              <div className="p-4 bg-teal-50/30 rounded-2xl border border-teal-100 space-y-3 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-teal-900 uppercase">Preferred Industry (Multi-select)</span>
                  <button onClick={() => toggleField("industry")} className="cursor-pointer text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES_LIST.map((ind) => (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => toggleSelection("preferredIndustry", ind)}
                      className={`px-4 py-2 rounded-xl text-xs font-medium border cursor-pointer transition ${data.preferredIndustry.includes(ind)
                          ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      {ind} {data.preferredIndustry.includes(ind) && "✓"}
                    </button>
                  ))}
                </div>
                {getFieldError("preferredIndustry") && <p className="text-xs text-red-500">{getFieldError("preferredIndustry")}</p>}
              </div>
            )}
          </div>

          {/* Timings */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-indigo-50 p-4 sm:p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-xs uppercase tracking-wider text-purple-600 border-b border-indigo-50 pb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" /> Timings
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Job Timings *</label>
                <input value={data.shiftTiming} onChange={(e) => setData("shiftTiming", e.target.value)} className={fieldClass("shiftTiming", "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50/50")} />
                {getFieldError("shiftTiming") && <p className="text-xs text-red-500 mt-1">{getFieldError("shiftTiming")}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Interview Details *</label>
                <input value={data.interviewDetails} onChange={(e) => setData("interviewDetails", e.target.value)} className={fieldClass("interviewDetails", "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50/50")} />
                {getFieldError("interviewDetails") && <p className="text-xs text-red-500 mt-1">{getFieldError("interviewDetails")}</p>}
              </div>
            </div>
          </div>

          {/* About Your Company */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-indigo-50 p-4 sm:p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-xs uppercase tracking-wider text-orange-600 border-b border-indigo-50 pb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-500" /> About Your Company
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Select Company *</label>
                <select
                  value={data.company_uuid}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  className={fieldClass("company_uuid", "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/50 outline-none focus:ring-2 focus:ring-orange-500")}
                >
                  <option value="">Select Company</option>
                  {companies.map((comp) => (
                    <option key={comp.uuid} value={comp.uuid}>
                      {comp.name}
                    </option>
                  ))}
                </select>
                {getFieldError("company_uuid") && <p className="text-xs text-red-500 mt-1">{getFieldError("company_uuid")}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Job Location *</label>
                <input
                  type="text"
                  value={data.location}
                  onChange={(e) => setData("location", e.target.value)}
                  placeholder="e.g. Jaipur, Rajasthan"
                  className={fieldClass("location", "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/50 outline-none focus:ring-2 focus:ring-orange-500")}
                />
                {getFieldError("location") && <p className="text-xs text-red-500 mt-1">{getFieldError("location")}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Custom Click-to-Select Dropdown for Contact Person Name */}
              <div className="relative">
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Contact Person Name & Designation *</label>
                <div
                  onClick={() => toggleDropdown("contactPerson")}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/50 flex items-center justify-between cursor-pointer"
                >
                  <span className={data.contactPersonName ? "text-gray-900 font-medium" : "text-gray-400"}>
                    {data.contactPersonName || "Select Contact Person / Staff"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>

                {openDropdowns.contactPerson && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                        placeholder="Search staff..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {filteredStaff.map((staff) => (
                        <div
                          key={staff.id}
                          onClick={() => handleStaffSelect(staff)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition flex items-center justify-between"
                        >
                          <span>{staff.name}</span>
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                            {staff.role === 'super_admin' ? 'Super Admin' : (staff.role === 'admin' ? 'Admin' : 'HR/Recruiter')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {getFieldError("contactPersonName") && <p className="text-xs text-red-500 mt-1">{getFieldError("contactPersonName")}</p>}
                <p className="text-[11px] text-gray-400 mt-1">Format: Name (Role) auto-generated.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Phone Number *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3.5 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-xs text-gray-500 font-bold">+91</span>
                  <input
                    type="text"
                    value={data.contactPhone}
                    onChange={(e) => setData("contactPhone", e.target.value)}
                    placeholder="9876543210"
                    className={fieldClass("contactPhone", "w-full px-4 py-3 border border-gray-200 rounded-r-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50/50")}
                  />
                </div>
                {getFieldError("contactPhone") && <p className="text-xs text-red-500 mt-1">{getFieldError("contactPhone")}</p>}
                <p className="text-[11px] text-gray-400 mt-1">Candidates will call you on this number.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Email Id *</label>
                <input
                  type="email"
                  value={data.contactEmail}
                  onChange={(e) => setData("contactEmail", e.target.value)}
                  placeholder="company@example.com"
                  className={fieldClass("contactEmail", "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50/50")}
                />
                {getFieldError("contactEmail") && <p className="text-xs text-red-500 mt-1">{getFieldError("contactEmail")}</p>}
                <p className="text-[11px] text-gray-400 mt-1">Candidates will send resumes on this email-id.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">How soon do you want to fill the position? *</label>
                <select
                  value={data.fillPositionUrgency}
                  onChange={(e) => setData("fillPositionUrgency", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/50 outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                >
                  <option value="Immediately (1-2 weeks)">Immediately (1-2 weeks)</option>
                  <option value="Can wait">Can wait</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">How often do you need to hire? *</label>
                <select
                  value={data.hiringFrequency}
                  onChange={(e) => setData("hiringFrequency", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50/50 outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                >
                  <option value="Every Month">Every Month</option>
                  <option value="Once in a few months">Once in a few months</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Job Address *</label>
              <textarea
                rows={2}
                value={data.companyAddress}
                onChange={(e) => setData("companyAddress", e.target.value)}
                placeholder="Enter complete office address..."
                className={fieldClass("companyAddress", "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-orange-500 bg-gray-50/50")}
              />
              {getFieldError("companyAddress") && <p className="text-xs text-red-500 mt-1">{getFieldError("companyAddress")}</p>}
              <p className="text-[11px] text-gray-400 mt-1">(Address ONLY shown to registered candidates) Please fill complete address, mention Landmark near your office</p>
            </div>
          </div>
        </div>

        {/* Centered Footer Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 bg-white p-4 border border-indigo-50 rounded-2xl sm:rounded-3xl shadow-xs">
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="px-6 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 font-bold cursor-pointer transition text-center"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={processing}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-extrabold shadow-md shadow-indigo-600/30 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed text-center"
          >
            {processing ? "Submitting..." : "Submit Job Post"}
          </button>
        </div>
      </div>
    </>
  );
}

CreateJob.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;
