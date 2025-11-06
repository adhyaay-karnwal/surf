import { useMessagePortClient } from '@mist/services/messagePort'
import { isModKeyPressed } from '@mist/utils/io'
import type { OpenJournalOptions, OpenResourceOptions, OpenTarget } from '@mist/types'

export const openResource = (resourceId: string, opts?: Partial<OpenResourceOptions>) => {
  const messagePort = useMessagePortClient()

  try {
    const result = messagePort.openResource.send({
      resourceId: resourceId,
      target: 'tab',
      ...opts
    })
  } catch (error) {}
}

export const openJournal = (journalId: string, opts?: Partial<OpenJournalOptions>) => {
  const messagePort = useMessagePortClient()

  messagePort.openJournal.send({
    journalId: journalId,
    target: 'tab',
    ...opts
  })
}

export const determineClickOpenTarget = (e: MouseEvent): OpenTarget => {
  if (e.type === 'auxclick') {
    if (e.button === 1) {
      e.preventDefault()
      e.stopPropagation()

      return 'background_tab'
    }

    return 'auto'
  }

  const backgroundTab = isModKeyPressed(e) && !e.shiftKey
  const sidebarTab = e.shiftKey
  return backgroundTab
    ? 'background_tab'
    : isModKeyPressed(e)
      ? 'tab'
      : sidebarTab
        ? 'sidebar'
        : 'auto'
}

export const handleResourceClick = (resourceId: string, e: MouseEvent) => {
  const target = determineClickOpenTarget(e)
  openResource(resourceId, {
    target
  })
}

export const handleJournalClick = (journalId: string, e: MouseEvent) => {
  const target = determineClickOpenTarget(e)

  openJournal(journalId, {
    target
  })
}
