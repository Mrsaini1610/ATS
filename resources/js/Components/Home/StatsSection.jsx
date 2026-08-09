import { Briefcase, Building2, Users, Award } from "lucide-react";

export default function StatsSection({ stats }) {
  const statItems = [
    { label: "Jobs Available", value: stats?.activeJobs ? `${stats.activeJobs}+` : "12,450+", icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Companies Hiring", value: stats?.companies ? `${stats.companies}+` : "3,200+", icon: Building2, color: "text-green-600", bg: "bg-green-50" },
    { label: "Candidates Placed", value: stats?.jobSeekers ? `${stats.jobSeekers}+` : "85,000+", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Success Rate", value: `${stats?.successRate || 94}`, icon: Award, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <section className="bg-white border-b border-gray-100 px-4 py-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
        {statItems.map((s) => (
          <div key={s.label} className={`flex items-center gap-3.5 ${s.bg} rounded-2xl p-3.5 transition-transform hover:scale-[1.02]`}>
            <div className={`p-2.5 rounded-xl bg-white shadow-sm shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-base sm:text-lg font-extrabold ${s.color} truncate`}>{s.value}</p>
              <p className="text-xs text-gray-600 font-medium truncate">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}