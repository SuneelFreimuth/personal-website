import { useState } from 'react';

import { books, Book, BookState, Series } from './books';
import { Chip } from './components/Chip';

import styles from './ReadingList.module.scss';
import { useSearchParams } from 'react-router-dom';
import catppuccin from '../catppuccin';

const icons = {
  close: new URL('../assets/close-icon.png?width=100', import.meta.url),
  seriesBackButton: new URL('../assets/back-button.png?width=100', import.meta.url),
  atium: new URL('../assets/atium.png?width=100', import.meta.url),
  wheelOfTime: new URL('../assets/wheel-of-time.webp?width=100', import.meta.url),
  iceAndFire: new URL('../assets/house-stark-sigil.png?width=100', import.meta.url),
  stormlightArchive: new URL('../assets/stormlight-archive.svg', import.meta.url),
};

const brushedGoldPattern = new URL('../assets/shiny-gold.jpg', import.meta.url);

const SERIES_ID = {
  [Series.Dune]: 'dune',
  [Series.Mistborn]: 'mistborn',
  [Series.WheelOfTime]: 'wheel-of-time',
  [Series.IceAndFire]: 'ice-and-fire',
  [Series.StormlightArchive]: 'stormlight-archive',
};

const SERIES_FROM_ID = {
  'dune': Series.Dune,
  'mistborn': Series.Mistborn,
  'wheel-of-time': Series.WheelOfTime,
  'ice-and-fire': Series.IceAndFire,
  'stormlight-archive': Series.IceAndFire,
};

const SERIES_TITLE = {
  [Series.Dune]: 'Dune',
  [Series.Mistborn]: 'Mistborn',
  [Series.WheelOfTime]: 'The Wheel of Time',
  [Series.IceAndFire]: 'A Song of Ice and Fire',
  [Series.StormlightArchive]: 'The Stormlight Archive',
};

const BOOK_STATE_PRIORITY = {
  [BookState.Done]: 0,
  [BookState.Todo]: 1,
  [BookState.InProgress]: 2,
};

const comparePriority = (a: Book, b: Book): number =>
  BOOK_STATE_PRIORITY[a.state] < BOOK_STATE_PRIORITY[b.state] ?
    -1 :
  BOOK_STATE_PRIORITY[a.state] === BOOK_STATE_PRIORITY[b.state] ?
    0 :
    1;

export function ReadingList() {
  const [focusedImage, setFocusedImage] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedSeries = SERIES_FROM_ID[searchParams.get('series')!];

  const filteredBooks =
    selectedSeries !== undefined ?
      books.filter(({ series }) => series === selectedSeries) :
      books.sort(comparePriority);

  return (
    <div className={styles.readingList}>
      <h1>Reading List</h1>
      <p>Books I'm reading and books I've read.</p>
      {selectedSeries !== undefined
        ? <>
          <div
            style={{
              display: 'inline-flex',
              padding: '5px 2px',
              alignItems: 'center',
              marginBottom: '5px',
              gap: '5px',
              cursor: 'pointer',
            }}
            onClick={() => {
              setSearchParams({})
            }}
          >
            <img
              src={icons.seriesBackButton.href}
              style={{
                filter: 'invert(100%)',
                width: '20px',
                height: '20px',
              }}
            />
            <p>All</p>
          </div>
          <h2>{SERIES_TITLE[selectedSeries]}</h2>
        </>
        : null
      }
      <section className={styles.books}>
        {filteredBooks.toReversed().map((book, i) => (
          <BookEntry
            key={`book${i}`}
            book={book}
            onCoverClick={image => {
              setFocusedImage(image)
            }}
            onSeriesChipClick={(series: Series) => {
              const seriesId = SERIES_ID[series];
              setSearchParams({ series: seriesId })
            }}
          />
        ))}
      </section>
      {focusedImage !== null
        ? <FocusedImage
          image={focusedImage}
          onClose={() => {
            setFocusedImage(null)
          }}
        />
        : null
      }
    </div>
  )
}

function BookEntry({ book, onCoverClick, onSeriesChipClick }: {
  book: Book,
  onCoverClick: Function,
  onSeriesChipClick: Function,
}) {
  const { title, author, description, image, state, series } = book;
  return (
    <div className={
      styles.bookEntry + ' ' +
      (state === BookState.InProgress ? styles.inProgress : '')
    }>
      <img
        src={image.href}
        alt={`Cover of the book ${title} by ${author}`}
        aria-label={`Cover of the book ${title} by ${author}`}
        onClick={() => {
          onCoverClick(image)
        }}
      />
      <div>
        <h4>{author}</h4>
        <h3>{title}</h3>
        <p dangerouslySetInnerHTML={{ __html: description }}/>
        <div className={styles.chips}>
          <StateChip state={state}/>
          {series !== null ?
            <SeriesChip
              series={series}
              onClick={() => onSeriesChipClick(series)}
            /> :
            null
          }
        </div>
      </div>
    </div>
  );
}

function StateChip({ state }: { state: BookState }) {
  let color: string;
  let label: string;
  switch (state) {
    case BookState.Todo:
      color = '#7f849c'
      label = 'Todo'
      break;
    case BookState.InProgress:
      color = '#89b4fa'
      label = 'In Progress'
      break;
    default:
      return null;
  }
  return <Chip color={color}>{label}</Chip>;
}

function SeriesChip({ series, onClick }: { series: Series, onClick: Function }) {
  switch (series) {
    case Series.WheelOfTime:
      return (
        <Chip
          onClick={onClick}
          style={{
            cursor: 'pointer',
            background: `url(${brushedGoldPattern.href})`,
            backgroundPosition: 'left',
            backgroundSize: '110%',
            fontWeight: 'bold',
            color: 'black',
            boxShadow: '0px 1px 5px black',
          }}
        >
          <img
            src={icons.wheelOfTime.href}
            alt="Wheel of Time Logo"
            style={{ filter: 'invert(0%)' }}
          />
          <span>The Wheel of Time</span>
        </Chip>
      );

    case Series.Dune:
      return (
        <Chip
          color='#fe640b'
          onClick={onClick}
          style={{ cursor: 'pointer' }}
        >
          <span>Dune</span>
        </Chip>
      );

    case Series.Mistborn:
      return (
        <Chip
          color='#CDD8D9'
          onClick={onClick}
          style={{ cursor: 'pointer', color: catppuccin.base }}
        >
          <img
            src={icons.atium.href}
            alt="Symbol for Atium, fictional metal from Mistborn by Brandon Sanderson"
            style={{}}
          />
          <span>Mistborn</span>
        </Chip>
      );

    case Series.IceAndFire:
      return (
        <Chip
          color='hsl(343deg, 81%, 60%)'
          onClick={onClick}
          style={{ cursor: 'pointer' }}
        >
          <img
            src={icons.iceAndFire.href}
            alt="Sigil of House Stark from A Song of Ice and Fire by George R. R. Martin"
            style={{
              filter: 'invert(100%)',
            }}
          />
          <span>A Song of Ice and Fire</span>
        </Chip>
      );

    case Series.StormlightArchive:
      return (
        <Chip
          color='#515966'
          onClick={onClick}
          style={{ cursor: 'pointer' }}
        >
          <img
            src={icons.stormlightArchive}
            alt="Logo for The Stormlight Archive by Brandon Sanderson"
            style={{
              filter: 'invert(100%)',
            }}
          />
          <span>The Stormlight Archive</span>
        </Chip>
      );
  }
}

function FocusedImage({ image, onClose }: { image: URL, onClose: Function }) {
  return (
    <div className={styles.focusedImage} onClick={e => {
      if (e.target !== e.currentTarget)
        return;
      onClose();
    }}>
      <img src={image.href}/>
      <button onClick={() => {
        onClose();
      }}>
        <img src={icons.close.href}/>
      </button>
    </div>
  )
}