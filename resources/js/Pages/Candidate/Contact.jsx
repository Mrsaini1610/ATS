import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import HomepageLayout from '@/Layouts/HomepageLayout';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Building2,
  Headphones,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

const INQUIRY_TOPICS = [
  "Job Application Status",
  "Employer Verification",
  "Resume / Profile Issue",
  "Interview Assistance",
  "Report Suspicious Job",
  "General Feedback"
];

const FAQS = [
  {
    q: "Is applying to jobs on ATS.com 100% free?",
    a: "Yes, absolutely! Job seekers are never charged any fees for searching, applying, or interviewing. ATS.com is committed to 100% free direct hiring."
  },
  {
    q: "How soon can I expect a response from support?",
    a: "Our customer support team typically responds within 2 to 24 hours during working days (Monday to Saturday, 9:00 AM - 6:30 PM IST)."
  },
  {
    q: "What should I do if an employer asks for money?",
    a: "Never pay any money! Genuine employers on ATS.com never charge fees. Please immediately report the job or contact us via this form so our compliance team can take strict action."
  },
  {
    q: "How can employers verify their company profile?",
    a: "Employers can submit their GST/CIN details from the employer dashboard or reach out through this contact form with the subject 'Employer Verification'."
  }
];

export default function Contact() {
  const { auth, flash } = usePage().props;
  const user = auth?.user;

  const [activeFaq, setActiveFaq] = useState(null);

  const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
    name: user?.full_name || user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });

  const handleSelectTopic = (topic) => {
    setData('subject', topic);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = typeof route === 'function' ? route('contact.submit') : '/contact';
    post(endpoint, {
      preserveScroll: true,
      onSuccess: () => {
        reset('subject', 'message');
      },
    });
  };

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <>
      <Head title="Contact Support - ATS.com | Candidate & Employer Help" />
      <HomepageLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
          
          {/* Header Section */}
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-3.5 shadow-2xs">
              <Headphones className="w-3.5 h-3.5 text-blue-600" />
              <span>Dedicated Candidate & Employer Helpdesk</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              We're Here to <span className="text-blue-600">Help You</span>
            </h1>
            <p className="mt-2.5 text-xs sm:text-base text-gray-600 leading-relaxed">
              Have questions about your applications, need account assistance, or want to verify an employer? Reach out to our India support team.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Contact Channels & Trust Cards (Left Column) */}
            <div className="space-y-4">
              
              {/* Email Support */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:border-blue-200 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-gray-900">Email Support</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Response within 24 hours</p>
                    <a
                      href="mailto:support@ats.com"
                      className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline block mt-1.5 truncate"
                    >
                      support@ats.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Phone Helpline */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:border-emerald-200 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-gray-900">Candidate Helpline</h3>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Live
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Mon - Sat, 9:00 AM - 6:30 PM IST</p>
                    <a
                      href="tel:+919876543210"
                      className="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline block mt-1.5"
                    >
                      +91 98765 43210
                    </a>
                  </div>
                </div>
              </div>

              {/* Headquarters */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:border-purple-200 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-gray-900">Headquarters</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Central Operations Hub</p>
                    <p className="text-xs text-gray-700 font-medium mt-1.5">
                      Jaipur, Rajasthan, India
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct Hiring Guarantee Banner */}
              <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/80 rounded-2xl border border-blue-100 p-5 shadow-2xs">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>100% Free Candidate Promise</span>
                </div>
                <p className="text-xs text-blue-900/80 leading-relaxed">
                  ATS.com never charges fees from job seekers for job applications, screening, or interview calls. Report any third party demanding money directly to us.
                </p>
              </div>

            </div>

            {/* Main Interactive Contact Form (Right 2 Columns) */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Send an Inquiry</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Fill out the form below. Our support representatives will respond promptly.
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                </div>

                {/* Success Notification */}
                {(flash?.success || wasSuccessful) && (
                  <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-emerald-900">Message Delivered!</h4>
                      <p className="text-emerald-700 mt-0.5">
                        {flash?.success || 'Thank you for reaching out! Your message has been received and our team will get back to you shortly.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Quick Topic Selection Chips */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Quick Select Topic
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INQUIRY_TOPICS.map((topic) => (
                      <button
                        type="button"
                        key={topic}
                        onClick={() => handleSelectTopic(topic)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                          data.subject === topic
                            ? 'bg-blue-600 text-white shadow-2xs font-bold'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200/80'
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                      />
                      {errors.name && <div className="mt-1 text-xs text-red-600">{errors.name}</div>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                      />
                      {errors.email && <div className="mt-1 text-xs text-red-600">{errors.email}</div>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Subject / Query Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={data.subject}
                      onChange={(e) => setData('subject', e.target.value)}
                      placeholder="e.g. Issue applying for Web Developer vacancy"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                    />
                    {errors.subject && <div className="mt-1 text-xs text-red-600">{errors.subject}</div>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Detailed Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={data.message}
                      onChange={(e) => setData('message', e.target.value)}
                      placeholder="Please explain your question or issue in detail so we can help you promptly..."
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition resize-none"
                    />
                    {errors.message && <div className="mt-1 text-xs text-red-600">{errors.message}</div>}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>Average reply time: under 24 hrs</span>
                    </div>

                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-colors shadow-xs cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{processing ? 'Sending Inquiry...' : 'Submit Inquiry'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>

          {/* Frequently Asked Questions Section */}
          <div className="mt-14 pt-10 border-t border-gray-100">
            <div className="text-center max-w-xl mx-auto mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold mb-2">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Instant Answers</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-gray-900 hover:bg-gray-50/80 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${
                        activeFaq === idx ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>

                  {activeFaq === idx && (
                    <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-gray-600 border-t border-gray-50 bg-gray-50/30 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </HomepageLayout>
    </>
  );
}
