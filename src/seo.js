function setMetaContent(selector, content) {
  const element = document.head.querySelector(selector)

  if (element) {
    element.setAttribute('content', content)
  }
}

export function updateSeo(page, language, copy) {
  const routeSeo = page.seo?.[language]
  const title = routeSeo
    ? `${routeSeo.title} | ${copy.titleSuffix}`
    : `${copy.siteTitle} | ${copy.titleSuffix}`
  const description = routeSeo?.description || copy.defaultDescription

  document.title = title
  setMetaContent('meta[name="description"]', description)
  setMetaContent('meta[property="og:title"]', title)
  setMetaContent('meta[property="og:description"]', description)
  setMetaContent('meta[property="og:locale"]', language === 'fr' ? 'fr_CA' : 'en_CA')
  setMetaContent('meta[name="twitter:title"]', title)
  setMetaContent('meta[name="twitter:description"]', description)
}
