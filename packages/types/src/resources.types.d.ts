import { type ResourceProcessingState } from './eventBus.types'
import type {
  ResourceDataAnnotation,
  ResourceDataArticle,
  ResourceDataChatMessage,
  ResourceDataChatThread,
  ResourceDataColor,
  ResourceDataDocument,
  ResourceDataHistoryEntry,
  ResourceDataLink,
  ResourceDataLocation,
  ResourceDataPost,
  ResourceDataTable,
  ResourceDataTableColumn
} from './resources/index.types'
export interface SFFSResourceMetadata {
  name: string
  sourceURI: string
  alt: string
  userContext: string
}
export interface SFFSResourceTag {
  id?: string
  name: string
  value: string
  op?: 'eq' | 'ne' | 'prefix' | 'suffix' | 'notexists' | 'neprefix' | 'nesuffix'
}
export declare enum ResourceTagsBuiltInKeys {
  SAVED_WITH_ACTION = 'savedWithAction',
  TYPE = 'type',
  DELETED = 'deleted',
  HOSTNAME = 'hostname',
  CANONICAL_URL = 'canonicalUrl',
  ANNOTATES = 'annotates',
  HASHTAG = 'hashtag',
  SPACE_SOURCE = 'spaceSource', // resource was added to the space from a external source like RSS
  VIEWED_BY_USER = 'viewedByUser', // resource was viewed by the user
  SILENT = 'silent', // resource was saved silently in the background and not by the user
  HIDE_IN_EVERYTHING = 'hideInEverything', // resource should not be shown in the Oasis Everything view
  SOURCE_PUBLISHED_AT = 'sourcePublishedAt', // timestamp of when the resource was published by the source (e.g. tweet timestamp)
  CREATED_FOR_CHAT = 'createdForChat', // resource was created for a chat
  CONTENT_HASH = 'contentHash', // hash of the content of the resource
  PREVIEW_IMAGE_RESOURCE = 'previewImageResource', // resource id of the custom preview image set by the user
  USER_VIEW_PREFS = 'userViewPreferences',
  LINKED_CHAT = 'linkedChat', // resource is linked to a chat
  DATA_STATE = 'dataState', // state of the resource data (e.g. 'partial', 'complete')
  BREEZELET_PROTOCOL_VERSION = 'breezeletProtocolVersion', // version of the breezelet protocol used to save the resource
  PRELOADED_RESOURCE = 'preloadedResource', // resource was preloaded (e.g. from a web clipper)
  EMPTY_RESOURCE = 'emptyResource', // resource was created as an empty resource (e.g. new note)
  ONBOARDING = 'onboarding', // resource is part of the onboarding flow
  CAPTION = 'caption'
}
export interface ResourceTagsBuiltIn {
  [ResourceTagsBuiltInKeys.SAVED_WITH_ACTION]:
    | 'download'
    | 'drag/browser'
    | 'drag/local'
    | 'paste'
    | 'import'
    | 'generated'
    | 'chat'
  [ResourceTagsBuiltInKeys.TYPE]: string
  [ResourceTagsBuiltInKeys.DELETED]: boolean
  [ResourceTagsBuiltInKeys.HOSTNAME]: string
  [ResourceTagsBuiltInKeys.CANONICAL_URL]: string
  [ResourceTagsBuiltInKeys.ANNOTATES]: string
  [ResourceTagsBuiltInKeys.HASHTAG]: string
  [ResourceTagsBuiltInKeys.SILENT]: boolean
  [ResourceTagsBuiltInKeys.HIDE_IN_EVERYTHING]: boolean
  [ResourceTagsBuiltInKeys.SOURCE_PUBLISHED_AT]: string
  [ResourceTagsBuiltInKeys.CREATED_FOR_CHAT]: boolean
  [ResourceTagsBuiltInKeys.PREVIEW_IMAGE_RESOURCE]: string
  [ResourceTagsBuiltInKeys.USER_VIEW_PREFS]: UserViewPrefsTagValue
  [ResourceTagsBuiltInKeys.LINKED_CHAT]: string
  [ResourceTagsBuiltInKeys.DATA_STATE]: ResourceTagDataStateValue
  [ResourceTagsBuiltInKeys.BREEZELET_PROTOCOL_VERSION]: string
  [ResourceTagsBuiltInKeys.PRELOADED_RESOURCE]: boolean
  [ResourceTagsBuiltInKeys.EMPTY_RESOURCE]: boolean
  [ResourceTagsBuiltInKeys.ONBOARDING]: boolean
  [ResourceTagsBuiltInKeys.CAPTION]: string
}
export type UserViewPrefsTagValue = {
  blockHeight: string
  blockCollapsed: boolean
}
export declare enum ResourceTagDataStateValue {
  PARTIAL = 'partial',
  COMPLETE = 'complete',
  ERROR = 'error'
}
export interface SFFSResource {
  id: string
  type: string
  path: string
  createdAt: string
  updatedAt: string
  deleted: boolean
  metadata?: SFFSResourceMetadata
  tags?: SFFSResourceTag[]
  annotations?: SFFSResource[]
  postProcessingState?: ResourceProcessingState
  spaceIds?: string[]
}
export interface SFFSSpace {
  id: string
  name: string
  created_at: string
  updated_at: string
}
export interface SFFSResourceOrSpace {
  id: string
  item_type: 'resource' | 'space'
}
export type SFFSSearchResultEngine = 'keyword' | 'proximity' | 'semantic' | 'local'
export interface SFFSSearchGeneralParameters {
  includeAnnotations?: boolean
  spaceId?: string
  keywordLimit?: number
}
export interface SFFSSearchSemanticParameters {
  semanticEnabled?: boolean
  semanticDistanceThreshold?: number
  semanticLimit?: number
}
export type SFFSSearchParameters = SFFSSearchGeneralParameters & SFFSSearchSemanticParameters
export interface SFFSSearchResultItem {
  resource: SFFSResource
  engine: SFFSSearchResultEngine
}
export interface SFFSSearchResultItemSpace {
  space: SFFSSpace
  engine: SFFSSearchResultEngine
}
export declare enum ResourceTypes {
  PDF = 'application/pdf',
  HTML = 'text/html',
  JAVASCRIPT = 'text/javascript',
  IMAGE = 'image',
  SPACE = 'application/vnd.space',
  POST = 'application/vnd.space.post',
  POST_REDDIT = 'application/vnd.space.post.reddit',
  POST_TWITTER = 'application/vnd.space.post.twitter',
  POST_YOUTUBE = 'application/vnd.space.post.youtube',
  CHAT_MESSAGE = 'application/vnd.space.chat-message',
  CHAT_MESSAGE_DISCORD = 'application/vnd.space.chat-message.discord',
  CHAT_MESSAGE_SLACK = 'application/vnd.space.chat-message.slack',
  CHAT_THREAD = 'application/vnd.space.chat-thread',
  CHAT_THREAD_SLACK = 'application/vnd.space.chat-thread.slack',
  DOCUMENT = 'application/vnd.space.document',
  DOCUMENT_SPACE_NOTE = 'application/vnd.space.document.space-note',
  DOCUMENT_NOTION = 'application/vnd.space.document.notion',
  DOCUMENT_GOOGLE_DOC = 'application/vnd.space.document.google-doc',
  TABLE = 'application/vnd.space.table',
  TABLE_GOOGLE_SHEET = 'application/vnd.space.table.google-sheet',
  TABLE_TYPEFORM = 'application/vnd.space.table.typeform',
  TABLE_COLUMN = 'application/vnd.space.table-column',
  TABLE_COLUMN_GOOGLE_SHEET = 'application/vnd.space.table-column.google-sheet',
  TABLE_COLUMN_TYPEFORM = 'application/vnd.space.table-column.typeform',
  ARTICLE = 'application/vnd.space.article',
  LINK = 'application/vnd.space.link',
  DRAWING = 'application/vnd.space.drawing',
  DRAWING_TLDRAW = 'application/vnd.space.drawing.tldraw',
  LOCATION = 'application/vnd.space.location',
  COLOR = 'application/vnd.space.color',
  FLOWCHAT_FUN = 'application/vnd.space.custom.flowchart-fun',
  ANNOTATION = 'application/vnd.space.annotation',
  HISTORY_ENTRY = 'application/vnd.space.history-entry',
  CHANNEL_YOUTUBE = 'application/vnd.space.channel.youtube',
  PLAYLIST_YOUTUBE = 'application/vnd.space.playlist.youtube'
}
export declare const WEB_RESOURCE_TYPES: ResourceTypes[]
export declare const isWebResourceType: (type: string) => boolean
export interface ResourceDataPDF {
  url: string
  downloadURL?: string
}
export interface ResourceDataTypes {
  [ResourceTypes.PDF]: ResourceDataPDF
  [ResourceTypes.POST]: ResourceDataPost
  [ResourceTypes.DOCUMENT]: ResourceDataDocument
  [ResourceTypes.CHAT_MESSAGE]: ResourceDataChatMessage
  [ResourceTypes.CHAT_THREAD]: ResourceDataChatThread
  [ResourceTypes.ARTICLE]: ResourceDataArticle
  [ResourceTypes.LINK]: ResourceDataLink
  [ResourceTypes.LOCATION]: ResourceDataLocation
  [ResourceTypes.COLOR]: ResourceDataColor
  [ResourceTypes.DOCUMENT_SPACE_NOTE]: string
  [ResourceTypes.TABLE]: ResourceDataTable
  [ResourceTypes.TABLE_COLUMN]: ResourceDataTableColumn
  [ResourceTypes.ANNOTATION]: ResourceDataAnnotation
  [ResourceTypes.HISTORY_ENTRY]: ResourceDataHistoryEntry
}
export type ResourceData = ResourceDataTypes[keyof ResourceDataTypes]
export type DetectedWebApp = {
  appId: string | null
  appName: string | null
  hostname: string
  canonicalUrl: string
  downloadUrl?: string
  resourceType: string | null
  appResourceIdentifier: string | null
  resourceNeedsPicking: boolean
  rssFeedUrl?: string
}
export type DetectedResource<T = ResourceData> = {
  data: T
  type: string
}
export type ResourceStateCombined = 'idle' | 'extracting' | 'post-processing' | 'error'
export type ResourceState = 'idle' | 'running' | 'error'
export declare const MARKDOWN_RESOURCE_TYPES: ResourceTypes[]
export declare const isMarkdownResourceType: (type: string) => boolean
export * from './resources/index.types'
//# sourceMappingURL=resources.types.d.ts.map
