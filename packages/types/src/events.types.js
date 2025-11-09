import {} from './browser.types'
import {} from './contexts.types'
import {} from './ipc.webview.types'
import {} from './resources.types'
export var CreateTabEventTrigger
;(function (CreateTabEventTrigger) {
  /** Tab was created from the address bar */
  CreateTabEventTrigger['AddressBar'] = 'address_bar'
  /** Tab was created by clicking a link in a page */
  CreateTabEventTrigger['Page'] = 'page'
  /** Tab was created by opening the source of an item in Oasis */
  CreateTabEventTrigger['OasisItem'] = 'oasis_item'
  /** Tab was created by opening multiple sources in Oasis */
  CreateTabEventTrigger['OasisMultiSelect'] = 'oasis_multi_select'
  /** Tab was created by opening the source of a resource used in a chat */
  CreateTabEventTrigger['OasisChat'] = 'oasis_chat'
  /** Tab was created from the create menu in Oasis */
  CreateTabEventTrigger['OasisCreate'] = 'oasis_create'
  /** Tab was created by opening a item in the search */
  CreateTabEventTrigger['Search'] = 'search'
  /** Tab was created by dropping something in the tab list */
  CreateTabEventTrigger['Drop'] = 'drop'
  /** Tab was created by dropping something in the tab list */
  CreateTabEventTrigger['History'] = 'history'
  /** Tab was created by opening the source of a item from the stack */
  CreateTabEventTrigger['StackItem'] = 'stack_item'
  /** Tab was created because a URL was opened outside of the app / by the system */
  CreateTabEventTrigger['System'] = 'system'
  /** Tab was created from the context menu */
  CreateTabEventTrigger['ContextMenu'] = 'context_menu'
  /** Tab was created from the homescreen */
  CreateTabEventTrigger['Homescreen'] = 'homescreen'
  /** Tab was created from inside a space on the homescreen */
  CreateTabEventTrigger['HomescreenSpace'] = 'homescreen_space'
  /** Tab was created from a note */
  CreateTabEventTrigger['NoteCitation'] = 'note_citation'
  /** Tab was created from a link in a note */
  CreateTabEventTrigger['NoteLink'] = 'note_link'
  /** Tab was created by a unknown or other interaction */
  CreateTabEventTrigger['Other'] = 'Other'
})(CreateTabEventTrigger || (CreateTabEventTrigger = {}))
export var ActivateTabEventTrigger
;(function (ActivateTabEventTrigger) {
  /** Tab was activated by clicking on it in the tabs list */
  ActivateTabEventTrigger['Click'] = 'click'
  /** Tab was activated by a keyboard shortcut */
  ActivateTabEventTrigger['Shortcut'] = 'shortcut'
  /** Tab was activated by clicking a citation in the chat */
  ActivateTabEventTrigger['ChatCitation'] = 'chat_citation'
  /** Tab was activated by opening a item in the search */
  ActivateTabEventTrigger['Search'] = 'search'
  /** Tab was activated by clicking it in Oasis */
  ActivateTabEventTrigger['Oasis'] = 'oasis'
  /** Tab was activated by selecting inside the command menu */
  ActivateTabEventTrigger['CommandMenu'] = 'command_menu'
})(ActivateTabEventTrigger || (ActivateTabEventTrigger = {}))
export var DeleteTabEventTrigger
;(function (DeleteTabEventTrigger) {
  /** Tab was deleted by clicking the close button */
  DeleteTabEventTrigger['Click'] = 'click'
  /** Tab was deleted by a keyboard shortcut */
  DeleteTabEventTrigger['Shortcut'] = 'shortcut'
  /** Tab was deleted using the command menu */
  DeleteTabEventTrigger['CommandMenu'] = 'command_menu'
  /** Deleted from context menu */
  DeleteTabEventTrigger['ContextMenu'] = 'context_menu'
})(DeleteTabEventTrigger || (DeleteTabEventTrigger = {}))
export var MoveTabEventAction
;(function (MoveTabEventAction) {
  MoveTabEventAction['Pin'] = 'pin'
  MoveTabEventAction['Unpin'] = 'unpin'
  MoveTabEventAction['AddMagic'] = 'add_magic'
  MoveTabEventAction['RemoveMagic'] = 'remove_magic'
})(MoveTabEventAction || (MoveTabEventAction = {}))
export var ChangeContextEventTrigger
;(function (ChangeContextEventTrigger) {
  ChangeContextEventTrigger['ContextSwitcher'] = 'context_switcher'
  ChangeContextEventTrigger['Tab'] = 'tab'
  ChangeContextEventTrigger['SpaceInOasis'] = 'space_in_oasis'
  ChangeContextEventTrigger['CommandMenu'] = 'command_menu'
  ChangeContextEventTrigger['Homescreen'] = 'homescreen'
  ChangeContextEventTrigger['Note'] = 'note'
})(ChangeContextEventTrigger || (ChangeContextEventTrigger = {}))
export var BrowserContextScope
;(function (BrowserContextScope) {
  BrowserContextScope['General'] = 'general'
  BrowserContextScope['Space'] = 'space'
})(BrowserContextScope || (BrowserContextScope = {}))
export var OpenResourceEventFrom
;(function (OpenResourceEventFrom) {
  OpenResourceEventFrom['Space'] = 'space'
  OpenResourceEventFrom['SpaceLive'] = 'space/live'
  OpenResourceEventFrom['Oasis'] = 'oasis'
  OpenResourceEventFrom['OasisChat'] = 'chat'
  OpenResourceEventFrom['History'] = 'history'
  OpenResourceEventFrom['NewTab'] = 'new_tab'
  OpenResourceEventFrom['Page'] = 'page'
  OpenResourceEventFrom['CommandMenu'] = 'command_menu'
  OpenResourceEventFrom['Stack'] = 'stack'
  OpenResourceEventFrom['Homescreen'] = 'homescreen'
})(OpenResourceEventFrom || (OpenResourceEventFrom = {}))
export var OpenInMiniBrowserEventFrom
;(function (OpenInMiniBrowserEventFrom) {
  OpenInMiniBrowserEventFrom['Oasis'] = 'oasis'
  OpenInMiniBrowserEventFrom['Stack'] = 'stack'
  OpenInMiniBrowserEventFrom['Chat'] = 'chat'
  OpenInMiniBrowserEventFrom['PinnedTab'] = 'pinned_tab'
  OpenInMiniBrowserEventFrom['WebPage'] = 'web_page'
  OpenInMiniBrowserEventFrom['Homescreeen'] = 'homescreen'
  OpenInMiniBrowserEventFrom['CommandMenu'] = 'command_menu'
  OpenInMiniBrowserEventFrom['Note'] = 'note'
  OpenInMiniBrowserEventFrom['NoteLink'] = 'note_link'
})(OpenInMiniBrowserEventFrom || (OpenInMiniBrowserEventFrom = {}))
export var DeleteResourceEventTrigger
;(function (DeleteResourceEventTrigger) {
  /** Resource was deleted from the resource view in Oasis */
  DeleteResourceEventTrigger['OasisItem'] = 'oasis'
  /** Resource was deleted by selecting multiple in Oasis */
  DeleteResourceEventTrigger['OasisMultiSelect'] = 'oasis_multi_select'
})(DeleteResourceEventTrigger || (DeleteResourceEventTrigger = {}))
export var SaveToOasisEventTrigger
;(function (SaveToOasisEventTrigger) {
  /** Page was saved by clicking the save button */
  SaveToOasisEventTrigger['Click'] = 'click'
  /** Page was saved by a keyboard shortcut */
  SaveToOasisEventTrigger['Shortcut'] = 'shortcut'
  /** Resource was created from the create menu */
  SaveToOasisEventTrigger['CreateMenu'] = 'create_menu'
  /** Page was saved from the command menu */
  SaveToOasisEventTrigger['CommandMenu'] = 'command_menu'
  /** Page was saved by dropping into Oasis or a Space */
  SaveToOasisEventTrigger['Drop'] = 'drop'
  /** Saved from context menu */
  SaveToOasisEventTrigger['ContextMenu'] = 'context_menu'
  /** Saved from the mini browser */
  SaveToOasisEventTrigger['MiniBrowser'] = 'mini_browser'
  /* When dropped onto homescreen -> Saving */
  SaveToOasisEventTrigger['Homescreen'] = 'homescreen'
  /* Saved from the space tab bar */
  SaveToOasisEventTrigger['SpaceTabBar'] = 'space_tab_bar'
})(SaveToOasisEventTrigger || (SaveToOasisEventTrigger = {}))
export var EventContext
;(function (EventContext) {
  /** Inline menu */
  EventContext['Inline'] = 'inline'
  /** Sidebar chat */
  EventContext['Chat'] = 'chat'
  /** Tab items */
  EventContext['Tabs'] = 'tabs'
  /** Stuff Overlay */
  EventContext['StuffOverlay'] = 'stuff_overlay'
  /** Resource Overlay aka Mini Browser */
  EventContext['ResourceOverlay'] = 'resource_overlay'
  /** Homescreen */
  EventContext['Homescreen'] = 'homescreen'
  /** Command menu */
  EventContext['CommandMenu'] = 'command_menu'
  /** Space View  */
  EventContext['Space'] = 'space'
  /** Notes */
  EventContext['Note'] = 'note'
  /** Within a webpage */
  EventContext['Webpage'] = 'webpage'
  /** Shortcut */
  EventContext['Shortcut'] = 'shortcut'
})(EventContext || (EventContext = {}))
export var SearchOasisEventTrigger
;(function (SearchOasisEventTrigger) {
  /** Search was done from the new tab command menu */
  SearchOasisEventTrigger['CommandMenu'] = 'command_menu'
  /** Search was done from the oasis search input */
  SearchOasisEventTrigger['Oasis'] = 'Oasis'
})(SearchOasisEventTrigger || (SearchOasisEventTrigger = {}))
export var CreateSpaceEventFrom
;(function (CreateSpaceEventFrom) {
  // Created from context switcher inside tabs
  CreateSpaceEventFrom['ContextSwitcher'] = 'context_switcher'
  /** Space was created from the spaces view in Oasis */
  CreateSpaceEventFrom['OasisSpacesView'] = 'oasis_spaces_view'
  /** Space was created from the space hover menu in the sidebar */
  CreateSpaceEventFrom['SpaceHoverMenu'] = 'space_hover_menu'
  /** Space was created from the create live space button of a tab */
  CreateSpaceEventFrom['TabLiveSpaceButton'] = 'tab_live_space_button'
  /** Created from context menu */
  CreateSpaceEventFrom['ContextMenu'] = 'context_menu' // TODO: ctx impl
})(CreateSpaceEventFrom || (CreateSpaceEventFrom = {}))
export var RefreshSpaceEventTrigger
;(function (RefreshSpaceEventTrigger) {
  /** Space was renamed and processed with AI */
  RefreshSpaceEventTrigger['RenameSpaceWithAI'] = 'rename_space_with_ai'
  /** Live space was opened and refreshed */
  RefreshSpaceEventTrigger['LiveSpaceAutoRefreshed'] = 'live_space_auto_refreshed'
  /** Live space was manually refreshed */
  RefreshSpaceEventTrigger['LiveSpaceManuallyRefreshed'] = 'live_space_manually_refreshed'
})(RefreshSpaceEventTrigger || (RefreshSpaceEventTrigger = {}))
export var UpdateSpaceSettingsEventTrigger
;(function (UpdateSpaceSettingsEventTrigger) {
  /** Space settings were changed from the settings menu */
  UpdateSpaceSettingsEventTrigger['SettingsMenu'] = 'settings_menu'
  /** Space settings were changed from the space preview in Oasis */
  UpdateSpaceSettingsEventTrigger['SpacePreview'] = 'space_preview'
  /** Space settings were changed when adding the tab as a source to the space */
  UpdateSpaceSettingsEventTrigger['TabLiveSpaceButton'] = 'tab_live_space_button'
})(UpdateSpaceSettingsEventTrigger || (UpdateSpaceSettingsEventTrigger = {}))
export var OpenSpaceEventTrigger
;(function (OpenSpaceEventTrigger) {
  /** Space was opened from the spaces view in Oasis */
  OpenSpaceEventTrigger['SpacesView'] = 'spaces_view'
  /** Space was opened from the hover menu in the sidebar */
  OpenSpaceEventTrigger['SidebarMenu'] = 'sidebar_menu'
})(OpenSpaceEventTrigger || (OpenSpaceEventTrigger = {}))
export var AddResourceToSpaceEventTrigger
;(function (AddResourceToSpaceEventTrigger) {
  /** Resource was dropped into the space */
  AddResourceToSpaceEventTrigger['Drop'] = 'drop'
  /** Resource was moved by selecting the space from the tab context menu */
  AddResourceToSpaceEventTrigger['TabMenu'] = 'tab_menu'
  /** Tab was saved to a space from the space tab bar */
  AddResourceToSpaceEventTrigger['SpaceTabBar'] = 'space_tab_bar'
  /** Resource was moved by dropping it on the space's homescreen */
  AddResourceToSpaceEventTrigger['DropHomescreen'] = 'drop_homescreen'
  /** Resource was saved to the space by selecting it when saving chat output */
  AddResourceToSpaceEventTrigger['Chat'] = 'chat'
})(AddResourceToSpaceEventTrigger || (AddResourceToSpaceEventTrigger = {}))
export var DeleteSpaceEventTrigger
;(function (DeleteSpaceEventTrigger) {
  /** Space was deleted from the spaces view in Oasis */
  DeleteSpaceEventTrigger['SpacesView'] = 'spaces_view'
  /** Space was deleted from its settings */
  DeleteSpaceEventTrigger['SpaceSettings'] = 'space_settings'
  /** Deleted from context menu */
  DeleteSpaceEventTrigger['ContextMenu'] = 'context_menu' // TODO: ctx impl
})(DeleteSpaceEventTrigger || (DeleteSpaceEventTrigger = {}))
export var CreateAnnotationEventTrigger
;(function (CreateAnnotationEventTrigger) {
  /** Annotation created from within the page */
  CreateAnnotationEventTrigger['PageInline'] = 'page_inline'
  /** Annotation created from the sidebar */
  CreateAnnotationEventTrigger['PageSidebar'] = 'page_sidebar'
  /** Annotation created by saving inline AI output */
  CreateAnnotationEventTrigger['InlinePageAI'] = 'inline_page_ai'
  /** Annotation created by saving sidebar chat output */
  CreateAnnotationEventTrigger['PageChatMessage'] = 'page_chat_message'
})(CreateAnnotationEventTrigger || (CreateAnnotationEventTrigger = {}))
export var DeleteAnnotationEventTrigger
;(function (DeleteAnnotationEventTrigger) {
  /** Annotation deleted from within the page */
  DeleteAnnotationEventTrigger['PageInline'] = 'page_inline'
  /** Annotation deleted from the sidebar */
  DeleteAnnotationEventTrigger['PageSidebar'] = 'page_sidebar'
})(DeleteAnnotationEventTrigger || (DeleteAnnotationEventTrigger = {}))
export var PageChatUpdateContextEventAction
;(function (PageChatUpdateContextEventAction) {
  /** A tab was added to the context */
  PageChatUpdateContextEventAction['Add'] = 'add'
  /** A tab was removed from the context */
  PageChatUpdateContextEventAction['Remove'] = 'remove'
  /** All other tabs were removed except one */
  PageChatUpdateContextEventAction['ExcludeOthers'] = 'exclude_others'
  /** The active tab changed and was added to the context */
  PageChatUpdateContextEventAction['ActiveChanged'] = 'active_changed'
  /** The active context changed or was added to the context */
  PageChatUpdateContextEventAction['ActiveContextChanged'] = 'active_context_changed'
  /** Multiple tabs were selected */
  PageChatUpdateContextEventAction['MultiSelect'] = 'multi_select'
  /** Context was cleared completely */
  PageChatUpdateContextEventAction['Clear'] = 'clear'
})(PageChatUpdateContextEventAction || (PageChatUpdateContextEventAction = {}))
export var PageChatUpdateContextEventTrigger
;(function (PageChatUpdateContextEventTrigger) {
  PageChatUpdateContextEventTrigger['DragAndDrop'] = 'drag_and_drop'
  PageChatUpdateContextEventTrigger['TabSelection'] = 'tab_selection'
  PageChatUpdateContextEventTrigger['ChatAddContextMenu'] = 'chat_add_context_menu'
  PageChatUpdateContextEventTrigger['ChatContextItem'] = 'chat_context_item'
  PageChatUpdateContextEventTrigger['Onboarding'] = 'onboarding'
  PageChatUpdateContextEventTrigger['ContextSwitch'] = 'context_switch'
  PageChatUpdateContextEventTrigger['ActiveTabChanged'] = 'active_tab_changed'
  PageChatUpdateContextEventTrigger['EditorMention'] = 'editor_mention'
  PageChatUpdateContextEventTrigger['StuffContext'] = 'stuff_context'
})(PageChatUpdateContextEventTrigger || (PageChatUpdateContextEventTrigger = {}))
export var PageChatUpdateContextItemType
;(function (PageChatUpdateContextItemType) {
  PageChatUpdateContextItemType['PageTab'] = 'page_tab'
  PageChatUpdateContextItemType['Resource'] = 'resource'
  PageChatUpdateContextItemType['Space'] = 'space'
  PageChatUpdateContextItemType['Screeenshot'] = 'screenshot'
  PageChatUpdateContextItemType['ActiveTab'] = 'active_tab'
  PageChatUpdateContextItemType['ActiveSpace'] = 'active_space'
})(PageChatUpdateContextItemType || (PageChatUpdateContextItemType = {}))
export var SelectTabEventAction
;(function (SelectTabEventAction) {
  /** A tab was added to the selection */
  SelectTabEventAction['Add'] = 'add'
  /** A tab was removed from the selection */
  SelectTabEventAction['Remove'] = 'remove'
  /** Multiple tabs were added to/removed from the selection */
  SelectTabEventAction['MultiSelect'] = 'multi_select'
})(SelectTabEventAction || (SelectTabEventAction = {}))
export var MultiSelectResourceEventAction
;(function (MultiSelectResourceEventAction) {
  MultiSelectResourceEventAction['OpenAsTab'] = 'open_as_tab'
  MultiSelectResourceEventAction['AddToChat'] = 'add_to_chat'
  MultiSelectResourceEventAction['AddToSpace'] = 'add_to_space'
  MultiSelectResourceEventAction['Delete'] = 'delete'
})(MultiSelectResourceEventAction || (MultiSelectResourceEventAction = {}))
export var PageChatMessageSentEventError
;(function (PageChatMessageSentEventError) {
  PageChatMessageSentEventError['APIKeyMissing'] = 'api_key_missing'
  PageChatMessageSentEventError['BadRequest'] = 'bad_request'
  PageChatMessageSentEventError['Unauthorized'] = 'unauthorized'
  PageChatMessageSentEventError['RAGEmptyContext'] = 'rag_empty_context'
  PageChatMessageSentEventError['TooManyRequests'] = 'too_many_requests'
  PageChatMessageSentEventError['Other'] = 'other'
})(PageChatMessageSentEventError || (PageChatMessageSentEventError = {}))
export var PageChatMessageSentEventTrigger
;(function (PageChatMessageSentEventTrigger) {
  PageChatMessageSentEventTrigger['SidebarChat'] = 'sidebar_chat'
  PageChatMessageSentEventTrigger['InlineAI'] = 'inline_ai'
  PageChatMessageSentEventTrigger['NoteAutocompletion'] = 'note_autocompletion'
  PageChatMessageSentEventTrigger['NoteUseSuggestion'] = 'note_use_suggestion'
  PageChatMessageSentEventTrigger['NoteRewrite'] = 'note_rewrite'
  PageChatMessageSentEventTrigger['NoteSimilaritySearch'] = 'note_similarity_search'
  PageChatMessageSentEventTrigger['NoteChatInput'] = 'note_chat_input'
  PageChatMessageSentEventTrigger['NoteWebSearch'] = 'note_web_search'
  PageChatMessageSentEventTrigger['TeletypeAsk'] = 'teletype_ask'
})(PageChatMessageSentEventTrigger || (PageChatMessageSentEventTrigger = {}))
export var PromptType
;(function (PromptType) {
  PromptType['BuiltIn'] = 'built_in'
  PromptType['Custom'] = 'custom'
  PromptType['Generated'] = 'generated'
})(PromptType || (PromptType = {}))
export var GeneratePromptsEventTrigger
;(function (GeneratePromptsEventTrigger) {
  GeneratePromptsEventTrigger['ActiveTabChange'] = 'active_tab_change'
  GeneratePromptsEventTrigger['Click'] = 'click'
  GeneratePromptsEventTrigger['Shortcut'] = 'shortcut'
})(GeneratePromptsEventTrigger || (GeneratePromptsEventTrigger = {}))
export var OpenHomescreenEventTrigger
;(function (OpenHomescreenEventTrigger) {
  /** Open from "home" button in sidebar */
  OpenHomescreenEventTrigger['Click'] = 'click'
  /** Open from keyboard shortcut */
  OpenHomescreenEventTrigger['Shortcut'] = 'shortcut'
  /** Open from command menu */
  OpenHomescreenEventTrigger['CommandMenu'] = 'command_menu'
  /** By dragging over the home button / possible another drag touchpoint in the future */
  OpenHomescreenEventTrigger['DragOver'] = 'drag_over'
  /** Onboarding */
  OpenHomescreenEventTrigger['Onboarding'] = 'onboarding'
})(OpenHomescreenEventTrigger || (OpenHomescreenEventTrigger = {}))
export var AddHomescreenItemEventTrigger
;(function (AddHomescreenItemEventTrigger) {
  /** Place by dropping */
  AddHomescreenItemEventTrigger['Drop'] = 'drop'
  /** Pin from command menu */
  //CommandMenu = 'command_menu'
  /* Right click menu e.g. inside stuff */
  //ContextMenu = 'context_menu',
})(AddHomescreenItemEventTrigger || (AddHomescreenItemEventTrigger = {}))
export var AddHomescreenItemEventSource
;(function (AddHomescreenItemEventSource) {
  AddHomescreenItemEventSource['Tabs'] = 'tabs'
  AddHomescreenItemEventSource['Stack'] = 'stack'
  AddHomescreenItemEventSource['CommandMenu'] = 'command_menu'
  AddHomescreenItemEventSource['Stuff'] = 'stuff'
  AddHomescreenItemEventSource['Chat'] = 'chat'
  AddHomescreenItemEventSource['NativeDrop'] = 'native_drop'
  // Webpage = 'webpage',
})(AddHomescreenItemEventSource || (AddHomescreenItemEventSource = {}))
export var RemoveHomescreenItemEventTrigger
;(function (RemoveHomescreenItemEventTrigger) {
  /* Right click menu */
  RemoveHomescreenItemEventTrigger['ContextMenu'] = 'context_menu'
  /* Possible trashbin area in the future? */
  //TrashBin = 'trash_bin'
})(RemoveHomescreenItemEventTrigger || (RemoveHomescreenItemEventTrigger = {}))
export var UpdateHomescreenEventAction
;(function (UpdateHomescreenEventAction) {
  UpdateHomescreenEventAction['MoveItem'] = 'move_item'
  UpdateHomescreenEventAction['ResizeItem'] = 'resize_item'
  UpdateHomescreenEventAction['SetBackground'] = 'set_background'
})(UpdateHomescreenEventAction || (UpdateHomescreenEventAction = {}))
export var MentionEventType
;(function (MentionEventType) {
  MentionEventType['Context'] = 'context'
  MentionEventType['GeneralContext'] = 'general_context'
  MentionEventType['ActiveContext'] = 'active_context'
  MentionEventType['Everything'] = 'everything'
  MentionEventType['Tabs'] = 'tabs'
  MentionEventType['Resource'] = 'resource'
  MentionEventType['BUILT_IN'] = 'built-in'
})(MentionEventType || (MentionEventType = {}))
export var SummarizeEventContentSource
;(function (SummarizeEventContentSource) {
  SummarizeEventContentSource['Resource'] = 'resource'
  SummarizeEventContentSource['Citation'] = 'citation'
})(SummarizeEventContentSource || (SummarizeEventContentSource = {}))
export var NoteCreateCitationEventTrigger
;(function (NoteCreateCitationEventTrigger) {
  NoteCreateCitationEventTrigger['Drop'] = 'drop'
})(NoteCreateCitationEventTrigger || (NoteCreateCitationEventTrigger = {}))
