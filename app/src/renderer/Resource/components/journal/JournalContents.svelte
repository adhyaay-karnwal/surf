<script lang="ts">
  import { DynamicIcon, Icon } from '@mist/icons'
  import { Journal, useJournalManager } from '@mist/services/journals'
  import {
    Button,
    contextMenu,
    JournalCover,
    JournalLoader,
    openDialog,
    ResourceLoader,
    SearchInput,
    SimpleTabs,
    SourceCard,
    MistLoader
  } from '@mist/ui'
  import {
    handleJournalClick,
    handleResourceClick,
    openJournal,
    openResource
  } from '../../handlers/journalOpenHandlers'
  import JournalEditor from './JournalEditor/JournalEditor.svelte'
  import { conditionalArrayItem, SearchResourceTags, truncate, useThrottle } from '@mist/utils'
  import { type OpenTarget, ResourceTypes, SpaceEntryOrigin } from '@mist/types'
  import JournalSidebarNoteName from './JournalSidebarNoteName.svelte'
  import { useResourceManager, Resource, getResourceCtxItems } from '@mist/services/resources'
  import { useMessagePortClient } from '@mist/services/messagePort'
  import { promptForFilesAndTurnIntoResources, useTeletypeService } from '@mist/services'
  import { tick } from 'svelte'

  let { journalId }: { journalId?: string } = $props()

  const teletype = useTeletypeService()
  const ttyQuery = teletype.query

  let isCustomizingJournal = $state(undefined) as Journal | undefined | null
  let isNewJournal = $state(undefined) as Journal | undefined | null
  let activeTab = $state<'journals' | 'notes' | 'sources'>(
    journalId === undefined ? 'journals' : 'notes'
  )
  let showAll = $state(false)
  $effect(() => {
    if (activeTab) showAll = false
  })

  const query = $derived($ttyQuery)
  let searchQuery = $state('')

  let resourceRenderCnt = $state(20)
  // TODO: Put this into lazy scroll component, no need for rawdogging crude js
  const handleMediaWheel = useThrottle(() => {
    resourceRenderCnt += 4
  }, 5)

  const journalManager = useJournalManager()
  const resourceManager = useResourceManager()

  const journalsList = $derived(
    journalManager.sortedJournals
      .filter((e) => {
        if (!searchQuery) return true
        return e.nameValue.toLowerCase().includes(searchQuery.toLowerCase())
      })
      .sort((a, b) => (b.data.pinned === true) - (a.data.pinned === true))
  )

  const handleCreateNote = () => {
    useMessagePortClient().createNote.send({ isNewTabPage: true })
  }

  const handlePinJournal = (journalId: string) => {
    journalManager.updateJournalData(journalId, { pinned: true })
  }
  const handleUnPinJournal = (journalId: string) => {
    journalManager.updateJournalData(journalId, { pinned: false })
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

  const handleCancelNewJournal = async (journal: Journal) => {
    journalManager.deleteJournal(journal.id, true)
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
    journalManager.deleteResourcesFromMist(resource.id, true)
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

  const handleUploadFiles = async () => {
    await promptForFilesAndTurnIntoResources(resourceManager, journalId)

    if (!journalId || journalId === 'drafts') {
      activeTab = 'notes'
      await tick()
      activeTab = 'sources'
    }
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
      onRemove:
        !sourceJournalId || sourceJournalId === 'drafts'
          ? undefined
          : () => handleRemoveFromJournal(sourceJournalId, resource.id)
    })

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

  let showAllNotes = true
</script>

{#snippet notesList(visibleItems, allItems)}
  {#if allItems.length <= 0}
    {#if (journalId ? $ttyQuery : searchQuery).length > 0}
      <section class="empty">
        <p>Nothing found for "{journalId ? $ttyQuery : searchQuery}"</p>
      </section>
    {:else}
      <div class="px py">
        <section class="empty">
          <h1>What are Mist Notes?</h1>

          <p style="max-width: 50ch;">
            Mist notes are rich text documents that you can create manually or generate using Mist's
            AI from your personal media.<br />
          </p>

          <p style="max-width: 48ch;">
            Jump start a new note by asking Mist's AI something in the input box above or create a
            blank note using the button.
          </p>

          <!-- <Button size="md" onclick={handleUploadFiles}>Import Local Files</Button> -->
        </section>
      </div>
    {/if}
  {:else}
    {#each visibleItems as resource, i (typeof resource === 'string' ? resource : resource.id + i)}
      <ResourceLoader {resource}>
        {#snippet children(resource: Resource)}
          <JournalSidebarNoteName {resource} sourceJournalId={journalId} />
        {/snippet}
      </ResourceLoader>
    {/each}

    {#if allItems.length > visibleItems.length}
      <div style="margin-top: 0.75rem;" onclick={() => (showAll = !showAll)}>
        <Button size="md"
          >{#if showAll}Hide{:else}Show All{/if}</Button
        >
      </div>
    {/if}
  {/if}
{/snippet}

{#snippet sourcesList(visibleItems, allItems)}
  {#if allItems.length <= 0}
    {#if (journalId ? $ttyQuery : searchQuery).length > 0}
      <section class="empty">
        <p>Nothing found for "{journalId ? $ttyQuery : searchQuery}"</p>
      </section>
    {:else}
      <div class="px py">
        <div class="empty">
          <h1>Mist Media</h1>

          <p style="max-width: 55ch;">
            Add media from across the web or your system to your journal and to use it together with
            Mist Notes to turn them into something great.
          </p>

          <p style="max-width: 57ch;">
            Save web pages using the "Save" button while browsing, import local files or add
            existing media from other journals by right-clicking them.
          </p>

          <!-- <h2>
            What you can add:
          </h2> -->

          <!-- <ul>
            <li>Web pages (articles, PDFs, YouTube Videos, documents, & more)</li>
            <li>Local files (PDFs)</li>
            <li>Existing media from other journals</li>
          </ul> -->

          <!-- <Button size="md" onclick={handleUploadFiles}>Import Local Files</Button> -->
        </div>
      </div>
    {/if}
  {:else}
    <div class="sources-grid" onwheel={handleMediaWheel}>
      {#each visibleItems as resource, i (typeof resource === 'string' ? resource : resource.id + i)}
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
                items: getSourceCardCtxItems(resource, journalId)
              })}
            />
          {/snippet}
        </ResourceLoader>
      {/each}
    </div>
    {#if resourceRenderCnt < allItems.length}
      <div style="text-align:center;width:100%;margin-top:1rem;">
        <span class="typo-title-sm" style="opacity: 0.5;">Scroll to load more</span>
      </div>
    {/if}
  {/if}
{/snippet}

{#if isCustomizingJournal}
  <JournalEditor bind:journal={isCustomizingJournal} />
{:else if isCustomizingJournal === null}
  <JournalEditor />
{/if}

{#if isNewJournal}
  <JournalEditor
    bind:journal={isNewJournal}
    mode="create"
    oncreate={() => {
      handlePinJournal(isNewJournal!.id)
      isNewJournal = null
    }}
    oncancel={() => {
      handleCancelNewJournal(isNewJournal!)
      isNewJournal = null
    }}
  />
{/if}

<header class="flex items-center justify-between">
  <SimpleTabs
    bind:activeTabId={activeTab}
    onSelect={() => (showAllNotes = false)}
    tabs={[
      ...conditionalArrayItem(journalId === undefined, {
        id: 'journals',
        label: 'Journals',
        icon: 'journal'
      }),
      {
        id: 'notes',
        label: 'Notes',
        icon: 'note'
      },
      {
        id: 'sources',
        label: 'Media',
        icon: 'link'
      }
    ]}
  />

  <!-- {#if !journalId}
    <SearchInput bind:value={searchQuery} placeholder="Search stuff..." />
  {/if} -->

  {#if activeTab === 'notes'}
    <Button size="md" onclick={handleCreateNote} class="add-btn">
      <Icon name="add" />
      <span> New Note </span>
    </Button>
  {:else if activeTab === 'sources'}
    <Button size="md" onclick={handleUploadFiles} class="add-btn">
      <Icon name="folder.open" />
      Import Files
    </Button>
  {/if}
</header>

{#if activeTab === 'journals'}
  {#if !searchQuery || (searchQuery !== null && searchQuery.length > 0)}
    <div class="journal-grid">
      {#if !searchQuery}
        <div
          class="journal-wrapper new"
          style="width: 100%;max-width: 11.25ch;"
          style:--delay={'100ms'}
          onclick={async (event) => {
            try {
              const journal = await journalManager.createJournal(
                {
                  name: 'Untitled Journal'
                },
                true
              )
              isNewJournal = journal
            } catch (e) {
              console.error('Failed to create journal', e)
            }
          }}
        >
          <div class="journal-create">
            <Icon name="add" size="1.75rem" />
            <!--<small style="text-align:center;font-size:0.8em;margin-top:0.2em;"
              >Create Journal</small
            >-->
          </div>
        </div>
      {/if}

      {#if !searchQuery || 'drafts'.includes(searchQuery.trim().toLowerCase())}
        <div
          class="journal-wrapper"
          style="width: 100%;max-width: 11.25ch;"
          style:--delay={'100ms'}
          onclick={async (event) => {
            handleJournalClick('drafts', event)
          }}
        >
          <JournalCover
            title="Drafts"
            height="17.25ch"
            fontSize="0.85rem"
            color={[
              ['#5d5d62', '5d5d62'],
              ['#2e2f34', '#2e2f34'],
              ['#efefef', '#efefef']
            ]}
            onclick={() => {}}
          />
        </div>
      {/if}

      {#each journalsList.slice(0, showAll ? Infinity : journalsList.filter((e) => e.data.pinned).length) as journal, i (journal.id + i)}
        <div
          class="journal-wrapper"
          style="width: 100%;max-width: 11.25ch;"
          style:--delay={100 + i * 10 + 'ms'}
        >
          <JournalCover
            {journal}
            height="17.25ch"
            fontSize="0.85rem"
            onclick={(e) => handleJournalClick(journal.id, e)}
            onpin={() => handlePinJournal(journal.id)}
            onunpin={() => handleUnPinJournal(journal.id)}
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

    {#if journalsList.length > journalsList.slice(0, showAll ? Infinity : journalsList.filter((e) => e.data.pinned).length).length}
      <div style="margin-top: 0.75rem;" onclick={() => (showAll = !showAll)}>
        <Button size="md"
          >{#if showAll}Hide{:else}Show All{/if}</Button
        >
      </div>
    {/if}
  {/if}
{:else if activeTab === 'notes'}
  <ul>
    <!-- {#if !searchQuery}
      <JournalSidebarNoteName onclick={() => handleCreateNote()} />
    {/if} -->

    {#if !journalId}
      <MistLoader
        tags={[SearchResourceTags.ResourceType(ResourceTypes.DOCUMENT_SPACE_NOTE, 'eq')]}
        search={{
          query: searchQuery,
          tags: [SearchResourceTags.ResourceType(ResourceTypes.DOCUMENT_SPACE_NOTE, 'eq')],
          parameters: {
            semanticSearch: false
          }
        }}
      >
        {#snippet children([resources, searchResult, searching])}
          {@render notesList(
            (searchResult ?? resources).slice(0, showAll ? Infinity : 6),
            resources
          )}
        {/snippet}

        {#snippet loading()}
          <div class="loading">
            <Icon name="spinner" />
            <p class="typo-title-sm">Loading…</p>
          </div>
        {/snippet}
      </MistLoader>
    {:else if journalId === 'drafts'}
      <MistLoader
        excludeWithinSpaces
        tags={[SearchResourceTags.ResourceType(ResourceTypes.DOCUMENT_SPACE_NOTE, 'eq')]}
        search={{
          query: $ttyQuery,
          tags: [SearchResourceTags.ResourceType(ResourceTypes.DOCUMENT_SPACE_NOTE, 'eq')],
          parameters: {
            semanticSearch: false
          }
        }}
      >
        {#snippet children([resources, searchResult, searching])}
          {@render notesList(
            (searchResult ?? resources).slice(0, showAll ? Infinity : 6),
            resources
          )}
        {/snippet}

        {#snippet loading()}
          <div class="loading">
            <Icon name="spinner" />
            <p class="typo-title-sm">Loading…</p>
          </div>
        {/snippet}
      </MistLoader>
    {:else}
      <JournalLoader
        {journalId}
        search={{
          query: $ttyQuery,
          parameters: {
            semanticSearch: false
          }
        }}
        fetchContents
      >
        {#snippet children([journal, searchResult, searching])}
          {@render notesList(
            filterNoteResources(journal?.contents ?? [], searchResult).map((e) => e.entry_id),
            filterNoteResources(journal?.contents ?? [], searchResult).map((e) => e.entry_id)
          )}
        {/snippet}

        {#snippet loading()}
          <div class="loading">
            <Icon name="spinner" />
            <p class="typo-title-sm">Loading…</p>
          </div>
        {/snippet}
      </JournalLoader>
    {/if}
  </ul>
{:else if activeTab === 'sources'}
  <!-- {#if !searchQuery}
    <JournalSidebarNoteName fallbackIcon="folder.open" fallbackText="Import Local Files" onclick={() => handleUploadFiles()} />
  {/if} -->

  {#if !journalId}
    <MistLoader
      tags={[SearchResourceTags.ResourceType(ResourceTypes.DOCUMENT_SPACE_NOTE, 'ne')]}
      search={{
        query: searchQuery,
        tags: [SearchResourceTags.ResourceType(ResourceTypes.DOCUMENT_SPACE_NOTE, 'ne')],
        parameters: {
          semanticSearch: false
        }
      }}
    >
      {#snippet children([resources, searchResult, searching])}
        {@render sourcesList(
          (searchResult ?? resources).slice(
            0,
            searchResult ? Infinity : showAll ? Infinity : resourceRenderCnt
          ),
          resources
        )}
      {/snippet}

      {#snippet loading()}
        <div class="loading">
          <Icon name="spinner" />
          <p class="typo-title-sm">Loading…</p>
        </div>
      {/snippet}
    </MistLoader>
  {:else if journalId === 'drafts'}
    <MistLoader
      excludeWithinSpaces
      tags={[SearchResourceTags.ResourceType(ResourceTypes.DOCUMENT_SPACE_NOTE, 'ne')]}
      search={{
        query: $ttyQuery,
        tags: [SearchResourceTags.ResourceType(ResourceTypes.DOCUMENT_SPACE_NOTE, 'ne')],
        parameters: {
          semanticSearch: false
        }
      }}
    >
      {#snippet children([resources, searchResult, searching])}
        {@render sourcesList(
          (searchResult ?? resources).slice(
            0,
            searchResult ? Infinity : showAll ? Infinity : resourceRenderCnt
          ),
          resources
        )}
      {/snippet}

      {#snippet loading()}
        <div class="loading">
          <Icon name="spinner" />
          <p class="typo-title-sm">Loading…</p>
        </div>
      {/snippet}
    </MistLoader>
  {:else}
    <JournalLoader
      {journalId}
      search={{
        query: $ttyQuery,
        parameters: {
          semanticSearch: false
        }
      }}
      fetchContents
    >
      {#snippet children([journal, searchResult, searching])}
        {@render sourcesList(
          filterOtherResources(journal?.contents ?? [], searchResult)
            .slice(0, resourceRenderCnt)
            .map((e) => e.entry_id),
          filterOtherResources(journal?.contents ?? [], searchResult).map((e) => e.entry_id)
        )}
      {/snippet}

      {#snippet loading()}
        <div class="loading">
          <Icon name="spinner" />
          <p class="typo-title-sm">Loading…</p>
        </div>
      {/snippet}
    </JournalLoader>
  {/if}
{/if}

<style lang="scss">
  header {
    margin-bottom: 1rem;
    margin-inline: -0.25rem;
    padding-bottom: 0.75rem;
  }

  .journal-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;

    display: flex;
    flex-wrap: wrap;
    //justify-content: space-between;
    justify-items: center;
  }

  .journal-create {
    margin-left: 0.2rem;
    height: 100%;
    --color: light-dark(rgba(0, 0, 0, 0.25), rgba(255, 255, 255, 0.3));
    border: 1px dashed var(--color);
    border-radius: 12px;
    background: light-dark(rgba(0, 0, 0, 0.015), rgba(255, 255, 255, 0.02));

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

  .sources-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .empty,
  .loading {
    width: 100%;
    border: 1px dashed light-dark(rgba(0, 0, 0, 0.2), rgba(71, 85, 105, 0.4));
    padding: 0.75rem 0.75rem;
    border-radius: 10px;
    gap: 0.5rem;
    color: light-dark(rgba(0, 0, 0, 0.25), rgba(255, 255, 255, 0.3));
    text-align: center;
    text-wrap: pretty;

    h1 {
      color: light-dark(rgba(0, 0, 0, 0.75), rgba(255, 255, 255, 0.8));
    }

    p {
      font-size: var(--title-sm-fontSize);
      line-height: var(--title-sm-lineHeight);
      letter-spacing: 0.015em;
      font-weight: 400;
      color: light-dark(rgba(0, 0, 0, 0.5), rgba(255, 255, 255, 0.5));
      max-width: 60ch;
    }
  }

  .empty {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }

  .import-btn {
    --color-link: light-dark(rgba(96, 117, 241, 1), rgba(129, 146, 255, 1));
    --color-link-muted: light-dark(rgba(96, 117, 241, 0.6), rgba(129, 146, 255, 0.6));
    --color-link-hover: light-dark(rgb(125, 143, 243), rgb(150, 165, 255));

    background: none;
    border: none;
    padding: 0;

    font-weight: normal;
    letter-spacing: 0.02em;
    color: var(--color-link);
    text-decoration: underline;

    text-decoration-thickness: 1.25px;
    text-decoration-color: var(--color-link-muted);
    text-underline-offset: 2px;
    text-decoration-style: dashed;

    spellcheck: false;

    &:hover {
      color: var(--color-link-hover);
    }
  }

  :global(.add-btn[data-button-root]) {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.33rem 0.25rem 0.5rem;
    font-size: 0.9rem;
    opacity: 0.5;

    &:hover {
      opacity: 0.5 !important;
    }
  }
</style>
