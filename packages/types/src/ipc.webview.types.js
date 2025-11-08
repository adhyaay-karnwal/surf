export var WebViewEventReceiveNames
;(function (WebViewEventReceiveNames) {
  WebViewEventReceiveNames['GetSelection'] = 'get_selection'
  WebViewEventReceiveNames['GetResource'] = 'get_resource'
  WebViewEventReceiveNames['GetApp'] = 'get_app'
  WebViewEventReceiveNames['RunAction'] = 'run_action'
  WebViewEventReceiveNames['TransformationOutput'] = 'transformation_output'
  WebViewEventReceiveNames['RestoreAnnotation'] = 'restore_annotation'
  WebViewEventReceiveNames['ScrollToAnnotation'] = 'scroll_to_annotation'
  WebViewEventReceiveNames['HighlightText'] = 'highlight_text'
  WebViewEventReceiveNames['SeekToTimestamp'] = 'seek_to_timestamp'
  WebViewEventReceiveNames['SimulateDragStart'] = 'simulate_drag_start'
  WebViewEventReceiveNames['SimulateDragUpdate'] = 'simulate_drag_update'
  WebViewEventReceiveNames['SimulateDragEnd'] = 'simulate_drag_end'
  WebViewEventReceiveNames['GoToPDFPage'] = 'go_to_pdf_page'
  // NOTE: There is no PIP enter, as it needs user gesture "workaround"
  WebViewEventReceiveNames['RequestExitPIP'] = 'request_exit_picture_in_picture'
  WebViewEventReceiveNames['RequestPIPState'] = 'request_picture_in_picture_state'
})(WebViewEventReceiveNames || (WebViewEventReceiveNames = {}))
export var WebViewEventSendNames
;(function (WebViewEventSendNames) {
  WebViewEventSendNames['Wheel'] = 'wheel'
  // NOTE: Using prefix for drag events, not to confuse with app window events!
  WebViewEventSendNames['DragEnter'] = 'passthrough_dragenter'
  WebViewEventSendNames['DragOver'] = 'passthrough_dragover'
  WebViewEventSendNames['DragLeave'] = 'passthrough_dragleave'
  WebViewEventSendNames['Drag'] = 'passthrough_drag'
  WebViewEventSendNames['Drop'] = 'passthrough_drop'
  WebViewEventSendNames['Focus'] = 'focus'
  WebViewEventSendNames['KeyUp'] = 'key_up'
  WebViewEventSendNames['KeyDown'] = 'key_down'
  WebViewEventSendNames['MouseClick'] = 'mouse_click'
  WebViewEventSendNames['DetectedApp'] = 'detected_app'
  WebViewEventSendNames['DetectedResource'] = 'detected_resource'
  WebViewEventSendNames['ActionOutput'] = 'action_output'
  WebViewEventSendNames['InsertText'] = 'insert_text'
  WebViewEventSendNames['Bookmark'] = 'bookmark'
  WebViewEventSendNames['Transform'] = 'transform'
  WebViewEventSendNames['Selection'] = 'selection'
  WebViewEventSendNames['Annotate'] = 'annotate'
  WebViewEventSendNames['Copy'] = 'copy'
  WebViewEventSendNames['InlineTextReplace'] = 'inline_text_replace'
  WebViewEventSendNames['AnnotationClick'] = 'annotation_click'
  WebViewEventSendNames['RemoveAnnotation'] = 'remove_annotation'
  WebViewEventSendNames['UpdateAnnotation'] = 'update_annotation'
  WebViewEventSendNames['AddToChat'] = 'add_to_chat'
  WebViewEventSendNames['FullscreenChange'] = 'fullscreen_change'
  WebViewEventSendNames['PIPState'] = 'picture_in_picture_state'
})(WebViewEventSendNames || (WebViewEventSendNames = {}))
// NOTE: This is separate from the IPC events, as some actions
// (such as requesting PIP) require special user interaction.
// Electron can circumvent this by calling
// `webview.executeJavaScript(..., true)` but this means that it sadly
// works separate from our other IPC events.
export var WebViewGestureRequiredEventNames
;(function (WebViewGestureRequiredEventNames) {
  WebViewGestureRequiredEventNames['RequestEnterPIP'] = 'breeze__request_enter_pip'
})(WebViewGestureRequiredEventNames || (WebViewGestureRequiredEventNames = {}))
export var WebviewAnnotationEventNames
;(function (WebviewAnnotationEventNames) {
  WebviewAnnotationEventNames['Click'] = 'deta_annotation_click'
})(WebviewAnnotationEventNames || (WebviewAnnotationEventNames = {}))
export const WEBVIEW_MOUSE_CLICK_WINDOW_EVENT = 'webview-mouse-click'
