import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

// Compile the pure configuration module in memory to support the repo's Node 20
// baseline without adding a TypeScript test runner or touching build output.
const source = readFileSync(
  new URL('../src/lib/site-config.ts', import.meta.url),
  'utf8'
)
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
})
const { getSiteConfig, getMapSourceConfig } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
)

const japan = { AIRTABLE_BASE_ID: 'app7SrMiNyaAyXB2L' }
const taiwan = {
  MAP_COUNTRY: 'tw',
  AIRTABLE_BASE_ID: 'appTaiwanTest',
  AIRTABLE_TOKEN: 'test-only-placeholder',
  AIRTABLE_TABLE_ID: 'tblTaiwanTest',
  SITE_URL: 'https://taiwan.example.org',
}

test('existing Japan environment retains its source and visible map title', () => {
  assert.deepEqual(getMapSourceConfig(japan), {
    tableId: 'tblBBaYyXaEQ7vsqm',
    viewId: 'viwh7TofyxVBFq705',
  })
  const site = getSiteConfig(japan)
  assert.equal(site.mapTitle, 'Map of AI Existential Safety in Japan')
  assert.equal(site.url, 'https://aisafety-com-jp.vercel.app/')
  assert.equal(site.notice, '')
  assert.equal(
    site.rawDataUrl,
    'https://airtable.com/app7SrMiNyaAyXB2L/shrRSvwCS5BGzuYYe'
  )
})

test('Taiwan resolves independently without any Japan presentation links', () => {
  assert.deepEqual(getMapSourceConfig(taiwan), {
    tableId: 'tblTaiwanTest',
    viewId: undefined,
  })
  const site = getSiteConfig(taiwan)
  assert.equal(site.title, 'Taiwan AI Safety Map')
  assert.equal(site.mapTitle, 'Map of AI Existential Safety in Taiwan')
  assert.equal(site.url, 'https://taiwan.example.org/')
  assert.equal(site.rawDataUrl, null)
  assert.match(site.notice, /Draft map/)
  assert.doesNotMatch(JSON.stringify(site), /Japan|app7SrMiNyaAyXB2L/)
})

test('Taiwan refuses a missing or accidentally inherited Japan base', () => {
  assert.throws(
    () => getMapSourceConfig({ ...taiwan, AIRTABLE_TOKEN: undefined }),
    /AIRTABLE_TOKEN is required/
  )
  for (const baseId of [undefined, '', japan.AIRTABLE_BASE_ID]) {
    assert.throws(
      () => getMapSourceConfig({ ...taiwan, AIRTABLE_BASE_ID: baseId }),
      /requires its own AIRTABLE_BASE_ID/
    )
  }
  assert.throws(
    () => getMapSourceConfig({ ...taiwan, AIRTABLE_TABLE_ID: undefined }),
    /AIRTABLE_TABLE_ID is required/
  )
  assert.throws(
    () => getSiteConfig({ ...taiwan, SITE_URL: undefined }),
    /SITE_URL is required/
  )
})

test('changing a base or table never inherits the Japan view', () => {
  assert.throws(
    () => getMapSourceConfig({ AIRTABLE_BASE_ID: 'appDifferentBase' }),
    /AIRTABLE_TABLE_ID is required/
  )
  assert.equal(
    getMapSourceConfig({ ...japan, AIRTABLE_TABLE_ID: 'tblDifferentTable' })
      .viewId,
    undefined
  )
  assert.equal(
    getMapSourceConfig({ ...japan, AIRTABLE_VIEW_ID: '' }).viewId,
    undefined
  )
})

test('deployment overrides control presentation and view selection', () => {
  const env = {
    ...taiwan,
    AIRTABLE_VIEW_ID: 'viwTaiwanTest',
    SITE_TITLE: 'Custom map',
    MAP_TITLE: 'Custom heading',
    SITE_DESCRIPTION: 'Custom description',
    MAP_RAW_DATA_URL: 'https://airtable.com/appTaiwanTest/shrTest',
  }
  assert.equal(getMapSourceConfig(env).viewId, 'viwTaiwanTest')
  const site = getSiteConfig(env)
  assert.equal(site.title, 'Custom map')
  assert.equal(site.mapTitle, 'Custom heading')
  assert.equal(site.description, 'Custom description')
  assert.equal(site.rawDataUrl, env.MAP_RAW_DATA_URL)
  assert.equal(getSiteConfig({ ...taiwan, MAP_NOTICE: '' }).notice, '')
  assert.equal(
    getSiteConfig({ ...japan, MAP_RAW_DATA_URL: '' }).rawDataUrl,
    null
  )
})

test('invalid countries and unsafe public URLs fail explicitly', () => {
  assert.throws(() => getSiteConfig({ MAP_COUNTRY: 'typo' }), /MAP_COUNTRY/)
  assert.throws(
    () => getMapSourceConfig({ MAP_COUNTRY: 'typo' }),
    /MAP_COUNTRY/
  )
  assert.throws(
    () => getSiteConfig({ ...taiwan, SITE_URL: 'javascript:alert(1)' }),
    /HTTP\(S\)/
  )
  assert.throws(
    () => getSiteConfig({ ...taiwan, MAP_RAW_DATA_URL: 'javascript:alert(1)' }),
    /HTTP\(S\)/
  )
})
