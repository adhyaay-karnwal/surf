import { derived, get, writable, type Readable, type Writable } from 'svelte/store'

import {
  ResourceTypes,
  SpaceEntryOrigin,
  type JournalData,
  type JournalEntry,
  type JournalSpace,
  type SpaceEntrySearchOptions
} from '@mist/types'

import { useLogScope, blobToSmallImageUrl, isMainRenderer } from '@mist/utils'
import { getIconString, IconTypes } from '@mist/icons'

import { type ResourceManager } from '../resources'

import type { JournalManager } from './journalManager.svelte'
import { useMessagePortClient, useMessagePortPrimary } from '../messagePort'
import { useViewManager } from '../views'
import { JournalManagerEvents } from '../journals/journal.types'

export class Journal {
  private log: ReturnType<typeof useLogScope>
  private journalManager: JournalManager
  private resourceManager: ResourceManager

  id: string
  createdAt: string
  updatedAt: string
  deleted: number

  data = $state() as JournalData
  contents = $state() as JournalEntry[]

  constructor(space: JournalSpace, oasis: JournalManager) {
    this.id = space.id
    this.createdAt = space.created_at
    this.updatedAt = space.updated_at
    this.deleted = space.deleted

    this.contents = []

    this.log = useLogScope(`Journal ${this.id}`)
    this.journalManager = oasis
    this.resourceManager = oasis.resourceManager

    this.data = space.name
  }

  noteResources: JournalEntry[] = $derived(
    this.contents.filter((e) => e.resource_type === ResourceTypes.DOCUMENT_SPACE_NOTE)
  )

  /** Returns the space data in the format of the old/sffs Space object */
  get spaceValue() {
    return {
      id: this.id,
      name: this.data,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      deleted: this.deleted
    } as JournalSpace
  }

  get iconString() {
    return getIconString(this.data.icon)
  }

  get colorValue() {
    return (
      this.data.customization?.coverColor ?? [
        ['color(display-p3 0.24 0.67 0.98 / 0.74)', '#7ECEFF'],
        ['color(display-p3 0.13 0.55 0.86 / 0.82)', '#00A5EB'],
        ['#fff', '#fff']
      ]
    )
  }

  get nameValue() {
    // also handle legacy space name
    // Note pull new name first, as otherwise reactivity breaks
    return this.data?.name || (this.data as any)?.folderName || ''
  }

  async updateData(updates: Partial<JournalData>) {
    this.log.debug('updating space', updates)

    this.data = { ...this.data, ...updates }

    await this.resourceManager.updateSpace(this.id, this.data)

    //this.journalManager.triggerStoreUpdate(this)
    this.journalManager.emit(JournalManagerEvents.Updated, this.id, updates)
  }

  /**
   * Update this journal instance from fresh space data
   * This preserves object identity while syncing with backend state
   */
  updateFromSpace(space: JournalSpace) {
    this.log.debug('updating journal from space data')
    this.updatedAt = space.updated_at
    this.deleted = space.deleted
    this.data = space.name
    // Note: contents are NOT reset - they persist unless explicitly fetched
  }

  async updateIndex(index: number) {
    this.log.debug('updating space index', index)

    await this.updateData({ index })
  }

  async fetchContents(opts: SpaceEntrySearchOptions = { sort_by: 'resource_updated' }) {
    this.log.debug('getting space contents')
    const result = await this.resourceManager.getSpaceContents(this.id, opts)

    this.log.debug('got space contents:', result)
    this.contents = result
    return result
  }

  async addResources(resourceIds: string[], origin: SpaceEntryOrigin, _isUserAction = false) {
    this.log.debug('adding resources to space', resourceIds, origin)
    await this.resourceManager.addItemsToSpace(this.id, resourceIds, origin)

    this.log.debug('added resources to space, updating contents')
    await this.fetchContents()

    this.journalManager.emit(JournalManagerEvents.AddedResources, this.id, resourceIds)
  }

  async removeResources(resourceIds: string[], _isUserAction = false) {
    this.resourceManager.removeItemsFromSpace(this.id, resourceIds)
    this.contents = this.contents.filter((entry) => !resourceIds.includes(entry.entry_id))
    this.journalManager.emit(JournalManagerEvents.RemovedResources, this.id, resourceIds)
    return resourceIds
  }

  async useResourceAsIcon(resourceId: string) {
    const resource = await this.resourceManager.getResource(resourceId)
    if (!resource) {
      this.log.error('Resource not found')
      return
    }

    if (!resource.type.startsWith('image/')) {
      this.log.error('Resource is not an image')
      return
    }

    const blob = await resource.getData()
    if (!blob) {
      this.log.error('Resource data not found')
      return
    }

    const base64 = await blobToSmallImageUrl(blob)
    if (!base64) {
      this.log.error('Failed to convert blob to base64')
      return
    }

    await this.journalManager.updateJournalData(this.id, {
      icon: {
        type: IconTypes.IMAGE,
        data: base64
      }
    })
  }
}
