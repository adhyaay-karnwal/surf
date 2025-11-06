import type { TreeDragDropOperation, TreeNodeStore } from '@mist/ui'
import type { Journal, JournalManager } from '@mist/services/journals'
import { ResourceTypes, SpaceEntryOrigin } from '@mist/types'

// Enhanced tree node type for journals and notes
export type JournalTreeNode = {
  id: string
  label: string
  meta: {
    type: 'journal' | 'note'
    journal?: any
    resource?: any
    entryId?: string
    updateKey?: number
  }
  count?: number
  children?: JournalTreeNode[]
  expanded?: boolean
  draggable?: boolean
  droppable?: boolean
  dragData?: Record<string, any>
}

// Track ongoing operations to prevent race conditions
let isDragOperationInProgress = false

export function createJournalTreeDragAndDrop(
  journalManager: JournalManager,
  treeStore: TreeNodeStore<JournalTreeNode>
) {
  /**
   * Main drop handler - delegates to specific handlers based on node type
   */
  const handleDrop = async (operation: TreeDragDropOperation<JournalTreeNode>) => {
    const { sourceNode, targetIndex } = operation

    // Prevent concurrent drag operations
    if (isDragOperationInProgress) {
      return
    }

    // Validate target index
    if (typeof targetIndex !== 'number') {
      return
    }

    // Don't process if dropping in same position
    const sourceType = sourceNode.meta.type
    if (sourceType === 'journal') {
      const currentOrder = getJournalOrder()
      const currentIndex = currentOrder.indexOf(sourceNode.id)
      if (currentIndex === targetIndex) {
        return
      }
    }

    // Mark operation as in progress
    isDragOperationInProgress = true

    try {
      // Delegate to specific handler
      if (sourceNode.meta.type === 'note') {
        await handleNoteDrop(operation)
      } else if (sourceNode.meta.type === 'journal') {
        await handleJournalDrop(operation)
      }
    } finally {
      // Always reset the flag
      isDragOperationInProgress = false
    }
  }

  /**
   * Handle dropping a note - either reorder within journal or move between journals
   */
  async function handleNoteDrop(operation: TreeDragDropOperation<JournalTreeNode>) {
    const { sourceNode, targetNode, targetParent, targetIndex } = operation
    const sourceNoteId = sourceNode.meta.entryId

    if (!sourceNoteId) {
      throw new Error('Source note ID not found')
    }

    // Find source journal
    const sourceJournal = findJournalContainingNote(sourceNoteId)
    if (!sourceJournal) {
      throw new Error('Source journal not found')
    }

    // Determine target journal
    let targetJournal: any

    if (targetNode?.meta.type === 'journal') {
      targetJournal = targetNode.meta.journal
    } else if (targetParent?.meta.type === 'journal') {
      targetJournal = targetParent.meta.journal
    } else {
      throw new Error('Invalid drop target for note')
    }

    const isSameJournal = sourceJournal.id === targetJournal.id

    // Perform the operation with view transition
    const performOperation = async () => {
      if (isSameJournal) {
        await reorderNoteWithinJournal(sourceNoteId, targetJournal, targetIndex)
      } else {
        // Use targetIndex if provided, otherwise append to end
        await moveNoteBetweenJournals(sourceNoteId, sourceJournal, targetJournal, targetIndex)
      }
    }

    await document.startViewTransition(performOperation).finished
  }

  /**
   * Handle dropping a journal - reorder at root level
   */
  async function handleJournalDrop(operation: TreeDragDropOperation<JournalTreeNode>) {
    const { sourceNode, targetIndex } = operation
    const sourceJournalId = sourceNode.id

    if (!sourceJournalId) {
      throw new Error('Source journal ID not found')
    }

    // Perform the operation with view transition
    const performOperation = async () => {
      await reorderJournals(sourceJournalId, targetIndex)
    }

    await document.startViewTransition(performOperation).finished
  }

  /**
   * Find which journal contains a specific note
   */
  function findJournalContainingNote(noteId: string): any | null {
    const journals = Array.from(journalManager.journals.values())
    return journals.find((nb) => nb.contents.some((entry: any) => entry.entry_id === noteId))
  }

  /**
   * Get current journal order from tree store or fallback to natural order
   * Important: Only returns IDs for journals that currently exist
   */
  function getJournalOrder(): string[] {
    const journals = Array.from(journalManager.journals.values())
    const journalIds = new Set(journals.map((nb) => nb.id))

    const customData = treeStore.getCustomData()
    if (customData.journalOrder && customData.journalOrder.length > 0) {
      // Filter persisted order to only include existing journals
      const existingIds = customData.journalOrder.filter((id) => journalIds.has(id))

      // Add any new journals that aren't in the persisted order
      const usedIds = new Set(existingIds)
      for (const journal of journals) {
        if (!usedIds.has(journal.id)) {
          existingIds.push(journal.id)
        }
      }

      return existingIds
    }

    return journals.map((nb) => nb.id)
  }

  /**
   * Get current note order for a journal from tree store or fallback to natural order
   * Important: Only returns IDs for notes that currently exist in the journal
   */
  function getNoteOrder(journalId: string): string[] {
    const journal = journalManager.journals.get(journalId)
    if (!journal) return []

    const noteEntries = journal.contents.filter(
      (entry: any) => entry.resource_type === ResourceTypes.DOCUMENT_SPACE_NOTE
    )
    const noteIds = new Set(noteEntries.map((entry: any) => entry.entry_id))

    const customData = treeStore.getCustomData()
    const noteOrders = customData.noteOrders || {}
    if (noteOrders[journalId] && noteOrders[journalId].length > 0) {
      // Filter persisted order to only include existing notes
      const existingIds = noteOrders[journalId].filter((id) => noteIds.has(id))

      // Add any new notes that aren't in the persisted order
      const usedIds = new Set(existingIds)
      for (const entry of noteEntries) {
        if (!usedIds.has(entry.entry_id)) {
          existingIds.push(entry.entry_id)
        }
      }

      return existingIds
    }

    return noteEntries.map((entry: any) => entry.entry_id)
  }

  /**
   * Reorder a note within its current journal
   */
  async function reorderNoteWithinJournal(
    noteId: string,
    journal: any,
    targetIndex: number
  ): Promise<void> {
    const currentOrder = getNoteOrder(journal.id)
    const currentIndex = currentOrder.indexOf(noteId)

    if (currentIndex === -1) {
      throw new Error('Note not found in journal')
    }

    if (currentIndex === targetIndex) {
      return // Already in position
    }

    // Simple array reordering - remove from current position and insert at target
    const newOrder = [...currentOrder]
    newOrder.splice(currentIndex, 1)
    newOrder.splice(targetIndex, 0, noteId)

    // Update persisted state
    const customData = treeStore.getCustomData()
    const noteOrders = { ...(customData.noteOrders || {}) }
    noteOrders[journal.id] = newOrder
    treeStore.updateCustomData({ noteOrders })
  }

  /**
   * Move a note from one journal to another
   */
  async function moveNoteBetweenJournals(
    noteId: string,
    fromJournal: Journal,
    toJournal: Journal,
    targetIndex?: number
  ): Promise<void> {
    await fromJournal.removeResources([noteId], true)
    await toJournal.addResources([noteId], SpaceEntryOrigin.ManuallyAdded, true)

    // Refresh both journals
    await Promise.all([fromJournal.fetchContents(), toJournal.fetchContents()])

    // Update persisted orders for both journals
    const fromNoteEntries = fromJournal.contents.filter(
      (entry: any) => entry.resource_type === ResourceTypes.DOCUMENT_SPACE_NOTE
    )
    const toNoteEntries = toJournal.contents.filter(
      (entry: any) => entry.resource_type === ResourceTypes.DOCUMENT_SPACE_NOTE
    )

    // Build new order for target journal
    let toNoteIds = toNoteEntries.map((entry: any) => entry.entry_id)

    // If targetIndex is specified, ensure note is at that position
    if (typeof targetIndex === 'number') {
      const noteIndex = toNoteIds.indexOf(noteId)

      if (noteIndex !== -1) {
        // Remove note from its current position
        toNoteIds.splice(noteIndex, 1)
        // Insert at target position
        toNoteIds.splice(targetIndex, 0, noteId)
      }
    }

    // Update persisted state
    const customData = treeStore.getCustomData()
    const noteOrders = { ...(customData.noteOrders || {}) }
    noteOrders[fromJournal.id] = fromNoteEntries.map((entry: any) => entry.entry_id)
    noteOrders[toJournal.id] = toNoteIds
    treeStore.updateCustomData({ noteOrders })
  }

  /**
   * Reorder journals at root level
   */
  async function reorderJournals(sourceJournalId: string, targetIndex: number): Promise<void> {
    const currentOrder = getJournalOrder()
    const currentIndex = currentOrder.indexOf(sourceJournalId)

    if (currentIndex === -1) {
      throw new Error('Source journal not found in current order')
    }

    if (currentIndex === targetIndex) {
      return // Already in position
    }

    // Simple array reordering - remove from current position and insert at target
    const newOrder = [...currentOrder]
    newOrder.splice(currentIndex, 1)
    newOrder.splice(targetIndex, 0, sourceJournalId)

    // Update persisted state
    treeStore.updateCustomData({ journalOrder: newOrder })
  }

  return {
    handleDrop
  }
}
