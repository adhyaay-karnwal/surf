import {} from './eventBus.types'
export var ResourceTagsBuiltInKeys
;(function (ResourceTagsBuiltInKeys) {
  ResourceTagsBuiltInKeys['SAVED_WITH_ACTION'] = 'savedWithAction'
  ResourceTagsBuiltInKeys['TYPE'] = 'type'
  ResourceTagsBuiltInKeys['DELETED'] = 'deleted'
  ResourceTagsBuiltInKeys['HOSTNAME'] = 'hostname'
  ResourceTagsBuiltInKeys['CANONICAL_URL'] = 'canonicalUrl'
  ResourceTagsBuiltInKeys['ANNOTATES'] = 'annotates'
  ResourceTagsBuiltInKeys['HASHTAG'] = 'hashtag'
  ResourceTagsBuiltInKeys['SPACE_SOURCE'] = 'spaceSource'
  ResourceTagsBuiltInKeys['VIEWED_BY_USER'] = 'viewedByUser'
  ResourceTagsBuiltInKeys['SILENT'] = 'silent'
  ResourceTagsBuiltInKeys['HIDE_IN_EVERYTHING'] = 'hideInEverything'
  ResourceTagsBuiltInKeys['SOURCE_PUBLISHED_AT'] = 'sourcePublishedAt'
  ResourceTagsBuiltInKeys['CREATED_FOR_CHAT'] = 'createdForChat'
  ResourceTagsBuiltInKeys['CONTENT_HASH'] = 'contentHash'
  ResourceTagsBuiltInKeys['PREVIEW_IMAGE_RESOURCE'] = 'previewImageResource'
  ResourceTagsBuiltInKeys['USER_VIEW_PREFS'] = 'userViewPreferences'
  ResourceTagsBuiltInKeys['LINKED_CHAT'] = 'linkedChat'
  ResourceTagsBuiltInKeys['DATA_STATE'] = 'dataState'
  ResourceTagsBuiltInKeys['BREEZELET_PROTOCOL_VERSION'] = 'breezeletProtocolVersion'
  ResourceTagsBuiltInKeys['PRELOADED_RESOURCE'] = 'preloadedResource'
  ResourceTagsBuiltInKeys['EMPTY_RESOURCE'] = 'emptyResource'
  ResourceTagsBuiltInKeys['ONBOARDING'] = 'onboarding'
  ResourceTagsBuiltInKeys['CAPTION'] = 'caption' // caption for image resources
})(ResourceTagsBuiltInKeys || (ResourceTagsBuiltInKeys = {}))
export var ResourceTagDataStateValue
;(function (ResourceTagDataStateValue) {
  ResourceTagDataStateValue['PARTIAL'] = 'partial'
  ResourceTagDataStateValue['COMPLETE'] = 'complete'
  ResourceTagDataStateValue['ERROR'] = 'error'
})(ResourceTagDataStateValue || (ResourceTagDataStateValue = {}))
export var ResourceTypes
;(function (ResourceTypes) {
  ResourceTypes['PDF'] = 'application/pdf'
  ResourceTypes['HTML'] = 'text/html'
  ResourceTypes['JAVASCRIPT'] = 'text/javascript'
  ResourceTypes['IMAGE'] = 'image'
  ResourceTypes['SPACE'] = 'application/vnd.space'
  ResourceTypes['POST'] = 'application/vnd.space.post'
  ResourceTypes['POST_REDDIT'] = 'application/vnd.space.post.reddit'
  ResourceTypes['POST_TWITTER'] = 'application/vnd.space.post.twitter'
  ResourceTypes['POST_YOUTUBE'] = 'application/vnd.space.post.youtube'
  ResourceTypes['CHAT_MESSAGE'] = 'application/vnd.space.chat-message'
  ResourceTypes['CHAT_MESSAGE_DISCORD'] = 'application/vnd.space.chat-message.discord'
  ResourceTypes['CHAT_MESSAGE_SLACK'] = 'application/vnd.space.chat-message.slack'
  ResourceTypes['CHAT_THREAD'] = 'application/vnd.space.chat-thread'
  ResourceTypes['CHAT_THREAD_SLACK'] = 'application/vnd.space.chat-thread.slack'
  ResourceTypes['DOCUMENT'] = 'application/vnd.space.document'
  ResourceTypes['DOCUMENT_SPACE_NOTE'] = 'application/vnd.space.document.space-note'
  ResourceTypes['DOCUMENT_NOTION'] = 'application/vnd.space.document.notion'
  ResourceTypes['DOCUMENT_GOOGLE_DOC'] = 'application/vnd.space.document.google-doc'
  ResourceTypes['TABLE'] = 'application/vnd.space.table'
  ResourceTypes['TABLE_GOOGLE_SHEET'] = 'application/vnd.space.table.google-sheet'
  ResourceTypes['TABLE_TYPEFORM'] = 'application/vnd.space.table.typeform'
  ResourceTypes['TABLE_COLUMN'] = 'application/vnd.space.table-column'
  ResourceTypes['TABLE_COLUMN_GOOGLE_SHEET'] = 'application/vnd.space.table-column.google-sheet'
  ResourceTypes['TABLE_COLUMN_TYPEFORM'] = 'application/vnd.space.table-column.typeform'
  ResourceTypes['ARTICLE'] = 'application/vnd.space.article'
  ResourceTypes['LINK'] = 'application/vnd.space.link'
  ResourceTypes['DRAWING'] = 'application/vnd.space.drawing'
  ResourceTypes['DRAWING_TLDRAW'] = 'application/vnd.space.drawing.tldraw'
  ResourceTypes['LOCATION'] = 'application/vnd.space.location'
  ResourceTypes['COLOR'] = 'application/vnd.space.color'
  ResourceTypes['FLOWCHAT_FUN'] = 'application/vnd.space.custom.flowchart-fun'
  ResourceTypes['ANNOTATION'] = 'application/vnd.space.annotation'
  ResourceTypes['HISTORY_ENTRY'] = 'application/vnd.space.history-entry'
  ResourceTypes['CHANNEL_YOUTUBE'] = 'application/vnd.space.channel.youtube'
  ResourceTypes['PLAYLIST_YOUTUBE'] = 'application/vnd.space.playlist.youtube'
})(ResourceTypes || (ResourceTypes = {}))
export const WEB_RESOURCE_TYPES = [
  ResourceTypes.LINK,
  ResourceTypes.ARTICLE,
  ResourceTypes.POST,
  ResourceTypes.CHAT_MESSAGE,
  ResourceTypes.CHAT_THREAD,
  ResourceTypes.LOCATION,
  ResourceTypes.COLOR,
  ResourceTypes.DRAWING,
  ResourceTypes.DOCUMENT_NOTION,
  ResourceTypes.DOCUMENT_GOOGLE_DOC,
  ResourceTypes.TABLE,
  ResourceTypes.TABLE_COLUMN,
  ResourceTypes.FLOWCHAT_FUN,
  ResourceTypes.CHANNEL_YOUTUBE,
  ResourceTypes.PLAYLIST_YOUTUBE
]
export const isWebResourceType = (type) => {
  return WEB_RESOURCE_TYPES.findIndex((x) => type.startsWith(x)) !== -1
}
export const MARKDOWN_RESOURCE_TYPES = [
  ResourceTypes.LINK,
  ResourceTypes.ARTICLE,
  ResourceTypes.POST,
  ResourceTypes.DOCUMENT_SPACE_NOTE
]
export const isMarkdownResourceType = (type) => {
  return MARKDOWN_RESOURCE_TYPES.findIndex((x) => type.startsWith(x)) !== -1
}
export * from './resources/index.types'
