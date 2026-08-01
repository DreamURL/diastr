import { MetadataRoute } from 'next'

// next.config.js 의 trailingSlash: true 때문에 실제 서빙 URL 은 항상 슬래시로 끝난다.
// 슬래시 없는 URL 을 sitemap 에 넣으면 301 리디렉션이 발생해 색인에서 제외된다.
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://diastr.dreamurl.biz'

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/convert/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gallery/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/use/`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/dmc-table/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}
