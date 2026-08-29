import { useNavigate, useLocation } from 'react-router-dom'
import styles from './TabBar.module.css'

export default function TabBar() {
  const navigate = useNavigate()
  const location = useLocation()

  const path = location.pathname

  const isExercises = path === '/exercises'
  const isSets = path === '/sets' || path.startsWith('/sets/')
  const isProfile = path === '/profile'

  return (
    <nav className={styles.tabBar}>
      <button
        className={`${styles.tab} ${isSets ? styles.active : ''}`}
        onClick={() => navigate('/sets')}
        aria-label="Sets"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {/* Layers/stack: 3 stacked trapezoid-like shapes */}
          <path d="M3 17.5L12 21L21 17.5L12 14L3 17.5Z" fill="currentColor" opacity="0.5" />
          <path d="M3 12.5L12 16L21 12.5L12 9L3 12.5Z" fill="currentColor" opacity="0.75" />
          <path d="M3 7.5L12 11L21 7.5L12 4L3 7.5Z" fill="currentColor" />
        </svg>
        <span className={styles.label}>Sets</span>
      </button>

      <button
        className={`${styles.tab} ${isExercises ? styles.active : ''}`}
        onClick={() => navigate('/exercises')}
        aria-label="Exercises"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="1" y="10" width="5" height="4" rx="1.5" fill="currentColor" />
          <rect x="18" y="10" width="5" height="4" rx="1.5" fill="currentColor" />
          <rect x="3" y="8" width="3" height="8" rx="1" fill="currentColor" />
          <rect x="18" y="8" width="3" height="8" rx="1" fill="currentColor" />
          <rect x="6" y="11" width="12" height="2" rx="1" fill="currentColor" />
        </svg>
        <span className={styles.label}>Exercises</span>
      </button>

      <button
        className={`${styles.tab} ${isProfile ? styles.active : ''}`}
        onClick={() => navigate('/profile')}
        aria-label="Profile"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {/* Profile: circle head + curved shoulders arc */}
          <circle cx="12" cy="8" r="3.5" fill="currentColor" />
          <path
            d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <span className={styles.label}>Profile</span>
      </button>
    </nav>
  )
}
