import React, { useState } from "react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";
import { Head, usePage, useForm, router } from "@inertiajs/react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  X,
  Building2,
  Globe,
  Briefcase,
  MapPin,
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
  "Ahmedabad",
  "Other",
];

const COLORS = [
  "bg-blue-600",
  "bg-indigo-600",
  "bg-purple-600",
  "bg-teal-600",
  "bg-orange-500",
  "bg-rose-600",
];

export default function Companies({ companies = [] }) {
  const { auth, flash } = usePage().props;
  const admin = auth?.admin;
  const canManage = admin?.role === "super_admin" || admin?.role === "admin";

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // { mode: 'add'|'edit', uuid?: string }
  const [deleteUuid, setDeleteUuid] = useState(null);

  const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
    name: "",
    website: "",
    location: "",
    logo: "",
    description: "",
    status: "active",
  });

  const openAddModal = () => {
    clearErrors();
    reset();
    setData({
      name: "",
      website: "",
      location: "",
      logo: "",
      description: "",
      status: "active",
    });
    setModal({ mode: "add" });
  };

  const openEditModal = (comp) => {
    clearErrors();
    setData({
      name: comp.name || "",
      website: comp.website || "",
      location: comp.location || "",
      logo: comp.logo || "",
      description: comp.description || "",
      status: comp.status || "active",
    });
    setModal({ mode: "edit", uuid: comp.uuid });
  };

  const closeModal = () => {
    setModal(null);
    reset();
    clearErrors();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modal.mode === "add") {
      post(route("admin.companies.store"), {
        preserveScroll: true,
        onSuccess: () => closeModal(),
      });
    } else {
      put(route("admin.companies.update", modal.uuid), {
        preserveScroll: true,
        onSuccess: () => closeModal(),
      });
    }
  };

  const handleToggleStatus = (uuid) => {
    router.post(route("admin.companies.toggle-status", uuid), {}, {
      preserveScroll: true,
    });
  };

  const confirmDelete = () => {
    if (!deleteUuid) return;
    router.delete(route("admin.companies.destroy", deleteUuid), {
      preserveScroll: true,
      onSuccess: () => setDeleteUuid(null),
    });
  };

  const filtered = companies.filter((c) => {
    const q = search.toLowerCase();
    return (
      !search ||
      (c.name || "").toLowerCase().includes(q) ||
      (c.location || "").toLowerCase().includes(q) ||
      (c.website || "").toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Head title="Registered Companies - ATS Admin" />

      <div className="p-6">
        {/* Flash Message Notification */}
        {flash?.success && (
          <div className="mb-5 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> {flash.success}
          </div>
        )}

        {/* Modal: Add/Edit Company */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100">
              <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  {modal.mode === "add" ? "Add New Company" : "Edit Company Details"}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setData((prev) => ({
                        ...prev,
                        name: val,
                        logo: prev.logo ? prev.logo : val.slice(0, 2).toUpperCase(),
                      }));
                    }}
                    placeholder="e.g. Apex Global Tech"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      City / Location
                    </label>
                    <select
                      value={data.location}
                      onChange={(e) => setData("location", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select City</option>
                      {INDIA_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Logo (2 Letters)
                    </label>
                    <input
                      type="text"
                      value={data.logo}
                      onChange={(e) =>
                        setData("logo", e.target.value.toUpperCase().slice(0, 2))
                      }
                      maxLength={2}
                      placeholder="AG"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={data.website}
                    onChange={(e) => setData("website", e.target.value)}
                    placeholder="https://company.com"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Description / About
                  </label>
                  <textarea
                    rows={3}
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    placeholder="Brief description about company and business domain..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Listing Status
                  </label>
                  <select
                    value={data.status}
                    onChange={(e) => setData("status", e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-3 border-t border-gray-100">
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
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/30 cursor-pointer disabled:opacity-60"
                  >
                    {processing ? "Saving..." : "Save Company"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteUuid && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center border border-gray-100 animate-scale-in">
              <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">Remove Company?</h3>
              <p className="text-xs text-gray-500 mb-5">
                This will delete the company profile and its details from the database.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteUuid(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold cursor-pointer shadow-md shadow-red-600/30"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Companies</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {companies.length} companies registered in database
            </p>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Company
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
            placeholder="Search company by name, location, website..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Companies Grid */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((company, idx) => {
            const randomColor = COLORS[idx % COLORS.length];

            return (
              <div
                key={company.uuid}
                className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className={`w-12 h-12 ${randomColor} rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs`}
                    >
                      {company.logo || (company.name || "C").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-900 truncate">{company.name}</p>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                            company.status === "active"
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {company.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">
                        {company.slug}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {company.location || "Location not set"}
                    </p>
                    {company.website && (
                      <p className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <a
                          href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline truncate"
                        >
                          {company.website}
                        </a>
                      </p>
                    )}
                    <p className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {company.jobs ?? 0} active jobs
                    </p>
                  </div>

                  {company.description && (
                    <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">
                      {company.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(company.uuid)}
                    disabled={!canManage}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
                      company.status === "active"
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    } ${!canManage ? "cursor-default" : "cursor-pointer"}`}
                  >
                    {company.status === "active" ? "Deactivate" : "Activate"}
                  </button>

                  {canManage && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditModal(company)}
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl cursor-pointer transition"
                        title="Edit Company"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteUuid(company.uuid)}
                        className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl cursor-pointer transition"
                        title="Delete Company"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400">
              No companies found in database
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Sidebar Layout Wrapper
Companies.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;
