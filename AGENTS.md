# Map content

The live Japan AI Safety Map uses Airtable as its source of truth.
`src/app/map/page.tsx` loads records through `src/lib/data/map.ts`.

For requests to add, remove, move, or edit map organisations, update the
JP Airtable base and verify the result on the live map. See the README's
"Editing the map" section for the base, schema, and refresh process.
Do not create a local organisation list or static data adapter.

Read API credentials from `.env.local` without printing or committing them.
Files under `public/images/airtable-cache` are generated attachment assets,
not the source of map content.
