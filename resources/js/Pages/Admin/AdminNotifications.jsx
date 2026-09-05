import React, { useState } from "react";
import SidebarLayout from "@/Components/Admin/Layout/Sidebar";

import { Head, usePage } from "@inertiajs/react";
import {
  Bell,
  CheckCircle2,
  Briefcase,
  ClipboardList,
  Users,
  Calendar,
  AlertCircle,
  Check,
  Trash2,
} from "lucide-react";

const TYPE_ICON = {
  job: Briefcase,
  application: ClipboardList,
  task: CheckCircle2,
  interview: Calendar,
  user: Users,
  alert: AlertCircle,
};

const TYPE_COLOR = {
  job: "bg-blue-100 text-blue-600",
  application: "bg-purple-100 text-purple-600",
  task: "bg-green-100 text-green-600",
  interview: "bg-amber-100 text-amber-600",
  user: "bg-teal-100 text-teal-600",
  alert: "bg-red-100 text-red-600",
};

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "job", label: "Jobs" },
  { key: "application", label: "Applications" },
  { key: "task", label: "Tasks" },
  { key: "user", label: "Users" },
];

export default function AdminNotifications({ notifications = [] }) {
  const { auth } = usePage().props;
  const admin = auth?.admin;

  // Default fallback data if backend notifications are not yet populated
  const defaultNotifs = [
    {
      id: "alert-1",
      type: "alert",
      title: "System Notice",
      body: "WorkIndia Admin Panel is ready with role-based access for Super Admin, Admin, and Calling Team.",
      time: "2026-08-20",
      read: false,
    },
    {
      id: "job-1",
      type: "job",
      title: "New Job Pending Review",
      body: '"Senior Telecaller" at Apex Corp needs approval',
      time: "2026-08-25",
      read: false,
    },
    {
      id: "app-1",
      type: "application",
      title: "New Application",
      body: "Rahul Sharma applied for Customer Support at Tech Solutions",
      time: "2026-08-28",
      read: true,
    },
  ];

  const [notifs, setNotifs] = useState(
    notifications.length > 0 ? notifications : defaultNotifs
  );
  const [filter, setFilter] = useState("all");

  const markRead = (id) => {
    setNotifs((prev) =>
      prev.map((x) => (x.id === id ? { ...x, read: true } : x))
    );
  };

  const markAllRead = () => {
    setNotifs((prev) => prev.map((x) => ({ ...x, read: true })));
  };

  const deleteNotif = (id) => {
    setNotifs((prev) => prev.filter((x) => x.id !== id));
  };

  const filtered = notifs.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "all") return true;
    return n.type === filter;
  });

  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <>
      <Head title="Notifications - WorkIndia Admin" />

      <div className="p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" /> Notifications
              {unreadCount > 0 && (
                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {notifs.length} total · {unreadCount} unread
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
          {FILTER_TABS.map(({ key, label }) => {
            const count =
              key === "all"
                ? notifs.length
                : key === "unread"
                ? unreadCount
                : notifs.filter((n) => n.type === key).length;

            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  filter === key
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {filtered.map((n) => {
            const Icon = TYPE_ICON[n.type] || AlertCircle;
            return (
              <div
                key={n.id}
                className={`group flex gap-4 p-4 rounded-2xl border transition-all hover:shadow-sm ${
                  n.read
                    ? "bg-white border-gray-100"
                    : "bg-blue-50/50 border-blue-100"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    TYPE_COLOR[n.type] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => !n.read && markRead(n.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm font-semibold ${
                        n.read ? "text-gray-700" : "text-gray-900"
                      }`}
                    >
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {n.body}
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5">{n.time}</p>
                </div>

                <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.read && (
                    <button
                      onClick={() => markRead(n.id)}
                      title="Mark read"
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotif(n.id)}
                    title="Delete"
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 font-medium">No notifications</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Layout wrapper
AdminNotifications.layout = (page) => <SidebarLayout>{page}</SidebarLayout>;
