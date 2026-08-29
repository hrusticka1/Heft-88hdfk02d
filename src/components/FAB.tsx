import styles from './FAB.module.css'

type Props = {
  onClick: () => void
}

export default function FAB({ onClick }: Props) {
  return (
    <button className={styles.fab} onClick={onClick} aria-label="Add exercise">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </button>
  )
}
