import { Link } from '@inertiajs/react';
import { TrendingUp, ArrowRight } from "lucide-react";

const publicCategories = [
  { name: "IT & Software", icon: "💻", count: 1240 },
  { name: "Design & Creative", icon: "🎨", count: 450 },
  { name: "Marketing & Sales", icon: "📈", count: 890 },
  { name: "Finance & Accounting", icon: "💰", count: 310 },
  { name: "HR & Admin", icon: "👥", count: 210 },
  { name: "Customer Service", icon: "🎧", count: 540 },
];

export function CategoriesGrid() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-green-600" />
        <h3 className="text-sm font-bold text-gray-900">Popular Categories</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {publicCategories.map((cat) => (
          <Link 
            key={cat.name} 
            href={`/public/jobs?category=${encodeURIComponent(cat.name)}`}
            className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
          >
            <span className="text-xl">{cat.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-blue-600">{cat.name}</p>
              <p className="text-[11px] text-gray-400">{cat.count} openings</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-600 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}