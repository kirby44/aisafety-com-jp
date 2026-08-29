'use client'

import { usePathname } from 'next/navigation'
import Navigation from './Navigation'
import Footer from './Footer'

// Routes that render without Navigation/Footer (e.g. poster-map is for printing)
const standaloneRoutes = ['/poster-map']

// Routes where the nav shrinks on mobile to leave more room for the content
const compactNavRoutes = ['/map']

export default function LayoutShell({
  children,
  counts,
}: {
  children: React.ReactNode
  counts: Partial<Record<string, number>>
}) {
  const pathname = usePathname()
  const isStandalone = standaloneRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (isStandalone) {
    return <>{children}</>
  }

  return (
    <>
      <Navigation
        counts={counts}
        compact={compactNavRoutes.includes(pathname)}
      />
      {children}
      <Footer />
    </>
  )
}
