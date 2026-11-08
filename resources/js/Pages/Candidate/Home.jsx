import React, { useState } from "react";
import HomepageLayout from "@/Layouts/HomepageLayout";
import HeroSection from "@/Components/Home/HeroSection";
import StatsSection from "@/Components/Home/StatsSection";
import QuickActionsSection from "@/Components/Home/QuickActionsSection";
import RecommendedJobsSection from "@/Components/Home/RecommendedJobsSection";
import RecentJobsSection from "@/Components/Home/RecentJobsSection";
import FeaturesSection from "@/Components/Home/FeaturesSection";
import TopCompaniesSection from "@/Components/Home/TopCompaniesSection";
import TrendingSkillsSection from "@/Components/Home/TrendingSkillsSection";
import TestimonialsSection from "@/Components/Home/TestimonialsSection";
import CTASection from "@/Components/Home/CTASection";
import JobDetailModal from "@/Components/Candidate/JobDetailModal";
import CandidateLoginModal from "@/Components/Candidate/CandidateLoginModal";
import { usePage, Head, router } from "@inertiajs/react";

export default function Homepage() {
  const {
    auth,
    stats,
    recentJobs = [],
    recommendedJobs = [],
    isLoggedIn = false,
    candidateProfile = null,
    categories = [],
    topCompanies = [],
    trendingSkills = [],
    testimonials = [],
  } = usePage().props;

  const [selectedJob, setSelectedJob] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [activeUser, setActiveUser] = useState(auth?.user || null);

  const userIsLoggedIn = isLoggedIn || Boolean(auth?.user) || Boolean(activeUser);

  // Ensure job posts are strictly displayed in descending order (newest first)
  const sortedRecentJobs = [...recentJobs].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  const sortedRecommendedJobs = [...recommendedJobs].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));

  const handleSelectJob = (job) => {
    setSelectedJob(job);
  };

  const handleRequireLogin = (job) => {
    // Open login modal without closing or resetting the selected job
    setLoginModalOpen(true);
  };

  const handleLoginSuccess = (user) => {
    setActiveUser(user);
    setLoginModalOpen(false);
  };

  return (
    <HomepageLayout>
      <Head>
        <title>ATS - Direct Hiring Job Portal in India | 100% Free for Job Seekers</title>
        <meta
          name="description"
          content="Find verified jobs across India with transparent salary and zero consultancy fees. Apply directly to top companies in Jaipur, Delhi NCR, Mumbai, Bengaluru, Pune, and remote."
        />
        <meta
          name="keywords"
          content="ATS, ATS Job Portal, ATS Technology Hiring, Jobs in India, Direct Hiring, Verified Jobs, Jobs in Jaipur, Jobs in Delhi NCR, Jobs in Mumbai, Jobs in Bengaluru, Freshers Jobs, Telecaller Jobs, Sales Jobs, IT Jobs, Free Job Search"
        />
      </Head>

      {/* Hero Section Banner */}
      <HeroSection user={activeUser || auth?.user} />

      <div className="px-4 sm:px-6 space-y-10 sm:space-y-14 max-w-7xl mx-auto py-8">
        {/* Stats Strip */}
        <StatsSection stats={stats} />

        {/* Quick Actions - Only shown after login */}
        {userIsLoggedIn && <QuickActionsSection />}

        {/* 1. Recommended Jobs Section (Only visible when logged in) */}
        {userIsLoggedIn && (
          <RecommendedJobsSection
            recommendedJobs={sortedRecommendedJobs}
            isLoggedIn={userIsLoggedIn}
            candidateProfile={candidateProfile}
            onSelectJob={handleSelectJob}
          />
        )}

        {/* 2. Recent Jobs Openings */}
        <RecentJobsSection
          recentJobs={sortedRecentJobs}
          onSelectJob={handleSelectJob}
        />

        {/* 3. Browse by Category */}
        <FeaturesSection categories={categories} />

        {/* 4. Top Companies Hiring */}
        <TopCompaniesSection topCompanies={topCompanies} />

        {/* 5. Top Trending Skills */}
        <TrendingSkillsSection trendingSkills={trendingSkills} />

        {/* 6. Testimonials */}
        <TestimonialsSection testimonials={testimonials} />

        {/* 7. Call To Action Banner */}
        <CTASection user={activeUser || auth?.user} />
      </div>

      {/* Job Details Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
        isLoggedIn={userIsLoggedIn}
        user={activeUser || auth?.user}
        onRequireLogin={handleRequireLogin}
        onApplicationSuccess={(job) => {
          // Update local status of job
          if (selectedJob && (selectedJob.uuid === job.uuid || selectedJob.id === job.id)) {
            setSelectedJob({ ...selectedJob, is_applied: true });
          }
        }}
      />

      {/* Inline Candidate Phone & OTP Login Modal */}
      <CandidateLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        jobTitle={selectedJob?.title || ""}
      />
    </HomepageLayout>
  );
}
