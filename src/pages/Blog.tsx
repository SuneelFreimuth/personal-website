import { useRef, useEffect } from 'react'

import { hslToRgb, rgbString } from './lib';
import { BackgroundAnimation } from './components/BackgroundAnimation';

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
      <SnakeBackground />
      <main>
        <h1>Blog</h1>
        {posts.map(({ title, date, tagline }) =>
          <div className={styles.post} key={title}>
            <h2>{title}</h2>
            <h3>{date}</h3>
            {tagline !== undefined ?
              <p>{tagline}</p> :
              null
            }
          </div>
        )}
      </main>
    </div>
  )
}

function SnakeBackground() {
  const TILE_SIZE = 15

  type Pos = [number, number];

  let cols: number;
  let rows: number;

  interface GameState {
    snake: Array<Pos>,
    apple: Pos,
    dir: Direction
  }

  type Direction = [1, 0] | [-1, 0] | [0, -1] | [0, 1]

  let game: GameState;

  const randomPos = (): Pos =>
    [
      Math.floor(cols * Math.random()),
      Math.floor(rows * Math.random())
    ]

  function setup(ctx: CanvasRenderingContext2D) {
    ctx.canvas.width = window.innerWidth
    ctx.canvas.height = window.innerHeight

    cols = Math.floor(ctx.canvas.width / TILE_SIZE)
    rows = Math.floor(ctx.canvas.height / TILE_SIZE)

    game = newGame()
  }

  const newGame = (): GameState => ({
    snake: [
      [
        Math.floor(cols / 2),
        Math.floor(rows / 2)
      ]
    ],
    apple: randomPos(),
    dir: [1, 0]
  });

  function draw(ctx: CanvasRenderingContext2D, frameCount: number) {
    if (frameCount % 5 === 0) {
      const { width, height } = ctx.canvas
      ctx.clearRect(0, 0, width, height)

      ctx.save()
      ctx.translate(width % TILE_SIZE / 2, height % TILE_SIZE / 2)

      ctx.beginPath()
      ctx.fillStyle = '#F00'
      ctx.roundRect(game.apple[0] * TILE_SIZE, game.apple[1] * TILE_SIZE, TILE_SIZE, TILE_SIZE, 2)
      ctx.fill()

      ctx.strokeStyle = 'none'
      let i = 0
      for (const [c, r] of game.snake) {
        ctx.fillStyle = rgbString(hslToRgb([120 - 2 * i, 1, 0.5]))
        ctx.fillRect(c * TILE_SIZE - 1, r * TILE_SIZE - 1, TILE_SIZE + 2, TILE_SIZE + 2);
        i++
      }

      ctx.restore()

      nextGameState(game)
    }
  }

  function nextGameState(game: GameState) {
    snakeAdvance(game);
    if (posEqual(game.snake[0], game.apple)) {
      game.apple = randomPos();
    } else if (game.snake.slice(1).some(pos => posEqual(pos, game.snake[0]))) {
      Object.assign(game, newGame());
      return;
    } else {
      game.snake.pop();
    }
    snakeDecideTurn(game)
  }

  function snakeAdvance(game: GameState) {
    const nextPos = posWrap(posAdd(game.snake[0], game.dir))
    game.snake.unshift(nextPos)
  }

  function snakeDecideTurn(game: GameState) {
    if (Math.random() < 0.6) {
      if (posEqual(game.dir, [0, -1]) || posEqual(game.dir, [0, 1])) {
        if (game.apple[0] < game.snake[0][0]) {
          game.dir = [-1, 0]
        } else if (game.apple[0] > game.snake[0][0]) {
          game.dir = [1, 0]
        }
      } else {
        if (game.apple[1] < game.snake[0][1]) {
          game.dir = [0, -1]
        } else if (game.apple[1] > game.snake[0][1]) {
          game.dir = [0, 1]
        }
      }
    }

    for (let tries = 0; tries < 4; tries++) {
      const nextPos = posAdd(game.snake[0], game.dir)
      if (!game.snake.some(pos => posEqual(pos, nextPos)))
        break
      game.dir = turnLeft(game.dir)
    }
  }

  const turnLeft = (dir: Direction): Direction => {
    if (posEqual(dir, [0, -1]))
      return [-1, 0]
    if (posEqual(dir, [-1, 0]))
      return [0, 1]
    if (posEqual(dir, [0, 1]))
      return [1, 0]
    if (posEqual(dir, [1, 0]))
      return [-1, 0]
  }

  const posWrap = (p: Pos): Pos => {
    p = [p[0], p[1]]
    if (p[0] < 0)
      p[0] = cols - 1
    else if (p[0] >= cols)
      p[0] = 0
    if (p[1] < 0)
      p[1] = rows - 1
    else if (p[1] >= rows)
      p[1] = 0
    return p
  };

  const posAdd = (a: Pos, b: Pos): Pos =>
    [
      Math.round(a[0] + b[0]),
      Math.round(a[1] + b[1])
    ];

  const posEqual = (a: Pos, b: Pos): boolean =>
    a[0] == b[0] && a[1] == b[1];

  return <BackgroundAnimation setup={setup} draw={draw} />;
}