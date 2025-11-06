<script lang="ts">
  import { Icon } from '@mist/icons'
  import { useJournalManager, type Journal } from '@mist/services/journals'
  import { Button } from '@mist/ui'
  import { onMount } from 'svelte'
  import { MaskedScroll, openDialog, contextMenu, JournalCover } from '@mist/ui'
  import { conditionalArrayItem, truncate, useDebounce, useLogScope } from '@mist/utils'
  import TeletypeEntry from '../../Core/components/Teletype/TeletypeEntry.svelte'
  import { openJournal, openResource } from '../handlers/journalOpenHandlers'
  import { type ChatPrompt, type Fn, ViewLocation } from '@mist/types'
  import { useResourceManager } from '@mist/services/resources'
  import { provideAI } from '@mist/services/ai'
  import { useMessagePortClient } from '@mist/services/messagePort'
  import { BUILT_IN_PAGE_PROMPTS, type ExamplePrompt } from '@mist/services/constants'
  import { useConfig } from '@mist/services'
  import JournalLayout from '../layouts/JournalLayout.svelte'
  import JournalEditor from '../components/journal/JournalEditor/JournalEditor.svelte'
  import { useTeletypeService } from '../../../../../packages/services/src/lib'
  import JournalContents from '../components/journal/JournalContents.svelte'
  import PromptPills from '../components/PromptPills.svelte'
  import { MentionItemType } from '@mist/editor'
  import JournalSidecarExample from '../components/journal/JournalSidecarExample.svelte'

  let {
    onopensidebar,
    resourcesPanelOpen = false
  }: { onopensidebar: Fn; resourcesPanelOpen?: boolean } = $props()

  let isCreatingJournal = $state(false)
  let isRenamingJournal: string | undefined = $state(undefined)
  let newJournalName: string | undefined = $state(undefined)
  let isCustomizingJournal = $state(null)
  let viewLocation = $state<ViewLocation | null>(null)
  let isTtyInitializing = $state(true)

  const log = useLogScope('IndexRoute')
  const resourceManager = useResourceManager()
  const journalManager = useJournalManager()
  const config = useConfig()
  const ai = provideAI(resourceManager, config, false)
  const teletype = useTeletypeService()
  const messagePort = useMessagePortClient()

  const contextManager = ai.contextManager
  const { generatedPrompts, generatingPrompts } = contextManager
  const ttyQuery = teletype.query
  const mentions = teletype.mentions

  let hasMentions = $derived($mentions.length > 0)
  let hasActiveTabMention = $derived($mentions.some((m) => m.type === MentionItemType.ACTIVE_TAB))
  let mentionsHash = $derived(JSON.stringify($mentions))

  let prevMentionsHash = $state('')

  const suggestedPrompts = $derived.by(() => {
    if ($generatingPrompts) {
      return [
        {
          label: hasActiveTabMention
            ? 'Analyzing Page...'
            : hasMentions
              ? 'Analyzing Mentions...'
              : 'Generating Prompts...',
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

  const shouldMentionActiveTab = () => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('mention_active_tab') === 'true'
  }

  const handleCreateJournal = async () => {
    //if (newJournalName === undefined || newJournalName.length < 1) {
    //  isCreatingJournal = false
    //  newJournalName = undefined
    //  return
    //}

    const nb = await journalManager.createJournal(
      {
        name: 'Untitled Journal',
        pinned: true
      },
      true
    )

    isCreatingJournal = false
    newJournalName = undefined
    // Note: loadJournals() is already called by createJournal()

    onopensidebar?.()
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

  const handleCreateNote = async () => {
    const note = await resourceManager.createResourceNote(
      '',
      {
        name: 'Untitled Note'
      },
      undefined,
      true
    )
    openResource(note.id, { target: 'active_tab' })
  }

  const handlePinJournal = (journalId: string) => {
    journalManager.updateJournalData(journalId, { pinned: true })
  }
  const handleUnPinJournal = (journalId: string) => {
    journalManager.updateJournalData(journalId, { pinned: false })
  }

  const handleRunPrompt = (e: CustomEvent<ChatPrompt>) => {
    const prompt = e.detail
    log.debug('Running prompt', prompt)
    teletype.ask({ query: prompt.prompt, queryLabel: prompt.label })
  }

  const handleRunExample = (example: ExamplePrompt) => {
    log.debug('Running example', example)

    if (example.id === 'search') {
      teletype.ask({ query: example.prompt, queryLabel: example.label })
    } else if (example.id === 'youtube') {
      teletype.ask({ query: example.prompt, openTabUrl: example.url })
    } else if (example.id === 'pdf') {
      teletype.promptForAndInsertFileMentions()
    } else if (example.id === 'note') {
      teletype.createNote('')
    } else if (example.id === 'mention') {
      teletype.insertMention(undefined, '@')
    } else {
      log.warn('Unknown example prompt id', example.id)
    }
  }

  $effect(() => {
    if (hasMentions && mentionsHash !== prevMentionsHash && !$generatingPrompts) {
      prevMentionsHash = mentionsHash
      contextManager.getPrompts({ mentions: $mentions })
    }
  })

  onMount(() => {
    document.title = 'Mist'
    // journalManager.loadJournals()

    if (shouldMentionActiveTab()) {
      // NOTE: we still need a timeout here to let the tty component init
      // otherwise the editor focuses at the start of the mention for some reason :)
      setTimeout(() => {
        teletype.insertMention({
          id: 'active_tab',
          label: 'Active Tab',
          type: MentionItemType.ACTIVE_TAB,
          icon: 'sparkles'
        })
        isTtyInitializing = false
      }, 50)
    } else {
      isTtyInitializing = false
    }

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

  const pinnedJournals = $derived(journalManager.sortedJournals.filter((e) => e.data.pinned))
</script>

<svelte:head>
  <title>Mist</title>
</svelte:head>

{#if isCustomizingJournal}
  <JournalEditor bind:journal={isCustomizingJournal} />
{/if}

<JournalLayout>
  <main>
    {#if $generatingPrompts || (suggestedPrompts.length > 0 && (viewLocation === ViewLocation.Sidebar || hasMentions))}
      <div class="prompts-wrapper">
        <PromptPills
          direction="horizontal"
          promptItems={suggestedPrompts}
          on:click={handleRunPrompt}
          hide={$ttyQuery.slice(11).trim().length > 0}
        />
      </div>
    {/if}
    <div class="tty-wrapper">
      <!--<h1>
        {title}
      </h1>-->
      <TeletypeEntry open={true} />
    </div>

    {#if $ttyQuery.length <= 0}
      <section class="contents-wrapper">
        <JournalContents />
      </section>
    {/if}

    {#if viewLocation === ViewLocation.Tab && $ttyQuery.length <= 0}
      <JournalSidecarExample onselect={handleRunExample} />
    {/if}
  </main>

  <!-- <JournalSidebar title="Mist" bind:open={resourcesPanelOpen} /> -->
</JournalLayout>

<style lang="scss">
  main {
    width: 100%;
    height: 100%;
    max-width: 680px;
    margin: 0 auto;
    position: relative;

    display: flex;
    flex-direction: column;
    gap: 1rem;

    section {
      flex-shrink: 1;
      padding-inline: 0.5rem;

      transform: translateY(0px);
      transition:
        opacity 223ms ease-out,
        transform 223ms ease-out;
      transition-delay: var(--delay, 0ms);
      @starting-style {
        transform: translateY(2px);
        opacity: 0;
      }
    }
  }

  .tty-wrapper {
    width: 100%;

    h1 {
      font-size: 30px;
      margin-bottom: 0.75rem;
      font-family: 'Gambarino';
      text-align: center;
      color: light-dark(var(--on-surface, #374151), var(--on-surface-dark, #cbd5f5));
    }

    .empty {
      width: 100%;
      border: 1px dashed light-dark(rgba(0, 0, 0, 0.2), rgba(71, 85, 105, 0.4));
      padding: 0.5rem 0.75rem;
      border-radius: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: light-dark(rgba(0, 0, 0, 0.25), rgba(255, 255, 255, 0.3));

      p {
        max-width: 40ch;
        text-align: center;
        text-wrap: pretty;
      }
    }

    .journal-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;

      display: flex;
      flex-wrap: wrap;
      //justify-content: space-between;
      justify-items: center;
    }
    .journal-wrapper {
      opacity: 1;

      transform: translateY(0px);
      transition:
        opacity 223ms ease-out,
        transform 123ms ease-out,
        box-shadow 123ms ease-out;
      transition-delay: var(--delay, 0ms);
      @starting-style {
        transform: translateY(2px);
        opacity: 0;
      }
    }
  }

  .journal-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.75rem;

    display: flex;
    flex-wrap: wrap;
    //justify-content: space-between;
    justify-items: center;
  }

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
    margin-bottom: -1rem;
  }
</style>
