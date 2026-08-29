import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { getWorkoutSets, createWorkoutSet, deleteWorkoutSet, updateSetPositions } from '../data/storage'
import type { WorkoutSet } from '../types'
import styles from './SetsScreen.module.css'

export default function SetsScreen() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [sets, setSets] = useState<WorkoutSet[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  useEffect(() => {
    if (!user) return
    void load()
  }, [user])

  async function load() {
    if (!user) return
    setLoading(true)
    try {
      const data = await getWorkoutSets(user.id)
      setSets(data)
    } catch (err) {
      console.error('Failed to load sets:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(setId: string) {
    if (!window.confirm('Delete this set? Your exercise PRs won\'t be affected.')) return
    await deleteWorkoutSet(setId)
    setSets((prev) => prev.filter((s) => s.id !== setId))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setSets((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id)
      const newIndex = prev.findIndex((s) => s.id === over.id)
      const reordered = arrayMove(prev, oldIndex, newIndex)
      void updateSetPositions(reordered.map((s) => s.id))
      return reordered
    })
  }

  function openModal() {
    setNewName('')
    setCreateError(null)
    setShowModal(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function closeModal() {
    setShowModal(false)
    setNewName('')
    setCreateError(null)
  }

  async function handleCreate() {
    if (!user || !newName.trim() || creating) return
    setCreating(true)
    setCreateError(null)
    try {
      const created = await createWorkoutSet(user.id, newName.trim())
      setSets((prev) => [created, ...prev])
      closeModal()
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message ?? 'Could not create set. Please try again.'
      setCreateError(msg)
    } finally {
      setCreating(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') void handleCreate()
    if (e.key === 'Escape') closeModal()
  }

  if (loading) return null

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>WHAT YOU DO</p>
        <h1 className={styles.title}>Sets</h1>
        <p className={styles.subtitle}>Plans you&apos;ve stacked. Tap to lift.</p>
      </div>

      <div className={styles.content}>
        {sets.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No sets yet.</p>
            <p className={styles.emptySubtitle}>Create one to start building your workout plan.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sets.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className={styles.list}>
                {sets.map((set) => (
                  <SortableSetRow
                    key={set.id}
                    set={set}
                    onTap={() => navigate(`/sets/${set.id}`)}
                    onDelete={() => void handleDelete(set.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <button className={styles.newSetBtn} onClick={openModal}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New set
        </button>
      </div>

      {showModal && (
        <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>New set</h2>
            <input
              ref={inputRef}
              className={styles.modalInput}
              type="text"
              placeholder="e.g. Upper Pull"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoCapitalize="words"
            />
            {createError && <p className={styles.modalError}>{createError}</p>}
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={closeModal}>
                Cancel
              </button>
              <button
                className={styles.createBtn}
                onClick={() => void handleCreate()}
                disabled={!newName.trim() || creating}
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SortableSetRow ───────────────────────────────────────────────────────────

type SortableSetRowProps = { set: WorkoutSet; onTap: () => void; onDelete: () => void }

function SortableSetRow({ set, onTap, onDelete }: SortableSetRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: set.id })
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
          style={{ transform: `translateX(${swipeOffset}px)`, transition: swiping ? 'none' : 'transform 0.2s ease' }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <button className={styles.setCard} onClick={onTap}>
            <div className={styles.countBadge}>
              <span className={styles.countNumber}>{set.exerciseCount}</span>
            </div>
            <div className={styles.setInfo}>
              <span className={styles.setName}>{set.name}</span>
              <span className={styles.setMeta}>
                {set.exerciseCount === 1 ? '1 exercise' : `${set.exerciseCount} exercises`}
              </span>
            </div>
            <svg className={styles.chevron} width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

