import React, { useState } from "react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";
import LocationInput from "@/Components/LocationInput";
import { Head, usePage, useForm, router, Link } from "@inertiajs/react";
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
  ChevronRight,
  Users,
  AlertCircle,
  Compass,
  ExternalLink,
  Calendar,
  Navigation,
  Check,
} from "lucide-react";

const COLORS = [
  "bg-blue-600",
  "bg-indigo-600",
  "bg-purple-600",
  "bg-teal-600",
  "bg-orange-500",
  "bg-rose-600",
];

const COMPANY_SIZES = [
  "1 - 10 employees",
  "11 - 50 employees",
  "51 - 200 employees",
  "201 - 500 employees",
  "500+ employees",
];

export default function Companies({ companies = [] }) {
  const { auth, flash } = usePage().props;
  const admin = auth?.admin;
  const canManage = admin?.role === "super_admin" || admin?.role === "admin";
  const permissions = admin?.permissions || [];
  const can = (permission) => admin?.role === "super_admin" || permissions.includes(permission);

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [deleteUuid, setDeleteUuid] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [logoType, setLogoType] = useState("initials");

  const { data, setData, post, processing, reset, errors, clearErrors, setError } = useForm({
    name: "",
    website: "",
    location: "",
    address: "",
    latitude: null,
    longitude: null,
    company_size: "1 - 10 employees",
    logo: "",
    description: "",
    status: "active",
  });

  const validateName = (name) => {
    const val = (name || "").trim();
    if (!val) return "Company name is required.";
    if (val.length < 2) return "Company name must be at least 2 characters.";
    return null;
  };

  const validateAddress = (address) => {
    const val = (address || "").trim();
    if (!val) return "Complete company address is required.";
    if (val.length < 5) return "Please enter a detailed company address (min 5 characters).";
    return null;
  };

  const validateWebsite = (website) => {
    const val = (website || "").trim();
    if (!val) return null;
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
    if (!urlPattern.test(val)) {
      return "Please enter a valid website URL (e.g. https://company.com).";
    }
    return null;
  };

  const validateCompanySize = (size) => {
    if (!size) return "Company size is required.";
    return null;
  };

  const openAddModal = () => {
    clearErrors();
    reset();
    setLogoType("initials");
    setData({
      name: "",
      website: "",
      location: "",
      address: "",
      latitude: null,
      longitude: null,
      company_size: "1 - 10 employees",
      logo: "",
      description: "",
      status: "active",
    });
    setModal({ mode: "add" });
  };

  const openEditModal = (comp) => {
    clearErrors();
    const isImg =
      comp.logo &&
      (comp.logo.startsWith("http") ||
        comp.logo.includes(".") ||
        comp.logo.includes("/") ||
        comp.logo.startsWith("company-logos/"));
    setLogoType(isImg ? "image" : "initials");

    setData({
      name: comp.name || "",
      website: comp.website || "",
      location: comp.location || "",
      address: comp.address || comp.location || "",
      latitude: comp.latitude ? Number(comp.latitude) : null,
      longitude: comp.longitude ? Number(comp.longitude) : null,
      company_size: comp.company_size || "1 - 10 employees",
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

  const handleNameChange = (e) => {
    const val = e.target.value;
    setData((prev) => ({
      ...prev,
      name: val,
      logo: logoType === "initials" ? val.slice(0, 2).toUpperCase() : prev.logo,
    }));
    const err = validateName(val);
    if (err) setError("name", err);
    else clearErrors("name");
  };

  const handleAddressChange = (address) => {
    setData((prev) => ({ ...prev, address }));
    const err = validateAddress(address);
    if (err) setError("address", err);
    else clearErrors("address");
  };

  const handleLatLngChange = ({ latitude, longitude }) => {
    setData((prev) => ({
      ...prev,
      latitude: latitude != null ? Number(Number(latitude).toFixed(7)) : null,
      longitude: longitude != null ? Number(Number(longitude).toFixed(7)) : null,
    }));
    clearErrors("latitude");
    clearErrors("longitude");
  };

  const handleWebsiteChange = (e) => {
    const val = e.target.value;
    setData("website", val);
    const err = validateWebsite(val);
    if (err) setError("website", err);
    else clearErrors("website");
  };

  const handleCompanySizeChange = (e) => {
    const val = e.target.value;
    setData("company_size", val);
    const err = validateCompanySize(val);
    if (err) setError("company_size", err);
    else clearErrors("company_size");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearErrors();

    let hasErr = false;
    const nameErr = validateName(data.name);
    if (nameErr) {
      setError("name", nameErr);
      hasErr = true;
    }
    const addrErr = validateAddress(data.address);
    if (addrErr) {
      setError("address", addrErr);
      hasErr = true;
    }
    const webErr = validateWebsite(data.website);
    if (webErr) {
      setError("website", webErr);
      hasErr = true;
    }
    const sizeErr = validateCompanySize(data.company_size);
    if (sizeErr) {
      setError("company_size", sizeErr);
      hasErr = true;
    }

    if (hasErr) return;

    if (modal.mode === "add") {
      post(route("admin.companies.store"), {
        preserveScroll: true,
        onSuccess: () => closeModal(),
      });
    } else {
      router.post(
        route("admin.companies.update", modal.uuid),
        {
          _method: "PUT",
          name: data.name,
          website: data.website,
          location: data.location,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          company_size: data.company_size,
          logo: data.logo,
          description: data.description,
          status: data.status,
        },
        {
          preserveScroll: true,
          onSuccess: () => closeModal(),
        }
      );
    }
  };

  const handleToggleStatus = (uuid) => {
    router.post(
      route("admin.companies.toggle-status", uuid),
      {},
      {
        preserveScroll: true,
      }
    );
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

      <div className="p-3.5 sm:p-5 lg:p-6 pb-32">
        {flash?.success && (
          <div className="mb-5 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> {flash.success}
          </div>
        )}

        {/* Add / Edit Company Modal */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 sm:px-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col border border-gray-100 overflow-hidden">
              {/* Fixed Header with ❌ Close Button */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-white shrink-0 z-10">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  {modal.mode === "add" ? "Add New Company" : "Edit Company Details"}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="overflow-y-auto p-4 sm:p-6 flex-1">
                <form onSubmit={handleSubmit} className="space-y-4">
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Apex Global Tech"
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition focus:ring-2 ${
                      errors.name
                        ? "border-red-500 focus:ring-red-400 bg-red-50/20"
                        : "border-gray-200 focus:ring-blue-500"
                    }`}
                    autoFocus
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      City / Location
                    </label>
                    <input
                      type="text"
                      value={data.location}
                      onChange={(e) => setData("location", e.target.value)}
                      placeholder="e.g. Jaipur, Rajasthan"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Company Size <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={data.company_size}
                      onChange={handleCompanySizeChange}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1 - 10 employees">1 - 10 employees</option>
                      <option value="11 - 50 employees">11 - 50 employees</option>
                      <option value="51 - 200 employees">51 - 200 employees</option>
                      <option value="201 - 500 employees">201 - 500 employees</option>
                      <option value="500+ employees">500+ employees</option>
                    </select>
                  </div>
                </div>

                {/* Company Address with GPS auto-coordinates */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Company Address <span className="text-red-500">*</span>
                  </label>
                  <LocationInput
                    value={data.address}
                    onChange={(addr, lat, lng) => {
                      setData((prev) => ({
                        ...prev,
                        address: addr,
                        ...(lat !== null && { latitude: lat }),
                        ...(lng !== null && { longitude: lng }),
                      }));
                      const err = validateAddress(addr);
                      if (err) setError("address", err);
                      else clearErrors("address");
                    }}
                    placeholder="Enter street, landmark, area, city..."
                    hasError={Boolean(errors.address)}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.address}
                    </p>
                  )}

                  {/* Auto-filled Coordinates Display */}
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        Coordinates (Latitude & Longitude)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {data.latitude && data.longitude
                          ? "Auto-filled and will save to database"
                          : "Type address above to auto-detect"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Latitude
                        </label>
                        <input
                          type="text"
                          value={data.latitude ?? ""}
                          onChange={(e) =>
                            setData("latitude", e.target.value ? Number(e.target.value) : null)
                          }
                          placeholder="e.g. 26.8530"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-mono text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Longitude
                        </label>
                        <input
                          type="text"
                          value={data.longitude ?? ""}
                          onChange={(e) =>
                            setData("longitude", e.target.value ? Number(e.target.value) : null)
                          }
                          placeholder="e.g. 75.8047"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-mono text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logo Format and Input */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Logo Format *
                    </label>
                    <select
                      value={logoType}
                      onChange={(e) => {
                        const type = e.target.value;
                        setLogoType(type);
                        if (type === "initials") {
                          setData("logo", (data.name || "").slice(0, 2).toUpperCase());
                        } else {
                          setData("logo", "");
                        }
                      }}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                    >
                      <option value="initials">Two Letter (Initials)</option>
                      <option value="image">Select Image (File)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {logoType === "initials" ? "Initials (2 Letters)" : "Choose Image File"}
                    </label>
                    {logoType === "initials" ? (
                      <input
                        type="text"
                        value={typeof data.logo === "string" ? data.logo : ""}
                        onChange={(e) =>
                          setData("logo", e.target.value.toUpperCase().slice(0, 2))
                        }
                        maxLength={2}
                        placeholder="AG"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold uppercase"
                      />
                    ) : (
                      <div className="relative flex items-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setData("logo", e.target.files[0])}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white outline-none file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Website URL */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Website URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={data.website}
                    onChange={handleWebsiteChange}
                    placeholder="https://company.com"
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition focus:ring-2 ${
                      errors.website
                        ? "border-red-500 focus:ring-red-400 bg-red-50/20"
                        : "border-gray-200 focus:ring-blue-500"
                    }`}
                  />
                  {errors.website && (
                    <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.website}
                    </p>
                  )}
                </div>

                {/* Description */}
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

                {/* Listing Status */}
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
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/30 cursor-pointer disabled:opacity-60 transition"
                  >
                    {processing ? "Saving..." : "Save Company"}
                  </button>
                </div>
              </form>
            </div>
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

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" /> Registered Companies
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {companies.length} partner companies · Address & GPS coordinates auto-synced
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search companies, city, website..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs w-64 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            {can("create_companies") && (
              <button
                type="button"
                onClick={openAddModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Company
              </button>
            )}
          </div>
        </div>

        {/* Companies Grid */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          <div
            className={`transition-all duration-300 ease-out ${
              selectedCompany
                ? "w-full lg:w-1/2 xl:w-7/12 flex flex-col gap-3 overflow-y-auto h-[calc(100vh-14rem)] max-h-[calc(100vh-14rem)] pr-2 [scrollbar-width:thin]"
                : "w-full flex-1 flex flex-wrap gap-4"
            }`}
          >
            {filtered.map((company, idx) => {
              const randomColor = COLORS[idx % COLORS.length];
              const isSelected = selectedCompany?.uuid === company.uuid;
              const isImageUrl =
                company.logo &&
                (company.logo.startsWith("http") ||
                  company.logo.includes(".") ||
                  company.logo.includes("/") ||
                  company.logo.startsWith("company-logos/"));

              return (
                <div
                  key={company.uuid}
                  onClick={() => setSelectedCompany(company)}
                  className={`bg-white border rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                    selectedCompany
                      ? "w-full ring-1 ring-blue-100"
                      : "w-full sm:w-[calc(50%-8px)] xl:w-[calc(33.333%-11px)]"
                  } ${
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40 shadow-sm"
                      : "border-gray-200/90 hover:border-blue-300"
                  }`}
                >
                  <div>
                    <div className="flex items-start gap-3 mb-3">
                      {isImageUrl ? (
                        <div className="w-11 h-11 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                          <img
                            src={
                              company.logo.startsWith("http")
                                ? company.logo
                                : `/storage/${company.logo}`
                            }
                            alt={company.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.className = `w-11 h-11 ${randomColor} rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs`;
                                parent.innerText = (company.name || "C").slice(0, 2).toUpperCase();
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-11 h-11 ${randomColor} rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs`}
                        >
                          {company.logo || (company.name || "C").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-extrabold text-gray-900 truncate hover:text-blue-600">{company.name}</p>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              company.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-gray-100 text-gray-500 border border-gray-200"
                            }`}
                          >
                            {company.status}
                          </span>
                        </div>
                        {company.website && (
                          <a
                            href={
                              company.website.startsWith("http")
                                ? company.website
                                : `https://${company.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5 truncate"
                          >
                            <Globe className="w-3 h-3 shrink-0" />
                            <span className="truncate">{company.website.replace(/^https?:\/\//, "")}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 mb-3 text-xs text-gray-600">
                      {company.location && (
                        <p className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{company.location}</span>
                        </p>
                      )}
                      {company.company_size && (
                        <p className="flex items-center gap-1.5 text-gray-500">
                          <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{company.company_size}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-purple-600" />
                      {company.jobs_count || 0} active openings
                    </span>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {can("status_companies") && (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(company.uuid)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                            company.status === "active"
                              ? "text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                              : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                          }`}
                        >
                          {company.status === "active" ? "Pause" : "Activate"}
                        </button>
                      )}
                      {can("edit_companies") && (
                        <button
                          type="button"
                          onClick={() => openEditModal(company)}
                          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer transition"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {can("delete_companies") && (
                        <button
                          type="button"
                          onClick={() => setDeleteUuid(company.uuid)}
                          className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg cursor-pointer transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="w-full text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400">
                No companies found in database
              </div>
            )}
          </div>

          {/* Right side comprehensive Company Details & Jobs inspection panel */}
          {selectedCompany && (
            <div className="w-full lg:w-1/2 xl:w-5/12 bg-white border-2 border-blue-400/80 rounded-3xl overflow-hidden flex flex-col h-[calc(100vh-14rem)] max-h-[calc(100vh-14rem)] lg:sticky lg:top-4 shadow-2xl shadow-blue-950/20 shrink-0 z-20">
              {/* Distinct High-Contrast Inspection Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {selectedCompany.logo &&
                  (selectedCompany.logo.startsWith("http") ||
                    selectedCompany.logo.includes(".") ||
                    selectedCompany.logo.includes("/") ||
                    selectedCompany.logo.startsWith("company-logos/")) ? (
                    <div className="w-11 h-11 bg-white/10 border border-white/20 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                      <img
                        src={
                          selectedCompany.logo.startsWith("http")
                            ? selectedCompany.logo
                            : `/storage/${selectedCompany.logo}`
                        }
                        alt={selectedCompany.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.className =
                              "w-11 h-11 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-md";
                            parent.innerText = (selectedCompany.name || "C").slice(0, 2).toUpperCase();
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-md border border-white/20">
                      {selectedCompany.logo || (selectedCompany.name || "C").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-white text-base truncate">{selectedCompany.name}</h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          selectedCompany.status === "active"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                        }`}
                      >
                        {selectedCompany.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-cyan-300 font-medium">Company Profile & Active Jobs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedCompany(null)}
                    className="text-xs font-semibold text-blue-200 hover:text-white px-2 py-1 bg-white/10 rounded-lg lg:hidden cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCompany(null)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer transition shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Body with Clean Structured Sections */}
              <div className="overflow-y-auto flex-1 p-5 space-y-4 overscroll-contain [scrollbar-width:thin]">
                {/* SECTION 1: Key Metadata Badges */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Company Size
                    </span>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      {selectedCompany.company_size || "11 - 50 employees"}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Live Job Posts
                    </span>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                      {selectedCompany.jobs_count || 0} Openings
                    </span>
                  </div>
                </div>

                {/* SECTION 2: Web & Online Presence */}
                {selectedCompany.website && (
                  <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                        Official Website
                      </span>
                      <a
                        href={
                          selectedCompany.website.startsWith("http")
                            ? selectedCompany.website
                            : `https://${selectedCompany.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-blue-600 hover:underline truncate block"
                      >
                        {selectedCompany.website}
                      </a>
                    </div>
                    <a
                      href={
                        selectedCompany.website.startsWith("http")
                          ? selectedCompany.website
                          : `https://${selectedCompany.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition shrink-0"
                      title="Visit Website"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* SECTION 3: Physical Address & Location */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Office Address & Coordinates
                    </span>
                    {selectedCompany.location && (
                      <span className="text-[11px] bg-slate-200/80 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                        {selectedCompany.location}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {selectedCompany.address || "Address not provided"}
                  </p>

                  {/* GPS Coordinates & Google Maps Link */}
                  <div className="pt-2 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {selectedCompany.latitude && selectedCompany.longitude ? (
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                        <Compass className="w-3 h-3 text-emerald-600" />
                        {Number(selectedCompany.latitude).toFixed(4)}, {Number(selectedCompany.longitude).toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">GPS not verified</span>
                    )}

                    <a
                      href={
                        selectedCompany.latitude && selectedCompany.longitude
                          ? `https://www.google.com/maps/search/?api=1&query=${selectedCompany.latitude},${selectedCompany.longitude}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedCompany.address || selectedCompany.name)}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-bold transition"
                    >
                      <Navigation className="w-3 h-3" /> Open in Maps ↗
                    </a>
                  </div>
                </div>

                {/* SECTION 4: About / Description */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-xs font-bold text-slate-800 block">About Company</span>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {selectedCompany.description ||
                      "No detailed company description added yet. Edit the company to include background, industry domain, and perks."}
                  </p>
                </div>

                {/* SECTION 5: Active Job Postings */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      Job Openings ({selectedCompany.jobs?.length || 0})
                    </span>
                    <Link
                      href={route("admin.jobs.index")}
                      className="text-[11px] text-blue-600 hover:underline font-bold"
                    >
                      All Jobs →
                    </Link>
                  </div>

                  {selectedCompany.jobs && selectedCompany.jobs.length > 0 ? (
                    selectedCompany.jobs.map((job) => (
                      <div
                        key={job.uuid}
                        className="border border-slate-200 rounded-2xl p-3.5 bg-white hover:border-blue-300 transition shadow-xs space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-gray-900 text-xs leading-tight">{job.title}</p>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                              job.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {job.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                          {job.openings && <span>{job.openings} Openings</span>}
                          {job.job_type && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{job.job_type.replace("_", " ")}</span>
                            </>
                          )}
                          {job.salary && (
                            <>
                              <span>•</span>
                              <span className="font-bold text-slate-700">{job.salary}</span>
                            </>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">{job.location || selectedCompany.location}</span>
                          <Link
                            href={route("admin.jobs.index")}
                            className="text-[11px] text-blue-600 hover:underline font-bold"
                          >
                            View Applicants →
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                      <Briefcase className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-slate-500" />
                      <p className="text-xs font-medium">No active jobs posted under this company.</p>
                      {can("create_jobs") && (
                        <Link
                          href={route("admin.jobs.index")}
                          className="mt-2 inline-block text-[11px] font-bold text-blue-600 hover:underline"
                        >
                          + Post a Job for this Company
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Fixed Footer: Quick Administrative Actions */}
              <div className="p-4 border-t border-slate-200 bg-slate-50/90 backdrop-blur-xs flex items-center gap-2 shrink-0 z-10">
                {can("edit_companies") && (
                  <button
                    type="button"
                    onClick={() => openEditModal(selectedCompany)}
                    className="flex-1 py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Company
                  </button>
                )}
                {can("status_companies") && (
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(selectedCompany.uuid)}
                    className={`flex-1 py-2.5 px-3 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                      selectedCompany.status === "active"
                        ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {selectedCompany.status === "active" ? "Pause Hiring" : "Activate"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Companies.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;