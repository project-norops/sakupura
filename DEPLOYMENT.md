# Vercel deployment guide

This repository is an npm workspaces monorepo. Create one Vercel project for
each deployable application and connect both projects to the same GitHub
repository and `main` production branch.

The root `vercel.json` keeps the existing repository-root Vercel project
deploying the portal correctly. New projects should still use the Root
Directory settings below.

## Portal project

- Root Directory: `apps/portal`
- Framework Preset: Next.js
- Include source files outside the Root Directory: enabled
- Production domain: `https://www.norops.jp`

Environment variables:

```text
NEXT_PUBLIC_SITE_URL=https://www.norops.jp
NEXT_PUBLIC_DYNAMIC_PRICING_URL=https://<dynamic-pricing-production-domain>
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<optional override>
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=<optional override>
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID=<optional override>
```

`NEXT_PUBLIC_DYNAMIC_PRICING_URL` is intentionally required in production. If
it is missing, the portal renders the application card as unavailable instead
of sending visitors to a localhost URL.

## Dynamic pricing project

- Root Directory: `apps/001-dynamic-pricing`
- Framework Preset: Next.js
- Include source files outside the Root Directory: enabled

Environment variables:

```text
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<optional override>
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=<optional override>
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID=<optional override>
```

The Google values currently used by the site remain as code defaults in
`packages/shared-ui/GoogleServices.ts`. Configure the variables in Vercel when
rotating IDs or separating analytics properties by application.

## Verification after deployment

1. Confirm the deployment source paths begin with the expected `apps/...`
   Root Directory, not a legacy `100apps-*` directory.
2. View the production HTML and confirm `google-site-verification` is present.
3. Confirm requests to `googletagmanager.com/gtag/js` and
   `pagead2.googlesyndication.com` appear in the browser network panel.
4. Open `/robots.txt` and `/sitemap.xml` on the portal domain.
5. Only after both projects deploy successfully, archive or remove the legacy
   standalone directories.

Vercel reference: https://vercel.com/docs/monorepos
