import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import { auth } from "@/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import {
  Phone,
  ArrowRight,
  RefreshCw,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function CandidateLoginModal({
  isOpen,
  onClose,
  onSuccess,
  jobTitle = "",
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
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
    if (error) setError("");
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
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
        // Direct auto-login fallback if billing not enabled
        try {
          const directLogin = await axios.post("/phone-login", {
            phone: cleanDigits,
          });
          if (directLogin.data.success) {
            window.dispatchEvent(
              new CustomEvent("ats_user_logged_in", { detail: directLogin.data.user })
            );
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
        setError("Invalid phone number format.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please wait a few moments.");
      } else {
        setError(err.message || "Failed to send verification code. Try again.");
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
      });

      if (res.data.success) {
        window.dispatchEvent(
          new CustomEvent("ats_user_logged_in", { detail: res.data.user })
        );
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
        setError("Invalid OTP code. Please enter the correct code.");
      } else if (err.code === "auth/code-expired") {
        setError("OTP has expired. Please click Resend code.");
      } else {
        setError(err.response?.data?.message || err.message || "Verification failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-7 max-w-md w-full border border-gray-100 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl cursor-pointer transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Branding Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-600/30">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
            Sign In with Mobile
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {jobTitle ? (
              <span>To apply for <strong>{jobTitle}</strong>, please verify your mobile number</span>
            ) : (
              <span>Quick candidate login • 100% Free & Direct</span>
            )}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="e.g. 9876543210"
                  className="w-full pl-13 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">
                We will send a 6-digit OTP to verify your account
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <span>Get OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Enter 6-Digit OTP
                </span>
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Change (+91 {phone})
                </button>
              </div>

              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-13 text-center text-xl font-black bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-gray-900 transition"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-gray-400">Didn't receive code?</span>
                {resendTimer > 0 ? (
                  <span className="text-gray-400 font-medium">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.join("").length !== 6}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Continue</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Invisible container for Firebase recaptcha */}
        <div id="recaptcha-modal-container"></div>

        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Your details are 100% confidential & encrypted</span>
        </div>
      </div>
    </div>
  );
}

