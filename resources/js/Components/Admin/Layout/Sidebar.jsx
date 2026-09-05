import React from "react";
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
  const { url, auth } = usePage();
  const admin = auth?.admin;
  
  // Debugging: Check what data is coming from backend session
  console.log("Inertia Auth Admin:", admin);

  // Agar admin login nahi hai ya role nahi mil raha, tabhi fallback chale warna exact role lein
  const role = admin?.role ? admin.role : "super_admin"; 

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar Left */}
      <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col shrink-0 h-full border-r border-slate-800">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-base leading-tight tracking-wide">
              WorkIndia
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">Admin Panel</p>
          </div>
        </div>

        {/* User Card - Dynamic Data */}
        <div className="p-3 mx-3 my-2 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
            {(admin?.name || "TM").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">
              {admin?.name || "Team Member"}
            </p>
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 capitalize border border-purple-500/30">
              {role.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = url.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
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
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between shrink-0">
          <div className="text-sm font-semibold text-gray-500 capitalize">
            {role.replace("_", " ")} Portal
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/notifications"
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
            </Link>
            <Link
              href="/admin/profile"
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
              title="My Profile"
            >
              <User className="w-5 h-5" />
            </Link>
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
