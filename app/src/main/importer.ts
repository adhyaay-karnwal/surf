import { dialog } from 'electron'

import { BrowserType } from '@mist/types'

import { ipcSenders } from './ipcHandlers'
import { useLogScope } from '@mist/utils'

const log = useLogScope('Importer')

export const importFiles = async () => {
  try {
    const result = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })
    log.debug('Import files:', result)
    if (result.canceled) return

    ipcSenders.importedFiles(result.filePaths)
  } catch (error) {
    log.error('Error importing files:', error)
  }
}

export const importBrowserHistory = async (type: BrowserType) => {
  try {
    ipcSenders.importBrowserHistory(type)
  } catch (error) {
    log.error('Error importing browser history:', error)
  }
}

export const importBrowserBookmarks = async (type: BrowserType) => {
  try {
    ipcSenders.importBrowserBookmarks(type)
  } catch (error) {
    log.error('Error importing browser bookmarks:', error)
  }
}
