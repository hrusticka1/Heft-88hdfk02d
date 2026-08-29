#!/usr/bin/env node
/**
 * One-time migration: updates exercises table to use WorkoutX data.
 * - Verifies each exercise ID exists in WorkoutX
 * - Updates gif_url, body_part, target, secondary_muscles, equipment
 * - Reports any exercises that couldn't be matched (need manual handling)
 *
 * Run: node scripts/migrate-supabase.mjs
 * Requires: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// Load .env manually (no dotenv dependency needed)
const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const envVars = Object.fromEntries(
  env.split('\n')
    .filter(l => l.includes('='))
    .map(l => l.split('=').map(s => s.trim()))
)

const supabaseUrl = envVars.VITE_SUPABASE_URL
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const workoutxExercises = JSON.parse(
  readFileSync(new URL('../src/data/exercises.json', import.meta.url), 'utf8')
)
const workoutxById = new Map(workoutxExercises.map(e => [e.id, e]))

async function main() {
  const { data: rows, error } = await supabase.from('exercises').select('*')
  if (error) { console.error('Failed to fetch exercises:', error.message); process.exit(1) }

  console.log(`Found ${rows.length} exercises in Supabase\n`)

  const matched = []
  const unmatched = []

  for (const row of rows) {
    const wx = workoutxById.get(row.id)
    if (wx) {
      matched.push({ row, wx })
    } else {
      unmatched.push(row)
    }
  }

  if (unmatched.length > 0) {
    console.log('⚠️  Could not match these exercises by ID (need manual handling):')
    unmatched.forEach(r => console.log(`  - ${r.id}: ${r.name}`))
    console.log('')
  }

  console.log(`Updating ${matched.length} matched exercises...`)
  for (const { row, wx } of matched) {
    const { error: updateError } = await supabase
      .from('exercises')
      .update({
        name: wx.name,
        body_part: wx.bodyPart,
        target: wx.target,
        secondary_muscles: wx.secondaryMuscles,
        equipment: wx.equipment,
        gif_url: wx.gifUrl,
      })
      .eq('id', row.id)

    if (updateError) {
      console.error(`  ❌ Failed to update ${row.id} (${row.name}): ${updateError.message}`)
    } else {
      console.log(`  ✓ ${row.id}: ${wx.name}`)
    }
  }

  console.log('\nMigration complete.')
  if (unmatched.length > 0) {
    console.log(`⚠️  ${unmatched.length} exercise(s) not updated — IDs not found in WorkoutX database.`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
