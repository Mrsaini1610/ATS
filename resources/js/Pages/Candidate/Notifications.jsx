import { useState } from "react";
import { Link } from "@inertiajs/react";
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
} from "lucide-react";

const INITIAL = [
  {
    id: 1,
    type: "shortlisted",
    title: "You've been Shortlisted! 🎉",
    body: "Razorpay has shortlisted you for the UI/UX Designer role. Check your email for next steps.",
    time: "2 hours ago",
    read: false,
    icon: Star,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: 2,
    type: "job_match",
    title: "New Job Match: Flutter Developer",
    body: "CRED is hiring a Flutter Developer in Bengaluru matching your profile — ₹16L-26L. Apply now before it closes!",
    time: "4 hours ago",
    read: false,
    icon: Briefcase,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: 3,
    type: "application",
    title: "Application Viewed",
    body: "TechMahindra has viewed your application for Senior React Developer. Stay tuned!",
    time: "Yesterday",
    read: false,
    icon: CheckCircle2,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    id: 4,
    type: "message",
    title: "Message from PhonePe HR",
    body: "Hi, we reviewed your profile and would like to schedule a technical screening call. Are you available this week?",
    time: "Yesterday",
    read: false,
    icon: MessageSquare,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    id: 5,
    type: "saved_alert",
    title: "Saved Job Expiring Soon",
    body: "Your saved job 'Data Scientist at PhonePe' will close applications in 2 days. Don't miss it!",
    time: "2 days ago",
    read: true,
    icon: Clock,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    id: 6,
    type: "job_match",
    title: "5 New Jobs in IT & Software",
    body: "New openings from Infosys, Wipro and Meesho match your profile. Browse them before others do.",
    time: "2 days ago",
    read: true,
    icon: TrendingUp,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: 7,
    type: "tip",
    title: "Profile Tip: Add Work Experience",
    body: "Candidates with complete work history get 3x more interview calls. Update your profile now.",
    time: "3 days ago",
    read: true,
    icon: Award,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  {
    id: 8,
    type: "application",
    title: "Application Submitted Successfully",
    body: "Your application for 'DevOps Engineer' at Infosys, Pune has been submitted. Ref #JP-2026-0748.",
    time: "4 days ago",
    read: true,
    icon: CheckCircle2,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: 9,
    type: "job_match",
    title: "Remote Python Role — ₹20L+",
    body: "Meesho is hiring a Python Backend Developer remotely. Full remote, stock options included!",
    time: "5 days ago",
    read: true,
    icon: Briefcase,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    id: 10,
    type: "tip",
    title: "Weekend Career Tip",
    body: "Did you know? Adding a portfolio link to your profile increases recruiter reach by 60%. Add yours today.",
    time: "6 days ago",
    read: true,
    icon: Star,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
  },
];

const TABS = ["All", "Unread", "Jobs", "Applications", "Tips"];

export default function Notifications() {
  const [notifications, setNotifications] = useState(INITIAL);
  const [activeTab, setActiveTab] = useState("All");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (activeTab === "Unread") return !n.read;
    if (activeTab === "Jobs") return n.type === "job_match" || n.type === "saved_alert";
    if (activeTab === "Applications")
      return n.type === "application" || n.type === "shortlisted" || n.type === "message";
    if (activeTab === "Tips") return n.type === "tip";
    return true;
  });

  const markRead = (id) =>
    setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllRead = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  const deleteN = (id) => setNotifications((p) => p.filter((n) => n.id !== id));
  const clearAll = () => setNotifications([]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm bg-blue-600 text-white px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Stay updated on your job search</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 bg-red-50 text-red-500 rounded-xl text-xs hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === t
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"
            }`}
          >
            {t}
            {t === "Unread" && unreadCount > 0 && ` (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-500">No notifications here</p>
          <p className="text-sm text-gray-400 mt-1">
            We'll notify you when something important happens
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const IconComponent = n.icon;
            return (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`relative bg-white rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-sm group ${
                  !n.read ? "border-blue-200 bg-blue-50/30" : "border-gray-100"
                }`}
              >
                {/* Unread dot */}
                {!n.read && (
                  <span className="absolute top-4 right-12 w-2 h-2 bg-blue-600 rounded-full" />
                )}

                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 ${n.iconBg} rounded-xl flex items-center justify-center shrink-0`}
                  >
                    <IconComponent className={`w-5 h-5 ${n.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${
                        n.read ? "font-medium text-gray-700" : "font-semibold text-gray-900"
                      }`}
                    >
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {n.time}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteN(n.id);
                    }}
                    className="shrink-0 p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Settings link */}
      <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-800">Notification Preferences</p>
            <p className="text-xs text-gray-400">Manage what alerts you receive</p>
          </div>
        </div>
        <Link href="/settings" className="text-xs text-blue-600 hover:underline font-medium">
          Manage →
        </Link>
      </div>
    </div>
  );
}