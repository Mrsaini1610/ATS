import { useState, useEffect } from "react";
// import { Link, usePage } from "@inertiajs/react";
import { Link, usePage, router } from "@inertiajs/react";
import { ArrowLeft, Upload, CheckCircle2, Briefcase, MapPin, DollarSign, User, Mail, Phone, FileText, Globe, Linkedin, Send } from "lucide-react";
import HomepageLayout from "@/Layouts/HomepageLayout"; // Aapka standard template layout
// import CandidateLoginPopup from "@/Components/CandidateLoginPopup";

const steps = ["Personal Info", "Professional Info", "CV & Cover Letter", "Review & Submit"];

export default function JobApply({ jobDataFromBackend, candidate, loggedIn }) {
  // Inertia process me URL data ya custom backend data usePage se ya directly props se access hota hai
  const { props } = usePage();

  // Static Fallback agar backend se data directly bind na ho rha ho test time par
//   const submitted = props.flash?.submitted;
  const job = jobDataFromBackend ||  {
    id: "1",
    title: "Senior React Developer",
    company: "TechCorp Partner",
    location: "Jaipur",
    salary: "INR 80K - 120K",
    type: "Full-time",
    logo: "TC",
    color: "bg-blue-600",
    requirements: ["3+ years React experience", "TypeScript proficiency", "Node.js knowledge", "Git & Agile workflow"]
  };

    const [step, setStep] = useState(0);
    const [showForm, setShowForm] = useState(loggedIn);

    const [submitted, setSubmitted] = useState(false);

    const [loginPopup, setLoginPopup] = useState(false);

useEffect(() => {

    if (loggedIn) {

        setShowForm(true);

    }

}, [loggedIn]);
    const [form, setForm] = useState({
        fullName: candidate?.name || "",
        email: candidate?.email || "",
        phone: candidate?.phone || "",
        city: candidate?.city || "",

        currentTitle: candidate?.current_title || "",
        experience: candidate?.experience || "",
        currentSalary: candidate?.current_salary || "",
        expectedSalary: "",
        notice: candidate?.notice_period || "",

        portfolio: candidate?.portfolio || "",
        linkedin: candidate?.linkedin || "",

        whyApply: "",
        coverLetter: "",
        cvFile: null,
    });
    const update = (field, val) => setForm((p) => ({ ...p, [field]: val }));

    // const handleNext = (e) => {
    //     e.preventDefault();

    //     // Step 1 ke baad login compulsory
    //     if (step === 0 && !loggedIn) {
    //         setLoginPopup(true);
    //         return;
    //     }

    //     if (step < 3) {
    //         setStep(step + 1);
    //     } else {

    //         router.post(`/apply/${job.id}`, form, {
    //             forceFormData: true,
    //             onSuccess: () => {
    //                 setSubmitted(true);
    //             },
    //         });
    //     }
    // };
const handleNext = (e) => {
    e.preventDefault();

    console.log("Current Step:", step);

    if (step < 3) {
        setStep(step + 1);
        return;
    }

    console.log("Submitting Form");
    console.log(form);

    router.post(`/apply/${job.id}`, form, {
        forceFormData: true,

        onStart: () => console.log("START"),
        onProgress: () => console.log("PROGRESS"),

        onSuccess: () => {
            console.log("SUCCESS");

            setSubmitted(true);
        },

        onError: (errors) => {
            console.log("ERROR", errors);
        },

        onFinish: () => {
            console.log("FINISH");
        },
    });
};
    // if (!loggedIn) {

    //     setLoginPopup(true);

    //     return;

    // }

    // router.post(`/apply/${job.id}`, form, {

    //     forceFormData: true,

    //     onSuccess: () => {

    //         setSubmitted(true);

    //     },

    // });



  if (submitted) {

    return (
      <HomepageLayout>
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-xs text-gray-500 mb-2">
              Your application for <span className="font-semibold text-gray-800">{job.title}</span> at <span className="font-semibold text-gray-800">{job.company}</span> has been processed.
            </p>
            <p className="text-[11px] text-gray-400 mb-6">The recruitment team will review your credentials and get back to you shortly.</p>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
              <Link href="/job-search" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700">
                Browse More Jobs
              </Link>
              <Link href="/member/dashboard" className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-medium hover:bg-gray-50">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </HomepageLayout>
    );
  }

  return (
    <HomepageLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Link adjusted to Public Listings */}
        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-5 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Info Left Sticky Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-11 h-11 ${job.color || 'bg-blue-600'} rounded-xl flex items-center justify-center text-white font-bold text-sm`}>
                  {job.logo}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm">{job.title}</h3>
                  <p className="text-[11px] text-gray-400">{job.company}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs text-gray-600 mb-4 pt-2 border-t border-gray-50">
                <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gray-400" />{job.location}</div>
                <div className="flex items-center gap-2"><DollarSign className="w-3.5 h-3.5 text-gray-400" />{job.salary}</div>
                <div className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-gray-400" />{job.type}</div>
              </div>
              <div className="pt-3 border-t border-gray-50">
                <h4 className="text-[11px] font-bold text-gray-700 mb-2 uppercase tracking-wider">Core Requirements</h4>
                <ul className="space-y-1.5">
                  {job.requirements.map((r) => (
                    <li key={r} className="flex items-start gap-1.5 text-xs text-gray-500">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Application Form Wizard */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">

            {showForm ? (
                <>
                    <h2 className="text-lg font-bold text-gray-900 mb-0.5">
                        Apply for {job.title}
                    </h2>

                    <p className="text-xs text-gray-400 mb-5">
                        {job.company} · Step {step + 1} of {steps.length}
                    </p>

                    {/* Stepper */}
                    <div className="flex items-center mb-6 max-w-md">
                        {steps.map((s, i) => (
                            <div key={s} className="flex items-center flex-1 last:flex-none">
                                <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        i < step
                                            ? "bg-green-500 text-white"
                                            : i === step
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-400"
                                    }`}
                                >
                                    {i < step ? "✓" : i + 1}
                                </div>

                                {i < steps.length - 1 && (
                                    <div
                                        className={`flex-1 h-0.5 mx-1.5 ${
                                            i < step ? "bg-green-400" : "bg-gray-100"
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <p className="text-xs font-bold text-gray-700 mb-4 uppercase tracking-wider">
                        {steps[step]}
                    </p>
                </>
            ) : (
                <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {job.title}
                    </h2>

                    <p className="text-gray-500 mb-6">
                        {job.company}
                    </p>
                </>
            )}

            {showForm ? (
              <form onSubmit={handleNext} className="space-y-4">
                {/* Step 0 - Personal */}
                {step === 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Your full name" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="your@email.com" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input required value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 XXXXX XXXXX" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">City *</label>
                      <select required value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="">Select city</option>
                        {["Jaipur", "Delhi", "Mumbai", "Bangalore", "Remote"].map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* Step 1 - Professional Info */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Current Job Title *</label>
                      <input required value={form.currentTitle} onChange={(e) => update("currentTitle", e.target.value)} placeholder="e.g. Full Stack Developer" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Experience *</label>
                        <select required value={form.experience} onChange={(e) => update("experience", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                          <option value="">Select</option>
                          {["Fresh Graduate", "1-2 Years", "3-5 Years", "5+ Years"].map((exp) => <option key={exp} value={exp}>{exp}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Current Salary</label>
                        <input value={form.currentSalary} onChange={(e) => update("currentSalary", e.target.value)} placeholder="e.g. 5,00000" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Expected Salary *</label>
                        <input required value={form.expectedSalary} onChange={(e) => update("expectedSalary", e.target.value)} placeholder="e.g. 7,50000" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Portfolio Link</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input value={form.portfolio} onChange={(e) => update("portfolio", e.target.value)} placeholder="https://yourportfolio.com" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">LinkedIn Profile</label>
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} placeholder="linkedin.com/in/username" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2 - Documents & Cover Letter */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Upload CV / Resume *</label>
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">{form.cvFile ? form.cvFile.name : "Click to upload CV (PDF, DOC)"}</span>
                        <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setForm((p) => ({ ...p, cvFile: e.target.files?.[0] || null }))} />
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Why do you want this job? *</label>
                      <textarea required rows={3} value={form.whyApply} onChange={(e) => update("whyApply", e.target.value)} placeholder="Why are you the perfect fit..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
                    </div>
                  </div>
                )}

                {/* Step 3 - Summary Review */}
                {step === 3 && (
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-xs">
                      <h4 className="font-bold text-gray-700 mb-2">Personal Stack</h4>
                      <p><span className="text-gray-400">Name:</span> {form.fullName || "—"}</p>
                      <p><span className="text-gray-400">Email:</span> {form.email || "—"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-xs">
                      <h4 className="font-bold text-gray-700 mb-2">Professional Stack</h4>
                      <p><span className="text-gray-400">Role Title:</span> {form.currentTitle || "—"}</p>
                      <p><span className="text-gray-400">Exp Expected:</span> {form.expectedSalary || "—"}</p>
                    </div>
                    <div className="bg-blue-50 text-blue-700 p-3 rounded-xl text-[11px] border border-blue-100">
                      Please crosscheck all info before submitting to {job.company}.
                    </div>
                  </div>
                )}
                {/* Wizard Buttons */}
                <div className="flex gap-3 pt-2">
                  {step > 0 && (
                    <button type="button" onClick={() => setStep(step - 1)} className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50">
                      Back
                    </button>
                  )}
                  <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">
                    {step < 3 ? "Continue" : <><Send className="w-3.5 h-3.5" /> Submit Application</>}

                  </button>

                </div>
              </form>
              ) : (

                    <div className="text-center py-10">

                        <p className="text-gray-500 mb-5">
                            Login to apply for this job.
                        </p>

                        <button
                            type="button"
                            onClick={() => setLoginPopup(true)}
                            className="px-8 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Login to Apply
                        </button>

                    </div>

                    )}
            </div>
          </div>
        </div>
      </div>
    <CandidateLoginPopup
        open={loginPopup}
        onClose={() => setLoginPopup(false)}
        jobId={job.id}
        onLoginSuccess={() => {
            setLoginPopup(false);

            router.reload({
                onSuccess: () => {
                    setShowForm(true);
                },
            });
        }}
    />
    </HomepageLayout>
  );
}
