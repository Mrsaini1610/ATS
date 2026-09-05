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
} from "lucide-react";

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
  high: "bg-red-50 text-red-600 border-red-200",
  medium: "bg-yellow-50 text-yellow-600 border-yellow-200",
  low: "bg-green-50 text-green-600 border-green-200",
};

export default function Skills({ skills = [] }) {
  const { auth, flash } = usePage().props;
  const admin = auth?.admin;
  const canManage = admin?.role === "super_admin" || admin?.role === "admin";

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [modal, setModal] = useState(null);

  const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
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

      <div className="p-6">
        {flash?.success && (
          <div className="mb-5 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> {flash.success}
          </div>
        )}

        {/* Modal: Add/Edit Skill */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100">
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
                    onChange={(e) => setData("name", e.target.value)}
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
                    onChange={(e) => setData("category", e.target.value)}
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
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Skills</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {skills.length} skills · {skills.filter((s) => s.active).length} active tags
            </p>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          )}
        </div>

        {/* Search & Categories Tabs */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skills by title or category..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {allCats.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCatFilter(c)}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all border cursor-pointer ${
                  catFilter === c
                    ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Skills Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((skill) => (
            <div
              key={skill.id}
              className={`bg-white border rounded-2xl p-4 hover:shadow-md transition-shadow flex flex-col justify-between ${
                !skill.active ? "opacity-60 bg-gray-50/50" : "border-gray-100"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border capitalize ${
                      demandColor[skill.demand] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {skill.demand} Demand
                  </span>
                </div>
                <p className="font-bold text-gray-900 mb-0.5">{skill.name}</p>
                <p className="text-xs text-gray-500 mb-3">{skill.category}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => toggleActive(skill.id)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg cursor-pointer transition ${
                    skill.active
                      ? "bg-green-50 text-green-700 hover:bg-green-100"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {skill.active ? "Active" : "Inactive"}
                </button>

                {canManage && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(skill)}
                      className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition"
                      title="Edit Skill"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSkill(skill.id, skill.name)}
                      className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer transition"
                      title="Delete Skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-400">
              No skills found matching your search
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Skills.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;