import React, { useState, useEffect } from "react";
import { Link, Head, router, usePage } from "@inertiajs/react";
import HomepageLayout from "@/Layouts/HomepageLayout";
import {
  Bell,
  BellOff,
  Briefcase,
  CheckCircle2,
  Clock,
  Star,
  TrendingUp,
  MessageSquare,
  Award,
  Trash2,
  Check,
  Calendar,
  Sparkles,
  ArrowRight,
  BookmarkCheck,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import axios from "axios";

const TYPE_CONFIG = {
  shortlisted: {
    icon: Star,
    iconBg: "bg-emerald-50 border-emerald-100",
    iconColor: "text-emerald-600",
    badge: "Shortlisted",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  interview: {
    icon: Calendar,
    iconBg: "bg-indigo-50 border-indigo-100",
    iconColor: "text-indigo-600",
    badge: "Interview",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  application: {
    icon: CheckCircle2,
    iconBg: "bg-blue-50 border-blue-100",
    iconColor: "text-blue-600",
    badge: "Application",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  job_match: {
    icon: Briefcase,
    iconBg: "bg-sky-50 border-sky-100",
    iconColor: "text-sky-600",
    badge: "Job Match",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  saved_alert: {
    icon: BookmarkCheck,
    iconBg: "bg-amber-50 border-amber-100",
    iconColor: "text-amber-600",
    badge: "Saved Job",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  tip: {
    icon: Award,
    iconBg: "bg-purple-50 border-purple-100",
    iconColor: "text-purple-600",
    badge: "Career Tip",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  message: {
    icon: MessageSquare,
    iconBg: "bg-teal-50 border-teal-100",
    iconColor: "text-teal-600",
    badge: "Message",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
  },
  system: {
    icon: Bell,
    iconBg: "bg-gray-50 border-gray-200",
    iconColor: "text-gray-600",
    badge: "Alert",
    badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
  },
};

export default function Notifications({
  initialNotifications = [],
  initialUnreadCount = 0,
  initialCounts = {},
}) {
  const { flash } = usePage().props;
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState("All");
  const [processingId, setProcessingId] = useState(null);

  // Keep state synced when props refresh
  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const counts = {
    All: notifications.length,
    Unread: unreadCount,
    Jobs: notifications.filter((n) =>
      ["job_match", "saved_alert"].includes(n.type)
    ).length,
    Applications: notifications.filter((n) =>
      ["application", "shortlisted", "interview", "message"].includes(n.type)
    ).length,
    Tips: notifications.filter((n) => n.type === "tip").length,
  };

  const tabs = [
    { key: "All", label: "All", count: counts.All },
    { key: "Unread", label: "Unread", count: counts.Unread },
    { key: "Applications", label: "Applications", count: counts.Applications },
    { key: "Jobs", label: "Job Alerts", count: counts.Jobs },
    { key: "Tips", label: "Tips & Growth", count: counts.Tips },
  ];

  const filtered = notifications.filter((n) => {
    if (activeTab === "Unread") return !n.read;
    if (activeTab === "Jobs")
      return ["job_match", "saved_alert"].includes(n.type);
    if (activeTab === "Applications")
      return ["application", "shortlisted", "interview", "message"].includes(
        n.type
      );
    if (activeTab === "Tips") return n.type === "tip";
    return true;
  });

  // Mark single notification as read & optionally navigate
  const handleNotificationClick = (item, shouldNavigate = true) => {
    if (!item.read) {
      // Optimistic UI update
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );

      // Async backend call
      const readUrl = typeof route === "function"
        ? route("notifications.read", item.id)
        : `/notifications/${item.id}/read`;

      axios.post(readUrl).catch((err) => {
        console.error("Failed to mark notification read", err);
      });
    }

    if (shouldNavigate && item.action_url) {
      router.visit(item.action_url);
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    const markAllUrl = typeof route === "function"
      ? route("notifications.read-all")
      : "/notifications/read-all";

    router.post(markAllUrl, {}, {
      preserveScroll: true,
      preserveState: true,
    });
  };

  // Delete single notification
  const handleDelete = (e, item) => {
    e.stopPropagation();
    setProcessingId(item.id);

    // Optimistic removal
    setNotifications((prev) => prev.filter((n) => n.id !== item.id));

    const destroyUrl = typeof route === "function"
      ? route("notifications.destroy", item.id)
      : `/notifications/${item.id}`;

    router.delete(destroyUrl, {
      preserveScroll: true,
      preserveState: true,
      onFinish: () => setProcessingId(null),
    });
  };

  // Clear all notifications
  const handleClearAll = () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) {
      return;
    }

    setNotifications([]);

    const clearUrl = typeof route === "function"
      ? route("notifications.clear")
      : "/notifications";

    router.delete(clearUrl, {
      preserveScroll: true,
      preserveState: true,
    });
  };

  return (
    <HomepageLayout>
      <Head title="Notifications - ATS.com Candidate Portal" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Flash Message Banner */}
        {flash?.success && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm text-emerald-800 flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{flash.success}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full shadow-2xs">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Live updates on your job applications, interview schedules, and personalized job alerts
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-blue-600" />
                <span>Mark all read</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-xs font-semibold text-red-600 shadow-2xs transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive
                        ? "bg-blue-700 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-gray-100 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3.5">
              <BellOff className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              {activeTab === "Unread"
                ? "You're All Caught Up!"
                : "No Notifications Found"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
              {activeTab === "Unread"
                ? "There are no unread notifications right now. Check back soon for application updates!"
                : "You don't have any notifications in this category yet. When recruiters respond or new jobs match, they will appear here."}
            </p>
            <div className="mt-5">
              <Link
                href="/job-search"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-2xs"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Explore Live Jobs</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((item) => {
              const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.system;
              const IconComp = config.icon;
              const isUnread = !item.read;

              return (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item, true)}
                  className={`relative group bg-white rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer hover:shadow-xs flex items-start gap-3.5 sm:gap-4 ${
                    isUnread
                      ? "border-blue-200 bg-blue-50/20"
                      : "border-gray-100/90 hover:border-gray-200"
                  }`}
                >
                  {/* Left: Type Icon */}
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border flex items-center justify-center shrink-0 ${config.iconBg} ${config.iconColor}`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>

                  {/* Middle: Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${config.badgeClass}`}
                      >
                        {config.badge}
                      </span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </span>
                      {isUnread && (
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>

                    <h4
                      className={`text-sm tracking-tight leading-snug ${
                        isUnread
                          ? "font-bold text-gray-900"
                          : "font-semibold text-gray-800"
                      }`}
                    >
                      {item.title}
                    </h4>

                    <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2 sm:line-clamp-none">
                      {item.body}
                    </p>

                    {/* Action link */}
                    {item.action_url && (
                      <div className="mt-2.5 flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition">
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    )}
                  </div>

                  {/* Right Actions: Delete */}
                  <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 flex items-center gap-1">
                    <button
                      type="button"
                      title="Delete notification"
                      disabled={processingId === item.id}
                      onClick={(e) => handleDelete(e, item)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Links Card */}
        <div className="mt-10 p-5 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/40 rounded-3xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                Track Application Status Directly
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                View shortlists, interview invites, and recruiter status in My Applications
              </p>
            </div>
          </div>
          <Link
            href="/my-applications"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/80 shadow-2xs transition shrink-0"
          >
            <span>My Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </HomepageLayout>
  );
}