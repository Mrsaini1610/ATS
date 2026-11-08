import React from "react";
import { Link, router } from "@inertiajs/react";
import { ChevronRight } from "lucide-react";

export default function FeaturesSection({ categories = [] }) {
  const handleCategoryClick = (categoryName) => {
    try {
      sessionStorage.setItem(
        "ats_job_filter",
        JSON.stringify({ category: categoryName })
      );
    } catch (e) {
      // Ignore sessionStorage error
    }
    router.visit("/job-search");
  };

  return (
    <div>
      {/* Categories Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Browse by Category</h2>
            <p className="text-xs text-gray-500">Explore jobs by specialized domains</p>
          </div>
          <Link
            href="/categories"
            className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.filter((cat) => (Number(cat.count) || 0) > 0).length > 0 ? (
            categories.filter((cat) => (Number(cat.count) || 0) > 0).map((cat) => (
              <button
                key={cat.id || cat.label}
                type="button"
                onClick={() => handleCategoryClick(cat.label)}
                className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-blue-200 hover:bg-blue-50/40 transition-all text-center group cursor-pointer"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {cat.icon || "💼"}
                </div>
                <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                  {cat.label}
                </p>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {cat.count} {cat.count === 1 ? "job" : "jobs"}
                </p>
              </button>
            ))
          ) : (
            <p className="text-xs text-gray-500 col-span-full">No categories available.</p>
          )}
        </div>
      </section>
    </div>
  );
}
