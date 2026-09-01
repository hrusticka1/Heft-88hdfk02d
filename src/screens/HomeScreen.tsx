import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { getMyExercises, getMaxWeight, deleteAllLogEntries } from '../data/storage'
import { CATEGORIES, muscleGroupMap } from '../constants/muscleGroupMap'
import type { Category } from '../constants/muscleGroupMap'
import type { Exercise } from '../types'
import { formatWeight, toTitleCase } from '../lib/format'
import CategoryPill from '../components/CategoryPill'
import ExerciseRow from '../components/ExerciseRow'
import FAB from '../components/FAB'
import HeftLogo from '../components/HeftLogo'
import styles from './HomeScreen.module.css'

type ExerciseWithMax = Exercise & { maxWeight: number | null }

function exerciseMatchesCategory(exercise: Exercise, category: Category): boolean {
  if (muscleGroupMap[exercise.bodyPart.toLowerCase()] === category) return true
  if (muscleGroupMap[exercise.target.toLowerCase()] === category) return true
  return exercise.secondaryMuscles.some(
    (m) => muscleGroupMap[m.toLowerCase()] === category
  )
}

export default function HomeScreen() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const stateCategory = (location.state as { category?: Category } | null)?.category
  const [activeCategory, setActiveCategory] = useState<Category>(
    stateCategory && (CATEGORIES as readonly string[]).includes(stateCategory) ? stateCategory : 'Upper Body'
  )
  const [exercises, setExercises] = useState<ExerciseWithMax[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    void loadExercises()
  }, [user])

  async function loadExercises() {
    if (!user) return
    setLoading(true)
    const list = await getMyExercises(user.id)
    const withMaxWeights = await Promise.all(
      list.map(async (ex) => ({
        ...ex,
        maxWeight: await getMaxWeight(ex.id, user.id),
      }))
    )
    setExercises(withMaxWeights)
    setLoading(false)
  }

  const filtered = exercises.filter((ex) => exerciseMatchesCategory(ex, activeCategory))

  function countForCategory(cat: Category): number {
    return exercises.filter((ex) => exerciseMatchesCategory(ex, cat)).length
  }

  const isEmpty = exercises.length === 0
  const isCategoryEmpty = !loading && !isEmpty && filtered.length === 0

  async function handleDelete(ex: ExerciseWithMax) {
    if (!user) return
    if (!window.confirm(`Delete all records for ${toTitleCase(ex.name)}? This can't be undone.`)) return
    await deleteAllLogEntries(ex.id, user.id)
    setExercises((prev) => prev.filter((e) => e.id !== ex.id))
  }

  function subtitleFor(ex: ExerciseWithMax): string {
    if (ex.maxWeight === null) return ''
    return formatWeight(ex.maxWeight, ex.equipment)
  }

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <HeftLogo />
      </header>

      <div className={styles.pillsWrapper}>
        <div className={styles.pills}>
          {CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat}
              label={cat}
              active={activeCategory === cat}
              count={countForCategory(cat)}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.list}>
            {[1, 2, 3, 4].map((i) => <SkeletonExerciseRow key={i} />)}
          </div>
        ) : isEmpty ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No workout yet</p>
            <p className={styles.emptySubtitle}>Tap + to log your first exercise.</p>
          </div>
        ) : isCategoryEmpty ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No workout yet</p>
            <p className={styles.emptySubtitle}>Looks like you&apos;ve been skipping {activeCategory.toLowerCase()}.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {filtered.map((ex) => (
              <SwipeableExerciseCard
                key={ex.id}
                exercise={ex}
                subtitle={subtitleFor(ex)}
                onTap={() => navigate(`/exercise/${ex.id}`, { state: { returnTo: '/exercises', category: activeCategory } })}
                onDelete={() => void handleDelete(ex)}
              />
            ))}
          </div>
        )}
      </div>

      <FAB onClick={() => navigate('/search')} />
    </div>
  )
}

// ─── SwipeableExerciseCard ────────────────────────────────────────────────────

// ─── SkeletonExerciseRow ──────────────────────────────────────────────────────

function SkeletonExerciseRow() {
  return (
    <div className={styles.skeletonRow}>
      <div className={styles.skeletonThumb} />
      <div className={styles.skeletonText}>
        <div className={styles.skeletonLine} style={{ width: '60%' }} />
        <div className={styles.skeletonLine} style={{ width: '35%', marginTop: 6 }} />
      </div>
    </div>
  )
}

// ─── SwipeableExerciseCard ────────────────────────────────────────────────────

type SwipeableProps = {
  exercise: ExerciseWithMax
  subtitle: string
  onTap: () => void
  onDelete: () => void
}

function SwipeableExerciseCard({ exercise, subtitle, onTap, onDelete }: SwipeableProps) {
  const [offset, setOffset] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const startXRef = useRef(0)
  const baseOffsetRef = useRef(0)
  const DELETE_WIDTH = 80

  function onTouchStart(e: React.TouchEvent) {
    startXRef.current = e.touches[0].clientX
    baseOffsetRef.current = offset
    setSwiping(true)
  }
  function onTouchMove(e: React.TouchEvent) {
    const delta = e.touches[0].clientX - startXRef.current
    setOffset(Math.max(-DELETE_WIDTH, Math.min(0, baseOffsetRef.current + delta)))
  }
  function onTouchEnd() {
    setSwiping(false)
    setOffset(offset < -DELETE_WIDTH / 2 ? -DELETE_WIDTH : 0)
  }

  return (
    <div className={styles.swipeOuter}>
      <button className={styles.deleteBtn} onClick={onDelete}>Delete</button>
      <div
        className={styles.swipeInner}
        style={{ transform: `translateX(${offset}px)`, transition: swiping ? 'none' : 'transform 0.2s ease' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <ExerciseRow
          name={toTitleCase(exercise.name)}
          gifUrl={exercise.gifUrl}
          subtitle={subtitle}
          asCard
          onClick={onTap}
        />
      </div>
    </div>
  )
}
