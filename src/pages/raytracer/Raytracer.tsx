import { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css'

import { useDarkMode } from '../components/DarkModeContext';
import styles from './Raytracer.module.scss';
import { isSome, when } from '../lib';
import { Connection, Message, ConnectionEvent, PixelsMessage } from './connection';


const WIDTH = 600;
const HEIGHT = 450;
const SERVER = new URL("ws://127.0.0.1:8080");

const SCENE_OPTIONS = [
  ["Cornell Box", "cornell_box"],
  ["Cubes", "cubes"],
  ["Flying Unicorn", "flying_unicorn"],
];

const SPP_OPTIONS = [
  4,
  16,
  64,
];


interface RenderResult {
  imageBitmap: ImageBitmap,
  /** In seconds with millisecond precision. */
  timeToRender: number,
}


interface RenderJob {
  pixelsRendered: number,
  start: number,
}


export function Raytracer() {
  const [scene, setScene] = useState('cornell_box');
  const [spp, setSpp] = useState(SPP_OPTIONS[0]);
  const [renderResults, setRenderResults] = useState([] as RenderResult[]);
  const canvasRef = useRef(null as HTMLCanvasElement | null);
  const [error, setError] = useState(null as string | null);
  const { darkModeOn } = useDarkMode();

  const connectionRef = useRef(null as Connection | null);
  const renderJobRef = useRef(null as RenderJob | null);
  // Kludge to make sure we rerender progress indicator when we receive pixels.
  // Necessary because onMessage is stale with respect to state, since it is added
  // as an event listener to the WebSocket exactly once.
  const [pixelsRendered, setPixelsRendered] = useState(0);
  const [rendering, setRendering] = useState(false);

  function startRendering() {
    renderJobRef.current = {
      pixelsRendered: 0,
      start: Date.now(),
    };
    setPixelsRendered(0);
    setRendering(true);
    connectionRef.current!.send(JSON.stringify({
      type: 'render',
      scene,
      spp,
    }));
  }

  function stopRendering() {
    renderJobRef.current = null;
    connectionRef.current!.send(JSON.stringify({ type: 'stop_rendering' }));
    setPixelsRendered(0);
    setRendering(false);
  }

  async function finishRendering() {
    const ctx = canvasRef.current!.getContext('2d')!;
    const imageBitmap =
      await createImageBitmap(ctx.getImageData(0, 0, WIDTH, HEIGHT));
    const timeToRender = (Date.now() - renderJobRef.current!.start) / 1000;
    setRenderResults(rrs =>
      [
        { imageBitmap, timeToRender, },
        ...rrs,
      ]
    );
    renderJobRef.current = null;
    setPixelsRendered(0);
    setRendering(false);
  }

  async function onMessage(msg: Message) {
    switch (msg.type) {
      case ConnectionEvent.Pixels:
        if (!isSome(renderJobRef.current))
          break;
        const renderJob = renderJobRef.current;

        const { numPixels, x, y, pixels } = msg as PixelsMessage;
        const imageData = new ImageData(numPixels, 1);
        for (let i = 0; i < numPixels; i++) {
          imageData.data.set(pixels.subarray(i * 3, i * 3 + 3), i * 4);
          imageData.data[i * 4 + 3] = 255;
        }
        const ctx = canvasRef.current!.getContext('2d')!;
        ctx.putImageData(imageData, x, y);

        const newPixelsRendered = renderJob.pixelsRendered + numPixels;
        if (newPixelsRendered < WIDTH * HEIGHT) {
          renderJob.pixelsRendered = newPixelsRendered;
          setPixelsRendered(newPixelsRendered);
        } else {
          finishRendering();
        }
        break;
    }
  }

  function onConnectionClose(e: CloseEvent) {
    toast('Connection to server closed.', {
      type: 'error',
      position: 'bottom-center',
    });
  }

  const onSettingsSubmit = e => {
    e.preventDefault();
    if (!connectionRef.current?.isOpen())
      return;
    if (rendering)
      stopRendering();
    else
      startRendering();
  };

  useEffect(() => {
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const connection = new Connection({
      url: SERVER,
    });
    connection.addEventListener(ConnectionEvent.Pixels, onMessage);
    connection.addEventListener(ConnectionEvent.Close, onConnectionClose);
    connectionRef.current = connection;
    return () => {
      connection.close();
    };
  }, []);

  return (
    <div className={styles.raytracer}>
      <div className={styles.canvasArea}>
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
        />
        {when(
          rendering,
          () => {
            const completion = pixelsRendered / (WIDTH * HEIGHT) * 100;
            return <p>Rendering: {completion.toFixed(1)}%</p>;
          }
        )}
      </div>
      <div className={styles.controlsArea}>
        <Settings
          rendering={rendering}
          scene={scene}
          setScene={setScene}
          spp={spp}
          setSpp={setSpp}
          onSubmit={onSettingsSubmit}
        />
        {/* {when(
          isSome(error),
          <div style={{ color: 'red' }}>{error}</div>
        )} */}
      </div>
      <div className={styles.resultsArea}>
        {when(
          renderResults.length > 0,
          <RenderResults renderResults={renderResults}/>,
        )}
      </div>
      <ToastContainer/>
    </div>
  )
}


function Settings({ rendering, scene, setScene, spp, setSpp, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="select-scene">Scene</label>
        <select
          id="select-scene"
          value={scene}
          onChange={e => setScene(e.target.value)}
        >
          {SCENE_OPTIONS.map(([name, value], i) => (
            <option key={`opt${i}`} value={value}>{name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="select-spp">Samples Per Pixel</label>
        <select
          id="select-spp"
          value={spp}
          onChange={e => setSpp(parseInt(e.target.value))}
        >
          {SPP_OPTIONS.map((spp, i) => (
            <option key={`opt${i}`} value={spp}>{spp}</option>
          ))}
        </select>
      </div>
      <button type="submit">
        {rendering ? '■ Stop' : 'Render'}
      </button>
    </form>
  );
}


function RenderResults({ renderResults }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Time to Render</th>
        </tr>
      </thead>
      <tbody>
        {renderResults.map(({ imageBitmap, timeToRender }, i) => (
          <tr key={`row${i}`}>
            <td>
              <ImageBitmapView bitmap={imageBitmap} />
            </td>
            <td>{timeToRender.toFixed(1)}s</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}


function ImageBitmapView({ bitmap }: {
  bitmap: ImageBitmap,
}) {
  const canvasRef = useRef(null as HTMLCanvasElement | null);
  const width = 100;
  const height = width * bitmap.height / bitmap.width;

  useEffect(() => {
    (async () => {
      const resizedBitmap = await createImageBitmap(bitmap, {
        resizeWidth: width,
        resizeHeight: height
      });
      canvasRef
        .current
        ?.getContext('bitmaprenderer')
        ?.transferFromImageBitmap(resizedBitmap);
    })()
  }, [canvasRef, bitmap]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
    />
  );
}


function About() {
  const [isOpen, setIsOpen] = useState(false);
  const btnRef = useRef(null as HTMLButtonElement | null);

  return (
    <>
      {/* <IconButton 
        ref={btnRef}
        variant='solid'
        aria-label='Color mode toggle'
        rounded='full'
        size='sm'
        icon={<FaInfoCircle/>}
        onClick={() => {
          setIsOpen(true);
        }}
      />
      <Drawer
        isOpen={isOpen}
        placement='left'
        size='full'
        onClose={() => {
          setIsOpen(false);
        }}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay/>
        <DrawerContent>
          <DrawerCloseButton
            position='relative'
            top={2}
            left={4}
          />
          <DrawerBody>
            <Container>
              <VStack spacing={4} align='left'>
                <Heading size='3xl'>About</Heading>
                <Text fontSize='xl'>Frontend for a raytracer written in Rust.</Text>
                <Heading size='lg'>How it Works</Heading>
              </VStack>
            </Container>
          </DrawerBody>
        </DrawerContent>
      </Drawer> */}
    </>
  )
}
