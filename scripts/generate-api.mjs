#!/usr/bin/env node
/**
 * Génère le client TypeScript typé depuis le spec OpenAPI live du backend SIM.
 *
 * Usage : npm run api:gen
 *
 * 1. Télécharge le spec depuis /docs-json (fetch natif Node).
 * 2. Écrit un snapshot local `scripts/openapi.latest.json` (gitignoré) pour
 *    reproductibilité et débogage.
 * 3. Génère `src/core/api/generated/schema.ts` (commité, jamais édité à la
 *    main) via l'API Node de `openapi-typescript`.
 *
 * Comportement : toute erreur réseau échoue explicitement (pas de sortie
 * silencieuse), pour ne jamais produire un client partiel non signalé.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import openapiTS, { astToString } from 'openapi-typescript'

const SPEC_URL =
  process.env.OPENAPI_URL ?? 'https://dev.sim.strife-cyber.org/docs-json'

const here = fileURLToPath(new URL('.', import.meta.url))
const snapshotPath = resolve(here, 'openapi.latest.json')
const outputPath = resolve(here, '../src/core/api/generated/schema.ts')

async function main() {
  console.log(`[api:gen] Récupération du spec OpenAPI : ${SPEC_URL}`)
  const response = await fetch(SPEC_URL, {
    headers: { accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error(
      `[api:gen] Échec HTTP ${response.status} ${response.statusText} sur ${SPEC_URL}`,
    )
  }

  const schema = await response.json()

  await writeFile(snapshotPath, JSON.stringify(schema, null, 2), 'utf8')
  console.log(`[api:gen] Snapshot écrit : ${snapshotPath}`)

  console.log('[api:gen] Génération du client TypeScript…')
  // La spec n'expose ni schémas de réponse ni types brandés : on garde les
  // valeurs telles quelles (bigint/money/date transportées en string par le
  // backend). Les types de réponse manquants sont typés à la main dans
  // `src/core/api/types.ts` (source : prompt-adapted.md / backend réel).
  const nodes = await openapiTS(schema)
  const output = astToString(nodes)

  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, output, 'utf8')
  console.log(`[api:gen] Client généré : ${outputPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
