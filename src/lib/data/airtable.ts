export interface AirtableRawRecord {
  id: string
  fields: Record<string, unknown>
}

export interface AirtableAttachment {
  id: string
  url: string
  filename: string
  type?: string
}

interface FetchOptions {
  tableId: string
  viewId?: string
  filterByFormula?: string
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>
  fields?: string[]
  // Seconds to keep the API response in Next's data cache. Pass 0 to bypass
  // the cache entirely (used when a cached attachment URL turns out to have
  // expired and we need a freshly signed one).
  revalidate?: number
}

const DEFAULT_REVALIDATE_SECONDS = 3600
const MAX_ATTEMPTS = 4
const RETRY_BASE_DELAY_MS = 1000
const ATTACHMENT_ID_PATTERN = /^att[A-Za-z0-9]{14}$/

// Attachment URLs returned by the Airtable API are signed and expire after
// roughly two hours, so they can't be embedded in a page that lives for an
// hour or more. Instead the page links to this route, which resolves the
// attachment ID to a fresh URL on demand. The response is cached immutably
// at the CDN because an attachment ID never changes content — replacing a
// logo in Airtable produces a new ID.
export function logoProxyUrl(attachmentId: string): string {
  if (!isAttachmentId(attachmentId)) {
    throw new Error(`Invalid Airtable attachment id: "${attachmentId}"`)
  }
  return `/api/logo/${attachmentId}`
}

export function isAttachmentId(value: string): boolean {
  return ATTACHMENT_ID_PATTERN.test(value)
}

export function isAttachmentArray(
  value: unknown
): value is AirtableAttachment[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'object' &&
    value[0] !== null &&
    'url' in value[0] &&
    'filename' in value[0]
  )
}

function rewriteAttachmentUrls(records: AirtableRawRecord[]): void {
  for (const record of records) {
    for (const value of Object.values(record.fields)) {
      if (!isAttachmentArray(value)) continue
      value[0] = { ...value[0], url: logoProxyUrl(value[0].id) }
    }
  }
}

function retryDelayMs(response: Response, attempt: number): number {
  const retryAfter = response.headers.get('retry-after')
  if (retryAfter) {
    const seconds = Number(retryAfter)
    if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000
  }
  return RETRY_BASE_DELAY_MS * Math.pow(2, attempt)
}

async function fetchAirtablePage(
  url: string,
  token: string,
  revalidate: number
): Promise<Response> {
  const cacheOptions: RequestInit =
    revalidate === 0 ? { cache: 'no-store' } : { next: { revalidate } }

  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      ...cacheOptions,
    })
    if (response.ok) return response

    // Airtable allows 5 requests/second per base and answers 429 above that.
    // A cold CDN can fan out one logo lookup per image, so back off and retry
    // rather than failing the whole request on the first collision.
    if (attempt + 1 >= MAX_ATTEMPTS) {
      throw new Error(
        `Airtable API error after ${MAX_ATTEMPTS} attempts: ${response.status}`
      )
    }
    const delay = retryDelayMs(response, attempt)
    console.warn(
      `Airtable API error (${response.status}), retrying in ${delay}ms... (attempt ${attempt + 1}/${MAX_ATTEMPTS})`
    )
    await new Promise(r => setTimeout(r, delay))
  }
}

// Fetches records as returned by Airtable, attachment URLs untouched. Only
// the logo proxy route should need this; page code should call
// `fetchAirtableRecords` so it never embeds an expiring URL.
export async function fetchAirtableRecordsRaw(
  options: FetchOptions
): Promise<AirtableRawRecord[]> {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID

  if (!token || !baseId) {
    console.error('Airtable credentials not configured')
    return []
  }

  const revalidate = options.revalidate ?? DEFAULT_REVALIDATE_SECONDS
  const allRecords: AirtableRawRecord[] = []
  let offset: string | null = null

  do {
    const url = new URL(
      `https://api.airtable.com/v0/${baseId}/${options.tableId}`
    )
    if (options.viewId) {
      url.searchParams.set('view', options.viewId)
    }
    if (options.filterByFormula) {
      url.searchParams.set('filterByFormula', options.filterByFormula)
    }
    if (options.sort) {
      options.sort.forEach((s, i) => {
        url.searchParams.set(`sort[${i}][field]`, s.field)
        url.searchParams.set(`sort[${i}][direction]`, s.direction)
      })
    }
    if (options.fields) {
      options.fields.forEach(f => url.searchParams.append('fields[]', f))
    }
    if (offset) {
      url.searchParams.set('offset', offset)
    }

    const response = await fetchAirtablePage(url.toString(), token, revalidate)
    const data = await response.json()
    allRecords.push(...(data.records as AirtableRawRecord[]))
    offset = data.offset || null
  } while (offset)

  return allRecords
}

export async function fetchAirtableRecords(
  options: FetchOptions
): Promise<AirtableRawRecord[]> {
  const records = await fetchAirtableRecordsRaw(options)
  rewriteAttachmentUrls(records)
  return records
}
