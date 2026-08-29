import GifImage from './GifImage'
import styles from './ExerciseRow.module.css'

type Props = {
  name: string
  gifUrl: string
  subtitle: string
  subtitleItalic?: boolean
  asCard?: boolean
  onClick: () => void
}

export default function ExerciseRow({ name, gifUrl, subtitle, subtitleItalic, asCard, onClick }: Props) {
  return (
    <button
      className={`${styles.row} ${asCard ? styles.card : styles.flat}`}
      onClick={onClick}
    >
      <GifImage src={gifUrl} className={styles.gif} alt="" />
      <div className={styles.text}>
        <span className={styles.name}>{name}</span>
        {subtitle ? (
          <span className={`${styles.subtitle} ${subtitleItalic ? styles.italic : ''}`}>
            {subtitle}
          </span>
        ) : null}
      </div>
    </button>
  )
}
