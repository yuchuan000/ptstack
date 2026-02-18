const BASE_URL = 'http://localhost:3000'

export function getFullUrl(url) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  if (url.startsWith('/')) {
    return BASE_URL + url
  }
  return BASE_URL + '/' + url
}
