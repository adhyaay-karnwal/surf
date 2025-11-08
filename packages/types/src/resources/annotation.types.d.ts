export type AnnotationType = 'highlight' | 'comment' | 'link'
export type AnnotationAnchorType = 'range' | 'element' | 'area'
export interface ResourceDataAnnotation {
  type: AnnotationType
  data: AnnotationHighlightData | AnnotationCommentData | AnnotationLinkData
  anchor: {
    type: AnnotationAnchorType
    data: AnnotationRangeData | AnnotationElementData | AnnotationAreaData
  } | null
}
export type AnnotationRangeData = {
  content_plain?: string
  content_html?: string
  start_offset: number
  end_offset: number
  start_xpath: string
  end_xpath: string
}
export type AnnotationElementData = {
  xpath: string
  query_selector: string
}
export type AnnotationAreaData = {
  x: number
  y: number
  width: number
  height: number
}
export type AnnotationHighlightData = {
  url?: string
}
export type AnnotationCommentData = {
  url?: string
  source: 'user' | 'inline_ai' | 'chat_ai'
  content_html?: string
  content_plain: string
  tags?: string[]
}
export type AnnotationLinkData = {
  target_type: 'external' | 'resource'
  url: string | null
  resource_id: string | null
}
export type AnnotationCommentRange = {
  id: string
  range: Range
  data: AnnotationCommentData
}
//# sourceMappingURL=annotation.types.d.ts.map
