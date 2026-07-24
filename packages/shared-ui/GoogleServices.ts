const configuredValue = (value: string | undefined, fallback: string) =>
  value?.trim() || fallback;

export const googleServices = {
  siteVerification: configuredValue(
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    "IkvKfVE37tDNIdqL_6UrzIWs77u-ic-4JYyuQBIWXXQ",
  ),
  analyticsId: configuredValue(
    process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    "G-V1SGVB9THY",
  ),
  adsenseClientId: configuredValue(
    process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID,
    "ca-pub-5371237012424410",
  ),
} as const;
