# AISafety.com — JP fork

A Japanese version of [AISafety.com/map](https://aisafety.com/map), focused on the Japan AI safety ecosystem.

Live: https://aisafety-com-jp.vercel.app/map

Forked from [StampyAI/AISafety.com](https://github.com/StampyAI/AISafety.com) (MIT-licensed). Thanks to Bryce Robertson and the Stampy team for sharing the code.

## What's different from upstream

- Static JP organisations data in `src/lib/data/jp-map.ts` (replaces upstream's Airtable fetch)
- All non-`/map` pages stripped (this fork is just the map)
- Logo scale bumped to `LOGO_GLOBAL_SCALE = 3.0` since the JP map is sparse
- `/` redirects to `/map`

To swap back to the upstream Airtable adapter, change the import in `src/app/map/page.tsx` from `'@/lib/data/jp-map'` to `'@/lib/data/map'` and provide `AIRTABLE_TOKEN` + `AIRTABLE_BASE_ID`.

## Getting Started

```bash
nvm use
npm install
npm run dev
```

No `.env.local` needed — the JP fork uses static data.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run linting
npm run format       # Format code
npm run type-check   # Type check
```

## License

MIT — see [LICENSE](./LICENSE).

Original work © 2026 StampyAI. JP fork modifications by Kazuki Kimura.
