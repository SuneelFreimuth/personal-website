export enum BookState {
    Done,
    InProgress,
    Todo
}

const S = BookState

export interface Book {
    title: string
    author: string
    // Will be used in dangerouslySetInnerHTML
    description: string
    image: URL
    state: BookState
}

export const books: Book[] = [
    {
        title: 'Eye of the World',
        author: 'Robert Jordan',
        description: 'The first book of <em>The Wheel of Time</em>, an epic fantasy series following the lives of five friends as they explore the world and find their place within it.',
        image: new URL('../assets/book-covers/eye-of-the-world.jpeg', import.meta.url),
        state: S.Done
    },
    {
        title: 'The Great Hunt',
        author: 'Robert Jordan',
        description: 'The second book of <em>The Wheel of Time</em>.',
        image: new URL('../assets/book-covers/the-great-hunt.png', import.meta.url),
        state: S.Done
    },
    {
        title: 'The Dragon Reborn',
        author: 'Robert Jordan',
        description: 'The third book of <em>The Wheel of Time</em>.',
        image: new URL('../assets/book-covers/the-dragon-reborn.jpeg', import.meta.url),
        state: S.Done
    },
    {
        title: 'The Shadow Rising',
        author: 'Robert Jordan',
        description: 'The fourth book of <em>The Wheel of Time</em>; my favorite entry in the series.',
        image: new URL('../assets/book-covers/the-shadow-rising.jpg', import.meta.url),
        state: S.Done
    },
    {
        title: 'The Fires of Heaven',
        author: 'Robert Jordan',
        description: 'The fifth book of <em>The Wheel of Time</em>.',
        image: new URL('../assets/book-covers/the-fires-of-heaven.jpg', import.meta.url),
        state: S.Done
    },
    {
        title: 'Lord of Chaos',
        author: 'Robert Jordan',
        description: 'The sixth book of <em>The Wheel of Time</em>.',
        image: new URL('../assets/book-covers/lord-of-chaos.png', import.meta.url),
        state: S.Done
    },
    {
        title: 'A Crown of Swords',
        author: 'Robert Jordan',
        description: 'The seventh book of <em>The Wheel of Time</em>.',
        image: new URL('../assets/book-covers/a-crown-of-swords.jpeg', import.meta.url),
        state: S.Done
    },
    {
        title: 'The Path of Daggers',
        author: 'Robert Jordan',
        description: 'The eighth book of <em>The Wheel of Time</em>.',
        image: new URL('../assets/book-covers/the-path-of-daggers.jpeg', import.meta.url),
        state: S.Done
    },
    {
        title: 'Winter\'s Heart',
        author: 'Robert Jordan',
        description: 'The ninth book of <em>The Wheel of Time</em>.',
        image: new URL('../assets/book-covers/winters-heart.jpeg', import.meta.url),
        state: S.Done
    },
    {
        title: 'Crossroads of Twilight',
        author: 'Robert Jordan',
        description: 'The tenth book of <em>The Wheel of Time</em>.',
        image: new URL('../assets/book-covers/crossroads-of-twilight.png', import.meta.url),
        state: S.Done
    },
    {
        title: 'Knife of Dreams',
        author: 'Robert Jordan',
        description: 'The eleventh book of <em>The Wheel of Time</em>.',
        image: new URL('../assets/book-covers/knife-of-dreams.jpg', import.meta.url),
        state: S.Done
    },
    {
        title: 'The Gathering Storm',
        author: 'Robert Jordan & Brandon Sanderson',
        description: 'The twelfth book of <em>The Wheel of Time</em>.',
        image: new URL('../assets/book-covers/the-gathering-storm.jpeg', import.meta.url),
        state: S.Done
    },
    {
        title: 'Towers of Midnight',
        author: 'Robert Jordan & Brandon Sanderson',
        description: 'The thirteenth book of <em>The Wheel of Time</em>.',
        image: new URL('../assets/book-covers/towers-of-midnight.jpeg', import.meta.url),
        state: S.Done
    },
    {
        title: 'A Memory of Light',
        author: 'Robert Jordan & Brandon Sanderson',
        description: 'The fourteenth and last book of <em>The Wheel of Time</em>.',
        image: new URL('../assets/book-covers/a-memory-of-light.jpeg', import.meta.url),
        state: S.Done
    },
    {
        title: 'New Spring',
        author: 'Robert Jordan',
        description: 'Prequel to <em>The Wheel of Time</em>.',
        image: new URL('../assets/book-covers/new-spring.jpeg', import.meta.url),
        state: S.Done
    },
    {
        title: 'Dune',
        author: 'Frank Herbert',
        description: 'First book of <em>Dune</em>.',
        image: new URL('../assets/book-covers/dune.jpeg', import.meta.url),
        state: S.Done
    },
    {
        title: 'Mistborn',
        author: 'Brandon Sanderson',
        description: 'First book of <em>Mistborn</em>.',
        image: new URL('../assets/book-covers/mistborn.avif', import.meta.url),
        state: S.InProgress
    },
    {
        title: 'Game of Thrones',
        author: 'George R. R. Martin',
        description: 'First book of <em>A Song of Ice and Fire</em>.',
        image: new URL('../assets/book-covers/game-of-thrones.jpeg', import.meta.url),
        state: S.Todo
    },
    {
        title: 'Dune Messiah',
        author: 'Frank Herbert',
        description: 'Second book of <em>Dune</em>.',
        image: new URL('../assets/book-covers/dune-messiah.jpeg', import.meta.url),
        state: S.Todo
    },
]
