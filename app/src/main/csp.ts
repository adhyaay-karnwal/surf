import { getWebRequestManager } from './webRequestManager'

const CSP_API_ENDPOINTS = [
  import.meta.env.P_VITE_API_BASE ?? 'https://breeze.space',
  'https://telemetry.breeze.breeze'
]

const CSP_DIRECTIVES = [
  // Only allow resources to be loaded from the same origin (domain)
  "default-src 'self' breeze-internal:",

  // Allow scripts from same origin, inline scripts, eval(), and blob: URLs
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: breeze-internal:",

  // Allow styles from same origin and inline styles
  "style-src 'self' 'unsafe-inline' breeze-internal:",

  // Allow images from same origin, data: URLs, and any HTTPS source (needed for tab favicons and resource previews)
  "img-src 'self' breeze-internal: breeze: data: blob: https: crx:",

  // Allow object-src from same origin and blob: URLs (needed for PDF previews)
  "object-src 'self' blob: breeze-internal:",

  // Allow frames from same origin and blob: URLs (needed for PDF previews)
  "frame-src 'self' blob: breeze-internal: breeze-internal://*",

  // Allow media content from same origin and blob: URLs (needed for video previews)
  "media-src 'self' blob: breeze-internal:",

  // Allow accessing cross-origin windows (needed for overlay communication)
  "frame-ancestors 'self' breeze-internal://*",

  // Allow connections to same origin, localhost (HTTP/WS), and specific APIs
  `connect-src 'self' breeze-internal: breeze: http://localhost:* ws://localhost:* ws://core:* https://*.sentry.io ${CSP_API_ENDPOINTS.join(' ')}`,

  // Allow web workers from same origin and blob: URLs
  "worker-src 'self' blob: breeze-internal:"
]

export const applyCSPToSession = (session: Electron.Session) => {
  getWebRequestManager().addHeadersReceived(session, (details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [CSP_DIRECTIVES.join('; ')]
      }
    })
  })
}
