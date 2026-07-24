import Script from "next/script";
import { googleServices } from "./GoogleServices";

export function Analytics() {
  const { adsenseClientId, analyticsId } = googleServices;

  return (
    <>
      <Script
        id="google-analytics-loader"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsId)}`}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(analyticsId)});`}
      </Script>
      <Script
        id="adsense"
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseClientId)}`}
        crossOrigin="anonymous"
      />
    </>
  );
}
