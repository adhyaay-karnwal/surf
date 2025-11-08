export var BrowserType
;(function (BrowserType) {
  BrowserType['Chrome'] = 'chrome'
  BrowserType['Firefox'] = 'firefox'
  BrowserType['Safari'] = 'safari'
  BrowserType['Edge'] = 'edge'
  BrowserType['Brave'] = 'brave'
  BrowserType['Opera'] = 'opera'
  BrowserType['Vivaldi'] = 'vivaldi'
  BrowserType['Arc'] = 'arc'
  BrowserType['Dia'] = 'dia'
  BrowserType['Tor'] = 'tor'
  BrowserType['Waterfox'] = 'waterfox'
  BrowserType['Zen'] = 'zen'
})(BrowserType || (BrowserType = {}))
export var BrowserFamily
;(function (BrowserFamily) {
  BrowserFamily['Chromium'] = 'chromium'
  BrowserFamily['Firefox'] = 'firefox'
  BrowserFamily['Safari'] = 'safari'
})(BrowserFamily || (BrowserFamily = {}))
// @ts-ignore - can't import @breeze/utils package in @breeze/types so using import.meta.env directly
export const PLATFORM = import.meta.env.PLATFORM
export const BROWSER_TYPE_DATA = [
  {
    name: 'Chrome',
    type: BrowserType.Chrome,
    family: BrowserFamily.Chromium,
    icon: 'browser.chrome',
    supports: {
      history: true,
      bookmarks: true
    }
  },
  {
    name: 'Edge',
    type: BrowserType.Edge,
    family: BrowserFamily.Chromium,
    icon: 'browser.edge',
    supports: {
      history: true,
      bookmarks: true
    }
  },
  {
    name: 'Firefox',
    type: BrowserType.Firefox,
    family: BrowserFamily.Firefox,
    icon: 'browser.firefox',
    supports: {
      history: true,
      bookmarks: true
    }
  },
  {
    name: 'Opera',
    type: BrowserType.Opera,
    family: BrowserFamily.Chromium,
    icon: 'browser.opera',
    supports: {
      history: true,
      bookmarks: true
    }
  },
  {
    name: 'Arc',
    type: BrowserType.Arc,
    family: BrowserFamily.Chromium,
    icon: 'browser.arc',
    unsupported_systems: ['win32', 'linux'],
    supports: {
      history: true,
      bookmarks: false
    }
  },
  // disabled for now
  // { name: 'Safari', type: BrowserType.Safari, family: BrowserFamily.Safari, icon: 'world' },
  {
    name: 'Brave',
    type: BrowserType.Brave,
    family: BrowserFamily.Chromium,
    icon: 'browser.brave',
    supports: {
      history: true,
      bookmarks: true
    }
  },
  {
    name: 'Vivaldi',
    type: BrowserType.Vivaldi,
    family: BrowserFamily.Chromium,
    icon: 'browser.vivaldi',
    supports: {
      history: true,
      bookmarks: true
    }
  },
  // { name: 'Dia', type: BrowserType.Dia, family: BrowserFamily.Chromium, icon: 'world' },
  {
    name: 'Tor',
    type: BrowserType.Tor,
    family: BrowserFamily.Firefox,
    icon: 'browser.tor',
    supports: {
      history: false,
      bookmarks: true
    }
  },
  // { name: 'Waterfox', type: BrowserType.Waterfox, family: BrowserFamily.Firefox, icon: 'world' },
  {
    name: 'Zen',
    type: BrowserType.Zen,
    family: BrowserFamily.Firefox,
    icon: 'browser.zen',
    supports: {
      history: true,
      bookmarks: true
    }
  }
].filter((browser) => !(browser.unsupported_systems || []).includes(PLATFORM))
export const PRIMARY_BROWSRS = [
  BrowserType.Chrome,
  BrowserType.Edge,
  BrowserType.Firefox,
  BrowserType.Opera,
  ...(PLATFORM === 'darwin' ? [BrowserType.Arc] : [BrowserType.Brave])
]
