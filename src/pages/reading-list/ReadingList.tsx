import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { books, Book, BookState, Series } from './books';
import { Chip } from '../components/Chip';
import styles from './ReadingList.module.scss';
import catppuccin from '../../catppuccin';
import { icons, patterns } from '../../assets'
import { isSome, cn, cnWhen, when, onMobile } from '../lib';
import { Fade } from '../components/Fade';


const SERIES_ID: { [s in Series]: string } = {
  [Series.Dune]: 'dune',
  [Series.Mistborn]: 'mistborn',
  [Series.WheelOfTime]: 'wheel-of-time',
  [Series.IceAndFire]: 'ice-and-fire',
  [Series.StormlightArchive]: 'stormlight-archive',
  [Series.HyperionCantos]: 'hyperion-cantos',
};

const SERIES_FROM_ID: { [id: string]: Series } = {
  'dune': Series.Dune,
  'mistborn': Series.Mistborn,
  'wheel-of-time': Series.WheelOfTime,
  'ice-and-fire': Series.IceAndFire,
  'stormlight-archive': Series.StormlightArchive,
  'hyperion-cantos': Series.HyperionCantos,
};

const SERIES_TITLE: { [s in Series]: string } = {
  [Series.Dune]: 'Dune',
  [Series.Mistborn]: 'Mistborn',
  [Series.WheelOfTime]: 'The Wheel of Time',
  [Series.IceAndFire]: 'A Song of Ice and Fire',
  [Series.StormlightArchive]: 'The Stormlight Archive',
  [Series.HyperionCantos]: 'Hyperion Cantos',
};

const SERIES_LIST = Object.values(Series).sort() as Series[];


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

  function selectSeries(series: Series) {
    const seriesId = SERIES_ID[series];
    setSearchParams({ series: seriesId });
  }

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
      <div className={styles.seriesChips}>
        {SERIES_LIST.map(series =>
          <SeriesChip
            key={series}
            className={styles.seriesChip}
            series={series}
            onClick={() => {
              selectSeries(series);
            }}
          />
        )}
      </div>
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
              selectSeries(book.series!);
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

function BookEntry({
  book: { title, author, description, image, state, series, },
  onCoverClick,
  onSeriesChipClick
}: {
  book: Book,
  onCoverClick: Function,
  onSeriesChipClick: Function,
}) {
  return (
    <div className={cn(
      styles.bookEntry,
      cnWhen(state === BookState.InProgress, styles.inProgress),
    )}>
      <div className={styles.bookCover}>
        <img
          src={image.href}
          alt={`Cover of the book ${title} by ${author}`}
          aria-label={`Cover of the book ${title} by ${author}`}
          onClick={onMobile() ? undefined : onCoverClick}
        />
      </div>
      <div className={styles.bookDetails}>
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
  let bgColor: string;
  let label: string;
  switch (state) {
    case BookState.Todo:
      bgColor = '#7f849c';
      label = 'Todo';
      break;
    case BookState.InProgress:
      bgColor = '#89b4fa';
      label = 'In Progress';
      break;
    default:
      return null;
  }
  return <Chip bgColor={bgColor} fgColor='white'>{label}</Chip>;
}

function SeriesChip({ series, onClick }: { series: Series, onClick: Function }) {
  switch (series) {
    case Series.WheelOfTime:
      return (
        <Chip
          className={styles.seriesChip}
          onClick={onClick}
          fgColor='black'
          style={{
            background: `url(${patterns.shinyGold.href})`,
            backgroundPosition: 'left',
            backgroundSize: '110%',
          }}
        >
          <img
            src={icons.wheelOfTime.href}
            alt="Wheel of Time Logo"
          />
          <span>The Wheel of Time</span>
        </Chip>
      );

    case Series.Dune:
      return (
        <Chip
          className={styles.seriesChip}
          fgColor='white'
          bgColor='#ffcc8e'
          onClick={onClick}
          style={{
            backgroundImage: `url(${patterns.sand.href})`,
            backgroundSize: '400%',
            backgroundPosition: 'center',
            backgroundBlendMode: 'multiply',
          }}
        >
          <span>Dune</span>
        </Chip>
      );

    case Series.Mistborn:
      return (
        <Chip
          className={styles.seriesChip}
          fgColor={catppuccin.base}
          bgColor='#a0a9aa'
          onClick={onClick}
          style={{
            backgroundImage: `url(${patterns.mist.href})`,
            backgroundPosition: 'center',
            backgroundSize: '150%',
          }}
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
          fgColor='white'
          bgColor='hsl(1, 17%, 71%)'
          onClick={onClick}
          style={{
            backgroundImage: `url(${patterns.dragon.href})`,
            backgroundSize: '155%',
            backgroundPosition: '56% 7%',
            backgroundBlendMode: 'multiply',
          }}
        >
          {/* <img
            src={icons.iceAndFire.href}
            alt="Sigil of House Stark from A Song of Ice and Fire by George R. R. Martin"
            style={{
              filter: 'invert(100%)',
            }}
          /> */}
          <span>A Song of Ice and Fire</span>
        </Chip>
      );

    case Series.StormlightArchive:
      return (
        <Chip
          className={styles.seriesChip}
          fgColor='black'
          bgColor='hsl(182.8deg, 45%, 74.5%)'
          onClick={onClick}
          style={{
            backgroundImage: `url(${patterns.highstorm.href})`,
            backgroundSize: '320%',
            backgroundPosition: '90% 31%',
            backgroundBlendMode: 'luminosity',
          }}
        >
          <img
            src={icons.stormlightArchive.href}
            alt="Logo for The Stormlight Archive by Brandon Sanderson"
          />
          <span>The Stormlight Archive</span>
        </Chip>
      );

    case Series.HyperionCantos:
      return (
        <Chip
          className={styles.seriesChip}
          fgColor='white'
          bgColor='hsl(0deg, 0%, 20%)'
          onClick={onClick}
          style={{
            backgroundImage: `url(${patterns.needles.href})`,
            backgroundSize: '250%',
            backgroundPosition: '47% 68%',
            backgroundBlendMode: 'soft-light',
          }}
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
