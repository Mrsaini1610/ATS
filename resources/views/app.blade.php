<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">


    <meta name="theme-color" content="#0c3da4">
    <meta name="msapplication-TileColor" content="#0c3da4">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">

    <title inertia>{{ config('app.name', 'ATS') }} - Direct Hiring & Verified Jobs in India</title>

    <meta name="description" content="Search & apply directly to 10,000+ verified job vacancies in India on ATS. 100% free for job seekers, transparent salaries, verified companies, zero consultancy fees.">
    <meta name="keywords" content="ATS, ATS Job Portal, ATS Technology Hiring, Jobs in India, Direct Hiring, Verified Jobs, Jobs in Jaipur, Jobs in Delhi NCR, Jobs in Mumbai, Jobs in Bengaluru, Jobs in Pune, Freshers Jobs, Telecaller Jobs, Sales Jobs, IT Jobs, Work From Home Jobs, 100% Free Job Search">
    <meta name="author" content="ATS">

    <!-- Search Engine Indexing & Crawling -->
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <link rel="canonical" href="{{ url()->current() }}">
    <link rel="alternate" hreflang="en-IN" href="{{ url()->current() }}">
    <link rel="alternate" hreflang="x-default" href="{{ url()->current() }}">
    <meta name="geo.region" content="IN">
    <meta name="geo.placename" content="India">

    <!-- Open Graph / WhatsApp / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="{{ config('app.name', 'ATS') }}">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:title" content="ATS - Direct Hiring & Verified Jobs in India">
    <meta property="og:description" content="Search & apply directly to 10,000+ verified job vacancies in India on ATS. 100% free for job seekers, transparent salaries, zero consultancy fees.">
    <meta property="og:image" content="{{ asset('images/og-banner.png') }}">
    <meta property="og:image:secure_url" content="{{ asset('images/og-banner.png') }}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="ATS Job Portal">

    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="ATS - Direct Hiring & Verified Jobs in India">
    <meta name="twitter:description" content="Search & apply directly to verified jobs in India with transparent salary and zero consultancy fees.">
    <meta name="twitter:image" content="{{ asset('images/og-banner.png') }}">
    <meta name="twitter:image:alt" content="ATS Job Portal">

    <!-- Google Structured Data (JSON-LD) -->
    <!-- Google Structured Data (JSON-LD) -->
    <script type="application/ld+json">
    {!! json_encode([
        chr(64) . 'context' => 'https://schema.org',
        chr(64) . 'type' => 'WebSite',
        'name' => 'ATS - Direct Hiring Job Portal',
        'alternateName' => ['ATS', 'ATS Technology Hiring', 'ATS Jobs'],
        'url' => url('/'),
        'potentialAction' => [
            chr(64) . 'type' => 'SearchAction',
            'target' => [
                chr(64) . 'type' => 'EntryPoint',
                'urlTemplate' => url('/job-search') . '?q={search_term_string}'
            ],
            'query-input' => 'required name=search_term_string'
        ]
    ], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) !!}
    </script>
    <script type="application/ld+json">
    {!! json_encode([
        chr(64) . 'context' => 'https://schema.org',
        chr(64) . 'type' => 'Organization',
        'name' => 'ATS',
        'legalName' => 'ATS Technology Hiring',
        'url' => url('/'),
        'logo' => asset('images/logo.png'),
        'description' => "India's premier direct hiring platform connecting verified candidates directly with top employers with zero consultancy charges.",
        'address' => [
            chr(64) . 'type' => 'PostalAddress',
            'addressCountry' => 'IN'
        ],
        'contactPoint' => [
            chr(64) . 'type' => 'ContactPoint',
            'contactType' => 'Customer Support',
            'email' => 'uniquetech.supt@gmail.com',
            'areaServed' => 'IN',
            'availableLanguage' => ['English', 'Hindi']
        ]
    ], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) !!}
    </script>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
    <link rel="icon" href="/images/fav_icon.png" type="image/png">
    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia

    <script>
        if (typeof toastr !== 'undefined') {
            @if (Session::has('success'))
                toastr.success("{{ Session::get('success') }}");
            @endif

            @if (Session::has('error'))
                toastr.error("{{ Session::get('error') }}");
            @endif

            @if (Session::has('warning'))
                toastr.warning("{{ Session::get('warning') }}");
            @endif

            @if (Session::has('info'))
                toastr.info("{{ Session::get('info') }}");
            @endif
        }
    </script>
    <script>
    window.__APP_SETTINGS = @json(\App\Models\SiteSetting::getAllSettings());
</script>

</body>

</html>
