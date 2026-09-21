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
    return nameMatch || subMatch;
  });

  const totalSubcategories = categories.reduce(
    (acc, cat) => acc + (cat.subcategories?.length || 0),
    0
  );

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
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Job Categories</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {categories.length} categories · {totalSubcategories} subcategories
            </p>
          </div>

          {can("create_categories") && (
            <button
              type="button"
              onClick={openAddCategoryModal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/30 transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-5 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories or subcategories..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          />
        </div>

        {/* Category List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center text-sm text-gray-400">
              Koi category nahi mili.
            </div>
          ) : (
            filtered.map((cat) => {
              const isExpanded = expandedId === cat.uuid;
              const subCount = cat.subcategories?.length || 0;
              const isActive = cat.status === "active";

              return (
                <div
                  key={cat.uuid}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : cat.uuid)}
                      className="flex items-center gap-3.5 flex-1 min-w-0 text-left cursor-pointer"
                    >
                      <span className="text-2xl select-none">{cat.icon || "📁"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{cat.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {(cat.job_count ?? 0).toLocaleString()} jobs · {subCount} subcategories
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                    </button>

                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${
                          isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>

                      {(can("create_categories") || can("edit_categories") || can("status_categories") || can("delete_categories") || can("create_subcategories")) && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {can("create_subcategories") && <button
                            type="button"
                            onClick={() => openAddSubcategoryModal(cat.uuid)}
                            className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg cursor-pointer transition"
                            title="Add subcategory"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>}
                          {can("edit_categories") && <button
                            type="button"
                            onClick={() => openEditCategoryModal(cat)}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition"
                            title="Edit category"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>}
                          {can("status_categories") && <button
                            type="button"
                            onClick={() => handleToggleStatus(cat.uuid)}
                            className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                              isActive
                                ? "text-gray-600 bg-gray-100 hover:bg-gray-200"
                                : "text-green-700 bg-green-50 hover:bg-green-100"
                            }`}
                          >
                            {isActive ? "Turn Off" : "Turn On"}
                          </button>}
                          {can("delete_categories") && <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer transition"
                            title="Delete category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subcategories Accordion */}
                  {isExpanded && canViewSubcategories && (
                    <div className="border-t border-gray-100 bg-gray-50/60 px-4 sm:px-5 py-3 space-y-2">
                      {subCount > 0 ? (
                        cat.subcategories.map((sub) => {
                          const isSubActive = (sub.status ?? "active") === "active";
                          return (
                            <div
                              key={sub.uuid}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 px-3 rounded-xl hover:bg-white/80 transition"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full shrink-0 ml-1 sm:ml-4" />
                                <p className="text-sm font-medium text-gray-700 truncate">
                                  {sub.name}
                                </p>
                                <p className="text-xs text-gray-400 shrink-0">
                                  {sub.job_count ?? 0} jobs
                                </p>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pl-4 sm:pl-0">
                                <span
                                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                                    isSubActive
                                      ? "bg-green-50 text-green-700"
                                      : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  {isSubActive ? "Active" : "Inactive"}
                                </span>

                              {(can("status_subcategories") || can("edit_subcategories") || can("delete_subcategories")) && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {can("status_subcategories") && (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleSubcategoryStatus(cat.uuid, sub.uuid)}
                                      className={`px-2 py-0.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                                        isSubActive
                                          ? "text-gray-600 bg-gray-100 hover:bg-gray-200"
                                          : "text-green-700 bg-green-50 hover:bg-green-100"
                                      }`}
                                    >
                                      {isSubActive ? "Turn Off" : "Turn On"}
                                    </button>
                                  )}
                                  {can("edit_subcategories") && (
                                    <button
                                      type="button"
                                      onClick={() => openEditSubcategoryModal(cat.uuid, sub)}
                                      className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer transition"
                                      title="Edit subcategory"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {can("delete_subcategories") && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSubcategory(cat.uuid, sub)}
                                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer transition"
                                      title="Delete subcategory"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-6 py-3 text-xs text-gray-400">
                          Abhi koi subcategory nahi hai. Nayi jodne ke liye upar <b>+</b> par click karein.
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
