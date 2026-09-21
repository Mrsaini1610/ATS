import React, { useState } from "react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";
import { Head, usePage, router, Link } from "@inertiajs/react";
import { Shield, CheckCircle2, Users, Lock, AlertCircle } from "lucide-react";

const ALL_PERMISSIONS = [
  // Job Management
  "view_jobs", "create_jobs", "approve_jobs", "reject_jobs", "hold_jobs", "deactivate_jobs",
  // Applications
  "view_applications", "update_application_status",
  // Companies
  "view_companies", "create_companies", "edit_companies", "status_companies", "delete_companies",
  // Categories
  "view_categories", "create_categories", "edit_categories", "status_categories", "delete_categories",
  // Subcategories
  "view_subcategories", "create_subcategories", "edit_subcategories", "status_subcategories", "delete_subcategories",
  // Skills
  "view_skills", "create_skills", "edit_skills", "status_skills", "delete_skills",
  // Candidates / Users
  "view_users", "add_users", "status_users",
  // Tasks
  "view_tasks", "assign_tasks", "status_tasks",
  // Interviews
  "view_interviews", "schedule_interviews", "status_interviews",
  // Staff & Team
  "view_team_member", "create_team_member", "edit_team_member", "status_team_member", "delete_team_member",
];

const PERMISSION_GROUPS = [
  {
    label: "Job Moderation",
    icon: "💼",
    perms: [
      "view_jobs", "create_jobs", "approve_jobs", "reject_jobs", "hold_jobs", "deactivate_jobs",
    ],
  },
  {
    label: "Candidate Applications",
    icon: "📋",
    perms: ["view_applications", "update_application_status"],
  },
  {
    label: "Companies",
    icon: "🏢",
    perms: [
      "view_companies", "create_companies", "edit_companies", "status_companies", "delete_companies",
    ],
  },
  {
    label: "Categories",
    icon: "📁",
    perms: [
      "view_categories", "create_categories", "edit_categories", "status_categories", "delete_categories",
    ],
  },
  {
    label: "Subcategories",
    icon: "📂",
    hint: "Requires Category permission",
    isSubcategoryGroup: true,
    perms: [
      "view_subcategories", "create_subcategories", "edit_subcategories", "status_subcategories", "delete_subcategories",
    ],
  },
  {
    label: "Skills",
    icon: "⚡",
    perms: [
      "view_skills", "create_skills", "edit_skills", "status_skills", "delete_skills",
    ],
  },
  {
    label: "Candidates / Users",
    icon: "👤",
    perms: ["view_users", "add_users", "status_users"],
  },
  {
    label: "Tasks",
    icon: "📝",
    perms: ["view_tasks", "assign_tasks", "status_tasks"],
  },
  {
    label: "Interviews",
    icon: "📅",
    perms: ["view_interviews", "schedule_interviews", "status_interviews"],
  },
  {
    label: "Staff & Team",
    icon: "👥",
    perms: [
      "view_team_member", "create_team_member", "edit_team_member", "status_team_member", "delete_team_member",
    ],
  },
];

const PERMISSION_LABELS = {
  // Jobs
  view_jobs: "View Jobs",
  create_jobs: "Create Job Post",
  approve_jobs: "Approve Job",
  reject_jobs: "Reject Job",
  hold_jobs: "Put Job on Hold",
  deactivate_jobs: "Activate / Deactivate Job",

  // Applications
  view_applications: "View Applications",
  update_application_status: "Update Status & Offers",

  // Companies
  view_companies: "View Companies",
  create_companies: "Add Company",
  edit_companies: "Edit Company",
  status_companies: "Pause / Activate Company",
  delete_companies: "Delete Company",

  // Categories
  view_categories: "View Categories",
  create_categories: "Add Category",
  edit_categories: "Edit Category",
  status_categories: "Turn On / Off Category",
  delete_categories: "Delete Category",

  // Subcategories
  view_subcategories: "View Subcategories",
  create_subcategories: "Add Subcategory",
  edit_subcategories: "Edit Subcategory",
  status_subcategories: "Turn On / Off Subcategory",
  delete_subcategories: "Delete Subcategory",

  // Skills
  view_skills: "View Skills",
  create_skills: "Add Skill",
  edit_skills: "Edit Skill",
  status_skills: "Activate / Deactivate Skill",
  delete_skills: "Delete Skill",

  // Users
  view_users: "View Registered Users",
  add_users: "Add New User",
  status_users: "Activate / Deactivate User",

  // Tasks
  view_tasks: "View Tasks",
  assign_tasks: "Assign New Task",
  status_tasks: "Update Task Status",

  // Interviews
  view_interviews: "View Interviews",
  schedule_interviews: "Schedule Interview",
  status_interviews: "Update Status & Remarks",

  // Team
  view_team_member: "View Team Members",
  create_team_member: "Add Team Member",
  edit_team_member: "Edit Team Member",
  status_team_member: "Activate / Deactivate Member",
  delete_team_member: "Delete Member",
};

const ROLE_COLOR = {
  admin: "bg-blue-100 text-blue-700",
  team_member: "bg-green-100 text-green-700",
};

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

export default function Permissions({ members: propMembers = [] }) {
  const { auth } = usePage().props;
  const currentUser = auth?.admin;
  const isSuperAdmin = currentUser?.role === "super_admin";

  const initialList = propMembers;
  const [members, setMembers] = useState(
    Array.isArray(initialList) ? initialList.filter((m) => m.role !== "super_admin") : []
  );
  const [selectedId, setSelectedId] = useState(members[0]?.id || "");

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

  const selected = members.find((m) => String(m.id) === String(selectedId));

  const savePermissions = (permissions) => {
    if (!selected) return;

    setMembers((prev) =>
      prev.map((member) =>
        String(member.id) === String(selectedId) ? { ...member, permissions } : member
      )
    );

    router.put(
      route("admin.permissions.update", selected.id),
      { permissions },
      { preserveScroll: true, preserveState: true }
    );
  };

  const togglePerm = (perm) => {
    if (!selected) return;

    const currentPerms = selected.permissions || [];
    const isGranted = currentPerms.includes(perm);

    // Constraint: Cannot grant subcategory permissions without category permission
    if (!isGranted && SUBCATEGORY_PERMISSIONS.includes(perm) && !currentPerms.includes("view_categories")) {
      return;
    }

    let updatedPerms;

    if (isGranted) {
      // Revoke clicked permission
      updatedPerms = currentPerms.filter((p) => p !== perm);

      // If revoking view permission, automatically revoke all dependent action permissions
      const dependentActions = ACTIONS_BY_VIEW_PERMISSION[perm] || [];
      if (dependentActions.length > 0) {
        updatedPerms = updatedPerms.filter((p) => !dependentActions.includes(p));
      }

      // If revoking category view permission, automatically revoke all subcategory permissions
      if (perm === "view_categories") {
        updatedPerms = updatedPerms.filter((p) => !SUBCATEGORY_PERMISSIONS.includes(p));
      }
    } else {
      // Grant clicked permission
      updatedPerms = [...currentPerms, perm];

      // Auto-select corresponding view permission if selecting an action
      const viewPermission = VIEW_PERMISSION_BY_ACTION[perm];
      if (viewPermission && !updatedPerms.includes(viewPermission)) {
        updatedPerms.push(viewPermission);
      }

      // If selecting a subcategory action, ensure view_subcategories is also active
      if (SUBCATEGORY_PERMISSIONS.includes(perm) && !updatedPerms.includes("view_subcategories")) {
        updatedPerms.push("view_subcategories");
      }
    }

    savePermissions(Array.from(new Set(updatedPerms)));
  };

  const grantAll = () => {
    savePermissions([...ALL_PERMISSIONS]);
  };

  const revokeAll = () => {
    savePermissions([]);
  };

  const hasCategoryView = (selected?.permissions || []).includes("view_categories");

  return (
    <>
      <Head title="Permission Management - WorkIndia Admin" />

      <div className="p-3.5 sm:p-5 lg:p-6 pb-25">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2 tracking-tight">
            <Shield className="w-5 h-5 text-blue-600 shrink-0" /> <span>Permission Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Control granular module permissions and action rights for Admin and Team Members
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Members List */}
          <div className="w-full lg:w-72 shrink-0">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">
              Staff Members ({members.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {members.length === 0 && (
                <div className="col-span-full bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-xs">
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-700">No staff members found</p>
                  <p className="text-xs text-gray-400 mt-1">Create an Admin or Team Member first.</p>
                  <Link
                    href="/admin/team"
                    className="inline-flex mt-3 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
                  >
                    Open Team Management
                  </Link>
                </div>
              )}
              {members.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`w-full flex items-center gap-3 px-3.5 sm:px-4 py-3 rounded-2xl text-left transition-all border cursor-pointer ${
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
            <div className="w-full flex-1 min-w-0">
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900 text-base">{selected.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500 capitalize">
                      {(selected.role || "Staff").replace("_", " ")} ·{" "}
                      {(selected.permissions || []).length} permissions active
                    </p>
                  </div>
                  <div className="flex gap-2 self-start sm:self-auto">
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
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  {PERMISSION_GROUPS.map((group) => {
                    const isGroupBlocked = group.isSubcategoryGroup && !hasCategoryView;

                    return (
                      <div key={group.label} className={isGroupBlocked ? "opacity-60 transition" : ""}>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
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

                          {group.hint && !hasCategoryView && (
                            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" /> {group.hint}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                          {group.perms.map((perm) => {
                            const granted = (selected.permissions || []).includes(perm);
                            const isSubcategoryPerm = SUBCATEGORY_PERMISSIONS.includes(perm);
                            const isBlocked = isSubcategoryPerm && !hasCategoryView;

                            return (
                              <button
                                type="button"
                                key={perm}
                                disabled={isBlocked}
                                onClick={() => togglePerm(perm)}
                                title={isBlocked ? "Requires Category permission first" : undefined}
                                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all text-left ${
                                  isBlocked
                                    ? "bg-gray-50/70 border-dashed border-gray-200 text-gray-400 cursor-not-allowed"
                                    : granted
                                    ? "bg-blue-600 text-white border-blue-600 shadow-xs cursor-pointer"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 cursor-pointer"
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                                    isBlocked
                                      ? "border-2 border-gray-200 bg-gray-100"
                                      : granted
                                      ? "bg-white/30"
                                      : "border-2 border-gray-300"
                                  }`}
                                >
                                  {granted && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-xs font-semibold leading-tight block truncate">
                                    {PERMISSION_LABELS[perm] || perm.replace(/_/g, " ")}
                                  </span>
                                  {isBlocked && (
                                    <span className="text-[10px] text-gray-400 block leading-none mt-0.5">
                                      Needs Category view
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
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
