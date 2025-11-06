import type { JournalData } from '@mist/types'
import type { Journal } from './journal.svelte'

export enum JournalManagerEvents {
  Created = 'created-journal',
  Updated = 'updated-journal',
  Deleted = 'deleted-journal',
  AddedResources = 'added-journal-resource',
  RemovedResources = 'removed-journal-resource',

  CreatedResource = 'created-resource',
  UpdatedResource = 'updated-resource',
  DeletedResource = 'deleted-resource'
}
export type JournalManagerEventHandlers = {
  [JournalManagerEvents.Created]: (journalId: string) => void
  [JournalManagerEvents.Updated]: (journalId: string, changes: Partial<JournalData>) => void
  [JournalManagerEvents.Deleted]: (journalId: string) => void
  [JournalManagerEvents.AddedResources]: (journalId: string, resourceIds: string[]) => void
  [JournalManagerEvents.RemovedResources]: (journalId: string, resourceIds: string[]) => void

  [JournalManagerEvents.CreatedResource]: (resourceId: string) => void
  [JournalManagerEvents.UpdatedResource]: (resourceId: string) => void
  [JournalManagerEvents.DeletedResource]: (resourceId: string) => void
}
