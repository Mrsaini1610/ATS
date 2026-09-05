import React, { useState } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import { Briefcase, Mail, Lock, Eye, EyeOff, AlertCircle, Shield } from "lucide-react";

const ROLE_CONFIG = [
  {
    role: "super_admin",
    label: "Super Admin",
    email: "superadmin@ats.com",
    pass: "Superadmin@123",
    activeColor: "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/40",
    inactiveColor: "bg-purple-950/40 text-purple-300 border-purple-800/50 hover:bg-purple-900/40",
  },
  {
    role: "admin",
    label: "Admin",
    email: "admin@ats.com",
    pass: "Admin@123",
    activeColor: "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/40",
    inactiveColor: "bg-blue-950/40 text-blue-300 border-blue-800/50 hover:bg-blue-900/40",
  },
  {
    role: "team_member", 
    label: "Team Member", 
    email: "team@ats.com", 
    pass: "Password@123",
    activeColor: "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/40",
    inactiveColor: "bg-emerald-950/40 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/40",
  },
];

export default function AdminLogin() {
  const [showPass, setShowPass] = useState(false);
  const [selectedRole, setSelectedRole] = useState("super_admin");

  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    login: ROLE_CONFIG[0].email,
    password: ROLE_CONFIG[0].pass,
    target_role: "super_admin",
    remember: false,
  });

  const handleRoleSelect = (cfg) => {
    setSelectedRole(cfg.role);
    setData((prev) => ({
      ...prev,
      target_role: cfg.role,
      login: cfg.email,
      password: cfg.pass,
    }));
    clearErrors();
  };

const handleSubmit = (e) => {
    e.preventDefault();
    clearErrors();

    post(route("admin.login.submit"), {
      onFinish: () => reset("password"),
      onError: (errors) => {
        // Agar 419 Page Expired error aaye toh page refresh karke fresh token load kar lein
        if (errors.status === 419) {
          window.location.reload();
        }
      },
    });
  };

  const currentRoleLabel =
    ROLE_CONFIG.find((r) => r.role === selectedRole)?.label || "Super Admin";

  return (
    <>
      <Head title={`${currentRoleLabel} Sign In - ATS`} />

      <div className="min-h-screen bg-gray-950 flex">
        {/* Left branding panel */}
        <div className="hidden lg:flex flex-col w-96 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 p-10 text-white relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-xl leading-none">ATS</p>
                  <p className="text-blue-200 text-xs mt-0.5 tracking-wide">Recruitment & Staffing</p>
                </div>
              </div>

              <h1 className="text-3xl font-extrabold mb-3 leading-tight">
                Enterprise Talent<br />Acquisition System
              </h1>
              <p className="text-blue-200 text-sm leading-relaxed mb-10">
                Manage candidate pipelines, automate verification calls, schedule interviews, and organize recruitment workflows.
              </p>

              <div className="space-y-3">
                {[
                  { icon: Shield, title: "Role-Based Guard", desc: "Super Admin, Admin &  Team Member isolation" },
                  { icon: Briefcase, title: "Job Moderation", desc: "Approve, reject, hold job posts" },
                  { icon: Shield, title: "Candidate Tracking", desc: "Track every candidate stage live" },
                ].map((f) => (
                  <div key={f.title} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 border border-white/10 backdrop-blur-sm">
                    <f.icon className="w-5 h-5 shrink-0 text-blue-200" />
                    <div>
                      <p className="text-sm font-semibold">{f.title}</p>
                      <p className="text-xs text-blue-300">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
              <p className="text-[11px] font-bold text-blue-200 uppercase tracking-widest mb-1.5">
                Active Portal Mode
              </p>
              <p className="text-xs text-white">
                Only authenticated <strong className="underline decoration-blue-400">{currentRoleLabel}</strong> credentials can log in under this selection.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Login form */}
        <div className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-black text-xl">ATS</p>
                <p className="text-gray-400 text-xs">Admin Management Portal</p>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-extrabold text-white">ATS Sign In</h2>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-900/60 text-blue-300 border border-blue-800/80 uppercase">
                  {selectedRole.replace("_", " ")}
                </span>
              </div>
              <p className="text-gray-400 text-xs mb-6">
                Choose your role first, then enter your credentials.
              </p>

              {/* Role Selection Buttons */}
              <div className="flex gap-2 mb-6">
                {ROLE_CONFIG.map((c) => {
                  const isSelected = selectedRole === c.role;
                  return (
                    <button
                      key={c.role}
                      type="button"
                      onClick={() => handleRoleSelect(c)}
                      className={`flex-1 text-xs py-2 px-2 rounded-xl border font-bold transition-all cursor-pointer select-none ${
                        isSelected ? c.activeColor : c.inactiveColor
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email / Username Field */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5" htmlFor="login">
                    {currentRoleLabel} Email or Username
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      id="login"
                      type="text"
                      name="login"
                      value={data.login}
                      onChange={(e) => setData("login", e.target.value)}
                      placeholder="username or user@ats.in"
                      className={`w-full pl-10 pr-4 py-3 bg-gray-800 border text-white rounded-xl text-sm placeholder-gray-600 outline-none transition focus:ring-2 ${
                        errors.login
                          ? "border-red-500 focus:ring-red-500/30"
                          : "border-gray-700 focus:ring-blue-500 focus:border-transparent"
                      }`}
                      autoComplete="username"
                      autoFocus
                    />
                  </div>
                  {errors.login && (
                    <p className="text-xs text-red-400 mt-1.5">{errors.login}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      id="password"
                      type={showPass ? "text" : "password"}
                      name="password"
                      value={data.password}
                      onChange={(e) => setData("password", e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-12 py-3 bg-gray-800 border text-white rounded-xl text-sm placeholder-gray-600 outline-none transition focus:ring-2 ${
                        errors.password
                          ? "border-red-500 focus:ring-red-500/30"
                          : "border-gray-700 focus:ring-blue-500 focus:border-transparent"
                      }`}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none cursor-pointer"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-400 mt-1.5">{errors.password}</p>
                  )}
                </div>

                {/* Global Error Banner */}
                {errors.error && (
                  <div className="flex items-center gap-2 text-red-400 bg-red-950/60 border border-red-800/80 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p className="text-xs font-medium">{errors.error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/40 cursor-pointer active:scale-[0.99]"
                >
                  {processing ? "Verifying..." : `Sign In as ${currentRoleLabel}`}
                </button>
              </form>

              <p className="text-center text-xs text-gray-500 mt-6">
                Looking for candidate portal?{" "}
                <Link href="/" className="text-blue-400 hover:underline">
                  Go to ATS Portal
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
