import { Star, Quote } from "lucide-react";

export default function TestimonialsSection({ testimonials = [] }) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-100 my-8">
      <div className="text-center max-w-xl mx-auto mb-6">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Loved by Job Seekers</h2>
        <p className="text-xs sm:text-sm text-slate-500">See how we've helped candidates land their dream roles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((t, idx) => {
          const isUrl =
            typeof t.avatar === "string" &&
            (t.avatar.startsWith("http") || t.avatar.startsWith("/") || t.avatar.startsWith("data:"));
          const initials = t.avatar || (t.name || "U").slice(0, 2).toUpperCase();

          return (
            <div
              key={t.id || t.name || idx}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative"
            >
              <Quote className="absolute top-4 right-4 w-6 h-6 text-slate-200" />
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-2">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 italic mb-4 leading-relaxed">
                  "{t.content || t.comment || "Great platform for finding verified jobs!"}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-50">
                {isUrl ? (
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    {initials}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-900">{t.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {t.role} {t.company && <>at <span className="font-medium text-slate-600">{t.company}</span></>}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}