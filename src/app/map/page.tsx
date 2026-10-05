import MapClient from './MapClient'
import { getMapData } from '@/lib/data/map'
import { getSiteConfig } from '@/lib/site-config'

export default async function MapPage() {
  const { records, lastUpdated, suggestEntryLink } = await getMapData()
  const site = getSiteConfig()

  return (
    <MapClient
      orgs={records}
      lastUpdated={lastUpdated}
      suggestEntryLink={suggestEntryLink}
      mapTitle={site.mapTitle}
      rawDataUrl={site.rawDataUrl}
      notice={site.notice}
    />
  )
}
