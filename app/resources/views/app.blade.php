<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8"/>
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="description" content="Application for review and vote the OnlyFans.com profiles">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0"/>
        <meta name="mobile-web-app-capable" content="yes">
        <meta http-equiv="Content-Security-Policy" content="default-src https: 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; img-src 'self' data: https://picsum.photos https://fastly.picsum.photos https://thumbs.onlyfans.com https://public.onlyfans.com; font-src 'self' data: https://cdn.jsdelivr.net https://fonts.gstatic.com; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://www.google.com https://www.gstatic.com https://cdn.jsdelivr.net https://www.google-analytics.com https://www.googletagmanager.com https://www.google.com https://www.gstatic.com https://cdn.jsdelivr.net; frame-src 'self' https://www.google.com https://www.google.com/recaptcha/ https://www.gstatic.com https://www.google.com/recaptcha/; script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:5173 https://www.google-analytics.com https://www.googletagmanager.com https://www.google.com https://www.gstatic.com https://cdn.jsdelivr.net https://www.google-analytics.com https://www.googletagmanager.com https://www.google.com https://www.gstatic.com https://cdn.jsdelivr.net; object-src 'none'; media-src 'self' data:; base-uri 'self'; form-action 'self';">
        <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
        <link rel="preconnect" href="https://thumbs.onlyfans.com" crossorigin />
        <link rel="preconnect" href="https://public.onlyfans.com" crossorigin />
        <link rel="dns-prefetch" href="https://thumbs.onlyfans.com" crossorigin />
        <link rel="dns-prefetch" href="https://public.onlyfans.com" crossorigin />
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,500;0,700;1,500&display=swap" onload="this.rel='stylesheet'" crossorigin>
        <title inertia>{{ config('app.name') }}</title>
        @routes
        @vite('resources/js/app.js')
        @inertiaHead
    </head>
    <body>
        <noscript><strong>{{ config('app.name') }}</strong></noscript>
        @inertia
    </body>
</html>
