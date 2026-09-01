import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { getExercise, getLogEntries, deleteLogEntry, saveExercise } from '../data/storage'
import { getExerciseById } from '../lib/exercises'
import {
  formatWeight,
  formatEquipmentDetail,
  formatMuscle,
  formatSecondaryMuscles,
  formatDate,
  toTitleCase,
} from '../lib/format'
import type { Exercise, LogEntry } from '../types'
import GifImage from '../components/GifImage'
import styles from './ExerciseDetailScreen.module.css'

export default function ExerciseDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { returnTo, category } = (location.state as { returnTo?: string; category?: string } | null) ?? {}

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !id) return
    void load()
  }, [user, id])

  async function load() {
    if (!user || !id) return
    setLoading(true)
    const [cachedEx, logs] = await Promise.all([
      getExercise(id),
      getLogEntries(id, user.id),
    ])
    let ex = cachedEx
    if (!ex) {
      ex = await getExerciseById(id)
      if (ex) void saveExercise(ex)
    }
    if (!ex) {
      navigate('/', { replace: true })
      return
    }
    setExercise(ex)
    setEntries(logs)
    setLoading(false)
  }

  async function handleDelete(entryId: string) {
    if (!window.confirm("Delete this entry? This can't be undone.")) return
    await deleteLogEntry(entryId)
    if (!user || !id) return
    const logs = await getLogEntries(id, user.id)
    setEntries(logs)
  }

  if (loading || !exercise) return (
    <div className={styles.screen}>
      <div className={styles.scrollContent}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Back">
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path d="M9 1L1 9l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className={styles.gifSection}>
          <div className={styles.skeletonGif} />
        </div>
        <div className={styles.body}>
          <div className={styles.skeletonLine} style={{ width: '70%', height: 24, marginBottom: 32 }} />
          <div className={styles.skeletonCard} />
          <div style={{ marginTop: 24 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.skeletonLine} style={{ width: `${70 - i * 10}%`, marginBottom: 12 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // Entry with the highest weight — used for max card display and date
  const maxEntry = entries.reduce<LogEntry | null>((best, e) => {
    if (!best || e.weight > best.weight) return e
    return best
  }, null)

  return (
    <div className={styles.screen}>
      <div className={styles.scrollContent}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Back">
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path d="M9 1L1 9l8 8" stroke="#3e3ee0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className={styles.gifSection}>
          <GifImage src={exercise.gifUrl} className={styles.gif} alt={exercise.name} />
        </div>

        <div className={styles.body}>
          <h1 className={styles.name}>{toTitleCase(exercise.name)}</h1>

          <div className={styles.maxCard}>
            {maxEntry ? (
              <>
                <p className={styles.maxWeight}>
                  {maxEntry.weight}<span className={styles.maxUnit}> kg</span>
                </p>
                <p className={styles.maxDate}>{formatDate(maxEntry.loggedAt)}</p>
              </>
            ) : (
              <p className={styles.maxEmpty}>Zero reps logged. Unacceptable.</p>
            )}
          </div>

          <div className={styles.metadata}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>PRIMARY</span>
              <span className={styles.metaValue}>{formatMuscle(exercise.target)}</span>
            </div>
            {exercise.secondaryMuscles.length > 0 && (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>SECONDARY</span>
                <span className={styles.metaValue}>{formatSecondaryMuscles(exercise.secondaryMuscles)}</span>
              </div>
            )}
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>EQUIPMENT</span>
              <span className={styles.metaValue}>{formatEquipmentDetail(exercise.equipment)}</span>
            </div>
          </div>

          <p className={styles.sectionLabel}>HISTORY</p>

          <div className={styles.historyList}>
            {entries.map((entry) => (
              <SwipeableHistoryRow
                key={entry.id}
                entry={entry}
                exercise={exercise}
                isPR={entry.id === maxEntry?.id}
                onDelete={() => void handleDelete(entry.id)}
              />
            ))}
          </div>

          <div className={styles.bottomSpacer} />
        </div>
      </div>

      <div className={styles.logBtnWrapper}>
        <button className={styles.logBtn} onClick={() => navigate(`/log/${exercise.id}`, { state: { returnTo, category } })}>
          LOG WEIGHT
        </button>
      </div>
    </div>
  )
}

// ─── SwipeableHistoryRow ──────────────────────────────────────────────────────

type HistoryRowProps = {
  entry: LogEntry
  exercise: Exercise
  isPR: boolean
  onDelete: () => void
}

function SwipeableHistoryRow({ entry, exercise, isPR, onDelete }: HistoryRowProps) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startXRef = useRef(0)
  const baseOffsetRef = useRef(0)
  const DELETE_WIDTH = 80

  function onTouchStart(e: React.TouchEvent) {
    startXRef.current = e.touches[0].clientX
    baseOffsetRef.current = offset
    setDragging(true)
  }

  function onTouchMove(e: React.TouchEvent) {
    const delta = e.touches[0].clientX - startXRef.current
    setOffset(Math.max(-DELETE_WIDTH, Math.min(0, baseOffsetRef.current + delta)))
  }

  function onTouchEnd() {
    setDragging(false)
    setOffset(offset < -DELETE_WIDTH / 2 ? -DELETE_WIDTH : 0)
  }

  return (
    <div className={styles.historyRowOuter}>
      <button className={styles.deleteBtn} onClick={onDelete}>Delete</button>
      <div
        className={styles.historyRow}
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? 'none' : 'transform 0.2s ease',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className={styles.historyLeft}>
          <span className={styles.historyWeight}>
            {formatWeight(entry.weight, exercise.equipment)}
          </span>
          {isPR && <span className={styles.prBadge}>PR</span>}
        </div>
        <span className={styles.historyDate}>{formatDate(entry.loggedAt)}</span>
      </div>
    </div>
  )
}
