#!/usr/bin/env node
/**
 * One-time script to download all WorkoutX exercises and bundle them as JSON.
 * Run: node scripts/download-exercises.mjs <YOUR_WORKOUTX_API_KEY>
 * Output: src/data/exercises.json
 */

import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const API_KEY = process.argv[2]
if (!API_KEY) {
  console.error('Usage: node scripts/download-exercises.mjs <YOUR_WORKOUTX_API_KEY>')
  process.exit(1)
}

const BASE = 'https://api.workoutxapp.com/v1'
const LIMIT = 10
const DELAY_MS = 2500 // 2.5s between requests = ~24/min, safely under 30/min limit

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchPage(offset) {
  const url = `${BASE}/exercises?limit=${LIMIT}&offset=${offset}`
  while (true) {
    const res = await fetch(url, { headers: { 'X-WorkoutX-Key': API_KEY } })
    if (res.status === 429) {
      const body = await res.json().catch(() => ({}))
      const retryAfter = (body.retryAfter ? Math.ceil((new Date(body.retryAfter) - Date.now()) / 1000) : 60) + 2
      console.log(` rate limited — waiting ${retryAfter}s...`)
      await sleep(retryAfter * 1000)
      continue
    }
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`HTTP ${res.status}: ${body}`)
    }
    return res.json()
  }
}

async function main() {
  const startOffset = parseInt(process.argv[3] ?? '0', 10)
  console.log(`Starting download from offset ${startOffset}...`)
  const all = []
  let offset = startOffset
  let total = null

  while (true) {
    process.stdout.write(`Fetching offset ${offset}${total ? ` / ${total}` : ''}...`)
    const { data, total: t } = await fetchPage(offset)

    if (total === null) total = t
    if (!data || data.length === 0) break

    all.push(...data)
    console.log(` got ${data.length} (total so far: ${all.length})`)

    if (all.length >= total) break
    offset += LIMIT
    await sleep(DELAY_MS)
  }

  // Normalize to only the fields Heft needs
  const exercises = all.map(e => ({
    id: e.id,
    name: e.name,
    bodyPart: e.bodyPart,
    target: e.target,
    secondaryMuscles: e.secondaryMuscles ?? [],
    equipment: e.equipment,
    gifUrl: `https://api.workoutxapp.com/v1/gifs/${e.id}.gif`,
  }))

  const filename = startOffset > 0 ? `exercises-from-${startOffset}.json` : 'exercises.json'
  const out = join(__dirname, `../src/data/${filename}`)
  writeFileSync(out, JSON.stringify(exercises, null, 2), 'utf8')
  console.log(`\nDone. ${exercises.length} exercises saved to src/data/${filename}`)
  console.log(`Requests used: ~${Math.ceil(exercises.length / LIMIT)}`)
}

main().catch(e => { console.error(e); process.exit(1) })
