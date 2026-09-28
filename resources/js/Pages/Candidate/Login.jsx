import React, { useState, useRef, useEffect } from "react";
import { Link, usePage, Head } from "@inertiajs/react";
import HomepageLayout from "@/Layouts/HomepageLayout";
import axios from "axios";
import { auth } from "@/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import {
  Briefcase,
  Phone,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  ChevronLeft,
  Search,
  Building2,
  ShieldCheck,
  Clock,
  Sparkles,
  AlertCircle,
  User,
  MapPin,
  Calendar,
  GraduationCap,
  Compass,
  Mail,
} from "lucide-react";

/* ── Left panel live highlight data ── */
const STATS = [
  { label: "Live Jobs", value: "35K+" },
  { label: "Employers", value: "15K+" },
  { label: "Placements", value: "10L+" },
  { label: "Direct Hiring", value: "100%" },
];

const FEATURES = [
  { icon: Search, text: "AI-powered skill & locality matching" },
  { icon: Building2, text: "100% Verified employers & startups in India" },
  { icon: ShieldCheck, text: "Zero consultancy charges • Always free" },
  { icon: Clock, text: "Fast-track callbacks within 48 hours" },
];

const FLOATING_JOBS = [
  {
    title: "Senior React Developer",
    company: "Razorpay",
    loc: "Bengaluru",
    salary: "₹18 - ₹26 LPA",
    color: "bg-blue-600",
  },
  {
    title: "Product & UI Designer",
    company: "Swiggy",
    loc: "Bengaluru / Remote",
    salary: "₹14 - ₹20 LPA",
    color: "bg-purple-600",
  },
  {
    title: "Data & Business Analyst",
    company: "Zomato",
    loc: "Gurugram / Delhi NCR",
    salary: "₹12 - ₹18 LPA",
    color: "bg-emerald-600",
  },
];

const POPULAR_CITIES = [
  "Jaipur",
  "Delhi NCR",
  "Mumbai",
  "Bengaluru",
  "Pune",
  "Hyderabad",
  "Ahmedabad",
];

const POPULAR_AREAS_BY_CITY = {
  Jaipur: [
    "Niwaru", "Niwaru Road", "Jhotwara", "Kalwar Road", "Khatipura", "Harmada", "Murlipura",
    "Vidhyadhar Nagar", "Shastri Nagar", "Ambabari", "Bani Park", "C-Scheme", "Civil Lines",
    "Bais Godam", "Hasanpura", "Sodala", "Shyam Nagar", "Nirman Nagar", "Vaishali Nagar",
    "Sirsi Road", "Chitrakoot", "Ajmer Road", "Bhankrota", "Mansarovar", "Gopalpura",
    "Gopalpura Bypass", "Durgapura", "Mahaveer Nagar", "Tonk Road", "Sitapura", "Pratap Nagar",
    "Sanganer", "Malviya Nagar", "Jagatpura", "Raja Park", "Tilak Nagar", "Adarsh Nagar",
    "Jawahar Nagar", "Sethi Colony", "Transport Nagar", "Ghat Gate", "Johari Bazaar",
    "Chandpole", "MI Road", "Ajmeri Gate", "Tripolia", "Amer", "Kukas", "VKI Area",
    "Bagru", "Bassi", "Chomu", "Mahindra SEZ", "Gandhi Nagar", "Mahesh Nagar",
    "Barkat Nagar", "Lal Kothi", "Bapu Nagar", "Sindhi Camp", "Station Road"
  ],
  "Delhi NCR": [
    "Noida", "Gurugram", "Connaught Place", "Saket", "Rohini", "South Extension",
    "Laxmi Nagar", "Dwarka", "Okhla", "Janakpuri", "Nehru Place", "Hauz Khas",
    "Karol Bagh", "Pitampura", "Vasant Kunj", "Mayur Vihar", "Chandni Chowk", "Cyber City"
  ],
  Delhi: [
    "Connaught Place", "Saket", "Rohini", "South Extension", "Laxmi Nagar",
    "Dwarka", "Okhla", "Janakpuri", "Nehru Place", "Hauz Khas", "Karol Bagh",
    "Pitampura", "Vasant Kunj", "Mayur Vihar", "Chandni Chowk"
  ],
  Mumbai: [
    "Andheri East", "Andheri West", "Bandra West", "Bandra East", "Powai",
    "Thane", "Navi Mumbai", "Dadar", "Borivali", "Goregaon", "Malad", "BKC", "Kurla",
    "Lower Parel", "Juhu", "Kandivali", "Worli", "Vashi", "Ghatkopar", "Mulund"
  ],
  Bengaluru: [
    "Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "BTM Layout",
    "Electronic City", "Jayanagar", "Marathahalli", "Hebbal", "Yelahanka", "Bellandur",
    "MG Road", "Banashankari", "Rajajinagar", "JP Nagar", "Sarjapur Road"
  ],
  Pune: [
    "Hinjawadi", "Viman Nagar", "Kothrud", "Baner", "Wakad", "Hadapsar",
    "Shivaji Nagar", "Aundh", "Magarpatta", "Pimpri", "Chinchwad", "Kalyani Nagar"
  ],
  Hyderabad: [
    "Hitech City", "Madhapur", "Gachibowli", "Kondapur", "Kukatpally",
    "Banjara Hills", "Jubilee Hills", "Secunderabad", "Begumpet", "Ameerpet", "Manikonda"
  ],
  Ahmedabad: [
    "SG Highway", "Prahlad Nagar", "Navrangpura", "Satellite", "Bopal",
    "Maninagar", "Vastrapur", "Bodakdev", "Chandkheda", "Ghatlodia", "Thaltej"
  ],
};

const EDUCATION_OPTIONS = [
  "10th Pass",
  "12th Pass",
  "Diploma",
  "Graduate (B.Tech, B.Com, etc.)",
  "Post Graduate",
];

const EXPERIENCE_OPTIONS = [
  "Fresher (0 Years)",
  "1-2 Years",
  "3-5 Years",
  "5+ Years",
];

const SUGGESTED_ROLES = [
  "Telecaller / BPO",
  "Delivery Executive",
  "Sales & Marketing",
  "Back Office / Data Entry",
  "Software Engineer",
  "Accountant",
];

export default function Login({ initialStep = "phone", candidate = null }) {
  const { url } = usePage();
  const params = new URLSearchParams(url.split("?")[1] || "");
  const jobId = params.get("job") || params.get("job_uuid") || params.get("job_id");

  const [step, setStep] = useState(initialStep); // "phone" | "otp" | "profile"
  const [phone, setPhone] = useState(candidate?.phone || "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [coords, setCoords] = useState({ latitude: null, longitude: null });
  const otpRefs = useRef([]);

  // Candidate profile fields
  const [profile, setProfile] = useState({
    fullName: candidate?.full_name && !candidate.full_name.startsWith("Candidate ") ? candidate.full_name : "",
    email: candidate?.email || "",
    gender: candidate?.gender || "male",
    dob: candidate?.dob || "",
    city: candidate?.city || "",
    area: candidate?.area || "",
    jobTitle: candidate?.job_title || "",
    experience: candidate?.total_experience_years || "Fresher (0 Years)",
    education: candidate?.education || "12th Pass",
  });

  const [locationMsg, setLocationMsg] = useState("");

  // Auto-detect location when user enters profile step if city is empty
  useEffect(() => {
    if (step === "profile" && !profile.city) {
      handleDetectLocation();
    }
  }, [step]);

  // Fetch coordinates in background when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {},
        { timeout: 8000 }
      );
    }
  }, []);

  // Resend OTP Countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  /* ─────────────────────────────────────────────────────────────
     STEP 1: SEND OTP DIRECTLY (NO PRIOR ACCOUNT-EXISTS BLOCKAGE)
  ───────────────────────────────────────────────────────────── */
  const handleSendOtp = async (e) => {
    e?.preventDefault();

    try {
      setLoading(true);
      setError("");

      const mobile = phone.replace(/\D/g, "");

      if (mobile.length !== 10 || !/^[6-9]\d{9}$/.test(mobile)) {
        setError("Please enter a valid 10-digit Indian mobile number.");
        setLoading(false);
        return;
      }

      // Initialize Invisible Firebase Recaptcha
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
          }
        );
        await window.recaptchaVerifier.render();
      }

      const appVerifier = window.recaptchaVerifier;

      // Dispatch Firebase SMS OTP directly to phone
      const result = await signInWithPhoneNumber(
        auth,
        "+91" + mobile,
        appVerifier
      );

      setConfirmationResult(result);
      setStep("otp");
      setResendTimer(60);

      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 150);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-phone-number") {
        setError("Invalid phone number format.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError(err.message || "Failed to send verification code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── OTP input box helpers ── */
  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;

    const next = [...otp];
    next[i] = val;
    setOtp(next);

    if (val && i < 5) {
      otpRefs.current[i + 1]?.focus();
    }

    if (!val && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }

    e.preventDefault();
  };

  /* ─────────────────────────────────────────────────────────────
     STEP 2: VERIFY OTP + CHECK DB + LOGIN OR ROUTE TO PROFILE
  ───────────────────────────────────────────────────────────── */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const code = otp.join("");
      if (code.length < 6) {
        setError("Please enter all 6 digits of the code.");
        setLoading(false);
        return;
      }

      // 1. Confirm code with Firebase
      const result = await confirmationResult.confirm(code);

      if (result.user) {
        // 2. Call backend controller to check/create user and save web location
        const login = await axios.post(route("phone.login"), {
          phone: phone.replace(/\D/g, ""),
          job_id: jobId || null,
          latitude: coords.latitude || null,
          longitude: coords.longitude || null,
        });

        // 3. Profile Completion Check
        if (login.data.profile_complete) {
          // Profile is complete! Redirect immediately
          window.location.href = login.data.redirect || "/";
        } else {
          // Profile incomplete! Prompt profile completion onboarding
          if (login.data.user) {
            setProfile((prev) => ({
              ...prev,
              fullName: login.data.user.full_name && !login.data.user.full_name.startsWith("Candidate ")
                ? login.data.user.full_name
                : prev.fullName,
              email: login.data.user.email || prev.email,
              gender: login.data.user.gender || prev.gender,
              dob: login.data.user.dob || prev.dob,
              city: login.data.user.city || prev.city,
              area: login.data.user.area || prev.area,
              education: login.data.user.education || prev.education,
              experience: login.data.user.experience || prev.experience,
              jobTitle: login.data.user.job_title || prev.jobTitle,
            }));
          }
          setStep("profile");
        }
      }
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-verification-code") {
        setError("Invalid OTP code. Please check and try again.");
      } else if (err.code === "auth/code-expired") {
        setError("OTP has expired. Please click Resend OTP.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || "Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────────────────
     STEP 3: CANDIDATE PROFILE COMPLETION SUBMIT
  ───────────────────────────────────────────────────────────── */
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!profile.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!profile.email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!profile.gender) {
      setError("Please select your gender.");
      return;
    }
    if (!profile.dob) {
      setError("Please enter your date of birth.");
      return;
    }

    // Age validation (18+)
    const birthDate = new Date(profile.dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      setError("You must be at least 18 years old to create a candidate profile.");
      return;
    }

    if (!profile.city.trim()) {
      setError("Please enter or select your city.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(route("candidate.complete-profile"), {
        full_name: profile.fullName.trim(),
        email: profile.email.trim(),
        gender: profile.gender,
        dob: profile.dob,
        city: profile.city.trim(),
        area: profile.area ? profile.area.trim() : null,
        job_title: profile.jobTitle.trim(),
        experience: profile.experience,
        education: profile.education,
        latitude: coords.latitude || null,
        longitude: coords.longitude || null,
        job_id: jobId || null,
      });

      if (response.data.success) {
        window.location.href = response.data.redirect || "/";
      } else {
        setError(response.data.message || "Failed to complete profile.");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to save profile. Please check all fields."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── GPS Auto-detect City & Area Helper (Multi-Tier Robust Fallback) ── */
  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    setLocationMsg("");

    // Helper: Call backend /location/update (supports coordinates and IP fallback)
    const resolveFromBackend = async (lat = null, lng = null) => {
      try {
        const payload = lat && lng ? { latitude: lat, longitude: lng } : {};
        const res = await axios.post("/location/update", payload);
        const city = res.data?.data?.city;
        let area = res.data?.data?.area;

        // If area missing, check known areas for the city
        if (city && !area) {
          const matchKey = Object.keys(POPULAR_AREAS_BY_CITY).find(
            (k) => k.toLowerCase() === city.toLowerCase()
          );
          if (matchKey && POPULAR_AREAS_BY_CITY[matchKey]?.length > 0) {
            area = POPULAR_AREAS_BY_CITY[matchKey][0];
          }
        }

        if (city || area) {
          setProfile((p) => ({
            ...p,
            city: city || p.city,
            area: area || p.area,
          }));
          const locText = [area, city].filter(Boolean).join(", ");
          setLocationMsg(`📍 Location detected: ${locText}`);
          if (res.data?.data?.latitude && res.data?.data?.longitude) {
            setCoords({
              latitude: res.data.data.latitude,
              longitude: res.data.data.longitude,
            });
          }
          return true;
        }
      } catch (err) {
        console.warn("Backend location error:", err);
      }
      return false;
    };

    // Helper: Direct client reverse geocoding via Nominatim & BigDataCloud
    const resolveFromClientGeocode = async (lat, lng) => {
      // 1. Direct Nominatim
      try {
        const osmRes = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1`
        );
        if (osmRes.data && osmRes.data.address) {
          const addr = osmRes.data.address;
          const rawCity = addr.city || addr.town || addr.municipality || addr.state_district || "Jaipur";
          const city = rawCity.replace(/\b(municipal corporation|tehsil|district|municipality)\b/gi, "").trim() || rawCity;
          let area = addr.suburb || addr.neighbourhood || addr.quarter || addr.residential || addr.commercial || addr.village || addr.road || "";

          if (city && !area) {
            const matchKey = Object.keys(POPULAR_AREAS_BY_CITY).find(
              (k) => k.toLowerCase() === city.toLowerCase()
            );
            if (matchKey) area = POPULAR_AREAS_BY_CITY[matchKey][0];
          }

          if (city || area) {
            setProfile((p) => ({
              ...p,
              city: city || p.city,
              area: area || p.area,
            }));
            const locText = [area, city].filter(Boolean).join(", ");
            setLocationMsg(`📍 Location detected: ${locText}`);
            return true;
          }
        }
      } catch (e) {
        // fallback
      }

      // 2. BigDataCloud Fallback
      try {
        const res = await axios.get(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
        );
        const city = res.data?.city || res.data?.locality || "Jaipur";
        let area = res.data?.locality && res.data.locality !== city ? res.data.locality : null;

        if (city && !area) {
          const matchKey = Object.keys(POPULAR_AREAS_BY_CITY).find(
            (k) => k.toLowerCase() === city.toLowerCase()
          );
          if (matchKey) area = POPULAR_AREAS_BY_CITY[matchKey][0];
        }

        if (city || area) {
          setProfile((p) => ({
            ...p,
            city: city || p.city,
            area: area || p.area,
          }));
          const locText = [area, city].filter(Boolean).join(", ");
          setLocationMsg(`📍 Location detected: ${locText}`);
          return true;
        }
      } catch (e) {
        // ignore
      }
      return false;
    };

    // 1. Try Browser GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ latitude: lat, longitude: lng });

          // Tier 1: Backend with GPS coordinates
          let success = await resolveFromBackend(lat, lng);

          // Tier 2: Client reverse geocode
          if (!success) {
            success = await resolveFromClientGeocode(lat, lng);
          }

          // Tier 3: IP fallback via backend
          if (!success) {
            success = await resolveFromBackend();
          }

          setDetectingLocation(false);
          if (!success) {
            setLocationMsg("Please select or enter your city below.");
          }
        },
        async (geoErr) => {
          console.warn("Browser GPS permission denied or timed out:", geoErr?.message);
          // Browser GPS failed -> Fallback to IP Geolocation via backend!
          const success = await resolveFromBackend();
          setDetectingLocation(false);
          if (!success) {
            setLocationMsg("Please select or enter your city below.");
          }
        },
        { timeout: 6000, enableHighAccuracy: true }
      );
    } else {
      // Browser does not support geolocation -> Fallback to IP Geolocation!
      const success = await resolveFromBackend();
      setDetectingLocation(false);
      if (!success) {
        setLocationMsg("Please select or enter your city below.");
      }
    }
  };

  return (
    <>
      <Head title="Candidate Portal - ATS Direct Hiring" />
      <HomepageLayout hideFooter>
        <div className="min-h-[calc(100vh-64px)] bg-slate-50/60 flex">
          <div className="flex flex-1 w-full">
            {/* LEFT — Illustrated Info Panel */}
            <div className="hidden lg:flex lg:w-[46%] xl:w-[50%] relative overflow-hidden flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white">
              {/* Subtle background SVG grid */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="loginGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#loginGrid)" />
                </svg>
              </div>

              {/* Top Branding */}
              <div className="relative z-10">
                <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
                  <img
                    src="/images/logo.png"
                    alt="ATS.com"
                    className="w-11 h-11 rounded-2xl shadow-lg group-hover:scale-105 transition-transform object-contain"
                  />
                  <div>
                    <div className="text-white font-extrabold text-xl leading-tight tracking-tight">
                      ATS<span className="text-blue-300">.com</span>
                    </div>
                    <div className="text-blue-200 text-xs font-semibold">
                      Direct Hiring Platform
                    </div>
                  </div>
                </Link>

                <h2 className="text-white text-3xl xl:text-4xl font-extrabold leading-tight mb-3 tracking-tight">
                  Your Next Career Move <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-purple-200">
                    Starts Right Here
                  </span>
                </h2>
                <p className="text-blue-100 text-sm leading-relaxed max-w-md">
                  Connect directly with verified corporate employers and high-growth startups across India with transparent salaries and zero consultant fees.
                </p>
              </div>

              {/* Floating Job Opportunities */}
              <div className="relative z-10 space-y-3 my-6">
                {FLOATING_JOBS.map((job, i) => (
                  <div
                    key={job.title}
                    className="flex items-center gap-3.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-xs"
                    style={{
                      transform: `translateX(${i % 2 === 0 ? "0" : "18px"})`,
                    }}
                  >
                    <div className={`w-10 h-10 ${job.color} rounded-xl flex items-center justify-center shrink-0 shadow-xs`}>
                      <Briefcase className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs sm:text-sm font-bold truncate">
                        {job.title}
                      </p>
                      <p className="text-blue-200 text-xs mt-0.5">
                        {job.company} • {job.loc}
                      </p>
                    </div>
                    <span className="text-emerald-300 text-xs font-bold shrink-0">
                      {job.salary}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom Metrics & Assurances */}
              <div className="relative z-10">
                <div className="grid grid-cols-4 gap-2.5 mb-6">
                  {STATS.map((s) => (
                    <div key={s.label} className="text-center bg-white/10 backdrop-blur-md border border-white/15 rounded-xl py-3 px-1">
                      <div className="text-white font-extrabold text-base xl:text-lg">
                        {s.value}
                      </div>
                      <div className="text-blue-200 text-[11px] mt-0.5 font-medium truncate">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-blue-100">
                  {FEATURES.map((f) => (
                    <div key={f.text} className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-white/15 rounded-md flex items-center justify-center shrink-0">
                        <f.icon className="w-3 h-3 text-blue-200" />
                      </div>
                      <span className="truncate">{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative Glow */}
              <div className="absolute -bottom-16 -right-16 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* RIGHT — Dynamic Auth & Candidate Onboarding Form */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 py-10 bg-white overflow-y-auto">
              <div className={`w-full ${step === "profile" ? "max-w-lg" : "max-w-sm"} transition-all duration-300`}>
                
                {/* Stepper Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-200/60">
                      {step === "profile" ? "Step 2 of 2: Profile" : "Step 1: Quick Verify"}
                    </span>
                    {jobId && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        Applying for Job
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {step === "phone" && "Login / Register"}
                    {step === "otp" && "Verify OTP"}
                    {step === "profile" && "Complete Your Profile"}
                  </h1>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1 leading-relaxed">
                    {step === "phone" && "Enter any mobile number to get instant OTP & jobs"}
                    {step === "otp" && `Enter the 6-digit OTP sent to +91 ${phone}`}
                    {step === "profile" && "1-minute profile setup to match direct recruiter callbacks"}
                  </p>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-150">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span className="leading-snug">{error}</span>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                   STEP 1: Phone Number Input (Single unified entrance)
                ───────────────────────────────────────────────────────────── */}
                {step === "phone" && (
                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Mobile Number
                      </label>
                      <div className="flex gap-2.5">
                        <div className="flex items-center gap-1.5 px-3.5 py-3 border border-gray-200 rounded-2xl bg-slate-50 text-xs sm:text-sm font-bold text-gray-700 shrink-0">
                          🇮🇳 +91
                        </div>
                        <div className="relative flex-1">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                            placeholder="e.g. 9876543210"
                            maxLength={10}
                            autoFocus
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-2xs"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1.5">
                        We will send a 6-digit OTP code to verify your number.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || phone.length < 10}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Continue</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-gray-400 text-center pt-1">
                      By continuing, you agree to our{" "}
                      <Link href="/terms" className="text-gray-600 underline hover:text-blue-600 font-medium">
                        Terms of Service
                      </Link>{" "}
                      &{" "}
                      <Link href="/privacy-policy" className="text-gray-600 underline hover:text-blue-600 font-medium">
                        Privacy Policy
                      </Link>
                    </p>
                  </form>
                )}

                {/* ─────────────────────────────────────────────────────────────
                   STEP 2: 6-Digit OTP Input
                ───────────────────────────────────────────────────────────── */}
                {step === "otp" && (
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2.5">
                        <label className="text-xs font-bold text-gray-700">
                          Enter 6-Digit OTP
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setStep("phone");
                            setOtp(["", "", "", "", "", ""]);
                            setError("");
                          }}
                          className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          Change Number
                        </button>
                      </div>

                      <div className="flex gap-1.5 sm:gap-2 justify-between" onPaste={handleOtpPaste}>
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            ref={(el) => {
                              otpRefs.current[i] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                            className={`w-9 sm:w-11 md:w-12 h-11 sm:h-13 text-center text-base sm:text-xl font-black rounded-xl border-2 transition-all bg-white outline-none ${
                              digit
                                ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-xs"
                                : "border-gray-200 text-gray-900 focus:border-blue-500"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      {resendTimer > 0 ? (
                        <span className="text-gray-400">
                          Resend code in{" "}
                          <strong className="text-blue-600 font-bold">{resendTimer}s</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setOtp(["", "", "", "", "", ""]);
                            setError("");
                            setResendTimer(60);
                            handleSendOtp();
                          }}
                          className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Resend OTP Code</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otp.join("").length < 6}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify & Continue</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* ─────────────────────────────────────────────────────────────
                   STEP 3: CANDIDATE PROFILE COMPLETION ONBOARDING
                ───────────────────────────────────────────────────────────── */}
                {step === "profile" && (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={profile.fullName}
                          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                          placeholder="e.g. Vikram Sharma"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          required
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          placeholder="e.g. vikram.sharma@example.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Gender Selection */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Gender *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {["male", "female", "other"].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setProfile({ ...profile, gender: g })}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                              profile.gender === g
                                ? "bg-blue-50 border-blue-600 text-blue-700 shadow-2xs"
                                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            {g === "male" && "👨 Male"}
                            {g === "female" && "👩 Female"}
                            {g === "other" && "⚧ Other"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Date of Birth (Must be 18+) *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          required
                          value={profile.dob}
                          onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Location: City and Area / Locality */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-gray-700">
                            Current City *
                          </label>
                          <button
                            type="button"
                            onClick={handleDetectLocation}
                            disabled={detectingLocation}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline cursor-pointer disabled:opacity-50"
                          >
                            <Compass className={`w-3.5 h-3.5 ${detectingLocation ? "animate-spin text-blue-600" : ""}`} />
                            <span>{detectingLocation ? "Detecting..." : "Auto-detect Area & City"}</span>
                          </button>
                        </div>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            required
                            value={profile.city}
                            onChange={(e) => {
                              setProfile({ ...profile, city: e.target.value });
                              setLocationMsg("");
                            }}
                            placeholder="e.g. Jaipur, Mumbai, Bengaluru"
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                          />
                        </div>

                        {/* Popular city quick chips */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {POPULAR_CITIES.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                const matchedKey = Object.keys(POPULAR_AREAS_BY_CITY).find(
                                  (k) => k.toLowerCase() === c.toLowerCase()
                                );
                                const defaultArea = matchedKey ? POPULAR_AREAS_BY_CITY[matchedKey][0] : "";
                                setProfile({
                                  ...profile,
                                  city: c,
                                  area: defaultArea,
                                });
                                setLocationMsg(`📍 Selected: ${defaultArea}, ${c}`);
                              }}
                              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all cursor-pointer ${
                                profile.city === c
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-slate-50 text-gray-600 border-gray-200 hover:bg-slate-100"
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Area / Locality Input Field */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-gray-700">
                            Area / Locality *
                          </label>
                          <span className="text-[11px] text-gray-400 font-medium">
                            Colony / Suburb / Locality
                          </span>
                        </div>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            required
                            value={profile.area}
                            onChange={(e) => {
                              setProfile({ ...profile, area: e.target.value });
                              setLocationMsg("");
                            }}
                            placeholder="e.g. Sodala, Malviya Nagar, Andheri West"
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                          />
                        </div>

                        {/* Popular Areas for Selected City */}
                        {(() => {
                          const matchedKey = Object.keys(POPULAR_AREAS_BY_CITY).find(
                            (k) => k.toLowerCase() === (profile.city || "Jaipur").trim().toLowerCase()
                          );
                          const baseAreas = matchedKey ? POPULAR_AREAS_BY_CITY[matchedKey] : (POPULAR_AREAS_BY_CITY["Jaipur"] || []);
                          if (!baseAreas || baseAreas.length === 0) return null;

                          const cleanArea = (profile.area || "").trim();
                          const hasInList = baseAreas.some(
                            (item) => item.trim().toLowerCase() === cleanArea.toLowerCase()
                          );
                          const displayAreas = cleanArea && !hasInList ? [cleanArea, ...baseAreas] : baseAreas;

                          return (
                            <div className="mt-2.5">
                              <div className="flex justify-between items-center mb-1.5">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                  Areas in {profile.city || "Jaipur"} ({baseAreas.length} Total):
                                </p>
                                {cleanArea && (
                                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                                    Selected: {cleanArea}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200/80 rounded-2xl">
                                {displayAreas.map((a) => {
                                  const isSelected = cleanArea.toLowerCase() === a.trim().toLowerCase();
                                  return (
                                    <button
                                      key={a}
                                      type="button"
                                      onClick={() => {
                                        setProfile({ ...profile, area: a });
                                        setLocationMsg("");
                                      }}
                                      className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                                        isSelected
                                          ? "bg-blue-600 text-white border-blue-600 font-bold shadow-xs"
                                          : "bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 font-medium"
                                      }`}
                                    >
                                      {isSelected && <span>✓</span>}
                                      <span>{a}</span>
                                    </button>
                                  );
                                })}
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1">
                                💡 Tap any area above or type your exact colony/locality name in the input box.
                              </p>
                            </div>
                          );
                        })()}

                        {locationMsg && (
                          <p className={`text-[11px] font-medium mt-1.5 ${locationMsg.includes("📍") ? "text-emerald-600" : "text-amber-600"}`}>
                            {locationMsg}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Highest Qualification */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Highest Qualification *
                      </label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          value={profile.education}
                          onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        >
                          {EDUCATION_OPTIONS.map((edu) => (
                            <option key={edu} value={edu}>
                              {edu}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Total Experience */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Total Work Experience *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {EXPERIENCE_OPTIONS.map((exp) => (
                          <button
                            key={exp}
                            type="button"
                            onClick={() => setProfile({ ...profile, experience: exp })}
                            className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all text-center cursor-pointer ${
                              profile.experience === exp
                                ? "bg-blue-50 border-blue-600 text-blue-700 shadow-2xs"
                                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            {exp}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preferred Job Role / Title */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Preferred Job Role / Title (Optional)
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={profile.jobTitle}
                          onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                          placeholder="e.g. Telecaller, Software Engineer, Sales"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {SUGGESTED_ROLES.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setProfile({ ...profile, jobTitle: r })}
                            className={`px-2 py-0.5 text-[10px] font-medium rounded-md border transition-all cursor-pointer ${
                              profile.jobTitle === r
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-slate-50 text-gray-600 border-gray-200 hover:bg-slate-100"
                            }`}
                          >
                            + {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading || !profile.fullName || !profile.city || !profile.dob}
                      className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Save & Continue to Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Instant Access Assurance */}
                <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-2">
                  <p className="text-xs text-gray-500 font-medium">
                    ⚡ Direct connection with 15,000+ verified employers across India
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>100% Free & Verified Candidate Network</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Firebase Recaptcha Container */}
        <div id="recaptcha-container"></div>
      </HomepageLayout>
    </>
  );
}