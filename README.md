# AI Safety Maps — Japan and Taiwan

Country-specific versions of [AISafety.com/map](https://aisafety.com/map), maintained in one repository. Each deployment has its own Airtable base, Vercel project, URL, and branding. Both currently use the shared English interface.

Japan: https://aisafety-com-jp.vercel.app/map

Taiwan draft: https://aisafety-com-tw.vercel.app/map (same Git repository and `main` branch).

Forked from [StampyAI/AISafety.com](https://github.com/StampyAI/AISafety.com) (MIT-licensed). Thanks to Bryce Robertson and the Stampy team for sharing the code.

## What's different from upstream

- Reads from a deployment-specific Airtable base (separate from upstream's). Base, table, and view are configured using environment variables. The existing Japan deployment keeps its table/view defaults.
- All non-`/map` pages stripped (this fork is just the map).
- Logo scale bumped to `LOGO_GLOBAL_SCALE = 3.0` since the JP map is sparse.
- `/` redirects to `/map`.
- "Suggest correction" CTA removed — corrections come through the same form as new listings.
- `Pending` status filter: form submissions land with `Status = Pending` and don't render on the map until reviewed and flipped to `Active`.

## Editing the map

Select the Airtable base for the country you are editing. Never add Taiwan records to the Japan base.

| Country | Airtable base                                                  | Orgs table          | Grid view           |
| ------- | -------------------------------------------------------------- | ------------------- | ------------------- |
| Japan   | [Japan AI Safety Map](https://airtable.com/app7SrMiNyaAyXB2L)  | `tblBBaYyXaEQ7vsqm` | `viwh7TofyxVBFq705` |
| Taiwan  | [Taiwan AI Safety Map](https://airtable.com/apptqJNEIFdHowQvd) | `tblOwwFlrkAlltVNR` | `viwKfJ0ZCyLieeHfQ` |

For Taiwan review, edit `Long name`, `Description`, `Category`, and `Link`, and use `Review notes` for questions. Mark `Review status = Verified` once checked. Leave `x`, `y`, and `Scale` to the map maintainer.

Taiwan contains five initial draft entries. `Review status`, `Source URL`, and `Review notes` are editor-only fields for local review; the website does not render them. `Status = Active` includes an organisation in the public draft, while `Pending` hides it. Do not infer local verification from `Active`. The Taiwan site displays a draft notice until `MAP_NOTICE` is explicitly cleared. No Taiwan public submission form or public raw-data share is configured yet; their buttons stay hidden.

The submission and public-share links below are **Japan only**.

Content lives in Airtable, not the codebase. To add or edit organisations:

The live page uses `src/lib/data/map.ts`. There is no local organisation-list
adapter; do not add one. Local logo files and generated attachment caches do
not define map entries.

1. Open the base: https://airtable.com/app7SrMiNyaAyXB2L
2. Edit the `Orgs` table directly, or approve pending submissions by setting `Status = Active`.
3. Wait up to 1 hour for the next ISR revalidation (it fires on the next page visit after the hour), or trigger a redeploy for instant updates.

Public submission form: https://airtable.com/app7SrMiNyaAyXB2L/pagzMWIQxAKKAyxU2/form

Public read-only share view: https://airtable.com/app7SrMiNyaAyXB2L/shrRSvwCS5BGzuYYe

## Data model

The `Orgs` table schema (must match exactly — fields are read by name in `src/lib/data/map.ts`):

| Field                 | Type             | Notes                                                     |
| --------------------- | ---------------- | --------------------------------------------------------- |
| `Long name`           | Single line text | Primary; used in tooltip                                  |
| `Long name for cards` | Single line text | Falls back to `Long name` if empty                        |
| `Short name`          | Single line text | Optional                                                  |
| `Description`         | Long text        | Required — rows without it are skipped                    |
| `Category`            | Multiple select  | 17 options; see `CATEGORY_ORDER` in `map.ts`              |
| `Category (text)`     | Single line text | Optional override for `Category`                          |
| `Status`              | Single select    | `Active` / `Inactive` / `Pending`                         |
| `Logo (for cards)`    | Attachment       | Single file                                               |
| `Logo (for map)`      | Attachment       | Single file                                               |
| `Link`                | URL              |                                                           |
| `Short URL`           | URL              | Optional                                                  |
| `Date added`          | Date             | Optional                                                  |
| `Active since`        | Date             | Optional; controls when an entity appears on the timeline |
| `x`                   | Number           | 0–100, % of map width                                     |
| `y`                   | Number           | 0–100, % of map height                                    |
| `Scale`               | Single select    | `Large` / `Medium` / `Small`                              |

Magic rows (use `Long name`):

- `Suggest entry` → its `Link` becomes the public submission CTA target.
- `Last updated` → its `Description` is shown as the freshness timestamp.

## Environment variables

Required in `.env.local` for local dev and on Vercel for build:

```
AIRTABLE_TOKEN=pat...                  # PAT scoped to the JP base
AIRTABLE_BASE_ID=app7SrMiNyaAyXB2L
```

For local API maintenance, an account token is available at `~/.config/airtable/credentials.env`; read it programmatically without printing it. Keep `.env.local` pointed to Japan unless deliberately testing Taiwan.

Generate the deployment PAT at https://airtable.com/create/tokens with scopes `data.records:read` (build-time fetch) and access limited to this base. For schema changes via API, also grant `schema.bases:read` and `schema.bases:write`.

### One repo, separate country deployments

Configuration is resolved on the server in `src/lib/site-config.ts`. Only display settings are passed to the browser; the Airtable token stays server-side.

| Variable            | Japan default                           | Taiwan setup                                                           |
| ------------------- | --------------------------------------- | ---------------------------------------------------------------------- |
| `MAP_COUNTRY`       | `jp`                                    | Set to `tw`                                                            |
| `AIRTABLE_TOKEN`    | Required                                | Token with read access to the Taiwan base                              |
| `AIRTABLE_BASE_ID`  | Required; existing JP base              | Required; must differ from Japan                                       |
| `AIRTABLE_TABLE_ID` | Existing JP table                       | Required; Taiwan `Orgs` table ID                                       |
| `AIRTABLE_VIEW_ID`  | Existing JP view                        | Optional; omitted/empty reads all rows in the table                    |
| `SITE_URL`          | `https://aisafety-com-jp.vercel.app`    | Required; actual Taiwan site URL                                       |
| `MAP_RAW_DATA_URL`  | Existing JP public share                | Optional Taiwan public read-only share; omitted/empty hides the button |
| `SITE_TITLE`        | `Japan AI Safety Map`                   | Defaults to `Taiwan AI Safety Map`                                     |
| `MAP_TITLE`         | `Map of AI Existential Safety in Japan` | Defaults to the Taiwan equivalent                                      |
| `SITE_DESCRIPTION`  | Japan description                       | Defaults to a Taiwan description                                       |
| `MAP_NOTICE`        | Empty                                   | Defaults to a draft/local-review notice; set empty after review        |

`SITE_TITLE`, `MAP_TITLE`, and `SITE_DESCRIPTION` can be overridden independently. Changing them does not translate the rest of the UI. Copy `.env.example` for local setup; never commit real tokens. Setting `MAP_RAW_DATA_URL` to an empty string also hides the Japan raw-data button.

To launch Taiwan:

1. Create a separate, empty Airtable base with the `Orgs` schema above, including `Active since`. Keep included organisations `Active` and new unreviewed submissions `Pending`. Taiwan additionally tracks local verification with `Review status`.
2. Create the Taiwan submission form with `Status = Pending`. Its URL belongs in the Taiwan base's `Suggest entry` row (`Long name`, nonempty `Description`, and `Link`). Without this row, the site hides the submission button instead of linking to an unavailable page. A public read-only share is optional.
3. Create a separate Vercel project and import **this same repository**, using the same root directory and production branch. Set the Taiwan environment values from the table for both Production and Preview. Vercel supports [multiple projects connected to one repository](https://vercel.com/docs/projects).
4. Deploy and verify `/map`: Taiwan title and entries, Taiwan submission/raw-data links, logo loading, filters, and timeline. Ensure Pending entries are absent. Environment-variable changes require a new deployment; Airtable content continues to refresh through ISR.

The existing `.vercel/project.json` local link points to **Japan**. Do not use an unqualified `vercel --prod` to launch Taiwan. Use the Taiwan project's Git deployment or a separate local checkout linked to that project. Both projects should track the same code branch, so fixes reach both maps without maintaining country-specific branches.

## Build-time behaviour

`getMapData()` runs server-side at build and again on ISR revalidation:

1. Fetches all records from the `Orgs` table view.
2. Rewrites every attachment URL to `/api/logo/<attachmentId>` (see below).
3. Sorts records by status → scale → category → title.

ISR revalidation runs at most once per hour (`next: { revalidate: 3600 }` in `src/lib/data/airtable.ts`), and only triggers when the page is requested. If no one visits, nothing refetches. To force an immediate refresh, push a commit or use a Vercel deploy hook.

### Logo proxy

Airtable attachment URLs are signed and expire after about two hours, so they can't be embedded in a page that is cached for an hour or more. Instead, `src/app/api/logo/[id]/route.ts` resolves an attachment ID to a fresh URL at request time and streams the image back with an immutable `Cache-Control` header. The Vercel CDN then serves it from cache; Airtable is only called on a cache miss. Replacing a logo in Airtable produces a new attachment ID, so the new image is picked up without any cache purge.

Nothing is written to disk at any point. An earlier version downloaded logos into `public/` during the request, which works at build time but crashes on Vercel's read-only function filesystem and silently froze the page at its last successful build.

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
npm run build        # Production build (fetches Airtable)
npm run lint         # Run linting
npm run format       # Format code
npm run type-check   # Type check
npm test             # Country configuration and base-isolation regression checks
```

## License

MIT — see [LICENSE](./LICENSE).

Original work © 2026 StampyAI. JP fork modifications by Kazuki Kimura.
