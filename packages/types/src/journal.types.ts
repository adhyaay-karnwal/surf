import type { IconData } from '@mist/icons'

// NOTE: Use p3 as main colors and something like rgb as fallbacks.
// [[bg1, bg1-fallback], [bg2, bg2-fallback], [text, text-fallback]]
export type JournalCoverColor = [[string, string], [string, string], [string, string]]
export type JournalFontFamily = 'sans-serif' | 'serif' | 'monospace'
export interface JournalCoverSticker {
  position: [number, number]
  rotation: number
  url: string
}

export interface JournalCustomization {
  version: 1
  coverColor: JournalCoverColor
  coverScribble: {
    path: string
    width: number
    height: number
    color: string
  }[]
  coverStickers: JournalCoverSticker[]
  coverFontFamily: JournalFontFamily
}

export interface JournalSpace {
  id: string
  name: JournalData
  created_at: string
  updated_at: string
  deleted: number
}

export interface JournalData {
  name: string
  description: string
  icon: IconData
  index: number
  pinned: boolean
  onboarding?: boolean
  imported?: boolean
  customization: Partial<JournalCustomization>
}

export const JournalEntryOrigin = {
  Blacklisted: 2,
  ManuallyAdded: 1,
  LlmQuery: 0
} as const

export type JournalEntryOrigin = (typeof JournalEntryOrigin)[keyof typeof JournalEntryOrigin]

export interface JournalEntry {
  id: string
  space_id: string
  entry_id: string
  entry_type: string
  resource_type?: string
  created_at: string
  updated_at: string
  manually_added: number
}

export const JournalDefaults = {
  NOTE_DEFAULT_NAME: 'Untitled Note'
} as const
