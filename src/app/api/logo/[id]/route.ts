import { isAttachmentId } from '@/lib/data/airtable'
import { findMapLogoAttachment } from '@/lib/data/map'

// Serves an Airtable attachment by ID. Airtable's own attachment URLs are
// signed and expire after ~2 hours, so the map page links here instead and
// this route fetches a fresh URL when needed. Attachment content never
// changes for a given ID, so the CDN may cache the bytes indefinitely.
const IMMUTABLE_CACHE = 'public, max-age=31536000, s-maxage=31536000, immutable'
const NO_CACHE = 'no-store'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!isAttachmentId(id)) {
    return new Response('Invalid attachment id', {
      status: 400,
      headers: { 'Cache-Control': NO_CACHE },
    })
  }

  // First pass uses the cached table lookup. If the attachment is unknown
  // (record added since the lookup was cached) or its URL has expired, redo
  // the lookup bypassing the cache and try once more.
  let attachment = await findMapLogoAttachment(id)
  let upstream = attachment ? await fetch(attachment.url) : null

  if (!upstream || !upstream.ok) {
    attachment = await findMapLogoAttachment(id, { fresh: true })
    if (!attachment) {
      return new Response('Attachment not found', {
        status: 404,
        headers: { 'Cache-Control': NO_CACHE },
      })
    }
    upstream = await fetch(attachment.url)
    if (!upstream.ok) {
      throw new Error(
        `Airtable attachment ${id} (${attachment.filename}) fetch failed with status ${upstream.status}`
      )
    }
  }

  const contentType =
    upstream.headers.get('content-type') ?? attachment?.type ?? null
  if (!contentType) {
    throw new Error(`Airtable attachment ${id} has no content type`)
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': IMMUTABLE_CACHE,
    },
  })
}
