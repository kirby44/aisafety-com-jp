import { getMapData } from './map'

export async function fetchAllCounts(): Promise<
  Partial<Record<string, number>>
> {
  const { records } = await getMapData()
  return { '/map': records.filter(r => !r.isMagic).length }
}
