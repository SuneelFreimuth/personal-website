import { bookCovers } from "../../assets"


export enum BookState {
    Done,
    InProgress,
    Todo
}

const S = BookState

export enum Series {
    Mistborn,
    WheelOfTime,
    Dune,
    IceAndFire,
    StormlightArchive,
    HyperionCantos,
    SunEater,
}

export interface Book {
    title: string
    author: string
    // Will be used in dangerouslySetInnerHTML
    description: string
    image: URL
    series?: Series
    state: BookState
}

export const books: Book[] = [
    {
        title: 'Eye of the World',
        author: 'Robert Jordan',
        description: 'The first book of <em>The Wheel of Time</em>, an epic fantasy series following the lives of five friends as they explore the world and find their place within it.',
        image: bookCovers.eyeOfTheWorld,
        series: Series.WheelOfTime,
        state: S.Done,
    },
    {
        title: 'The Great Hunt',
        author: 'Robert Jordan',
        description: 'The second book of <em>The Wheel of Time</em>.',
        image: bookCovers.theGreatHunt,
        series: Series.WheelOfTime,
        state: S.Done,
    },
    {
        title: 'The Dragon Reborn',
        author: 'Robert Jordan',
        description: 'The third book of <em>The Wheel of Time</em>.',
        image: bookCovers.theDragonReborn,
        series: Series.WheelOfTime,
        state: S.Done,
    },
    {
        title: 'The Shadow Rising',
        author: 'Robert Jordan',
        description: 'The fourth book of <em>The Wheel of Time</em>; my favorite entry in the series.',
        image: bookCovers.theShadowRising,
        series: Series.WheelOfTime,
        state: S.Done,
    },
    {
        title: 'The Fires of Heaven',
        author: 'Robert Jordan',
        description: 'The fifth book of <em>The Wheel of Time</em>.',
        image: bookCovers.theFiresOfHeaven,
        series: Series.WheelOfTime,
        state: S.Done,
    },
    {
        title: 'Lord of Chaos',
        author: 'Robert Jordan',
        description: 'The sixth book of <em>The Wheel of Time</em>.',
        image: bookCovers.lordOfChaos,
        series: Series.WheelOfTime,
        state: S.Done,
    },
    {
        title: 'A Crown of Swords',
        author: 'Robert Jordan',
        description: 'The seventh book of <em>The Wheel of Time</em>.',
        image: bookCovers.aCrownOfSwords,
        series: Series.WheelOfTime,
        state: S.Done,
    },
    {
        title: 'The Path of Daggers',
        author: 'Robert Jordan',
        description: 'The eighth book of <em>The Wheel of Time</em>.',
        image: bookCovers.thePathOfDaggers,
        series: Series.WheelOfTime,
        state: S.Done,
    },
    {
        title: 'Winter\'s Heart',
        author: 'Robert Jordan',
        description: 'The ninth book of <em>The Wheel of Time</em>.',
        image: bookCovers.wintersHeart,
        series: Series.WheelOfTime,
        state: S.Done,
    },
    {
        title: 'Crossroads of Twilight',
        author: 'Robert Jordan',
        description: 'The tenth book of <em>The Wheel of Time</em>.',
        image: bookCovers.crossroadsOfTwilight,
        series: Series.WheelOfTime,
        state: S.Done,
    },
    {
        title: 'Knife of Dreams',
        author: 'Robert Jordan',
        description: 'The eleventh book of <em>The Wheel of Time</em>.',
        image: bookCovers.knifeOfDreams,
        series: Series.WheelOfTime,
        state: S.Done,
    },
    {
        title: 'The Gathering Storm',
        author: 'Robert Jordan & Brandon Sanderson',
        description: 'The twelfth book of <em>The Wheel of Time</em>.',
        image: bookCovers.theGatheringStorm,
        series: Series.WheelOfTime,
        state: S.Done,
    },
    {
        title: 'Towers of Midnight',
        author: 'Robert Jordan & Brandon Sanderson',
        description: 'The thirteenth book of <em>The Wheel of Time</em>.',
        image: bookCovers.towersOfMidnight,
        series: Series.WheelOfTime,
        state: S.Done,
    },
    {
        title: 'A Memory of Light',
        author: 'Robert Jordan & Brandon Sanderson',
        description: 'The fourteenth and last book of <em>The Wheel of Time</em>.',
        image: bookCovers.aMemoryOfLight,
        series: Series.WheelOfTime,
        state: S.Done,
    },
    {
        title: 'New Spring',
        author: 'Robert Jordan',
        description: 'Prequel to <em>The Wheel of Time</em>.',
        image: bookCovers.newSpring,
        series: Series.WheelOfTime,
        state: S.Done,
    },
    {
        title: 'Dune',
        author: 'Frank Herbert',
        description: 'First book of <em>Dune</em>.',
        image: bookCovers.dune,
        series: Series.Dune,
        state: S.Done,
    },
    {
        title: 'A Game of Thrones',
        author: 'George R. R. Martin',
        description: 'First book of <em>A Song of Ice and Fire</em>.',
        image: bookCovers.aGameOfThrones,
        series: Series.IceAndFire,
        state: S.Todo,
    },
    {
        title: 'Dune Messiah',
        author: 'Frank Herbert',
        description: 'Second book of <em>Dune</em>.',
        image: bookCovers.duneMessiah,
        series: Series.Dune,
        state: S.Todo,
    },
    {
        title: 'Mistborn',
        author: 'Brandon Sanderson',
        description: 'First book of the <em>Mistborn</em> trilogy.',
        image: bookCovers.mistborn,
        series: Series.Mistborn,
        state: S.Done,
    },
    {
        title: 'The Well of Ascension',
        author: 'Brandon Sanderson',
        description: 'Second book of the <em>Mistborn</em> trilogy.',
        image: bookCovers.theWellOfAscension,
        series: Series.Mistborn,
        state: S.Done,
    },
    {
        title: 'Hero of Ages',
        author: 'Brandon Sanderson',
        description: 'Third book of the <em>Mistborn</em> trilogy.',
        image: bookCovers.heroOfAges,
        series: Series.Mistborn,
        state: S.Done,
    },
    {
        title: 'Warbreaker',
        author: 'Brandon Sanderson',
        description: '',
        image: bookCovers.warbreaker,
        state: S.Done,
    },
    {
        title: 'Elantris',
        author: 'Brandon Sanderson',
        description: '',
        image: bookCovers.elantris,
        state: S.Done,
    },
    {
        title: 'The Way of Kings',
        author: 'Brandon Sanderson',
        description: 'First book of <em>The Stormlight Archive</em>.',
        image: bookCovers.theWayOfKings,
        series: Series.StormlightArchive,
        state: S.Done,
    },
    {
        title: 'Hyperion',
        author: 'Dan Simmons',
        description: '',
        image: bookCovers.hyperion,
        series: Series.HyperionCantos,
        state: S.Done,
    },
    {
        title: 'The Fall of Hyperion',
        author: 'Dan Simmons',
        description: '',
        image: bookCovers.theFallOfHyperion,
        series: Series.HyperionCantos,
        state: S.Done,
    },
    {
        title: 'Empire of Silence',
        author: 'Christopher Ruocchio',
        description: '',
        image: bookCovers.empireOfSilence,
        series: Series.SunEater,
        state: S.InProgress,
    },
    // {
    //     title: 'Words of Radiance',
    //     author: 'Brandon Sanderson',
    //     description: 'Second book of <em>The Stormlight Archive</em>.',
    //     image: bookCovers.wordsOfRadiance,
    //     series: Series.StormlightArchive,
    //     state: S.InProgress,
    // },
]
