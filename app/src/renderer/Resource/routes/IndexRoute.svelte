<script lang="ts">
  import { Icon } from '@breeze/icons'
  import { useNotebookManager, type Notebook } from '@breeze/services/notebooks'
  import { Button } from '@breeze/ui'
  import { onMount } from 'svelte'
  import { MaskedScroll, openDialog, contextMenu, NotebookCover } from '@breeze/ui'
  import { conditionalArrayItem, truncate, useDebounce, useLogScope } from '@breeze/utils'
  import TeletypeEntry from '../../Core/components/Teletype/TeletypeEntry.svelte'
  import { openNotebook, openResource } from '../handlers/notebookOpenHandlers'
  import { type ChatPrompt, type Fn, ViewLocation } from '@breeze/types'
  import { useResourceManager } from '@breeze/services/resources'
  import { provideAI } from '@breeze/services/ai'
  import { useMessagePortClient } from '@breeze/services/messagePort'
  import { BUILT_IN_PAGE_PROMPTS, type ExamplePrompt } from '@breeze/services/constants'
  import { useConfig } from '@breeze/services'
  import NotebookLayout from '../layouts/NotebookLayout.svelte'
  import NotebookEditor from '../components/notebook/NotebookEditor/NotebookEditor.svelte'
  import { useTeletypeService, promptForFilesAndTurnIntoResources } from '@breeze/services'
  import PromptPills from '../components/PromptPills.svelte'
  import { MentionItemType } from '@breeze/editor'
  import NotebookSidecarExample from '../components/notebook/NotebookSidecarExample.svelte'
  import {
    BREEZE_SITE_URL,
    BREEZE_SUPPORT_EMAIL,
    BREEZE_DISCORD_URL
  } from '@breeze/services/constants'

  let { onopensidebar }: { onopensidebar: Fn } = $props()

  let isCreatingNotebook = $state(false)
  let isRenamingNotebook: string | undefined = $state(undefined)
  let newNotebookName: string | undefined = $state(undefined)
  let isCustomizingNotebook = $state(null)
  let viewLocation = $state<ViewLocation | null>(null)
  let isTtyInitializing = $state(true)

  const log = useLogScope('IndexRoute')
  const resourceManager = useResourceManager()
  const notebookManager = useNotebookManager()
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

  const handleCreateNotebook = async () => {
    //if (newNotebookName === undefined || newNotebookName.length < 1) {
    //  isCreatingNotebook = false
    //  newNotebookName = undefined
    //  return
    //}

    isCreatingNotebook = true

    const nb = await notebookManager.createNotebook(
      {
        name: 'Untitled Notebook',
        pinned: true
      },
      true
    )

    isCreatingNotebook = false
    newNotebookName = undefined
    // Note: loadNotebooks() is already called by createNotebook()

    onopensidebar?.()
  }

  const handleDeleteNotebook = async (notebook: Notebook) => {
    const { closeType: confirmed } = await openDialog({
      title: `Delete <i>${truncate(notebook.nameValue, 26)}</i>`,
      message: `This can't be undone. <br>Your resources won't be deleted.`,
      actions: [
        { title: 'Cancel', type: 'reset' },
        { title: 'Delete', type: 'submit', kind: 'danger' }
      ]
    })
    if (!confirmed) return
    notebookManager.deleteNotebook(notebook.id, true)
  }

  const handleRenameNotebook = useDebounce((notebookId: string, value: string) => {
    notebookManager.updateNotebookData(notebookId, { name: value })
  }, 175)

  const handleCancelRenameNotebook = () => {
    isRenamingNotebook = undefined
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

  const handlePinNotebook = (notebookId: string) => {
    notebookManager.updateNotebookData(notebookId, { pinned: true })
  }
  const handleUnPinNotebook = (notebookId: string) => {
    notebookManager.updateNotebookData(notebookId, { pinned: false })
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
    document.title = 'Breeze'
    // notebookManager.loadNotebooks()

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

  const pinnedNotebooks = $derived(notebookManager.sortedNotebooks.filter((e) => e.data.pinned))
  const recentNotebooks = $derived(
    notebookManager.sortedNotebooks.filter((notebook) => !notebook.data.pinned).slice(0, 6)
  )

  const trimmedSiteUrl = BREEZE_SITE_URL.replace(/\/$/, '')
  const trimmedDiscordUrl = BREEZE_DISCORD_URL.replace(/\/$/, '')

  const handleImportLocalResources = async () => {
    await promptForFilesAndTurnIntoResources(resourceManager)
  }

  const openDraftsNotebook = () => {
    openNotebook('drafts')
  }

  const studyReminders = [
    'Capture lecture notes with the “@mention tab” command after each class.',
    'Use favorites to keep active courses at the top of your shelf.',
    'Drop PDFs or slides into Breeze so the AI can cite them in your summaries.'
  ]
</script>

<svelte:head>
  <title>Breeze</title>
</svelte:head>

{#if isCustomizingNotebook}
  <NotebookEditor bind:notebook={isCustomizingNotebook} />
{/if}

<NotebookLayout>
  <main class="study-space">
    <section class="board">
      <header class="board-header">
        <div class="board-copy">
          <h1 class="typo-title-lg">Plan your next study session</h1>
          <p>
            Breeze keeps your research, notes, and citations in one place so you can stay focused on
            coursework and projects.
          </p>
        </div>
        <div class="quick-actions">
          <Button size="sm" class="quick-action" onclick={handleCreateNote}>
            <Icon name="sparkles" size="1rem" />
            <span>Start blank note</span>
          </Button>
          <Button
            size="sm"
            class="quick-action"
            onclick={handleCreateNotebook}
            disabled={isCreatingNotebook}
          >
            <Icon name="add" size="1rem" />
            <span>New notebook</span>
          </Button>
          <Button
            size="sm"
            class="quick-action"
            variant="ghost"
            onclick={handleImportLocalResources}
          >
            <Icon name="folder.open" size="1rem" />
            <span>Import files</span>
          </Button>
        </div>
      </header>

      {#if $generatingPrompts || (suggestedPrompts.length > 0 && (viewLocation === ViewLocation.Sidebar || hasMentions))}
        <div class="prompt-strip">
          <PromptPills
            direction="horizontal"
            promptItems={suggestedPrompts}
            on:click={handleRunPrompt}
            hide={$ttyQuery.slice(11).trim().length > 0}
          />
        </div>
      {/if}

      <div class="study-workspace">
        <div class="workspace-header">
          <h2>Focus canvas</h2>
          <p>Ask Breeze for summaries, outlines, flashcards, and more.</p>
        </div>
        <TeletypeEntry open={true} />
      </div>

      <div class="highlights">
        <div class="highlight-card">
          <header>
            <h3>Recent notebooks</h3>
            <Button size="xs" variant="ghost" onclick={() => onopensidebar?.()}>
              <Icon name="list-details" size="0.85rem" />
              <span>Browse all</span>
            </Button>
          </header>
          {#if recentNotebooks.length > 0}
            <ul class="notebook-chip-list">
              {#each recentNotebooks as notebook (notebook.id)}
                <li
                  class="notebook-chip"
                  on:click={(e) => handleNotebookClick(notebook.id, e)}
                  {@attach contextMenu({
                    canOpen: true,
                    items: [
                      notebook.data.pinned
                        ? {
                            type: 'action',
                            text: 'Remove from Favorites',
                            icon: 'heart.off',
                            action: () => handleUnPinNotebook(notebook.id)
                          }
                        : {
                            type: 'action',
                            text: 'Add to Favorites',
                            icon: 'heart',
                            action: () => handlePinNotebook(notebook.id)
                          },
                      {
                        type: 'action',
                        text: 'Customize',
                        icon: 'edit',
                        action: () => (isCustomizingNotebook = notebook)
                      },
                      {
                        type: 'action',
                        kind: 'danger',
                        text: 'Delete',
                        icon: 'trash',
                        action: () => handleDeleteNotebook(notebook)
                      }
                    ]
                  })}
                >
                  <Icon
                    name={notebook.data.pinned ? 'bookmarkFilled' : 'notebook'}
                    size="0.95rem"
                  />
                  <span>{notebook.nameValue}</span>
                </li>
              {/each}
            </ul>
          {:else}
            <p class="empty-copy">
              Start exploring resources and Breeze will highlight recent notebooks here.
            </p>
          {/if}
        </div>

        {#if viewLocation === ViewLocation.Tab && $ttyQuery.length <= 0}
          <div class="highlight-card inspiration-card">
            <header>
              <h3>Need inspiration?</h3>
            </header>
            <NotebookSidecarExample onselect={handleRunExample} />
          </div>
        {/if}
      </div>
    </section>

    <aside class="study-shelf">
      <div class="shelf-card">
        <header class="shelf-header">
          <h2>Favorites shelf</h2>
          <Button
            size="xs"
            variant="ghost"
            onclick={handleCreateNotebook}
            disabled={isCreatingNotebook}
          >
            <Icon name="add" size="0.85rem" />
            <span>New</span>
          </Button>
        </header>

        {#if pinnedNotebooks.length > 0}
          <div class="shelf-scroll" use:MaskedScroll>
            {#each pinnedNotebooks as notebook (notebook.id)}
              <div class="shelf-notebook">
                <NotebookCover
                  {notebook}
                  height="14.5ch"
                  fontSize="0.85rem"
                  onclick={(e) => handleNotebookClick(notebook.id, e)}
                  onpin={() => handlePinNotebook(notebook.id)}
                  onunpin={() => handleUnPinNotebook(notebook.id)}
                  {@attach contextMenu({
                    canOpen: true,
                    items: [
                      {
                        type: 'action',
                        text: 'Customize',
                        icon: 'edit',
                        action: () => (isCustomizingNotebook = notebook)
                      },
                      {
                        type: 'action',
                        kind: 'danger',
                        text: 'Remove from Favorites',
                        icon: 'heart.off',
                        action: () => handleUnPinNotebook(notebook.id)
                      },
                      {
                        type: 'action',
                        kind: 'danger',
                        text: 'Delete',
                        icon: 'trash',
                        action: () => handleDeleteNotebook(notebook)
                      }
                    ]
                  })}
                />
              </div>
            {/each}
          </div>
        {:else}
          <p class="empty-copy">Pin the notebooks you need this week to keep them handy.</p>
        {/if}
      </div>

      <div class="shelf-card support-card">
        <header class="shelf-header">
          <h2>Quick links</h2>
        </header>
        <div class="support-links">
          <a href={`mailto:${BREEZE_SUPPORT_EMAIL}`}>Email support</a>
          <a href={trimmedDiscordUrl} target="_blank" rel="noreferrer">Join the Discord</a>
          <a href={trimmedSiteUrl} target="_blank" rel="noreferrer">Visit the site</a>
        </div>
        <Button size="sm" variant="ghost" class="shelf-action" onclick={openDraftsNotebook}>
          <Icon name="note" size="1rem" />
          <span>Review drafts</span>
        </Button>
      </div>

      <div class="shelf-card reminders-card">
        <header class="shelf-header">
          <h2>Study reminders</h2>
        </header>
        <ul class="reminders-list">
          {#each studyReminders as reminder}
            <li>{reminder}</li>
          {/each}
        </ul>
      </div>
    </aside>
  </main>
</NotebookLayout>

<style lang="scss">
  .study-space {
    width: 100%;
    height: 100%;
    max-width: 1180px;
    margin: 0 auto;
    padding: 1.5rem 1rem 2.5rem;
    display: grid;
    gap: 1.75rem;

    @media (min-width: 980px) {
      grid-template-columns: minmax(0, 1fr) 22rem;
    }
  }

  .board {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background: light-dark(var(--surface-elevated, #ffffff), var(--surface-elevated-dark, #152235));
    border-radius: 18px;
    padding: 1.5rem;
    box-shadow: 0 18px 40px rgba(15, 45, 77, 0.08);
    border: 1px solid light-dark(rgba(59, 105, 147, 0.08), rgba(59, 147, 214, 0.15));
  }

  .board-header {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;

    @media (min-width: 720px) {
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
    }

    .board-copy {
      max-width: 38ch;

      h1 {
        margin-bottom: 0.35rem;
        color: light-dark(var(--text-primary, #1e293b), var(--text-primary-dark, #e2f1ff));
      }

      p {
        color: light-dark(var(--text-secondary, #4b5b78), var(--text-secondary-dark, #afc6e4));
        font-size: 0.95rem;
        line-height: 1.5;
      }
    }
  }

  .quick-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;

    .quick-action {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      border-radius: 999px;
      padding-inline: 0.9rem;
      white-space: nowrap;
    }
  }

  .prompt-strip {
    background: light-dark(
      var(--accent-background, #d5effb),
      var(--accent-background-dark, #0f2a3d)
    );
    border-radius: 14px;
    padding: 0.75rem 1rem;
    overflow: hidden;

    :global(.prompt-pill-list) {
      gap: 0.5rem;
    }
  }

  .study-workspace {
    border-radius: 18px;
    padding: 1.25rem;
    background: linear-gradient(145deg, rgba(59, 169, 219, 0.16), transparent);
    border: 1px solid light-dark(rgba(59, 105, 147, 0.1), rgba(59, 147, 214, 0.25));
    display: flex;
    flex-direction: column;
    gap: 0.85rem;

    .workspace-header {
      h2 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: light-dark(var(--text-primary, #1e293b), var(--text-primary-dark, #e2f1ff));
      }

      p {
        margin: 0;
        font-size: 0.95rem;
        color: light-dark(var(--text-secondary, #4b5b78), var(--text-secondary-dark, #afc6e4));
      }
    }

    :global(.tty-container) {
      background: light-dark(
        var(--surface-elevated, #ffffff),
        var(--surface-elevated-dark, #152235)
      );
      border-radius: 12px;
      border: 1px solid light-dark(rgba(59, 105, 147, 0.08), rgba(59, 147, 214, 0.2));
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
    }
  }

  .highlights {
    display: grid;
    gap: 1.25rem;

    @media (min-width: 720px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .highlight-card {
      background: light-dark(
        var(--surface-elevated, #ffffff),
        var(--surface-elevated-dark, #152235)
      );
      border-radius: 16px;
      border: 1px solid light-dark(rgba(59, 105, 147, 0.08), rgba(59, 147, 214, 0.2));
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.9rem;

      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;

        h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: light-dark(var(--text-primary, #1e293b), var(--text-primary-dark, #e2f1ff));
        }

        :global(button) {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
      }
    }
  }

  .notebook-chip-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  .notebook-chip {
    list-style: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.55rem 0.8rem;
    border-radius: 12px;
    background: light-dark(rgba(59, 169, 219, 0.12), rgba(59, 169, 219, 0.25));
    color: light-dark(var(--text-primary, #1e293b), var(--text-primary-dark, #e2f1ff));
    border: 1px solid light-dark(rgba(59, 105, 147, 0.08), rgba(59, 147, 214, 0.2));
    cursor: pointer;
    transition:
      transform 120ms ease,
      box-shadow 120ms ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 20px rgba(15, 45, 77, 0.12);
    }

    span {
      font-size: 0.9rem;
      font-weight: 500;
    }
  }

  .study-shelf {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .shelf-card {
    background: light-dark(var(--surface-elevated, #ffffff), var(--surface-elevated-dark, #152235));
    border-radius: 16px;
    border: 1px solid light-dark(rgba(59, 105, 147, 0.08), rgba(59, 147, 214, 0.2));
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .shelf-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;

    h2 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: light-dark(var(--text-primary, #1e293b), var(--text-primary-dark, #e2f1ff));
    }

    :global(button) {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }
  }

  .shelf-scroll {
    max-height: 24rem;
    padding-right: 0.25rem;
    display: grid;
    gap: 0.75rem;
  }

  .shelf-notebook {
    width: 100%;

    :global(.notebook-cover) {
      width: 100%;
      transition:
        transform 120ms ease,
        box-shadow 120ms ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 16px 28px rgba(15, 45, 77, 0.16);
      }
    }
  }

  .support-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    a {
      color: light-dark(var(--text-secondary, #4b5b78), var(--text-secondary-dark, #afc6e4));
      text-decoration: none;
      font-size: 0.95rem;

      &:hover {
        color: light-dark(var(--text-primary, #1e293b), var(--text-primary-dark, #e2f1ff));
      }
    }
  }

  .shelf-action {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    align-self: flex-start;
  }

  .reminders-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 0.5rem;

    li {
      font-size: 0.92rem;
      color: light-dark(var(--text-secondary, #4b5b78), var(--text-secondary-dark, #afc6e4));
      position: relative;
      padding-left: 1.1rem;

      &::before {
        content: '';
        position: absolute;
        width: 0.45rem;
        height: 0.45rem;
        border-radius: 50%;
        background: light-dark(var(--accent, #3ba9db), var(--accent-dark, #5ec4f2));
        left: 0;
        top: 0.45rem;
      }
    }
  }

  .empty-copy {
    font-size: 0.9rem;
    color: light-dark(var(--text-subtle, #60708c), var(--text-subtle-dark, #92aaca));
    line-height: 1.4;
  }
</style>
