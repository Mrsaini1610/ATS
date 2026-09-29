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

    <meta name="description" content="Apply directly to top verified companies with transparent salary and zero consultancy fees. 100% free for job seekers.">
    <meta name="keywords" content="ATS, Job Portal, Jobs in India, Direct Hiring, Verified Jobs, Tech Jobs, Delivery Jobs, Driver Jobs">
    <meta name="author" content="ATS">

    <!-- Open Graph / WhatsApp / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="{{ config('app.name', 'ATS') }}">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:title" content="ATS - Direct Hiring & Verified Jobs in India">
    <meta property="og:description" content="Apply directly to top verified companies with transparent salary and zero consultancy fees. 100% free for job seekers.">
    <meta property="og:image" content="{{ asset('images/og-banner.png') }}">
    <meta property="og:image:secure_url" content="{{ asset('images/og-banner.png') }}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="ATS Job Portal">

    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="ATS - Direct Hiring & Verified Jobs in India">
    <meta name="twitter:description" content="Apply directly to top verified companies with transparent salary. 100% free for job seekers.">
    <meta name="twitter:image" content="{{ asset('images/og-banner.png') }}">
    <meta name="twitter:image:alt" content="ATS Job Portal">

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
