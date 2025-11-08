export type ErrorCode = keyof typeof WEB_CONTENTS_ERRORS
export type WebContentsError = {
  code: number
  description: string
  url: string
}
export type WebContentsErrorParsed = {
  code: number
  name: string
  title: string
  description: string
}
export declare const WEB_CONTENTS_ERRORS: Record<string, WebContentsErrorParsed>
//# sourceMappingURL=webContentsError.d.ts.map
