import Script from "next/script";

export function Analytics() {
  return (
    <>
      <Script
        id="gsc-verification"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `document.querySelector('head')?.insertAdjacentHTML('beforeend', '<meta name="google-site-verification" content="IkvKfVE37tDNIdqL_6UrzIWs77u-ic-4JYyuQBIWXXQ" />');`,
        }}
      />
      <Script
        id="adsense"
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5371237012424410"
        crossOrigin="anonymous"
      />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-V1SGVB9THY');`}
      </Script>
    </>
  );
}
