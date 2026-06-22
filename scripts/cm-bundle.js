<!DOCTYPE html>
<html id="html" class="arena-html" lang="en" dir="ltr" style="margin: 0px; padding: 0px;">
<head>
    <base href="/">
        <link rel="preload" href="/arena/boot" as="fetch" crossorigin />
<script>
    window["cmArenaBoot"] = (function() {
        var url = "/arena/boot";
        try { var v = sessionStorage.getItem("useGrainBootData"); if (v === "true" || v === "false") url += "?useGrainBootData=" + v; } catch(e) {}
        return window.fetch?.(url)?.then(function(r) { return r.json(); });
    })();
    (window.dataLayer = window.dataLayer || []).push({
        originalLocation: location.href.split("#")[0]
    });
</script>
    <link rel="preload" href="https://www.challengermode.com/_arenablob/20260622.8/locales/en/translations.json" as="fetch" crossorigin />
    <link rel="preload" href="https://www.challengermode.com/_arenablob/20260622.8/locales/en/toast.json" as="fetch" crossorigin />
    <link rel="preload" href="https://www.challengermode.com/_arenablob/20260622.8/locales/en/arena-home.json" as="fetch" crossorigin />
    <link rel="preload" href="https://www.challengermode.com/_arenablob/20260622.8/locales/en/errors.json" as="fetch" crossorigin />
    <link rel="preload" href="https://www.challengermode.com/_arenablob/20260622.8/locales/en/game.json" as="fetch" crossorigin />
<script>
    (function() {
        var sl = "en";
        var m = document.cookie.match(/(?:^|;\s*)ChallengermodePreferredLanguage=([a-z]{2})/);
        if (m && (!document.documentElement.lang || document.documentElement.lang !== m[1])) {
            document.documentElement.lang = m[1];
            var meta = document.getElementById("cm-content-language");
            if (meta) meta.setAttribute("content", m[1]);
        }
        if (m && m[1] !== sl) {
            var ns = ["translations","toast","arena-home","errors","game"];
            for (var i = 0; i < ns.length; i++) {
                var l = document.createElement("link");
                l.rel = "preload";
                l.as = "fetch";
                l.crossOrigin = "anonymous";
                l.href = "https://www.challengermode.com/_arenablob/20260622.8/locales/" + m[1] + "/" + ns[i] + ".json";
                document.head.appendChild(l);
            }
        }
    })();
</script>

    <script>
        window.cmTrackerSettings = {
            googleAnalyticsTrackingId: "G-S1W6V8XNQM",
            googleAnalyticsEnabled: true,
            googleTagManagerContainerId: "GTM-K49ZZPH",
            googleTagManagerEnabled: true,
            facebookPixelId: "1363905500304531",
            facebookPixelEnabled: true,
            tiktokPixelId: "CBMCA2RC77U40OTQTJP0",
            tiktokPixelEnabled: true,
            trackingHost: "https://gtm.challengermode.com",
            useServerSideGtm: true
        };
    </script>

    <link rel="preconnect" href="https://ap2.challengermode.com" crossorigin />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
    <link rel="preconnect" href="https://image1.challengermode.com/" />

<link rel="preload" as="style" href="https://fonts.googleapis.com/css?family=Poppins:700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Poppins:700&display=swap">
<link rel="preload" as="style" href="https://fonts.googleapis.com/css?family=Inter:300,400,400i,600,700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter:300,400,400i,600,700&display=swap">





                <link rel="preload" href="https://www.challengermode.com/_arenablob/20260622.8/assets/index-Bxe6nkDJ.css" as="style">
                <link rel="stylesheet" href="https://www.challengermode.com/_arenablob/20260622.8/assets/index-Bxe6nkDJ.css" media="print" onload="this.media='all'">
                <noscript>
                    <link rel="stylesheet" href="https://www.challengermode.com/_arenablob/20260622.8/assets/index-Bxe6nkDJ.css">
                </noscript>
            
                <link rel="preload" href="https://www.challengermode.com/_arenablob/20260622.8/assets/vendor-CO9cxbdG.css" as="style">
                <link rel="stylesheet" href="https://www.challengermode.com/_arenablob/20260622.8/assets/vendor-CO9cxbdG.css" media="print" onload="this.media='all'">
                <noscript>
                    <link rel="stylesheet" href="https://www.challengermode.com/_arenablob/20260622.8/assets/vendor-CO9cxbdG.css">
                </noscript>
            
                <link rel="preload" href="https://www.challengermode.com/_arenablob/20260622.8/assets/common-CAZqJ6t6.css" as="style">
                <link rel="stylesheet" href="https://www.challengermode.com/_arenablob/20260622.8/assets/common-CAZqJ6t6.css" media="print" onload="this.media='all'">
                <noscript>
                    <link rel="stylesheet" href="https://www.challengermode.com/_arenablob/20260622.8/assets/common-CAZqJ6t6.css">
                </noscript>
            
<script crossorigin="anonymous" id="cm-webpack-manifest" src="https://www.challengermode.com/_arenablob/20260622.8/DPLF9gWF.js" type="module"></script>            
<link crossorigin="anonymous" href="https://www.challengermode.com/_arenablob/20260622.8/BsLHMcYM.js" rel="modulepreload" />                
<link crossorigin="anonymous" href="https://www.challengermode.com/_arenablob/20260622.8/GVdKFWiU.js" rel="modulepreload" />                
<link crossorigin="anonymous" href="https://www.challengermode.com/_arenablob/20260622.8/CVvv_7PJ.js" rel="modulepreload" />                
<link crossorigin="anonymous" href="https://www.challengermode.com/_arenablob/20260622.8/Dzsy98x72.js" rel="modulepreload" />                
<link crossorigin="anonymous" href="https://www.challengermode.com/_arenablob/20260622.8/ChFB72at.js" rel="modulepreload" />                
<link crossorigin="anonymous" href="https://www.challengermode.com/_arenablob/20260622.8/ZSMpUAG-.js" rel="modulepreload" />                
<link crossorigin="anonymous" href="https://www.challengermode.com/_arenablob/20260622.8/Ds8wfQp9.js" rel="modulepreload" />                
<link crossorigin="anonymous" href="https://www.challengermode.com/_arenablob/20260622.8/CHXjvc0T.js" rel="modulepreload" />                
<link crossorigin="anonymous" href="https://www.challengermode.com/_arenablob/20260622.8/DgPXVZQj.js" rel="modulepreload" />                


<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="viewport" content="width=750, user-scalable=no">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">

    <link rel="icon" type="image/png" href="https://image1.challengermode.com/eff288f6-f9eb-46bc-994c-08dea4f3bcf1_32_32">
    <link rel="manifest" href="/pwa-manifest.json">
    <link rel="search" type="application/opensearchdescription+xml" href="/opensearch" title="Challengermode">
    <link rel="alternate" hreflang="en" href="https://www.challengermode.com/Arena/HandleErrors/404?lang=en" class="cm-hreflang" />
    <link rel="alternate" hreflang="sv" href="https://www.challengermode.com/Arena/HandleErrors/404?lang=sv" class="cm-hreflang" />
    <link rel="alternate" hreflang="es" href="https://www.challengermode.com/Arena/HandleErrors/404?lang=es" class="cm-hreflang" />
    <link rel="alternate" hreflang="pt" href="https://www.challengermode.com/Arena/HandleErrors/404?lang=pt" class="cm-hreflang" />
    <link rel="alternate" hreflang="ru" href="https://www.challengermode.com/Arena/HandleErrors/404?lang=ru" class="cm-hreflang" />
    <link rel="alternate" hreflang="de" href="https://www.challengermode.com/Arena/HandleErrors/404?lang=de" class="cm-hreflang" />
    <link rel="alternate" hreflang="fr" href="https://www.challengermode.com/Arena/HandleErrors/404?lang=fr" class="cm-hreflang" />
    <link rel="alternate" hreflang="ja" href="https://www.challengermode.com/Arena/HandleErrors/404?lang=ja" class="cm-hreflang" />
    <link rel="alternate" hreflang="pl" href="https://www.challengermode.com/Arena/HandleErrors/404?lang=pl" class="cm-hreflang" />
    <link rel="alternate" hreflang="nl" href="https://www.challengermode.com/Arena/HandleErrors/404?lang=nl" class="cm-hreflang" />
    <link rel="alternate" hreflang="tr" href="https://www.challengermode.com/Arena/HandleErrors/404?lang=tr" class="cm-hreflang" />
    <link rel="alternate" hreflang="zh" href="https://www.challengermode.com/Arena/HandleErrors/404?lang=zh" class="cm-hreflang" />
    <link rel="alternate" hreflang="ko" href="https://www.challengermode.com/Arena/HandleErrors/404?lang=ko" class="cm-hreflang" />
    <link rel="alternate" hreflang="ar" href="https://www.challengermode.com/Arena/HandleErrors/404?lang=ar" class="cm-hreflang" />
    <link rel="alternate" hreflang="it" href="https://www.challengermode.com/Arena/HandleErrors/404?lang=it" class="cm-hreflang" />
<link rel="alternate" hreflang="x-default" href="https://www.challengermode.com/Arena/HandleErrors/404?lang=en" class="cm-hreflang" />

<meta name="theme-color" content="#252730">
<meta name="msapplication-navbutton-color" content="#252730">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Challengermode">
    <link rel="apple-touch-icon" sizes="192x192" href="https://assets1.challengermode.com/app/2021-07-16/icon-192x192.png">
    <link rel="apple-touch-icon" sizes="256x256" href="https://assets1.challengermode.com/app/2021-07-16/icon-256x256.png">
    <link rel="apple-touch-icon" sizes="384x384" href="https://assets1.challengermode.com/app/2021-07-16/icon-384x384.png">
    <link rel="apple-touch-icon" sizes="512x512" href="https://assets1.challengermode.com/app/2021-07-16/icon-512x512.png">
    <link rel="apple-touch-startup-image" href="https://assets1.challengermode.com/app/2021-07-16/splashscreens/iphone6_splash.png">
    <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" href="https://assets1.challengermode.com/app/2021-07-16/splashscreens/iphonex_splash.png">
    <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="https://assets1.challengermode.com/app/2021-07-16/splashscreens/iphone6_splash.png">
    <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" href="https://assets1.challengermode.com/app/2021-07-16/splashscreens/iphoneplus_splash.png">
    <link rel="apple-touch-startup-image" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" href="https://assets1.challengermode.com/app/2021-07-16/splashscreens/iphone5_splash.png">

<link rel="alternate" type="application/atom+xml" href="https://www.challengermode.com/xml/feed/tournaments" />
<link rel="alternate" type="application/atom+xml" href="https://www.challengermode.com/xml/feed/spaces" />
<link rel="alternate" type="application/atom+xml" href="https://www.challengermode.com/classifieds/feed" />


<meta name="description" content="Leading platform for esports competitions. Compete in high quality tournaments from the best organizers or create your own Space &amp; monetize your community." />
<meta name="keywords" content="challengermode esports join compete win play competitions tournaments leagues ladders leaderboards stats earn real money cash prizes league of legends lol counter-strike: global offensive csgo playerunknowns battlegrounds pubg dota 2 teamfight tactics tft valorant wildrift free fire new state tft apex call of duty warzone fifa rb6 rocket league hearthstone fortnite overwatch">
<meta name="robots" content="index, follow" />

<script type="application/ld+json">
    {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Challengermode",
    "legalName": "Challengermode AB",
    "url": "https://www.challengermode.com",
    "logo": "https://assets1.challengermode.com/app/2021-07-16/icon-512x512.png",
    "foundingDate": "2014",
    "foundingLocation": {
        "@type": "Place",
        "name": "Stockholm, Sweden"
    },
    "description": "Competition management platform powering tournaments, matchmaking, ladders, and gamification for gaming and non-gaming industries. 500K+ unique organic monthly visitors. 33M+ competitions hosted. 200+ game titles. 80+ countries.",
    "numberOfEmployees": {
        "@type": "QuantitativeValue",
        "minValue": 50
    },
    "sameAs": [
        "https://twitter.com/challengermode",
        "https://www.linkedin.com/company/challengermode",
        "https://www.instagram.com/challengermode",
        "https://www.youtube.com/challengermode",
        "https://discord.gg/challengermode"
    ],
    "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "sales",
        "email": "esports@challengermode.com",
        "url": "https://www.challengermode.com/contact"
    },
    "knowsAbout": [
        "Esports",
        "Competitive gaming",
        "Tournament management",
        "Matchmaking",
        "Ladders and leaderboards",
        "Gamification",
        "Whitelabel platforms",
        "Game integration APIs",
        "In-game competitions",
        "Golf entertainment technology",
        "Employee engagement gamification"
    ],
    "areaServed": "Worldwide",
    "slogan": "Competition management at any scale",
    "dateModified": "2026-03-10"
    }
</script>
<meta http-equiv="content-language" content="en" id="cm-content-language">
<link rel="canonical" href="https://www.challengermode.com/Arena/HandleErrors/404" id="cm-canonical" />

    <link rel="dns-prefetch" href="https://connect.facebook.net" />
    <link rel="dns-prefetch" href="https://gtm.challengermode.com" />
    <link rel="dns-prefetch" href="https://syndication.twitter.com" />
    <link rel="dns-prefetch" href="https://www.google-analytics.com" />
    <link rel="dns-prefetch" href="https://stats.g.doubleclick.net" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@challengermode" />
<meta name="twitter:title" content="Challengermode" />
<meta name="twitter:description" content="Leading platform for esports competitions. Compete in high quality tournaments from the best organizers or create your own Space &amp; monetize your community." />
<meta name="twitter:image" content="https://assets1.challengermode.com/app/2022-05-25/og_image.jpg" />

<meta property="og:url" content="https://www.challengermode.com" />
<meta property="og:title" content="Challengermode" />
<meta property="og:description" content="Leading platform for esports competitions. Compete in high quality tournaments from the best organizers or create your own Space &amp; monetize your community." />
<meta property="og:image" content="https://assets1.challengermode.com/app/2022-05-25/og_image.jpg" />
    <meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<meta property="og:type" content="website" />

<meta property="og:site_name" content="Challengermode" />
<meta name="wot-verification" content="3625f24494c7ac4f0ad3" />
<meta name="a.validate.02" content="KEFssI5Or3jZLBszbetgOok-kxbnyWPWlNyA" />
<meta name="propeller" content="906abe8f5dd8f8a0b0bd14605616991e" />

<meta property="fb:app_id" content="1179483245396310" />

<title>Challengermode</title>

<style>
    body::after {
        content: "none";
        display: none !important
    }

    @media (max-width:1920px) {
        body::after {
            content: "breakpoint--full-hd"
        }
    }

    @media (max-width:1280px) {
        body::after {
            content: "breakpoint--hd"
        }
    }

    @media (max-width:1024px) {
        body::after {
            content: "breakpoint--tablet"
        }
    }

    @media (max-width:642px) {
        body::after {
            content: "breakpoint--mobile"
        }
    }
</style>


<style>.cm-ssr-hero-cloak{visibility:hidden}.cm-ssr-hero-offstage{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);clip-path:inset(50%);white-space:nowrap}</style>
<style>html.cm-auth-hint .cm-login-cloak{display:none}.cm-auth-content-hint{display:none}html.cm-auth-hint .cm-auth-content-hint{display:block}</style>
<script>(function(){var m=document.cookie.match(/(?:^|;\s*)cm_li=(\d)/);if(m){document.documentElement.classList.add('cm-auth-hint')}})();</script>

</head>
<body style="margin: 0px; padding: 0px; background: var(--cm-colors-bg1, #171C26);">
    

        <div id="cm-spinner">
            
<style>
    .cm-loader {
        display: flex;
        align-items: flex-start;
        justify-content: center;
    }

    .spinner {
        width: 64px;
        height: 64px;
        position: relative;
    }

    .circle {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
    }

    .path {
        stroke-dasharray: 188.5;
        stroke-dashoffset: 0;
        transform-origin: center;
        animation: spin 1.5s ease-in-out infinite;
        stroke: var(--cm-colors-accent, #40e0d0);
    }

    @keyframes spin {
        0% {
            stroke-dashoffset: 188.5;
            transform: rotate(0deg);
        }
        50% {
            stroke-dashoffset: 47.1;
            transform: rotate(180deg);
        }
        100% {
            stroke-dashoffset: 188.5;
            transform: rotate(360deg);
        }
    }
</style>

<div style="height: 100vh;
            width: 100%;
            display: flex;
            flex-direction: column;
            text-align: center;
            font-family: 'Inter', 'Roboto', sans-serif;">
    <div style="flex: 1 1 auto;
                display: flex;
                align-items: center;
                justify-content: center;
                padding-bottom: 150px;">
        <div style="display:flex; flex-direction:column; align-items:center; gap:24px; padding: 0 20px;">
            <div class="cm-loader">
                <div class="spinner">
                    <svg class="circle">
                        <circle
                            class="path"
                            cx="32"
                            cy="32"
                            r="30"
                            fill="none"
                            stroke-width="3"/>
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <div style="flex: 0 0 auto;
            padding: 30px;
            font-size: 12px;
            line-height: 1.5;
            color: #60759F;
            font-weight: 500">
        Connection problems?
        <a href="mailto:support@challengermode.com?subject=Connection problems" style="text-decoration: underline; color: #60759F;" rel="noopener noreferrer">
            Let us know!
        </a>
    </div>
    <div id="cm-debug-info"
         style="position: fixed;
                display: flex;
                flex: 0 0 auto;
                flex-direction: column;
                width: 100%;
                max-width: 500px;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                opacity: 0;
                transition: opacity 2s ease-in-out 8s;
                padding: 30px;
                font-size: 12px;
                line-height: 1.5;
                color: #60759F;
                font-weight: 500">
                <div id="cm-debug-info-button" style="font-size: 20px; font-weight: 700; padding: 10px; cursor: pointer" onclick="toggleDebugDump()">!</div>
                <div id="cm-debug-info-dump" style="display: none;
                                                    flex: 0 0 auto;
                                                    flex-direction: column;"></div>
    </div>
</div>

<script type="text/javascript">
    function toggleDebugDump() {
        var _dumpElement = document.getElementById("cm-debug-info-dump");
        _dumpElement.style.display = _dumpElement.style.display === "flex" ? "none" : "flex";
    }
</script>

        </div>
        <div id="react-root"></div>

    <div id="arena-hidden" class="hidden" hidden></div>
    
    <div id="react-modal-root"></div>
<script>

    window.cmArenaParams = {"serverTime":"2026-06-22T12:47:41.1797142Z","version":"v0.10.0-1959-gcb4c34f7b5cd","imageBaseUrl":"https://image1.challengermode.com/","isAuthenticated":false,"ownUserId":"","apiProxyUrl":"https://ap2.challengermode.com","publicApiProxyUrl":"https://publicapi.challengermode.com","isProduction":true,"isSlot":false,"id":"","data2":"","extraParams":null,"area":"arena","statusCode":404,"enableSupportWidget":true,"tId":"8d7f1d5d-54c6-4f7e-8f6b-9f91bca3ecba","isDefaultTenant":true}; 
</script>


    
</body>
</html>
