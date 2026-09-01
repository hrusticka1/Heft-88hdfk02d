import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAuth } from '../lib/auth'
import { getSetExercises, removeExerciseFromSet, getMaxWeight, updateSetExercisePositions } from '../data/storage'
import { supabase } from '../lib/supabase'
import { formatWeight, toTitleCase } from '../lib/format'
import type { Exercise } from '../types'
import ExerciseRow from '../components/ExerciseRow'
import styles from './SetDetailScreen.module.css'

type ExerciseWithMax = Exercise & { maxWeight: number | null }

export default function SetDetailScreen() {
  const { setId } = useParams<{ setId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [setName, setSetName] = useState('')
  const [exercises, setExercises] = useState<ExerciseWithMax[]>([])
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  useEffect(() => {
    if (!user || !setId) return
    void load()
  }, [user, setId])

  async function load() {
    if (!user || !setId) return
    setLoading(true)
    try {
      const [exs, setRow] = await Promise.all([
        getSetExercises(setId),
        supabase.from('workout_sets').select('name').eq('id', setId).single(),
      ])
      if (setRow.data?.name) setSetName(setRow.data.name)
      const withMax: ExerciseWithMax[] = await Promise.all(
        exs.map(async (ex) => {
          const maxWeight = await getMaxWeight(ex.id, user.id)
          return { ...ex, maxWeight }
        })
      )
      setExercises(withMax)
    } finally {
      setLoading(false)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id || !setId) return
    setExercises((prev) => {
      const oldIndex = prev.findIndex((ex) => ex.id === active.id)
      const newIndex = prev.findIndex((ex) => ex.id === over.id)
      const reordered = arrayMove(prev, oldIndex, newIndex)
      void updateSetExercisePositions(setId, reordered.map((ex) => ex.id))
      return reordered
    })
  }

  async function handleRemove(exerciseId: string) {
    if (!setId) return
    if (!window.confirm('Remove this exercise from the set?')) return
    await removeExerciseFromSet(setId, exerciseId)
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId))
  }

  function subtitleFor(ex: ExerciseWithMax): string {
    if (ex.maxWeight === null) return 'No record'
    return formatWeight(ex.maxWeight, ex.equipment)
  }

  if (loading) return (
    <div className={styles.screen}>
      <div className={styles.scrollContent}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Back">
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path d="M9 1L1 9l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className={styles.header} style={{ paddingTop: 60 }}>
          <div className={styles.skeletonLine} style={{ width: '45%', height: 28, marginBottom: 8 }} />
          <div className={styles.skeletonLine} style={{ width: '25%', height: 14 }} />
        </div>
        <div className={styles.body}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonRow}>
              <div className={styles.skeletonThumb} />
              <div style={{ flex: 1 }}>
                <div className={styles.skeletonLine} style={{ width: '60%' }} />
                <div className={styles.skeletonLine} style={{ width: '35%', marginTop: 6 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className={styles.screen}>
      <div className={styles.scrollContent}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Back">
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path d="M9 1L1 9l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className={styles.header}>
          <h1 className={styles.title}>{setName || 'Set'}</h1>
          <p className={styles.subtitle}>
            {exercises.length === 1 ? '1 exercise' : `${exercises.length} exercises`}
          </p>
        </div>

        <div className={styles.body}>
          {exercises.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>No exercises yet. Tap Add to build your set.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={exercises.map((ex) => ex.id)} strategy={verticalListSortingStrategy}>
                <div className={styles.exerciseList}>
                  {exercises.map((ex) => (
                    <SortableExerciseRow
                      key={ex.id}
                      exercise={ex}
                      subtitle={subtitleFor(ex)}
                      onTap={() => navigate(`/exercise/${ex.id}`, { state: { returnTo: `/sets/${setId}` } })}
                      onDelete={() => void handleRemove(ex.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          <button
            className={styles.addBtn}
            onClick={() => navigate('/search', { state: { setId } })}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Add exercise
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SortableExerciseRow ──────────────────────────────────────────────────────

type SortableProps = {
  exercise: ExerciseWithMax
  subtitle: string
  onTap: () => void
  onDelete: () => void
}

function SortableExerciseRow({ exercise, subtitle, onTap, onDelete }: SortableProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: exercise.id,
  })
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const startXRef = useRef(0)
  const baseOffsetRef = useRef(0)
  const DELETE_WIDTH = 80

  function onTouchStart(e: React.TouchEvent) {
    startXRef.current = e.touches[0].clientX
    baseOffsetRef.current = swipeOffset
    setSwiping(true)
  }

  function onTouchMove(e: React.TouchEvent) {
    const delta = e.touches[0].clientX - startXRef.current
    setSwipeOffset(Math.max(-DELETE_WIDTH, Math.min(0, baseOffsetRef.current + delta)))
  }

  function onTouchEnd() {
    setSwiping(false)
    setSwipeOffset(swipeOffset < -DELETE_WIDTH / 2 ? -DELETE_WIDTH : 0)
  }

  return (
    <div
      ref={setNodeRef}
      className={styles.sortableRow}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
        position: 'relative',
      }}
      {...attributes}
      {...listeners}
    >
      <div className={styles.swipeOuter}>
        <button className={styles.deleteBtn} onClick={onDelete}>Delete</button>
        <div
          className={styles.swipeInner}
          style={{
            transform: `translateX(${swipeOffset}px)`,
            transition: swiping ? 'none' : 'transform 0.2s ease',
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <ExerciseRow
            name={toTitleCase(exercise.name)}
            gifUrl={exercise.gifUrl}
            subtitle={subtitle}
            subtitleItalic={exercise.maxWeight === null}
            asCard
            onClick={onTap}
          />
        </div>
      </div>
    </div>
  )
}

