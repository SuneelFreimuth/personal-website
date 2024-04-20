import styles from './Chip.module.scss'

export function Chip({ children, color }: { children: string, color: string }) {
  return (
    <span className={styles.chip} style={{ backgroundColor: color }}>{children}</span>
  )
}