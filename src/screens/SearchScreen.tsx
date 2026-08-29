import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { searchExercises, PAGE_SIZE } from '../lib/exercises'
import { getMyExercises, getMaxWeight, addExerciseToSet, saveExercise } from '../data/storage'
import type { Exercise } from '../types'
import { formatWeight, toTitleCase } from '../lib/format'
import ExerciseRow from '../components/ExerciseRow'
import styles from './SearchScreen.module.css'

type ResultWithMax = Exercise & { maxWeight: number | null; isLogged: boolean }

type LocationState = { setId?: string } | null

export default function SearchScreen() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const activeQueryRef = useRef('')
  const nextOffsetRef = useRef(0)
  const isLoadingRef = useRef(false)
  const hasMoreRef = useRef(false)

  const setId = (location.state as LocationState)?.setId ?? null
  const isSetMode = Boolean(setId)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ResultWithMax[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [loggedIds, setLoggedIds] = useState<Set<string>>(new Set())
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Load user's logged exercise IDs once
  useEffect(() => {
    if (!user) return
    void getMyExercises(user.id).then((list) => {
      setLoggedIds(new Set(list.map((ex) => ex.id)))
    })
  }, [user])

  function handleQueryChange(value: string) {
    setQuery(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim()) {
      setResults([])
      setSearched(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      void runSearch(value)
    }, 300)
  }

  async function runSearch(q: string) {
    if (!user) return
    activeQueryRef.current = q.toLowerCase().trim()
    nextOffsetRef.current = PAGE_SIZE
    isLoadingRef.current = true
    hasMoreRef.current = false
    setHasMore(false)
    setLoading(true)
    try {
      const raw = await searchExercises(q, 0)
      const withMeta: ResultWithMax[] = await Promise.all(
        raw.map(async (ex) => {
          const isLogged = loggedIds.has(ex.id)
          const maxWeight = isLogged ? await getMaxWeight(ex.id, user.id) : null
          return { ...ex, isLogged, maxWeight }
        })
      )
      setResults(withMeta)
      setSearched(true)
      const more = raw.length === PAGE_SIZE
      hasMoreRef.current = more
      setHasMore(more)
    } finally {
      isLoadingRef.current = false
      setLoading(false)
    }
  }

  async function loadMore() {
    if (!user || isLoadingRef.current || !hasMoreRef.current) return
    isLoadingRef.current = true
    setLoadingMore(true)
    const offset = nextOffsetRef.current
    nextOffsetRef.current += PAGE_SIZE
    try {
      const raw = await searchExercises(activeQueryRef.current, offset)
      const withMeta: ResultWithMax[] = await Promise.all(
        raw.map(async (ex) => {
          const isLogged = loggedIds.has(ex.id)
          const maxWeight = isLogged ? await getMaxWeight(ex.id, user.id) : null
          return { ...ex, isLogged, maxWeight }
        })
      )
      setResults((prev) => [...prev, ...withMeta])
      const more = raw.length === PAGE_SIZE
      hasMoreRef.current = more
      setHasMore(more)
    } finally {
      isLoadingRef.current = false
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) void loadMore() },
      { rootMargin: '120px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleResultTap(ex: ResultWithMax) {
    if (isSetMode && setId) {
      if (addedIds.has(ex.id)) {
        navigate(-1)
        return
      }
      // Save exercise to DB first (upsert), then add to set
      await saveExercise(ex)
      await addExerciseToSet(setId, ex.id)
      setAddedIds((prev) => new Set([...prev, ex.id]))
      navigate(-1)
    } else {
      navigate(`/exercise/${ex.id}`)
    }
  }

  function subtitleFor(ex: ResultWithMax): string {
    if (isSetMode && addedIds.has(ex.id)) return 'Added'
    if (!ex.isLogged) return 'No record'
    if (ex.maxWeight === null) return 'No record'
    return formatWeight(ex.maxWeight, ex.equipment)
  }

  const showNoResults = searched && !loading && results.length === 0 && query.trim().length > 0

  return (
    <div className={styles.screen}>
      {isSetMode && (
        <div className={styles.modeBanner}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 7.5L5 11.5L13 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Adding to set
        </div>
      )}

      <div className={styles.searchBar}>
        <div className={styles.inputWrapper}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="#8E8E93" strokeWidth="1.5"/>
            <path d="M10.5 10.5L14 14" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            placeholder="Search exercises"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
          />
          {query.length > 0 && (
            <button
              className={styles.clearBtn}
              onClick={() => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus() }}
              aria-label="Clear"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill="#C7C7CC"/>
                <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
        <button className={styles.cancelBtn} onClick={() => navigate(-1)}>
          {isSetMode ? 'Done' : 'Cancel'}
        </button>
      </div>

      <div className={styles.content}>
        {showNoResults ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>That&apos;s not an exercise</p>
            <p className={styles.emptySubtitle}>Probably.</p>
          </div>
        ) : (
          <div className={styles.resultsList}>
            {results.map((ex) => (
              <ExerciseRow
                key={ex.id}
                name={toTitleCase(ex.name)}
                gifUrl={ex.gifUrl}
                subtitle={subtitleFor(ex)}
                subtitleItalic={!ex.isLogged && !addedIds.has(ex.id)}
                asCard
                onClick={() => void handleResultTap(ex)}
              />
            ))}
            <div ref={sentinelRef} />
            {loadingMore && <p className={styles.loadingMore}>Loading…</p>}
            {searched && !hasMore && results.length > 0 && (
              <p className={styles.endOfResults}>All results shown</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
