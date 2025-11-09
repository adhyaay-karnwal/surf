# Breeze Commercial Launch Checklist

Use this checklist when preparing a commercial distribution of Breeze so that all branding, accounts, and infrastructure are independent of the original Surf release.

## Branding & product identity

- [ ] Register `breeze.engineer` (or your chosen production domain) and point it to your marketing/download site.
- [ ] Replace application icons, splash screens, and hero imagery with Breeze-branded assets.
- [ ] Update the store listings (Microsoft Store, Apple notarisation metadata, Linux packages) with the Breeze description, screenshots, and contact email `adhyaay@breeze.engineer`.
- [ ] Review in-app copy to ensure it references Breeze as an AI browser for students.

## Support channels

- [ ] Configure `adhyaay@breeze.engineer` (or your support alias) in your mail provider.
- [ ] Set up the Breeze Discord server (or migrate community discussions) and update invite links in the repo, docs, and app settings.
- [ ] Update website contact forms or help widgets to reference the new support email.

## Infrastructure & telemetry

- [ ] Host Breeze downloads on your own CDN or object storage bucket and update environment variables (`BREEZE_SITE_URL`, `BREEZE_DOWNLOADS_URL`).
- [ ] Point telemetry/analytics endpoints to Breeze-owned services (set `M_VITE_TELEMETRY_URL`).
- [ ] Provision crash reporting or error tracking with keys that belong to Breeze.
- [ ] Configure auto-update feeds (GitHub Releases, S3, etc.) with Breeze-branded filenames (the build scripts already output `breeze-*.yml`).

## Build configuration

- [ ] Ensure `PRODUCT_NAME`, `M_VITE_PRODUCT_NAME`, and `APP_PROGID` are set to `Breeze` / `breeze` in CI pipelines.
- [ ] Set env vars for support email and site URL (`BREEZE_SITE_URL`, `BREEZE_SUPPORT_EMAIL`, `R_VITE_BREEZE_*` variants) in CI and production builds.
- [ ] Regenerate code signing/notarisation certificates under Breeze’s publisher name.
- [ ] Double-check license notices to credit “Adhyaay Karnwal”.

## Documentation & legal

- [ ] Update README, website copy, and legal pages to reference Breeze (no mentions of Deta or Surf).
- [ ] Publish a privacy policy covering analytics/telemetry endpoints you operate.
- [ ] Provide an EULA or terms of service tailored to Breeze’s commercial offering.

When every item is complete, rebuild the installers with the new environment variables and publish them to the Breeze website and distribution channels.
