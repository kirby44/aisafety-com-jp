// JP-fork static data adapter — replaces the upstream Airtable fetch with
// hand-curated JP organisations. Same shape as `./map`, so callers don't
// need to change beyond the import path.
//
// Coordinates target the v2 region layout (see AREA_LABELS in D3Map.tsx).
// To swap back to the upstream Airtable adapter, change the import in
// `src/app/map/page.tsx` from `'@/lib/data/jp-map'` to `'@/lib/data/map'`.

import type { MapData, MapOrg } from './map'

const JP_ORGS: MapOrg[] = [
  {
    id: 'jp-jaisi',
    title: 'Japan AI Safety Institute (J-AISI)',
    tooltipTitle: 'Japan AI Safety Institute',
    shortName: 'J-AISI',
    description:
      "Japan's national AI safety institute. Member of the AISI International Network alongside UK/US/Singapore counterparts. Co-led the multilingual safeguard track at the INAISI Joint Testing Exercise (Paris 2025).",
    category: 'Governance',
    status: 'Active',
    logo: '/images/jp/j-aisi.png',
    mapLogo: '/images/jp/j-aisi.png',
    link: 'https://aisi.go.jp/',
    shortUrl: null,
    x: 37,
    y: 8,
    scale: 'Large',
    isMagic: false,
  },
  {
    id: 'jp-noeon',
    title: 'Noeon Research',
    tooltipTitle: 'Noeon Research',
    shortName: 'Noeon',
    description:
      'Tokyo-based deep-tech research lab developing a novel AI architecture for general reasoning grounded in category theory and graph-based knowledge representation. Pursues AGI via interpretable, alignment-friendly foundations rather than black-box neural networks. Co-host of TAIS (Technical AI Safety) Tokyo.',
    category: 'Conceptual research',
    status: 'Active',
    logo: '/images/jp/noeon.svg',
    mapLogo: '/images/jp/noeon.svg',
    link: 'https://noeon.ai/',
    shortUrl: null,
    x: 48,
    y: 7,
    scale: 'Medium',
    isMagic: false,
  },
  {
    id: 'jp-ai-safety-tokyo',
    title: 'AI Safety Tokyo',
    tooltipTitle: 'AI Safety Tokyo',
    shortName: 'AI Safety Tokyo',
    description:
      'Tokyo-based AI safety community running regular benkyoukai (study group) events and reading groups.',
    category: 'Training and education',
    status: 'Active',
    logo: '/images/jp/ai-safety-tokyo.png',
    mapLogo: '/images/jp/ai-safety-tokyo.png',
    link: 'https://aisafety.tokyo/',
    shortUrl: null,
    x: 30,
    y: 17,
    scale: 'Medium',
    isMagic: false,
  },
  {
    id: 'jp-tara-tokyo',
    title: 'TARA Tokyo',
    tooltipTitle: 'TARA Tokyo',
    shortName: 'TARA',
    description:
      'Tokyo AI safety mentorship program. Weekly Saturday sessions pairing mentees with researchers.',
    category: 'Career support',
    status: 'Active',
    logo: '/images/jp/tara-tokyo.png',
    mapLogo: '/images/jp/tara-tokyo.png',
    link: 'https://www.taraprogram.org/',
    shortUrl: null,
    x: 24,
    y: 20,
    scale: 'Medium',
    isMagic: false,
  },
  {
    id: 'jp-align',
    title: 'AI Alignment Network (ALIGN)',
    tooltipTitle: 'AI Alignment Network',
    shortName: 'ALIGN',
    description:
      'Japan-based AI safety community. Outreach and community-building across the JP ecosystem. Sister to AI Safety Tokyo (benkyoukai) and TARA Tokyo (mentorship).',
    category: 'Advocacy',
    status: 'Active',
    logo: '/images/jp/align.webp',
    mapLogo: '/images/jp/align.webp',
    link: 'https://www.aialign.net/',
    shortUrl: null,
    x: 47,
    y: 13,
    scale: 'Medium',
    isMagic: false,
  },
  {
    id: 'jp-bioshok',
    title: 'bioshok',
    tooltipTitle: 'bioshok',
    shortName: 'bioshok',
    description:
      'Japanese-language AI safety writer covering alignment, governance, x-risk, and superintelligence. INODS Research Fellow. Active on note.com and hatenablog; @bioshok3 on X.',
    category: 'Blog',
    status: 'Active',
    logo: '/images/jp/bioshok.png',
    mapLogo: '/images/jp/bioshok.png',
    link: 'https://x.com/bioshok3?t=zveV31pS1Sy0jiBGisbKpA&s=09',
    shortUrl: null,
    x: 15,
    y: 20,
    scale: 'Medium',
    isMagic: false,
  },
  {
    id: 'jp-shiba-ai-lab',
    title: 'Shiba AI Lab',
    tooltipTitle: 'Shiba AI Lab',
    shortName: 'Shiba AI',
    description:
      'Tokyo-based research lab working at the intersection of computer vision and AI safety. Themes include evolutionary approaches to AI development, multi-agent coordination, and interpretable AI systems.',
    category: 'Empirical research',
    status: 'Active',
    logo: '/images/jp/shiba-ai-lab.png',
    mapLogo: '/images/jp/shiba-ai-lab.png',
    link: 'https://www.shiba-ai.jp/ai-safety',
    shortUrl: null,
    x: 52,
    y: 18,
    scale: 'Medium',
    isMagic: false,
  },
]

export async function getMapData(): Promise<MapData> {
  return {
    records: JP_ORGS,
    lastUpdated: '2026-05-04',
    suggestEntryLink: '#',
    suggestCorrectionLink: '#',
  }
}
