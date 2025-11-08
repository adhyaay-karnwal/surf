// --- WebContentsView Actions ---
export var WebContentsViewActionType
;(function (WebContentsViewActionType) {
  WebContentsViewActionType['ACTIVATE'] = 'activate'
  WebContentsViewActionType['HIDE'] = 'hide'
  WebContentsViewActionType['DESTROY'] = 'destroy'
  WebContentsViewActionType['RELOAD'] = 'reload'
  WebContentsViewActionType['GO_FORWARD'] = 'go-forward'
  WebContentsViewActionType['GO_BACK'] = 'go-back'
  WebContentsViewActionType['SET_BOUNDS'] = 'set-bounds'
  WebContentsViewActionType['LOAD_URL'] = 'load-url'
  WebContentsViewActionType['INSERT_TEXT'] = 'insert-text'
  WebContentsViewActionType['GET_URL'] = 'get-url'
  WebContentsViewActionType['FOCUS'] = 'focus'
  WebContentsViewActionType['SET_AUDIO_MUTED'] = 'set-audio-muted'
  WebContentsViewActionType['SET_ZOOM_FACTOR'] = 'set-zoom-factor'
  WebContentsViewActionType['GET_ZOOM_FACTOR'] = 'get-zoom-factor'
  WebContentsViewActionType['OPEN_DEV_TOOLS'] = 'open-dev-tools'
  WebContentsViewActionType['SEND'] = 'send'
  WebContentsViewActionType['FIND_IN_PAGE'] = 'find-in-page'
  WebContentsViewActionType['STOP_FIND_IN_PAGE'] = 'stop-find-in-page'
  WebContentsViewActionType['EXECUTE_JAVASCRIPT'] = 'execute-javascript'
  WebContentsViewActionType['DOWNLOAD_URL'] = 'download-url'
  WebContentsViewActionType['IS_CURRENTLY_AUDIBLE'] = 'is-currently-audible'
  WebContentsViewActionType['GET_NAVIGATION_HISTORY'] = 'get-navigation-history'
  WebContentsViewActionType['CAPTURE_PAGE'] = 'capture-page'
  WebContentsViewActionType['CHANGE_PERMANENTLY_ACTIVE'] = 'change-permanently-active'
})(WebContentsViewActionType || (WebContentsViewActionType = {}))
// --- WebContentsViewManager Actions ---
export var WebContentsViewManagerActionType
;(function (WebContentsViewManagerActionType) {
  WebContentsViewManagerActionType['CREATE'] = 'create'
  WebContentsViewManagerActionType['HIDE_ALL'] = 'hide-all'
  WebContentsViewManagerActionType['SHOW_ACTIVE'] = 'show-active'
})(WebContentsViewManagerActionType || (WebContentsViewManagerActionType = {}))
// --- WebContentsView Events ---
export var WebContentsViewEventType
;(function (WebContentsViewEventType) {
  // Load Events
  WebContentsViewEventType['DID_START_LOADING'] = 'did-start-loading'
  WebContentsViewEventType['DID_STOP_LOADING'] = 'did-stop-loading'
  WebContentsViewEventType['DID_FINISH_LOAD'] = 'did-finish-load'
  WebContentsViewEventType['DID_FAIL_LOAD'] = 'did-fail-load'
  WebContentsViewEventType['DOM_READY'] = 'dom-ready'
  // Navigation Events
  WebContentsViewEventType['WILL_NAVIGATE'] = 'will-navigate'
  WebContentsViewEventType['DID_NAVIGATE'] = 'did-navigate'
  WebContentsViewEventType['DID_NAVIGATE_IN_PAGE'] = 'did-navigate-in-page'
  // Page Events
  WebContentsViewEventType['UPDATE_TARGET_URL'] = 'update-target-url'
  WebContentsViewEventType['PAGE_TITLE_UPDATED'] = 'page-title-updated'
  WebContentsViewEventType['PAGE_FAVICON_UPDATED'] = 'page-favicon-updated'
  WebContentsViewEventType['FOUND_IN_PAGE'] = 'found-in-page'
  WebContentsViewEventType['IPC_MESSAGE'] = 'ipc-message'
  // Media Events
  WebContentsViewEventType['MEDIA_STARTED_PLAYING'] = 'media-started-playing'
  WebContentsViewEventType['MEDIA_PAUSED'] = 'media-paused'
  // Focus and Blur Events
  WebContentsViewEventType['FOCUS'] = 'focus'
  WebContentsViewEventType['BLUR'] = 'blur'
  WebContentsViewEventType['ENTER_HTML_FULL_SCREEN'] = 'enter-html-full-screen'
  WebContentsViewEventType['LEAVE_HTML_FULL_SCREEN'] = 'leave-html-full-screen'
})(WebContentsViewEventType || (WebContentsViewEventType = {}))
