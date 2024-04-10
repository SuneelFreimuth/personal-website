import styles from './Chip.module.scss'

export function Chip({ children }: { children: string }) {
  return (
    <span className={styles.chip}>{children}</span>
  )
}