import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { books, Book, BookState, Series } from './books';
import { Chip } from '../components/Chip';
import styles from './ReadingList.module.scss';
import catppuccin from '../../catppuccin';
import { icons, patterns } from '../../assets'
import { isSome, cn, cnWhen, when } from '../lib';
import { Fade } from '../components/Fade';


const SERIES_ID = {
  [Series.Dune]: 'dune',
  [Series.Mistborn]: 'mistborn',
  [Series.WheelOfTime]: 'wheel-of-time',
  [Series.IceAndFire]: 'ice-and-fire',
  [Series.StormlightArchive]: 'stormlight-archive',
  [Series.HyperionCantos]: 'hyperion-cantos',
};

const SERIES_FROM_ID = {
  'dune': Series.Dune,
  'mistborn': Series.Mistborn,
  'wheel-of-time': Series.WheelOfTime,
  'ice-and-fire': Series.IceAndFire,
  'stormlight-archive': Series.StormlightArchive,
  'hyperion-cantos': Series.HyperionCantos,
};

const SERIES_TITLE = {
  [Series.Dune]: 'Dune',
  [Series.Mistborn]: 'Mistborn',
  [Series.WheelOfTime]: 'The Wheel of Time',
  [Series.IceAndFire]: 'A Song of Ice and Fire',
  [Series.StormlightArchive]: 'The Stormlight Archive',
  [Series.HyperionCantos]: 'Hyperion Cantos',
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
  const [focusedImage, setFocusedImage] = useState(null as URL | null);
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedSeries = SERIES_FROM_ID[searchParams.get('series')!];

  const books_ =
    isSome(selectedSeries) ?
      books.filter(({ series }) => series === selectedSeries) :
      books
        .sort(comparePriority)
        .toReversed();

  return (
    <div className={styles.readingList}>
      <h1>Reading List</h1>
      <p>Books I'm reading and books I've read.</p>
      {when(
        isSome(selectedSeries),
        <>
          <div
            className={styles.seriesHeader}
            onClick={() => {
              setSearchParams({})
            }}
          >
            <img src={icons.back.href} alt="back button"/>
            <span>ALL</span>
          </div>
          <h2>{SERIES_TITLE[selectedSeries]}</h2>
        </>
      )}
      <section className={styles.books}>
        {books_.map((book, i) => (
          <BookEntry
            key={`book${i}`}
            book={book}
            onCoverClick={() => {
              setFocusedImage(book.image);
            }}
            onSeriesChipClick={() => {
              const seriesId = SERIES_ID[book.series!];
              setSearchParams({ series: seriesId });
            }}
          />
        ))}
      </section>
      <Fade revealWhen={isSome(focusedImage)}>
        <FocusedImage
          image={focusedImage!}
          onClose={() => {
            setFocusedImage(null);
          }}
        />
      </Fade>
    </div>
  );
}

function BookEntry({ book, onCoverClick, onSeriesChipClick }: {
  book: Book,
  onCoverClick: Function,
  onSeriesChipClick: Function,
}) {
  const { title, author, description, image, state, series } = book;
  return (
    <div className={cn(
      styles.bookEntry,
      cnWhen(state === BookState.InProgress, styles.inProgress),
    )}>
      <img
        src={image.href}
        alt={`Cover of the book ${title} by ${author}`}
        aria-label={`Cover of the book ${title} by ${author}`}
        onClick={onCoverClick}
      />
      <div>
        <h4>{author}</h4>
        <h3>{title}</h3>
        <p dangerouslySetInnerHTML={{ __html: description }}/>
        <div className={styles.chips}>
          {when(
            isSome(series),
            <SeriesChip
              series={series!}
              onClick={onSeriesChipClick}
            />
          )}
          <StateChip state={state}/>
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
      color = '#7f849c';
      label = 'Todo';
      break;
    case BookState.InProgress:
      color = '#89b4fa';
      label = 'In Progress';
      break;
    default:
      return null;
  }
  return <Chip color={color} style={{ color: 'white'}}>{label}</Chip>;
}

function SeriesChip({ series, onClick }: { series: Series, onClick: Function }) {
  switch (series) {
    case Series.WheelOfTime:
      return (
        <Chip
          className={styles.seriesChip}
          onClick={onClick}
          style={{
            cursor: 'pointer',
            background: `url(${patterns.shinyGold.href})`,
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
          className={styles.seriesChip}
          color='#fe640b'
          onClick={onClick}
          style={{ cursor: 'pointer', color: 'white', fontWeight: 'bold' }}
        >
          <span>Dune</span>
        </Chip>
      );

    case Series.Mistborn:
      return (
        <Chip
          className={styles.seriesChip}
          color='#CDD8D9'
          onClick={onClick}
          style={{ cursor: 'pointer', color: catppuccin.base, fontWeight: 'bold' }}
        >
          <img
            src={icons.atium.href}
            alt="Symbol for Atium, fictional metal from Mistborn by Brandon Sanderson"
          />
          <span>Mistborn</span>
        </Chip>
      );

    case Series.IceAndFire:
      return (
        <Chip
          className={styles.seriesChip}
          color='hsl(0, 89%, 35%)'
          onClick={onClick}
          style={{ cursor: 'pointer', color: 'white', fontWeight: 'bold' }}
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
          className={styles.seriesChip}
          color='#515966'
          onClick={onClick}
          style={{ cursor: 'pointer', color: 'white', fontWeight: 'bold' }}
        >
          <img
            src={icons.stormlightArchive.href}
            alt="Logo for The Stormlight Archive by Brandon Sanderson"
            style={{
              filter: 'invert(100%)',
            }}
          />
          <span>The Stormlight Archive</span>
        </Chip>
      );

    case Series.HyperionCantos:
      return (
        <Chip
          className={styles.seriesChip}
          color='#fcd14d'
          onClick={onClick}
          style={{ cursor: 'pointer', color: 'white', fontWeight: 'bold' }}
        >
          <span>Hyperion Cantos</span>
        </Chip>
      );
  }
}

function FocusedImage({ className, image, onClose }: {
  className?: string,
  image: URL,
  onClose: Function,
}) {
  const [image_, setImage_] = useState(image);

  useEffect(() => {
    if (image !== null)
      setImage_(image);
  }, [image]);

  return (
    <div
      className={cn(styles.focusedImage, className)}
      onClick={e => {
        if (e.target !== e.currentTarget)
          return;
        onClose();
      }}
    >
      <img src={image_?.href}/>
      <button onClick={onClose}>
        <img src={icons.close.href}/>
      </button>
    </div>
  );
}
