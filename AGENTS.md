# Map content

The Japan and Taiwan AI Safety Maps share this repository and use separate
Airtable bases as their sources of truth. `MAP_COUNTRY` selects the deployment;
Japan is the default. Presentation and table/view settings live in
`src/lib/site-config.ts`.
`src/app/map/page.tsx` loads records through `src/lib/data/map.ts`.

For requests to add, remove, move, or edit map organisations, update the
requested country's Airtable base and verify the result on its live map.
Never put Taiwan organisations in the JP base. See the README's
"Editing the map" section for the base, schema, and refresh process.
Do not create a local organisation list or static data adapter.

The local `.vercel/project.json` link points to Japan. Use a separate Vercel
project connected to the same Git repo for Taiwan; do not relink this checkout
or deploy Taiwan configuration to Japan's project.

Read API credentials from `.env.local` without printing or committing them.
Files under `public/images/airtable-cache` are generated attachment assets,
not the source of map content.
