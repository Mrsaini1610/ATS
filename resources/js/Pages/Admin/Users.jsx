import React, { useState, useEffect, useMemo } from "react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";
import { Head, usePage, useForm, router } from "@inertiajs/react";
import {
  Search,
  Phone,
  MapPin,
  Briefcase,
  CheckCircle2,
  X,
  UserPlus,
  Globe,
  Smartphone,
  RefreshCw,
  FileSpreadsheet,
  Download,
  MessageCircle,
  LayoutGrid,
  List,
  Calendar,
  GraduationCap,
  Building2,
  Mail,
  UserCheck,
} from "lucide-react";
import * as XLSX from "xlsx";
import { updateAdminField } from "@/Components/Admin/liveValidation";

const INDIA_LOCATIONS = {
  "Rajasthan": {
    "Jaipur": [
      "Malviya Nagar",
      "Vaishali Nagar",
      "Mansarovar",
      "C-Scheme",
      "Raja Park",
      "Tonk Road",
      "Sikar Road",
      "Vidhyadhar Nagar",
      "Jagatpura",
      "Pratap Nagar",
      "Jhotwara",
      "Sodala",
      "Ajmer Road",
      "Gopalpura",
      "Sitapura Industrial Area",
      "VKI Area",
      "Bani Park",
      "Other Area",
    ],
    "Jodhpur": [
      "Sardarpura",
      "Shastri Nagar",
      "Ratanada",
      "Paota",
      "Mandore",
      "Basni",
      "Other Area",
    ],
    "Udaipur": [
      "Sukhadia Circle",
      "Hiran Magri",
      "Panchwati",
      "Fatehpura",
      "Madhuban",
      "Other Area",
    ],
    "Kota": [
      "Talwandi",
      "Vigyan Nagar",
      "Dadabari",
      "Mahaveer Nagar",
      "Indraprastha Area",
      "Other Area",
    ],
    "Ajmer": [
      "Vaishali Nagar",
      "Panchsheel Nagar",
      "Civil Lines",
      "Adarsh Nagar",
      "Other Area",
    ],
    "Bikaner": ["Kote Gate", "Sadul Ganj", "JNV Colony", "Rani Bazar", "Other Area"],
    "Alwar": ["MIA", "Neemrana", "Bhiwadi", "Scheme 2", "Other Area"],
    "Bhilwara": ["Subhash Nagar", "Bhopalganj", "RCS Circle", "Other Area"],
    "Sikar": ["Piprali Road", "Fatehpur Road", "Station Road", "Other Area"],
    "Other City": ["Other Area"],
  },
  "Delhi / NCR": {
    "Delhi": [
      "Connaught Place",
      "South Extension",
      "Dwarka",
      "Rohini",
      "Saket",
      "Karol Bagh",
      "Laxmi Nagar",
      "Janakpuri",
      "Nehru Place",
      "Pitampura",
      "Okhla",
      "Other Area",
    ],
    "Noida": [
      "Sector 18",
      "Sector 62",
      "Sector 15",
      "Sector 128",
      "Sector 137",
      "Greater Noida (Pari Chowk)",
      "Greater Noida West",
      "Other Area",
    ],
    "Gurugram (Gurgaon)": [
      "Cyber City",
      "Sector 29",
      "Golf Course Road",
      "Sohna Road",
      "DLF Phase 1-5",
      "Sector 14",
      "Udyog Vihar",
      "Manesar",
      "Other Area",
    ],
    "Faridabad": ["Sector 15", "Sector 16", "NIT", "Greenfield", "Other Area"],
    "Ghaziabad": ["Indirapuram", "Vaishali", "Raj Nagar Extension", "Kaushambi", "Other Area"],
    "Other City": ["Other Area"],
  },
  "Maharashtra": {
    "Mumbai": [
      "Andheri",
      "Bandra",
      "Borivali",
      "Dadar",
      "Powai",
      "Thane",
      "Navi Mumbai (Vashi)",
      "Malad",
      "Kurla (BKC)",
      "Goregaon",
      "Other Area",
    ],
    "Pune": [
      "Hinjewadi",
      "Shivaji Nagar",
      "Kothrud",
      "Viman Nagar",
      "Baner",
      "Wakad",
      "Hadapsar (Magarpatta)",
      "Kalyani Nagar",
      "Other Area",
    ],
    "Nagpur": ["Dharampeth", "Sadar", "Civil Lines", "Wardha Road", "Other Area"],
    "Nashik": ["College Road", "Gangapur Road", "Indira Nagar", "Other Area"],
    "Other City": ["Other Area"],
  },
  "Karnataka": {
    "Bengaluru": [
      "Koramangala",
      "Indiranagar",
      "Whitefield",
      "HSR Layout",
      "Electronic City",
      "Jayanagar",
      "Marathahalli",
      "BTM Layout",
      "Hebbal",
      "Bellandur",
      "Other Area",
    ],
    "Mysuru": ["Jayalakshmipuram", "Kuvempunagar", "Vijayanagar", "Other Area"],
    "Hubballi": ["Vidyanagar", "Keshwapur", "Gokul Road", "Other Area"],
    "Other City": ["Other Area"],
  },
  "Telangana": {
    "Hyderabad": [
      "HITEC City",
      "Gachibowli",
      "Madhapur",
      "Banjara Hills",
      "Jubilee Hills",
      "Begumpet",
      "Secunderabad",
      "Kukatpally",
      "Kondapur",
      "Manikonda",
      "Other Area",
    ],
    "Warangal": ["Hanamkonda", "Kazipet", "Subedari", "Other Area"],
    "Other City": ["Other Area"],
  },
  "Uttar Pradesh": {
    "Lucknow": [
      "Gomti Nagar",
      "Hazratganj",
      "Alambagh",
      "Indira Nagar",
      "Mahanagar",
      "Aliganj",
      "Vibhuti Khand",
      "Other Area",
    ],
    "Kanpur": ["Civil Lines", "Swaroop Nagar", "Kakadeo", "Kidwai Nagar", "Other Area"],
    "Agra": ["Sanjay Place", "Tajganj", "Kamla Nagar", "Other Area"],
    "Varanasi": ["Sigra", "Bhelupur", "Lanka", "Shivpur", "Other Area"],
    "Prayagraj": ["Civil Lines", "Katra", "George Town", "Other Area"],
    "Meerut": ["Shastri Nagar", "Modipuram", "Begum Bridge", "Other Area"],
    "Other City": ["Other Area"],
  },
  "Gujarat": {
    "Ahmedabad": [
      "SG Highway",
      "Satellite",
      "Navrangpura",
      "Bodakdev",
      "Prahlad Nagar",
      "Vastrapur",
      "Maninagar",
      "Other Area",
    ],
    "Surat": ["Athwa Lines", "Adajan", "Vesu", "Varachha", "Piplod", "Other Area"],
    "Vadodara": ["Alkapuri", "Sayajigunj", "Manjalpur", "Gotri", "Other Area"],
    "Rajkot": ["Kalawad Road", "Yagnik Road", "University Road", "Other Area"],
    "Other City": ["Other Area"],
  },
  "Madhya Pradesh": {
    "Indore": [
      "Vijay Nagar",
      "Palasia",
      "Bhawarkua",
      "Rajwada",
      "Super Corridor",
      "AB Road",
      "Other Area",
    ],
    "Bhopal": [
      "MP Nagar",
      "Arera Colony",
      "Kolar Road",
      "New Market",
      "Hoshangabad Road",
      "Other Area",
    ],
    "Gwalior": ["City Centre", "Lashkar", "Morar", "Other Area"],
    "Jabalpur": ["Civil Lines", "Wright Town", "Napier Town", "Other Area"],
    "Other City": ["Other Area"],
  },
  "Tamil Nadu": {
    "Chennai": [
      "T. Nagar",
      "Adyar",
      "Velachery",
      "Anna Nagar",
      "OMR",
      "Guindy",
      "Nungambakkam",
      "Other Area",
    ],
    "Coimbatore": ["Gandhipuram", "RS Puram", "Peelamedu", "Saibaba Colony", "Other Area"],
    "Madurai": ["KK Nagar", "Anna Nagar", "Simmakkal", "Other Area"],
    "Other City": ["Other Area"],
  },
  "West Bengal": {
    "Kolkata": [
      "Salt Lake",
      "Park Street",
      "New Town",
      "Howrah",
      "Ballygunge",
      "Rajarhat",
      "Sector V",
      "Other Area",
    ],
    "Siliguri": ["Sevoke Road", "Matigara", "Pradhan Nagar", "Other Area"],
    "Other City": ["Other Area"],
  },
  "Punjab & Haryana": {
    "Chandigarh": [
      "Sector 17",
      "Sector 35",
      "Sector 22",
      "Sector 8",
      "Mohali Phase 7",
      "Mohali Phase 8B (IT Park)",
      "Panchkula Sector 5",
      "Other Area",
    ],
    "Ludhiana": ["Civil Lines", "Model Town", "Ferozepur Road", "Other Area"],
    "Amritsar": ["Mall Road", "Ranjit Avenue", "Lawrence Road", "Other Area"],
    "Jalandhar": ["Model Town", "Civil Lines", "Other Area"],
    "Other City": ["Other Area"],
  },
  "Bihar": {
    "Patna": [
      "Bailey Road",
      "Kankarbagh",
      "Boring Road",
      "Fraser Road",
      "Danapur",
      "Rajendra Nagar",
      "Other Area",
    ],
    "Gaya": ["Civil Lines", "AP Colony", "Other Area"],
    "Muzaffarpur": ["Mithanpura", "Brahmpura", "Other Area"],
    "Other City": ["Other Area"],
  },
  "Other State": {
    "Other City": ["Other Area"],
  },
};

const QUALIFICATIONS = [
  "10th Pass (Matriculation)",
  "12th Pass (Higher Secondary)",
  "Diploma / ITI",
  "Graduate - B.A.",
  "Graduate - B.Com.",
  "Graduate - B.Sc.",
  "Graduate - B.Tech / B.E.",
  "Graduate - BCA / BBA",
  "Post Graduate - M.A. / M.Com. / M.Sc.",
  "Post Graduate - MBA / PGDM",
  "Post Graduate - M.Tech / MCA",
  "Doctorate / Ph.D",
  "Other Qualification",
];

export default function Users({ users = [], categories = [], canViewAll = false, scope = "your" }) {
  const { auth, flash } = usePage().props;
  const admin = auth?.admin;
  const permissions = admin?.permissions || [];
  const can = (permission) => admin?.role === "super_admin" || permissions.includes(permission);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all"); // 'all' | 'web' | 'app' | 'both'
  const [selectedUser, setSelectedUser] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [viewFormat, setViewFormat] = useState("table"); // 'table' | 'cards'

  const { data, setData, post, processing, reset, errors, clearErrors, setError, transform } = useForm({
    name: "",
    phone: "",
    dob: "",
    qualification: "Graduate - B.Tech / B.E.",
    customQualification: "",
    state: "Rajasthan",
    customState: "",
    city: "Jaipur",
    customCity: "",
    area: "Malviya Nagar",
    customArea: "",
    email: "",
    jobTitle: "",
    experience: "Fresher",
    category: "",
  });

  // Maximum DOB (candidates must be at least 14 years old)
  const maxDobString = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 14);
    return d.toISOString().split("T")[0];
  }, []);

  const availableStates = useMemo(() => Object.keys(INDIA_LOCATIONS), []);

  const availableCities = useMemo(() => {
    const stateCities = INDIA_LOCATIONS[data.state];
    if (stateCities && typeof stateCities === "object") {
      return Object.keys(stateCities);
    }
    return ["Other City"];
  }, [data.state]);

  const availableAreas = useMemo(() => {
    const stateCities = INDIA_LOCATIONS[data.state];
    if (stateCities && stateCities[data.city]) {
      return stateCities[data.city];
    }
    return ["Other Area"];
  }, [data.state, data.city]);

  const handleStateChange = (newState) => {
    const stateCities = INDIA_LOCATIONS[newState];
    const cityList = stateCities ? Object.keys(stateCities) : ["Other City"];
    const defaultCity = cityList[0] || "Other City";
    const areaList = (stateCities && stateCities[defaultCity]) || ["Other Area"];
    const defaultArea = areaList[0] || "Other Area";

    setData((prev) => ({
      ...prev,
      state: newState,
      customState: "",
      city: defaultCity,
      customCity: "",
      area: defaultArea,
      customArea: "",
    }));
    clearErrors(["state", "city", "area"]);
  };

  const handleCityChange = (newCity) => {
    const stateCities = INDIA_LOCATIONS[data.state];
    const areaList = (stateCities && stateCities[newCity]) || ["Other Area"];
    const defaultArea = areaList[0] || "Other Area";

    setData((prev) => ({
      ...prev,
      city: newCity,
      customCity: newCity === "Other City" ? prev.customCity : "",
      area: defaultArea,
      customArea: "",
    }));
    clearErrors(["city", "area"]);
  };

  const openAddModal = () => {
    clearErrors();
    reset();
    setData({
      name: "",
      phone: "",
      dob: "",
      qualification: "Graduate - B.Tech / B.E.",
      customQualification: "",
      state: "Rajasthan",
      customState: "",
      city: "Jaipur",
      customCity: "",
      area: "Malviya Nagar",
      customArea: "",
      email: "",
      jobTitle: "",
      experience: "Fresher",
      category: "",
    });
    setAddModal(true);
  };

  const closeAddModal = () => {
    setAddModal(false);
    reset();
    clearErrors();
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    clearErrors();

    let hasError = false;
    if (!data.name?.trim()) {
      setError("name", "Candidate full name is required.");
      hasError = true;
    }
    const cleanDigits = (data.phone || "").replace(/\D+/g, "");
    if (!cleanDigits || cleanDigits.length < 10) {
      setError("phone", "Please enter a valid 10-digit mobile number.");
      hasError = true;
    }
    if (!data.dob) {
      setError("dob", "Date of birth is required.");
      hasError = true;
    }
    const finalQualification = data.qualification === "Other Qualification" ? data.customQualification?.trim() : data.qualification?.trim();
    if (!finalQualification) {
      setError("qualification", "Qualification is required.");
      hasError = true;
    }
    const finalState = data.state === "Other State" && data.customState?.trim() ? data.customState.trim() : data.state?.trim();
    if (!finalState) {
      setError("state", "State is required.");
      hasError = true;
    }
    const finalCity = data.city === "Other City" ? data.customCity?.trim() : data.city?.trim();
    if (!finalCity) {
      setError("city", "City is required.");
      hasError = true;
    }
    const finalArea = data.area === "Other Area" ? data.customArea?.trim() : data.area?.trim();
    if (!finalArea) {
      setError("area", "Area is required.");
      hasError = true;
    }

    if (hasError) return;

    transform((formData) => ({
      ...formData,
      qualification: finalQualification,
      state: finalState,
      city: finalCity,
      area: finalArea,
      email: formData.email?.trim() || null,
      jobTitle: formData.jobTitle?.trim() || null,
      category: formData.category || null,
      experience: formData.experience || null,
    }));

    post(route("admin.users.store"), {
      preserveScroll: true,
      onSuccess: () => closeAddModal(),
    });
  };

  const handleToggleStatus = (uuid) => {
    router.post(route("admin.users.toggle-status", uuid), {}, {
      preserveScroll: true,
      onSuccess: () => {
        if (selectedUser?.uuid === uuid) {
          setSelectedUser((prev) =>
            prev ? { ...prev, status: prev.status === "active" ? "inactive" : "active" } : null
          );
        }
      },
    });
  };

  // Auto-scroll detail panel smoothly into view when candidate is selected
  useEffect(() => {
    if (selectedUser) {
      const el = document.getElementById("admin-user-detail-panel");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedUser?.uuid]);

  // Export filtered candidates to Excel (.xlsx)
  const handleExportExcel = () => {
    if (!filtered || filtered.length === 0) {
      alert("No candidates found for the selected filter.");
      return;
    }

    const exportRows = filtered.map((u, idx) => ({
      "S.No": idx + 1,
      "Candidate Name": u.name || "—",
      "Phone": u.phone || "—",
      "Email": u.email || "—",
      "Date of Birth": u.dob || "—",
      "Qualification": u.qualification || "—",
      "State": u.state || "—",
      "City": u.city || "—",
      "Area": u.area || "—",
      "Target Job Title": u.jobTitle || "—",
      "Experience": u.experience || "—",
      "Platform": u.platform === "both" ? "Both (Web & App)" : (u.platform === "app" ? "App" : "Web"),
      "Registered Via": (u.registeredFrom || "web").toUpperCase(),
      "Status": (u.status || "active").toUpperCase(),
      "Joined Date": u.registeredAt || "—",
      "Applied Jobs": u.appliedCount ?? 0,
      "Web Last Active": u.webLastActive || "—",
      "App Last Active": u.appLastActive || "—",
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Candidates");

    const filterSuffix = platformFilter !== "all" ? `_${platformFilter}` : "_all";
    const fileName = `ATS_Candidates${filterSuffix}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (u.name || "").toLowerCase().includes(q) ||
      (u.phone || "").includes(q) ||
      (u.city || "").toLowerCase().includes(q) ||
      (u.jobTitle || "").toLowerCase().includes(q);

    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    const matchesPlatform = platformFilter === "all" || u.platform === platformFilter;
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  // Platform statistics
  const platformCounts = {
    all: users.length,
    web: users.filter((u) => u.platform === "web").length,
    app: users.filter((u) => u.platform === "app").length,
    both: users.filter((u) => u.platform === "both").length,
  };

  return (
    <>
      <Head title="Registered Candidates - ATS Admin" />

      <div className="p-3.5 sm:p-5 lg:p-6 pb-25">
        {flash?.success && (
          <div className="mb-5 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> {flash.success}
          </div>
        )}

        {/* Add Candidate Modal */}
        {addModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 sm:px-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-xl shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto [scrollbar-width:thin]">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Add New Candidate</h3>
                    <p className="text-xs text-gray-500">Register candidate profile for ATS database</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                {/* 1. Mandatory Identity & Contact */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.name}
                      onChange={(e) => updateAdminField(setData, setError, clearErrors, "name", e.target.value, data)}
                      placeholder="e.g. Arjun Sharma"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                      autoFocus
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Phone Number (+91) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={data.phone}
                        onChange={(e) => updateAdminField(setData, setError, clearErrors, "phone", e.target.value, data)}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          max={maxDobString}
                          value={data.dob}
                          onChange={(e) => {
                            setData("dob", e.target.value);
                            clearErrors("dob");
                          }}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
                        />
                      </div>
                      {errors.dob && <p className="text-xs text-red-500 mt-1">{errors.dob}</p>}
                    </div>
                  </div>

                  {/* Qualification */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Highest Qualification <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={data.qualification}
                      onChange={(e) => {
                        setData("qualification", e.target.value);
                        clearErrors("qualification");
                      }}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                      <option value="">Select qualification</option>
                      {QUALIFICATIONS.map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>

                    {data.qualification === "Other Qualification" && (
                      <input
                        type="text"
                        value={data.customQualification}
                        onChange={(e) => {
                          setData("customQualification", e.target.value);
                          clearErrors("qualification");
                        }}
                        placeholder="Specify your qualification..."
                        className="w-full mt-2 px-3.5 py-2 border border-blue-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50/30 transition"
                      />
                    )}
                    {errors.qualification && <p className="text-xs text-red-500 mt-1">{errors.qualification}</p>}
                  </div>
                </div>

                {/* 2. Mandatory Location Box (State -> City -> Area) */}
                <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Residential Location Hierarchy (State → City → Area) <span className="text-red-500">*</span></span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* State */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                        State *
                      </label>
                      <select
                        value={data.state}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {availableStates.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      {data.state === "Other State" && (
                        <input
                          type="text"
                          value={data.customState}
                          onChange={(e) => setData("customState", e.target.value)}
                          placeholder="Type state name..."
                          className="w-full mt-1.5 px-2.5 py-1.5 border border-blue-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      )}
                      {errors.state && <p className="text-[11px] text-red-500 mt-0.5">{errors.state}</p>}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                        City *
                      </label>
                      <select
                        value={data.city}
                        onChange={(e) => handleCityChange(e.target.value)}
                        className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {availableCities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      {data.city === "Other City" && (
                        <input
                          type="text"
                          value={data.customCity}
                          onChange={(e) => setData("customCity", e.target.value)}
                          placeholder="Type city name..."
                          className="w-full mt-1.5 px-2.5 py-1.5 border border-blue-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      )}
                      {errors.city && <p className="text-[11px] text-red-500 mt-0.5">{errors.city}</p>}
                    </div>

                    {/* Area */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                        Area *
                      </label>
                      <select
                        value={data.area}
                        onChange={(e) => {
                          setData("area", e.target.value);
                          clearErrors("area");
                        }}
                        className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {availableAreas.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                      {data.area === "Other Area" && (
                        <input
                          type="text"
                          value={data.customArea}
                          onChange={(e) => setData("customArea", e.target.value)}
                          placeholder="Type area / colony..."
                          className="w-full mt-1.5 px-2.5 py-1.5 border border-blue-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      )}
                      {errors.area && <p className="text-[11px] text-red-500 mt-0.5">{errors.area}</p>}
                    </div>
                  </div>
                </div>

                {/* 3. Optional Professional & Communication Information */}
                <div className="pt-1 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Additional Details (Optional)
                    </span>
                    <span className="text-[10px] text-gray-400">Can be filled later</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) => updateAdminField(setData, setError, clearErrors, "email", e.target.value, data)}
                      placeholder="e.g. arjun@example.com"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Target Job Title <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={data.jobTitle}
                        onChange={(e) => updateAdminField(setData, setError, clearErrors, "jobTitle", e.target.value, data)}
                        placeholder="e.g. Telecaller / Sales Exec"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Total Experience <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <select
                        value={data.experience}
                        onChange={(e) => setData("experience", e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Fresher">Fresher</option>
                        <option value="1 Year">1 Year</option>
                        <option value="2 Years">2 Years</option>
                        <option value="3+ Years">3+ Years</option>
                        <option value="5+ Years">5+ Years</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Preferred Category <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <select
                      value={data.category}
                      onChange={(e) => setData("category", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select category</option>
                      {Array.isArray(categories) && categories.map((cat) => (
                        <option key={cat.id || cat.uuid} value={cat.name}>
                          {cat.icon ? `${cat.icon} ` : ""}{cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 cursor-pointer shadow-md shadow-blue-600/30 transition"
                  >
                    {processing ? "Adding..." : "Add Candidate"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Registered Candidates</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {users.length} total candidates ({platformCounts.web} Web, {platformCounts.app} App, {platformCounts.both} Both)
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Format Toggle (Table vs Cards) - active when not inspecting */}
            {!selectedUser && (
              <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setViewFormat("table")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewFormat === "table"
                      ? "bg-white text-gray-900 shadow-2xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  title="Table View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewFormat("cards")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewFormat === "cards"
                      ? "bg-white text-gray-900 shadow-2xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  title="Card View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
              </div>
            )}

            {/* Excel Export Button */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/25 transition cursor-pointer shrink-0"
              title="Export filtered candidates to Excel spreadsheet (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel ({filtered.length})</span>
            </button>

            {can("add_users") && (
              <button
                type="button"
                onClick={openAddModal}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/30 transition cursor-pointer shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            )}
          </div>
        </div>

        {/* All vs Your Scope Tab (Visible when canViewAll is true) */}
        {canViewAll && (
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl w-fit mb-5">
            <button
              type="button"
              onClick={() => router.get(route("admin.users.index"), { scope: "all" }, { preserveState: true, preserveScroll: true })}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                scope === "all" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              All Candidates
            </button>
            <button
              type="button"
              onClick={() => router.get(route("admin.users.index"), { scope: "your" }, { preserveState: true, preserveScroll: true })}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                scope === "your" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Your Candidates
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="space-y-3 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, city, job role..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Status Filter */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["all", "active", "inactive"].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all border cursor-pointer shrink-0 ${
                    statusFilter === s
                      ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Filter Buttons (Web, App, Both, All) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0">
              Platform:
            </span>
            {[
              { id: "all", label: "All Platforms", count: platformCounts.all, icon: null },
              { id: "web", label: "Web Portal", count: platformCounts.web, icon: Globe, color: "text-blue-600" },
              { id: "app", label: "Mobile App", count: platformCounts.app, icon: Smartphone, color: "text-purple-600" },
              { id: "both", label: "Both (Web & App)", count: platformCounts.both, icon: RefreshCw, color: "text-emerald-600" },
            ].map((p) => {
              const IconComp = p.icon;
              const isActive = platformFilter === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPlatformFilter(p.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {IconComp && <IconComp className={`w-3.5 h-3.5 ${isActive ? "text-white" : p.color}`} />}
                  <span>{p.label}</span>
                  <span
                    className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Candidates List / Cards (Left Side - Independent Scroll in View Mode) */}
          <div
            className={`w-full ${
              selectedUser
                ? "lg:w-1/2 xl:w-7/12 overflow-y-auto h-[calc(100vh-14rem)] max-h-[calc(100vh-14rem)] pr-2 [scrollbar-width:thin] space-y-3"
                : viewFormat === "cards"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "flex-1 min-w-0"
            } transition-all duration-300 ease-out`}
          >
            {/* View Mode: Render cards when inspecting or when Card View is chosen */}
            {selectedUser || viewFormat === "cards" ? (
              filtered.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400">
                  No candidates found matching the filters
                </div>
              ) : (
                filtered.map((user) => {
                  const isSelected = selectedUser?.uuid === user.uuid;
                  const cleanPhone = (user.phone || "").replace(/\D+/g, "");
                  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
                    `Hello ${user.name}, we have opportunities matching your profile at ATS.`
                  )}`;

                  return (
                    <div
                      key={user.uuid}
                      onClick={() => setSelectedUser(user)}
                      className={`bg-white border rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all ${
                        isSelected
                          ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40 shadow-sm"
                          : "border-gray-200/90 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-xs">
                              {(user.name || "C")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                            {user.presence?.is_online && (
                              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 text-sm truncate hover:text-blue-600">
                              {user.name}
                            </p>
                            {user.presence?.is_online ? (
                              <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                {user.presence.status_text}
                              </p>
                            ) : (
                              <p className="text-[11px] text-slate-400 truncate">
                                {user.presence?.status_text || `Joined ${user.registeredAt}`}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              user.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-gray-100 text-gray-500 border border-gray-200"
                            }`}
                          >
                            {user.status}
                          </span>
                          {user.platform === "both" ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                              <RefreshCw className="w-2.5 h-2.5 text-emerald-600" /> Both
                            </span>
                          ) : user.platform === "app" ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                              <Smartphone className="w-2.5 h-2.5 text-purple-600" /> App
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                              <Globe className="w-2.5 h-2.5 text-blue-600" /> Web
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Role & Location Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Role & Exp
                          </span>
                          <p className="font-bold text-slate-800 text-xs truncate">
                            {user.jobTitle || "Job Seeker"}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {user.experience || "Fresher"} {user.qualification && user.qualification !== "—" ? `• ${user.qualification}` : ""}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Location
                          </span>
                          <p className="font-medium text-slate-700 text-xs truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {user.area && user.area !== "—" ? `${user.area}, ${user.city}` : (user.city || "—")}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Contact & Actions Footer */}
                      <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-100 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 text-xs flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            {user.phone}
                          </span>
                          {cleanPhone && (
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md transition"
                                title="WhatsApp candidate"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </a>
                              <a
                                href={`tel:${user.phone}`}
                                className="p-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition"
                                title="Call candidate"
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                            {user.appliedCount ?? 0} applied
                          </span>
                          <span className="text-xs text-blue-600 font-bold hover:underline">
                            {isSelected ? "Inspecting →" : "View"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              /* Full-width Data Table (when not inspecting and Table View is chosen) */
              <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
                <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-17rem)] min-h-[380px] custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[860px]">
                    <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-xs border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-3 whitespace-nowrap min-w-[135px]">Candidate</th>
                        <th className="py-3 px-2.5 whitespace-nowrap min-w-[115px]">Contact</th>
                        <th className="py-3 px-2.5 whitespace-nowrap min-w-[95px]">Location</th>
                        <th className="py-3 px-2.5 whitespace-nowrap min-w-[120px]">Role & Experience</th>
                        <th className="py-3 px-2 whitespace-nowrap min-w-[70px] text-center">Platform</th>
                        <th className="py-3 px-2.5 whitespace-nowrap min-w-[125px]">Activity Presence</th>
                        <th className="py-3 px-2 whitespace-nowrap min-w-[65px] text-center">Status</th>
                        <th className="py-3 px-2 whitespace-nowrap min-w-[60px] text-center">Applied</th>
                        <th className="py-3 px-3 whitespace-nowrap min-w-[95px] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs bg-white">
                      {filtered.map((user) => {
                        const cleanPhone = (user.phone || "").replace(/\D+/g, "");
                        const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                        const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
                          `Hello ${user.name}, we have opportunities matching your profile at ATS.`
                        )}`;

                        return (
                          <tr
                            key={user.uuid}
                            onClick={() => setSelectedUser(user)}
                            className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                          >
                            {/* Candidate info */}
                            <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                              <div className="flex items-center gap-2">
                                <div className="relative shrink-0">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-xs">
                                    {(user.name || "C")
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .slice(0, 2)}
                                  </div>
                                  {user.presence?.is_online && (
                                    <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 border border-white"></span>
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0 max-w-[140px]">
                                  <p className="font-bold text-gray-900 truncate hover:text-blue-600 text-xs">
                                    {user.name}
                                  </p>
                                  <p className="text-[10px] text-gray-400 truncate">
                                    Joined {user.registeredAt}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Contact */}
                            <td className="py-2.5 px-2.5 whitespace-nowrap align-middle">
                              <p className="font-medium text-gray-800 flex items-center gap-1 text-xs">
                                <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                                <span>{user.phone}</span>
                              </p>
                              {user.email && user.email !== "—" && (
                                <p className="text-[10px] text-gray-400 truncate max-w-[115px]" title={user.email}>
                                  {user.email}
                                </p>
                              )}
                            </td>

                            {/* Location */}
                            <td className="py-2.5 px-2.5 whitespace-nowrap align-middle">
                              <p className="text-gray-700 flex items-center gap-1 truncate max-w-[100px] text-xs" title={user.area && user.area !== "—" ? `${user.area}, ${user.city}` : (user.city || "—")}>
                                <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                                <span>
                                  {user.area && user.area !== "—" ? `${user.area}, ${user.city}` : (user.city || "—")}
                                </span>
                              </p>
                            </td>

                            {/* Role & Experience */}
                            <td className="py-2.5 px-2.5 whitespace-nowrap align-middle">
                              <p className="font-semibold text-gray-800 truncate max-w-[125px] text-xs" title={user.jobTitle || "Job Seeker"}>
                                {user.jobTitle || "Job Seeker"}
                              </p>
                              <p className="text-[10px] text-gray-500 truncate max-w-[125px]" title={`${user.experience || "Fresher"} ${user.qualification && user.qualification !== "—" ? `• ${user.qualification}` : ""}`}>
                                {user.experience || "Fresher"} {user.qualification && user.qualification !== "—" ? `• ${user.qualification}` : ""}
                              </p>
                            </td>

                            {/* Platform Badge */}
                            <td className="py-2.5 px-2 whitespace-nowrap text-center align-middle">
                              {user.platform === "both" ? (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <RefreshCw className="w-2.5 h-2.5 text-emerald-600" /> Both
                                </span>
                              ) : user.platform === "app" ? (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                  <Smartphone className="w-2.5 h-2.5 text-purple-600" /> App
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                  <Globe className="w-2.5 h-2.5 text-blue-600" /> Web
                                </span>
                              )}
                            </td>

                            {/* WhatsApp Style Activity Presence */}
                            <td className="py-2.5 px-2.5 whitespace-nowrap align-middle">
                              {user.presence?.is_online ? (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                  </span>
                                  <span className="text-[10px] font-bold">
                                    {user.presence.status_text}
                                  </span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                  <span className="text-[10px] font-medium">
                                    {user.presence?.status_text || "Offline"}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-2.5 px-2 whitespace-nowrap text-center align-middle">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${
                                  user.status === "active"
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-gray-100 text-gray-500 border border-gray-200"
                                }`}
                              >
                                {user.status}
                              </span>
                            </td>

                            {/* Applied Count */}
                            <td className="py-2.5 px-2 whitespace-nowrap text-center align-middle">
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                {user.appliedCount ?? 0}
                              </span>
                            </td>

                            {/* Actions (Standard Row Cell, NO overlapping sticky) */}
                            <td
                              className="py-2.5 px-3 text-right whitespace-nowrap align-middle"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-end gap-1">
                                {cleanPhone && (
                                  <>
                                    <a
                                      href={waUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition"
                                      title="WhatsApp candidate"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                    </a>
                                    <a
                                      href={`tel:${user.phone}`}
                                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                                      title={`Call ${user.phone}`}
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                    </a>
                                  </>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setSelectedUser(user)}
                                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                                >
                                  View
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={9} className="text-center py-16 text-gray-400">
                            No candidates found matching the filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Candidate Drawer Panel (Independent Smooth Scroll & Distinct Contrast Header) */}
          {selectedUser && (
            <div
              id="admin-user-detail-panel"
              className="w-full lg:w-1/2 xl:w-5/12 shrink-0 bg-white border-2 border-blue-400/80 rounded-3xl overflow-hidden flex flex-col lg:sticky lg:top-4 h-[calc(100vh-14rem)] max-h-[calc(100vh-14rem)] shadow-2xl shadow-blue-950/20 z-20"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="text-xs font-semibold text-blue-200 hover:text-white px-2 py-1 bg-white/10 rounded-lg lg:hidden cursor-pointer"
                  >
                    ← Back
                  </button>
                  <div>
                    <h3 className="font-extrabold text-white text-sm truncate">{selectedUser.name || "Candidate"}</h3>
                    <span className="text-[10px] text-cyan-300 font-medium">Candidate Inspection Dossier</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer shrink-0 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-5 space-y-4 overscroll-contain [scrollbar-width:thin]">
                <div className="text-center">
                  <div className="relative mx-auto w-16 h-16 mb-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md shadow-blue-500/20">
                      {(selectedUser.name || "C")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    {selectedUser.presence?.is_online && (
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-gray-900 text-base">{selectedUser.name}</p>

                  {/* WhatsApp Style Presence Status */}
                  <div className="mt-1 mb-2">
                    {selectedUser.presence?.is_online ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-bold">{selectedUser.presence.status_text}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        <span className="text-xs font-medium">{selectedUser.presence?.status_text || "Offline"}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-1.5 mt-1.5 flex-wrap">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        selectedUser.status === "active"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {selectedUser.status}
                    </span>
                    {selectedUser.platform === "both" ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 text-emerald-600" /> Both (Web & App)
                      </span>
                    ) : selectedUser.platform === "app" ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-purple-600" /> Mobile App
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                        <Globe className="w-3 h-3 text-blue-600" /> Web Portal
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {[
                    { label: "Phone", val: selectedUser.phone },
                    { label: "Email", val: selectedUser.email && selectedUser.email !== "—" ? selectedUser.email : "Not Provided (Optional)" },
                    { label: "Date of Birth", val: selectedUser.dob || "—" },
                    { label: "Qualification", val: selectedUser.qualification || "—" },
                    { label: "State", val: selectedUser.state || "—" },
                    { label: "City & Area", val: selectedUser.area && selectedUser.area !== "—" ? `${selectedUser.area}, ${selectedUser.city}` : (selectedUser.city || "—") },
                    { label: "Job Title", val: selectedUser.jobTitle || "—" },
                    { label: "Experience", val: selectedUser.experience || "—" },
                    { label: "Platform", val: selectedUser.platform === "both" ? "Both (Web & App)" : (selectedUser.platform === "app" ? "Mobile App" : "Web Portal") },
                    { label: "Registered Via", val: (selectedUser.registeredFrom || "web").toUpperCase() },
                    { label: "Web Activity (WhatsApp)", val: selectedUser.presence?.web_last_seen || selectedUser.webLastActive || "Never active" },
                    { label: "App Activity (WhatsApp)", val: selectedUser.presence?.app_last_seen || selectedUser.appLastActive || "Never active" },
                    { label: "Applied Jobs", val: `${selectedUser.appliedCount ?? 0} jobs` },
                    { label: "Joined", val: selectedUser.registeredAt },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between gap-2">
                      <p className="text-xs text-gray-400 font-medium shrink-0">{r.label}</p>
                      <p className="text-xs font-semibold text-gray-900 text-right">{r.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {can("status_users") && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(selectedUser.uuid)}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold cursor-pointer transition ${
                      selectedUser.status === "active"
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    {selectedUser.status === "active" ? "Deactivate User" : "Activate User"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Users.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;