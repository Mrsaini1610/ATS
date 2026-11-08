import React from "react";
import { Link, router } from "@inertiajs/react";
import { Flame, TrendingUp, ArrowRight, Zap } from "lucide-react";

export default function TrendingSkillsSection({ trendingSkills = [] }) {
  // Fallback popular skills if list is small
  const defaultSkills = [
    { name: "Telecalling & BPO", demand: "high", category: "Calling" },
    { name: "Field Sales", demand: "high", category: "Sales" },
    { name: "Customer Support", demand: "high", category: "Support" },
    { name: "React.js", demand: "high", category: "IT" },
    { name: "Digital Marketing", demand: "high", category: "Marketing" },
    { name: "Data Entry & Excel", demand: "medium", category: "Back Office" },
    { name: "Accounting & Tally", demand: "medium", category: "Finance" },
    { name: "PHP & Laravel", demand: "high", category: "IT" },
    { name: "Java Programming", demand: "medium", category: "Software" },
    { name: "Graphic Design", demand: "medium", category: "Creative" },
  ];

  const displaySkills = trendingSkills.length > 0 ? trendingSkills : defaultSkills;

  const handleSkillClick = (skillName) => {
    try {
      sessionStorage.setItem(
        "ats_job_filter",
        JSON.stringify({ search: skillName })
      );
    } catch (e) {
      // Ignore sessionStorage error
    }
    router.visit("/job-search");
  };

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-1.5 shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
            <span>Market Demand</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Top Trending Skills
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Skills actively sought by recruiters with the fastest hiring cycles
          </p>
        </div>

        <Link
          href="/job-search"
          className="inline-flex items-center gap-1 text-xs sm:text-sm text-blue-600 font-bold hover:text-blue-700 self-start sm:self-auto"
        >
          View all jobs <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {displaySkills.map((skill, idx) => {
          const isHigh = skill.demand === "high";

          return (
            <button
              key={skill.id || idx}
              type="button"
              onClick={() => handleSkillClick(skill.name)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all hover:scale-105 group cursor-pointer text-left ${
                isHigh
                  ? "bg-white border-rose-100 hover:border-rose-300 hover:shadow-md hover:bg-rose-50/30"
                  : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                  isHigh ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                }`}
              >
                {isHigh ? <Zap className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
              </div>

              <span className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                {skill.name}
              </span>

              {isHigh && (
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 shrink-0">
                  Hot
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
