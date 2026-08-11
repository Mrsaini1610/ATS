// import { useState, useRef, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
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
  Home,
  Users,
  Info,
  Star,
  Building2,
  MapPin,
  TrendingUp,
  Shield,
  Clock,
} from "lucide-react";

import { useState, useRef, useEffect } from "react";


/* ── Left panel decorative data ── */
const stats = [
  { label: "Live Jobs", value: "12K+" },
  { label: "Companies", value: "3.2K+" },
  { label: "Placements", value: "85K+" },
  { label: "Success Rate", value: "94%" },
];

const features = [
  { icon: Search, text: "Smart job search with AI matching" },
  { icon: Building2, text: "Top companies across India" },
  { icon: Shield, text: "Verified employers only" },
  { icon: Clock, text: "Apply in under 2 minutes" },
];

const floatingJobs = [
  {
    title: "React Developer",
    company: "TechCorp PK",
    salary: "INR 180K",
    color: "bg-blue-500",
  },
  {
    title: "UI/UX Designer",
    company: "Creative Studio",
    salary: "INR 100K",
    color: "bg-purple-500",
  },
  {
    title: "Data Analyst",
    company: "FinTech PK",
    salary: "INR 150K",
    color: "bg-teal-500",
  },
];



export default function CandidateLogin() {

    const { url } = usePage();
    const params = new URLSearchParams(url.split("?")[1]);
    const jobId = params.get("job");
    const [step, setStep] = useState("phone");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const otpRefs = useRef([]);



  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(
      () => setResendTimer((p) => p - 1),
      1000,
    );
    return () => clearTimeout(t);
  }, [resendTimer]);

const handleSendOtp = async (e) => {
    e.preventDefault();

    try {
        setLoading(true);
        setError("");

        const mobile = phone.replace(/\D/g, "");

        if (mobile.length !== 10) {
            setError("Enter valid phone number");
            setLoading(false);
            return;
        }
console.log("Phone sending =", mobile);
        // Database check
        const response = await axios.post(route("check.phone"), {
            phone: mobile,
        });

        if (!response.data.success) {
            setError("User not found");
            setLoading(false);
            return;
        }

        // Create Recaptcha only once
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

        if (err.response?.data?.message) {
            setError(err.response.data.message);
        } else {
            setError(err.message);
        }
    }

    setLoading(false);
};

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
const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
        setLoading(true);
        setError("");

        const code = otp.join("");

        const result = await confirmationResult.confirm(code);

        if (result.user) {
            const login = await axios.post(route("phone.login"), {
                phone: phone.replace(/\D/g, ""),
                job_id: jobId,
            });

            window.location.href = login.data.redirect;
        }

    } catch (err) {
        console.log(err);
        setError("Invalid OTP");
    }

        setLoading(false);
    };
    return (

    <HomepageLayout hideFooter>
        <div className="min-h-screen bg-white">
      {/* ── Top navbar ── */}


      {/* ── Main split layout ── */}
         <div className="flex flex-1 py-10 min-h-screen">

        {/* LEFT — Illustrated panel */}
        <div
          className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-10"
          style={{
            background:
              "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 45%, #2563eb 70%, #0891b2 100%)",
          }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.8"
                  />
                </pattern>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="url(#grid)"
              />
            </svg>
          </div>

          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white opacity-5 rounded-full" />
          <div className="absolute bottom-20 -left-16 w-56 h-56 bg-cyan-400 opacity-10 rounded-full" />
          <div className="absolute top-1/2 right-8 w-32 h-32 bg-blue-300 opacity-10 rounded-full" />

          {/* Top: Branding */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-xl">
                  JobPortal
                </div>
                <div className="text-blue-200 text-xs">
                  India's #1 Job Platform
                </div>
              </div>
            </div>

            <h2 className="text-white text-3xl font-bold leading-tight mb-3">
              Your Dream Job
              <br />
              Is One Step Away
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed max-w-sm">
              India ke top employers se directly connect
              karo. Apni skills ke mutabiq best opportunities
              dhundo.
            </p>
          </div>

          {/* Middle: Floating job cards */}
          <div className="relative z-10 space-y-3 my-8">
            {floatingJobs.map((job, i) => (
              <div
                key={job.title}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3"
                style={{
                  transform: `translateX(${i % 2 === 0 ? "0" : "20px"})`,
                }}
              >
                <div
                  className={`w-9 h-9 ${job.color} rounded-xl flex items-center justify-center shrink-0`}
                >
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">
                    {job.title}
                  </p>
                  <p className="text-blue-200 text-xs">
                    {job.company}
                  </p>
                </div>
                <span className="text-green-300 text-xs font-medium shrink-0">
                  {job.salary}
                </span>
              </div>
            ))}

            <div className="flex items-center gap-2 mt-2 pl-1">
              <div className="flex -space-x-2">
                {[
                  "bg-pink-400",
                  "bg-yellow-400",
                  "bg-green-400",
                  "bg-purple-400",
                ].map((c, i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 ${c} rounded-full border-2 border-blue-700 flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {["A", "B", "F", "Z"][i]}
                  </div>
                ))}
              </div>
              <p className="text-blue-200 text-xs">
                +2,400 candidates joined this week
              </p>
            </div>
          </div>

          {/* Bottom: Stats */}
          <div className="relative z-10">
            <div className="grid grid-cols-4 gap-3 mb-6">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-3"
                >
                  <div className="text-white font-bold text-lg">
                    {s.value}
                  </div>
                  <div className="text-blue-200 text-xs mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {features.map((f) => (
                <div
                  key={f.text}
                  className="flex items-center gap-2.5 text-blue-100 text-sm"
                >
                  <div className="w-6 h-6 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                    <f.icon className="w-3.5 h-3.5 text-blue-200" />
                  </div>
                  {f.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Form panel */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-gray-50">
          <div className="w-full max-w-sm">
            {/* Mobile logo (hidden on lg) */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                JobPortal
              </h1>
              <p className="text-gray-500 text-sm">
                India's #1 Job Platform
              </p>
            </div>

            {/* Form heading */}
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-gray-900">
                {step === "phone"
                  ? "Welcome Back!"
                  : "Verify OTP"}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {step === "phone"
                  ? "Sign in with your phone number"
                  : `Code sent to +91 ${phone}`}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            {/* ── Phone step ── */}
            {step === "phone" && (
              <form
                onSubmit={handleSendOtp}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-3 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 shrink-0 shadow-sm">
                      IND +91
                    </div>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value)
                        }
                        placeholder="9876543210"
                        maxLength={10}
                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> OTP via SMS —
                    no password needed
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-60 shadow-md shadow-blue-200"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Send OTP{" "}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="relative flex items-center gap-3 py-1">
                  <hr className="flex-1 border-gray-200" />
                  <span className="text-xs text-gray-400">
                    OR
                  </span>
                  <hr className="flex-1 border-gray-200" />
                </div>

                <Link
                  href="/job-search"
                  className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-medium text-sm transition-colors"
                >
                  <Search className="w-4 h-4 text-blue-600" />{" "}
                  Browse Jobs Without Login
                </Link>

                <p className="text-center text-sm text-gray-500">
                  New user?{" "}
                  <Link
                    href="/register"
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Create Account
                  </Link>
                </p>
              </form>
            )}

            {/* ── OTP step ── */}
            {step === "otp" && (
              <form
                onSubmit={handleVerifyOtp}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    Enter 6-Digit Code
                  </label>
                  <div
                    className="flex gap-2 justify-center"
                    onPaste={handleOtpPaste}
                  >
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
                        onChange={(e) =>
                          handleOtpChange(i, e.target.value)
                        }
                        onKeyDown={(e) =>
                          handleOtpKeyDown(i, e)
                        }
                        className={`w-11 text-center text-xl font-bold border-2 rounded-xl focus:outline-none transition-all bg-white ${digit ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-900"}`}
                        style={{ height: "3.25rem" }}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-gray-500">
                      Resend in{" "}
                      <span className="font-semibold text-blue-600">
                        {resendTimer}s
                      </span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setOtp(["", "", "", "", "", ""]);
                        setError("");
                        setResendTimer(60);
                        setTimeout(
                          () => otpRefs.current[0]?.focus(),
                          100,
                        );
                      }}
                      className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline mx-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />{" "}
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join("").length < 6}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-60 shadow-md shadow-blue-200"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />{" "}
                      Verify & Sign In
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setOtp(["", "", "", "", "", ""]);
                    setError("");
                  }}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeft className="w-4 h-4" /> Change
                  phone number
                </button>
              </form>
            )}

            {/* Bottom links */}


            <p className="text-center text-xs text-gray-300 mt-6">
              Demo: any number → any 6 digits
            </p>
          </div>
        </div>
      </div>
    </div>
<div id="recaptcha-container"></div>
    </HomepageLayout>
  );
}
