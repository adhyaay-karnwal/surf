export var RendererType
;(function (RendererType) {
  RendererType['Main'] = 'main'
  RendererType['WebContentsView'] = 'webContentsView'
})(RendererType || (RendererType = {}))
export const BROWSER_CONTEXT_KEY = 'browser-utils'
export var ViewType
;(function (ViewType) {
  /**
   * External web pages
   * @example https://example.com
   */
  ViewType['Page'] = 'page'
  /**
   * A specific notebook
   * @example breeze://breeze/notebook/:id
   */
  ViewType['Notebook'] = 'notebook'
  /**
   * The notebooks home/root view
   * @example breeze://breeze/notebook
   */
  ViewType['NotebookHome'] = 'notebook_home'
  /**
   * A specific resource (most likely note)
   * @example breeze://breeze/resource/:id
   */
  ViewType['Resource'] = 'resource'
  /**
   * Some other internal page
   */
  ViewType['Internal'] = 'internal'
})(ViewType || (ViewType = {}))
export var ViewLocation
;(function (ViewLocation) {
  ViewLocation['Tab'] = 'tab'
  ViewLocation['Sidebar'] = 'sidebar'
})(ViewLocation || (ViewLocation = {}))
