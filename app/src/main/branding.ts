const DEFAULT_SITE_URL = 'https://breeze.engineer'
const DEFAULT_SUPPORT_EMAIL = 'adhyaay@breeze.engineer'

const rawSiteUrl =
  (import.meta.env?.M_VITE_BREEZE_SITE_URL as string | undefined) ?? process.env.BREEZE_SITE_URL

const rawSupportEmail =
  (import.meta.env?.M_VITE_BREEZE_SUPPORT_EMAIL as string | undefined) ??
  process.env.BREEZE_SUPPORT_EMAIL

export const BREEZE_SITE_URL = (rawSiteUrl && rawSiteUrl.trim()) || DEFAULT_SITE_URL
export const BREEZE_SUPPORT_EMAIL =
  (rawSupportEmail && rawSupportEmail.trim()) || DEFAULT_SUPPORT_EMAIL

export const BREEZE_DISCORD_URL = `${BREEZE_SITE_URL.replace(/\/$/, '')}/discord`
