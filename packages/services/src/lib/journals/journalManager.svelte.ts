import { onMount, tick } from 'svelte'
import { derived, get, writable, type Readable, type Writable } from 'svelte/store'

import {
  conditionalArrayItem,
  isDev,
  useLogScope,
  EventEmitterBase,
  SearchResourceTags,
  isMainRenderer
} from '@mist/utils'

import { useKVTable, type BaseKVItem } from '../kv'

import {
  ResourceTypes,
  SpaceEntryOrigin,
  type SpaceEntrySearchOptions,
  type JournalData,
  type JournalSpace,
  type Space,
  type Lock,
  type Fn
} from '@mist/types'

import {
  ResourceNote,
  type ResourceManager,
  type Resource,
  ResourceManagerEvents
} from '../resources'
import { type ConfigService } from '../config'
import type { SpaceBasicData } from '../ipc/events'

import { Journal } from './journal.svelte'
import { JournalManagerEvents, type JournalManagerEventHandlers } from './journal.types'
import { IconTypes } from '@mist/icons'
import { SvelteMap } from 'svelte/reactivity'
import type { MessagePortClient, MessagePortPrimary } from '../messagePort'
import { useViewManager } from '@mist/services/views'

type JournalSettings = BaseKVItem & {
  title: string
}

export class JournalManager extends EventEmitterBase<JournalManagerEventHandlers> {
  private messagePort: MessagePortClient | MessagePortPrimary
  private config: ConfigService
  private log: ReturnType<typeof useLogScope>
  resourceManager: ResourceManager

  journals = new SvelteMap<string, Journal>()
  private journals_lock: Lock = null

  sortedJournals = $derived(
    Array.from(this.journals.values())
      // TODO: Can we nuke this succer?
      .filter((space) => space.data.name !== '.tempspace')
      .sort((a, b) => b.data.index - a.data.index)
  )

  everythingContents: Writable<Resource[]>
  loadingEverythingContents: Writable<boolean>

  // Settings management
  private settingsStore = useKVTable<JournalSettings>('journal_settings')

  static self: JournalManager

  constructor(
    resourceManager: ResourceManager,
    config: ConfigService,
    messagePort: MessagePortPrimary | MessagePortClient
  ) {
    super()
    this.log = useLogScope('JournalManager')
    this.resourceManager = resourceManager
    this.config = config

    this.everythingContents = writable([])
    this.loadingEverythingContents = writable(false)
    this.messagePort = messagePort

    onMount(() => {
      let unsubs: Fn[] = []

      unsubs.push(
        //this.resourceManager.on(ResourceManagerEvents.Created, (resource: Resource) => {
        //  if (isMainRenderer()) {
        //    useViewManager()?.viewsValue.forEach((view) =>
        //      this.messagePort.extern_state_resourceCreated.send(view.id, {
        //        resourceId: resource.id
        //      })
        //    )
        //  } else {
        //    this.messagePort.extern_state_resourceCreated.send({
        //      resourceId: resource.id
        //    })
        //  }
        //}),
        this.resourceManager.on(ResourceManagerEvents.Deleted, (resourceId: string) => {
          for (const journal of this.journals.values()) {
            journal.contents = journal.contents.filter((e) => e.id !== resourceId)
          }

          if (isMainRenderer()) {
            useViewManager()?.viewsValue.forEach((view) =>
              this.messagePort.extern_state_resourceDeleted.send(view.id, {
                resourceId
              })
            )
          } else {
            this.messagePort.extern_state_resourceDeleted.send({
              resourceId
            })
          }
        }),

        // Listen to resource updates (e.g., name changes) to keep journal contents fresh
        this.resourceManager.on(ResourceManagerEvents.Updated, (resource: Resource) => {
          this.log.debug('Resource updated, refreshing affected journals:', resource.id)

          // Find journals that contain this resource and refresh their contents
          for (const journal of this.journals.values()) {
            const hasResource = journal.contents.some((entry) => entry.entry_id === resource.id)
            if (hasResource) {
              this.log.debug('Refreshing journal contents for:', journal.nameValue)
              // Refresh contents to get updated resource metadata
              journal.fetchContents().catch((error) => {
                this.log.warn('Failed to refresh journal contents:', journal.id, error)
              })
            }
          }

          // Send cross-renderer message for resource updates
          if (isMainRenderer()) {
            useViewManager()?.viewsValue.forEach((view) =>
              this.messagePort.extern_state_resourceUpdated.send(view.id, {
                resourceId: resource.id
              })
            )
          } else {
            this.messagePort.extern_state_resourceUpdated.send({
              resourceId: resource.id
            })
          }
        }),

        this.resourceManager.on(
          ResourceManagerEvents.JournalAddResources,
          (journalId: string, resourceIds: string[]) => {
            if (isMainRenderer()) {
              useViewManager()?.viewsValue.forEach((view) =>
                this.messagePort.extern_state_journalAddResources.send(view.id, {
                  journalId,
                  resourceIds
                })
              )
            } else {
              this.messagePort.extern_state_journalAddResources.send({
                journalId,
                resourceIds
              })
            }
          }
        ),
        this.resourceManager.on(
          ResourceManagerEvents.JournalRemoveResources,
          (journalId: string, resourceIds: string[]) => {
            if (isMainRenderer()) {
              useViewManager()?.viewsValue.forEach((view) =>
                this.messagePort.extern_state_journalRemoveResources.send(view.id, {
                  journalId,
                  resourceIds
                })
              )
            } else {
              this.messagePort.extern_state_journalRemoveResources.send({
                journalId,
                resourceIds
              })
            }
          }
        )
      )

      if (isMainRenderer()) {
        unsubs.push(
          this.messagePort.extern_state_resourceDeleted.on(({ resourceId }) => {
            this.emit(JournalManagerEvents.DeletedResource, resourceId)
            useViewManager().viewsValue.forEach((view) => {
              this.messagePort.extern_state_resourceDeleted.send(view.id, {
                resourceId
              })
            })
          }),
          this.messagePort.extern_state_resourceCreated.on(({ resourceId }) => {
            this.emit(JournalManagerEvents.CreatedResource, resourceId)
            useViewManager().viewsValue.forEach((view) => {
              this.messagePort.extern_state_resourceCreated.send(view.id, {
                resourceId
              })
            })
          }),
          this.messagePort.extern_state_resourceUpdated.on(async ({ resourceId }) => {
            this.log.debug('Received cross-renderer resource update:', resourceId)

            try {
              await this.resourceManager.reloadResource(resourceId, true)
            } catch (error) {
              this.log.warn('Failed to refresh resource metadata:', resourceId, error)
            }

            // Find journals that contain this resource and refresh their contents
            for (const journal of this.journals.values()) {
              const hasResource = journal.contents.some((entry) => entry.entry_id === resourceId)
              if (hasResource) {
                this.log.debug('Refreshing journal contents for:', journal.nameValue)
                journal.fetchContents().catch((error) => {
                  this.log.warn('Failed to refresh journal contents:', journal.id, error)
                })
              }
            }

            // Emit local event to trigger JournalTreeView reactivity
            this.emit(JournalManagerEvents.UpdatedResource, resourceId)

            // Also emit through ResourceManager to trigger ResourceLoader updates
            this.resourceManager.emit('externalResourceUpdated', resourceId)

            if (isMainRenderer()) {
              useViewManager().viewsValue.forEach((view) => {
                this.messagePort.extern_state_resourceUpdated.send(view.id, {
                  resourceId
                })
              })
            } else {
              this.messagePort.extern_state_resourceUpdated.send({
                resourceId
              })
            }
          }),

          this.messagePort.extern_state_journalAddResources.on(({ journalId, resourceIds }) => {
            this.getJournal(journalId).then((e) => e?.fetchContents())
            this.getJournal(journalId, { cacheOnly: true }).then((journal) =>
              journal?.fetchContents()
            )

            useViewManager().viewsValue.forEach((view) => {
              this.messagePort.extern_state_journalAddResources.send(view.id, {
                journalId,
                resourceIds
              })
            })
          }),
          this.messagePort.extern_state_journalRemoveResources.on(({ journalId, resourceIds }) => {
            useViewManager().viewsValue.forEach((view) => {
              this.messagePort.extern_state_journalRemoveResources.send(view.id, {
                journalId,
                resourceIds
              })
            })
            this.getJournal(journalId).then((journal) => {
              if (!journal) return
              journal.contents = journal.contents.filter((e) => !resourceIds.includes(e.id))
            })
          }),
          this.messagePort.extern_state_journalsChanged.on(() => {
            this.loadJournals()
          })
        )
      } else {
        unsubs.push(
          //this.messagePort.extern_state_resourceCreated.handle(({ resourceId }) => {
          //  this.emit(JournalManagerEvents.CreatedResource, resourceId)
          //}),
          this.messagePort.extern_state_resourceDeleted.handle(({ resourceId }) => {
            this.emit(JournalManagerEvents.DeletedResource, resourceId)
          }),

          this.messagePort.extern_state_journalAddResources.handle(({ journalId, resourceIds }) => {
            this.emit(JournalManagerEvents.AddedResources, journalId, resourceIds)
            this.getJournal(journalId, { cacheOnly: true }).then((journal) =>
              journal?.fetchContents()
            )
          }),
          this.messagePort.extern_state_journalRemoveResources.handle(
            ({ journalId, resourceIds }) => {
              this.getJournal(journalId).then((journal) => {
                if (!journal) return
                journal.contents = journal.contents.filter((e) => !resourceIds.includes(e.id))
              })

              this.emit(JournalManagerEvents.RemovedResources, journalId, resourceIds)
              //this.getJournal(journalId, { cacheOnly: true }).then((journal) => {
              //  if (!journal) return
              //  console.warn('removing res', resourceIds, journal)
              //  journal.contents = journal.contents.filter((e) => !resourceIds.includes(e.id))
              //})
            }
          ),
          this.messagePort.extern_state_journalsChanged.handle(() => {
            this.loadJournals()
          })
        )
      }

      unsubs.push(
        this.on(JournalManagerEvents.Created, () => {
          this.updateRendererJournals()
        }),
        this.on(JournalManagerEvents.Deleted, () => {
          this.updateRendererJournals()
        }),
        this.on(JournalManagerEvents.Updated, () => {
          this.updateRendererJournals()
        })
      )

      return () => unsubs.forEach((f) => f())
    })

    this.loadJournals()

    if (isDev) {
      // @ts-ignore
      window.journalManager = this
    }
  }

  private createJournalObject(space: JournalSpace) {
    return new Journal(space, this)
  }

  get journalSpacesValue() {
    return Array.from(this.journals.values()).map((journal) => journal.spaceValue)
  }

  updateMainProcessJournalsList() {
    const items = this.sortedJournals.map(
      (space) =>
        ({
          id: space.id,
          name: space.nameValue,
          pinned: space.data.pinned,
          linked: false
        }) as SpaceBasicData
    )

    const filteredItems = items.filter(
      (e) => e.id !== 'all' && e.id !== 'inbox' && e.name?.toLowerCase() !== '.tempspace'
    )

    this.log.debug('updating spaces list in main process', filteredItems)
    // @ts-ignore
    if (window.api.updateSpacesList) window.api.updateSpacesList(filteredItems)
  }

  updateRendererJournals() {
    if (isMainRenderer()) {
      useViewManager()?.viewsValue.forEach((view) =>
        this.messagePort.extern_state_journalsChanged.send(view.id, {
          journalIds: Array.from(this.journals.keys())
        })
      )
    } else {
      this.messagePort.extern_state_journalsChanged.send({
        journalIds: Array.from(this.journals.keys())
      })
    }
  }

  triggerUpdate() {
    tick().then(() => {
      this.updateMainProcessJournalsList()
    })
  }

  async loadJournals() {
    this.log.debug('fetching spaces')
    let result = await this.resourceManager.listSpaces()

    // TODO: Felix — Continuation on felix/tempspace-removal: Remove all .tempspaces
    const filteredResult = result.filter((space) => space.name.folderName !== '.tempspace')
    result = filteredResult
    this.log.debug('fetched spaces:', result)

    const spaces = result
      // make sure each space has a index
      .map((space, idx) => {
        return {
          ...space,
          name: {
            ...space.name,
            index: space.name.index ?? idx
          }
        }
      })
      .sort((a, b) => (a.name.index ?? -1) - (b.name.index ?? -1))
      .map((space, idx) => ({ ...space, name: { ...space.name, index: idx } }))

    this.log.debug('loaded spaces:', spaces)

    // Preserve object identity by updating existing journals instead of replacing them
    // This prevents breaking reactivity in components that hold references to Journal objects
    const newSpaceIds = new Set(spaces.map((s) => s.id))
    const existingIds = new Set(this.journals.keys())

    // Remove journals that no longer exist
    for (const existingId of existingIds) {
      if (!newSpaceIds.has(existingId)) {
        this.log.debug('Removing deleted journal:', existingId)
        this.journals.delete(existingId)
      }
    }

    // Update existing journals or add new ones
    for (const space of spaces) {
      const existing = this.journals.get(space.id)
      if (existing) {
        // Update existing journal in-place to preserve object identity
        this.log.debug('Updating existing journal:', space.id)
        existing.updateFromSpace(space as unknown as JournalSpace)
      } else {
        // Create new journal for newly added spaces
        this.log.debug('Adding new journal:', space.id)
        const journal = this.createJournalObject(space as unknown as JournalSpace)
        this.journals.set(space.id, journal)
      }
    }

    this.triggerUpdate()

    return Array.from(this.journals.values())
  }

  async createJournal(data: Partial<JournalData>, isUserAction = false) {
    this.log.debug('creating journal', data)

    const defaults = {
      name: 'New Journal',
      description: '',
      index: this.journals.size,
      pinned: false,
      onboarding: data.onboarding ?? false,
      imported: data.imported ?? false,
      customization: {},
      icon: {
        type: IconTypes.ICON,
        data: 'file-text-ai'
      }
    } satisfies JournalData

    // Create a copy of the data to avoid modifying the original
    let fullData = Object.assign({}, defaults, data)

    let parentSpace: Journal | undefined | null = null
    let parentData: JournalData | null = null

    const result = await this.resourceManager.createSpace(fullData)
    if (!result) {
      this.log.error('failed to create space')
      throw new Error('Failed to create space')
    }

    const space = this.createJournalObject(result as unknown as JournalSpace)

    this.log.debug('cregted space:', space)
    this.journals.set(space.id, space)

    await this.loadJournals()
    this.emit(JournalManagerEvents.Created, space.id)
    return space
  }

  /**
   * @param cacheOnly - will return null if journal is not already loaded in cache.
   */
  async getJournal(
    journalId: string,
    { fresh, cacheOnly }: { fresh?: boolean; cacheOnly?: boolean } = {
      fresh: false,
      cacheOnly: false
    }
  ) {
    fresh = fresh ?? false
    cacheOnly = cacheOnly ?? false
    if (fresh && cacheOnly) throw new Error('Cannot fetch journal with fresh and cacheOnly!')
    if (this.journals_lock) {
      await this.journals_lock.catch(() => this.log.warn('Lock rejected @ getJournal()'))
    }

    if (cacheOnly) {
      return this.journals.get(journalId)
    } else if (this.journals.has(journalId) && !fresh) {
      return this.journals.get(journalId)
    }

    this.journals_lock = new Promise(async (res, rej) => {
      try {
        const result = await this.resourceManager.getSpace(journalId)
        if (!result) {
          this.log.error('space not found:', journalId)
          return null
        }

        const space = this.createJournalObject(result as unknown as JournalSpace)
        this.journals.set(journalId, space)

        this.log.debug('got space:', space)

        res(space)
      } catch {
        rej()
      }
    })
    return this.journals_lock
  }

  async getOrCreateJournal(id: string, defaults: Partial<JournalData> = {}) {
    let journal = await this.getJournal(id)
    if (!journal) {
      journal = await this.createJournal(defaults)
    }
    return journal
  }

  async deleteJournal(journalId: string, isUserAction = false) {
    this.log.debug('deleting journal', journalId)

    // Proceed with normal journal deletion
    await this.resourceManager.deleteSpace(journalId)

    this.log.debug('deleted journal:', journalId)

    this.journals.delete(journalId)
    //const filtered = this.journals.filter((space) => space.id !== journalId)
    //await Promise.all(filtered.map((space, idx) => space.updateIndex(idx)))

    await this.loadJournals()
    this.emit(JournalManagerEvents.Deleted, journalId)
  }

  async updateJournalData(id: string, updates: Partial<JournalData>) {
    this.log.debug('updating journal', id, updates)

    const space = await this.getJournal(id)
    if (!space) {
      this.log.error('space not found:', id)
      throw new Error('Space not found')
    }

    await space.updateData(updates)
    this.log.debug('updated space:', space)

    this.triggerUpdate()

    return space
  }

  async addResourcesToJournal(
    journalId: string,
    resourceIds: string[],
    origin: SpaceEntryOrigin = SpaceEntryOrigin.ManuallyAdded,
    isUserAction = false
  ) {
    this.log.debug('adding resources to journal', journalId, resourceIds, origin)

    const journal = await this.getJournal(journalId)
    if (!journal) {
      this.log.error('journal not found:', journalId)
      throw new Error('Journal not found')
    }

    await journal.addResources(resourceIds, origin, isUserAction)
    this.log.debug('added resources to journal')
    //this.triggerStoreUpdate(journal)

    return journal
  }

  /**
   * Get the contents of a space
   * @param spaceId The space ID to get contents for
   * @param opts Optional search options
   * @param includeFolderData Whether to include folder-specific data (child folders, path)
   * @returns The space contents or folder contents response
   */
  async getJournalContents(journalId: string, opts?: SpaceEntrySearchOptions) {
    this.log.debug('getting journal contents', journalId)
    const journal = await this.getJournal(journalId)
    if (!journal) {
      this.log.error('journal not found:', journalId)
      throw new Error('Journal not found')
    }
    return await journal.fetchContents(opts)
  }

  /**
   * Fetches note resources from a specific space
   * @param spaceId - ID of the space to fetch notes from
   * @returns Array of ResourceNote objects from the space
   */
  async fetchNoteResourcesFromJournal(journalId: string) {
    this.log.debug('Fetching note resources for journal:', journalId)

    // Get the journal
    const journal = await this.getJournal(journalId)
    if (!journal) {
      this.log.error('Journal not found:', journalId)
      return []
    }

    // Get journal contents
    const journalContents = (await journal.fetchContents()) ?? []

    // Extract IDs of note resources
    const noteIds = journalContents
      .filter(
        (entry) =>
          entry.manually_added !== SpaceEntryOrigin.Blacklisted &&
          entry.resource_type === ResourceTypes.DOCUMENT_SPACE_NOTE
      )
      .map((entry) => entry.entry_id)

    // Load all note resources in parallel
    const resources = await Promise.all(noteIds.map((id) => this.resourceManager.getResource(id)))

    // Filter valid resources
    const filteredResources = resources.filter(Boolean) as ResourceNote[]

    return filteredResources
  }

  /** Deletes the provided resources from Oasis and gets rid of all references in any journal */
  async deleteResourcesFromMist(resourceIds: string | string[], isUserAction = false) {
    resourceIds = Array.isArray(resourceIds) ? resourceIds : [resourceIds]
    this.log.debug('removing resources', resourceIds)

    const resources = await Promise.all(
      resourceIds.map((id) => this.resourceManager.getResource(id))
    )
    const validResources = resources.filter((resource) => resource !== null) as Resource[]
    const validResourceIDs = validResources.map((resource) => resource.id)

    if (validResourceIDs.length === 0) {
      this.log.error('No valid resources found')
      return false
    }

    const allReferences = await Promise.all(
      validResourceIDs.map((id) =>
        this.resourceManager.getAllReferences(id, this.journalSpacesValue as unknown as Space[])
      )
    )
    this.log.debug('all references:', allReferences)

    // turn the array of references into an array of spaces with the resources to remove
    const spacesWithReferences = allReferences
      .filter((references) => references.length > 0)
      .map((references) => {
        return {
          spaceId: references[0]?.folderId,
          resourceIds: references.map((ref) => ref.resourceId)
        }
      })
      .filter((entry, index, self) => {
        return self.findIndex((e) => e.spaceId === entry.spaceId) === index
      })

    this.log.debug('deleting resource references from spaces', spacesWithReferences)
    await Promise.all(
      spacesWithReferences.map(async (entry) => {
        const journal = await this.getJournal(entry.spaceId!)
        if (journal) {
          await journal.removeResources(entry.resourceIds)
        }
      })
    )

    this.log.debug('deleting resources from oasis', validResourceIDs)
    await this.resourceManager.deleteResources(validResourceIDs)

    // this.log.debug('removing resource bookmarks from tabs', validResourceIDs)
    // await Promise.all(validResourceIDs.map((id) => this.tabsManager.removeResourceBookmarks(id)))

    this.log.debug('removing deleted smart notes', validResourceIDs)

    this.log.debug('updating everything after resource deletion')
    this.everythingContents.update((contents) => {
      return contents.filter((resource) => !validResourceIDs.includes(resource.id))
    })

    if (isUserAction)
      validResources.forEach((resource) => {
        if (resource?.type !== ResourceTypes.DOCUMENT_SPACE_NOTE) return
      })

    this.log.debug('deleted resources:', resourceIds)
    return resourceIds
  }

  /** Removes the provided resources from the journal */
  async removeResourcesFromJournal(
    journalId: string,
    resourceIds: string | string[],
    isUserAction = false
  ) {
    const journal = await this.getJournal(journalId)
    if (!journal) {
      this.log.error('journal not found:', journalId)
      throw new Error('Journal not found')
    }

    resourceIds = Array.isArray(resourceIds) ? resourceIds : [resourceIds]
    this.log.debug('removing resources', resourceIds)

    const resources = await Promise.all(
      resourceIds.map((id) => this.resourceManager.getResource(id))
    )

    const validResources = resources.filter((resource) => resource !== null) as Resource[]
    if (validResources.length === 0) {
      this.log.error('No valid resources found')
      return false
    }

    this.log.debug('removing resource entries from journal...', validResources)

    const removedResources = await journal.removeResources(
      validResources.map((resource) => resource.id),
      isUserAction
    )
    this.log.debug('removed resource entries from journal', removedResources)

    //this.triggerStoreUpdate(journal)

    this.log.debug('resources removed from space:', resourceIds)
    return removedResources
  }

  /** Remove a resource from a specific journal, or from Stuff entirely if no journal is provided.
   * throws: Error in various failure cases.
   */
  async removeResources(resourceIds: string | string[], journalId?: string, isUserAction = false) {
    resourceIds = Array.isArray(resourceIds) ? resourceIds : [resourceIds]
    this.log.debug('removing resources from', journalId ?? 'oasis', resourceIds)

    if (!journalId) {
      return this.deleteResourcesFromMist(resourceIds, isUserAction)
    }
    return this.removeResourcesFromJournal(journalId, resourceIds, isUserAction)
  }

  async loadEverything() {
    try {
      if (get(this.loadingEverythingContents)) {
        this.log.debug('Already loading everything')
        return
      }

      this.loadingEverythingContents.set(true)
      this.everythingContents.set([])
      await tick()

      const excludeAnnotations = !get(this.config.settings).show_annotations_in_oasis
      // const selectedFilterType = get(this.selectedFilterType)

      this.log.debug('loading everything', { excludeAnnotations })
      const resources = await this.resourceManager.listResourcesByTags(
        [
          ...SearchResourceTags.NonHiddenDefaultTags({
            excludeAnnotations: excludeAnnotations
          })
          // ...conditionalArrayItem(selectedFilterType !== null, selectedFilterType?.tags ?? []),
        ],
        {
          includeAnnotations: true
          //excludeWithinSpaces: get(this.selectedJournal) === 'inbox'
        }
      )

      this.log.debug('Loaded everything:', resources)
      this.everythingContents.set(resources)

      return resources
    } catch (error) {
      this.log.error('Failed to load everything:', error)
      throw error
    } finally {
      this.loadingEverythingContents.set(false)
    }
  }

  /** @deprecated */
  async moveJournalToIndex(journalId: string, targetIndex: number) {
    alert('deprecated')
    throw new Error('Dont use this!')
    //const journal = await this.getJournal(journalId)
    //if (!journal) {
    //  this.log.error('journal not found:', journalId)
    //  throw new Error('Journal not found')
    //}

    //const journals = get(this.journals)
    //const currentIndex = journals.findIndex((s) => s.id === journalId)

    //if (currentIndex === -1) {
    //  throw new Error('Journal not found in journals array')
    //}

    //const clampedTargetIndex = Math.min(Math.max(0, targetIndex), journals.length - 1)

    //if (currentIndex === clampedTargetIndex) return

    //this.log.debug(
    //  'moving journal',
    //  journalId,
    //  'from index',
    //  currentIndex,
    //  'to index',
    //  clampedTargetIndex,
    //  targetIndex !== clampedTargetIndex ? `(clamped from ${targetIndex})` : ''
    //)

    //const newJournals = [...journals]
    //const [movedJournal] = newJournals.splice(currentIndex, 1)
    //newJournals.splice(clampedTargetIndex, 0, movedJournal!)

    //try {
    //  const updates = newJournals
    //    .map((journal, index) => ({ journal, index }))
    //    .filter(({ journal, index }) => journal.data.index !== index)

    //  await Promise.all(updates.map(({ journal, index }) => journal.updateIndex(index)))

    //  this.journals.set(newJournals)

    //  this.log.debug('moved journal', journalId, 'to index', targetIndex)
    //} catch (error) {
    //  this.log.error('failed to move journal:', error)
    //  throw new Error('Failed to move journal')
    //}
  }

  // Settings management methods
  async loadTitle(): Promise<string> {
    try {
      await this.settingsStore.ready
      const settings = await this.settingsStore.read('main')
      if (settings) {
        this.log.debug('Loaded title:', settings.title)
        return settings.title
      }
      this.log.debug('No saved title found, using default')
      return 'maxus journal'
    } catch (error) {
      this.log.error('Failed to load journal title:', error)
      return 'maxus journal'
    }
  }

  async saveTitle(newTitle: string): Promise<void> {
    try {
      await this.settingsStore.ready
      const existingSettings = await this.settingsStore.read('main')

      if (existingSettings) {
        await this.settingsStore.update('main', { title: newTitle })
        this.log.debug('Updated title:', newTitle)
      } else {
        await this.settingsStore.create({
          id: 'main',
          title: newTitle
        })
        this.log.debug('Created new title setting:', newTitle)
      }
    } catch (error) {
      this.log.error('Failed to save journal title:', error)
      throw error
    }
  }

  async getSettings(): Promise<JournalSettings | undefined> {
    try {
      await this.settingsStore.ready
      return await this.settingsStore.read('main')
    } catch (error) {
      this.log.error('Failed to get settings:', error)
      return undefined
    }
  }

  static provide(
    resourceManager: ResourceManager,
    config: ConfigService,
    messagePort: MessagePortPrimary | MessagePortClient
  ) {
    const service = new JournalManager(resourceManager, config, messagePort)
    if (!JournalManager.self) JournalManager.self = service

    return service
  }

  static use() {
    if (!JournalManager.self) {
      throw new Error('JournalManager not initialized')
    }
    return JournalManager.self
  }
}

export const useJournalManager = JournalManager.use
export const createJournalManager = JournalManager.provide
