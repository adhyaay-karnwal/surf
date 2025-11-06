<script lang="ts">
  import {
    Button,
    contextMenu,
    MaskedScroll,
    JournalCover,
    openDialog,
    ResourceLoader,
    SearchInput
  } from '@mist/ui'
  import {
    type JournalEntry,
    ResourceTypes,
    type Option,
    type OpenTarget,
    SpaceEntryOrigin
  } from '@mist/types'
  import { JournalLoader, MistLoader, SourceCard } from '@mist/ui'
  import { type Journal } from '@mist/services/journals'
  import { type Resource, getResourceCtxItems } from '@mist/services/resources'
  import {
    isModKeyPressed,
    SearchResourceTags,
    truncate,
    useDebounce,
    useThrottle
  } from '@mist/utils'
  import type { ResourceSearchResult } from '@mist/services/resources'
  import JournalSidebarSection from './JournalSidebarSection.svelte'
  import { useJournalManager } from '@mist/services/journals'
  import JournalSidebarNoteName from './JournalSidebarNoteName.svelte'
  import {
    handleJournalClick,
    handleResourceClick,
    openJournal,
    openResource
  } from '../../handlers/journalOpenHandlers'
  import { Icon } from '@mist/icons'
  import JournalEditor from './JournalEditor/JournalEditor.svelte'
  import { onMount } from 'svelte'
  import { useMessagePortClient } from '@mist/services/messagePort'

  let {
    journalId,
    title,
    open = $bindable()
  }: {
    journalId?: string
    title: string
    open: boolean
  } = $props()

  const journalManager = useJournalManager()
  const journalsList = $derived(
    journalManager.sortedJournals
      .filter((e) => {
        if (!query) return true
        return e.nameValue.toLowerCase().includes(query.toLowerCase())
      })
      .sort((a, b) => (b.data.pinned === true) - (a.data.pinned === true))
  )

  let query = $state('')

  // TODO: Make this conversion more sane and put it in a generalized place!
  const filterNoteResources = (
    resources: JournalEntry[],
    searchResults: Option<ResourceSearchResult>
  ) => {
    if (searchResults) {
      return searchResults.filter((e) => e.resource_type === ResourceTypes.DOCUMENT_SPACE_NOTE)
    } else {
      return resources.filter((e) => e.resource_type === ResourceTypes.DOCUMENT_SPACE_NOTE)
    }
  }
  const filterOtherResources = (
    resources: JournalEntry[],
    searchResults: Option<ResourceSearchResult>
  ) => {
    if (searchResults) {
      return searchResults.filter((e) => e.resource_type !== ResourceTypes.DOCUMENT_SPACE_NOTE)
    } else return resources.filter((e) => e.resource_type !== ResourceTypes.DOCUMENT_SPACE_NOTE)
  }

  // TODO: put this in lazy scroll component
  let resourceRenderCnt = $state(20)
  $effect(() => {
    if (!open) {
      resourceRenderCnt = 20
      query = ''
    }
  })
  // TODO: Put this into lazy scroll component, no need for rawdogging crude js
  const handleMediaWheel = useThrottle(() => {
    resourceRenderCnt += 4
  }, 5)

  let isRenamingJournal: string | undefined = $state(undefined)
  let isCustomizingJournal = $state(undefined) as Journal | undefined | null

  const handleCreateJournal = async () => {
    //if (newJournalName === undefined || newJournalName.length < 1) {
    //  isCreatingJournal = false
    //  newJournalName = undefined
    //  return
    //}

    await journalManager.createJournal(
      {
        name: 'Untitled Journal'
      },
      true
    )

    //isCreatingJournal = false
    //newJournalName = undefined
    journalManager.loadJournals()
  }

  const handleCreateNote = () => {
    useMessagePortClient().createNote.send({ isNewTabPage: true })
  }

  const handleDeleteJournal = async (journal: Journal) => {
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

  const handleRenameJournal = useDebounce((journalId: string, value: string) => {
    journalManager.updateJournalData(journalId, { name: value })
  }, 175)

  const handleCancelRenameJournal = () => {
    isRenamingJournal = undefined
  }

  const handlePinJournal = (journalId: string) => {
    journalManager.updateJournalData(journalId, { pinned: true })
  }
  const handleUnPinJournal = (journalId: string) => {
    journalManager.updateJournalData(journalId, { pinned: false })
  }

  const onDeleteResource = async (resource: Resource) => {
    const { closeType: confirmed } = await openDialog({
      title: `Delete <i>${truncate(resource.metadata.name, 26)}</i>`,
      message: `This can't be undone.`,
      actions: [
        { title: 'Cancel', type: 'reset' },
        { title: 'Delete', type: 'submit', kind: 'danger' }
      ]
    })
    if (!confirmed) return
    journalManager.removeResources(resource.id, journalId ?? undefined, true)
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

  const handleOpenAsFile = (resourceId: string) => {
    // @ts-ignore
    window.api.openResourceLocally(resourceId)
  }

  const handleExport = (resourceId: string) => {
    // @ts-ignore
    window.api.exportResource(resourceId)
  }

  const getSourceCardCtxItems = (resource: Resource, sourceJournalId?: string) =>
    getResourceCtxItems({
      resource,
      sortedJournals: journalManager.sortedJournals,
      onAddToJournal: (journalId) => handleAddToJournal(journalId, resource.id),
      onOpen: (target: OpenTarget) => openResource(resource.id, { target, offline: false }),
      onOpenOffline: (resourceId: string) =>
        openResource(resourceId, { offline: true, target: 'tab' }),
      onDeleteResource: () => onDeleteResource(resource),
      onOpenAsFile: () => handleOpenAsFile(resource.id),
      onExport: () => handleExport(resource.id),
      onRemove: !sourceJournalId
        ? undefined
        : () => handleRemoveFromJournal(sourceJournalId, resource.id)
    })

  onMount(() => {
    const messagePort = useMessagePortClient()
    const unsubMessagePort = messagePort.changePageQuery.handle((event) => {
      query = event.query && event.query?.length > 0 ? event.query : null
    })

    return () => {
      unsubMessagePort()
    }
  })
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === 'f' && isModKeyPressed(e)) {
      open = !open
    }
  }}
/>

{#if isCustomizingJournal}
  <JournalEditor bind:journal={isCustomizingJournal} />
{:else if isCustomizingJournal === null}
  <JournalEditor />
{/if}

<aside class:open>
  {#if !open}
    <header class="px pt">
      <Button size="md" onclick={() => (open = true)}>
        <Icon name="sidebar.left" style="opacity: 0.5;" />
        <span class="typo-title-sm" style="opacity: 0.5;">Show Sources</span>
      </Button>
    </header>
  {:else if journalId === 'drafts'}
    <header class="px pt">
      <div class="hstack" style="gap: 0.5rem;">
        <Button size="md" onclick={() => (open = false)}>
          <Icon name="sidebar.left" style="opacity: 0.5;" />
          <span class="typo-title-sm" style="opacity: 0.5;">Hide Sources</span>
        </Button>
        <!--<h1>
          {query ? 'Search Results' : 'Drafts'}
        </h1>-->
      </div>
      <div class="hstack" style="gap: 0.5rem;">
        <SearchInput onsearchinput={(v) => (query = v)} autofocus animated={false} />
      </div>
    </header>

    <MaskedScroll --padding={'0.5rem 0.5rem 0rem 0.5rem'}>
      <MistLoader
        excludeWithinSpaces
        tags={[SearchResourceTags.ResourceType(ResourceTypes.DOCUMENT_SPACE_NOTE, 'eq')]}
        search={{
          query,
          tags: [SearchResourceTags.ResourceType(ResourceTypes.DOCUMENT_SPACE_NOTE, 'eq')],
          parameters: {
            semanticSearch: false
          }
        }}
      >
        {#snippet children([resources, searchResult, searching])}
          {#if !query || (searchResult ?? resources).length > 0}
            <JournalSidebarSection title="Notes" class="chapters" open={query}>
              <ul>
                {#each searchResult ?? resources as resource (resource.id)}
                  <ResourceLoader {resource}>
                    {#snippet children(resource: Resource)}
                      <JournalSidebarNoteName {resource} />
                    {/snippet}
                  </ResourceLoader>
                {/each}
              </ul>
            </JournalSidebarSection>
          {/if}
        {/snippet}
      </MistLoader>

      <MistLoader
        excludeWithinSpaces
        tags={[SearchResourceTags.ResourceType(ResourceTypes.DOCUMENT_SPACE_NOTE, 'ne')]}
        search={{
          query,
          tags: [SearchResourceTags.ResourceType(ResourceTypes.DOCUMENT_SPACE_NOTE, 'ne')],
          parameters: {
            semanticSearch: false
          }
        }}
      >
        {#snippet children([resources, searchResult, searching])}
          {#if !query || (searchResult ?? resources).length > 0}
            <JournalSidebarSection title="Media" class="sources" open>
              {#if (searchResult ?? resources).length <= 0}
                <div class="px py">
                  <div class="empty">
                    <p class="typo-title-sm">
                      Add webpages to this journal for them to show up here. <!--or drop in files to add to this journal.-->
                    </p>
                  </div>
                </div>
              {:else}
                <div class="sources-grid" onwheel={handleMediaWheel}>
                  {#each (searchResult ?? resources).slice(0, searchResult ? Infinity : resourceRenderCnt) as resource (resource.id)}
                    <ResourceLoader {resource}>
                      {#snippet children(resource: Resource)}
                        <SourceCard
                          --width={'5rem'}
                          --max-width={''}
                          {resource}
                          text
                          {onDeleteResource}
                          onclick={(e) => handleResourceClick(resource.id, e)}
                          {@attach contextMenu({
                            canOpen: true,
                            items: getSourceCardCtxItems(resource)
                          })}
                        />
                      {/snippet}
                    </ResourceLoader>
                  {/each}
                </div>
                {#if resourceRenderCnt < (searchResult ?? resources).length}
                  <div style="text-align:center;width:100%;margin-top:1rem;">
                    <span class="typo-title-sm" style="opacity: 0.5;">Scroll to load more</span>
                  </div>
                {/if}
              {/if}
            </JournalSidebarSection>
          {/if}
        {/snippet}
      </MistLoader>
    </MaskedScroll>
  {:else if !journalId}
    <header class="px pt">
      <div class="hstack" style="gap: 0.5rem;">
        <Button size="md" onclick={() => (open = false)}>
          <Icon name="sidebar.left" style="opacity: 0.5;" />
          <span class="typo-title-sm" style="opacity: 0.5;">Hide Sources</span>
        </Button>
      </div>
      <div class="hstack" style="gap: 0.5rem;">
        <SearchInput onsearchinput={(v) => (query = v)} autofocus animated={false} />
      </div>
    </header>
    <!--<section style="height: 4rem; padding-inline: 1.5rem; padding-block: 1rem;">
      <h1>
        {query ? 'Search Results' : 'Mist'}
      </h1>
    </section>-->
    <MaskedScroll --padding={'0.5rem 0.5rem 0rem 0.5rem'}>
      {#if !query || (query !== null && query.length > 0 && journalsList.length > 0)}
        <JournalSidebarSection
          title="Journals"
          class="journals"
          open={query}
          --closed-height="15rem"
        >
          <div class="journal-grid">
            {#if !query}
              <div
                class="journal-wrapper new"
                style="width: 100%;max-width: 12ch;"
                style:--delay={'100ms'}
                onclick={async (event) => {
                  const journal = await journalManager.createJournal(
                    {
                      name: 'Untitled Journal'
                    },
                    true
                  )

                  openJournal(journal.id, { target: 'auto' })
                }}
              >
                <div class="journal-create">
                  <Icon name="add" size="1.75rem" />
                </div>
              </div>
              <div
                class="journal-wrapper"
                style="width: 100%;max-width: 12ch;"
                style:--delay={'100ms'}
                onclick={async (event) => {
                  handleJournalClick('drafts', event)
                }}
              >
                <JournalCover
                  title="Drafts"
                  height="18ch"
                  fontSize="0.9rem"
                  color={[
                    ['#5d5d62', '5d5d62'],
                    ['#2e2f34', '#2e2f34'],
                    ['#efefef', '#efefef']
                  ]}
                  onclick={() => {}}
                />
              </div>
            {/if}
            {#each journalsList as journal, i (journal.id + i)}
              <div
                class="journal-wrapper"
                style="width: 100%;max-width: 12ch;"
                style:--delay={100 + i * 10 + 'ms'}
              >
                <JournalCover
                  {journal}
                  height="18ch"
                  fontSize="0.9rem"
                  onclick={(e) => openJournal(journal.id, { target: 'auto' })}
                  {@attach contextMenu({
                    canOpen: true,
                    items: [
                      !journal.data.pinned
                        ? {
                            type: 'action',
                            text: 'Add to Favorites',
                            icon: 'heart',
                            action: () => handlePinJournal(journal.id)
                          }
                        : {
                            type: 'action',
                            text: 'Remove from Favorites',
                            icon: 'heart.off',
                            action: () => handleUnPinJournal(journal.id)
                          },
                      /*{
                        type: 'action',
                        text: 'Rename',
                      icon: 'edit',
                        action: () => (isRenamingJournal = journal.id)
                      },*/
                      {
                        type: 'action',
                        text: 'Customize',
                        icon: 'edit',
                        action: () => (isCustomizingJournal = journal)
                      },

                      {
                        type: 'action',
                        kind: 'danger',
                        text: 'Delete',
                        icon: 'trash',
                        action: () => handleDeleteJournal(journal)
                      }
                    ]
                  })}
                />
              </div>
            {/each}
          </div>
        </JournalSidebarSection>
      {/if}

      <MistLoader
        tags={[SearchResourceTags.ResourceType(ResourceTypes.DOCUMENT_SPACE_NOTE, 'eq')]}
        search={{
          query,
          tags: [SearchResourceTags.ResourceType(ResourceTypes.DOCUMENT_SPACE_NOTE, 'eq')],
          parameters: {
            semanticSearch: false
          }
        }}
      >
        {#snippet children([resources, searchResult, searching])}
          {#if !query || (searchResult ?? resources).length > 0}
            <JournalSidebarSection title="Notes" class="chapters" open={query}>
              <ul>
                {#if !query}
                  <JournalSidebarNoteName onclick={() => handleCreateNote()} />
                {/if}
                {#each searchResult ?? resources as resource, i (resource.id + i)}
                  <ResourceLoader {resource}>
                    {#snippet children(resource: Resource)}
                      <JournalSidebarNoteName {resource} />
                    {/snippet}
                  </ResourceLoader>
                {/each}
              </ul>
            </JournalSidebarSection>
          {/if}
        {/snippet}
      </MistLoader>

      <MistLoader
        tags={[SearchResourceTags.ResourceType(ResourceTypes.DOCUMENT_SPACE_NOTE, 'ne')]}
        search={{
          query,
          tags: [SearchResourceTags.ResourceType(ResourceTypes.DOCUMENT_SPACE_NOTE, 'ne')],
          parameters: {
            semanticSearch: false
          }
        }}
      >
        {#snippet children([resources, searchResult, searching])}
          {#if !query || (searchResult ?? resources).length > 0}
            <JournalSidebarSection title="Media" class="sources" open>
              {#if (searchResult ?? resources).length <= 0}
                <div class="px py">
                  <div class="empty">
                    <p class="typo-title-sm">
                      Add webpages to this journal for them to show up here. <!--or drop in files to add to this journal.-->
                    </p>
                  </div>
                </div>
              {:else}
                <div class="sources-grid" onwheel={handleMediaWheel}>
                  {#each (searchResult ?? resources).slice(0, searchResult ? Infinity : resourceRenderCnt) as resource, i (resource.id + i)}
                    <ResourceLoader {resource}>
                      {#snippet children(resource: Resource)}
                        <SourceCard
                          --width={'5rem'}
                          --max-width={''}
                          {resource}
                          text
                          {onDeleteResource}
                          onclick={(e) => handleResourceClick(resource.id, e)}
                          {@attach contextMenu({
                            canOpen: true,
                            items: getSourceCardCtxItems(resource)
                          })}
                        />
                      {/snippet}
                    </ResourceLoader>
                  {/each}
                </div>
                {#if resourceRenderCnt < (searchResult ?? resources).length}
                  <div style="text-align:center;width:100%;margin-top:1rem;">
                    <span class="typo-title-sm" style="opacity: 0.5;">Scroll to load more</span>
                  </div>
                {/if}
              {/if}
            </JournalSidebarSection>
          {/if}
        {/snippet}
      </MistLoader>
    </MaskedScroll>
  {:else}
    <JournalLoader
      {journalId}
      search={{
        query,
        parameters: {
          semanticSearch: false
        }
      }}
      fetchContents
    >
      {#snippet children([journal, searchResult, searching])}
        <header class="px pt">
          <div class="hstack" style="gap: 0.5rem; ">
            <Button size="md" onclick={() => (open = false)}>
              <Icon name="sidebar.left" style="opacity: 0.5;" />
              <span class="typo-title-sm" style="opacity: 0.5;">Hide Sources</span>
            </Button>
            <!--<h1>
              {query ? 'Search Results' : journal ? journal.nameValue : title}
            </h1>-->
          </div>
          <div class="hstack" style="gap: 0.5rem;">
            <SearchInput onsearchinput={(v) => (query = v)} autofocus animated={false} />
          </div>
        </header>

        <MaskedScroll --padding={'0.5rem 0.5rem 0rem 0.5rem'}>
          {#if !query}
            <div style="height: 20ch;padding-inline: 1.75rem;margin-top: 1rem;">
              <JournalCover
                {journal}
                height="18ch"
                fontSize="0.9rem"
                {@attach contextMenu({
                  canOpen: true,
                  items: [
                    {
                      type: 'action',
                      text: 'Customize',
                      icon: 'edit',
                      action: () => (isCustomizingJournal = journal)
                    },

                    {
                      type: 'action',
                      kind: 'danger',
                      text: 'Delete',
                      icon: 'trash',
                      action: () => handleDeleteJournal(journal)
                    }
                  ]
                })}
              />
            </div>
          {/if}

          {#if !query || filterNoteResources(journal.contents, searchResult).length > 0}
            <JournalSidebarSection title="Notes" class="chapters" open={query}>
              <ul>
                {#if !query}
                  <JournalSidebarNoteName onclick={() => handleCreateNote()} />
                {/if}
                {#each filterNoteResources(journal.contents, searchResult) as { entry_id: resourceId }, i (resourceId + i)}
                  <ResourceLoader resource={resourceId}>
                    {#snippet children(resource: Resource)}
                      <JournalSidebarNoteName {resource} sourceJournalId={journal.id} />
                    {/snippet}
                  </ResourceLoader>
                {/each}
              </ul>
            </JournalSidebarSection>
          {:else if !query}
            <JournalSidebarSection title="Notes" class="chapters" open={query}>
              <ul>
                <JournalSidebarNoteName onclick={() => handleCreateNote()} />
              </ul>
            </JournalSidebarSection>
          {/if}

          {#if !query || filterOtherResources(journal.contents, searchResult).length > 0}
            <JournalSidebarSection title="Media" class="sources" open>
              {#if filterOtherResources(journal.contents, searchResult).length <= 0}
                <div class="px py">
                  <div class="empty">
                    <p class="typo-title-sm">
                      Add webpages to this journal for them to show up here. <!--or drop in files to add to this journal.-->
                    </p>
                  </div>
                </div>
              {:else}
                <div class="sources-grid" onwheel={handleMediaWheel}>
                  {#each filterOtherResources(journal.contents, searchResult).slice(0, resourceRenderCnt) as { entry_id: resourceId }, i (resourceId + i)}
                    <ResourceLoader resource={resourceId}>
                      {#snippet children(resource: Resource)}
                        <SourceCard
                          --width={'5rem'}
                          --max-width={''}
                          {resource}
                          text
                          {onDeleteResource}
                          onclick={(e) => handleResourceClick(resource.id, e)}
                          {@attach contextMenu({
                            canOpen: true,
                            items: getSourceCardCtxItems(resource, journal.id)
                          })}
                          sourceJournalId={journal.id}
                        />
                      {/snippet}
                    </ResourceLoader>
                  {/each}
                </div>
                {#if resourceRenderCnt < filterOtherResources(journal.contents, searchResult).length}
                  <div style="text-align:center;width:100%;margin-top:1rem;">
                    <span class="typo-title-sm" style="opacity: 0.5;">Scroll to load more</span>
                  </div>
                {/if}
              {/if}
            </JournalSidebarSection>
          {/if}
        </MaskedScroll>
      {/snippet}
    </JournalLoader>
  {/if}
</aside>

<style lang="scss">
  @media screen and (max-width: 850px) {
    aside.open {
      width: 100% !important;
    }
  }
  aside {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;

    &.open {
      bottom: 0;
      width: var(--sidebar-width);
      background: rgba(250, 250, 250, 1);
      border-left: 1px solid rgba(0, 0, 0, 0.05);
      box-shadow: rgba(99, 99, 99, 0.1) 0px 2px 8px 0px;
    }

    display: flex;
    flex-direction: column;

    transition-property: background, border-color;
    transition-duration: 123ms;
    transition-timing-function: ease-out;

    > header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    section > h1 {
      font-family: 'Gambarino';
      font-size: 1.1rem;
      letter-spacing: 0.01em;
      line-height: 1.3;

      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }

    section {
      display: flex;
      flex-direction: column;
      flex-shrink: 1;
      flex-grow: 1;

      width: 100%;
      height: 100%;

      > header {
        margin-bottom: 0.25rem;

        > label {
          color: var(--text-color);
          leading-trim: both;
          text-edge: cap;
          font-family: Inter;
          font-size: 0.75rem;
          font-style: normal;
          font-weight: 600;
          line-height: 0.9355rem; /* 124.736% */
          opacity: 0.75;
        }
      }

      > details {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;

        > summary {
          list-style: none;
          border-radius: 8px;
          padding: 0.4rem 0.5rem;

          display: flex;
          align-items: center;
          gap: 1rem;
          > hr {
            width: 100%;
          }

          &:hover {
            background: rgba(0, 0, 0, 0.05);
          }

          transition: background 123ms ease-out;

          > label {
            color: var(--text-color);
            leading-trim: both;
            text-edge: cap;
            font-family: Inter;
            font-size: 0.75rem;
            font-style: normal;
            font-weight: 600;
            line-height: 0.9355rem; /* 124.736% */
            opacity: 0.75;
            pointer-events: none;
          }
        }
      }
    }

    section.journals {
      .journal-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
      }
    }

    .hstack {
      display: flex;
      align-items: center;
    }
    .px {
      padding-inline: 12px;
    }
    .py {
      padding-block: 12px;
    }
    .pt {
      padding-top: 12px;
    }
  }

  :global(aside section.journals) {
    .journal-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;

      display: flex;
      flex-wrap: wrap;
      //justify-content: space-between;
      justify-items: center;
    }
  }

  :global(aside section.sources) {
    .sources-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.5rem;
    }
  }

  :global(aside section.chapters) {
    font-size: 0.9rem;
  }

  .empty {
    width: 100%;
    border: 1px dashed rgba(0, 0, 0, 0.2);
    padding: 0.75rem 0.75rem;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgba(0, 0, 0, 0.25);
    text-align: center;
    text-wrap: pretty;
    p {
      max-width: 28ch;
    }
  }

  .journal-create {
    margin-left: 0.2rem;
    height: 100%;
    --color: rgba(0, 0, 0, 0.25);
    border: 1px dashed var(--color);
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.015);

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: var(--color);

    transition: transform 123ms ease-out;

    > span {
      font-size: 0.9rem;
      text-align: center;
    }

    &:hover {
      transform: scale(1.025) rotate3d(1, 2, 4, 1.5deg);
    }
  }
  .journal-wrapper.new {
    padding: 0.5rem 0.25rem;
  }
</style>
