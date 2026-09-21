import React from "react";
import HomepageLayout from "@/Layouts/HomepageLayout";
import HeroSection from "@/Components/Home/HeroSection";
import StatsSection from "@/Components/Home/StatsSection";
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
      <Head title="WorkIndia ATS - Direct Hiring & Verified Jobs in India" />

      {/* Hero Section with Live Search */}
      <HeroSection user={auth?.user} />

      <div className="px-4 sm:px-6 space-y-10 sm:space-y-14 max-w-7xl mx-auto py-8">
        {/* Stats Strip */}
        <StatsSection stats={stats} />

        {/* 1. Recommended Jobs Section (Profile-matched when logged in, teaser for guests) */}
        <RecommendedJobsSection
          recommendedJobs={recommendedJobs}
          isLoggedIn={isLoggedIn}
          candidateProfile={candidateProfile}
        />

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
        <CTASection />
      </div>
    </HomepageLayout>
  );
}