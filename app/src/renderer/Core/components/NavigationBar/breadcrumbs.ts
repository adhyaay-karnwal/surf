import type { Fn } from '@mist/types'
import { getViewType, getViewTypeData } from '@mist/utils/formatting'
import { type JournalManager } from '@mist/services/journals'
import { type WebContentsView, ViewType } from '@mist/services/views'
import { useLogScope } from '@mist/utils/io'
import { wait } from '@mist/utils'

const log = useLogScope('Breadcrumbs')

interface BreadcrumbData {
  title: string
  url: string
  navigationIdx: number
  onclick?: Fn
}

async function getJournalDisplayName(
  journalManager: JournalManager,
  journalId: string
): Promise<string> {
  const journal = await journalManager.getJournal(journalId)
  return journal.nameValue
}

export async function constructBreadcrumbs(
  journalManager: JournalManager,
  history: { url: string; title: string }[],
  currHistoryIndex: number,
  view: WebContentsView,
  extractedResourceId: string | null,
  resourceCreatedByUser: boolean
): Promise<BreadcrumbData[]> {
  try {
    if (!history) return []

    const breadcrumbs: BreadcrumbData[] = []
    const currentHistory = history.slice(0, currHistoryIndex + 1)

    // Get the current view type and data
    const viewType = view.typeValue
    const viewData = view.typeDataValue

    log.debug('Constructing breadcrumbs for view type:', viewData, currentHistory)

    if (viewType === ViewType.JournalHome) {
      log.debug('Final breadcrumbs:', breadcrumbs)
      return breadcrumbs
    } else {
      // Always start with Mist root
      breadcrumbs.push({
        title: 'Mist',
        url: new URL('mist://mist/journal').toString(),
        navigationIdx: currentHistory.findIndex(
          (entry) => getViewType(entry.url) === ViewType.JournalHome
        )
      })
    }

    // Handle based on current view type
    if (viewType === ViewType.Resource) {
      const resourceId = viewData?.id
      if (resourceId) {
        const resource = await journalManager.resourceManager.getResource(resourceId)
        if (resource) {
          // Add journal/drafts breadcrumb
          if (resource.spaceIdsValue.length === 0) {
            breadcrumbs.push({
              title: 'Drafts',
              url: new URL('mist://mist/journal/drafts').toString(),
              navigationIdx: currentHistory.findIndex((entry) =>
                entry.url.includes('/journal/drafts')
              )
            })
          } else {
            const journalId = resource.spaceIdsValue[0]
            const journalName = await getJournalDisplayName(journalManager, journalId)
            breadcrumbs.push({
              title: journalName,
              url: new URL(`mist://mist/journal/${journalId}`).toString(),
              navigationIdx: currentHistory.findIndex((entry) =>
                entry.url.includes(`/journal/${journalId}`)
              )
            })
          }
        }
      }
    } else if (viewType === ViewType.Page) {
      const savedByUser = extractedResourceId && resourceCreatedByUser
      if (savedByUser) {
        // HACK: we need a small delay to ensure the resource spaceIds list is updated
        await wait(200)

        const resource = await journalManager.resourceManager.getResource(extractedResourceId)

        const spaceIds = resource?.spaceIdsValue || []

        const lastJournalEntry = currentHistory.findLast((entry) => {
          const type = getViewType(entry.url)
          return type === ViewType.Journal
        })

        const viewTypeData = lastJournalEntry && getViewTypeData(lastJournalEntry.url)
        if (lastJournalEntry && spaceIds.length > 0 && spaceIds.includes(viewTypeData?.id)) {
          const journalName = await getJournalDisplayName(journalManager, viewTypeData.id)
          breadcrumbs.push({
            title: journalName,
            url: lastJournalEntry.url,
            navigationIdx: currentHistory.findIndex((entry) => entry.url === lastJournalEntry.url)
          })
        } else if (spaceIds.length === 1) {
          const journalId = spaceIds[0]
          const journalName = await getJournalDisplayName(journalManager, journalId)
          breadcrumbs.push({
            title: journalName,
            url: new URL(`mist://mist/journal/${journalId}`).toString(),
            navigationIdx: currentHistory.findIndex((entry) =>
              entry.url.includes(`/journal/${journalId}`)
            )
          })
        } else if (spaceIds.length === 0) {
          breadcrumbs.push({
            title: 'Drafts',
            url: 'mist://mist/journal/drafts',
            navigationIdx: currentHistory.findIndex(
              (entry) => entry.url === 'mist://mist/journal/drafts'
            )
          })
        }
      }
    }

    log.debug('Final breadcrumbs:', breadcrumbs)
    return breadcrumbs
  } catch (err) {
    console.error('Error constructing breadcrumbs:', err)
    return []
  }
}
