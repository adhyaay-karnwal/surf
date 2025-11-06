<script lang="ts">
  import { onMount, type Snippet } from 'svelte'
  import { useJournalManager, type Journal, JournalManagerEvents } from '@mist/services/journals'
  import { ResourceTagsBuiltInKeys, type Option, type SFFSResourceTag, type SFFSSearchParameters } from '@mist/types'
  import { type ResourceSearchResult, useResourceManager } from '@mist/services/resources'
  import { SearchResourceTags, useCancelableDebounce, useLogScope, useThrottle } from '@mist/utils'

  interface Search {
    query: string
    tags?: SFFSResourceTag[],
    parameters?: Omit<SFFSSearchParameters, 'spaceId'>
  }

  let {
    journalId,
    fetchContents = false,
    search,
    children,
    loading,
    error,
  }: {
    journalId: string
    fetchContents?: boolean
    search?: Search
    children: Snippet<[Journal]>
    loading?: Snippet
    error?: Snippet<[unknown]>
  } = $props()

  const log = useLogScope('JournalLoader')
  const resourceManager = useResourceManager()
  const journalManager = useJournalManager()

  // TODO: Reuse or dispose
  //const getJournal = (id: string) => {
  //  return new Promise<[Journal, Option<ResourceSearchResult>]>((res, _) => {
  //    journalManager.getJournal(journalId)
  //      .then((journal: Journal) => {
  //        if (fetchContents) journal.fetchContents()
  //        res([journal, undefined])
  //      })
  //  })
  //}
  //const getJournalSearch = (search: Search) => {
  //  return new Promise<[Journal, Option<ResourceSearchResult>]>((res, _) => {
  //    Promise.all([
  //      getJournal(journalId),
  //      useResourceManager().searchResources(search.query, search.tags ?? [], {
  //        ...search.parameters,
  //        spaceId: journalId
  //      })
  //    ]).then(([journal, searchResults]) => res([journal, searchResults]))
  //  })
  //}
  //const journalLoader = $derived(search && search.query ? getJournalSearch(search) : getJournal(journalId))

  // NOTE: This makes them reactive, so that in the children snippets, it doesn't
  // re-render the entire snippet but only the items further down the chain if the
  // journal or the search results change!
  let journal: Journal | undefined = $state(undefined)
  let searchResults: Option<ResourceSearchResult> = $state()
  let searching: boolean = $state(false)
  let isLoading = $state(false)
  
  const { execute: runQuery, cancel: cancelQuery } = useCancelableDebounce(async (search: Search) => {
    try {
      searching = true

      log.debug('Running journal search', search)

      const results = await resourceManager.searchResources(search.query, [
        ...SearchResourceTags.NonHiddenDefaultTags({
          excludeAnnotations: true
        }),
        SearchResourceTags.NotExists(ResourceTagsBuiltInKeys.EMPTY_RESOURCE),
        ...(search.tags ?? [])
      ], {
        ...search.parameters,
        spaceId: journalId,
      })

      log.debug('Journal search results', results)

      searchResults = results.resources
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        // Map to NoteobokEntry format for compatability with the contents directly
        .map((entry, i) => ({
          id: i,
          entry_id: entry.resource.id,
          resource_type: entry.resource.type
        }))

      log.debug('Mapped journal search results', searchResults)
    } catch (error) {
      log.error('Error running journal search', error)
    } finally {
      searching = false
      isLoading = false
    }
  }, 250)

  $effect(() => {
    if (search && search.query) {
      runQuery(search)
    } else {
      cancelQuery()
      searchResults = undefined
      searching = false
    }
  })

  const load = useThrottle(async () => {
    try {
      isLoading = true
      log.debug('Loading journal', journalId)
      const _journal = await journalManager.getJournal(journalId)
      if (fetchContents) {
        _journal.fetchContents({
          sort_by: 'resource_updated',
          order: 'desc',
        })
      }

      log.debug('Loaded journal', _journal)

      journal = _journal
    } catch (error) {
      log.error('Error loading journal', error)
    } finally {
      isLoading = false
    }
  }, 250)

  const init = async () => {
    isLoading = true
    
    if (search && search.query) {
      await runQuery(search)
    }

    await load()
  }

  init()

  onMount(() => {
    const unsubs = [
      journalManager.on(JournalManagerEvents.DeletedResource, (resourceId: string) => {
        //journal.contents = journal.contents.filter((e) => e.entry_id !== resourceId)
                          journal?.fetchContents()
        if (searchResults) searchResults = searchResults.filter(e => e.entry_id !== resourceId)
      }),
      journalManager.on(JournalManagerEvents.RemovedResources, (_journalId: string, resourceIds: string[]) => {
                //journal.contents = journal.contents.filter((e) => !resourceIds.includes(e.id))
        if (journalId !== _journalId) return
                          journal?.fetchContents()
        if (searchResults) searchResults = searchResults.filter(e => !resourceIds.includes(e.entry_id))
      })
    ]
    return () => unsubs.forEach(f => f())
  })
</script>

<!--{#await journalLoader}
  {@render loading?.()}
{:then journal}
  {@render children?.([journal, searchResults])}
{:catch error}
  {@render error?.(error)}
{/await}
-->
{#if isLoading}
  {@render loading?.()}
{:else}
  {@render children?.([journal, searchResults, searching])}
{/if}

{#snippet failed(error, reset)}
        <b>crash!?</b>
        <p>{error}</p>
        <button onclick={reset}>reload</button>
{/snippet}
