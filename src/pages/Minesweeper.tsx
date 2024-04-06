import { useState } from 'react'
import styles from './Minesweeper.module.scss'

const ROWS = 16
const COLS = 16
const CELL_SIZE = '24px'
const CELL_GAP = '2px'

export function Minesweeper() {
  const [game, setGame] = useState(null as Game | null);

  const GridCell = ({row, col}) =>
    <div
      className={styles.gridCell}
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
      }}
    ></div>

  return (
    <div className={styles.minesweeper}>
      <div
        className={styles.grid}
        style={{
          gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE})`,
          gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE})`, gap: CELL_GAP
        }}
      >
        {gridRange(ROWS, COLS).map(([r, c]) => (
          <GridCell key={`cell(${r},${c})`} row={r} col={c}/>
        ))}
      </div>
    </div>
  );
}

class Game {
  public rows: number;
  public cols: number;
  public tiles: Matrix<Tile>;

  constructor(rows: number, cols: number, numMines: number) {
    this.tiles = randomBoard(rows, cols, numMines);
  }

  revealTile = (r: number, c: number) => {
    if (this.inBounds(r, c))
      throw new Error(`Position (${r}, ${c}) is out of bounds (${this.rows}, ${this.cols}).`);

    if (this.tiles[r][c].revealed || this.tiles[r][c].flagged)
      return;

    if (this.tiles[r][c].hasMine) {}
  }

  toggleFlag = (r: number, c: number) => {
    this.tiles[r][c].toggleFlag();
  }

  numbers = (): Matrix<number> => {
    const nums = matrixOf(() => 0, this.rows, this.cols);
    for (const [r, c] of gridRange(this.rows, this.cols))
      nums[r][c] = this.surroundingTiles(r, c)
        .filter(([r, c]) => this.tiles[r][c].hasMine)
        .length;
    return nums;
  }

  surroundingTiles = (r: number, c: number): Array<[number, number]> => {
    return [
      [r - 1, c - 1],
      [r - 1, c],
      [r - 1, c + 1],
      [r, c - 1],
      [r, c + 1],
      [r + 1, c - 1],
      [r + 1, c],
      [r + 1, c + 1],
    ].filter(([r, c]) => this.inBounds(r, c)) as Array<[number, number]>;
  }

  inBounds = (r: number, c: number): boolean =>
    r >= 0 && r < this.rows && c >= 0 && c < this.cols
}

function randomBoard(rows: number, cols: number, numMines: number): Matrix<Tile> {
  assert(numMines < rows * cols);
  const board = matrixOf(() => new Tile(), rows, cols);
  for (let i = 0; i < numMines; i++) {
    let r, c;
    do
      [r, c] = randomPos(this.rows, this.cols);
    while (board[r][c].hasMine);
    board[r][c].hasMine = true;
  }
  return board;
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

  constructor() {
    this.revealed = false;
    this.flagged = false;
    this.hasMine = false;
  }

  reveal = () => {
    if (this.revealed)
      throw new TypeError('Tile is already revealed');
    this.revealed = true;
  }

  toggleFlag = () => {
    if (!this.revealed)
      throw new TypeError('Cannot flag unopened cell')
    this.flagged = !this.flagged;
  }
}

type Matrix<T> = Array<Array<T>>;

function gridRange(rows: number, cols: number): Array<[number, number]> {
  const range = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      range.push([r, c]);
  return range;
}

function matrixOf<T>(builder: () => T, rows, cols): Array<Array<T>> {
  const range = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++)
      range.push(builder());
    range.push(row);
  }
  return range;
}