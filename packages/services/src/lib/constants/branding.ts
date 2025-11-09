const DEFAULT_SITE_URL = 'https://breeze.engineer'
const DEFAULT_SUPPORT_EMAIL = 'adhyaay@breeze.engineer'

const env = import.meta.env ?? {}

const siteUrlFromEnv =
  (env.R_VITE_BREEZE_SITE_URL as string | undefined) ??
  (env.VITE_BREEZE_SITE_URL as string | undefined) ??
  (env.M_VITE_BREEZE_SITE_URL as string | undefined)

const supportEmailFromEnv =
  (env.R_VITE_BREEZE_SUPPORT_EMAIL as string | undefined) ??
  (env.VITE_BREEZE_SUPPORT_EMAIL as string | undefined) ??
  (env.M_VITE_BREEZE_SUPPORT_EMAIL as string | undefined)

export const BREEZE_SITE_URL = siteUrlFromEnv?.trim() || DEFAULT_SITE_URL
export const BREEZE_SUPPORT_EMAIL = supportEmailFromEnv?.trim() || DEFAULT_SUPPORT_EMAIL

export const BREEZE_DISCORD_URL = `${BREEZE_SITE_URL.replace(/\/$/, '')}/discord`
export const BREEZE_DOWNLOADS_URL = `${BREEZE_SITE_URL.replace(/\/$/, '')}/downloads`
