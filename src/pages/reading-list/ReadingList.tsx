import { useState, useEffect, ComponentProps } from 'react';
import { useSearchParams } from 'react-router';

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
  [Series.SunEater]: 'sun-eater',
  [Series.FirstLaw]: 'first-law',
};

const SERIES_FROM_ID: { [id: string]: Series } = {
  'dune': Series.Dune,
  'mistborn': Series.Mistborn,
  'wheel-of-time': Series.WheelOfTime,
  'ice-and-fire': Series.IceAndFire,
  'stormlight-archive': Series.StormlightArchive,
  'hyperion-cantos': Series.HyperionCantos,
  'sun-eater': Series.SunEater,
  'first-law': Series.FirstLaw,
};

const SERIES_TITLE: { [s in Series]: string } = {
  [Series.Dune]: 'Dune',
  [Series.Mistborn]: 'Mistborn',
  [Series.WheelOfTime]: 'The Wheel of Time',
  [Series.IceAndFire]: 'A Song of Ice and Fire',
  [Series.StormlightArchive]: 'The Stormlight Archive',
  [Series.HyperionCantos]: 'Hyperion Cantos',
  [Series.SunEater]: 'Sun Eater',
  [Series.FirstLaw]: 'The First Law',
};

const SERIES_LIST =
  Object.values(Series).filter(s => s !== Series.IceAndFire).sort() as Series[];


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

function ImageStack({ images }: { images: Array<URL> }) {
  const [hovered, setHovered] = useState(false);

  // const padding = '15px';
  // const aspectRatio = 6 / 10;
  // const coverHeight = 350;
  // const coverWidth = Math.floor(aspectRatio * coverHeight);
  const coverHeight = '400px';
  const coverWidth = 'auto';
  // const coverHeight = 200;
  // const coverWidth = 200;

  return (
    <div
      className={styles.imageStack}
      onMouseOver={() => {
        setHovered(true);
      }}
      onMouseOut={() => {
        setHovered(false);
      }}
    >
      {images.map((image, i) => {
        const style =
          hovered ?
            {
              zIndex: images.length - i,
              left: `calc(${i * 100 / images.length}%)`,
              transform: `none`,
              width: coverWidth,
              height: coverHeight,
            } :
            {
              zIndex: images.length - i,
              left: `calc(${20 * i}px)`,
              transform: `perspective(1000px) rotateY(-15deg) scale(${1 - 0.01 * i})`,
              width: coverWidth,
              height: coverHeight,
            };
        return (
          <img
            src={image.href}
            style={style}
            key={`coverStack${i}`}
          />
        )
      })}
    </div>
  );
}

function BookEntry({
  book: { title, author, description, image, state, series, },
  onCoverClick,
  onSeriesChipClick
}: {
  book: Book,
  onCoverClick: () => void,
  onSeriesChipClick: () => void,
}) {
  return (
    <div className={cn(
      styles.bookEntry,
      cnWhen(state === BookState.InProgress, styles.inProgress),
    )}>
      {when(
        state === BookState.InProgress,
        <p className={styles.inProgressLabel}>Reading</p>
      )}
      <div className={styles.bookCover}>
        <img
          src={image.href}
          alt={`Cover of the book ${title} by ${author}`}
          aria-label={`Cover of the book ${title} by ${author}`}
          onClick={() => {
            if (!onMobile()) {
              onCoverClick();
            }
          }}
        />
      </div>
      <div className={styles.bookDetails}>
        <h3>{title}</h3>
        <h4>{author}</h4>
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
        <p dangerouslySetInnerHTML={{ __html: description }}/>
      </div>
    </div>
  );
}

function StateChip({ state }: { state: BookState }) {
  switch (state) {
    case BookState.Todo:
      return <Chip bgColor='#7f849c' fgColor='white'>Todo</Chip>;

    case BookState.InProgress:
    case BookState.Done:
      return null;
  }
}

function SeriesChip({ series, onClick }: ComponentProps<'span'> & { series: Series }) {
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
          bgColor='#e8b13c'
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
          bgColor='hsl(182.8deg, 25%, 58%)'
          onClick={onClick}
          style={{
            backgroundImage: `url(${patterns.highstorm.href})`,
            backgroundSize: '364%',
            backgroundPosition: '89% 31.8%',
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
          bgColor='hsl(0deg, 10%, 46%)'
          onClick={onClick}
          style={{
            backgroundImage: `url(${patterns.needles.href})`,
            backgroundSize: '250%',
            backgroundPosition: '47% 68%',
            backgroundBlendMode: 'multiply',
          }}
        >
          <span>Hyperion Cantos</span>
        </Chip>
      );

    case Series.SunEater:
      return (
        <Chip
          className={styles.seriesChip}
          fgColor='white'
          bgColor='hsl(0deg, 0%, 90%)'
          onClick={onClick}
          style={{
            backgroundImage: `url(${patterns.sun.href})`,
            backgroundSize: '300%',
            backgroundPosition: '50% 37%',
            // letterSpacing: '1px'
          }}
        >
          <span>Sun Eater</span>
        </Chip>
      );

    case Series.FirstLaw:
      return (
        <Chip
          className={styles.seriesChip}
          fgColor='white'
          bgColor='hsl(0deg, 0%, 90%)'
          onClick={onClick}
          style={{
            backgroundImage: `url(${patterns.blood.href})`,
            backgroundSize: '171%',
            // backgroundPosition: '100% 53%',
            backgroundPosition: '40% 76%',
            // letterSpacing: '1px'
          }}
        >
          <span>The First Law</span>
        </Chip>
      );
  }
}

function FocusedImage({ className, image, onClose }: {
  className?: string;
  image: URL;
  onClose: () => void;
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
