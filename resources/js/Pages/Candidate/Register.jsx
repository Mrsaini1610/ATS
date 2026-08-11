import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import HomepageLayout from "@/Layouts/HomepageLayout";

import { auth } from "@/firebase";
import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from "firebase/auth";


import {
  Briefcase,
  Phone,
  User,
  MapPin,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  ChevronLeft,
  Search,
  Shield,
  Award,
  TrendingUp,
  Zap,
  Star,
} from "lucide-react";



const perks = [
  { icon: Search, text: "Access 12,000+ live jobs instantly" },
  { icon: Award, text: "Get discovered by 3,200+ companies" },
  { icon: TrendingUp, text: "Track all your applications in one place" },
  { icon: Zap, text: "AI-powered job recommendations" },
  { icon: Shield, text: "100% free — no hidden charges" },
];

const testimonial = {
  text: "3 hafte mein dream job mil gaya. JobPortal ne sab kuch asan kar diya!",
  name: "Zainab M.",
  role: "Software Engineer · TechCorp PK",
  initials: "ZM",
  color: "bg-pink-500",
};

export default function CandidateRegister() {
const [step, setStep] = useState("phone");
const [phone, setPhone] = useState("");
const [otp, setOtp] = useState(["", "", "", "", "", ""]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [resendTimer, setResendTimer] = useState(0);
const [confirmationResult, setConfirmationResult] = useState(null);

const otpRefs = useRef([]);

const [profile, setProfile] = useState({
    fullName: "",
    city: "",
    jobTitle: "",
    experience: "",
    education: "",
    dob: "",
});

useEffect(() => {
    if (resendTimer <= 0) return;

    const t = setTimeout(() => {
        setResendTimer((p) => p - 1);
    }, 1000);

    return () => clearTimeout(t);
}, [resendTimer]);



const handleSendOtp = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {

        const mobile = phone.replace(/\D/g, "");

        if (mobile.length !== 10) {
            setError("Enter valid phone number");
            setLoading(false);
            return;
        }

        // Check Candidate Exists
        const res = await axios.post("/check-phone-register", {
            phone: mobile,
        });

        if (res.data.exists) {
            setError("Phone number already registered.");
            setLoading(false);
            return;
        }

        // Firebase Recaptcha
        if (!window.recaptchaVerifier) {

            window.recaptchaVerifier =
                new RecaptchaVerifier(
                    auth,
                    "recaptcha-container",
                    {
                        size: "invisible",
                    }
                );

            await window.recaptchaVerifier.render();
        }

        const appVerifier = window.recaptchaVerifier;

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
        }, 100);

    } catch (err) {

        console.log(err);

        setError(err.message);

    }

    setLoading(false);
};

 const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
    if (!val && i > 0) otpRefs.current[i - 1]?.focus();
  };

 const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

const handleOtpPaste = (e) => {
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (p.length === 6) { setOtp(p.split("")); otpRefs.current[5]?.focus(); }
    e.preventDefault();
  };



const handleVerifyOtp = async (e) => {

    e.preventDefault();

    setLoading(true);

    setError("");

    try {

        const code = otp.join("");

        const result = await confirmationResult.confirm(code);

        if (result.user) {

            setStep("profile");

        }

    } catch (err) {

        console.log(err);

        setError("Invalid OTP");

    }

    setLoading(false);
};


const handleProfileSubmit = async (e) => {
    if (calculateAge(profile.dob) < 18) {
        setError("You must be at least 18 years old to apply.");
        return;
    }
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
        const response = await axios.post("/candidate-register", {

            phone,

            full_name: profile.fullName,

            dob: profile.dob,

            city: profile.city,

            job_title: profile.jobTitle,

            experience: profile.experience,

            education: profile.education,
        });

        if (response.data.success) {
            router.visit("/");
        } else {
            setError(response.data.message);
        }
    } catch (err) {
        setError(err.response?.data?.message || "Registration failed.");
    }

    setLoading(false);
};

const calculateAge = (dob) => {
    if (!dob) return 0;

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const month = today.getMonth() - birthDate.getMonth();

    if (
        month < 0 ||
        (month === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    return age;
};

const age = calculateAge(profile.dob);

  const upd = (f, v) => setProfile((p) => ({ ...p, [f]: v }));

const steps = [
    { key: "phone", label: "Phone" },
    { key: "otp", label: "Verify" },
    { key: "profile", label: "Profile" },
  ];
  const idx = steps.findIndex((s) => s.key === step);

  return (

    <HomepageLayout hideFooter>
        <div className="min-h-screen flex flex-col bg-white">
      {/* ── Top navbar ── */}


      {/* ── Main split layout ── */}
      <div className="flex flex-1 py-10 min-h-screen">

        {/* LEFT — Illustrated panel */}
        <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-10"
          style={{ background: "linear-gradient(150deg, #0f172a 0%, #1e3a8a 40%, #1d4ed8 75%, #0369a1 100%)" }}>

          {/* SVG grid pattern */}
          <div className="absolute inset-0 opacity-[0.07]">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="white"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)"/>
            </svg>
          </div>

          {/* Glow blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 opacity-10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-400 opacity-10 rounded-full blur-3xl" />

          {/* Top */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-xl">JobPortal</div>
                <div className="text-blue-300 text-xs">India's #1 Job Platform</div>
              </div>
            </div>

            <h2 className="text-white text-3xl font-bold leading-snug mb-3">
              Join 85,000+<br />Successful Candidates
            </h2>
            <p className="text-blue-200 text-sm leading-relaxed max-w-sm">
              Free account banao aur India ke best employers ke saath directly connect karo. Apni career start karo aaj hi!
            </p>
          </div>

          {/* Middle: Perks */}
          <div className="relative z-10 space-y-3 my-6">
            {perks.map((p) => (
              <div key={p.text} className="flex items-center gap-3 bg-white/8 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
                <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center shrink-0">
                  <p.icon className="w-4 h-4 text-blue-200" />
                </div>
                <span className="text-blue-100 text-sm">{p.text}</span>
                <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto shrink-0" />
              </div>
            ))}
          </div>

          {/* Bottom: Testimonial */}
          <div className="relative z-10">
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-white text-sm italic leading-relaxed mb-4">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 ${testimonial.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-blue-300 text-xs">{testimonial.role}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 px-1">
              <div className="flex -space-x-2">
                {["bg-pink-400","bg-yellow-400","bg-green-400","bg-violet-400","bg-cyan-400"].map((c,i)=>(
                  <div key={i} className={`w-7 h-7 ${c} rounded-full border-2 border-blue-900`}/>
                ))}
              </div>
              <p className="text-blue-300 text-xs">+2,400 joined this week</p>
            </div>
          </div>
        </div>

        {/* RIGHT — Form panel */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-10 bg-gray-50">
          <div className="w-full max-w-sm">

            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-6">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">JobPortal</h1>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < idx ? "bg-green-500 text-white" : i === idx ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}>
                    {i < idx ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${i === idx ? "text-blue-600" : "text-gray-400"}`}>{s.label}</span>
                  {i < steps.length - 1 && <div className={`w-6 h-0.5 ${i < idx ? "bg-green-400" : "bg-gray-200"}`} />}
                </div>
              ))}
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {step === "phone" && "Create Account"}
                {step === "otp" && "Verify Number"}
                {step === "profile" && "Your Profile"}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {step === "phone" && "Enter your mobile number to get started"}
                {step === "otp" && `Code sent to +91 ${phone}`}
                {step === "profile" && "Almost there! Fill in your details"}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
            )}

            {/* ── STEP 1: Phone ── */}
            {step === "phone" && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-3 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 shrink-0 shadow-sm">
                      IND +91
                    </div>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210" maxLength={11} required
                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> OTP via SMS — no password needed
                  </p>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-60 shadow-md shadow-blue-200">
                  {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
                </button>

                <div className="relative flex items-center gap-3 py-1">
                  <hr className="flex-1 border-gray-200" />
                  <span className="text-xs text-gray-400">OR</span>
                  <hr className="flex-1 border-gray-200" />
                </div>

                <Link href="/job-search"
                  className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-medium text-sm">
                  <Search className="w-4 h-4 text-blue-600" /> Browse Jobs Without Signing Up
                </Link>

                <p className="text-center text-sm text-gray-500">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign In</Link>
                </p>
              </form>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Enter 6-Digit Code</label>
                  <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input key={i} ref={(el) => { otpRefs.current[i] = el; }}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={`w-11 text-center text-xl font-bold border-2 rounded-xl focus:outline-none transition-all bg-white ${digit ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200"}`}
                        style={{ height: "3.25rem" }} />
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  {resendTimer > 0
                    ? <p className="text-sm text-gray-500">Resend in <span className="font-semibold text-blue-600">{resendTimer}s</span></p>
                    : <button type="button"
                        onClick={() => { setOtp(["","","","","",""]); setError(""); setResendTimer(60); setTimeout(() => otpRefs.current[0]?.focus(), 100); }}
                        className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline mx-auto">
                        <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
                      </button>}
                </div>

                <button type="submit" disabled={loading || otp.join("").length < 6}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-60 shadow-md shadow-blue-200">
                  {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><CheckCircle2 className="w-4 h-4" /> Verify OTP</>}
                </button>

                <button type="button" onClick={() => { setStep("phone"); setOtp(["","","","","",""]); setError(""); }}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                  <ChevronLeft className="w-4 h-4" /> Change phone number
                </button>
              </form>
            )}

            {/* ── STEP 3: Profile ── */}
            {step === "profile" && (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input required value={profile.fullName} onChange={(e) => upd("fullName", e.target.value)}
                      placeholder="Sachin Yadav"
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">City *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select required value={profile.city} onChange={(e) => upd("city", e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm">
                      <option value="">Select City</option>
                      {["Mumbai","Delhi","Jaipur","Ajmer","J&K"].map((c)=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Desired Job Title *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input required value={profile.jobTitle} onChange={(e) => upd("jobTitle", e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Experience</label>
                    <select value={profile.experience} onChange={(e) => upd("experience", e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm">
                      <option value="">Select</option>
                      <option>Fresh Graduate</option><option>1-2 Years</option>
                      <option>3-5 Years</option><option>5-10 Years</option><option>10+ Years</option>
                    </select>
                  </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Date of Birth *
                    </label>

                    <input
                        type="date"
                        required
                        value={profile.dob}
                        onChange={(e) => upd("dob", e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    />

                    {profile.dob && age < 18 && (
                        <p className="text-red-600 text-xs mt-2">
                            You must be at least 18 years old to apply for jobs.
                        </p>
                    )}
                </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Education</label>
                    <select value={profile.education} onChange={(e) => upd("education", e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm">
                      <option value="">Select</option>
                      <option>Matric</option><option>Intermediate</option>
                      <option>Bachelor's</option><option>Master's</option><option>PhD</option>
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={loading || (profile.dob && age < 18)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold mt-1 disabled:opacity-60 shadow-md shadow-blue-200">
                  {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><CheckCircle2 className="w-4 h-4" /> Complete Registration</>}
                </button>
              </form>
            )}



            <p className="text-center text-xs text-gray-300 mt-5">Demo: any number → any 6 digits → fill profile</p>
            <div id="recaptcha-container"></div>
          </div>
        </div>
      </div>
    </div>
    </HomepageLayout>
  );
}
