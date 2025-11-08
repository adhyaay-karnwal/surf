export interface ResourceDataPost {
  post_id: string
  url: string
  title: string | null
  date_published: string
  date_edited: string | null
  edited: boolean | null
  site_name: string
  site_icon: string
  author: string | null
  author_fullname: string | null
  author_image: string | null
  author_url: string | null
  excerpt: string | null
  content_plain: string
  content_html: string
  lang: string | null
  images: string[]
  video: string[]
  links: string[]
  parent_url: string | null
  parent_title: string | null
  stats: {
    views: number | null
    up_votes: number | null
    down_votes: number | null
    comments: number | null
  }
}
//# sourceMappingURL=post.types.d.ts.map
