import { useLogScope } from '@mist/utils/io'
import { isMac, wait } from '@mist/utils'
import { ResourceTag, SearchResourceTags } from '@mist/utils/formatting'
import { ResourceTypes } from '@mist/types'

import { ResourceNote, useResourceManager } from './resources'
import { extractAndCreateWebResource } from './mediaImporter'
import { Journal, useJournalManager } from './journals'
import { useConfig } from './config'

import { onboardingJournal } from './constants/examples'
import * as OnboardingNoteWelcome from './constants/onboarding/00.welcome.md'
import * as OnboardingNoteManual from './constants/onboarding/01.manual.md'

const log = useLogScope('DemoItems')

export async function checkAndCreateDemoItems() {
  log.debug('Checking and creating demo items if needed')
  const onboardingJournal = await createDemoJournal()

  if (onboardingJournal) {
    await createDemoNotes(onboardingJournal)
  }
}

export async function createDemoJournal() {
  const journalManager = useJournalManager()
  const resourceManager = useResourceManager()
  const configService = useConfig()
  const config = configService.getConfig()

  if (config.settings?.onboarding?.seen_demo_journal) {
    log.debug('User has already seen demo journal, skipping creation')
    return
  }

  // Check if an onboarding space with the same name already exists
  const journals = await journalManager.loadJournals()
  const existingOnboardingJournal = journals.find((journal) => journal.data.onboarding === true)

  // If an onboarding space already exists, make it active and return it
  if (existingOnboardingJournal) {
    log.debug('Onboarding journal already exists, skipping creation')
    await configService.updateSettings({
      onboarding: {
        ...config.settings.onboarding,
        seen_demo_journal: true
      }
    })
    return existingOnboardingJournal
  }

  // Create a new onboarding journal if one doesn't exist
  log.debug('Creating new onboarding journal')
  const journal = await journalManager.createJournal({
    name: onboardingJournal.name,
    customization: onboardingJournal.customization,
    index: 0,
    pinned: true,
    onboarding: true
  })

  if (onboardingJournal.urls) {
    const urls = onboardingJournal.urls

    log.debug(`Adding ${urls.length} resources to onboarding journal`)
    const resources = await Promise.all(
      urls.map(async (url) => {
        const existingResources = await resourceManager.getResourcesFromSourceURL(url)
        if (existingResources.length > 0) {
          log.debug(`Resource already exists for URL: ${url}`)
          return existingResources[0].id
        }

        const { resource } = await extractAndCreateWebResource(
          resourceManager,
          url,
          {
            sourceURI: url
          },
          [ResourceTag.canonicalURL(url)]
        )
        return resource.id
      })
    )
    await journalManager.addResourcesToJournal(journal.id, resources)
    await configService.updateSettings({
      onboarding: {
        ...config.settings.onboarding,
        seen_demo_journal: true
      }
    })
  }

  return journal
}

export type DemoNote = {
  id: string
  title: string
  content: string
}

export function parseNoteContent(note: typeof OnboardingNoteWelcome, gettingStartedLink?: string) {
  return note.html
    .replaceAll('$MOD', isMac() ? '⌘' : 'Ctrl')
    .replaceAll('$OPT', isMac() ? '⌥' : 'Alt')
    .replaceAll('$GETTING_STARTED_LINK', gettingStartedLink || '')
}

export async function createDemoNote(note: DemoNote, journal: Journal) {
  const journalManager = useJournalManager()
  const resourceManager = useResourceManager()

  const existingOnboardingNotes = await resourceManager.listResourcesByTags([
    SearchResourceTags.Deleted(false),
    SearchResourceTags.ResourceType(ResourceTypes.DOCUMENT_SPACE_NOTE),
    SearchResourceTags.Onboarding(note.id)
  ])

  if (existingOnboardingNotes.length > 0) {
    const resource = existingOnboardingNotes[0] as ResourceNote
    log.debug('Onboarding note already exists, skipping creation', note, resource.id)

    await resource.updateContent(note.content)
    await resourceManager.updateResourceMetadata(resource.id, {
      name: note.title
    })

    await journalManager.addResourcesToJournal(journal.id, [resource.id])
    return resource
  }

  log.debug('Creating new onboarding note', note)
  const resource = await resourceManager.createResourceNote(
    note.content,
    {
      name: note.title
    },
    [ResourceTag.onboarding(note.id)]
  )

  await journalManager.addResourcesToJournal(journal.id, [resource.id])

  return resource
}

export async function createDemoNotes(journal: Journal) {
  const resourceManager = useResourceManager()

  const manualResource = await createDemoNote(
    {
      id: OnboardingNoteManual.attributes.id as string,
      title: OnboardingNoteManual.attributes.title as string,
      content: parseNoteContent(OnboardingNoteManual)
    },
    journal
  )

  const welcomeResource = await createDemoNote(
    {
      id: OnboardingNoteWelcome.attributes.id as string,
      title: OnboardingNoteWelcome.attributes.title as string,
      content: parseNoteContent(OnboardingNoteWelcome, `mist://mist/resource/${manualResource.id}`)
    },
    journal
  )

  await wait(300)

  await resourceManager.updateResource(welcomeResource.id, {
    updated_at: new Date().toISOString()
  })

  return [welcomeResource, manualResource]
}
