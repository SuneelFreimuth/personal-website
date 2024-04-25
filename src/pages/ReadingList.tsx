import { useState } from 'react'

import { books, Book, BookState } from './books'
import { Chip } from './components/Chip'

import styles from './ReadingList.module.scss'

const CLOSE_BUTTON_ICON = new URL('../assets/close-icon.png?width=20', import.meta.url)

export function ReadingList() {
  const [focusedImage, setFocusedImage] = useState(null)

  return (
    <div className={styles.readingList}>
      <h1>Reading List</h1>
      <p>Books I'm reading and books I've read.</p>
      <section className={styles.books}>
        {books.toReversed().map(book => (
          <BookEntry
            book={book}
            onCoverClick={image => {
              setFocusedImage(image)
            }}
          />
        ))}
      </section>
      {focusedImage !== null ?
        <FocusedImage
          image={focusedImage}
          onClose={() => {
            setFocusedImage(null)
          }}
        /> :
        null
      }
    </div>
  )
}

function BookEntry({ book, onCoverClick }: { book: Book, onCoverClick: Function }) {
  const { title, author, description, image, state } = book
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
        <div>
          {(() => {
            switch (state) {
              case BookState.Todo:
                return <Chip color='#7f849c'>Todo</Chip>
              case BookState.InProgress:
                return <Chip color='#89b4fa'>In Progress</Chip>
              default:
                return null
            }
          })()}
        </div>
      </div>
    </div>
  )
}

function FocusedImage({ image, onClose }: { image: URL, onClose: Function }) {
  return (
    <div className={styles.focusedImage} onClick={e => {
      if (e.target !== e.currentTarget)
        return;
      onClose()
    }}>
      <img src={image.href}/>
      <button onClick={() => {
        onClose()
      }}>
        <img src={CLOSE_BUTTON_ICON.href}/>
      </button>
    </div>
  )
}