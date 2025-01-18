import { CSSProperties } from 'react';
import { cn, isSome } from '../lib';
import styles from './Chip.module.scss';


export function Chip({
  className,
  children,
  bgColor,
  fgColor,
  onClick,
  style,
}: Partial<ChipProps>) {
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

interface ChipProps {
  className: string,
  children: any,
  bgColor: string,
  fgColor: string,
  onClick: () => void,
  style: CSSProperties,
}
