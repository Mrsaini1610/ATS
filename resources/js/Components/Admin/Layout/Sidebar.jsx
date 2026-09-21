import React, { useState, useRef, useEffect } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { useAlerts } from "@/Components/Alerts";
import { Toaster } from "react-hot-toast";
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
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/jobs", label: "Job Posts", icon: Briefcase, permissions: ["view_jobs", "create_jobs", "approve_jobs", "reject_jobs", "hold_jobs", "deactivate_jobs"] },
  { href: "/admin/applications", label: "Applications", icon: ClipboardList, permissions: ["view_applications", "update_application_status"] },
  { href: "/admin/users", label: "Users", icon: Users, permissions: ["view_users", "add_users", "status_users"] },
  { href: "/admin/interviews", label: "Interviews", icon: Calendar, permissions: ["view_interviews", "schedule_interviews", "status_interviews"] },
  { href: "/admin/tasks", label: "Tasks", icon: ClipboardList, permissions: ["view_tasks", "assign_tasks", "status_tasks"] },
  { href: "/admin/team", label: "Staff & Team", icon: UserCog, permissions: ["view_team_member", "create_team_member", "edit_team_member", "status_team_member", "delete_team_member"] },
  { href: "/admin/bulk", label: "Bulk Messages", icon: Megaphone, permissions: ["send_bulk_messages"] },
  { href: "/admin/companies", label: "Companies", icon: Building2, permissions: ["view_companies", "create_companies", "edit_companies", "status_companies", "delete_companies"] },
  { href: "/admin/categories", label: "Categories", icon: Tags, permissions: ["view_categories", "create_categories", "edit_categories", "status_categories", "delete_categories", "view_subcategories", "create_subcategories", "edit_subcategories", "status_subcategories", "delete_subcategories"] },
  { href: "/admin/skills", label: "Skills", icon: Zap, permissions: ["view_skills", "create_skills", "edit_skills", "status_skills", "delete_skills"] },
  { href: "/admin/permissions", label: "Permissions", icon: Shield, roles: ["super_admin"] },
];

export default function SidebarLayout({ children }) {
  const { url, props } = usePage();
  const auth = props?.auth;
  const admin = auth?.admin;
  const { successAlert, errorAlert, warningAlert, infoAlert } = useAlerts();

  const role = admin?.role || "team_member";
  const permissions = Array.isArray(admin?.permissions) ? admin.permissions : [];
  const canView = (item) =>
    role === "super_admin" ||
    (!item.roles || item.roles.includes(role)) &&
    (!item.permissions || item.permissions.some((permission) => permissions.includes(permission)));

  // Safely grab both Inertia and real browser path
  const browserPath = typeof window !== "undefined" ? window.location.pathname : "";
  const currentPath = (url && url !== "" ? url : browserPath).split("?")[0].split("#")[0];

  // Sidebar Collapse (Desktop) & Mobile Drawer State
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Dropdown open/close state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [currentPath]);

  const lastShownKeyRef = useRef(null);

  const triggerAlerts = (flash, messages) => {
    // 1. Standard Inertia flash props
    if (flash) {
      const msg = flash.success || flash.error || flash.warning || flash.info;
      if (msg) {
        const key = flash._key || `${msg}_${flash.success ? "s" : "e"}`;
        if (lastShownKeyRef.current !== key) {
          lastShownKeyRef.current = key;
          if (flash.success) successAlert(flash.success);
          if (flash.error) errorAlert(flash.error);
          if (flash.warning) warningAlert(flash.warning);
          if (flash.info) infoAlert(flash.info);
        }
      }
    }

    // 2. Messages/envelopes fallback if present
    if (messages?.envelopes && Array.isArray(messages.envelopes) && messages.envelopes.length > 0) {
      messages.envelopes.forEach(({ type, message }) => {
        if (!message) return;
        const envKey = `${type}_${message}`;
        if (lastShownKeyRef.current !== envKey) {
          lastShownKeyRef.current = envKey;
          if (type === "success") successAlert(message);
          else if (type === "error") errorAlert(message);
          else if (type === "warning") warningAlert(message);
          else if (type === "info") infoAlert(message);
        }
      });
    }
  };

  // 1. Trigger on initial page load / full browser reload
  useEffect(() => {
    triggerAlerts(props?.flash, props?.messages);
  }, [props?.flash?._key, props?.flash?.success, props?.flash?.error, props?.messages]);

  // 2. Trigger instantly on every Inertia action (save, toggle, delete) without needing reload
  useEffect(() => {
    const unregister = router.on("success", (event) => {
      const pageProps = event.detail.page?.props;
      if (pageProps?.flash || pageProps?.messages) {
        triggerAlerts(pageProps.flash, pageProps.messages);
      }
    });

    return () => unregister();
  }, [successAlert, errorAlert, warningAlert, infoAlert]);

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

  const visibleNav = NAV_ITEMS.filter(canView);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Toaster position="top-right" reverseOrder={false} gutter={8} />

      {/* Mobile Drawer Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs lg:hidden transition-opacity duration-300 cursor-pointer"
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Drawer on mobile/tablet, Collapsible column on desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#0f172a] text-slate-300 flex flex-col shrink-0 h-full border-r border-slate-800 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen
            ? "translate-x-0 w-72 max-w-[85vw] shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-3 overflow-hidden">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            {(!isCollapsed || mobileOpen) && (
              <div className="min-w-0">
                <h2 className="font-black text-white text-base leading-tight tracking-wide">
                  ATS
                </h2>
                <p className="text-[11px] text-slate-400 font-semibold truncate">Recruitment Panel</p>
              </div>
            )}
          </div>

          {/* Close button for Mobile Drawer */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl lg:hidden cursor-pointer shrink-0"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List (Scrollbar hidden) */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {visibleNav.map((item) => {
            const Icon = item.icon;

            // Force active layout for Dashboard if path matches dashboard or admin root
            let isActive = false;
            if (item.href === "/admin/dashboard") {
              isActive =
                currentPath === "" ||
                currentPath === "/" ||
                currentPath === "/admin" ||
                currentPath === "/admin/" ||
                currentPath.includes("dashboard");
            } else {
              isActive = currentPath.startsWith(item.href);
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={isCollapsed && !mobileOpen ? item.label : ""}
                className={`flex items-center ${
                  isCollapsed && !mobileOpen ? "lg:justify-center lg:px-2" : "justify-between px-3.5"
                } py-2.5 rounded-2xl text-sm font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-white/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent"
                }`}
              >
                <div className={`flex items-center gap-3 ${isCollapsed && !mobileOpen ? "lg:justify-center" : ""}`}>
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                  {(!isCollapsed || mobileOpen) && <span>{item.label}</span>}
                </div>
                {(!isCollapsed || mobileOpen) && isActive && <ChevronRight className="w-4 h-4 text-white/90 shrink-0" />}
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
            title={isCollapsed && !mobileOpen ? "Sign Out" : ""}
            className={`w-full flex items-center ${
              isCollapsed && !mobileOpen ? "lg:justify-center lg:px-2" : "px-3.5"
            } py-2.5 rounded-xl text-sm font-extrabold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer text-left`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {(!isCollapsed || mobileOpen) && <span className="ml-3">Sign Out</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 w-full">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-100 px-3 sm:px-6 flex items-center justify-between shrink-0 relative">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer lg:hidden shrink-0"
              title="Open Navigation"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Collapse Toggle Button */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer shrink-0"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <h1 className="text-sm font-black text-gray-900 leading-tight truncate">
                {(() => {
                  if (currentPath.includes("dashboard") || currentPath === "/admin" || currentPath === "/admin/" || currentPath === "/") return "Dashboard";
                  if (currentPath.startsWith("/admin/jobs")) return "Job Posts";
                  if (currentPath.startsWith("/admin/applications")) return "Applications";
                  if (currentPath.startsWith("/admin/users")) return "Users";
                  if (currentPath.startsWith("/admin/interviews")) return "Interviews";
                  if (currentPath.startsWith("/admin/tasks")) return "Tasks";
                  if (currentPath.startsWith("/admin/team")) return "Staff & Team";
                  if (currentPath.startsWith("/admin/bulk")) return "Bulk Messages";
                  if (currentPath.startsWith("/admin/companies")) return "Companies";
                  if (currentPath.startsWith("/admin/categories")) return "Categories";
                  if (currentPath.startsWith("/admin/skills")) return "Skills";
                  if (currentPath.startsWith("/admin/permissions")) return "Permissions";
                  if (currentPath.startsWith("/admin/profile")) return "My Profile";
                  if (currentPath.startsWith("/admin/notifications")) return "Notifications";
                  return "Admin Portal";
                })()}
              </h1>
              <p className="text-[11px] text-gray-400 font-semibold truncate hidden sm:block">ATS Admin · IN</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
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
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200/70 px-2.5 sm:px-3 py-1.5 rounded-full transition cursor-pointer border border-gray-200/60"
              >
                <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-extrabold text-xs shrink-0">
                  {admin?.name ? admin.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "TM"}
                </div>
                <span className="text-xs sm:text-sm font-black text-gray-800 max-w-[80px] sm:max-w-[120px] truncate">
                  {admin?.name ? admin.name.split(" ")[0] : "User"}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu Box */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 sm:w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50">
                  <div className="px-4 pb-3 border-b border-gray-100">
                    <p className="text-sm font-black text-gray-900 truncate">
                      {admin?.name || "Admin User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {admin?.email || "admin@ats.in"}
                    </p>
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
        <main className="flex-1 overflow-y-auto bg-gray-50/50 min-w-0 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
