import styles from './Chip.module.scss'

export function Chip({ children, color, ...rest }: any) {
  const style = { ...rest.style };
  if (color !== undefined)
    style.backgroundColor = color;

  return (
    <span
      {...rest}
      className={styles.chip + ' ' + rest.className}
      style={{ ...style }}
    >
      {children}
    </span>
  )
}