import React, { useState } from "react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";
import { Head, usePage, useForm, router } from "@inertiajs/react";
import {
  Plus,
  Edit3,
  X,
  UserCog,
  Phone,
  Mail,
  Shield,
  Users,
  Trash2,
  AlertCircle,
} from "lucide-react";

const PERMISSION_GROUPS = [
  {
    label: "Job Moderation",
    perms: ["view_jobs", "create_jobs", "approve_jobs", "reject_jobs", "hold_jobs", "deactivate_jobs"],
  },
  {
    label: "Candidate Applications",
    perms: ["view_applications", "update_application_status"],
  },
  {
    label: "Companies",
    perms: ["view_companies", "create_companies", "edit_companies", "status_companies", "delete_companies"],
  },
  {
    label: "Categories",
    perms: ["view_categories", "create_categories", "edit_categories", "status_categories", "delete_categories"],
  },
  {
    label: "Subcategories",
    isSubcategoryGroup: true,
    perms: ["view_subcategories", "create_subcategories", "edit_subcategories", "status_subcategories", "delete_subcategories"],
  },
  {
    label: "Skills",
    perms: ["view_skills", "create_skills", "edit_skills", "status_skills", "delete_skills"],
  },
  {
    label: "Candidates / Users",
    perms: ["view_users", "add_users", "status_users"],
  },
  {
    label: "Tasks",
    perms: ["view_tasks", "assign_tasks", "status_tasks"],
  },
  {
    label: "Interviews",
    perms: ["view_interviews", "schedule_interviews", "status_interviews"],
  },
  {
    label: "Staff & Team",
    perms: ["view_team_member", "create_team_member", "edit_team_member", "status_team_member", "delete_team_member"],
  },
];

const VIEW_PERMISSION_BY_ACTION = {
  create_jobs: "view_jobs",
  approve_jobs: "view_jobs",
  reject_jobs: "view_jobs",
  hold_jobs: "view_jobs",
  deactivate_jobs: "view_jobs",
  update_application_status: "view_applications",
  create_companies: "view_companies",
  edit_companies: "view_companies",
  status_companies: "view_companies",
  delete_companies: "view_companies",
  create_categories: "view_categories",
  edit_categories: "view_categories",
  status_categories: "view_categories",
  delete_categories: "view_categories",
  create_subcategories: "view_subcategories",
  edit_subcategories: "view_subcategories",
  status_subcategories: "view_subcategories",
  delete_subcategories: "view_subcategories",
  create_skills: "view_skills",
  edit_skills: "view_skills",
  status_skills: "view_skills",
  delete_skills: "view_skills",
  add_users: "view_users",
  status_users: "view_users",
  assign_tasks: "view_tasks",
  status_tasks: "view_tasks",
  schedule_interviews: "view_interviews",
  status_interviews: "view_interviews",
  create_team_member: "view_team_member",
  edit_team_member: "view_team_member",
  status_team_member: "view_team_member",
  delete_team_member: "view_team_member",
};

const SUBCATEGORY_PERMISSIONS = [
  "view_subcategories",
  "create_subcategories",
  "edit_subcategories",
  "status_subcategories",
  "delete_subcategories",
];

const ACTIONS_BY_VIEW_PERMISSION = Object.entries(VIEW_PERMISSION_BY_ACTION).reduce(
  (groups, [action, view]) => ({
    ...groups,
    [view]: [...(groups[view] || []), action],
  }),
  {}
);

function MemberCard({ member, onEdit, onToggle, onDelete, canEdit }) {
  const [showPerms, setShowPerms] = useState(false);
  const ROLE_COLOR = {
    super_admin: "bg-purple-100 text-purple-700",
    admin: "bg-blue-100 text-blue-700",
    team_member: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div
      className={`bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow shadow-xs ${
        !member.active ? "opacity-70 bg-gray-50/50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">
            {(member.name || "U")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{member.name}</p>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize ${
                ROLE_COLOR[member.role] || "bg-gray-100"
              }`}
            >
              {(member.role || "staff").replace("_", " ")}
            </span>
          </div>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
            member.active
              ? "bg-green-50 text-green-600"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {member.active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="space-y-1 text-xs text-gray-500 mb-3">
        <p className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-gray-400" />
          {member.email}
        </p>
        <p className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-gray-400" />
          {member.phone ? `+91 ${member.phone}` : "No phone listed"}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={() => setShowPerms(!showPerms)}
          className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
        >
          <Shield className="w-3 h-3" />
          {(member.permissions || []).length} permissions
        </button>
        <div className="flex gap-1.5">
          {canEdit && member.role !== "super_admin" && (
            <>
              <button
                type="button"
                onClick={onEdit}
                className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition"
                title="Edit Member"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onToggle}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium cursor-pointer transition ${
                  member.active
                    ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                    : "bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                {member.active ? "Suspend" : "Activate"}
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                title="Delete Member"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {showPerms && member.permissions && member.permissions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-1.5">
            {member.permissions.map((p) => (
              <span key={p} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">
                {p.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Team({ members = [] }) {
  const { auth } = usePage().props;
  const currentUser = auth?.admin;
  const isSuperAdmin = currentUser?.role === "super_admin";

  const [modal, setModal] = useState(null);

  const { data, setData, post, put, processing, reset, errors, clearErrors, setError } = useForm({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    permissions: [],
    force_action: "", // Restore conflict handle ke liye
  });

  const validateEmail = (emailStr) => {
    const val = (emailStr || "").trim();
    if (!val) {
      return "Email address is required.";
    }
    if (/\s/.test(val)) {
      return "Email address cannot contain spaces.";
    }
    if (!val.includes("@")) {
      return "Email must contain an '@' symbol (e.g. name@example.com).";
    }
    const parts = val.split("@");
    if (parts.length !== 2) {
      return "Email address can only have one '@' symbol.";
    }
    const [localPart, domainPart] = parts;
    if (!localPart) {
      return "Please enter the username part before '@'.";
    }
    if (!domainPart) {
      return "Please enter the domain after '@' (e.g. example.com).";
    }
    if (!domainPart.includes(".")) {
      return "Domain must have a dot and extension (e.g. .com, .in).";
    }
    const domainParts = domainPart.split(".");
    const tld = domainParts[domainParts.length - 1];
    if (!tld || tld.length < 2) {
      return "Domain extension must be at least 2 characters (e.g. .com, .in).";
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(val)) {
      return "Please enter a valid email address (e.g. name@example.com).";
    }
    return null;
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setData("email", val);
    const err = validateEmail(val);
    if (err) {
      setError("email", err);
    } else {
      clearErrors("email");
    }
  };

  const handleEmailBlur = (e) => {
    const err = validateEmail(e.target.value);
    if (err) {
      setError("email", err);
    } else {
      clearErrors("email");
    }
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setData("phone", val);
    if (val && val.length < 10) {
      setError("phone", `Phone number must be 10 digits (${val.length}/10).`);
    } else {
      clearErrors("phone");
    }
  };

  const openAddModal = () => {
    clearErrors();
    reset({
      name: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      role: "",
      permissions: [],
      force_action: "",
    });
    setModal({ mode: "add" });
  };

  const openEditModal = (member) => {
    clearErrors();
    setData({
      name: member.name || "",
      username: member.username || "",
      email: member.email || "",
      phone: member.phone === "—" ? "" : member.phone || "",
      password: "",
      role: member.role || "",
      permissions: member.permissions || [],
      force_action: "",
    });
    setModal({ mode: "edit", data: member });
  };

  const closeModal = () => {
    setModal(null);
    reset();
    clearErrors();
  };

  const togglePerm = (perm) => {
    const current = data.permissions || [];
    const isGranted = current.includes(perm);

    if (!isGranted && SUBCATEGORY_PERMISSIONS.includes(perm) && !current.includes("view_categories")) {
      return;
    }

    let updated;
    if (isGranted) {
      updated = current.filter((p) => p !== perm);
      const dependentActions = ACTIONS_BY_VIEW_PERMISSION[perm] || [];
      if (dependentActions.length > 0) {
        updated = updated.filter((p) => !dependentActions.includes(p));
      }
      if (perm === "view_categories") {
        updated = updated.filter((p) => !SUBCATEGORY_PERMISSIONS.includes(p));
      }
    } else {
      updated = [...current, perm];
      const viewPermission = VIEW_PERMISSION_BY_ACTION[perm];
      if (viewPermission && !updated.includes(viewPermission)) {
        updated.push(viewPermission);
      }
      if (SUBCATEGORY_PERMISSIONS.includes(perm) && !updated.includes("view_subcategories")) {
        updated.push("view_subcategories");
      }
    }

    setData("permissions", Array.from(new Set(updated)));
  };

  const handleSubmit = (e, forceAction = null) => {
    if (e) e.preventDefault();
    clearErrors();

    let hasErr = false;

    if (!data.name.trim()) {
      setError("name", "Full name is required.");
      hasErr = true;
    }

    const emailErr = validateEmail(data.email);
    if (emailErr) {
      setError("email", emailErr);
      hasErr = true;
    }

    if (!data.role) {
      setError("role", "Please select a role.");
      hasErr = true;
    }

    if (!data.username.trim()) {
      setError("username", "Username is required.");
      hasErr = true;
    }

    if (modal.mode === "add" && !data.password) {
      setError("password", "Password is required.");
      hasErr = true;
    } else if (data.password && data.password.length < 6) {
      setError("password", "Password must be at least 6 characters.");
      hasErr = true;
    }

    if (data.phone && data.phone.length !== 10) {
      setError("phone", "Phone number must be exactly 10 digits.");
      hasErr = true;
    }

    if (hasErr) return;

    let submissionData = data;
    if (forceAction) {
      submissionData = { ...data, force_action: forceAction };
    }

    if (modal.mode === "add") {
      router.post(route("admin.super.staff.store"), submissionData, {
        preserveScroll: true,
        onSuccess: (page) => {
          // Check agar backend se duplicate soft-deleted confirmation maangi gayi hai
          if (page.props.flash?.trashed_conflict) {
            const conflictData = page.props.flash.trashed_conflict;
            if (
              confirm(
                `A deleted member with email "${conflictData.email}" or username already exists. Do you want to restore/activate them instead? (Click OK to Restore, Cancel to Overwrite & Create New)`
              )
            ) {
              handleSubmit(null, "restore");
            } else {
              handleSubmit(null, "force_new");
            }
          } else {
            closeModal();
          }
        },
      });
    } else {
      put(route("admin.super.staff.update", modal.data.id), {
        preserveScroll: true,
        onSuccess: () => closeModal(),
      });
    }
  };

  const toggleActive = (id) => {
    router.post(route("admin.super.staff.toggle-status", id), {}, { preserveScroll: true });
  };

  const deleteMember = (id, name) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      router.delete(route("admin.super.staff.destroy", id), { preserveScroll: true });
    }
  };

  const admins = members.filter((m) => m.role === "admin" || m.role === "super_admin");
  const teamMembers = members.filter((m) => m.role === "team_member");

  return (
    <>
      <Head title="Team & Staff Management - ATS Admin" />

      <div className="p-3.5 sm:p-5 lg:p-6">
        {/* Member Modal (Add / Edit) */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 sm:px-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900">
                  {modal.mode === "add" ? "Add Team Member" : "Edit Team Member"}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={(e) => handleSubmit(e)} className="space-y-4" autoComplete="off">
                {/* Hidden dummy inputs to prevent aggressive browser autofill of admin credentials */}
                <input
                  type="text"
                  name="fake_user_prevent_autofill"
                  className="hidden"
                  tabIndex="-1"
                  aria-hidden="true"
                  autoComplete="off"
                />
                <input
                  type="password"
                  name="fake_pass_prevent_autofill"
                  className="hidden"
                  tabIndex="-1"
                  aria-hidden="true"
                  autoComplete="new-password"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Full Name * (Alphabets only)
                    </label>
                    <input
                      type="text"
                      name="staff_name"
                      autoComplete="off"
                      value={data.name}
                      onChange={(e) => {
                        // Sirf alphabets aur spaces allow karega
                        const val = e.target.value.replace(/[^A-Za-z\s]/g, "");
                        setData("name", val);
                        if (val.trim()) clearErrors("name");
                      }}
                      placeholder="e.g. Rohit Sharma"
                      className={`w-full px-3 py-2.5 border rounded-xl text-sm outline-none transition focus:ring-2 ${
                        errors.name
                          ? "border-red-500 focus:ring-red-400 bg-red-50/20"
                          : "border-gray-200 focus:ring-blue-500"
                      }`}
                      autoFocus
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="staff_member_email"
                      autoComplete="off"
                      value={data.email}
                      onChange={handleEmailChange}
                      onBlur={handleEmailBlur}
                      placeholder="rohit@workindia.in"
                      className={`w-full px-3 py-2.5 border rounded-xl text-sm outline-none transition focus:ring-2 ${
                        errors.email
                          ? "border-red-500 focus:ring-red-400 bg-red-50/20"
                          : "border-gray-200 focus:ring-blue-500"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Phone (10 digits only)
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      name="staff_member_phone"
                      autoComplete="off"
                      value={data.phone}
                      onChange={handlePhoneChange}
                      onKeyDown={(e) => {
                        if (
                          !/[0-9]/.test(e.key) &&
                          !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Enter"].includes(e.key) &&
                          !e.ctrlKey &&
                          !e.metaKey
                        ) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="9123456789"
                      className={`w-full px-3 py-2.5 border rounded-xl text-sm outline-none transition focus:ring-2 ${
                        errors.phone
                          ? "border-red-500 focus:ring-red-400 bg-red-50/20"
                          : "border-gray-200 focus:ring-blue-500"
                      }`}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1 font-medium">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Role *
                    </label>
                    <select
                      value={data.role}
                      onChange={(e) => {
                        const val = e.target.value;
                        setData("role", val);
                        if (val) {
                          clearErrors("role");
                        } else {
                          setError("role", "Please select a role.");
                        }
                      }}
                      className={`w-full px-3 py-2.5 border rounded-xl text-sm bg-white outline-none transition focus:ring-2 ${
                        errors.role
                          ? "border-red-500 focus:ring-red-400 bg-red-50/20"
                          : "border-gray-200 focus:ring-blue-500"
                      }`}
                    >
                      <option value="">Select Role</option>
                      <option value="team_member">Team Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    {errors.role && <p className="text-xs text-red-500 mt-1 font-medium">{errors.role}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Username * (All characters allowed)
                    </label>
                    <input
                      type="text"
                      name="staff_member_username"
                      autoComplete="off"
                      value={data.username}
                      onChange={(e) => {
                        setData("username", e.target.value);
                        if (e.target.value.trim()) clearErrors("username");
                      }}
                      placeholder="rohit_ats123"
                      className={`w-full px-3 py-2.5 border rounded-xl text-sm outline-none transition focus:ring-2 ${
                        errors.username
                          ? "border-red-500 focus:ring-red-400 bg-red-50/20"
                          : "border-gray-200 focus:ring-blue-500"
                      }`}
                    />
                    {errors.username && <p className="text-xs text-red-500 mt-1 font-medium">{errors.username}</p>}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Password {modal.mode === "edit" ? "(Leave blank to keep current)" : "*"}
                    </label>
                    <input
                      type="password"
                      name="staff_member_password"
                      autoComplete="new-password"
                      value={data.password}
                      onChange={(e) => {
                        setData("password", e.target.value);
                        if (e.target.value) clearErrors("password");
                      }}
                      placeholder={modal.mode === "edit" ? "Leave blank to keep current" : "••••••••"}
                      className={`w-full px-3 py-2.5 border rounded-xl text-sm outline-none transition focus:ring-2 ${
                        errors.password
                          ? "border-red-500 focus:ring-red-400 bg-red-50/20"
                          : "border-gray-200 focus:ring-blue-500"
                      }`}
                    />
                    {errors.password && <p className="text-xs text-red-500 mt-1 font-medium">{errors.password}</p>}
                  </div>
                </div>

                {/* Permissions Section */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" /> ASSIGN PERMISSIONS
                  </p>
                  <div className="space-y-4">
                    {PERMISSION_GROUPS.map((group) => {
                      const hasCategoryView = (data.permissions || []).includes("view_categories");
                      const isGroupBlocked = group.isSubcategoryGroup && !hasCategoryView;

                      return (
                        <div key={group.label}>
                          <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center justify-between">
                            <span>{group.label}</span>
                            {isGroupBlocked && (
                              <span className="text-[10px] text-amber-600 font-medium">Requires Category view</span>
                            )}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {group.perms.map((perm) => {
                              const checked = (data.permissions || []).includes(perm);
                              const isBlocked = SUBCATEGORY_PERMISSIONS.includes(perm) && !hasCategoryView;

                              return (
                                <button
                                  key={perm}
                                  type="button"
                                  disabled={isBlocked}
                                  onClick={() => togglePerm(perm)}
                                  className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-all ${
                                    isBlocked
                                      ? "bg-gray-50 border-dashed border-gray-200 text-gray-400 cursor-not-allowed"
                                      : checked
                                      ? "bg-blue-600 text-white border-blue-600 shadow-xs cursor-pointer"
                                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 cursor-pointer"
                                  }`}
                                >
                                  {perm.replace(/_/g, " ")}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 mt-5 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 cursor-pointer shadow-md shadow-blue-200 transition"
                  >
                    {processing ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Team</h1>
            <p className="text-sm text-gray-500">
              {admins.length} admins · {teamMembers.length} team members
            </p>
          </div>
          {isSuperAdmin && (
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-200 cursor-pointer transition shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Member
            </button>
          )}
        </div>

        {/* Admins Section */}
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Users className="w-3.5 h-3.5" /> ADMINS
          </p>
          {admins.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400 text-xs font-medium shadow-xs">
              No admins found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {admins.map((m) => (
                <MemberCard
                  key={m.id}
                  member={m}
                  onEdit={() => openEditModal(m)}
                  onToggle={() => toggleActive(m.id)}
                  onDelete={() => deleteMember(m.id, m.name)}
                  canEdit={isSuperAdmin}
                />
              ))}
            </div>
          )}
        </div>

        {/* Team Members Section */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <UserCog className="w-3.5 h-3.5" /> TEAM MEMBERS
          </p>
          {teamMembers.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400 text-xs font-medium shadow-xs">
              No team members found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {teamMembers.map((m) => (
                <MemberCard
                  key={m.id}
                  member={m}
                  onEdit={() => openEditModal(m)}
                  onToggle={() => toggleActive(m.id)}
                  onDelete={() => deleteMember(m.id, m.name)}
                  canEdit={isSuperAdmin}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Team.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;
