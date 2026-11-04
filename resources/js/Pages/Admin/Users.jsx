import React, { useState, useEffect } from "react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";
import { Head, usePage, useForm, router } from "@inertiajs/react";
import {
  Search,
  Phone,
  MapPin,
  Briefcase,
  CheckCircle2,
  X,
  UserPlus,
  Globe,
  Smartphone,
  RefreshCw,
  FileSpreadsheet,
  Download,
  MessageCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import { updateAdminField } from "@/Components/Admin/liveValidation";

const INDIA_CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Noida",
  "Gurugram",
  "Jaipur",
  "Other",
];

export default function Users({ users = [], categories = [], canViewAll = false, scope = "your" }) {
  const { auth, flash } = usePage().props;
  const admin = auth?.admin;
  const permissions = admin?.permissions || [];
  const can = (permission) => admin?.role === "super_admin" || permissions.includes(permission);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all"); // 'all' | 'web' | 'app' | 'both'
  const [selectedUser, setSelectedUser] = useState(null);
  const [addModal, setAddModal] = useState(false);

  const { data, setData, post, processing, reset, errors, clearErrors, setError } = useForm({
    name: "",
    phone: "",
    email: "",
    city: "",
    jobTitle: "",
    experience: "",
    category: "",
  });

  const openAddModal = () => {
    clearErrors();
    reset();
    setAddModal(true);
  };

  const closeAddModal = () => {
    setAddModal(false);
    reset();
    clearErrors();
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    post(route("admin.users.store"), {
      preserveScroll: true,
      onSuccess: () => closeAddModal(),
    });
  };

  const handleToggleStatus = (uuid) => {
    router.post(route("admin.users.toggle-status", uuid), {}, {
      preserveScroll: true,
      onSuccess: () => {
        if (selectedUser?.uuid === uuid) {
          setSelectedUser((prev) =>
            prev ? { ...prev, status: prev.status === "active" ? "inactive" : "active" } : null
          );
        }
      },
    });
  };

  // Auto-scroll detail panel smoothly into view when candidate is selected
  useEffect(() => {
    if (selectedUser) {
      const el = document.getElementById("admin-user-detail-panel");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedUser?.uuid]);

  // Export filtered candidates to Excel (.xlsx)
  const handleExportExcel = () => {
    if (!filtered || filtered.length === 0) {
      alert("No candidates found for the selected filter.");
      return;
    }

    const exportRows = filtered.map((u, idx) => ({
      "S.No": idx + 1,
      "Candidate Name": u.name || "—",
      "Phone": u.phone || "—",
      "Email": u.email || "—",
      "City": u.city || "—",
      "Area": u.area || "—",
      "Target Job Title": u.jobTitle || "—",
      "Experience": u.experience || "—",
      "Platform": u.platform === "both" ? "Both (Web & App)" : (u.platform === "app" ? "App" : "Web"),
      "Registered Via": (u.registeredFrom || "web").toUpperCase(),
      "Status": (u.status || "active").toUpperCase(),
      "Joined Date": u.registeredAt || "—",
      "Applied Jobs": u.appliedCount ?? 0,
      "Web Last Active": u.webLastActive || "—",
      "App Last Active": u.appLastActive || "—",
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Candidates");

    const filterSuffix = platformFilter !== "all" ? `_${platformFilter}` : "_all";
    const fileName = `ATS_Candidates${filterSuffix}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (u.name || "").toLowerCase().includes(q) ||
      (u.phone || "").includes(q) ||
      (u.city || "").toLowerCase().includes(q) ||
      (u.jobTitle || "").toLowerCase().includes(q);

    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    const matchesPlatform = platformFilter === "all" || u.platform === platformFilter;
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  // Platform statistics
  const platformCounts = {
    all: users.length,
    web: users.filter((u) => u.platform === "web").length,
    app: users.filter((u) => u.platform === "app").length,
    both: users.filter((u) => u.platform === "both").length,
  };

  return (
    <>
      <Head title="Registered Candidates - ATS Admin" />

      <div className="p-3.5 sm:p-5 lg:p-6 pb-25">
        {flash?.success && (
          <div className="mb-5 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> {flash.success}
          </div>
        )}

        {/* Add Candidate Modal */}
        {addModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 sm:px-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900">Add New Candidate</h3>
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => updateAdminField(setData, setError, clearErrors, "name", e.target.value, data)}
                    placeholder="e.g. Arjun Sharma"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone Number (+91) *
                  </label>
                  <input
                    type="text"
                    value={data.phone}
                    onChange={(e) => updateAdminField(setData, setError, clearErrors, "phone", e.target.value, data)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => updateAdminField(setData, setError, clearErrors, "email", e.target.value, data)}
                    placeholder="e.g. arjun@example.com"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      City
                    </label>
                    <select
                      value={data.city}
                      onChange={(e) => setData("city", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select city</option>
                      {INDIA_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Experience
                    </label>
                    <select
                      value={data.experience}
                      onChange={(e) => setData("experience", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select experience</option>
                      <option value="Fresher">Fresher</option>
                      <option value="1 Year">1 Year</option>
                      <option value="2 Years">2 Years</option>
                      <option value="3+ Years">3+ Years</option>
                      <option value="5+ Years">5+ Years</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Target Job Title
                  </label>
                  <input
                    type="text"
                    value={data.jobTitle}
                    onChange={(e) => updateAdminField(setData, setError, clearErrors, "jobTitle", e.target.value, data)}
                    placeholder="e.g. Telecaller / Sales Associate"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Preferred Category
                  </label>
                  <select
                    value={data.category}
                    onChange={(e) => setData("category", e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {Array.isArray(categories) && categories.map((cat) => (
                      <option key={cat.id || cat.uuid} value={cat.name}>
                        {cat.icon ? `${cat.icon} ` : ""}{cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
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
                    {processing ? "Adding..." : "Add Candidate"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Registered Candidates</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {users.length} total candidates ({platformCounts.web} Web, {platformCounts.app} App, {platformCounts.both} Both)
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Excel Export Button */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/25 transition cursor-pointer shrink-0"
              title="Export filtered candidates to Excel spreadsheet (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel ({filtered.length})</span>
            </button>

            {can("add_users") && (
              <button
                type="button"
                onClick={openAddModal}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/30 transition cursor-pointer shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            )}
          </div>
        </div>

        {/* All vs Your Scope Tab (Visible when canViewAll is true) */}
        {canViewAll && (
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl w-fit mb-5">
            <button
              type="button"
              onClick={() => router.get(route("admin.users.index"), { scope: "all" }, { preserveState: true, preserveScroll: true })}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                scope === "all" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              All Candidates
            </button>
            <button
              type="button"
              onClick={() => router.get(route("admin.users.index"), { scope: "your" }, { preserveState: true, preserveScroll: true })}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                scope === "your" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Your Candidates
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="space-y-3 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, city, job role..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Status Filter */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["all", "active", "inactive"].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all border cursor-pointer shrink-0 ${
                    statusFilter === s
                      ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Filter Buttons (Web, App, Both, All) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0">
              Platform:
            </span>
            {[
              { id: "all", label: "All Platforms", count: platformCounts.all, icon: null },
              { id: "web", label: "Web Portal", count: platformCounts.web, icon: Globe, color: "text-blue-600" },
              { id: "app", label: "Mobile App", count: platformCounts.app, icon: Smartphone, color: "text-purple-600" },
              { id: "both", label: "Both (Web & App)", count: platformCounts.both, icon: RefreshCw, color: "text-emerald-600" },
            ].map((p) => {
              const IconComp = p.icon;
              const isActive = platformFilter === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPlatformFilter(p.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {IconComp && <IconComp className={`w-3.5 h-3.5 ${isActive ? "text-white" : p.color}`} />}
                  <span>{p.label}</span>
                  <span
                    className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Candidates List View (Table - Independent Scroll in View Mode) */}
          <div
            className={`flex-1 w-full min-w-0 ${
              selectedUser
                ? "hidden lg:block overflow-y-auto h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] pr-2 [scrollbar-width:thin]"
                : ""
            }`}
          >
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto [scrollbar-width:thin]">
                <table className="w-full text-left border-collapse min-w-[780px]">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4 whitespace-nowrap min-w-[170px]">Candidate</th>
                      <th className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">Contact</th>
                      <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">Location</th>
                      <th className="py-3.5 px-4 whitespace-nowrap min-w-[150px]">Role & Experience</th>
                      <th className="py-3.5 px-4 whitespace-nowrap min-w-[100px]">Platform</th>
                      <th className="py-3.5 px-4 whitespace-nowrap min-w-[85px]">Status</th>
                      <th className={`py-3.5 px-4 whitespace-nowrap min-w-[80px] ${selectedUser ? "hidden xl:table-cell" : ""}`}>Applied</th>
                      <th className="py-3.5 px-4 whitespace-nowrap min-w-[110px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {filtered.map((user) => {
                      const cleanPhone = (user.phone || "").replace(/\D+/g, "");
                      const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                      const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
                        `Hello ${user.name}, we have opportunities matching your profile at ATS.`
                      )}`;

                      return (
                        <tr
                          key={user.uuid}
                          onClick={() => setSelectedUser(user)}
                          className={`cursor-pointer transition-colors ${
                            selectedUser?.uuid === user.uuid
                              ? "bg-blue-50/70 border-l-4 border-l-blue-600"
                              : "hover:bg-gray-50/90"
                          }`}
                        >
                          {/* Candidate info */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
                                {(user.name || "C")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </div>
                              <div className="min-w-0 max-w-[170px]">
                                <p className="font-bold text-gray-900 truncate hover:text-blue-600">
                                  {user.name}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                  Joined {user.registeredAt}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <p className="font-medium text-gray-800 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                              <span>{user.phone}</span>
                            </p>
                            {user.email && (
                              <p className="text-[11px] text-gray-400 truncate max-w-[140px]">
                                {user.email}
                              </p>
                            )}
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <p className="text-gray-700 flex items-center gap-1 truncate max-w-[150px]">
                              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                              <span>
                                {user.area && user.area !== "—" ? `${user.area}, ${user.city}` : (user.city || "—")}
                              </span>
                            </p>
                          </td>

                          {/* Role & Experience */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <p className="font-semibold text-gray-800 truncate max-w-[160px]">
                              {user.jobTitle || "Job Seeker"}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {user.experience || "Fresher"}
                            </p>
                          </td>

                          {/* Platform Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {user.platform === "both" ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                <RefreshCw className="w-2.5 h-2.5 text-emerald-600" /> Both
                              </span>
                            ) : user.platform === "app" ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
                                <Smartphone className="w-2.5 h-2.5 text-purple-600" /> App
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                                <Globe className="w-2.5 h-2.5 text-blue-600" /> Web
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold capitalize whitespace-nowrap ${
                                user.status === "active"
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-gray-100 text-gray-500 border border-gray-200"
                              }`}
                            >
                              {user.status}
                            </span>
                          </td>

                          {/* Applied Count */}
                          <td className={`py-3.5 px-4 whitespace-nowrap ${selectedUser ? "hidden xl:table-cell" : ""}`}>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 whitespace-nowrap">
                              {user.appliedCount ?? 0} applied
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {cleanPhone && (
                                <>
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition"
                                    title="WhatsApp candidate"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </a>
                                  <a
                                    href={`tel:${user.phone}`}
                                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                                    title={`Call ${user.phone}`}
                                  >
                                    <Phone className="w-3.5 h-3.5" />
                                  </a>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedUser(user)}
                                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-16 text-gray-400">
                          No candidates found matching the filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Candidate Drawer Panel (Independent Smooth Scroll & Distinct Contrast Header) */}
          {selectedUser && (
            <div
              id="admin-user-detail-panel"
              className="w-full lg:w-80 xl:w-96 shrink-0 bg-white border-2 border-blue-400/80 rounded-3xl overflow-hidden flex flex-col lg:sticky lg:top-3 h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] shadow-2xl shadow-blue-950/20 z-20"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="text-xs font-semibold text-blue-200 hover:text-white px-2 py-1 bg-white/10 rounded-lg lg:hidden cursor-pointer"
                  >
                    ← Back
                  </button>
                  <div>
                    <h3 className="font-extrabold text-white text-sm truncate">{selectedUser.name || "Candidate"}</h3>
                    <span className="text-[10px] text-cyan-300 font-medium">Candidate Inspection Dossier</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer shrink-0 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-5 space-y-4 overscroll-contain [scrollbar-width:thin]">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-3 shadow-md shadow-blue-500/20">
                    {(selectedUser.name || "C")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <p className="font-bold text-gray-900">{selectedUser.name}</p>
                  <div className="flex items-center justify-center gap-1.5 mt-1.5 flex-wrap">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        selectedUser.status === "active"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {selectedUser.status}
                    </span>
                    {selectedUser.platform === "both" ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 text-emerald-600" /> Both (Web & App)
                      </span>
                    ) : selectedUser.platform === "app" ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-purple-600" /> Mobile App
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                        <Globe className="w-3 h-3 text-blue-600" /> Web Portal
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {[
                    { label: "Phone", val: selectedUser.phone },
                    { label: "Email", val: selectedUser.email || "—" },
                    { label: "City & Area", val: selectedUser.area && selectedUser.area !== "—" ? `${selectedUser.area}, ${selectedUser.city}` : (selectedUser.city || "—") },
                    { label: "Job Title", val: selectedUser.jobTitle || "—" },
                    { label: "Experience", val: selectedUser.experience || "—" },
                    { label: "Platform", val: selectedUser.platform === "both" ? "Both (Web & App)" : (selectedUser.platform === "app" ? "Mobile App" : "Web Portal") },
                    { label: "Registered Via", val: (selectedUser.registeredFrom || "web").toUpperCase() },
                    { label: "Web Last Active", val: selectedUser.webLastActive || "Never" },
                    { label: "App Last Active", val: selectedUser.appLastActive || "Never" },
                    { label: "Applied Jobs", val: `${selectedUser.appliedCount ?? 0} jobs` },
                    { label: "Joined", val: selectedUser.registeredAt },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between gap-2">
                      <p className="text-xs text-gray-400 font-medium shrink-0">{r.label}</p>
                      <p className="text-xs font-semibold text-gray-900 text-right">{r.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {can("status_users") && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(selectedUser.uuid)}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold cursor-pointer transition ${
                      selectedUser.status === "active"
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    {selectedUser.status === "active" ? "Deactivate User" : "Activate User"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Users.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;