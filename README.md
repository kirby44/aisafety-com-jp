# AISafety.com — JP fork

A Japanese version of [AISafety.com/map](https://aisafety.com/map), focused on the Japan AI safety ecosystem.

Live: https://aisafety-com-jp.vercel.app/map

Forked from [StampyAI/AISafety.com](https://github.com/StampyAI/AISafety.com) (MIT-licensed). Thanks to Bryce Robertson and the Stampy team for sharing the code.

## What's different from upstream

- Reads from a JP-owned Airtable base (separate from upstream's). Base ID lives in `AIRTABLE_BASE_ID`; table/view IDs are hardcoded in `src/lib/data/map.ts`.
- All non-`/map` pages stripped (this fork is just the map).
- Logo scale bumped to `LOGO_GLOBAL_SCALE = 3.0` since the JP map is sparse.
- `/` redirects to `/map`.
- "Suggest correction" CTA removed — corrections come through the same form as new listings.
- `Pending` status filter: form submissions land with `Status = Pending` and don't render on the map until reviewed and flipped to `Active`.

## Editing the map

Content lives in Airtable, not the codebase. To add or edit organisations:

1. Open the base: https://airtable.com/app7SrMiNyaAyXB2L
2. Edit the `Orgs` table directly, or approve pending submissions by setting `Status = Active`.
3. Wait up to 1 hour for the next ISR revalidation, or trigger a redeploy for instant updates.

Public submission form: https://airtable.com/app7SrMiNyaAyXB2L/pagzMWIQxAKKAyxU2/form

Public read-only share view: https://airtable.com/app7SrMiNyaAyXB2L/shrRSvwCS5BGzuYYe

## Data model

The `Orgs` table schema (must match exactly — fields are read by name in `src/lib/data/map.ts`):

| Field                 | Type             | Notes                                        |
| --------------------- | ---------------- | -------------------------------------------- |
| `Long name`           | Single line text | Primary; used in tooltip                     |
| `Long name for cards` | Single line text | Falls back to `Long name` if empty           |
| `Short name`          | Single line text | Optional                                     |
| `Description`         | Long text        | Required — rows without it are skipped       |
| `Category`            | Multiple select  | 17 options; see `CATEGORY_ORDER` in `map.ts` |
| `Category (text)`     | Single line text | Optional override for `Category`             |
| `Status`              | Single select    | `Active` / `Inactive` / `Pending`            |
| `Logo (for cards)`    | Attachment       | Single file                                  |
| `Logo (for map)`      | Attachment       | Single file                                  |
| `Link`                | URL              |                                              |
| `Short URL`           | URL              | Optional                                     |
| `Date added`          | Date             | Optional                                     |
| `x`                   | Number           | 0–100, % of map width                        |
| `y`                   | Number           | 0–100, % of map height                       |
| `Scale`               | Single select    | `Large` / `Medium` / `Small`                 |

Magic rows (use `Long name`):

- `Suggest entry` → its `Link` becomes the public submission CTA target.
- `Last updated` → its `Description` is shown as the freshness timestamp.

## Environment variables

Required in `.env.local` for local dev and on Vercel for build:

```
AIRTABLE_TOKEN=pat...                  # PAT scoped to the JP base
AIRTABLE_BASE_ID=app7SrMiNyaAyXB2L
```

Generate the PAT at https://airtable.com/create/tokens with scopes `data.records:read` (build-time fetch) and access limited to this base. For schema changes via API, also grant `schema.bases:read` and `schema.bases:write`.

## Build-time behaviour

`getMapData()` runs server-side at build and again on ISR revalidation:

1. Fetches all records from the `Orgs` table view.
2. Downloads every attachment to `public/images/airtable-cache/<attachmentId>.<ext>` (cache key is the Airtable attachment ID, so cache busts when a logo is replaced).
3. Sorts records by status → scale → category → title.

ISR revalidation runs at most once per hour (`next: { revalidate: 3600 }` in `src/lib/data/airtable.ts`), and only triggers when the page is requested. If no one visits, nothing refetches. To force an immediate refresh, push a commit or use a Vercel deploy hook.

## Getting Started

```bash
nvm use
npm install
npm run dev
```

`.env.local` must contain `AIRTABLE_TOKEN` and `AIRTABLE_BASE_ID` (see above).

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build (fetches Airtable + downloads logos)
npm run lint         # Run linting
npm run format       # Format code
npm run type-check   # Type check
```

## License

MIT — see [LICENSE](./LICENSE).

Original work © 2026 StampyAI. JP fork modifications by Kazuki Kimura.
