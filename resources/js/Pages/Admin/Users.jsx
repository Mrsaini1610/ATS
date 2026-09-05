import React, { useState } from "react";
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
} from "lucide-react";

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

export default function Users({ users = [] }) {
  const { auth, flash } = usePage().props;
  const admin = auth?.admin;
  const canManage = admin?.role === "super_admin" || admin?.role === "admin";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [addModal, setAddModal] = useState(false);

  const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
    name: "",
    phone: "",
    email: "",
    city: "",
    jobTitle: "",
    experience: "",
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

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (u.name || "").toLowerCase().includes(q) ||
      (u.phone || "").includes(q) ||
      (u.city || "").toLowerCase().includes(q) ||
      (u.jobTitle || "").toLowerCase().includes(q);

    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Head title="Registered Candidates - ATS Admin" />

      <div className="p-6">
        {flash?.success && (
          <div className="mb-5 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> {flash.success}
          </div>
        )}

        {/* Add Candidate Modal */}
        {addModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
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
                    onChange={(e) => setData("name", e.target.value)}
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
                    onChange={(e) => setData("phone", e.target.value)}
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
                    onChange={(e) => setData("email", e.target.value)}
                    placeholder="e.g. arjun@example.com"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                    <input
                      type="text"
                      value={data.experience}
                      onChange={(e) => setData("experience", e.target.value)}
                      placeholder="e.g. 2 Years"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Job Title / Bio Profile
                  </label>
                  <input
                    type="text"
                    value={data.jobTitle}
                    onChange={(e) => setData("jobTitle", e.target.value)}
                    placeholder="e.g. Telecaller / Full Stack Developer"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/30 cursor-pointer disabled:opacity-60"
                  >
                    {processing ? "Registering..." : "Register Candidate"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Candidates</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {users.length} registered candidate profiles in database
            </p>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/30 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Add Candidate
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate by name, phone, city, or title..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-1.5">
            {["all", "active", "inactive"].map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all border cursor-pointer ${
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

        <div className="flex gap-5">
          {/* Candidates Grid */}
          <div className={`flex-1 ${selectedUser ? "hidden lg:block" : ""}`}>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map((user) => (
                <div
                  key={user.uuid}
                  onClick={() => setSelectedUser(user)}
                  className={`bg-white border rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all shadow-xs ${
                    selectedUser?.uuid === user.uuid
                      ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/20"
                      : "border-gray-100 hover:border-blue-200"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-xs">
                      {(user.name || "C")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {user.phone}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize shrink-0 ${
                        user.status === "active"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-gray-500">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {user.city || "Location not set"}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                      {user.jobTitle || "Looking for opportunities"} · {user.experience}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-[11px] text-gray-400">
                      Joined {user.registeredAt}
                    </span>
                    <span className="text-xs font-semibold text-blue-600">
                      {user.appliedCount} applied
                    </span>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400">
                  No candidates found in database
                </div>
              )}
            </div>
          </div>

          {/* Candidate Drawer Panel */}
          {selectedUser && (
            <div className="w-72 shrink-0 bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col sticky top-20 max-h-[calc(100vh-120px)] shadow-xs">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">Candidate Details</h3>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-5 space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-3 shadow-md shadow-blue-500/20">
                    {(selectedUser.name || "C")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <p className="font-bold text-gray-900 text-base">{selectedUser.name}</p>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize inline-block mt-1 ${
                      selectedUser.status === "active"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {selectedUser.status}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {[
                    { label: "Phone", val: selectedUser.phone },
                    { label: "Email", val: selectedUser.email || "—" },
                    { label: "City", val: selectedUser.city || "—" },
                    { label: "Profile", val: selectedUser.jobTitle || "—" },
                    { label: "Experience", val: selectedUser.experience || "—" },
                    { label: "Joined Date", val: selectedUser.registeredAt },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between gap-2 border-b border-gray-50 pb-1.5">
                      <p className="text-gray-400 font-medium shrink-0">{r.label}</p>
                      <p className="font-semibold text-gray-900 text-right">{r.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {canManage && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(selectedUser.uuid)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                      selectedUser.status === "active"
                        ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                        : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                    }`}
                  >
                    {selectedUser.status === "active" ? "Deactivate Candidate" : "Activate Candidate"}
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
