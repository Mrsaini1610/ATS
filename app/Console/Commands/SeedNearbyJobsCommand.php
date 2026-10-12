<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Company;
use App\Models\JobPost;
use App\Models\Skill;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class SeedNearbyJobsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'jobs:seed-nearby';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed nearby companies, categories, skills, and 10 job posts within 10-15 km radius';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("🚀 Starting database seeding for nearby jobs, companies, skills & categories...");

        // 1. Categories
        $categoriesData = [
            [
                'name'   => 'Hospitality & Tourism 🏨',
                'slug'   => 'hospitality-tourism',
                'icon'   => '🏨',
                'status' => 'active',
            ],
            [
                'name'   => 'Logistics & Supply Chain 🚚',
                'slug'   => 'logistics-supply-chain',
                'icon'   => '🚚',
                'status' => 'active',
            ],
            [
                'name'   => 'Real Estate & Construction 🏗️',
                'slug'   => 'real-estate-construction',
                'icon'   => '🏗️',
                'status' => 'active',
            ],
            [
                'name'   => 'Renewable Energy & Electrical ⚡',
                'slug'   => 'renewable-energy-electrical',
                'icon'   => '⚡',
                'status' => 'active',
            ],
            [
                'name'   => 'Security & Facility Management 🛡️',
                'slug'   => 'security-facility-management',
                'icon'   => '🛡️',
                'status' => 'active',
            ],
            [
                'name'   => 'Automotive & EV Technology 🚗',
                'slug'   => 'automotive-ev-technology',
                'icon'   => '🚗',
                'status' => 'active',
            ],
        ];

        $savedCategories = [];
        foreach ($categoriesData as $cData) {
            $cat = Category::firstOrCreate(
                ['slug' => $cData['slug']],
                [
                    'uuid'       => (string) Str::uuid(),
                    'name'       => $cData['name'],
                    'icon'       => $cData['icon'],
                    'status'     => $cData['status'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
            $savedCategories[$cData['slug']] = $cat;
        }
        $this->info("✅ " . count($savedCategories) . " Categories verified / created.");

        // 2. Skills
        $skillsData = [
            ['name' => 'Hotel & Front Desk Management', 'category' => 'Hospitality & Tourism'],
            ['name' => 'Food & Beverage Operations', 'category' => 'Hospitality & Tourism'],
            ['name' => 'Fleet Management & Dispatch', 'category' => 'Logistics & Supply Chain'],
            ['name' => 'AutoCAD & Civil Estimation', 'category' => 'Real Estate & Construction'],
            ['name' => 'Solar PV Installation & Maintenance', 'category' => 'Renewable Energy & Electrical'],
            ['name' => 'CCTV & Electronic Surveillance', 'category' => 'Security & Facility Management'],
            ['name' => 'EV Battery & Diagnostics', 'category' => 'Automotive & EV Technology'],
            ['name' => 'Customer Relationship Management (CRM)', 'category' => 'Sales & Marketing'],
            ['name' => 'Inventory Control & Auditing', 'category' => 'Logistics & Supply Chain'],
            ['name' => 'Store Management & Merchandising', 'category' => 'Retail & Sales'],
        ];

        foreach ($skillsData as $sData) {
            Skill::firstOrCreate(
                ['name' => $sData['name']],
                [
                    'uuid'       => (string) Str::uuid(),
                    'category'   => $sData['category'],
                    'demand'     => 'high',
                    'status'     => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
        $this->info("✅ " . count($skillsData) . " Skills verified / created.");

        // 3. Companies (Within 10-15 km radius)
        $companiesData = [
            [
                'name'         => 'Heritage Haveli Resorts & Hotels',
                'slug'         => 'heritage-haveli-resorts-hotels',
                'logo'         => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=128&h=128&fit=crop',
                'website'      => 'https://heritagehaveli.in',
                'location'     => 'Sikar Road, Jaipur',
                'address'      => 'Near Chomu Pulia, Sikar Road, Jaipur 302013',
                'latitude'     => '26.98500000',
                'longitude'    => '75.73500000',
                'company_size' => '50 - 200 employees',
                'description'  => 'Heritage Haveli is an authentic Rajasthani hospitality and luxury heritage resort on Sikar Road.',
            ],
            [
                'name'         => 'VKI Logistics & Cargo Hub',
                'slug'         => 'vki-logistics-cargo-hub',
                'logo'         => 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=128&h=128&fit=crop',
                'website'      => 'https://vkilogistics.com',
                'location'     => 'VKI Industrial Area, Jaipur',
                'address'      => 'Road No. 5, Vishwakarma Industrial Area, Jaipur 302013',
                'latitude'     => '27.00500000',
                'longitude'    => '75.75500000',
                'company_size' => '100 - 500 employees',
                'description'  => 'Premier warehousing, freight forwarding and logistics network hub operating from VKI Jaipur.',
            ],
            [
                'name'         => 'Apex Solar & Green Energy Tech',
                'slug'         => 'apex-solar-green-energy-tech',
                'logo'         => 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=128&h=128&fit=crop',
                'website'      => 'https://apexsolargreen.com',
                'location'     => 'Vidhyadhar Nagar, Jaipur',
                'address'      => 'Sector 4, Central Spine, Vidhyadhar Nagar, Jaipur 302039',
                'latitude'     => '26.97200000',
                'longitude'    => '75.76800000',
                'company_size' => '20 - 100 employees',
                'description'  => 'Clean energy provider specializing in rooftop solar installations, solar EPC, and sustainable power.',
            ],
            [
                'name'         => 'Shree Ram Estate & Infra Developers',
                'slug'         => 'shree-ram-estate-infra-developers',
                'logo'         => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&h=128&fit=crop',
                'website'      => 'https://shreeramestate.com',
                'location'     => 'Ambabari, Jaipur',
                'address'      => 'Main Sikar Road, Ambabari Circle, Jaipur 302039',
                'latitude'     => '26.95500000',
                'longitude'    => '75.77200000',
                'company_size' => '50 - 200 employees',
                'description'  => 'Leading commercial and residential construction and infrastructure builder in North Jaipur.',
            ],
            [
                'name'         => 'Jaipur EV Motors & Fast Charging',
                'slug'         => 'jaipur-ev-motors-fast-charging',
                'logo'         => 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=128&h=128&fit=crop',
                'website'      => 'https://jaipurevmotors.com',
                'location'     => 'Jhotwara Industrial Area, Jaipur',
                'address'      => 'Plot 14-B, Industrial Area, Jhotwara, Jaipur 302012',
                'latitude'     => '26.94800000',
                'longitude'    => '75.72800000',
                'company_size' => '20 - 50 employees',
                'description'  => 'Specialists in 2W/3W electric vehicle manufacturing, battery repair, and EV charging stations.',
            ],
            [
                'name'         => 'ShieldGuard Security & Facilities',
                'slug'         => 'shieldguard-security-facilities',
                'logo'         => 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=128&h=128&fit=crop',
                'website'      => 'https://shieldguardfacility.in',
                'location'     => 'Shastri Nagar, Jaipur',
                'address'      => 'Opposite Science Park, Shastri Nagar, Jaipur 302016',
                'latitude'     => '26.94200000',
                'longitude'    => '75.78900000',
                'company_size' => '200 - 1000 employees',
                'description'  => 'Professional corporate facility management, electronic surveillance, and security personnel services.',
            ],
            [
                'name'         => 'Maruti Suzuki Regional Auto Service',
                'slug'         => 'maruti-suzuki-regional-auto-service',
                'logo'         => 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=128&h=128&fit=crop',
                'website'      => 'https://marutisuzukijaipur.com',
                'location'     => 'Vaishali Nagar, Jaipur',
                'address'      => 'Near Queens Road Circle, Vaishali Nagar, Jaipur 302021',
                'latitude'     => '26.91200000',
                'longitude'    => '75.74800000',
                'company_size' => '100 - 250 employees',
                'description'  => 'Authorized regional automobile sales and certified service center in West Jaipur.',
            ],
            [
                'name'         => 'Royal Orchid Banquets & Events',
                'slug'         => 'royal-orchid-banquets-events',
                'logo'         => 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=128&h=128&fit=crop',
                'website'      => 'https://royalorchidjaipur.in',
                'location'     => 'Civil Lines, Jaipur',
                'address'      => 'Jacob Road, Civil Lines, Jaipur 302006',
                'latitude'     => '26.91500000',
                'longitude'    => '75.78500000',
                'company_size' => '50 - 150 employees',
                'description'  => 'Grand banquet hall and catering facility organizing corporate seminars, weddings, and VIP galas.',
            ],
            [
                'name'         => 'BlueDart Express Delivery Hub',
                'slug'         => 'bluedart-express-delivery-hub',
                'logo'         => 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=128&h=128&fit=crop',
                'website'      => 'https://bluedart.com',
                'location'     => 'Murlipura Scheme, Jaipur',
                'address'      => 'Near Dadi Ka Phatak, Murlipura Scheme, Sikar Road, Jaipur 302039',
                'latitude'     => '26.98200000',
                'longitude'    => '75.74200000',
                'company_size' => '100 - 500 employees',
                'description'  => 'Primary express parcel and high-speed distribution facility catering to Jaipur North corridor.',
            ],
            [
                'name'         => 'UrbanNest Properties & Architecture',
                'slug'         => 'urbannest-properties-architecture',
                'logo'         => 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=128&h=128&fit=crop',
                'website'      => 'https://urbannestjaipur.com',
                'location'     => 'C-Scheme, Jaipur',
                'address'      => 'Sardar Patel Marg, C-Scheme, Jaipur 302001',
                'latitude'     => '26.90800000',
                'longitude'    => '75.80200000',
                'company_size' => '20 - 80 employees',
                'description'  => 'Boutique architectural consulting, luxury real estate leasing, and urban property consultancy.',
            ],
        ];

        $savedCompanies = [];
        foreach ($companiesData as $cData) {
            $comp = Company::firstOrCreate(
                ['slug' => $cData['slug']],
                array_merge($cData, [
                    'uuid'       => (string) Str::uuid(),
                    'status'     => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
            $savedCompanies[$cData['slug']] = $comp;
        }
        $this->info("✅ " . count($savedCompanies) . " Companies verified / created.");

        // 4. Job Posts
        $jobsData = [
            [
                'title'               => 'Front Office Executive & Guest Relations',
                'company_slug'        => 'heritage-haveli-resorts-hotels',
                'category_slug'       => 'hospitality-tourism',
                'job_type'            => 'Full Time',
                'experience'          => '1-3 Years',
                'min_experience'      => 1.0,
                'max_experience'      => 3.0,
                'min_salary'          => 18000,
                'max_salary'          => 28000,
                'salary_type'         => 'monthly',
                'openings'            => 3,
                'working_days'        => '6 Days (Rotational)',
                'shift_timing'        => '8:00 AM - 5:00 PM | Day Shift',
                'interview_details'   => 'Walk-in Monday to Friday 11:00 AM to 3:00 PM',
                'badge'               => 'featured',
                'skills'              => ['Hotel & Front Desk Management', 'Customer Support', 'Telecalling'],
                'languages'           => ['Hindi', 'English'],
                'perks'               => ['Free Duty Meals', 'Health Insurance', 'Overtime Allowance'],
                'qualifications'      => ['Graduate / Bachelor\'s', 'Diploma in Hotel Management'],
                'description'         => 'Manage guest arrivals, check-in/out operations, reservations and ensure a memorable traditional Rajasthani experience.',
            ],
            [
                'title'               => 'Logistics Fleet Operations Supervisor',
                'company_slug'        => 'vki-logistics-cargo-hub',
                'category_slug'       => 'logistics-supply-chain',
                'job_type'            => 'Full Time',
                'experience'          => '2-5 Years',
                'min_experience'      => 2.0,
                'max_experience'      => 5.0,
                'min_salary'          => 22000,
                'max_salary'          => 35000,
                'salary_type'         => 'monthly',
                'openings'            => 2,
                'working_days'        => 'Mon - Sat',
                'shift_timing'        => '9:00 AM - 7:00 PM',
                'interview_details'   => 'VKI Road No. 5 Warehouse Office, 12 PM - 4 PM',
                'badge'               => 'urgent',
                'skills'              => ['Fleet Management & Dispatch', 'Supply Chain & Logistics', 'Inventory Control & Auditing'],
                'languages'           => ['Hindi', 'English'],
                'perks'               => ['Travel Allowance', 'Provident Fund', 'Annual Bonus'],
                'qualifications'      => ['Graduate / Bachelor\'s'],
                'description'         => 'Oversee commercial vehicle dispatch, driver management, route optimization and cargo tracking across Rajasthan.',
            ],
            [
                'title'               => 'Solar PV Site Installation Engineer',
                'company_slug'        => 'apex-solar-green-energy-tech',
                'category_slug'       => 'renewable-energy-electrical',
                'job_type'            => 'Full Time',
                'experience'          => '1-4 Years',
                'min_experience'      => 1.0,
                'max_experience'      => 4.0,
                'min_salary'          => 25000,
                'max_salary'          => 40000,
                'salary_type'         => 'monthly',
                'openings'            => 4,
                'working_days'        => 'Mon - Sat',
                'shift_timing'        => '9:30 AM - 6:30 PM',
                'interview_details'   => 'Sector 4 Vidhyadhar Nagar Office, 11 AM - 3 PM',
                'badge'               => 'featured',
                'skills'              => ['Solar PV Installation & Maintenance', 'AutoCAD & Civil Estimation', 'Field Sales'],
                'languages'           => ['Hindi', 'English'],
                'perks'               => ['Fuel Allowance', 'Site Allowances', 'Accidental Insurance'],
                'qualifications'      => ['Diploma / B.Tech in Electrical or Mechanical'],
                'description'         => 'Lead rooftop and ground-mounted solar system installations, electrical wiring, inverter commissioning and site safety inspections.',
            ],
            [
                'title'               => 'Civil Site Supervisor & Quantity Surveyor',
                'company_slug'        => 'shree-ram-estate-infra-developers',
                'category_slug'       => 'real-estate-construction',
                'job_type'            => 'Full Time',
                'experience'          => '1-3 Years',
                'min_experience'      => 1.0,
                'max_experience'      => 3.0,
                'min_salary'          => 20000,
                'max_salary'          => 32000,
                'salary_type'         => 'monthly',
                'openings'            => 3,
                'working_days'        => 'Mon - Sat',
                'shift_timing'        => '9:00 AM - 6:30 PM',
                'interview_details'   => 'Ambabari Main Office, 11 AM - 4 PM',
                'badge'               => 'standard',
                'skills'              => ['AutoCAD & Civil Estimation', 'Field Sales', 'Excel & Data Entry'],
                'languages'           => ['Hindi'],
                'perks'               => ['Mobile Bill Reimbursement', 'Yearly Increment'],
                'qualifications'      => ['Diploma in Civil Engineering / ITI'],
                'description'         => 'Supervise on-site construction work, material quality checks, labor scheduling, and verify measurement sheets.',
            ],
            [
                'title'               => 'EV Service Technician & Battery Specialist',
                'company_slug'        => 'jaipur-ev-motors-fast-charging',
                'category_slug'       => 'automotive-ev-technology',
                'job_type'            => 'Full Time',
                'experience'          => '0-2 Years (Fresher Welcome)',
                'min_experience'      => 0.0,
                'max_experience'      => 2.0,
                'min_salary'          => 18000,
                'max_salary'          => 28000,
                'salary_type'         => 'monthly',
                'openings'            => 5,
                'working_days'        => 'Mon - Sat',
                'shift_timing'        => '10:00 AM - 7:00 PM',
                'interview_details'   => 'Jhotwara Industrial Workshop, 11 AM - 5 PM',
                'badge'               => 'urgent',
                'skills'              => ['EV Battery & Diagnostics', 'Customer Support'],
                'languages'           => ['Hindi'],
                'perks'               => ['Technical Training Provided', 'ESI & PF', 'Tools Allowance'],
                'qualifications'      => ['ITI Electrician / Motor Mechanic / Diploma'],
                'description'         => 'Diagnose electric scooters and 3-wheelers, BMS battery health checks, motor troubleshooting, and warranty repairs.',
            ],
            [
                'title'               => 'CCTV & Security Operations Controller',
                'company_slug'        => 'shieldguard-security-facilities',
                'category_slug'       => 'security-facility-management',
                'job_type'            => 'Full Time',
                'experience'          => '1-3 Years',
                'min_experience'      => 1.0,
                'max_experience'      => 3.0,
                'min_salary'          => 16000,
                'max_salary'          => 24000,
                'salary_type'         => 'monthly',
                'openings'            => 4,
                'working_days'        => '6 Days Rotational',
                'shift_timing'        => 'Day / Night Shifts (8 Hours)',
                'interview_details'   => 'Shastri Nagar Office, 10 AM - 2 PM',
                'badge'               => 'standard',
                'skills'              => ['CCTV & Electronic Surveillance', 'Customer Support'],
                'languages'           => ['Hindi'],
                'perks'               => ['Uniform & Equipment', 'Shift Allowances', 'PF'],
                'qualifications'      => ['12th Pass / Graduate'],
                'description'         => 'Live surveillance monitoring across multiple commercial client premises, incident log maintenance, and emergency response coordination.',
            ],
            [
                'title'               => 'Automobile Service Advisor & Customer Care',
                'company_slug'        => 'maruti-suzuki-regional-auto-service',
                'category_slug'       => 'automotive-ev-technology',
                'job_type'            => 'Full Time',
                'experience'          => '1-4 Years',
                'min_experience'      => 1.0,
                'max_experience'      => 4.0,
                'min_salary'          => 20000,
                'max_salary'          => 30000,
                'salary_type'         => 'monthly',
                'openings'            => 2,
                'working_days'        => 'Mon - Sat',
                'shift_timing'        => '9:00 AM - 6:30 PM',
                'interview_details'   => 'Vaishali Nagar Service Workshop, 11 AM - 4 PM',
                'badge'               => 'featured',
                'skills'              => ['Customer Relationship Management (CRM)', 'Customer Support', 'Telecalling'],
                'languages'           => ['Hindi', 'English'],
                'perks'               => ['Performance Incentives', 'Health Insurance', 'Paid Leaves'],
                'qualifications'      => ['Diploma / Graduate'],
                'description'         => 'Interact with car owners, prepare vehicle job cards, coordinate with mechanics for repair estimates, and ensure customer satisfaction.',
            ],
            [
                'title'               => 'F&B Banquet & Events Coordinator',
                'company_slug'        => 'royal-orchid-banquets-events',
                'category_slug'       => 'hospitality-tourism',
                'job_type'            => 'Full Time',
                'experience'          => '1-3 Years',
                'min_experience'      => 1.0,
                'max_experience'      => 3.0,
                'min_salary'          => 20000,
                'max_salary'          => 30000,
                'salary_type'         => 'monthly',
                'openings'            => 3,
                'working_days'        => '6 Days',
                'shift_timing'        => '12:00 PM - 10:00 PM',
                'interview_details'   => 'Civil Lines Banquet Office, 2 PM - 6 PM',
                'badge'               => 'standard',
                'skills'              => ['Food & Beverage Operations', 'Hotel & Front Desk Management', 'Customer Support'],
                'languages'           => ['Hindi', 'English'],
                'perks'               => ['Service Charge Distribution', 'Duty Meals', 'Bonus'],
                'qualifications'      => ['Diploma / Degree in Hospitality or Event Management'],
                'description'         => 'Manage banquet bookings, catering coordination, table setups, stage aesthetics, and food service delivery during corporate and wedding events.',
            ],
            [
                'title'               => 'Warehouse Inventory & Dispatch Executive',
                'company_slug'        => 'bluedart-express-delivery-hub',
                'category_slug'       => 'logistics-supply-chain',
                'job_type'            => 'Full Time',
                'experience'          => '0-2 Years (Fresher Welcome)',
                'min_experience'      => 0.0,
                'max_experience'      => 2.0,
                'min_salary'          => 18000,
                'max_salary'          => 25000,
                'salary_type'         => 'monthly',
                'openings'            => 4,
                'working_days'        => 'Mon - Sat',
                'shift_timing'        => '9:30 AM - 6:30 PM',
                'interview_details'   => 'Murlipura Scheme Hub, 10 AM - 3 PM',
                'badge'               => 'urgent',
                'skills'              => ['Inventory Control & Auditing', 'Fleet Management & Dispatch', 'Excel & Data Entry'],
                'languages'           => ['Hindi'],
                'perks'               => ['Overtime Payment', 'PF & ESI', 'Monthly Attendance Bonus'],
                'qualifications'      => ['12th Pass / Graduate'],
                'description'         => 'Scan arriving parcels, reconcile inventory records against shipping manifests, update dispatch portal, and coordinate with courier delivery riders.',
            ],
            [
                'title'               => 'Real Estate Sales & CRM Associate',
                'company_slug'        => 'urbannest-properties-architecture',
                'category_slug'       => 'real-estate-construction',
                'job_type'            => 'Full Time',
                'experience'          => '1-4 Years',
                'min_experience'      => 1.0,
                'max_experience'      => 4.0,
                'min_salary'          => 25000,
                'max_salary'          => 45000,
                'salary_type'         => 'monthly',
                'openings'            => 3,
                'working_days'        => 'Mon - Sat',
                'shift_timing'        => '10:00 AM - 7:00 PM',
                'interview_details'   => 'C-Scheme Main Office, 11 AM - 4 PM',
                'badge'               => 'featured',
                'skills'              => ['Customer Relationship Management (CRM)', 'Field Sales', 'Telecalling'],
                'languages'           => ['Hindi', 'English'],
                'perks'               => ['Attractive Deal Commissions', 'Travel Allowance', 'Smartphone Provided'],
                'qualifications'      => ['Graduate / MBA Marketing'],
                'description'         => 'Attend inbound high-net-worth client leads, conduct site visits of luxury apartments and commercial offices in Jaipur, and negotiate closing terms.',
            ],
        ];

        $insertedCount = 0;
        foreach ($jobsData as $jData) {
            $comp = $savedCompanies[$jData['company_slug']];
            $cat  = $savedCategories[$jData['category_slug']];

            $job = JobPost::firstOrCreate(
                [
                    'company_id' => $comp->id,
                    'title'      => $jData['title'],
                ],
                [
                    'uuid'              => (string) Str::uuid(),
                    'company_uuid'      => $comp->uuid,
                    'company_id'        => $comp->id,
                    'company'           => $comp->name,
                    'company_about'     => $comp->description,
                    'company_size'      => $comp->company_size,
                    'company_address'   => $comp->address,
                    'company_image'     => $comp->logo,
                    'category_id'       => $cat->id,
                    'location'          => $comp->location,
                    'latitude'          => $comp->latitude,
                    'longitude'         => $comp->longitude,
                    'job_type'          => $jData['job_type'],
                    'experience'        => $jData['experience'],
                    'min_experience'    => $jData['min_experience'],
                    'max_experience'    => $jData['max_experience'],
                    'min_salary'        => $jData['min_salary'],
                    'max_salary'        => $jData['max_salary'],
                    'salary_type'       => $jData['salary_type'],
                    'openings'          => $jData['openings'],
                    'working_days'      => $jData['working_days'],
                    'shift_timing'      => $jData['shift_timing'],
                    'interview_details' => $jData['interview_details'],
                    'badge'             => $jData['badge'],
                    'skills'            => $jData['skills'],
                    'languages'         => $jData['languages'],
                    'perks'             => $jData['perks'],
                    'qualifications'    => $jData['qualifications'],
                    'description'       => $jData['description'],
                    'contact_person'    => 'HR Recruitment Team',
                    'contact_phone'     => '9829012345',
                    'contact_email'     => 'hr@' . $comp->slug . '.com',
                    'status'            => 'approved',
                    'is_deleted'        => 0,
                    'created_by'        => 6,
                    'approved_by'       => 6,
                    'approved_at'       => now(),
                    'created_at'        => now(),
                    'updated_at'        => now(),
                ]
            );
            $insertedCount++;
        }

        $this->info("🎉 Done! Successfully verified / created {$insertedCount} nearby Job Posts in database.");
        return Command::SUCCESS;
    }
}
