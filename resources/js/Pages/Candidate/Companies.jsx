import { Link } from '@inertiajs/react';
import { MapPin, Globe, Users, Calendar, Star, Briefcase, Building2, Mail, Phone, ArrowRight } from "lucide-react";
import HomepageLayout from "@/Layouts/HomepageLayout";



export default function Companies({ company }) {
    company = company || {};

    company.jobs = company.jobs || [];
    company.perks = company.perks || [];
  return (
    <HomepageLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Banner/Header Block */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6 shadow-sm">
          <div className={`h-28 bg-gradient-to-r ${company.bgGradient}`} />
          <div className="px-5 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 -mt-8 mb-4">
              <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-white text-xl font-bold border-4 border-white shadow-md">
                {/* {company.logo} */}
                {company.logo ? (
                    <img
                        src={`/storage/${company.logo}`}
                        className="w-16 h-16 rounded-xl object-cover"
                    />
                ) : (
                    company.name?.charAt(0)
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-xs text-gray-400">{company.tagline}</p>

              </div>
            </div>

            {/* <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-2 border-t border-gray-50">
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-gray-400" />{company.industry}</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-gray-400" />{company.size}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" />{company.hq}</span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-gray-700">{company.rating}</span>
              </span>
            </div> */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
    <div className="bg-blue-50 rounded-xl p-4 text-center">
        <Briefcase className="w-6 h-6 text-blue-600 mx-auto mb-2" />
        <p className="text-xl font-bold">{company.jobs.length}</p>
        <p className="text-xs text-gray-500">Open Jobs</p>
    </div>

    <div className="bg-green-50 rounded-xl p-4 text-center">
        <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
        <p className="text-xl font-bold">{company.size || "Growing"}</p>
        <p className="text-xs text-gray-500">Company Size</p>
    </div>

    <div className="bg-yellow-50 rounded-xl p-4 text-center">
        <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2 fill-yellow-500" />
        <p className="text-xl font-bold">{company.rating}</p>
        <p className="text-xs text-gray-500">Rating</p>
    </div>

    <div className="bg-purple-50 rounded-xl p-4 text-center">
        <MapPin className="w-6 h-6 text-purple-600 mx-auto mb-2" />
        <p className="text-sm font-semibold">{company.hq}</p>
        <p className="text-xs text-gray-500">Head Office</p>
    </div>
</div>
          </div>
        </div>

        {/* Info Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 mb-2">Company Overview</h2> */}
<div className="bg-white rounded-2xl shadow-sm border p-5">

<h2 className="font-bold mb-4">
Company Highlights
</h2>

<div className="grid md:grid-cols-2 gap-4">

<div className="flex items-center gap-3">
<Building2 className="text-blue-600"/>
<div>
<p className="text-xs text-gray-500">Industry</p>
<p className="font-semibold">{company.industry}</p>
</div>
</div>

<div className="flex items-center gap-3">
<MapPin className="text-red-500"/>
<div>
<p className="text-xs text-gray-500">Location</p>
<p>{company.hq}</p>
</div>
</div>

<div className="flex items-center gap-3">
<Phone className="text-green-600"/>
<div>
<p className="text-xs text-gray-500">Phone</p>
<p>{company.phone}</p>
</div>
</div>

<div className="flex items-center gap-3">
<Mail className="text-indigo-600"/>
<div>
<p className="text-xs text-gray-500">Email</p>
<p>{company.email}</p>
</div>
</div>

</div>

</div>
              {/* <p className="text-xs text-gray-600 leading-relaxed">{company.about}</p>
            </div> */}

            {/* Current Openings inside Company view */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Open Vacancies at {company.name}</h2>
              <div className="space-y-2">
                {company.jobs.map((j) => (
                  <div key={j.id} className="p-3 border border-gray-50 rounded-xl hover:border-blue-200 transition-colors flex justify-between items-center bg-gray-50/50">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900">{j.title}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">{j.loc} • {j.salary}</p>
                    </div>
                    <Link href={`/apply/${j.uuid}`} className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-0.5">
                      Apply <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Contact Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-900 mb-3">Corporate Connect</h3>
              <div className="space-y-2.5 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-blue-600 truncate">{company.website}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{company.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{company.phone}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-900 mb-2">Benefits Offered</h3>
              <div className="flex flex-wrap gap-1.5">
                {company.perks.map((p) => (
                  <span key={p} className="text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </HomepageLayout>
  );
}
