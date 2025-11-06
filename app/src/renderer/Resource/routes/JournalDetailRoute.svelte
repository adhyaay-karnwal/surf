<script lang="ts">
  import {
    useResourceManager,
    type Resource,
    type ResourceSearchResult
  } from '@mist/services/resources'
  import { Button, PageMention, JournalLoader, Renamable, contextMenu, openDialog } from '@mist/ui'
  import TeletypeEntry from '../../Core/components/Teletype/TeletypeEntry.svelte'
  import { ResourceLoader, JournalCover } from '@mist/ui'
  import type { ChatPrompt, JournalEntry, Option, ViewLocation } from '@mist/types'
  import { ResourceTypes, SpaceEntryOrigin } from '@mist/types'
  import { SearchResourceTags, truncate, useDebounce, useLogScope, wait } from '@mist/utils'
  import { onMount } from 'svelte'
  import { get, writable } from 'svelte/store'
  import { type MessagePortClient } from '@mist/services/messagePort'
  import { handleResourceClick, openResource } from '../handlers/journalOpenHandlers'
  import { Icon } from '@mist/icons'
  import { useJournalManager, type Journal } from '@mist/services/journals'
  import { type RouteResult } from '@mateothegreat/svelte5-router'
  import { useConfig, useTeletypeService } from '@mist/services'
  import JournalSidebar from '../components/journal/JournalSidebar.svelte'
  import JournalLayout from '../layouts/JournalLayout.svelte'
  import JournalEditor from '../components/journal/JournalEditor/JournalEditor.svelte'
  import JournalContents from '../components/journal/JournalContents.svelte'
  import { provideAI } from '@mist/services/ai'
  import { MentionItemType } from '@mist/editor'
  import { BUILT_IN_PAGE_PROMPTS } from '@mist/services/constants'
  import PromptPills from '../components/PromptPills.svelte'

  let {
    route,
    messagePort,
    resourcesPanelOpen = false
  }: {
    route: RouteResult
    messagePort: MessagePortClient
    resourcesPanelOpen?: boolean
  } = $props()

  const journalId = (route.result.path.params as any).journalId as string

  const log = useLogScope('JournalDetailRoute')
  const resourceManager = useResourceManager()
  const journalManager = useJournalManager()
  const config = useConfig()
  const ai = provideAI(resourceManager, config, false)
  const teletype = useTeletypeService()

  const contextManager = ai.contextManager
  const { generatedPrompts, generatingPrompts } = contextManager
  const ttyQuery = teletype.query
  const mentions = teletype.mentions

  let hasMentions = $derived($mentions.length > 0)
  let hasActiveTabMention = $derived($mentions.some((m) => m.type === MentionItemType.ACTIVE_TAB))
  let mentionsHash = $derived(JSON.stringify($mentions))

  let prevMentionsHash = $state('')
  let viewLocation = $state<ViewLocation | null>(null)

  const suggestedPrompts = $derived.by(() => {
    if ($generatingPrompts) {
      return [
        {
          label: hasActiveTabMention
            ? 'Analyzing Page'
            : hasMentions
              ? 'Analyzing Mentions'
              : 'Generating Prompts',
          prompt: '',
          loading: true
        }
      ]
    }

    if ($generatedPrompts.length === 0) return []

    return [
      ...BUILT_IN_PAGE_PROMPTS.filter((p) =>
        $generatedPrompts.every((gp) => gp.label !== p.label && gp.label !== 'Summary')
      ),
      ...$generatedPrompts
        .slice(0, 4)
        .sort((a, b) => (a.label?.length ?? 0) - (b.label?.length ?? 0))
    ]
  })

  let showAllNotes = $state(false)
  let isRenamingNote = $state(null)
  let journal: Journal = $state(null)
  let journalData = $derived(journal.data ?? writable(null))
  let isCustomizingJournal = $state(null)

  let title = $derived(journal?.nameValue ?? 'Journal')

  const handleCreateNote = async () => {
    const note = await resourceManager.createResourceNote(
      '',
      {
        name: 'Untitled Note'
      },
      undefined,
      true
    )
    await journalManager.addResourcesToJournal(
      journalId,
      [note.id],
      SpaceEntryOrigin.ManuallyAdded,
      true
    )

    openResource(note.id, { target: 'active_tab' })
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

  const handleRenameNote = useDebounce((noteId: string, value: string) => {
    resourceManager.updateResourceMetadata(noteId, { name: value })
  }, 75)

  const handleCancelRenameNote = useDebounce(() => {
    isRenamingNote = undefined
  }, 75)

  const filterNoteResources = (
    resources: JournalEntry[],
    searchResults: Option<ResourceSearchResult>
  ) => {
    if (searchResults) {
      return searchResults.resources.filter(
        (e) => e.resource.type === ResourceTypes.DOCUMENT_SPACE_NOTE
      )
    } else return resources.filter((e) => e.resource_type === ResourceTypes.DOCUMENT_SPACE_NOTE)
  }

  const handleRunPrompt = (e: CustomEvent<ChatPrompt>) => {
    const prompt = e.detail
    log.debug('Running prompt', prompt)
    teletype.ask({ query: prompt.prompt, queryLabel: prompt.label })
  }

  $effect(() => {
    if (hasMentions && mentionsHash !== prevMentionsHash && !$generatingPrompts) {
      prevMentionsHash = mentionsHash
      contextManager.getPrompts({ mentions: $mentions })
    }
  })

  onMount(async () => {
    if (journalId) {
      // NOTE: Ideally messagePort events optionally get queued up until connection established
      journal = await journalManager.getJournal(journalId)
    } else {
      journal = journalId
    }
  })

  onMount(() => {
    let unsubs = [
      messagePort.viewMounted.handle(({ location }) => {
        log.debug('Received view-mounted event', location)
        viewLocation = location

        if (hasMentions) {
          contextManager.getPrompts({ mentions: $mentions })
        } /*else {
          contextManager.getPrompts({ text: 'generate prompts that are useful for the user to kick off a new research session. make them insightful and relevant' })
        }*/
      }),

      messagePort.activeTabChanged.handle(() => {
        log.debug('Received active-tab-changed event', viewLocation, contextManager)
        if (hasMentions) {
          contextManager.getPrompts({ mentions: $mentions })
        }
      })
    ]

    return () => {
      unsubs.forEach((u) => u())
    }
  })
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

<!--<svelte:head>
  <title
    >{`${$journalData.emoji ? $journalData.emoji + ' ' : ''}${$journalData.folderName ?? $journalData.name}`}</title
  >
</svelte:head>-->

{#if isCustomizingJournal}
  <JournalEditor bind:journal={isCustomizingJournal} />
{/if}

<JournalLayout>
  <JournalLoader
    {journalId}
    search={{
      query: '',
      tags: [
        SearchResourceTags.Deleted(false),
        SearchResourceTags.ResourceType(ResourceTypes.HISTORY_ENTRY, 'ne'),
        SearchResourceTags.ResourceType(ResourceTypes.DOCUMENT_SPACE_NOTE, 'ne'),
        SearchResourceTags.NotExists('silent')
      ]
    }}
    fetchContents
  >
    {#snippet loading()}{/snippet}

    {#snippet children([journal, _])}
      <main>
        <div class="tty-wrapper">
          <div class="name">
            <JournalCover
              {journal}
              height="5ch"
              fontSize="0.3rem"
              --round-base="6px"
              --round-diff="-8px"
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
            <h1>
              <Renamable
                value={journal.nameValue}
                style="text-align: left;"
                onchange={(e) => {
                  journal.updateData({
                    name: (e.target as HTMLInputElement).value ?? journal.name
                  })
                }}
              />
            </h1>
          </div>
          <TeletypeEntry open={true} hideNavigation />
        </div>

        {#if ($generatingPrompts || suggestedPrompts.length > 0) && hasMentions}
          <div class="prompts-wrapper">
            <PromptPills
              promptItems={suggestedPrompts}
              direction={'vertical'}
              on:click={handleRunPrompt}
            />
          </div>
        {/if}

        {#if !hasMentions}
          <section class="contents-wrapper">
            <JournalContents {journalId} />
          </section>
        {/if}
      </main>
    {/snippet}
  </JournalLoader>

  <!-- <JournalSidebar {title} {journalId} bind:open={resourcesPanelOpen} /> -->
</JournalLayout>

<style lang="scss">
  main {
    width: 100%;
    height: 100%;
    max-width: 680px;
    margin: 0 auto;

    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  section {
    padding-inline: 12px;

    transform: translateY(0px);
    transition:
      opacity 223ms ease-out,
      transform 223ms ease-out;
    transition-delay: var(--delay, 0ms);
    @starting-style {
      transform: translateY(2px);
      opacity: 0;
    }

    > header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;

      > label {
        opacity: 0.5;
        color: light-dark(rgba(0, 0, 0, 0.7), rgba(255, 255, 255, 0.7));
        leading-trim: both;
        text-edge: cap;
        font-family: Inter;
        font-size: 0.75rem;
        font-style: normal;
        font-weight: 500;
        line-height: 0.9355rem;
      }
    }
  }

  section.notes {
    ul {
      position: relative;

      &:not(.showAllNotes) {
        mask-image: linear-gradient(to bottom, black 40%, transparent 83%);
      }
    }
    .more {
      opacity: 0.5;
      &:hover {
        opacity: 1;
      }
    }
  }

  .empty {
    width: 100%;
    border: 1px dashed light-dark(rgba(0, 0, 0, 0.2), rgba(71, 85, 105, 0.4));
    padding: 0.75rem 0.75rem;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: light-dark(rgba(0, 0, 0, 0.25), rgba(255, 255, 255, 0.3));
    text-align: center;
    text-wrap: pretty;
    p {
      max-width: 28ch;
    }

    :global(button) {
      margin-bottom: 0.5rem;
      color: var(--accent);
      background: light-dark(rgb(198 206 249 / 40%), rgba(100, 116, 180, 0.3));
    }
  }

  .tty-wrapper {
    width: 100%;

    .name {
      display: flex;
      align-items: center;
      gap: 2ch;
      padding-inline: 1.5rem;
    }

    h1 {
      font-size: 30px;
      font-family: 'Gambarino';
      text-align: center;
      color: light-dark(var(--on-surface, #374151), var(--on-surface-dark, #cbd5f5));
    }
  }

  //.cover.title {
  //  display: none;
  //}

  //@media screen and (width <= 1200px) {
  //  .cover.side {
  //    display: none;
  //  }
  //  .cover.title {
  //    display: block;
  //  }
  //}

  .contents-wrapper {
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
    padding-left: calc(50vw - 50%);
    padding-right: calc(50vw - 50%);
    margin-top: 1rem;
    opacity: 0.5;
    transition: opacity 223ms ease-out;

    &:hover {
      opacity: 1;
    }

    > :global(*) {
      max-width: 680px;
      margin: 0 auto;
      padding-inline: 1.5rem;
    }
  }

  .prompts-wrapper {
    padding-left: 1.25rem;
  }
</style>
