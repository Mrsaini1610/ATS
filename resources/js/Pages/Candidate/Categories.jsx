import HomepageLayout from "@/Layouts/HomepageLayout";
import { Head , Link } from "@inertiajs/react";
import { Search, ArrowRight, TrendingUp } from "lucide-react";
import { useState } from "react";

// const categories = [
//   { name: "IT & Software", icon: "💻", jobs: 3250, color: "bg-blue-50 border-blue-200", iconBg: "bg-blue-100", trend: "+12%", subcategories: ["Web Development", "Mobile Apps", "AI & ML", "DevOps", "Cybersecurity", "Data Science"] },
//   { name: "Design & Creative", icon: "🎨", jobs: 1420, color: "bg-purple-50 border-purple-200", iconBg: "bg-purple-100", trend: "+8%", subcategories: ["UI/UX Design", "Graphic Design", "Motion Graphics", "Branding", "Photography", "Video Editing"] },
//   { name: "Marketing & Sales", icon: "📈", jobs: 2100, color: "bg-green-50 border-green-200", iconBg: "bg-green-100", trend: "+15%", subcategories: ["Digital Marketing", "SEO/SEM", "Social Media", "Content Marketing", "Sales", "Brand Management"] },
//   { name: "Finance & Accounting", icon: "💰", jobs: 980, color: "bg-yellow-50 border-yellow-200", iconBg: "bg-yellow-100", trend: "+5%", subcategories: ["Accounting", "Financial Analysis", "Auditing", "Tax Consulting", "Banking", "Investment"] },
//   { name: "Healthcare & Medical", icon: "🏥", jobs: 750, color: "bg-red-50 border-red-200", iconBg: "bg-red-100", trend: "+20%", subcategories: ["Doctors", "Nurses", "Pharmacists", "Lab Technicians", "Healthcare Admin", "Dentists"] },
//   { name: "Education & Training", icon: "📚", jobs: 1100, color: "bg-indigo-50 border-indigo-200", iconBg: "bg-indigo-100", trend: "+9%", subcategories: ["Teachers", "Tutors", "Corporate Training", "E-Learning", "Curriculum Design", "Academic Research"] },
//   { name: "Engineering", icon: "⚙️", jobs: 870, color: "bg-orange-50 border-orange-200", iconBg: "bg-orange-100", trend: "+6%", subcategories: ["Civil Engineering", "Mechanical", "Electrical", "Chemical", "Industrial", "Structural"] },
//   { name: "HR & Admin", icon: "👥", jobs: 640, color: "bg-teal-50 border-teal-200", iconBg: "bg-teal-100", trend: "+4%", subcategories: ["Recruitment", "HR Management", "Payroll", "Administration", "Office Management", "Talent Acquisition"] },
//   { name: "Customer Service", icon: "🎧", jobs: 1300, color: "bg-pink-50 border-pink-200", iconBg: "bg-pink-100", trend: "+11%", subcategories: ["Call Center", "Live Chat Support", "Technical Support", "CRM", "Client Relations", "Help Desk"] },
//   { name: "Logistics & Supply Chain", icon: "🚚", jobs: 520, color: "bg-cyan-50 border-cyan-200", iconBg: "bg-cyan-100", trend: "+7%", subcategories: ["Warehouse Management", "Procurement", "Import/Export", "Inventory", "Fleet Management", "Customs"] },
//   { name: "Legal & Compliance", icon: "⚖️", jobs: 310, color: "bg-gray-50 border-gray-200", iconBg: "bg-gray-100", trend: "+3%", subcategories: ["Corporate Law", "Compliance", "Intellectual Property", "Legal Research", "Contract Management", "Litigation"] },
//   { name: "Construction & Real Estate", icon: "🏗️", jobs: 430, color: "bg-amber-50 border-amber-200", iconBg: "bg-amber-100", trend: "+10%", subcategories: ["Architecture", "Site Management", "Real Estate Agent", "Property Management", "Quantity Surveying", "Interior Design"] },
// ];

// const topSkills = [
//   "React.js", "Python", "Digital Marketing", "Figma", "SQL", "Node.js",
//   "Excel", "Communication", "Project Management", "Machine Learning", "WordPress", "Photoshop"
// ];

export default function Categories({ categories, topSkills }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.subcategories.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

 return (
    <>
        <Head title="Categories" />
    <HomepageLayout>
        <div className="max-w-7xl mx-auto px-4 pt-28 pb-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Job Categories</h1>
        <p className="text-gray-500 max-w-xl mx-auto">Browse {categories.reduce((a, c) => a + c.jobs, 0).toLocaleString()}+ jobs across {categories.length} categories in India</p>

        {/* Search */}
        <div className="max-w-md mx-auto mt-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category or skill..."
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-sm"
            />
          </div>
        </div>
      </div>

      {/* Trending banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 mb-8 flex items-center gap-4 text-white">
        <TrendingUp className="w-8 h-8 text-yellow-300 shrink-0" />
        <div>
          <p className="font-semibold">Trending This Week</p>
          <p className="text-sm text-blue-100">IT & Software, Healthcare, and Marketing jobs are in highest demand</p>
        </div>
        <Link href="/job-search" className="ml-auto shrink-0 px-4 py-2 bg-white text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-50">
          Browse All
        </Link>
      </div>

      {/* Categories grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {filtered.map((cat) => (
          <div key={cat.name} className={`bg-white border rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer ${expanded === cat.name ? "border-blue-300" : "border-gray-100"}`}>
            <div className="p-5" onClick={() => setExpanded(expanded === cat.name ? null : cat.name)}>
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-14 h-14 ${cat.iconBg} rounded-2xl flex items-center justify-center text-2xl`}>{cat.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                  <p className="text-sm text-gray-500">{cat.jobs.toLocaleString()} jobs</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{cat.trend}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {cat.subcategories.slice(0, 3).map((s) => (
                  <span key={s} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{s}</span>
                ))}
                {cat.subcategories.length > 3 && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">+{cat.subcategories.length - 3} more</span>}
              </div>
            </div>

            {/* Expanded */}
            {expanded === cat.name && (
              <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                <p className="text-xs font-medium text-gray-500 mb-2">All Sub-categories:</p>
                <div className="grid grid-cols-2 gap-1.5 mb-4">
                  {cat.subcategories.map((s) => (
                    <Link key={s} href={route("job.search", {category: cat.name, skill: s,})}  className="text-xs text-gray-600 hover:text-blue-600 flex items-center gap-1 group">
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />{s}
                    </Link>
                  ))}
                </div>
                <Link href={route("job.search", )} className="flex items-center justify-center gap-1 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
                  View {cat.jobs.toLocaleString()} Jobs <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No categories found for "<strong>{search}</strong>"</p>
          <button onClick={() => setSearch("")} className="mt-3 text-blue-600 hover:underline text-sm">Clear search</button>
        </div>
      )}

      {/* Top Skills */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Top In-Demand Skills</h2>
        <div className="flex flex-wrap gap-2">
          {topSkills.map((skill) => (
        <Link
            key={skill}
            href={route("job.search", {
                skill: skill,
            })}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
            {skill}
        </Link>
          ))}
        </div>
      </div>
    </div>
  </HomepageLayout>
  </>
  );
  
}
