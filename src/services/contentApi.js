import { shared } from '../data/siteSettings.js'
import { pageMap, pages } from '../pages/index.js'

// This is the future Strapi boundary. For now it returns local page modules,
// but the rendering code does not need to know where the content came from.
export async function getSiteContent() {
  // Later this can become:
  // const response = await fetch(`${STRAPI_URL}/api/pages?populate=deep&locale=all`)
  // return normalizeStrapiContent(await response.json())
  return {
    shared,
    pages,
    pageMap,
  }
}

export async function getPageBySlug(slug) {
  return pageMap.get(slug) || pageMap.get('home')
}
