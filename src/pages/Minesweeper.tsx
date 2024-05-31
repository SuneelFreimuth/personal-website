import { useState } from 'react'
import styles from './Minesweeper.module.scss'

const ROWS = 16
const COLS = 16
const MINE_DENSITY = 0.3
const NUM_MINES = Math.floor((ROWS * COLS) * MINE_DENSITY)
const CELL_GAP = '2px'

export function Minesweeper() {
  const [game, setGame] = useState(new Game(ROWS, COLS, NUM_MINES) as Game | null);

  return (
    <div className={styles.minesweeper}>
      <div
        className={styles.grid}
        style={{
          width: '450px',
          height: '450px',
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: CELL_GAP
        }}
        onContextMenu={e => {
          e.preventDefault()
        }}
      >
        {Array.from(gridRange(ROWS, COLS)).map(([r, c]) => (
          <GridCell
            key={`cell(${r},${c})`}
            tile={game.tiles[r][c]}
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              e.cancelBubble = true

              if ((e.buttons >> 1) & 1)
                game.tiles[r][c].toggleFlag()
              else if (!game.tiles[r][c].flagged)
                game.revealTile(r, c)
              setGame(game.clone())

              return false
            }}
          />
        ))}
      </div>
      {game.gameIsOver() ?
        <button onClick={() => {
          game.reset()
          setGame(game.clone())
        }}>
          Restart
        </button> :
        null
      }
    </div>
  );
}

const GridCell = ({ tile, onClick }: {
  tile: Tile,
  onClick: Function
}) =>
  <div
    className={styles.gridCell + ' ' + (tile.revealed ? styles.revealed : '')}
    onClick={onClick as any}
    onContextMenu={onClick as any}
  >
    {
      tile.revealed && tile.neighbouringMines > 0 ?
        `${tile.neighbouringMines}` :
      tile.hasMine ?
        'M' :
      tile.flagged ?
        'F' :
        null
    }
  </div>

class Game {
  rows: number;
  cols: number;
  numMines: number;
  tiles: Matrix<Tile>;
  private gameOver: boolean

  constructor(rows: number, cols: number, numMines: number) {
    this.rows = rows
    this.cols = cols
    this.numMines = numMines
    this.randomizeBoard()
    this.gameOver = false
  }

  clone = (): Game => {
    const g = new Game(this.rows, this.cols, this.numMines)
    g.tiles = this.tiles
    g.gameOver = this.gameOver
    return g
  }

  reset = () => {
    this.randomizeBoard()
    this.gameOver = false
  }

  private randomizeBoard = () => {
    this.tiles = matrixOf(() => new Tile(), this.rows, this.cols);
    for (let i = 0; i < this.numMines; i++) {
      let r, c;
      do
        [r, c] = randomPos(this.rows, this.cols);
      while (this.tiles[r][c].hasMine);
      this.tiles[r][c].hasMine = true;
    }

    for (const [r, c] of gridRange(this.rows, this.cols))
      for (const [r_, c_] of this.surroundingTiles(r, c))
        if (this.tiles[r_][c_].hasMine)
          this.tiles[r][c].neighbouringMines++
  }

  gameIsOver = () => this.gameOver

  revealTile = (r: number, c: number) => {
    if (!this.inBounds(r, c))
      throw new Error(`Position (${r}, ${c}) is out of bounds (${this.rows}, ${this.cols}).`);

    if (this.tiles[r][c].revealed || this.tiles[r][c].flagged)
      return;

    if (this.tiles[r][c].hasMine) {
      this.gameOver = true
    } else {
      this.revealTileRecurse(r, c)
    }
  }

  private revealTileRecurse = (r: number, c: number) => {
    console.log('Revealing', r, c)
    this.tiles[r][c].reveal()
    if (this.tiles[r][c].neighbouringMines === 0)
      for (const [r_, c_] of this.cardinalTiles(r, c))
        if (!this.tiles[r_][c_].revealed && !this.tiles[r_][c_].hasMine)
          this.revealTileRecurse(r_, c_)
  }

  neighboursMine = (r: number, c: number): boolean =>
    this
      .surroundingTiles(r, c)
      .some(([r, c]) => this.tiles[r][c].hasMine)

  neighbouringMines = (r: number, c: number): number => {
    let count = 0;
    for (const [r_, c_] of this.surroundingTiles(r, c)) {
      if (this.tiles[r_][c_].hasMine)
        count++;
    }
    return count;
  }

  toggleFlag = (r: number, c: number) => {
    this.tiles[r][c].toggleFlag();
  }

  cardinalTiles = (r: number, c: number): [number, number][] =>
    [
      [r - 1, c],
      [r, c + 1],
      [r + 1, c],
      [r, c - 1]
    ].filter(([r_, c_]) => this.inBounds(r_, c_)) as [number, number][];

  surroundingTiles = (r: number, c: number): [number, number][] =>
    [
      [r - 1, c - 1],
      [r - 1, c],
      [r - 1, c + 1],
      [r, c - 1],
      [r, c + 1],
      [r + 1, c - 1],
      [r + 1, c],
      [r + 1, c + 1],
    ].filter(([r_, c_]) => this.inBounds(r_, c_)) as [number, number][];

  inBounds = (r: number, c: number): boolean =>
    r >= 0 && r < this.rows && c >= 0 && c < this.cols
}

const randomPos = (rows: number, cols: number): [number, number] =>
  [
    Math.floor(rows * Math.random()),
    Math.floor(cols * Math.random()),
  ]

class Tile {
  public revealed: boolean;
  public flagged: boolean;
  public hasMine: boolean;
  public neighbouringMines: number

  constructor() {
    this.revealed = false;
    this.flagged = false;
    this.hasMine = false;
    this.neighbouringMines = 0;
  }

  reveal = () => {
    if (this.revealed)
      throw new TypeError('Tile is already revealed');
    this.revealed = true;
  }

  toggleFlag = () => {
    if (this.revealed)
      throw new TypeError('Cannot flag opened cell')
    this.flagged = !this.flagged;
  }
}

type Matrix<T> = Array<Array<T>>;

function* gridRange(rows: number, cols: number) {
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      yield [r, c];
}

function matrixOf<T>(builder: (r?: number, c?: number) => T, rows, cols): Array<Array<T>> {
  const range = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++)
      row.push(builder());
    range.push(row);
  }
  return range;
}