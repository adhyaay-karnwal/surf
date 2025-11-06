export enum DragTypeNames {
  MIST_TAB = 'vnd/surf/tab',
  MIST_TAB_ID = 'application/vnd.space.dragcula.tabId',

  MIST_RESOURCE = 'vnd/surf/resource',
  MIST_RESOURCE_ID = 'application/vnd.space.dragcula.resourceId',
  ASYNC_MIST_RESOURCE = 'vnd/async/surf/resource',

  MIST_SPACE = 'vnd/surf/space',

  DESKTOP_ITEM = 'vnd/surf/desktop_item',

  MIST_HISTORY_ENTRY = 'vnd/surf/history_entry',
  MIST_HISTORY_ENTRY_ID = 'application/vnd.space.dragcula.historyEntryId'
}

export type DragTypes = Record<keyof typeof DragTypeNames, any>
