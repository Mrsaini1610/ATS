import React, { useState } from "react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";
import { Head, usePage, useForm, router } from "@inertiajs/react";
import {
  Plus,
  CheckCircle2,
  X,
  Phone,
  Video,
  MapPin,
  Clock,
  Calendar,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

const STATUS_CFG = {
  scheduled: { label: "Scheduled", color: "bg-blue-50 text-blue-700" },
  done: { label: "Done", color: "bg-green-50 text-green-700" },
  no_show: { label: "No Show", color: "bg-red-50 text-red-600" },
  rescheduled: { label: "Rescheduled", color: "bg-yellow-50 text-yellow-700" },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-500" },
};

const MODE_ICON = { phone: Phone, video: Video, in_person: MapPin };

export default function Interviews({ interviews = [] }) {
  const { auth, flash } = usePage().props;
  const currentUser = auth?.admin;

  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [remarkText, setRemarkText] = useState("");

  const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
    applicationId: "",
    candidateName: "",
    candidatePhone: "",
    jobTitle: "",
    company: "",
    date: "",
    time: "",
    mode: "phone",
  });

  const openScheduleModal = () => {
    clearErrors();
    reset();
    setScheduleModal(true);
  };

  const closeScheduleModal = () => {
    setScheduleModal(false);
    reset();
    clearErrors();
  };

  const handleSchedule = (e) => {
    e.preventDefault();
    post(route("admin.interviews.store"), {
      preserveScroll: true,
      onSuccess: () => closeScheduleModal(),
    });
  };

  const updateStatus = (uuid, status) => {
    router.post(
      route("admin.interviews.update-status", uuid),
      { status },
      {
        preserveScroll: true,
        onSuccess: () => {
          if (selected?.uuid === uuid) {
            setSelected((prev) => (prev ? { ...prev, status } : null));
          }
        },
      }
    );
  };

  const saveRemark = (uuid, interestedVal = null) => {
    const payload = {};
    if (remarkText.trim()) payload.remark = remarkText;
    if (interestedVal !== null) payload.interested = interestedVal;

    router.post(
      route("admin.interviews.update-remark", uuid),
      payload,
      {
        preserveScroll: true,
        onSuccess: () => {
          if (selected?.uuid === uuid) {
            setSelected((prev) =>
              prev
                ? {
                    ...prev,
                    ...(payload.remark !== undefined && { remark: payload.remark }),
                    ...(payload.interested !== undefined && { interested: payload.interested }),
                  }
                : null
            );
          }
          setRemarkText("");
        },
      }
    );
  };

  const filtered = interviews.filter(
    (iv) => statusFilter === "all" || iv.status === statusFilter
  );

  return (
    <>
      <Head title="Interview Scheduling - ATS Admin" />

      <div className="p-6">
        {flash?.success && (
          <div className="mb-5 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> {flash.success}
          </div>
        )}

        {/* Schedule Modal */}
        {scheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900">Schedule Interview</h3>
                <button
                  type="button"
                  onClick={closeScheduleModal}
                  className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSchedule} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Candidate Name *
                  </label>
                  <input
                    type="text"
                    value={data.candidateName}
                    onChange={(e) => setData("candidateName", e.target.value)}
                    placeholder="e.g. Priya Mehta"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    autoFocus
                  />
                  {errors.candidateName && (
                    <p className="text-xs text-red-500 mt-1">{errors.candidateName}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={data.candidatePhone}
                      onChange={(e) => setData("candidatePhone", e.target.value)}
                      placeholder="+91 99001 12345"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Mode
                    </label>
                    <select
                      value={data.mode}
                      onChange={(e) => setData("mode", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="phone">Phone Call</option>
                      <option value="video">Video Call</option>
                      <option value="in_person">In Person</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={data.date}
                      onChange={(e) => setData("date", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {errors.date && (
                      <p className="text-xs text-red-500 mt-1">{errors.date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Time *
                    </label>
                    <input
                      type="time"
                      value={data.time}
                      onChange={(e) => setData("time", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {errors.time && (
                      <p className="text-xs text-red-500 mt-1">{errors.time}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={data.jobTitle}
                    onChange={(e) => setData("jobTitle", e.target.value)}
                    placeholder="e.g. Telecalling Executive"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={data.company}
                    onChange={(e) => setData("company", e.target.value)}
                    placeholder="e.g. Tech Solutions"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeScheduleModal}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 cursor-pointer shadow-md shadow-blue-600/30"
                  >
                    {processing ? "Scheduling..." : "Schedule"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Interviews</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {interviews.length} total ·{" "}
              {interviews.filter((i) => i.status === "scheduled").length} upcoming slots
            </p>
          </div>

          <button
            type="button"
            onClick={openScheduleModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Schedule Interview
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {[
            ["all", "All"],
            ...Object.entries(STATUS_CFG).map(([k, v]) => [k, v.label]),
          ].map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => setStatusFilter(k)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                statusFilter === k
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {l} (
              {(k === "all"
                ? interviews
                : interviews.filter((iv) => iv.status === k)
              ).length}
              )
            </button>
          ))}
        </div>

        <div className="flex gap-5">
          {/* Interview List */}
          <div className={`flex-1 ${selected ? "hidden lg:block" : ""} space-y-3`}>
            {filtered.map((iv) => {
              const ModeIcon = MODE_ICON[iv.mode] || Phone;
              return (
                <div
                  key={iv.uuid}
                  onClick={() => {
                    setSelected(iv);
                    setRemarkText(iv.remark || "");
                  }}
                  className={`bg-white border rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all ${
                    selected?.uuid === iv.uuid
                      ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/20"
                      : "border-gray-100 hover:border-blue-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        iv.status === "done"
                          ? "bg-green-100"
                          : iv.status === "cancelled"
                          ? "bg-gray-100"
                          : "bg-blue-100"
                      }`}
                    >
                      <ModeIcon
                        className={`w-5 h-5 ${
                          iv.status === "done"
                            ? "text-green-600"
                            : iv.status === "cancelled"
                            ? "text-gray-400"
                            : "text-blue-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <p className="font-bold text-gray-900">{iv.candidateName}</p>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize shrink-0 ${
                            STATUS_CFG[iv.status]?.color || "bg-gray-100"
                          }`}
                        >
                          {STATUS_CFG[iv.status]?.label || iv.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {iv.jobTitle} · {iv.company}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {iv.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {iv.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {iv.candidatePhone}
                        </span>
                      </div>
                      {iv.interested !== null && iv.interested !== undefined && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs mt-2 font-medium ${
                            iv.interested ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {iv.interested ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
                          {iv.interested ? "Interested" : "Not Interested"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No interviews scheduled in database</p>
              </div>
            )}
          </div>

          {/* Details Drawer */}
          {selected && (
            <div className="w-80 shrink-0 bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col max-h-[calc(100vh-120px)] sticky top-20 shadow-xs">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">Interview Details</h3>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-5 space-y-4">
                <div>
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold mb-3 shadow-md shadow-blue-600/30">
                    {(selected.candidateName || "U")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <p className="font-bold text-gray-900">{selected.candidateName}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5" />
                    {selected.candidatePhone}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm border border-gray-100">
                  <p>
                    <span className="text-gray-500 text-xs">Job:</span>{" "}
                    <span className="font-semibold text-gray-800">{selected.jobTitle}</span>
                  </p>
                  <p>
                    <span className="text-gray-500 text-xs">Company:</span>{" "}
                    <span className="font-semibold text-gray-800">{selected.company}</span>
                  </p>
                  <p>
                    <span className="text-gray-500 text-xs">Date:</span>{" "}
                    <span className="font-semibold text-gray-800">{selected.date}</span>
                  </p>
                  <p>
                    <span className="text-gray-500 text-xs">Time:</span>{" "}
                    <span className="font-semibold text-gray-800">{selected.time}</span>
                  </p>
                  <p>
                    <span className="text-gray-500 text-xs">Mode:</span>{" "}
                    <span className="font-semibold text-gray-800 capitalize">
                      {selected.mode.replace("_", " ")}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500 text-xs">Scheduled by:</span>{" "}
                    <span className="font-semibold text-gray-800">{selected.scheduledBy}</span>
                  </p>
                </div>

                <div>
                  <span
                    className={`text-sm font-bold px-3 py-1.5 rounded-xl inline-block ${
                      STATUS_CFG[selected.status]?.color || "bg-gray-100"
                    }`}
                  >
                    {STATUS_CFG[selected.status]?.label || selected.status}
                  </span>
                </div>

                {/* Candidate Interest Toggle */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Candidate Interest
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveRemark(selected.uuid, true)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium cursor-pointer transition ${
                        selected.interested === true
                          ? "bg-green-600 text-white"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" /> Interested
                    </button>
                    <button
                      type="button"
                      onClick={() => saveRemark(selected.uuid, false)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium cursor-pointer transition ${
                        selected.interested === false
                          ? "bg-red-600 text-white"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" /> Not Interested
                    </button>
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Update Status
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.keys(STATUS_CFG).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateStatus(selected.uuid, s)}
                        className={`text-xs py-1.5 rounded-xl font-medium border cursor-pointer transition ${
                          selected.status === s
                            ? STATUS_CFG[s].color + " ring-2 ring-blue-500"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {STATUS_CFG[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Remarks Section */}
                {selected.remark && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                    <p className="text-xs font-semibold text-yellow-700 mb-1">Remark</p>
                    <p className="text-sm text-yellow-800">{selected.remark}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Add Remark
                  </p>
                  <textarea
                    value={remarkText}
                    onChange={(e) => setRemarkText(e.target.value)}
                    rows={3}
                    placeholder="e.g. Round 1 cleared, scheduling Round 2..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                  />
                  <button
                    type="button"
                    onClick={() => saveRemark(selected.uuid, null)}
                    disabled={!remarkText.trim()}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    Save Remark
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Interviews.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;
