import React, { useState } from "react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";
import { Head, usePage, useForm, router } from "@inertiajs/react";
import {
  CheckCircle2,
  Mail,
  Phone,
  Shield,
  Edit3,
  X,
  Lock,
  Eye,
  EyeOff,
  UserCog,
} from "lucide-react";

const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Admin",
  calling_team: "Calling Team",
};

const ROLE_COLORS = {
  super_admin: "bg-purple-100 text-purple-700 border-purple-200",
  admin: "bg-blue-100 text-blue-700 border-blue-200",
  calling_team: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const ALL_PERMISSIONS = [
  "create_jobs", "approve_jobs", "reject_jobs", "hold_jobs", "deactivate_jobs",
  "view_applications", "update_application_status",
  "create_companies", "edit_companies", "create_categories", "create_skills",
  "create_team_member", "manage_permissions", "add_users", "view_users", "call_users",
  "assign_tasks", "view_tasks", "complete_tasks", "schedule_interviews", "update_interviews",
];

const PERM_GROUPS = [
  { label: "Job Management", perms: ["create_jobs", "approve_jobs", "reject_jobs", "hold_jobs", "deactivate_jobs"] },
  { label: "Applications", perms: ["view_applications", "update_application_status"] },
  { label: "Company & Content", perms: ["create_companies", "edit_companies", "create_categories", "create_skills"] },
  { label: "Team & Users", perms: ["create_team_member", "manage_permissions", "add_users", "view_users", "call_users"] },
  { label: "Tasks & Interviews", perms: ["assign_tasks", "view_tasks", "complete_tasks", "schedule_interviews", "update_interviews"] },
];

export default function AdminProfile({ userStats = {}, permissions = [] }) {
  const { auth, flash } = usePage().props;
  const currentUser = auth?.admin;

  const [editing, setEditing] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Profile Update Form Hook
  const profileForm = useForm({
    name: currentUser?.name || "",
    phone: currentUser?.phone || "",
  });

  // Password Update Form Hook
  const passwordForm = useForm({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  if (!currentUser) return null;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    profileForm.put(route("admin.profile.update", {}, false) || "#", {
      preserveScroll: true,
      onSuccess: () => setEditing(false),
      onError: () => setEditing(true),
    });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    passwordForm.put(route("admin.profile.password", {}, false) || "#", {
      preserveScroll: true,
      onSuccess: () => {
        setShowPwModal(false);
        passwordForm.reset();
      },
    });
  };

  const initials = (currentUser.name || "AD")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const userPermissions = permissions.length > 0 ? permissions : currentUser.permissions || [];

  return (
    <>
      <Head title="My Profile - WorkIndia Admin" />

      <div className="p-6 max-w-3xl mx-auto">
        {/* Flash Message Banner */}
        {flash?.success && (
          <div className="mb-5 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> {flash.success}
          </div>
        )}

        {/* Change password modal */}
        {showPwModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" /> Change Password
                </h3>
                <button
                  onClick={() => setShowPwModal(false)}
                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showOld ? "text" : "password"}
                      value={passwordForm.data.current_password}
                      onChange={(e) => passwordForm.setData("current_password", e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOld(!showOld)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                    >
                      {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordForm.errors.current_password && (
                    <p className="text-xs text-red-500 mt-1">{passwordForm.errors.current_password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={passwordForm.data.new_password}
                      onChange={(e) => passwordForm.setData("new_password", e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordForm.errors.new_password && (
                    <p className="text-xs text-red-500 mt-1">{passwordForm.errors.new_password}</p>
                  )}
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    type="button"
                    onClick={() => setShowPwModal(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordForm.processing || !passwordForm.data.current_password || !passwordForm.data.new_password}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 cursor-pointer shadow-md shadow-blue-600/30"
                  >
                    {passwordForm.processing ? "Updating..." : "Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <h1 className="text-xl font-extrabold text-gray-900 mb-6">My Profile</h1>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 shadow-xs">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shrink-0 shadow-md shadow-blue-500/20">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <form onSubmit={handleSaveProfile} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                    <input
                      value={profileForm.data.name}
                      onChange={(e) => profileForm.setData("name", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {profileForm.errors.name && (
                      <p className="text-xs text-red-500 mt-1">{profileForm.errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                    <input
                      value={profileForm.data.phone}
                      onChange={(e) => profileForm.setData("phone", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={profileForm.processing}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-60 shadow-xs"
                    >
                      {profileForm.processing ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-900">{currentUser.name}</h2>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border inline-block mt-1 ${
                          ROLE_COLORS[currentUser.role] || "bg-gray-100"
                        }`}
                      >
                        {ROLE_LABELS[currentUser.role] || currentUser.role}
                      </span>
                    </div>
                    <button
                      onClick={() => setEditing(true)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {currentUser.email}
                    </p>
                    {currentUser.phone && (
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {currentUser.phone}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Member since {currentUser.created_at ? new Date(currentUser.created_at).toLocaleDateString() : "2026"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Security */}
          <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Lock className="w-4 h-4 text-gray-400" />
              <span>Password</span>
              <span className="text-xs text-gray-400">••••••••••••</span>
            </div>
            <button
              onClick={() => setShowPwModal(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Tasks", value: userStats.tasksCount ?? 4, color: "bg-blue-50 text-blue-700", icon: "📋" },
            { label: "Applications", value: userStats.appsCount ?? 18, color: "bg-purple-50 text-purple-700", icon: "📄" },
            { label: "Interviews", value: userStats.interviewsCount ?? 6, color: "bg-amber-50 text-amber-700", icon: "📅" },
            { label: "Team Members", value: userStats.teamCount ?? 2, color: "bg-green-50 text-green-700", icon: "👥" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl p-4 ${s.color}`}>
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="text-xs font-medium opacity-80">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Permissions Display */}
        {currentUser.role !== "super_admin" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" /> My Permissions
              <span className="ml-auto text-xs text-gray-400 font-normal">
                {userPermissions.length} / {ALL_PERMISSIONS.length} total
              </span>
            </h3>
            <div className="space-y-4">
              {PERM_GROUPS.map((group) => {
                const granted = group.perms.filter((p) => userPermissions.includes(p));
                if (granted.length === 0) return null;
                return (
                  <div key={group.label}>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                      {group.label}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {granted.map((p) => (
                        <span
                          key={p}
                          className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl font-medium capitalize"
                        >
                          {p.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentUser.role === "super_admin" && (
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <UserCog className="w-5 h-5 opacity-80" />
              <h3 className="font-bold text-lg">Super Administrator</h3>
            </div>
            <p className="text-purple-200 text-sm">
              You have full access to all WorkIndia admin features. All {ALL_PERMISSIONS.length} permissions are granted by default.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// Layout wrapper
AdminProfile.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;
