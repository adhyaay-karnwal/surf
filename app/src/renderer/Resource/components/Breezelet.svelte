<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import type { Resource } from '@breeze/services/resources'
  import BreezeletRenderer from './BreezeletRenderer.svelte'
  import { ResourceTag } from '@breeze/utils/formatting'
  import { AddResourceToSpaceEventTrigger, ResourceTagsBuiltInKeys } from '@breeze/types'
  import { SpaceEntryOrigin } from '@breeze/types'

  import { useResourceManager } from '@breeze/services/resources'
  import { useLogScope, parseUrlIntoCanonical } from '@breeze/utils'
  import { useAI } from '@breeze/services/ai'
  import { writable, type Writable } from 'svelte/store'

  import { startAIGeneration, endAIGeneration } from '@breeze/services/ai'

  // NOTE: created by tiptap but not needed
  export const node: any = undefined
  export const editor: any = undefined
  export const uuid: string = ''

  export let updateAttributes: (attrs: Record<string, any>) => void
  export let name: string = 'New Breezelet'
  export let prompt: string = ''
  export let resourceId: string = ''
  export let done: string = 'false'

  const log = useLogScope('Breezelet Component')
  const resourceManager = useResourceManager()
  const aiService = useAI()

  type ErrorType =
    | 'ai_generation'
    | 'resource_loading'
    | 'resource_saving'
    | 'initialization'
    | 'network'

  interface ErrorState {
    type: ErrorType
    message: string
    userMessage: string
    canRetry: boolean
  }

  const doneGenerating: Writable<boolean> = writable(done === 'true' ? true : false)
  const resource: Writable<Resource | undefined> = writable(undefined)
  const codeContent: Writable<string> = writable('')
  const title: Writable<string> = writable(name.replace('user-content-', ''))
  const error: Writable<ErrorState | null> = writable(null)

  let appId: string = ''
  let isUpdatingAttributes: boolean = false
  let isProcessingAI: boolean = false
  let streamUnsubscribe: (() => void) | null = null

  // TODO: should the endAIgeneration not also be scoped to the source?
  const setAIProcessingState = (processing: boolean) => {
    isProcessingAI = processing
    if (processing) {
      startAIGeneration('breezelet')
    } else {
      endAIGeneration()
    }
  }

  const setError = (
    type: ErrorType,
    message: string,
    userMessage: string,
    canRetry: boolean = true
  ) => {
    log.error(`${type}: ${message}`)
    error.set({ type, message, userMessage, canRetry })
    setAIProcessingState(false)
  }

  const clearError = () => {
    error.set(null)
  }

  const getUserFriendlyErrorMessage = (type: ErrorType): string => {
    switch (type) {
      case 'ai_generation':
        return 'Unable to generate your app right now. Please try again in a moment.'
      case 'resource_loading':
        return 'Could not load the requested content. It may have been moved or deleted.'
      case 'resource_saving':
        return 'Your app was created but could not be saved. Please try again.'
      case 'initialization':
        return 'Something went wrong while setting up. Please refresh and try again.'
      case 'network':
        return 'Connection issue detected. Please check your internet connection and try again.'
      default:
        return 'Something unexpected happened. Please try again.'
    }
  }

  const removeBreezeletSilentTag = async () => {
    if (!$resource) {
      log.warn('No resource to remove silent tag from')
      return
    }
    try {
      await resourceManager.deleteResourceTag($resource.id, ResourceTagsBuiltInKeys.SILENT)
    } catch (error) {
      log.error('Error removing silent tag from resource', error)
      // Non-critical error, don't show to user
    }
  }

  const addBreezeletToSpace = async (spaceId: string) => {
    if (!$resource) {
      log.warn('No resource to add to space')
      return
    }
    // try {
    //   await oasis.addResourcesToSpace(spaceId, [$resource.id], SpaceEntryOrigin.ManuallyAdded)
    // } catch (error) {
    //   log.error('Error adding resource to space', error)
    //   throw error
    // }
  }

  const addPreviewImageToResource = async (imageId: string) => {
    if (!$resource) {
      log.warn('No resource to add preview image to')
      return
    }
    try {
      await resourceManager.deleteResourceTag(
        $resource.id,
        ResourceTagsBuiltInKeys.PREVIEW_IMAGE_RESOURCE
      )
      await resourceManager.createResourceTag(
        $resource.id,
        ResourceTagsBuiltInKeys.PREVIEW_IMAGE_RESOURCE,
        imageId
      )
    } catch (error) {
      log.error('Error adding preview image to resource', error)
      // Non-critical error, don't show to user
    }
  }

  const updateBreezeletName = async (newName: string, updateNodeAttrs: boolean = false) => {
    if (!$resource) {
      log.warn('No resource to update name for')
      return
    }
    try {
      await resourceManager.updateResourceMetadata($resource.id, { name: $title })
      // tabsManager.updateResourceTabs($resource.id, { title: $title })
      title.set(newName)
      if (updateNodeAttrs) {
        updateAttributes({
          name: $title
        })
      }
    } catch (error) {
      log.error('Error updating breezelet name', error)
      // Non-critical error, continue operation
    }
  }

  const saveBreezelet = async () => {
    try {
      if (!$resource) {
        // const tab = tabsManager?.activeTabValue
        // const rawUrl = tab?.type === 'page' ? tab.currentLocation || tab.initialLocation : undefined
        // const url = (rawUrl ? parseUrlIntoCanonical(rawUrl) : undefined) || undefined

        const res = await resourceManager.createCodeResource(
          {
            code: $codeContent,
            name,
            language: 'html',
            url: ''
          },
          undefined,
          // TODO: get breezelet protocol version from somewhere else?
          [ResourceTag.silent(), ResourceTag.breezeletProtocolVersion('v2')]
        )
        if (!res) {
          throw new Error('Failed to create resource - no response from server')
        }
        resource.set(res)
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred while saving'
      throw new Error(`Resource creation failed: ${errorMessage}`)
    }
  }

  const handleUpdateBreezeletName = async (event: any) => {
    const newName = event.detail
    log.debug('Handle update breezelet name called', newName)
    if (newName && newName.trim()) {
      try {
        await updateBreezeletName(newName, true)
      } catch (error) {
        // Name update failure is not critical, log but don't show error to user
        log.error('Failed to update breezelet name', error)
      }
    } else {
      log.warn('Invalid breezelet name provided')
    }
  }

  const handleSaveBreezelet = async (event: CustomEvent<{ spaceId?: string }>) => {
    log.debug('Handle save breezelet called', event.detail)
    const { spaceId } = event.detail

    if (!$resource) {
      setError(
        'resource_saving',
        'No resource available to save',
        'Your app needs to be generated first before it can be saved.',
        false
      )
      return
    }

    try {
      if (spaceId) {
        await addBreezeletToSpace(spaceId)
      }
      await removeBreezeletSilentTag()
    } catch (error: any) {
      setError(
        'resource_saving',
        `Failed to save to space: ${error?.message}`,
        'Could not save your app to the workspace. Please try again.',
        true
      )
    }
  }

  const handleSetPreviewImage = async (event: any) => {
    const imageId = event.detail
    log.debug('Handle set preview image called', imageId)
    try {
      await addPreviewImageToResource(imageId)
    } catch (error) {
      log.error('Failed to set preview image', error)
    }
  }

  const chatResponseHandler = (response: string) => {
    try {
      let processedResponse = response

      if (processedResponse.startsWith('```')) {
        const firstNewline = processedResponse.indexOf('\n')
        if (firstNewline !== -1) {
          processedResponse = processedResponse.slice(firstNewline + 1)
        } else {
          processedResponse = processedResponse.slice(3)
        }
      }
      if (processedResponse.endsWith('```')) {
        processedResponse = processedResponse.slice(0, -3)
      }

      codeContent.set($codeContent + processedResponse)

      if ($codeContent.startsWith('html')) {
        codeContent.set($codeContent.slice(4))
      }

      const htmlEndIndex = $codeContent.indexOf('</html>')
      if (htmlEndIndex !== -1) {
        const endPosition = htmlEndIndex + '</html>'.length
        codeContent.set($codeContent.slice(0, endPosition))
      }
    } catch (error) {
      log.error('Error processing AI response chunk', error)
    }
  }

  const doneHandler = async () => {
    log.debug('Done handler called')
    try {
      doneGenerating.set(true)
      await saveBreezelet()

      if ($resource) {
        await updateBreezeletName($title, false)

        // prevent race condition
        if (!isUpdatingAttributes && updateAttributes) {
          isUpdatingAttributes = true
          try {
            updateAttributes({
              done: 'true',
              resourceId: $resource.id,
              name: $title
            })
          } catch (error) {
            log.error('Error updating attributes:', error)
          } finally {
            isUpdatingAttributes = false
          }
        }
        aiService.cleanupAppStream(appId)
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred'
      setError(
        'resource_saving',
        errorMessage,
        'Your app was generated but could not be saved properly. Please try again.',
        true
      )
    } finally {
      setAIProcessingState(false)
    }
  }

  const reconnectToStream = async () => {
    appId = await aiService.getAppId(prompt)

    log.debug('Reconnecting to existing stream:', appId)
    const status = aiService.getAppStreamStatus(appId)
    if (!status?.exists) {
      log.debug('No existing stream found for appId:', appId, 'creating new stream')
      await processPromptWithAI()
      return
    }
    // get any existing buffer content
    const buffer = aiService.getAppBuffer(appId)
    if (buffer) {
      log.debug('Found existing buffer content, length:', buffer.length)
      codeContent.set(buffer)
    }
    if (status.isComplete) {
      log.debug('Stream already complete')
      doneGenerating.set(true)
      setAIProcessingState(false)
      return
    }
    const stream = aiService.subscribeToAppStream(appId)
    if (!stream) {
      log.error('Failed to get stream for reconnection')
      return
    }

    setAIProcessingState(true)
    streamUnsubscribe = stream.subscribe(
      (chunk) => {
        // for existing streams, we already have the buffer, so only process new chunks
        if (!buffer || chunk !== buffer) {
          chatResponseHandler(chunk)
        }
      },
      () => {
        doneHandler()
      }
    )
  }

  const createNewStream = async (): Promise<string | null> => {
    log.debug('Creating new stream for prompt:', prompt)
    clearError()
    setAIProcessingState(true)
    try {
      const result = await aiService.createApp(prompt)
      if (!result) {
        throw new Error('Failed to create app stream')
      }
      log.debug('Created new stream with ID:', result.appId)
      const stream = aiService.subscribeToAppStream(result.appId)
      if (!stream) {
        throw new Error('Failed to subscribe to stream')
      }
      streamUnsubscribe = stream.subscribe(chatResponseHandler, doneHandler)
      return result.appId
    } catch (error: any) {
      const errorMessage = error?.message || 'AI service unavailable'
      setError('ai_generation', errorMessage, getUserFriendlyErrorMessage('ai_generation'), true)
      doneGenerating.set(true)
      return null
    }
  }

  const processPromptWithAI = async () => {
    if (isProcessingAI) {
      log.debug('AI processing already in progress, skipping')
      return
    }

    if (streamUnsubscribe) {
      log.debug('Already have active stream subscription, skipping')
      return
    }

    try {
      appId = (await createNewStream()) || ''
      if (!appId) {
        throw new Error('Failed to establish stream')
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'AI service unavailable'
      setError('ai_generation', errorMessage, getUserFriendlyErrorMessage('ai_generation'), true)
      doneGenerating.set(true)
    }
  }

  const getResourceCode = async () => {
    try {
      if (!$resource) return null
      const blob = await $resource.getData()
      if (!blob) return null

      const text = await blob.text()
      return text || null
    } catch (error: any) {
      log.error('Error getting resource code', error)
      throw new Error(`Failed to load content: ${error?.message || 'Unknown error'}`)
    }
  }

  const getResourceAndCode = async (id: string) => {
    if (($resource && $resource.id === id) || !id) {
      return
    }

    clearError()

    try {
      const res = await resourceManager.getResource(id)
      if (!res) {
        throw new Error(`Resource with ID ${id} not found`)
      }

      resource.set(res)
      const code = await getResourceCode()
      codeContent.set(code || '')
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to load resource'
      setError(
        'resource_loading',
        errorMessage,
        getUserFriendlyErrorMessage('resource_loading'),
        true
      )
    }
  }

  const retryOperation = async () => {
    if (!$error) return

    clearError()

    switch ($error.type) {
      case 'ai_generation':
        await processPromptWithAI()
        break
      case 'resource_loading':
        if (resourceId) {
          await getResourceAndCode(resourceId)
        }
        break
      case 'initialization':
        location.reload()
        break
      default:
        if (resourceId) {
          await getResourceAndCode(resourceId)
        } else if (prompt) {
          await processPromptWithAI()
        }
    }
  }

  onMount(async () => {
    try {
      clearError()

      log.debug('mounted with props:', $$props)
      if (resourceId) {
        await getResourceAndCode(resourceId)
      }
      if (prompt && !$doneGenerating) {
        await reconnectToStream()
      } else {
        log.warn('No prompt provided, cannot initialize AI stream')
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Initialization failed'
      setError('initialization', errorMessage, getUserFriendlyErrorMessage('initialization'), true)
    }
  })

  onDestroy(() => {
    if (streamUnsubscribe) {
      streamUnsubscribe()
    }
  })
</script>

{#if $error}
  <div class="breezelet-error-container">
    <div class="breezelet-error-content">
      <div class="breezelet-error-icon">⚠️</div>
      <h3 class="breezelet-error-title">Oops! Something went wrong</h3>
      <p class="breezelet-error-message">{$error.userMessage}</p>
      {#if $error.canRetry}
        <button class="breezelet-retry-button" on:click={retryOperation}> Try Again </button>
      {/if}
    </div>
  </div>
{:else}
  <BreezeletRenderer
    {resource}
    {title}
    {codeContent}
    {doneGenerating}
    initialCollapsed={false}
    collapsable
    resizable={true}
    minHeight="150px"
    maxHeight="800px"
    initialHeight="550px"
    on:save-breezelet={handleSaveBreezelet}
    on:set-preview-image={handleSetPreviewImage}
    on:set-breezelet-name={handleUpdateBreezeletName}
  />
{/if}

<style>
  .breezelet-error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    padding: 2rem;
    background: #fafafa;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
  }

  .breezelet-error-content {
    text-align: center;
    max-width: 400px;
  }

  .breezelet-error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .breezelet-error-title {
    color: #333;
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .breezelet-error-message {
    color: #666;
    margin: 0 0 1.5rem 0;
    line-height: 1.5;
  }

  .breezelet-retry-button {
    background: #007acc;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .breezelet-retry-button:hover {
    background: #005999;
  }

  .breezelet-loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    padding: 2rem;
    background: #fafafa;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
  }

  .breezelet-loading-content {
    text-align: center;
    max-width: 400px;
  }

  .breezelet-loading-spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto 1.5rem;
    border: 3px solid #e5e5e5;
    border-top: 3px solid #007acc;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .breezelet-loading-title {
    color: #333;
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
</style>
