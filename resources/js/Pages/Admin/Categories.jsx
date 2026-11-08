import React, { useState } from "react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";
import { Head, usePage, useForm, router } from "@inertiajs/react";
import {
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronRight,
  Tags,
  Search,
  Layers,
  FolderTree,
  Briefcase,
  Check,
  Sparkles,
} from "lucide-react";
import { updateAdminField } from "@/Components/Admin/liveValidation";

const ICONS = [
  "💻", "💰", "📣", "🎨", "👥", "⚙️", "📊", "🏥",
  "🏦", "🚚", "📚", "🔬", "🏗️", "🎯", "📱", "📁"
];

export default function Categories({ categories = [] }) {
  const { auth, flash } = usePage().props;
  const admin = auth?.admin;
  const canManage = admin?.role === "super_admin" || admin?.role === "admin";
  const permissions = admin?.permissions || [];
  const can = (permission) => admin?.role === "super_admin" || permissions.includes(permission);
  const canViewSubcategories = can("view_subcategories");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive
  const [expandedId, setExpandedId] = useState(null);
  const [modal, setModal] = useState(null); // { mode: 'cat' | 'sub', action: 'add' | 'edit', parentUuid?: string, uuid?: string }
  const [deleteModal, setDeleteModal] = useState(null); // { type: 'category' | 'subcategory', uuid: string, catUuid?: string, subUuid?: string, name?: string }

  const { data, setData, post, put, processing, reset, errors, clearErrors, setError } = useForm({
    name: "",
    icon: "📁",
    parent_uuid: "",
    status: "active",
  });

  const openAddCategoryModal = () => {
    clearErrors();
    reset();
    setData({ name: "", icon: "📁", parent_uuid: "", status: "active" });
    setModal({ mode: "cat", action: "add" });
  };

  const openEditCategoryModal = (cat) => {
    clearErrors();
    setData({
      name: cat.name || "",
      icon: cat.icon || "📁",
      parent_uuid: "",
      status: cat.status || "active",
    });
    setModal({ mode: "cat", action: "edit", uuid: cat.uuid });
  };

  const openAddSubcategoryModal = (parentUuid) => {
    clearErrors();
    reset();
    setData({ name: "", icon: "", parent_uuid: parentUuid, status: "active" });
    setModal({ mode: "sub", action: "add", parentUuid });
  };

  const openEditSubcategoryModal = (parentUuid, sub) => {
    clearErrors();
    setData({ name: sub.name || "", icon: "", parent_uuid: parentUuid, status: "active" });
    setModal({ mode: "sub", action: "edit", parentUuid, uuid: sub.uuid });
  };

  const closeModal = () => {
    setModal(null);
    reset();
    clearErrors();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (modal.mode === "cat") {
      if (modal.action === "add") {
        post(route("admin.categories.store"), {
          preserveScroll: true,
          onSuccess: () => closeModal(),
        });
      } else {
        put(route("admin.categories.update", modal.uuid), {
          preserveScroll: true,
          onSuccess: () => closeModal(),
        });
      }
    } else {
      const submit = modal.action === "edit" ? put : post;
      const endpoint = modal.action === "edit"
        ? route("admin.categories.subcategories.update", [modal.parentUuid, modal.uuid])
        : route("admin.categories.subcategories.store", modal.parentUuid);
      submit(endpoint, {
        preserveScroll: true,
        onSuccess: () => {
          setExpandedId(modal.parentUuid);
          closeModal();
        },
      });
    }
  };

  const handleToggleStatus = (uuid) => {
    router.post(route("admin.categories.toggle-status", uuid), {}, {
      preserveScroll: true,
    });
  };

  const handleToggleSubcategoryStatus = (catUuid, subUuid) => {
    router.post(route("admin.categories.subcategories.toggle-status", [catUuid, subUuid]), {}, {
      preserveScroll: true,
    });
  };

  const handleDeleteCategory = (cat) => {
    const uuid = typeof cat === "object" ? cat.uuid : cat;
    const name = typeof cat === "object" ? cat.name : "";
    setDeleteModal({ type: "category", uuid, name });
  };

  const handleDeleteSubcategory = (catUuid, sub) => {
    const subUuid = typeof sub === "object" ? sub.uuid : sub;
    const name = typeof sub === "object" ? sub.name : "";
    setDeleteModal({ type: "subcategory", catUuid, subUuid, name });
  };

  const confirmDeleteCategory = () => {
    if (!deleteModal) return;
    if (deleteModal.type === "category") {
      router.delete(route("admin.categories.destroy", deleteModal.uuid), {
        preserveScroll: true,
        onSuccess: () => setDeleteModal(null),
      });
    } else {
      router.delete(route("admin.categories.subcategories.destroy", [deleteModal.catUuid, deleteModal.subUuid]), {
        preserveScroll: true,
        onSuccess: () => setDeleteModal(null),
      });
    }
  };

  const filtered = categories.filter((cat) => {
    const term = search.toLowerCase();
    const nameMatch = (cat.name || "").toLowerCase().includes(term);
    const subMatch = (cat.subcategories || []).some((sub) =>
      (sub.name || "").toLowerCase().includes(term)
    );
    const matchesSearch = !term || nameMatch || subMatch;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && cat.status === "active") ||
      (statusFilter === "inactive" && cat.status !== "active");

    return matchesSearch && matchesStatus;
  });

  const totalSubcategories = categories.reduce(
    (acc, cat) => acc + (cat.subcategories?.length || 0),
    0
  );
  const totalJobs = categories.reduce(
    (acc, cat) => acc + (cat.job_count || 0),
    0
  );
  const activeCategoriesCount = categories.filter((c) => c.status === "active").length;

  return (
    <>
      <Head title="Job Categories - ATS Admin" />

      <div className="p-3.5 sm:p-5 lg:p-6">
        {/* Flash Message */}
        {flash?.success && (
          <div className="mb-5 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> {flash.success}
          </div>
        )}

        {/* Modal: Add/Edit Category or Subcategory */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 sm:px-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-sm shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Tags className="w-4 h-4 text-blue-600" />
                  {modal.mode === "cat"
                    ? modal.action === "add"
                      ? "Add Category"
                      : "Edit Category"
                    : modal.action === "edit"
                      ? "Edit Subcategory"
                      : "Add Subcategory"}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {modal.mode === "cat" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Icon (Emoji)
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 border border-gray-100 rounded-xl bg-gray-50/50">
                      {ICONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setData("icon", emoji)}
                          className={`text-lg w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${
                            data.icon === emoji
                              ? "bg-blue-100 ring-2 ring-blue-500 scale-105"
                              : "bg-white hover:bg-gray-200"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {modal.mode === "cat" ? "Category Name *" : "Subcategory Name *"}
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => updateAdminField(setData, setError, clearErrors, "name", e.target.value, data)}
                    placeholder={
                      modal.mode === "cat"
                        ? "e.g. IT & Software"
                        : "e.g. Frontend Development"
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                {modal.mode === "cat" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Status
                    </label>
                    <select
                      value={data.status}
                      onChange={(e) => setData("status", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 cursor-pointer shadow-md shadow-blue-600/30"
                  >
                    {processing ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Category Confirm Modal */}
        {deleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">
                Delete {deleteModal.type === "category" ? "Category" : "Subcategory"}?
              </h3>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                Are you sure you want to delete {deleteModal.name ? `"${deleteModal.name}"` : `this ${deleteModal.type}`}?
                {deleteModal.type === "category" ? " All its subcategories will also be deleted." : ""}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteModal(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteCategory}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold cursor-pointer shadow-md shadow-red-600/30"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/25 shrink-0">
              <FolderTree className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Category & Hierarchy Management
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Organize industry job domains, subcategories, and active role mappings.
              </p>
            </div>
          </div>

          {can("create_categories") && (
            <button
              type="button"
              onClick={openAddCategoryModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/30 transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Add New Category
            </button>
          )}
        </div>

        {/* Top Summary Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Categories</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Tags className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{categories.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Top-level industries</p>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Subcategories</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{totalSubcategories}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Specialized sub-tracks</p>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Jobs Linked</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{totalJobs.toLocaleString()}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Live role mappings</p>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Active Status</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
                <Check className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{activeCategoriesCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Enabled for candidates</p>
          </div>
        </div>

        {/* Search Bar & Filter Tabs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category or subcategory name..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto shrink-0 shadow-2xs">
            {[
              { id: "all", label: "All", count: categories.length },
              { id: "active", label: "Active", count: activeCategoriesCount },
              { id: "inactive", label: "Inactive", count: categories.length - activeCategoriesCount },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                  statusFilter === tab.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Category List */}
        <div className="space-y-3.5">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 py-16 text-center text-slate-400 shadow-sm">
              <FolderTree className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-slate-700 text-sm">No matching categories found</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing your search query or add a new category.</p>
            </div>
          ) : (
            filtered.map((cat) => {
              const isExpanded = expandedId === cat.uuid;
              const subCount = cat.subcategories?.length || 0;
              const isActive = cat.status === "active";

              return (
                <div
                  key={cat.uuid}
                  className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 shadow-xs ${
                    isExpanded ? "border-blue-300 ring-2 ring-blue-500/10" : "border-slate-200/90 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : cat.uuid)}
                      className="flex items-center gap-3.5 flex-1 min-w-0 text-left cursor-pointer group"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 flex items-center justify-center text-2xl select-none shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                        {cat.icon || "📁"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-slate-900 text-base truncate group-hover:text-blue-600 transition-colors">
                            {cat.name}
                          </p>
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="font-bold text-slate-700">
                            {(cat.job_count ?? 0).toLocaleString()} jobs
                          </span>
                          <span>•</span>
                          <span>{subCount} subcategories</span>
                        </div>
                      </div>
                      <div className="p-1 rounded-lg text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </div>
                    </button>

                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {(can("create_subcategories") || can("edit_categories") || can("status_categories") || can("delete_categories")) && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {can("create_subcategories") && (
                            <button
                              type="button"
                              onClick={() => openAddSubcategoryModal(cat.uuid)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl cursor-pointer transition shadow-2xs"
                              title="Add subcategory to this category"
                            >
                              <Plus className="w-3.5 h-3.5" /> Sub
                            </button>
                          )}
                          {can("edit_categories") && (
                            <button
                              type="button"
                              onClick={() => openEditCategoryModal(cat)}
                              className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl cursor-pointer transition shadow-2xs"
                              title="Edit Category Name & Icon"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {can("status_categories") && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(cat.uuid)}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs border ${
                                isActive
                                  ? "text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200"
                                  : "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                              }`}
                            >
                              {isActive ? "Turn Off" : "Turn On"}
                            </button>
                          )}
                          {can("delete_categories") && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-1.5 text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl cursor-pointer transition shadow-2xs"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subcategories Accordion with Modern Cards / Grid */}
                  {isExpanded && canViewSubcategories && (
                    <div className="border-t border-slate-200/80 bg-slate-50/70 p-4 sm:p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-600" />
                          Subcategories inside {cat.name} ({subCount})
                        </span>
                        {can("create_subcategories") && (
                          <button
                            type="button"
                            onClick={() => openAddSubcategoryModal(cat.uuid)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Subcategory
                          </button>
                        )}
                      </div>

                      {subCount > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {cat.subcategories.map((sub) => {
                            const isSubActive = (sub.status ?? "active") === "active";
                            return (
                              <div
                                key={sub.uuid}
                                className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2 shadow-2xs hover:border-blue-200 transition"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`w-2 h-2 rounded-full shrink-0 ${
                                        isSubActive ? "bg-emerald-500" : "bg-slate-300"
                                      }`}
                                    />
                                    <p className="text-xs font-bold text-slate-900 truncate">
                                      {sub.name}
                                    </p>
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-0.5 ml-4">
                                    {sub.job_count ?? 0} active jobs
                                  </p>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {can("status_subcategories") && (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleSubcategoryStatus(cat.uuid, sub.uuid)}
                                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                                        isSubActive
                                          ? "text-slate-600 bg-slate-100 hover:bg-slate-200"
                                          : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                                      }`}
                                    >
                                      {isSubActive ? "Active" : "Off"}
                                    </button>
                                  )}
                                  {can("edit_subcategories") && (
                                    <button
                                      type="button"
                                      onClick={() => openEditSubcategoryModal(cat.uuid, sub)}
                                      className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition"
                                      title="Edit"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  )}
                                  {can("delete_subcategories") && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSubcategory(cat.uuid, sub)}
                                      className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                          No subcategories under {cat.name} yet. Click "+ Add Subcategory" to create one.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

Categories.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;
