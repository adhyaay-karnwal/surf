export interface ResourceDataChatMessage {
  messageId: string
  url: string
  date_sent: string
  date_edited: string | null
  platform_name: string
  platform_icon: string
  author: string
  author_image: string | null
  author_url: string | null
  content_plain: string
  content_html: string
  images: string[]
  video: string[]
  parent_url: string | null
  parent_title: string | null
  in_reply_to: string | null
}
export interface ResourceDataChatThread {
  title: string | null
  url: string
  platform_name: string
  platform_icon: string
  creator: string
  creator_image: string | null
  creator_url: string | null
  messages: ResourceDataChatMessage[]
  content_html: string
  content_plain: string
}
//# sourceMappingURL=chat.types.d.ts.map
