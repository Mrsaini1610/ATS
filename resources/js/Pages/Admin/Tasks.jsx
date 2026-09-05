import React, { useState } from "react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";
import { Head, usePage, useForm, router } from "@inertiajs/react";
import {
  Plus,
  CheckCircle2,
  X,
  Clock,
  MapPin,
  Users,
  ClipboardList,
} from "lucide-react";

const PRIORITY_COLOR = {
  high: "bg-red-50 text-red-600 border-red-200",
  medium: "bg-yellow-50 text-yellow-600 border-yellow-200",
  low: "bg-green-50 text-green-600 border-green-200",
};

const STATUS_COLOR = {
  pending: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-50 text-blue-700",
  done: "bg-green-50 text-green-700",
  overdue: "bg-red-50 text-red-600",
};

export default function Tasks({ tasks = [], teamMembers = [] }) {
  const { auth, flash } = usePage().props;
  const currentUser = auth?.admin;
  const isTeamMember = currentUser?.role === "team_member"; 
  const canAssign = currentUser?.role === "super_admin" || currentUser?.role === "admin";

  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);

  const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
    dueDate: "",
    area: "",
    notes: "",
  });

  const activeTeamMembers = teamMembers.filter(
    (m) => (m.role === "team_member" || m.role === "admin") 
  );

  const openAddModal = () => {
    clearErrors();
    reset();
    setModalOpen(true);
  };

  const closeAddModal = () => {
    setModalOpen(false);
    reset();
    clearErrors();
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    post(route("admin.tasks.store"), {
      preserveScroll: true,
      onSuccess: () => closeAddModal(),
    });
  };

  const updateStatus = (uuid, status) => {
    router.post(
      route("admin.tasks.update-status", uuid),
      { status },
      { preserveScroll: true }
    );
  };

  // Filter tasks if logged in as team member
  const myTasks = isTeamMember
    ? tasks.filter((t) => String(t.assignedTo) === String(currentUser?.id))
    : tasks;

  const filtered = myTasks.filter(
    (t) => statusFilter === "all" || t.status === statusFilter
  );

  return (
    <>
      <Head title="Task Management - ATS Admin" />

      <div className="p-6">
        {flash?.success && (
          <div className="mb-5 flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> {flash.success}
          </div>
        )}

        {/* New Task Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100">
              <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900">Assign New Task</h3>
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData("title", e.target.value)}
                    placeholder="e.g. Call verified leads queue for Jaipur branch"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    rows={3}
                    placeholder="Provide detailed instructions and scope..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Assign To *
                    </label>
                    <select
                      value={data.assignedTo}
                      onChange={(e) => setData("assignedTo", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select staff member</option>
                      {activeTeamMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.role?.replace("_", " ")})
                        </option>
                      ))}
                    </select>
                    {errors.assignedTo && (
                      <p className="text-xs text-red-500 mt-1">{errors.assignedTo}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={data.dueDate}
                      onChange={(e) => setData("dueDate", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Area / Zone
                  </label>
                  <input
                    type="text"
                    value={data.area}
                    onChange={(e) => setData("area", e.target.value)}
                    placeholder="e.g. Jaipur"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={data.notes}
                    onChange={(e) => setData("notes", e.target.value)}
                    rows={2}
                    placeholder="Specific follow-up points..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 cursor-pointer shadow-md shadow-blue-600/30"
                  >
                    {processing ? "Assigning..." : "Assign Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">
              {isTeamMember ? "My Assigned Tasks" : "Task Management"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {filtered.length} tasks in database ·{" "}
              {tasks.filter((t) => t.status === "in_progress").length} in progress
            </p>
          </div>

          {canAssign && (
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Assign Task
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {[
            ["all", "All"],
            ["pending", "Pending"],
            ["in_progress", "In Progress"],
            ["done", "Completed"],
            ["overdue", "Overdue"],
          ].map(([k, l]) => (
            <button
              type="button"
              key={k}
              onClick={() => setStatusFilter(k)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                statusFilter === k
                  ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {l} ({(k === "all" ? myTasks : myTasks.filter((t) => t.status === k)).length})
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filtered.map((task) => (
            <div
              key={task.uuid}
              className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow shadow-xs"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    task.priority === "high"
                      ? "bg-red-100"
                      : task.priority === "medium"
                      ? "bg-yellow-100"
                      : "bg-green-100"
                  }`}
                >
                  <ClipboardList
                    className={`w-4 h-4 ${
                      task.priority === "high"
                        ? "text-red-600"
                        : task.priority === "medium"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-gray-900 text-base">{task.title}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold border capitalize ${
                          PRIORITY_COLOR[task.priority] || "bg-gray-100"
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${
                          STATUS_COLOR[task.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {(task.status || "pending").replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-500 mb-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    {!isTeamMember && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        Assigned to:{" "}
                        <strong className="text-gray-700">{task.assignedToName}</strong>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      Due: {task.dueDate || "No deadline"}
                    </span>
                    {task.area && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {task.area}
                      </span>
                    )}
                  </div>

                  {task.notes && (
                    <p className="text-xs text-gray-400 mt-2 italic">Note: {task.notes}</p>
                  )}
                </div>
              </div>

              {/* Status Action Buttons */}
              {task.status !== "done" && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  {task.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(task.uuid, "in_progress")}
                      className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 cursor-pointer transition"
                    >
                      Start Task
                    </button>
                  )}
                  {task.status === "in_progress" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(task.uuid, "done")}
                      className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 cursor-pointer transition"
                    >
                      Mark Completed
                    </button>
                  )}
                  {canAssign && task.status !== "overdue" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(task.uuid, "overdue")}
                      className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 cursor-pointer transition"
                    >
                      Mark Overdue
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-2 opacity-40" />
              <p className="text-gray-500 font-medium">No tasks found in database</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Tasks.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;