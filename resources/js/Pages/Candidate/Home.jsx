import React from "react";
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
import { usePage, Head } from "@inertiajs/react";

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

      {/* Hero Section with Live Search */}
      <HeroSection user={auth?.user} />

      <div className="px-4 sm:px-6 space-y-10 sm:space-y-14 max-w-7xl mx-auto py-8">
        {/* Stats Strip */}
        <StatsSection stats={stats} />

        {/* Quick Actions (Browse Jobs, Applications, Saved Jobs, Alerts) - Only shown after login, ABOVE Recent Jobs */}
        {(isLoggedIn || Boolean(auth?.user)) && (
          <QuickActionsSection />
        )}

        {/* 1. Recommended Jobs Section (Only visible when logged in) */}
        {(isLoggedIn || Boolean(auth?.user)) && (
          <RecommendedJobsSection
            recommendedJobs={recommendedJobs}
            isLoggedIn={isLoggedIn || Boolean(auth?.user)}
            candidateProfile={candidateProfile}
          />
        )}

        {/* 2. Recent Jobs Openings */}
        <RecentJobsSection recentJobs={recentJobs} />

        {/* 3. Browse by Category */}
        <FeaturesSection categories={categories} />

        {/* 4. Top Companies Hiring */}
        <TopCompaniesSection topCompanies={topCompanies} />

        {/* 5. Top Trending Skills */}
        <TrendingSkillsSection trendingSkills={trendingSkills} />

        {/* 6. Testimonials */}
        <TestimonialsSection testimonials={testimonials} />

        {/* 7. Call To Action Banner */}
        <CTASection user={auth?.user} />
      </div>
    </HomepageLayout>
  );
}