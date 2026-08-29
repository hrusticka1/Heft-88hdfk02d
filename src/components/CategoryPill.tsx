import styles from './CategoryPill.module.css'
import type { Category } from '../constants/muscleGroupMap'

type Props = {
  label: Category
  active: boolean
  count: number
  onClick: () => void
}

export default function CategoryPill({ label, active, count, onClick }: Props) {
  return (
    <button
      className={`${styles.pill} ${active ? styles.active : ''}`}
      onClick={onClick}
    >
      {label}
      {count > 0 && <span className={styles.count}>{count}</span>}
    </button>
  )
}
