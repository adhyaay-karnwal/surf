import type { MentionProvider, MentionItem, MentionType } from '../mention.types'
import { MentionTypes } from '../mention.types'
import { useLogScope } from '@mist/utils'
import { Journal, useJournalManager } from '../../journals'

export class JournalMentionProvider implements MentionProvider {
  readonly name = 'journals'
  readonly type: MentionType = MentionTypes.NOTEBOOK
  readonly isLocal = true
  private readonly log = useLogScope('JournalMentionProvider')

  private journalManager = useJournalManager()

  async initialize(): Promise<void> {
    this.log.debug('Initialized')
  }

  canHandle(query: string): boolean {
    return query.trim().length > 2
  }

  async getMentions(query: string): Promise<MentionItem[]> {
    try {
      const items = await this.searchJournals(query.trim())

      if (!items || items.length === 0) {
        return []
      }

      const mentionItems: MentionItem[] = items.map((journal) => {
        return {
          id: journal.id,
          type: MentionTypes.NOTEBOOK,
          name: journal.data.name || (journal.data as any).folderName,
          icon: 'journal',
          priority: 50,
          keywords: ['journal'],
          metadata: {
            resourceId: journal.id
          }
        }
      })

      return mentionItems.slice(0, 5)

      // Strip the @ character from the query for filtering
      // const searchQuery = query.startsWith('@') ? query.slice(1) : query

      // // Filter and sort by query relevance
      // return filterAndSortMentions(mentionItems, searchQuery)
    } catch (error) {
      this.log.error('Error fetching tabs for mentions:', error)
      return []
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

  destroy(): void {
    // Cleanup if needed
  }
}
