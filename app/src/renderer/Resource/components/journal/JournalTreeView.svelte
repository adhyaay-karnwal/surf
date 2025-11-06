<script lang="ts">
  import { onMount } from 'svelte'
  import {
    Tree,
    type BaseTreeNode,
    type TreeConfig,
    type TreeEvents,
    type TreeNodeAction,
    type TreeDragConfig,
    contextMenu,
    type CtxItem,
    openDialog
  } from '@mist/ui'
  import { ResourceLoader, JournalCover } from '@mist/ui'
  import { Icon } from '@mist/icons'
  import { useJournalManager } from '@mist/services/journals'
  import { ResourceTypes, SpaceEntryOrigin, type OpenTarget } from '@mist/types'
  import { useResourceManager, type Resource, getResourceCtxItems } from '@mist/services/resources'
  import { JournalManagerEvents } from '@mist/services/journals'
  import {
    openResource,
    openJournal,
    determineClickOpenTarget
  } from '../../handlers/journalOpenHandlers'
  import { isModKeyPressed, truncate, conditionalArrayItem, useDebounce } from '@mist/utils'

  import { createTreeStore } from '@mist/ui'
  import { createJournalTreeDragAndDrop, type JournalTreeNode } from './journalTreeDnd.svelte'

  // Props
  let { isVisible = $bindable(true), onCustomizeJournal } = $props()

  // Initialize services
  const journalManager = useJournalManager()
  const resourceManager = useResourceManager()

  // Context Menu Functions
  const handleDeleteJournal = async (journal: any) => {
    const { closeType: confirmed } = await openDialog({
      title: `Delete <i>${truncate(journal.nameValue, 26)}</i>`,
      message: `This can't be undone. <br>Your resources won't be deleted.`,
      actions: [
        { title: 'Cancel', type: 'reset' },
        { title: 'Delete', type: 'submit', kind: 'danger' }
      ]
    })
    if (!confirmed) return
    journalManager.deleteJournal(journal.id, true)
  }

  const handlePinJournal = (journalId: string) => {
    journalManager.updateJournalData(journalId, { pinned: true })
  }

  const handleUnPinJournal = (journalId: string) => {
    journalManager.updateJournalData(journalId, { pinned: false })
  }

  const handleAddToJournal = (journalId: string, resourceId: string) => {
    journalManager.addResourcesToJournal(
      journalId,
      [resourceId],
      SpaceEntryOrigin.ManuallyAdded,
      true
    )
  }

  const handleRemoveFromJournal = (journalId: string, resourceId: string) => {
    journalManager.removeResourcesFromJournal(journalId, [resourceId], true)
  }

  const handleDeleteResource = async (resource: Resource) => {
    const { closeType: confirmed } = await openDialog({
      title: `Delete Note?`,
      message: `This can't be undone.`,
      actions: [
        { title: 'Cancel', type: 'reset' },
        { title: 'Delete', type: 'submit', kind: 'danger' }
      ]
    })
    if (!confirmed) return
    journalManager.deleteResourcesFromMist(resource.id, true)
  }

  // Get context menu items for journals
  const getJournalCtxItems = (node: JournalTreeNode): CtxItem[] => {
    const journal = node.meta.journal

    // Special handling for Drafts journal
    if (node.id === 'drafts') {
      return [
        {
          type: 'action',
          text: 'Open',
          icon: 'eye',
          action: () => openJournal('drafts', { target: 'auto', from_journal_tree_sidebar: true })
        },
        {
          type: 'action',
          text: 'Open in Background',
          icon: 'arrow.up.right',
          action: () =>
            openJournal('drafts', { target: 'background_tab', from_journal_tree_sidebar: true })
        }
      ]
    }

    if (!journal) return []

    return [
      {
        type: 'action',
        text: 'Open',
        icon: 'eye',
        action: () => openJournal(journal.id, { target: 'auto', from_journal_tree_sidebar: true })
      },
      {
        type: 'action',
        text: 'Open in Background',
        icon: 'arrow.up.right',
        action: () =>
          openJournal(journal.id, { target: 'background_tab', from_journal_tree_sidebar: true })
      },
      {
        type: 'action',
        text: 'Customize',
        icon: 'edit',
        action: () => onCustomizeJournal?.(journal)
      },

      { type: 'separator' },
      {
        type: 'action',
        text: journal.data?.pinned ? 'Unpin' : 'Pin',
        icon: 'pin',
        action: () =>
          journal.data?.pinned ? handleUnPinJournal(journal.id) : handlePinJournal(journal.id)
      },
      { type: 'separator' },
      {
        type: 'action',
        kind: 'danger',
        text: 'Delete',
        icon: 'trash',
        action: () => handleDeleteJournal(journal)
      }
    ]
  }

  // Get context menu items for notes
  const getNoteCtxItems = (node: JournalTreeNode): CtxItem[] => {
    const entryId = node.meta.entryId
    const journal = node.meta.journal
    if (!entryId) return []

    // We need to get the resource from the resource manager
    const resource = resourceManager.resources.get(entryId)
    if (!resource) return []

    return getResourceCtxItems({
      resource,
      sortedJournals: journalManager.sortedJournals,
      onOpen: (target: OpenTarget) =>
        openResource(entryId, { target, offline: false, from_journal_tree_sidebar: true }),
      onAddToJournal: (journalId) => handleAddToJournal(journalId, resource.id),
      onOpenOffline: (resourceId: string) =>
        openResource(resourceId, {
          offline: true,
          target: 'tab',
          from_journal_tree_sidebar: true
        }),
      onDeleteResource: () => handleDeleteResource(resource),
      onRemove:
        journal?.id && journal.id !== 'drafts'
          ? () => handleRemoveFromJournal(journal.id, resource.id)
          : undefined
    })
  }

  async function handleCreateNoteInJournal(node: JournalTreeNode) {
    if (node.meta.type !== 'journal') return

    try {
      // Expand the journal to show the new note
      treeStore.setExpanded(node.id, true)

      // Create the note directly using resource manager
      const resource = await resourceManager.createResourceNote(
        '', // empty content
        {
          name: 'Untitled Note'
        }
      )

      // Add the note to the journal (unless it's drafts)
      if (node.id !== 'drafts' && node.meta.journal) {
        await journalManager.addResourcesToJournal(
          node.meta.journal.id,
          [resource.id],
          SpaceEntryOrigin.ManuallyAdded,
          true
        )

        // Refresh the journal contents to show the new note
        const journal = journalManager.journals.get(node.meta.journal.id)
        if (journal) {
          await journal.fetchContents()
        }
      }

      // Open the note in the current tab
      openResource(resource.id, { target: 'active_tab', offline: false })
    } catch (error) {
      console.error('[JournalTreeView] Failed to create note in journal:', error)
    }
  }

  // DND Configuration with declarative hierarchy rules
  const dragConfig: TreeDragConfig = {
    enabled: true,
    allowReorder: true,
    allowCrossNodeDrag: true,
    allowParentChildDrag: true,
    axis: 'vertical',
    showDropIndicator: true,
    hierarchyRules: {
      journal: {
        allowAsChildOf: [], // Journals cannot be nested inside other journals
        allowAsSiblingOf: ['journal'], // Journals can be reordered with other journals
        canAcceptChildren: ['note'] // Journals can accept notes as children
      },
      note: {
        allowAsChildOf: ['journal'], // Notes can be children of journals
        allowAsSiblingOf: ['note'], // Notes can be reordered with other notes
        canAcceptChildren: [] // Notes cannot accept children
      }
    }
  }

  // TreeView-specific click handler that always opens in active tab
  function handleTreeViewClick(e: MouseEvent): OpenTarget {
    const backgroundTab = isModKeyPressed(e) && !e.shiftKey
    const sidebarTab = e.shiftKey

    if (e.type === 'auxclick' && e.button === 1) {
      return 'background_tab'
    }

    return backgroundTab
      ? 'background_tab'
      : isModKeyPressed(e)
        ? 'tab'
        : sidebarTab
          ? 'sidebar'
          : 'active_tab' // Always open in active tab for tree navigation
  }

  // Initialize DND system
  let dndHandlers = $state<ReturnType<typeof createJournalTreeDragAndDrop> | null>(null)

  // Tree events
  const events: Partial<TreeEvents<JournalTreeNode>> = {
    select: (node, event) => {
      if (event) {
        const target = determineClickOpenTarget(event)
        if (node.meta.type === 'journal') {
          // Handle drafts journal (which has no journal object)
          if (node.id === 'drafts') {
            openJournal('drafts', { target, from_journal_tree_sidebar: true })
          } else if (node.meta.journal) {
            openJournal(node.meta.journal.id, { target, from_journal_tree_sidebar: true })
          }
        } else if (node.meta.type === 'note' && node.meta.entryId) {
          openResource(node.meta.entryId, { target, from_journal_tree_sidebar: true })
        }
      }
    },

    expand: async (node) => {
      // Check if this is a journal that needs fresh contents
      if (node.meta.type === 'journal' && node.meta.journal) {
        try {
          const journal = node.meta.journal
          // Ensure contents are fresh when expanding
          await journal.fetchContents()
        } catch (error) {
          console.warn('[JournalTreeView] Failed to refresh journal:', node.id, error)
        }
      }
    },

    // DND event handlers delegate to the DND system
    drop: (operation) => {
      if (dndHandlers) {
        dndHandlers.handleDrop(operation)
      }
    }
  }

  // Create tree store with persistence - must be at component initialization
  // Note: Selection state is managed externally via active tab sync
  const treeStore = createTreeStore<JournalTreeNode>(
    [], // Will be populated after data loads
    {
      persistState: true,
      persistenceKey: 'journal-tree',
      showCount: true,
      allowRename: false,
      allowMultiSelect: false,
      drag: dragConfig
    },
    events
  )

  let isInitialized = $state(false)

  // Reactive tree data that automatically updates when journals change
  // No longer waits for contents to load - just builds with whatever data is available
  let treeData = $derived.by(() => {
    // React to journals SetMap changes
    const journals = journalManager.journals.values().toArray()

    if (!isInitialized || journals.length === 0) {
      return []
    }

    return buildTreeData()
  })

  // Note: Tab selection sync is disabled in Resource renderer context
  // since we don't have access to the tabsManager service

  // PERF: This is not the fix, but it fixes freezing the renderer for 3-4 seconds
  // still not instant but better
  const setTreeNodes = useDebounce((treeData) => treeStore.setNodes(treeData), 0)
  // Effect to update tree store when reactive data changes
  $effect(() => {
    if (isInitialized && treeData) {
      setTreeNodes(treeData)
    }
  })

  // Define actions for tree nodes
  const actions: TreeNodeAction[] = [
    {
      label: 'Add Note',
      icon: 'add',
      action: handleCreateNoteInJournal,
      disabled: (node) => node.meta.type !== 'journal'
    }
  ]

  // Tree config - selection is managed externally via activeTab sync
  const config: TreeConfig<JournalTreeNode> = {
    persistenceKey: 'journal-tree',
    showCount: true,
    allowRename: false,
    allowMultiSelect: false,
    // Enable DND with our configuration
    drag: dragConfig
  }

  // Build tree data with persisted ordering - now reactive!
  function buildTreeData(): JournalTreeNode[] {
    const nodes: JournalTreeNode[] = []

    // Get persisted orders from tree store custom data
    const customData = treeStore.getCustomData()
    const persistedJournalOrder = customData.journalOrder || []
    const persistedNoteOrders = customData.noteOrders || {}

    // Add Drafts journal as first node
    const draftsNode: JournalTreeNode = {
      id: 'drafts',
      label: 'Drafts',
      meta: {
        type: 'journal' as const,
        journal: null // Special virtual journal
      },
      count: 0, // Will be updated if we fetch drafts contents
      children: undefined,
      expanded: false,
      draggable: false, // Drafts cannot be reordered
      droppable: true, // Can accept notes
      dragData: {
        journalId: 'drafts',
        originalIndex: 0,
        type: 'journal'
      }
    }
    nodes.push(draftsNode)

    // Use reactive sortedJournals from JournalManager
    const journals = journalManager.sortedJournals

    // Apply persisted journal order
    const orderedJournals = applyPersistedJournalOrder(journals, persistedJournalOrder)

    // Add journals
    orderedJournals.forEach((journal, journalIndex) => {
      // Filter note entries from journal contents
      const noteEntries = journal.contents.filter(
        (entry: any) => entry.resource_type === ResourceTypes.DOCUMENT_SPACE_NOTE
      )

      // Apply persisted note order if available
      const persistedNoteOrder = persistedNoteOrders[journal.id] || []
      const orderedNoteEntries = applyPersistedNoteOrder(noteEntries, persistedNoteOrder)

      // Create child nodes for notes
      let children: JournalTreeNode[] | undefined = undefined

      if (orderedNoteEntries.length > 0) {
        children = createNoteNodesFromEntries(orderedNoteEntries, journal)
      }

      const node: JournalTreeNode = {
        id: journal.id,
        label: journal.nameValue, // This is reactive!
        meta: { type: 'journal' as const, journal },
        count: orderedNoteEntries.length,
        children,
        expanded: false, // Let persistence control expansion
        draggable: true,
        droppable: true,
        dragData: {
          journalId: journal.id,
          originalIndex: journalIndex,
          type: 'journal'
        }
      }

      nodes.push(node)
    })

    return nodes
  }

  //// well idk anymorej
  //$effect(() => {
  //  treeStore.clearSelections()
  //})

  // Initialize journals on mount
  onMount(() => {
    async function initialize() {
      await journalManager.loadJournals()

      // Initialize DND system
      dndHandlers = createJournalTreeDragAndDrop(journalManager, treeStore)

      // Fetch all journal contents in background (don't await - let it happen async)
      // Tree will reactively update as contents load
      const journals = journalManager.journals.values().toArray()
      journals.forEach((journal) => {
        journal
          .fetchContents()
          .catch((e) =>
            console.error('[JournalTreeView] Failed to load contents for:', journal.nameValue, e)
          )
      })

      isInitialized = true
      treeStore.clearSelections()
    }

    initialize()

    // Still listen to events for operations that need immediate response
    const unsubscribers = [
      // Listen to resource creation from other renderers to refresh contents
      journalManager.on(JournalManagerEvents.CreatedResource, async (resourceId: string) => {
        // Force refresh of all journal contents to pick up new resources
        const journals = journalManager.journals.values().toArray()
        journals.forEach((journal) => {
          journal
            .fetchContents()
            .catch((e) =>
              console.error('[JournalTreeView] Failed to load contents for:', journal.nameValue, e)
            )
        })
      })
    ]

    // Cleanup event listeners on component destroy
    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  })

  // Helper to create note nodes from journal entries with persisted order
  function createNoteNodesFromEntries(noteEntries: any[], journal: any): JournalTreeNode[] {
    return noteEntries.map((entry, index) => ({
      id: entry.entry_id,
      label: 'Loading...', // Will be replaced by ResourceLoader
      meta: {
        type: 'note' as const,
        entryId: entry.entry_id,
        journal // Store journal reference for easy access
      },
      // Enable DND for notes
      draggable: true,
      droppable: true,
      dragData: {
        entryId: entry.entry_id,
        journalId: journal.id,
        originalIndex: index
      }
    }))
  }

  // Apply persisted order to note entries
  function applyPersistedNoteOrder(noteEntries: any[], persistedOrder: string[]): any[] {
    if (persistedOrder.length === 0) return noteEntries

    const entryMap = new Map(noteEntries.map((entry) => [entry.entry_id, entry]))
    const orderedEntries: any[] = []
    const usedIds = new Set<string>()

    // Add entries in persisted order
    for (const noteId of persistedOrder) {
      const entry = entryMap.get(noteId)
      if (entry) {
        orderedEntries.push(entry)
        usedIds.add(noteId)
      }
    }

    // Add any remaining entries that weren't in the persisted order
    for (const entry of noteEntries) {
      if (!usedIds.has(entry.entry_id)) {
        orderedEntries.push(entry)
      }
    }

    return orderedEntries
  }

  // Apply persisted journal order
  function applyPersistedJournalOrder(journals: any[], persistedOrder: string[]): any[] {
    if (persistedOrder.length === 0) return journals

    const journalMap = new Map(journals.map((nb) => [nb.id, nb]))
    const orderedJournals: any[] = []
    const usedIds = new Set<string>()

    // Add journals in persisted order
    for (const journalId of persistedOrder) {
      const journal = journalMap.get(journalId)
      if (journal) {
        orderedJournals.push(journal)
        usedIds.add(journalId)
      }
    }

    // Add any remaining journals that weren't in the persisted order
    for (const journal of journals) {
      if (!usedIds.has(journal.id)) {
        orderedJournals.push(journal)
      }
    }

    return orderedJournals
  }
</script>

{#if isInitialized}
  <Tree
    nodes={treeStore.nodes}
    {config}
    {events}
    {actions}
    store={treeStore}
    class="journal-tree-sidebar"
    data-tree-id="journal-tree"
  >
    {#snippet decorator(node: JournalTreeNode)}
      {#if node.meta.type === 'journal'}
        <div class="journal-cover-mini">
          {#if node.id === 'drafts'}
            <JournalCover
              title="Drafts"
              height="0.9rem"
              fontSize="0.09rem"
              readonly={true}
              tilt={false}
              --round-base="2px"
              --round-diff="-1px"
              color={[
                ['#5d5d62', '5d5d62'],
                ['#2e2f34', '#2e2f34'],
                ['#efefef', '#efefef']
              ]}
              textured={false}
            />
          {:else if node.meta.journal}
            <JournalCover
              journal={node.meta.journal}
              height="0.9rem"
              fontSize="0.09rem"
              readonly={true}
              tilt={false}
              --round-base="2px"
              --round-diff="-1px"
              textured={false}
            />
          {/if}
        </div>
      {/if}
    {/snippet}

    {#snippet children(node: JournalTreeNode)}
      {#if node.meta.type === 'note' && node.meta.entryId}
        <!-- Use ResourceLoader for reactive note display -->
        <ResourceLoader resource={node.meta.entryId}>
          {#snippet loading()}
            <button type="button" class="node-content loading" aria-label="Loading note...">
              <Icon name="file-text" size="14" />
              <span class="node-label">Loading...</span>
            </button>
          {/snippet}
          {#snippet children(resource: Resource)}
            <button
              type="button"
              class="node-content note-content"
              aria-label={`Note: ${resource.metadata.name || 'Untitled Note'}`}
              {@attach contextMenu({
                canOpen: true,
                items: getNoteCtxItems(node)
              })}
            >
              <Icon name="file-text" size="14" />
              <span class="node-label">{resource.metadata.name || 'Untitled Note'}</span>
            </button>
          {/snippet}
        </ResourceLoader>
      {:else if node.meta.type === 'journal'}
        <div
          class="node-content journal-content"
          role="button"
          tabindex="0"
          aria-label={`${node.meta.type}: ${node.label}${node.count ? ` (${node.count} items)` : ''}`}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              // Handle journal click here if needed
            }
          }}
          {@attach contextMenu({
            canOpen: true,
            items: getJournalCtxItems(node)
          })}
        >
          <span class="node-label">{node.label}</span>
        </div>
      {:else}
        <!-- Regular node display for other types -->
        <button
          type="button"
          class="node-content"
          aria-label={`${node.meta.type}: ${node.label}${node.count ? ` (${node.count} items)` : ''}`}
        >
          <span class="node-label">{node.label}</span>
        </button>
      {/if}
    {/snippet}
  </Tree>
{:else}
  <div class="loading-placeholder">
    <span>Loading journals...</span>
  </div>
{/if}

<style lang="scss">
  :global(.journal-tree-sidebar) {
    height: 100%;
    padding: 0.5rem;
    --tree-indent-size: 0.125rem;
    --tree-hover-bg: light-dark(rgba(88, 104, 132, 0.08), rgba(148, 163, 184, 0.1));
    --tree-selected-bg: light-dark(rgba(88, 104, 132, 0.12), rgba(148, 163, 184, 0.15));
    --tree-selected-border: light-dark(rgba(88, 104, 132, 0.2), rgba(148, 163, 184, 0.3));
    --tree-drop-indicator-color: light-dark(#3765ee, #8192ff);
    --tree-drag-over-bg: light-dark(rgba(59, 130, 246, 0.1), rgba(129, 146, 255, 0.15));
    background: transparent;
    overflow-y: auto;
    overflow-x: hidden;

    /* Transparent scrollbar background with visible scroll indicator */
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: light-dark(rgba(0, 0, 0, 0.2), rgba(255, 255, 255, 0.2));
      border-radius: 8px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: light-dark(rgba(0, 0, 0, 0.4), rgba(255, 255, 255, 0.3));
    }
  }

  .journal-cover-mini {
    display: flex;
    align-items: center;
    pointer-events: none;
    flex-shrink: 0;
  }

  .node-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: light-dark(rgba(0, 0, 0, 0.85), rgba(255, 255, 255, 0.85));
    width: 100%;
    padding: 0.08rem 0;
    border-radius: 6px;
    transition:
      background-color 123ms ease-out,
      opacity 150ms ease-out,
      transform 150ms ease-out;
    background: transparent;
    border: none;
    font: inherit;
    cursor: default;
    text-align: left;

    &.loading {
      opacity: 0.6;
      cursor: default;

      .node-label {
        animation: pulse 1.5s ease-in-out infinite;
      }
    }

    &.note-content {
      cursor: default;
    }

    &.journal-content {
      cursor: default;
    }
  }

  .node-label {
    font-size: 0.825rem;
    font-weight: 433;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: light-dark(rgba(0, 0, 0, 0.85), rgba(255, 255, 255, 0.85));
    transition: opacity 150ms ease-out;
  }

  // Style drafts differently
  :global(.journal-tree-sidebar [data-tree-node-id='drafts']) .node-label {
    font-style: italic;
    opacity: 0.8;
  }

  // Smooth loading transitions for ResourceLoader
  :global(.journal-tree-sidebar) {
    // Add a subtle fade-in animation for new content
    .node-content {
      animation: fadeIn 200ms ease-out;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0.7;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.6;
    }
    50% {
      opacity: 0.3;
    }
  }

  // Enhanced drag and drop styles provided by Tree component
  :global([data-dragging-item]) {
    opacity: 0.5;
    transform: scale(0.95);
  }

  // Hide drag previews for journal tree
  :global([data-drag-preview]) {
    display: none !important;
  }

  // Loading placeholder
  .loading-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: light-dark(rgba(0, 0, 0, 0.5), rgba(255, 255, 255, 0.5));
    font-style: italic;
    font-size: 0.825rem;
  }
</style>
