import type { IconData } from '@breeze/icons'
export type NotebookCoverColor = [[string, string], [string, string], [string, string]]
export type NotebookFontFamily = 'sans-serif' | 'serif' | 'monospace'
export interface NotebookCoverSticker {
  position: [number, number]
  rotation: number
  url: string
}
export interface NotebookCustomization {
  version: 1
  coverColor: NotebookCoverColor
  coverScribble: {
    path: string
    width: number
    height: number
    color: string
  }[]
  coverStickers: NotebookCoverSticker[]
  coverFontFamily: NotebookFontFamily
}
export interface NotebookSpace {
  id: string
  name: NotebookData
  created_at: string
  updated_at: string
  deleted: number
}
export interface NotebookData {
  name: string
  description: string
  icon: IconData
  index: number
  pinned: boolean
  onboarding?: boolean
  imported?: boolean
  customization: Partial<NotebookCustomization>
}
export declare const NotebookEntryOrigin: {
  readonly Blacklisted: 2
  readonly ManuallyAdded: 1
  readonly LlmQuery: 0
}
export type NotebookEntryOrigin = (typeof NotebookEntryOrigin)[keyof typeof NotebookEntryOrigin]
export interface NotebookEntry {
  id: string
  space_id: string
  entry_id: string
  entry_type: string
  resource_type?: string
  created_at: string
  updated_at: string
  manually_added: number
}
export declare const NotebookDefaults: {
  readonly NOTE_DEFAULT_NAME: 'Untitled Note'
}
//# sourceMappingURL=notebook.types.d.ts.map
