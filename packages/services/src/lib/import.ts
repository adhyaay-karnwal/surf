import {
  BROWSER_TYPE_DATA,
  ResourceTagDataStateValue,
  SpaceEntryOrigin,
  type BrowserType
} from '@mist/types'
import { useLogScope } from '@mist/utils/io'
import { ResourceTag } from '@mist/utils/formatting'

import { type Resource, type ResourceManager } from './resources'
import { JournalManager } from './journals'

export class Importer {
  log: ReturnType<typeof useLogScope>
  resourceManager: ResourceManager
  journalManager: JournalManager

  constructor(resourceManager: ResourceManager, journalManager: JournalManager) {
    this.log = useLogScope('Importer')
    this.resourceManager = resourceManager
    this.journalManager = journalManager
  }

  async importHistory(type: BrowserType) {
    const items = await this.resourceManager.sffs.importBrowserHistory(type)
    this.log.debug('imported browser history', items)
    return items
  }

  async importBookmarks(type: BrowserType) {
    const folders = await this.resourceManager.sffs.importBrowserBookmarks(type)
    this.log.debug('imported browser bookmarks', folders)

    const importedResources: Resource[] = []
    const browserMetadata = BROWSER_TYPE_DATA.find((item) => item.type === type)

    await Promise.all(
      folders.map(async (folder) => {
        this.log.debug('creating space for folder', folder)

        const formattedTitle = folder.title.toLowerCase().includes(type)
          ? folder.title
          : `${folder.title} - ${browserMetadata?.name ?? type}`

        // check if the folder already exists
        const journals = Array.from(this.journalManager.journals.values())
        let journal = journals.find(
          (journal) => journal.nameValue === folder.title || journal.nameValue === formattedTitle
        )

        if (!journal) {
          journal = await this.journalManager.createJournal({
            name: formattedTitle,
            imported: true
          })
        } else {
          await journal.updateData({
            imported: true
          })
        }

        let resources: Resource[] = []

        await Promise.all(
          folder.children.map(async (item) => {
            const resource = await this.resourceManager.createResourceLink(
              {
                title: item.title,
                url: item.url
              },
              {
                name: item.title,
                sourceURI: item.url
              },
              [ResourceTag.import(), ResourceTag.dataState(ResourceTagDataStateValue.PARTIAL)]
            )

            resources.push(resource)
            importedResources.push(resource)
          })
        )

        await this.journalManager.addResourcesToJournal(
          journal.id,
          resources.map((r) => r.id),
          SpaceEntryOrigin.ManuallyAdded
        )
      })
    )

    this.log.debug('imported resources', importedResources)
    return importedResources
  }

  static create(service: { resourceManager: ResourceManager; journalManager: JournalManager }) {
    const { resourceManager, journalManager } = service
    return new Importer(resourceManager, journalManager)
  }
}
