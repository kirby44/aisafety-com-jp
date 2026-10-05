type Environment = Record<string, string | undefined>

const JAPAN_BASE_ID = 'app7SrMiNyaAyXB2L'
const JAPAN_TABLE_ID = 'tblBBaYyXaEQ7vsqm'
const JAPAN_VIEW_ID = 'viwh7TofyxVBFq705'

function country(env: Environment): 'jp' | 'tw' {
  const value = env.MAP_COUNTRY?.trim() || 'jp'
  if (value !== 'jp' && value !== 'tw') {
    throw new Error('MAP_COUNTRY must be "jp" or "tw"')
  }
  return value
}

function httpUrl(value: string, name: string): string {
  const url = new URL(value)
  if (!['https:', 'http:'].includes(url.protocol)) {
    throw new Error(`${name} must be an HTTP(S) URL`)
  }
  return url.toString()
}

// Read on the server and pass only presentation settings to client components.
// No NEXT_PUBLIC variables or Airtable credentials are needed in the browser.
export function getSiteConfig(env: Environment = process.env) {
  const region = country(env)
  const countryName = region === 'jp' ? 'Japan' : 'Taiwan'
  const rawDataUrl =
    env.MAP_RAW_DATA_URL?.trim() ??
    (region === 'jp'
      ? 'https://airtable.com/app7SrMiNyaAyXB2L/shrRSvwCS5BGzuYYe'
      : '')
  const siteUrl =
    env.SITE_URL?.trim() ||
    (region === 'jp' ? 'https://aisafety-com-jp.vercel.app' : '')
  if (!siteUrl) throw new Error('SITE_URL is required for the Taiwan map')

  return {
    title: env.SITE_TITLE?.trim() || `${countryName} AI Safety Map`,
    mapTitle:
      env.MAP_TITLE?.trim() || `Map of AI Existential Safety in ${countryName}`,
    description:
      env.SITE_DESCRIPTION?.trim() ||
      `Explore organizations, research groups, and projects in ${countryName}'s AI safety ecosystem.`,
    url: httpUrl(siteUrl, 'SITE_URL'),
    // This describes the shared English UI; it does not translate its strings.
    language: 'en',
    notice:
      env.MAP_NOTICE?.trim() ??
      (region === 'tw'
        ? 'Draft map — initial entries are provisional and awaiting local review.'
        : ''),
    rawDataUrl: rawDataUrl ? httpUrl(rawDataUrl, 'MAP_RAW_DATA_URL') : null,
  }
}

export function getMapSourceConfig(env: Environment = process.env) {
  const region = country(env)
  const baseId = env.AIRTABLE_BASE_ID?.trim()
  if (region === 'tw' && (!baseId || baseId === JAPAN_BASE_ID)) {
    throw new Error('The Taiwan map requires its own AIRTABLE_BASE_ID')
  }
  if (region === 'tw' && !env.AIRTABLE_TOKEN?.trim()) {
    throw new Error('AIRTABLE_TOKEN is required for the Taiwan map')
  }

  // Preserve the existing JP deployment, but never borrow JP table/view IDs
  // when a different base or table has been selected.
  const useJapanDefaults =
    region === 'jp' && (!baseId || baseId === JAPAN_BASE_ID)
  const tableId =
    env.AIRTABLE_TABLE_ID?.trim() || (useJapanDefaults ? JAPAN_TABLE_ID : '')
  if (!tableId) {
    throw new Error('AIRTABLE_TABLE_ID is required for a separate map base')
  }
  const viewId =
    env.AIRTABLE_VIEW_ID?.trim() ??
    (useJapanDefaults && tableId === JAPAN_TABLE_ID ? JAPAN_VIEW_ID : '')

  return { tableId, viewId: viewId || undefined }
}
