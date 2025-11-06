import { derived } from 'svelte/store'

import { SpaceEntryOrigin, type SpaceData } from '@mist/types'

import { ContextItemBase } from './base'
import type { ContextService } from '../contextManager'
import { ContextItemTypes, ContextItemIconTypes, type ContextItemIcon } from './types'
import { Journal } from '../../journals'

export class ContextItemJournal extends ContextItemBase {
  type = ContextItemTypes.NOTEBOOK
  sourceTab?: any
  data: Journal

  constructor(service: ContextService, journal: Journal, sourceTab?: any) {
    super(service, journal.id, 'circle-dot')

    this.sourceTab = sourceTab
    this.data = journal

    this.label = derived([journal.data], ([journalData]) => {
      return journalData.name ?? 'Journal'
    })

    this.icon = derived([journal.data], ([journalData]) => {
      // TODO: use new IconData type for context items
      const icon = journalData.icon as unknown as ContextItemIcon
      if (icon) {
        return icon
      } else {
        return { type: ContextItemIconTypes.ICON, data: this.fallbackIcon } as ContextItemIcon
      }
    })

    this.iconString = derived([this.icon], ([icon]) => {
      return this.contextItemIconToString(icon, this.fallbackIcon)
    })
  }

  async getResourceIds(_prompt?: string) {
    const journalContents = await this.data.fetchContents()
    const filteredContents = journalContents
      // TODO: support sub journals in the context
      .filter(
        (content) =>
          content.manually_added !== SpaceEntryOrigin.Blacklisted && content.entry_type !== 'space'
      )
      .map((content) => content.entry_id)
    return filteredContents
  }

  async getInlineImages() {
    // TODO: in theory we could grab all image resources here
    return []
  }

  async generatePrompts() {
    return []
  }

  static getSpaceIcon(spaceData: SpaceData): ContextItemIcon | null {
    if (spaceData.emoji) {
      return { type: ContextItemIconTypes.EMOJI, data: spaceData.emoji }
    } else if (spaceData.imageIcon) {
      return { type: ContextItemIconTypes.IMAGE, data: spaceData.imageIcon }
    } else if (spaceData.colors) {
      return { type: ContextItemIconTypes.COLORS, data: spaceData.colors }
    } else {
      return null
    }
  }
}
