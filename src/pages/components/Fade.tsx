import { useState, useEffect, cloneElement } from 'react';

import { cn, cnWhen } from '../lib';
import styles from './Fade.module.scss';


/** Child must apply className prop appropriately. */
export function Fade({ revealWhen, children }: {
  revealWhen: boolean,
  children: JSX.Element,
}) {
  const [shouldRenderChild, setShouldRenderChild] = useState(revealWhen);

  useEffect(() => {
    let timeout;

    if (revealWhen)
      setShouldRenderChild(true);
    else
      timeout = setTimeout(() => {
        setShouldRenderChild(false);
      }, 190);

    return () => clearTimeout(timeout);
  }, [revealWhen]);

  return shouldRenderChild ?
    cloneElement(children, {
      className: cn(
        children.props.className,
        cnWhen(revealWhen, styles.fadeIn, styles.fadeOut),
      ),
    }) :
    null;
}
