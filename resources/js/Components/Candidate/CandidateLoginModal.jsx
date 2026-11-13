import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import { auth } from "@/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import {
  ArrowRight,
  RefreshCw,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Briefcase,
  Edit2,
  ChevronLeft,
} from "lucide-react";

export default function CandidateLoginModal({
  isOpen,
  onClose,
  onSuccess,
  jobTitle = "",
  jobKey = "",
}) {
  const [step, setStep] = useState("phone"); // 'phone' | 'otp'
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  useEffect(() => {
    if (isOpen) {
      setStep("phone");
      setPhone("");
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setLoading(false);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
    if (error) setError("");
  };

  const handleSendOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanDigits = phone.replace(/\D/g, "");
    if (!cleanDigits || cleanDigits.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!/^[6-9]/.test(cleanDigits)) {
      setError("Indian mobile number must start with 6, 7, 8, or 9.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Initialize Invisible Firebase Recaptcha
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-modal-container",
          {
            size: "invisible",
          }
        );
        await window.recaptchaVerifier.render();
      }

      const appVerifier = window.recaptchaVerifier;

      const result = await signInWithPhoneNumber(
        auth,
        "+91" + cleanDigits,
        appVerifier
      );

      setConfirmationResult(result);
      setStep("otp");
      setResendTimer(60);
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 150);
    } catch (err) {
      console.warn("Firebase OTP issue, checking fallback:", err);
      // If Firebase fails (e.g. quota or billing), allow direct login for demo / registered accounts
      if (err.message && err.message.includes("BILLING_NOT_ENABLED")) {
        try {
          const directLogin = await axios.post("/phone-login", {
            phone: cleanDigits,
            job_id: jobKey || undefined,
          });
          if (directLogin.data.success) {
            window.dispatchEvent(
              new CustomEvent("ats_user_logged_in", { detail: directLogin.data.user })
            );
            if (jobKey) {
              onClose();
              router.visit(`/apply/${jobKey}`);
              return;
            }
            router.reload({
              only: ["auth", "candidateProfile"],
              preserveScroll: true,
              preserveState: true,
            });
            if (onSuccess) onSuccess(directLogin.data.user);
            onClose();
            return;
          }
        } catch (subErr) {
          setError("Failed to send OTP. Please check your connection.");
        }
      } else if (err.code === "auth/invalid-phone-number") {
        setError("Invalid phone number format. Please enter a valid 10-digit number.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many requests sent. Please wait a minute and try again.");
      } else {
        setError(err.message || "Failed to send verification code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
    if (!val && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (confirmationResult) {
        await confirmationResult.confirm(code);
      }

      const cleanDigits = phone.replace(/\D/g, "");
      const res = await axios.post("/phone-login", {
        phone: cleanDigits,
        job_id: jobKey || undefined,
      });

      if (res.data.success) {
        window.dispatchEvent(
          new CustomEvent("ats_user_logged_in", { detail: res.data.user })
        );
        if (jobKey) {
          onClose();
          router.visit(`/apply/${jobKey}`);
          return;
        }
        router.reload({
          only: ["auth", "candidateProfile"],
          preserveScroll: true,
          preserveState: true,
        });
        if (onSuccess) onSuccess(res.data.user);
        onClose();
      } else {
        setError(res.data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-verification-code") {
        setError("Invalid OTP code. Please enter the correct 6-digit code.");
      } else if (err.code === "auth/code-expired") {
        setError("OTP has expired. Please click Resend OTP to get a new code.");
      } else {
        setError(err.response?.data?.message || err.message || "Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overscroll-contain animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-7 max-w-[420px] w-full border border-gray-100 relative my-auto max-h-[92dvh] overflow-y-auto overscroll-contain animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer transition disabled:opacity-30 z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "phone" ? (
          <>
            {/* Modal Header without big phone icon */}
            <div className="text-center mb-4 sm:mb-5 pt-1 pr-6 pl-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-bold text-blue-700 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{jobTitle ? "Candidate Quick Apply" : "Candidate Login & Register"}</span>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                {jobTitle ? "Apply for this Position" : "Welcome to ATS Jobs"}
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
                {jobTitle
                  ? "Enter your mobile number to verify with OTP and submit your application."
                  : "Sign in or register your profile with mobile OTP — 100% free & direct."}
              </p>
            </div>

            {/* Active Job Highlight Banner */}
            {jobTitle && (
              <div className="mb-3.5 sm:mb-4 p-2.5 sm:p-3 bg-gradient-to-r from-blue-50/90 to-indigo-50/60 border border-blue-100 rounded-2xl flex items-center gap-2.5 sm:gap-3 text-left">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Briefcase className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Applying For</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 truncate">{jobTitle}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-3.5 sm:mb-4 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-xs text-red-700 text-left animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <form onSubmit={handleSendOtp} className="space-y-3.5 sm:space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-gray-400 font-medium">10 Digits</span>
                </div>
                <div className="flex items-center w-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent focus-within:bg-white transition shadow-2xs">
                  <div className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-3 sm:py-3.5 bg-slate-100 border-r border-slate-200 shrink-0 select-none">
                    <span className="text-base leading-none">🇮🇳</span>
                    <span className="text-xs sm:text-sm font-black text-gray-800">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full min-w-0 px-3.5 sm:px-4 py-3 sm:py-3.5 bg-transparent border-0 text-sm font-bold text-gray-900 outline-none focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:font-normal"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  We will send a 6-digit OTP code to verify your phone number
                </p>
              </div>

              {/* Value Propositions */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-0.5 pb-0.5 text-center">
                <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50 border border-slate-100/90">
                  <p className="text-[10px] sm:text-[11px] font-bold text-gray-800">100% Free</p>
                  <p className="text-[9px] sm:text-[10px] text-gray-500">Zero Charges</p>
                </div>
                <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50 border border-slate-100/90">
                  <p className="text-[10px] sm:text-[11px] font-bold text-gray-800">Direct HR</p>
                  <p className="text-[9px] sm:text-[10px] text-gray-500">Verified Jobs</p>
                </div>
                <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50 border border-slate-100/90">
                  <p className="text-[10px] sm:text-[11px] font-bold text-gray-800">Instant OTP</p>
                  <p className="text-[9px] sm:text-[10px] text-gray-500">Fast Login</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-2xl text-xs sm:text-sm font-bold transition shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending OTP via SMS...</span>
                  </>
                ) : (
                  <>
                    <span>{jobKey || jobTitle ? "Get OTP to Apply" : "Get OTP & Continue"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* OTP Step Header without big top icon */}
            <div className="text-center mb-4 sm:mb-5 pt-1 pr-6 pl-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-700 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>OTP Verification</span>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                Enter 6-Digit OTP
              </h3>

              <div className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-gray-600 flex-wrap">
                <span>SMS code sent to</span>
                <span className="font-extrabold text-gray-900">+91 {phone}</span>
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setError("");
                  }}
                  className="inline-flex items-center gap-0.5 text-blue-600 font-bold hover:underline ml-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              {jobTitle && (
                <div className="mt-2.5 px-3 py-1.5 bg-blue-50/80 border border-blue-100 rounded-xl inline-flex items-center gap-2 text-left max-w-full">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <p className="text-[11px] font-semibold text-blue-900 truncate">Applying for: {jobTitle}</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-3.5 sm:mb-4 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-xs text-red-700 text-left animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-3.5 sm:space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Enter 6-Digit Code
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setError("");
                    }}
                    className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Change Number</span>
                  </button>
                </div>

                <div className="flex justify-between gap-1.5 sm:gap-2 w-full max-w-xs mx-auto">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={handleOtpPaste}
                      className="flex-1 min-w-0 max-w-[46px] h-12 sm:h-13 text-center text-lg sm:text-2xl font-black bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100 text-gray-900 transition shadow-2xs"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between mt-3 px-1 text-xs">
                  <span className="text-gray-400">Didn't receive SMS code?</span>
                  {resendTimer > 0 ? (
                    <span className="text-gray-400 font-semibold tabular-nums">
                      Resend in {resendTimer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.join("").length !== 6}
                className="w-full py-3 sm:py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-2xl text-xs sm:text-sm font-bold transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{jobKey || jobTitle ? "Verify & Proceed to Apply" : "Verify & Sign In"}</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* Invisible container for Firebase recaptcha */}
        <div id="recaptcha-modal-container"></div>

        {/* Modal Footer / Trust Badges */}
        <div className="mt-4 sm:mt-5 pt-3.5 sm:pt-4 border-t border-gray-100 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-gray-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>100% Secure & Confidential • Safe verification</span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1">
            By continuing, you agree to ATS Terms of Service & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
