import { getWebRequestManager } from './webRequestManager'

const RAW_API_BASE =
  (import.meta.env.P_VITE_API_BASE as string | undefined) ?? 'https://breeze.engineer'
const RAW_TELEMETRY_ENDPOINT =
  (import.meta.env.M_VITE_TELEMETRY_URL as string | undefined) ??
  'https://telemetry.breeze.engineer'

const CSP_API_ENDPOINTS = [RAW_API_BASE, RAW_TELEMETRY_ENDPOINT].map((endpoint) =>
  endpoint.replace(/\/$/, '')
)

const INTERNAL_SCHEME = 'breeze-internal'
const APP_PROTOCOL = 'breeze'

const CSP_DIRECTIVES = [
  `default-src 'self' ${INTERNAL_SCHEME}:`,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: ${INTERNAL_SCHEME}:`,
  `style-src 'self' 'unsafe-inline' ${INTERNAL_SCHEME}:`,
  `img-src 'self' ${INTERNAL_SCHEME}: ${APP_PROTOCOL}: data: blob: https: crx:`,
  `object-src 'self' blob: ${INTERNAL_SCHEME}:`,
  `frame-src 'self' blob: ${INTERNAL_SCHEME}: ${INTERNAL_SCHEME}://*`,
  `media-src 'self' blob: ${INTERNAL_SCHEME}:`,
  `frame-ancestors 'self' ${INTERNAL_SCHEME}://*`,
  `connect-src 'self' ${INTERNAL_SCHEME}: ${APP_PROTOCOL}: http://localhost:* ws://localhost:* ws://core:* https://*.sentry.io ${CSP_API_ENDPOINTS.join(' ')}`,
  `worker-src 'self' blob: ${INTERNAL_SCHEME}:`
]

const buildResponseHeaders = (details: Electron.OnHeadersReceivedListenerDetails) => ({
  ...details.responseHeaders,
  'Content-Security-Policy': [CSP_DIRECTIVES.join('; ')]
})

export const applyCSPToSession = (session: Electron.Session) => {
  getWebRequestManager().addHeadersReceived(session, (details, callback) => {
    callback({
      responseHeaders: buildResponseHeaders(details)
    })
  })
}
