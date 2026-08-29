import { useAuth } from '../lib/auth'
import styles from './ProfileScreen.module.css'

export default function ProfileScreen() {
  const { user, signOut } = useAuth()

  const displayName: string =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split('@')[0] ??
    'User'

  const email = user?.email ?? ''

  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>ACCOUNT</p>
        <h1 className={styles.title}>Profile</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.avatarWrapper}>
          <div className={styles.avatar}>
            <span className={styles.avatarInitial}>{initial}</span>
          </div>
        </div>

        <div className={styles.userInfo}>
          <p className={styles.displayName}>{displayName}</p>
          <p className={styles.email}>{email}</p>
        </div>

        <button className={styles.signOutBtn} onClick={() => void signOut()}>
          Sign out
        </button>
      </div>
    </div>
  )
}
