import { useRef, useEffect } from 'react'

import { hslToRgb, isSome, lerpColors, rgbString, when } from '../lib';
import { AnimatedBackground } from '../components/AnimatedBackground';

import styles from './Blog.module.scss'

export function Blog() {
  const posts = [
    {
      title: 'sadiofjsaiodfjsai',
      date: 'July 20, 2023',
      tagline: `Still not real`,
    },
    {
      title: 'Filler',
      date: 'July 20, 2022',
      tagline: `Not real`,
    },
    {
      title: 'Fake Post',
      date: 'January 1, 2000',
      tagline: `Not real`,
    },
    {
      title: 'Some sort of title',
      date: 'July 20, 1999',
      tagline: `Still not real`,
    },
    {
      title: 'things',
      date: 'July 20, 2023',
      tagline: `Still not real`,
    },
    {
      title: 'other things',
      date: 'July 20, 2022',
      tagline: `Not real`,
    },
    {
      title: 'yet more things',
      date: 'January 1, 2000',
      tagline: `Not real`,
    },
    {
      title: 'so many things',
      date: 'July 20, 1999',
      tagline: `Still not real`,
    },
  ]

  return (
    <div className={styles.blog}>
      <main>
        <h1>Blog</h1>
        {posts.map(({ title, date, tagline }) =>
          <div className={styles.post} key={title}>
            <h2>{title}</h2>
            <h3>{date}</h3>
            {when(
              isSome(tagline),
              <p>{tagline}</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
