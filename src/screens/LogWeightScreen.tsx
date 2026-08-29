import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { getExercise, getLogEntries, saveLogEntry } from '../data/storage'
import { getExerciseById } from '../lib/exercises'
import { formatEquipmentLabel, toTitleCase } from '../lib/format'
import type { Exercise } from '../types'
import styles from './LogWeightScreen.module.css'

export default function LogWeightScreen() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { returnTo, category } = (location.state as { returnTo?: string; category?: string } | null) ?? {}
  const inputRef = useRef<HTMLInputElement>(null)

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [weight, setWeight] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !id) return
    void load()
  }, [user, id])

  // Focus input (and open keyboard) once data is ready
  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus()
    }
  }, [loading])

  async function load() {
    if (!user || !id) return
    setLoading(true)

    let ex = await getExercise(id)
    if (!ex) ex = await getExerciseById(id)
    if (!ex) {
      navigate('/', { replace: true })
      return
    }
    setExercise(ex)

    const prior = await getLogEntries(id, user.id)
    if (prior.length > 0) setWeight(String(prior[0].weight))

    setLoading(false)
  }

  function handleDecrement() {
    const current = parseFloat(weight) || 0
    const next = Math.max(0, Math.round((current - 1) * 10) / 10)
    setWeight(String(next))
    inputRef.current?.focus()
  }

  function handleIncrement() {
    const current = parseFloat(weight) || 0
    const next = Math.round((current + 1) * 10) / 10
    setWeight(String(next))
    inputRef.current?.focus()
  }

  async function handleSave() {
    if (!user || !exercise || !id) return
    const w = parseFloat(weight)
    if (isNaN(w) || w <= 0) return

    setSaving(true)
    try {
      const prior = await getLogEntries(id, user.id)
      const isPR = prior.length === 0 || w > Math.max(...prior.map((e) => e.weight))

      await saveLogEntry({
        userId: user.id,
        exerciseId: id,
        weight: w,
        isPR,
        loggedAt: new Date().toISOString(),
      })

      if (returnTo) {
        navigate(returnTo, { replace: true, state: { category } })
      } else {
        navigate(`/exercise/${id}`, { replace: true })
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading || !exercise) return null

  const canSave = !saving && parseFloat(weight) > 0

  return (
    <div className={styles.screen}>
      <div className={styles.navBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Back">
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path d="M9 1L1 9l8 8" stroke="#3e3ee0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          className={styles.saveBtn}
          onClick={() => void handleSave()}
          disabled={!canSave}
        >
          Save
        </button>
      </div>

      <div className={styles.content}>
        <h1 className={styles.exerciseName}>{toTitleCase(exercise.name)}</h1>
        <p className={styles.equipmentLabel}>{formatEquipmentLabel(exercise.equipment)}</p>

        <div className={styles.inputRow}>
          <button className={styles.stepper} onClick={handleDecrement} aria-label="Decrease by 1 kg">
            <svg width="24" height="4" viewBox="0 0 24 4" fill="none">
              <rect x="0" y="0" width="24" height="4" rx="2" fill="currentColor" />
            </svg>
          </button>

          <div className={styles.inputWrapper}>
            <input
              ref={inputRef}
              className={styles.weightInput}
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="0"
              step="0.5"
            />
            <span className={styles.unit}>kg</span>
          </div>

          <button className={styles.stepper} onClick={handleIncrement} aria-label="Increase by 1 kg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="10" y="0" width="4" height="24" rx="2" fill="currentColor" />
              <rect x="0" y="10" width="24" height="4" rx="2" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
