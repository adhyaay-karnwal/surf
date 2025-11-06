import { type MentionItem } from '@mist/editor'
import type { ActionProvider, TeletypeAction } from '../types'
import { generateUUID, useLogScope, truncate } from '@mist/utils'
import { useBrowser } from '../../browser'
import { Journal, useJournalManager } from '../../journals'

export class JournalsProvider implements ActionProvider {
  readonly name = 'journals-search'
  readonly isLocal = false
  private readonly log = useLogScope('JournalsProvider')
  private readonly journalManager = useJournalManager()
  private readonly browser = useBrowser()

  canHandle(query: string): boolean {
    return query.trim().length >= 2
  }

  async getActions(query: string, _mentions: MentionItem[]): Promise<TeletypeAction[]> {
    const actions: TeletypeAction[] = []
    const trimmedQuery = query.trim()

    if (trimmedQuery.length < 2) return actions

    try {
      const items = await this.searchJournals(trimmedQuery)
      items.forEach((item, index) => {
        actions.push(this.createAction(item, 80 - index, ['search', 'journal', 'note', 'context']))
      })

      if ('drafts'.includes(query.trim().toLowerCase())) {
        actions.push({
          id: generateUUID(),
          name: 'Drafts',
          icon: `journal`,
          section: 'Your Journals',
          priority: 80,
          keywords: ['search', 'journal', 'note', 'context'],
          description: ``,
          buttonText: 'Open',
          handler: async () => {
            await this.browser.openJournalInCurrentTab('drafts')
          }
        })
      }
    } catch (error) {
      this.log.error('Failed to fetch search suggestions:', error)
    }

    return actions
  }

  private createAction(journal: Journal, priority: number, keywords: string[]): TeletypeAction {
    return {
      id: generateUUID(),
      name: truncate(journal.nameValue, 30),
      icon: `journal`,
      section: 'Your Journals',
      priority,
      keywords,
      description: ``,
      buttonText: 'Open',
      handler: async () => {
        await this.browser.openJournalInCurrentTab(journal.id)
      }
    }
  }

  private async searchJournals(query: string): Promise<Journal[]> {
    try {
      const journals = Array.from(this.journalManager.journals.values())
      return journals.filter((journal) =>
        journal.nameValue.toLowerCase().includes(query.toLowerCase())
      )
    } catch (error) {
      this.log.error('Error fetching Google suggestions:', error)
      return []
    }
  }
}
