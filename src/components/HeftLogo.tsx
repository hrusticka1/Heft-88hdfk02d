import logoSrc from '../assets/HeftLogo.svg'
import styles from './HeftLogo.module.css'

export default function HeftLogo() {
  return <img src={logoSrc} alt="Heft" className={styles.logo} />
}
