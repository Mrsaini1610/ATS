import HomepageLayout from '@/Layouts/HomepageLayout';
import HeroSection from "@/Components/Home/HeroSection";
import StatsSection from "@/Components/Home/StatsSection";
import FeaturesSection from "@/Components/Home/FeaturesSection";
import FeaturedJobsSection from "@/Components/Home/FeaturedJobsSection";
import TestimonialsSection from "@/Components/Home/TestimonialsSection";
import CTASection from "@/Components/Home/CTASection";  
import { usePage } from "@inertiajs/react";
import { Head } from '@inertiajs/react';

// export default function Homepage() {
// export default function Homepage({ stats, jobs }){
//     return (
//         <HomepageLayout>
//             <Head title="Home" />

//             {/* Hero Section */}
//             <HeroSection />

//             {/* Stats Section */}
//             <StatsSection />

//             {/* Quick Links / Features Section */}
//             <FeaturesSection />

//             {/* Featured Jobs Section */}
//             <FeaturedJobsSection jobs={jobs} />

//             {/* Testimonials Section (Optional) */}
//             <TestimonialsSection />

//             {/* CTA Banner Section */}
//             <CTASection />
//         </HomepageLayout>
//     );
// }

export default function Homepage() {
  const { auth, stats, jobs, categories, testimonials } = usePage().props;

  return (
  
        <HomepageLayout>
     
         <Head title="Home" />
        {/* Hero Section */}
        <HeroSection user={auth?.user} />


        <div className="px-4 sm:px-6 space-y-8 max-w-7xl mx-auto">

        {/* Stats Strip */}
        <StatsSection stats={stats} />
          {/* Quick Actions & Categories */}
          <FeaturesSection categories={categories} />

          {/* Featured Jobs Section */}
          <FeaturedJobsSection jobs={jobs} />

          {/* Testimonials */}
          <TestimonialsSection testimonials={testimonials} />
        </div>
    </HomepageLayout>
      );
}