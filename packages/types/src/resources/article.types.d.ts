export interface ResourceDataArticle {
  title: string
  url: string
  date_published: string | null
  date_updated: string | null
  site_name: string
  site_icon: string
  author: string | null
  author_image: string | null
  author_url: string | null
  excerpt: string | null
  content_plain: string
  content_html: string
  word_count: number
  lang: string | null
  direction: string | null
  images: string[]
  category_name: string | null
  category_url: string | null
  stats: {
    views?: number | null
    comments?: number | null
  }
}
//# sourceMappingURL=article.types.d.ts.map
