import React from "react";
import { Head, Link } from "@inertiajs/react";
import HomepageLayout from "@/Layouts/HomepageLayout";
import {
  FileCheck2,
  ShieldAlert,
  UserCheck,
  Scale,
  AlertTriangle,
  Building2,
  Mail,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function Terms() {
  const lastUpdated = "September 28, 2026";

  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "free-candidate-policy", title: "2. 100% Free Candidate Policy" },
    { id: "account-registration", title: "3. Account Registration & Security" },
    { id: "candidate-obligations", title: "4. Candidate Obligations & Conduct" },
    { id: "employer-terms", title: "5. Employer Postings & Verification" },
    { id: "prohibited-activities", title: "6. Prohibited Activities" },
    { id: "disclaimers", title: "7. Disclaimers & Limitation of Liability" },
    { id: "ip-rights", title: "8. Intellectual Property" },
    { id: "termination", title: "9. Account Suspension & Termination" },
    { id: "governing-law", title: "10. Governing Law & Dispute Resolution" },
  ];

  return (
    <HomepageLayout>
      <Head>
        <title>Terms & Conditions | ATS - Direct Hiring Platform</title>
        <meta
          name="description"
          content="Review the Terms & Conditions of ATS (ATS Technology Hiring). Understand our 100% free candidate policy, verified hiring rules, user responsibilities, and legal agreements."
        />
        <meta
          name="keywords"
          content="ATS terms and conditions, terms of service ATS, job portal legal terms India, candidate agreements"
        />
      </Head>

      <div className="bg-slate-50/50 min-h-screen pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs sm:text-sm font-semibold mb-4 border border-white/20">
              <Scale className="w-4 h-4 text-blue-300" />
              <span>Platform Terms & Code of Conduct</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
              Terms & Conditions
            </h1>
            <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Clear, transparent rules governing your use of the ATS direct hiring platform. Please review carefully before applying or creating an account.
            </p>
            <div className="mt-4 text-xs text-blue-200">
              Last Updated: <span className="font-semibold text-white">{lastUpdated}</span>
            </div>
          </div>

          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column: Quick Navigation */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3.5">
                  Index
                </h3>
                <nav className="space-y-1.5">
                  {sections.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className="block text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50/60 rounded-lg px-2.5 py-1.5 transition-colors"
                    >
                      {sec.title}
                    </a>
                  ))}
                </nav>
                <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500 mb-2">Need clarification?</p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <span>Contact Support</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Terms Body */}
            <div className="lg:col-span-3 space-y-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-xs leading-relaxed text-gray-700 text-sm sm:text-base">
              {/* 1. Acceptance */}
              <section id="acceptance" className="scroll-mt-28">
                <div className="flex items-center gap-2.5 mb-3 text-blue-600">
                  <FileCheck2 className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    1. Acceptance of Terms
                  </h2>
                </div>
                <p className="mb-3">
                  These Terms and Conditions (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (whether as a job-seeking candidate or a representative of an employer) and <strong>ATS Technology Hiring</strong> (&ldquo;ATS&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), governing your use of our portal at <a href="https://atstechnologyhiring.com" className="text-blue-600 underline font-semibold">atstechnologyhiring.com</a>.
                </p>
                <p>
                  By browsing the platform, registering an account, or submitting a job application, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree, you must immediately refrain from accessing our services.
                </p>
              </section>

              <hr className="border-gray-100" />

              {/* 2. 100% Free Policy */}
              <section id="free-candidate-policy" className="scroll-mt-28">
                <div className="flex items-center gap-2.5 mb-3 text-emerald-600">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    2. 100% Free Candidate Policy (Zero Consultancy Fees)
                  </h2>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-4 text-emerald-950">
                  <p className="font-bold text-base mb-1">
                    ATS is 100% Free for Candidates &mdash; Forever
                  </p>
                  <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                    Searching for jobs, creating a digital profile, uploading resumes, tracking applications, and scheduling interviews on ATS is 100% free of charge for candidates. We do not charge registration fees, interview fees, or training charges from job seekers.
                  </p>
                </div>
                <p className="text-sm">
                  <strong>Warning against fraudulent consultancies:</strong> If any recruiter or agency claiming to represent ATS or a listed employer asks you for money (for registration fees, document verification, security deposits, or uniform charges), <strong>DO NOT PAY</strong>. Immediately report the posting or contact our support desk at <a href="mailto:uniquetech.supt@gmail.com" className="text-blue-600 font-semibold underline">uniquetech.supt@gmail.com</a>.
                </p>
              </section>

              <hr className="border-gray-100" />

              {/* 3. Account Registration */}
              <section id="account-registration" className="scroll-mt-28">
                <div className="flex items-center gap-2.5 mb-3 text-blue-600">
                  <UserCheck className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    3. Account Registration & Security
                  </h2>
                </div>
                <p className="mb-3">
                  To apply for jobs or manage candidate details, you must create a verified account using your genuine mobile number and email. You agree to:
                </p>
                <ul className="space-y-2 text-sm pl-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
                    <span>Provide true, accurate, and current information regarding your identity and qualifications.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
                    <span>Maintain the confidentiality of your login credentials and one-time password (OTP) codes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
                    <span>Notify us immediately if you suspect unauthorized access to your account.</span>
                  </li>
                </ul>
              </section>

              <hr className="border-gray-100" />

              {/* 4. Candidate Obligations */}
              <section id="candidate-obligations" className="scroll-mt-28">
                <div className="flex items-center gap-2.5 mb-3 text-blue-600">
                  <Scale className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    4. Candidate Obligations & Conduct
                  </h2>
                </div>
                <p className="mb-3">
                  Candidates using ATS commit to professional standards of conduct:
                </p>
                <ul className="space-y-2 text-sm pl-2">
                  <li><strong>Authentic Resumes:</strong> You certify that all educational qualifications, past employers, work tenures, and skill descriptions provided in your profile are genuine.</li>
                  <li><strong>Interview Decorum:</strong> If an employer schedules an interview (telephonic, virtual, or in-person), you agree to attend on time or provide reasonable notice if unable to join.</li>
                  <li><strong>One Account Per Individual:</strong> Creating multiple duplicate accounts with altered details is strictly prohibited.</li>
                </ul>
              </section>

              <hr className="border-gray-100" />

              {/* 5. Employer Terms */}
              <section id="employer-terms" className="scroll-mt-28">
                <div className="flex items-center gap-2.5 mb-3 text-blue-600">
                  <Building2 className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    5. Employer Postings & Verification
                  </h2>
                </div>
                <p className="mb-3">
                  All employer organizations registered on ATS undergo moderation. Employers agree to:
                </p>
                <ul className="space-y-2 text-sm pl-2">
                  <li>Post only legitimate, existing job vacancies with transparent salary ranges and clear job descriptions.</li>
                  <li>Refrain from charging candidates any registration fees, application charges, or deposits.</li>
                  <li>Respect candidate privacy and use candidate resumes strictly for evaluating employment suitability.</li>
                </ul>
              </section>

              <hr className="border-gray-100" />

              {/* 6. Prohibited Activities */}
              <section id="prohibited-activities" className="scroll-mt-28">
                <div className="flex items-center gap-2.5 mb-3 text-red-600">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    6. Prohibited Activities
                  </h2>
                </div>
                <p className="mb-3">
                  Users agree never to engage in any of the following malicious activities on the platform:
                </p>
                <ul className="space-y-2 text-sm pl-2">
                  <li>Automated scraping, crawling, or extracting platform data or job listings using unauthorized bots.</li>
                  <li>Posting misleading, offensive, illegal, or discriminatory content.</li>
                  <li>Attempting to probe, scan, or breach platform security, APIs, or database integrity.</li>
                  <li>Impersonating another person, brand, or recruiting entity.</li>
                </ul>
              </section>

              <hr className="border-gray-100" />

              {/* 7. Disclaimers */}
              <section id="disclaimers" className="scroll-mt-28">
                <div className="flex items-center gap-2.5 mb-3 text-blue-600">
                  <Scale className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    7. Disclaimers & Limitation of Liability
                  </h2>
                </div>
                <p className="mb-3">
                  ATS is a direct connection platform facilitating interactions between job seekers and employers. While we verify job listings and employer profiles diligently, ATS does not guarantee an interview, employment offer, or specific salary. The final employment contract is solely between the candidate and the hiring employer.
                </p>
                <p>
                  To the maximum extent permitted by Indian law, ATS Technology Hiring shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the platform.
                </p>
              </section>

              <hr className="border-gray-100" />

              {/* 8. IP Rights */}
              <section id="ip-rights" className="scroll-mt-28">
                <div className="flex items-center gap-2.5 mb-3 text-blue-600">
                  <FileCheck2 className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    8. Intellectual Property Rights
                  </h2>
                </div>
                <p>
                  All software, code, logos, trademarks, website designs, graphics, and interface elements on ATS are the exclusive intellectual property of ATS Technology Hiring. You may not copy, reproduce, or distribute any platform assets without explicit written authorization.
                </p>
              </section>

              <hr className="border-gray-100" />

              {/* 9. Termination */}
              <section id="termination" className="scroll-mt-28">
                <div className="flex items-center gap-2.5 mb-3 text-blue-600">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    9. Account Suspension & Termination
                  </h2>
                </div>
                <p>
                  We reserve the right to suspend or permanently terminate any account that violates these Terms, submits fabricated resumes, engages in fraudulent recruitment practices, or behaves improperly towards candidates or recruiters.
                </p>
              </section>

              <hr className="border-gray-100" />

              {/* 10. Governing Law */}
              <section id="governing-law" className="scroll-mt-28">
                <div className="flex items-center gap-2.5 mb-3 text-blue-600">
                  <Scale className="w-5 h-5 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    10. Governing Law & Dispute Resolution
                  </h2>
                </div>
                <p className="mb-4">
                  These Terms are governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of or related to these Terms shall be subject to the exclusive jurisdiction of the competent courts located in Jaipur, Rajasthan, India.
                </p>
                <div className="bg-slate-50 rounded-2xl border border-gray-100 p-5 space-y-1 text-xs sm:text-sm">
                  <p><strong>Legal & Compliance Queries:</strong> ATS Technology Hiring Legal Team</p>
                  <p><strong>Email:</strong> <a href="mailto:uniquetech.supt@gmail.com" className="text-blue-600 font-semibold underline">uniquetech.supt@gmail.com</a></p>
                  <p><strong>Support Desk:</strong> <Link href="/contact" className="text-blue-600 font-semibold underline">Contact Support</Link></p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </HomepageLayout>
  );
}
