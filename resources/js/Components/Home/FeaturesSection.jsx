import { Link } from "@inertiajs/react";
import { Search, FileText, BookmarkPlus, Bell, ChevronRight } from "lucide-react";

const quickActions = [
  { label: "Browse Jobs", to: "/job-search", icon: Search, color: "bg-blue-600" },
  { label: "Applications", to: "", icon: FileText, color: "bg-purple-600" },
  { label: "Saved Jobs", to: "", icon: BookmarkPlus, color: "bg-green-600" },
  { label: "Alerts", to: "", icon: Bell, color: "bg-orange-500" },
];

export default function FeaturesSection({ categories = [] }) {
  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((a) => (
            <Link key={a.to} href={a.to} className="flex flex-col items-center p-3 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all group text-center">
              <div className={`w-12 h-12 ${a.color} rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform mb-2`}>
                <a.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-800">{a.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Browse by Category</h2>
            <p className="text-xs text-gray-500">Explore jobs by specialized domains</p>
          </div>
          <Link href="/categories" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <Link key={cat.label} href={cat.to || "/categories"} className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-blue-200 hover:bg-blue-50/40 transition-all text-center group">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{cat.icon || "💼"}</div>
                <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">{cat.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{cat.count} jobs</p>
              </Link>
            ))
          ) : (
            <p className="text-xs text-gray-500 col-span-full">No categories available.</p>
          )}
        </div>
      </section>
    </div>
  );
}