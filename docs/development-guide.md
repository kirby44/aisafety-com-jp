# Development Guide

## Quick Start

```bash
# 1. Install dependencies
nvm use          # Load correct Node version
npm install

# 2. Set up environment
cp .env.example .env.local  # Then add your Airtable credentials

# 3. Run development server
npm run dev

# 4. Open http://localhost:3000
```

## Environment Variables

Create `.env.local` with:

```
AIRTABLE_TOKEN=your_personal_access_token
AIRTABLE_BASE_ID=your_base_id
```

Get these from [airtable.com/account](https://airtable.com/account).

## Available Commands

| Command              | What it does                 |
| -------------------- | ---------------------------- |
| `npm run dev`        | Start development server     |
| `npm run build`      | Build for production         |
| `npm run start`      | Run production build locally |
| `npm run lint`       | Check for code issues        |
| `npm run lint:fix`   | Auto-fix lint issues         |
| `npm run format`     | Format code with Prettier    |
| `npm run type-check` | Check TypeScript types       |

## Code Quality

Pre-commit hooks (via Husky) automatically run:

- ESLint (catches errors)
- Prettier (formats code)

If a commit fails, fix the issues and try again.

## Adding a New Page

1. Create folder in `src/app/`:

   ```
   src/app/communities/
   └── page.tsx
   ```

2. Export a default component:

   ```tsx
   export default function CommunitiesPage() {
     return (
       <div className="container-default">
         <h1>Communities</h1>
         {/* Your content */}
       </div>
     )
   }
   ```

3. Page is automatically available at `/communities`

## Adding a New Component

1. Create file in `src/components/`:

   ```
   src/components/Card.tsx
   ```

2. Use existing patterns:

   ```tsx
   interface CardProps {
     title: string
     description: string
     href: string
   }

   export default function Card({ title, description, href }: CardProps) {
     return (
       <a href={href} className="card">
         <h3 className="padding-8px">{title}</h3>
         <p className="color-teal-400">{description}</p>
       </a>
     )
   }
   ```

3. Import where needed:
   ```tsx
   import Card from '@/components/Card'
   ```

## Styling Guidelines

### Use Existing Utility Classes

```tsx
// Good - uses design system
<div className="padding-24px">
<p className="paragraph-small color-teal-300">

// Bad - arbitrary values
<div style={{ paddingBottom: '14px' }}>
```

### Available Spacing Classes

```
padding-4px, padding-8px, padding-12px, padding-16px,
padding-24px, padding-32px, padding-40px, padding-56px,
padding-80px, padding-104px
```

### Color Classes

```
color-teal-300, color-teal-400  (text colors)
--teal-100 to --teal-900        (CSS variables)
--bright-teal-300, --bright-teal-500 (accents)
```

### Adding New Styles

Add to `src/app/globals.css`. Group with related styles and add a comment:

```css
/* ===============================
   New Feature Styles
   =============================== */
.my-new-class {
  /* styles */
}
```

## Working with Airtable Data

### Fetching in a Page (Server Component)

```tsx
async function getData() {
  const res = await fetch('http://localhost:3000/api/map', {
    next: { revalidate: 300 },
  })
  return res.json()
}

export default async function MyPage() {
  const data = await getData()
  return <div>{/* use data */}</div>
}
```

### Fetching in a Client Component

```tsx
'use client'
import { useEffect, useState } from 'react'

export default function MyComponent() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/map')
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return <div>Loading...</div>
  return <div>{/* use data */}</div>
}
```

## Troubleshooting

### "Module not found" errors

```bash
rm -rf node_modules
npm install
```

### Airtable API errors

- Check `.env.local` has correct credentials
- Verify token hasn't expired
- Check Airtable base permissions

### Styles not applying

- Check class name spelling
- Look in `globals.css` for the class definition
- Clear browser cache / hard refresh

### TypeScript errors

```bash
npm run type-check
```

Fix reported issues before committing.
