import React from "react";
import { Link } from "@inertiajs/react";
import { Search, FileText, BookmarkPlus, Bell } from "lucide-react";

const quickActions = [
  { label: "Browse Jobs", to: "/job-search", icon: Search, color: "bg-blue-600" },
  { label: "Applications", to: "/my-applications", icon: FileText, color: "bg-purple-600" },
  { label: "Saved Jobs", to: "/savedjobs", icon: BookmarkPlus, color: "bg-green-600" },
  { label: "Alerts", to: "/notifications", icon: Bell, color: "bg-orange-500" },
];

export default function QuickActionsSection() {
  return (
    <section>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {quickActions.map((a) => (
          <Link
            key={a.label}
            href={a.to}
            className="flex flex-col items-center p-3 sm:p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all group text-center cursor-pointer shadow-xs"
          >
            <div
              className={`w-12 h-12 ${a.color} rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform mb-2`}
            >
              <a.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-800">{a.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
