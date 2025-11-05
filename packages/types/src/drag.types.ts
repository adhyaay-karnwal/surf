export enum DragTypeNames {
  MIST_TAB = 'vnd/mist/tab',
  MIST_TAB_ID = 'application/vnd.space.dragcula.tabId',

  MIST_RESOURCE = 'vnd/mist/resource',
  MIST_RESOURCE_ID = 'application/vnd.space.dragcula.resourceId',
  ASYNC_MIST_RESOURCE = 'vnd/async/mist/resource',

  MIST_SPACE = 'vnd/mist/space',

  DESKTOP_ITEM = 'vnd/mist/desktop_item',

  MIST_HISTORY_ENTRY = 'vnd/mist/history_entry',
  MIST_HISTORY_ENTRY_ID = 'application/vnd.space.dragcula.historyEntryId'
}

export type DragTypes = Record<keyof typeof DragTypeNames, any>
