import React, { useState } from "react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";
import { Head, usePage, router } from "@inertiajs/react";
import { Shield, CheckCircle2, Save, Users, Lock } from "lucide-react";

const ALL_PERMISSIONS = [
  "create_jobs", "approve_jobs", "reject_jobs", "hold_jobs", "deactivate_jobs",
  "view_applications", "update_application_status",
  "create_companies", "edit_companies", "delete_companies", "create_categories", "edit_categories", "create_skills", "edit_skills",
  "create_admin", "create_team_member", "manage_permissions", "add_users", "view_users", "call_users", "delete_user",
  "assign_tasks", "view_tasks", "complete_tasks", "schedule_interviews", "update_interviews",
];

const PERMISSION_GROUPS = [
  {
    label: "Job Management",
    icon: "💼",
    perms: ["create_jobs", "approve_jobs", "reject_jobs", "hold_jobs", "deactivate_jobs"],
  },
  {
    label: "Applications",
    icon: "📋",
    perms: ["view_applications", "update_application_status"],
  },
  {
    label: "Company & Content",
    icon: "🏢",
    perms: [
      "create_companies", "edit_companies", "delete_companies",
      "create_categories", "edit_categories", "create_skills", "edit_skills",
    ],
  },
  {
    label: "Team & Users",
    icon: "👥",
    perms: [
      "create_admin", "create_team_member", "manage_permissions",
      "add_users", "view_users", "call_users", "delete_user",
    ],
  },
  {
    label: "Tasks & Interviews",
    icon: "📅",
    perms: [
      "assign_tasks", "view_tasks", "complete_tasks",
      "schedule_interviews", "update_interviews",
    ],
  },
];

const ROLE_COLOR = {
  admin: "bg-blue-100 text-blue-700",
  team_member: "bg-green-100 text-green-700",
};

export default function Permissions({ members: propMembers = [] }) {
  const { auth, flash } = usePage().props;
  const currentUser = auth?.admin;
  const isSuperAdmin = currentUser?.role === "super_admin";

  const defaultMembers = [
    {
      id: "1",
      name: "Admin Operations",
      role: "admin",
      permissions: [
        "create_jobs", "approve_jobs", "view_applications", "update_application_status",
        "create_companies", "edit_companies", "view_users", "call_users",
        "assign_tasks", "view_tasks", "schedule_interviews", "update_interviews",
      ],
    },
    {
      id: "2",
      name: "Team Member 1",
      role: "team_member",
      permissions: [
        "view_applications", "update_application_status",
        "view_users", "call_users", "view_tasks", "complete_tasks",
        "schedule_interviews", "update_interviews",
      ],
    },
  ];

  const initialList = propMembers.length > 0 ? propMembers : defaultMembers;
  const [members, setMembers] = useState(
    initialList.filter((m) => m.role !== "super_admin")
  );
  const [selectedId, setSelectedId] = useState(members[0]?.id || "");
  const [toast, setToast] = useState(null);

  if (!isSuperAdmin) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <Lock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 font-medium">Access Denied</p>
          <p className="text-sm text-gray-400">
            Only Super Admin has permission to manage access matrices.
          </p>
        </div>
      </div>
    );
  }

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const selected = members.find((m) => String(m.id) === String(selectedId));

  const togglePerm = (perm) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (String(m.id) !== String(selectedId)) return m;
        const currentPerms = m.permissions || [];
        return {
          ...m,
          permissions: currentPerms.includes(perm)
            ? currentPerms.filter((p) => p !== perm)
            : [...currentPerms, perm],
        };
      })
    );
  };

  const grantAll = () => {
    setMembers((prev) =>
      prev.map((m) =>
        String(m.id) === String(selectedId)
          ? { ...m, permissions: [...ALL_PERMISSIONS] }
          : m
      )
    );
  };

  const revokeAll = () => {
    setMembers((prev) =>
      prev.map((m) =>
        String(m.id) === String(selectedId) ? { ...m, permissions: [] } : m
      )
    );
  };

  const savePermissions = () => {
    if (!selected) return;

    router.put(
      route("admin.permissions.update", selected.id),
      { permissions: selected.permissions },
      {
        preserveScroll: true,
        onSuccess: () => showToast("Permissions saved successfully!"),
        onError: () => showToast("Failed to update permissions"),
      }
    );
  };

  return (
    <>
      <Head title="Permission Management - WorkIndia Admin" />

      <div className="p-6">
        {(flash?.success || toast) && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> {flash?.success || toast}
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" /> Permission Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Control granular module permissions and action rights for Admin and Team Members
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Members List */}
          <div className="w-full lg:w-64 shrink-0">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">
              Staff Members
            </p>
            <div className="space-y-2">
              {members.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all border cursor-pointer ${
                    String(selectedId) === String(m.id)
                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-white border-gray-100 hover:border-blue-200 text-gray-800 shadow-xs"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      String(selectedId) === String(m.id)
                        ? "bg-blue-500 text-white"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {(m.name || "U")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        String(selectedId) === String(m.id)
                          ? "text-white"
                          : "text-gray-900"
                      }`}
                    >
                      {m.name}
                    </p>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize mt-0.5 inline-block ${
                        String(selectedId) === String(m.id)
                          ? "bg-blue-500 text-blue-100"
                          : ROLE_COLOR[m.role] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {(m.role || "staff").replace("_", " ")}
                    </span>
                  </div>
                  <p
                    className={`text-xs font-bold shrink-0 ${
                      String(selectedId) === String(m.id)
                        ? "text-blue-200"
                        : "text-gray-400"
                    }`}
                  >
                    {(m.permissions || []).length}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Permissions Matrix */}
          {selected && (
            <div className="flex-1">
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-900 text-base">{selected.name}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {(selected.role || "Staff").replace("_", " ")} ·{" "}
                      {(selected.permissions || []).length} permissions active
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={revokeAll}
                      className="px-3 py-1.5 border border-red-200 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50 cursor-pointer transition"
                    >
                      Revoke All
                    </button>
                    <button
                      type="button"
                      onClick={grantAll}
                      className="px-3 py-1.5 border border-green-200 text-green-600 rounded-xl text-xs font-semibold hover:bg-green-50 cursor-pointer transition"
                    >
                      Grant All
                    </button>
                    <button
                      type="button"
                      onClick={savePermissions}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 cursor-pointer transition"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.label}>
                      <p className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
                        <span className="text-base">{group.icon}</span>
                        {group.label}
                        <span className="text-xs text-gray-400 font-medium ml-1">
                          (
                          {
                            group.perms.filter((p) =>
                              (selected.permissions || []).includes(p)
                            ).length
                          }
                          /{group.perms.length})
                        </span>
                      </p>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {group.perms.map((perm) => {
                          const granted = (selected.permissions || []).includes(perm);
                          return (
                            <button
                              type="button"
                              key={perm}
                              onClick={() => togglePerm(perm)}
                              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all text-left cursor-pointer ${
                                granted
                                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                                  granted
                                    ? "bg-white/30"
                                    : "border-2 border-gray-300"
                                }`}
                              >
                                {granted && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                )}
                              </div>
                              <span className="text-xs leading-tight capitalize">
                                {perm.replace(/_/g, " ")}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Permissions.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;