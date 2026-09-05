import React, { useState } from "react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";
import { Head, usePage, useForm, router } from "@inertiajs/react";
import {
  Plus,
  Edit3,
  CheckCircle2,
  X,
  UserCog,
  Phone,
  Mail,
  Shield,
  Users,
  Trash2,
} from "lucide-react";

const PERMISSION_GROUPS = [
  {
    label: "Job Management",
    perms: ["create_jobs", "approve_jobs", "reject_jobs", "hold_jobs", "deactivate_jobs"],
  },
  {
    label: "Applications",
    perms: ["view_applications", "update_application_status"],
  },
  {
    label: "Company & Content",
    perms: [
      "create_companies", "edit_companies", "delete_companies",
      "create_categories", "edit_categories", "create_skills", "edit_skills",
    ],
  },
  {
    label: "Team & Users",
    perms: [
      "create_team_member", "manage_permissions",
      "add_users", "view_users", "call_users", "delete_user",
    ],
  },
  {
    label: "Tasks & Interviews",
    perms: [
      "assign_tasks", "view_tasks", "complete_tasks",
      "schedule_interviews", "update_interviews",
    ],
  },
];

const blankMember = {
  name: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  role: "team_member",
  permissions: [],
};

function MemberCard({ member, onToggle, onDelete, canEdit }) {
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
          {member.phone || "No phone listed"}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">Username: @{member.username}</span>
        <div className="flex gap-1.5">
          {canEdit && member.role !== "super_admin" && (
            <>
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
    </div>
  );
}

export default function Team({ members = [] }) {
  const { auth, flash } = usePage().props;
  const currentUser = auth?.admin;
  const isSuperAdmin = currentUser?.role === "super_admin";

  const [modalOpen, setModalOpen] = useState(false);

  const { data, setData, post, delete: destroy, processing, reset, errors, clearErrors } = useForm({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "team_member",
  });

  const openAddModal = () => {
    clearErrors();
    reset();
    setModalOpen(true);
  };

  const closeAddModal = () => {
    setModalOpen(false);
    reset();
    clearErrors();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("admin.super.staff.store"), {
      preserveScroll: true,
      onSuccess: () => closeAddModal(),
    });
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

      <div className="p-6">
        {flash?.success && (
          <div className="mb-5 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> {flash.success}
          </div>
        )}

        {/* Add Member Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100">
              <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900">Add New Team Member</h3>
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    placeholder="e.g. Rohit Sharma"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Username *</label>
                    <input
                      type="text"
                      value={data.username}
                      onChange={(e) => setData("username", e.target.value)}
                      placeholder="rohit_ats"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Role *</label>
                    <select
                      value={data.role}
                      onChange={(e) => setData("role", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="team_member">Team Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    placeholder="rohit@ats.com"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={data.phone}
                      onChange={(e) => setData("phone", e.target.value)}
                      placeholder="+91 98765..."
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Password *</label>
                    <input
                      type="password"
                      value={data.password}
                      onChange={(e) => setData("password", e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 cursor-pointer shadow-md shadow-blue-600/30"
                  >
                    {processing ? "Saving..." : "Save Member"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Team Structure</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {admins.length} admins · {teamMembers.length} team members
            </p>
          </div>
          {isSuperAdmin && (
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Member
            </button>
          )}
        </div>

        {/* Admins Section */}
        {admins.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-blue-600" /> Admins
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {admins.map((m) => (
                <MemberCard
                  key={m.id}
                  member={m}
                  onToggle={() => toggleActive(m.id)}
                  onDelete={() => deleteMember(m.id, m.name)}
                  canEdit={isSuperAdmin}
                />
              ))}
            </div>
          </div>
        )}

        {/* Team Members Section */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <UserCog className="w-3.5 h-3.5 text-emerald-600" /> Team Members
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {teamMembers.map((m) => (
              <MemberCard
                key={m.id}
                member={m}
                onToggle={() => toggleActive(m.id)}
                onDelete={() => deleteMember(m.id, m.name)}
                canEdit={isSuperAdmin}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

Team.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;