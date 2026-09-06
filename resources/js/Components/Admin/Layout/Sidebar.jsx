import React, { useState, useRef, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
  LayoutDashboard,
  Briefcase,
  ClipboardList,
  Users,
  Calendar,
  UserCog,
  Megaphone,
  Building2,
  Tags,
  Zap,
  Shield,
  LogOut,
  ChevronRight,
  Bell,
  User,
  ChevronDown,
  Menu,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/jobs", label: "Job Posts", icon: Briefcase, roles: ["super_admin", "admin"] },
  { href: "/admin/applications", label: "Applications", icon: ClipboardList },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["super_admin", "admin"] },
  { href: "/admin/interviews", label: "Interviews", icon: Calendar },
  { href: "/admin/tasks", label: "Tasks", icon: ClipboardList, roles: ["super_admin", "admin", "team_member"] },
  { href: "/admin/team", label: "Staff & Team", icon: UserCog, roles: ["super_admin"] },
  { href: "/admin/bulk", label: "Bulk Messages", icon: Megaphone, roles: ["super_admin", "admin"] },
  { href: "/admin/companies", label: "Companies", icon: Building2, roles: ["super_admin", "admin"] },
  { href: "/admin/categories", label: "Categories", icon: Tags, roles: ["super_admin", "admin"] },
  { href: "/admin/skills", label: "Skills", icon: Zap, roles: ["super_admin", "admin"] },
  { href: "/admin/permissions", label: "Permissions", icon: Shield, roles: ["super_admin"] },
];

export default function SidebarLayout({ children }) {
  const { url, props } = usePage();
  const auth = props?.auth;
  const admin = auth?.admin;
  
  const role = admin?.role || "team_member";

  // Sidebar Collapse/Expand State
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Dropdown open/close state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar Left */}
      <aside className={`${isCollapsed ? "w-20" : "w-64"} bg-[#0f172a] text-slate-300 flex flex-col shrink-0 h-full border-r border-slate-800 transition-all duration-300`}>
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h2 className="font-black text-white text-base leading-tight tracking-wide">
                ATS
              </h2>
              <p className="text-[11px] text-slate-400 font-semibold">Recruitment Panel</p>
            </div>
          )}
        </div>

        {/* User Card - Dynamic Data */}
        {!isCollapsed && (
          <div className="p-3 mx-3 my-2 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shrink-0">
              {admin?.name ? admin.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "TM"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-white truncate">
                {admin?.name || "Team Member"}
              </p>
              <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md capitalize border ${
                role === 'super_admin' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                role === 'admin' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {role.replace("_", " ")}
              </span>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = url.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                title={isCollapsed ? item.label : ""}
                className={`flex items-center ${isCollapsed ? "justify-center px-2" : "justify-between px-3.5"} py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
                {!isCollapsed && isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-slate-800/80">
          <Link
            href="/admin/logout"
            method="post"
            as="button"
            title={isCollapsed ? "Sign Out" : ""}
            className={`w-full flex items-center ${isCollapsed ? "justify-center px-2" : "px-3.5"} py-2.5 rounded-xl text-sm font-extrabold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer text-left`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="ml-3">Sign Out</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between shrink-0 relative">
          <div className="flex items-center gap-4">
            {/* Hamburger Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-black text-gray-900 leading-tight">
                {(() => {
                  if (url.startsWith("/admin/dashboard") || url === "/admin") return "Dashboard";
                  if (url.startsWith("/admin/jobs")) return "Job Posts";
                  if (url.startsWith("/admin/applications")) return "Applications";
                  if (url.startsWith("/admin/users")) return "Users";
                  if (url.startsWith("/admin/interviews")) return "Interviews";
                  if (url.startsWith("/admin/tasks")) return "Tasks";
                  if (url.startsWith("/admin/team")) return "Staff & Team";
                  if (url.startsWith("/admin/bulk")) return "Bulk Messages";
                  if (url.startsWith("/admin/companies")) return "Companies";
                  if (url.startsWith("/admin/categories")) return "Categories";
                  if (url.startsWith("/admin/skills")) return "Skills";
                  if (url.startsWith("/admin/permissions")) return "Permissions";
                  if (url.startsWith("/admin/profile")) return "My Profile";
                  if (url.startsWith("/admin/notifications")) return "Notifications";
                  return "Admin Portal";
                })()}
              </h1>
              <p className="text-[11px] text-gray-400 font-semibold">ATS Admin · IN</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Icon */}
            <Link
              href="/admin/notifications"
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>

            {/* Profile Dropdown Container */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200/70 px-3 py-1.5 rounded-full transition cursor-pointer border border-gray-200/60"
              >
                <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-extrabold text-xs">
                  {admin?.name ? admin.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "TM"}
                </div>
                <span className="text-sm font-black text-gray-800">
                  {admin?.name ? admin.name.split(" ")[0] : "User"}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu Box */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50">
                  <div className="px-4 pb-3 border-b border-gray-100">
                    <p className="text-sm font-black text-gray-900 truncate">
                      {admin?.name || "Admin User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {admin?.email || "admin@ats.in"}
                    </p>
                    <div className="mt-2">
                      <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded capitalize ${
                        role === 'super_admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        role === 'admin' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {role.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 space-y-0.5 px-2">
                    <Link
                      href="/admin/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-xs font-extrabold text-gray-700 hover:bg-gray-50 rounded-xl transition"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/admin/notifications"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-xs font-extrabold text-gray-700 hover:bg-gray-50 rounded-xl transition"
                    >
                      <Bell className="w-4 h-4 text-gray-400" />
                      <span>Notifications</span>
                    </Link>
                  </div>

                  <div className="pt-2 mt-2 border-t border-gray-100 px-2">
                    <Link
                      href="/admin/logout"
                      method="post"
                      as="button"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-extrabold text-rose-600 hover:bg-rose-50 rounded-xl transition text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Body View */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}