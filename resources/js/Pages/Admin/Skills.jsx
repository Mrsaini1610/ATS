import React, { useState } from "react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";
import { Head, usePage, useForm, router } from "@inertiajs/react";
import {
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  X,
  Search,
  Zap,
  Sparkles,
  Flame,
  Check,
  Layers,
} from "lucide-react";
import { updateAdminField } from "@/Components/Admin/liveValidation";

const CATEGORIES = [
  "IT & Software",
  "Telecalling & BPO",
  "Sales & Marketing",
  "Data & AI",
  "Cloud",
  "DevOps",
  "Design",
  "Finance",
  "HR",
  "Operations",
  "Other",
];

const DEMANDS = ["high", "medium", "low"];

const demandColor = {
  high: "bg-rose-50 text-rose-700 border-rose-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function Skills({ skills = [] }) {
  const { auth, flash } = usePage().props;
  const admin = auth?.admin;
  const canManage = admin?.role === "super_admin" || admin?.role === "admin";
  const permissions = admin?.permissions || [];
  const can = (permission) => admin?.role === "super_admin" || permissions.includes(permission);

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [modal, setModal] = useState(null);

  const { data, setData, post, put, processing, reset, errors, clearErrors, setError } = useForm({
    name: "",
    category: "Telecalling & BPO",
    demand: "medium",
  });

  const openAddModal = () => {
    clearErrors();
    reset();
    setData({ name: "", category: "Telecalling & BPO", demand: "medium" });
    setModal({ mode: "add" });
  };

  const openEditModal = (skill) => {
    clearErrors();
    setData({
      name: skill.name,
      category: skill.category,
      demand: skill.demand,
    });
    setModal({ mode: "edit", id: skill.id });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modal.mode === "add") {
      post(route("admin.skills.store"), {
        preserveScroll: true,
        onSuccess: () => setModal(null),
      });
    } else {
      put(route("admin.skills.update", modal.id), {
        preserveScroll: true,
        onSuccess: () => setModal(null),
      });
    }
  };

  const deleteSkill = (id, name) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      router.delete(route("admin.skills.destroy", id), { preserveScroll: true });
    }
  };

  const toggleActive = (id) => {
    router.post(route("admin.skills.toggle-status", id), {}, { preserveScroll: true });
  };

  const allCats = [
    "all",
    ...CATEGORIES.filter((c) => skills.some((s) => s.category === c)),
  ];

  const filtered = skills.filter((s) => {
    const q = search.toLowerCase();
    return (
      (!search ||
        (s.name || "").toLowerCase().includes(q) ||
        (s.category || "").toLowerCase().includes(q)) &&
      (catFilter === "all" || s.category === catFilter)
    );
  });

  return (
    <>
      <Head title="Skill Management - ATS Admin" />

      <div className="p-3.5 sm:p-5 lg:p-6 pb-25">
        {flash?.success && (
          <div className="mb-5 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /> <span className="truncate">{flash.success}</span>
          </div>
        )}

        {/* Modal: Add/Edit Skill */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-sm shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">
                  {modal.mode === "add" ? "Add New Skill" : "Edit Skill"}
                </h3>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Skill Name *
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => updateAdminField(setData, setError, clearErrors, "name", e.target.value, data)}
                    placeholder="e.g. Telecalling / React.js"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    autoFocus
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Category
                  </label>
                  <select
                    value={data.category}
                    onChange={(e) => updateAdminField(setData, setError, clearErrors, "category", e.target.value, data)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Market Demand Level
                  </label>
                  <div className="flex gap-2">
                    {DEMANDS.map((d) => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => setData("demand", d)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border capitalize cursor-pointer transition ${
                          data.demand === d
                            ? demandColor[d] + " ring-2 ring-offset-1 ring-blue-500 shadow-xs"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing || !data.name.trim()}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 cursor-pointer shadow-md shadow-blue-600/30"
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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/25 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Skill & Competency Repository
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Curate trending keywords, market demand weights, and candidate skill tags.
              </p>
            </div>
          </div>

          {can("create_skills") && (
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/30 transition cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" /> Add New Skill
            </button>
          )}
        </div>

        {/* Top Summary Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Total Skills</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{skills.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Keywords in database</p>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Active Tags</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
                <Check className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">
              {skills.filter((s) => s.active).length}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Available for mapping</p>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">High Demand</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">
              {skills.filter((s) => s.demand === "high").length}
            </p>
            <p className="text-[11px] text-rose-600 font-semibold mt-0.5">High market priority</p>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Categories</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">
              {new Set(skills.map((s) => s.category)).size}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Industry clusters</p>
          </div>
        </div>

        {/* Search & Categories Filter Tabs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center">
          <div className="relative w-full sm:w-80 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skill name or category..."
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

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full flex-1">
            {allCats.map((c) => {
              const count = c === "all" ? skills.length : skills.filter((s) => s.category === c).length;
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCatFilter(c)}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all border cursor-pointer ${
                    catFilter === c
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md shadow-blue-600/25"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {c} <span className="opacity-80 font-normal ml-0.5">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Skills Cards Grid - Natural flex height, no overlapping */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5">
          {filtered.map((skill) => (
            <div
              key={skill.id}
              className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-blue-400 ${
                !skill.active ? "opacity-65 bg-slate-50/70 border-slate-200" : "border-slate-200/90"
              }`}
            >
              <div>
                {/* Card Header: Icon & Demand Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                      skill.demand === "high"
                        ? "bg-rose-50 text-rose-700 border border-rose-200 ring-1 ring-rose-500/20"
                        : skill.demand === "medium"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {skill.demand === "high" && <Flame className="w-3 h-3 text-rose-600 shrink-0" />}
                    {skill.demand === "medium" && <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />}
                    <span>{skill.demand} Demand</span>
                  </span>
                </div>

                {/* Skill Title: Dynamic height, break-words, never clips or overlaps */}
                <h3
                  className="font-extrabold text-slate-900 text-base leading-snug break-words mb-2.5"
                  title={skill.name}
                >
                  {skill.name}
                </h3>

                {/* Category pill */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 mb-4 max-w-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  <span className="truncate">{skill.category}</span>
                </div>
              </div>

              {/* Bottom Actions: Active Toggle & Edit/Delete */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                <button
                  type="button"
                  onClick={() => toggleActive(skill.id)}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition ${
                    skill.active
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${skill.active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                  {skill.active ? "Active" : "Inactive"}
                </button>

                {(can("edit_skills") || can("delete_skills")) && (
                  <div className="flex items-center gap-1.5">
                    {can("edit_skills") && (
                      <button
                        type="button"
                        onClick={() => openEditModal(skill)}
                        className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl cursor-pointer transition shadow-2xs"
                        title="Edit Skill"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {can("delete_skills") && (
                      <button
                        type="button"
                        onClick={() => deleteSkill(skill.id, skill.name)}
                        className="p-1.5 text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl cursor-pointer transition shadow-2xs"
                        title="Delete Skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-400 shadow-sm">
              <Zap className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-slate-700 text-sm">No skills found matching your search</p>
              <p className="text-xs text-slate-400 mt-1">Try another category or add a new skill.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Skills.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;