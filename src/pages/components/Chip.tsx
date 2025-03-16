import { ComponentProps, CSSProperties, StyleHTMLAttributes } from 'react';
import { cn, isSome } from '../lib';
import styles from './Chip.module.scss';


export function Chip({
  className,
  children,
  fgColor = '#000',
  bgColor = '#FFF',
  onClick,
  style,
}: ComponentProps<'span'> & {
  fgColor?: string;
  bgColor?: string;
}) {
  return (
    <span
      className={cn(styles.chip, className)}
      onClick={onClick}
      style={{
        color: fgColor,
        backgroundColor: bgColor,
        cursor: isSome(onClick) ?  'pointer' : 'unset',
        ...style
      }}
    >
      {children}
    </span>
  );
}
