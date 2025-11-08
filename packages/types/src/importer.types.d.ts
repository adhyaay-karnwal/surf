export declare enum BrowserType {
  Chrome = 'chrome',
  Firefox = 'firefox',
  Safari = 'safari',
  Edge = 'edge',
  Brave = 'brave',
  Opera = 'opera',
  Vivaldi = 'vivaldi',
  Arc = 'arc',
  Dia = 'dia',
  Tor = 'tor',
  Waterfox = 'waterfox',
  Zen = 'zen'
}
export declare enum BrowserFamily {
  Chromium = 'chromium',
  Firefox = 'firefox',
  Safari = 'safari'
}
export type BrowserTypeItem = {
  name: string
  type: BrowserType
  family: BrowserFamily
  icon: string
  unsupported_systems?: string[]
  supports: {
    history: boolean
    bookmarks: boolean
  }
}
export declare const PLATFORM: 'darwin' | 'linux' | 'win32'
export declare const BROWSER_TYPE_DATA: BrowserTypeItem[]
export declare const PRIMARY_BROWSRS: BrowserType[]
export type BookmarkItem = {
  guid: string
  title: string
  url: string
  createdAt: string
  updatedAt: string
  lastUsedAt: string
}
export type BookmarkFolder = {
  guid: string
  title: string
  createdAt: string
  updatedAt: string
  lastUsedAt: string
  children: BookmarkItem[]
}
//# sourceMappingURL=importer.types.d.ts.map
