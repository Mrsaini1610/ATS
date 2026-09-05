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

const ICONS = [
  "💻", "💰", "📣", "🎨", "👥", "⚙️", "📊", "🏥",
  "🏦", "🚚", "📚", "🔬", "🏗️", "🎯", "📱", "📁"
];

export default function Categories({ categories = [] }) {
  const { auth, flash } = usePage().props;
  const admin = auth?.admin;
  const canManage = admin?.role === "super_admin" || admin?.role === "admin";

  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [modal, setModal] = useState(null); // { mode: 'cat' | 'sub', action: 'add' | 'edit', parentUuid?: string, uuid?: string }

  const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
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
      // Subcategory Store Route
      post(route("admin.categories.subcategories.store", modal.parentUuid), {
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

  const handleDeleteCategory = (uuid) => {
    if (confirm("Kya aap sach me is category ko delete karna chahte hain?")) {
      router.delete(route("admin.categories.destroy", uuid), {
        preserveScroll: true,
      });
    }
  };

  const handleDeleteSubcategory = (catUuid, subUuid) => {
    if (confirm("Kya aap is subcategory ko delete karna chahte hain?")) {
      router.delete(route("admin.categories.subcategories.destroy", [catUuid, subUuid]), {
        preserveScroll: true,
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

      <div className="p-6">
        {/* Flash Message */}
        {flash?.success && (
          <div className="mb-5 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> {flash.success}
          </div>
        )}

        {/* Modal: Add/Edit Category or Subcategory */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Tags className="w-4 h-4 text-blue-600" />
                  {modal.mode === "cat"
                    ? modal.action === "add"
                      ? "Add Category"
                      : "Edit Category"
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
                    onChange={(e) => setData("name", e.target.value)}
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
                    disabled={processing || !data.name.trim()}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/30 cursor-pointer disabled:opacity-60"
                  >
                    {processing ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
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

          {canManage && (
            <button
              type="button"
              onClick={openAddCategoryModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-5 max-w-md">
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
                  <div className="flex items-center gap-3 px-5 py-4">
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

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${
                        isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {isActive ? "Active" : "Inactive"}
                    </span>

                    {canManage && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => openAddSubcategoryModal(cat.uuid)}
                          className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg cursor-pointer transition"
                          title="Add subcategory"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditCategoryModal(cat)}
                          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition"
                          title="Edit category"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cat.uuid)}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                            isActive
                              ? "text-gray-600 bg-gray-100 hover:bg-gray-200"
                              : "text-green-700 bg-green-50 hover:bg-green-100"
                          }`}
                        >
                          {isActive ? "Turn Off" : "Turn On"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.uuid)}
                          className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer transition"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Subcategories Accordion */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-3 space-y-2">
                      {subCount > 0 ? (
                        cat.subcategories.map((sub) => (
                          <div
                            key={sub.uuid}
                            className="flex items-center gap-3 py-1.5 px-3 rounded-xl hover:bg-white/80 transition"
                          >
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full shrink-0 ml-4" />
                            <p className="flex-1 text-sm font-medium text-gray-700">
                              {sub.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {sub.job_count ?? 0} jobs
                            </p>
                            {canManage && (
                              <button
                                type="button"
                                onClick={() => handleDeleteSubcategory(cat.uuid, sub.uuid)}
                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer transition"
                                title="Delete subcategory"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))
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
