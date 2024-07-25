import { useState, useEffect, useRef, useMemo } from 'react';

import { useDarkMode } from '../components/DarkModeContext';
import styles from './Raytracer.module.scss';
import { isSome, when } from '../lib';


const WIDTH = 600;
const HEIGHT = 450;
const SERVER = "ws://localhost:8080";


interface RenderResult {
  imageBitmap: ImageBitmap,
  /** In seconds with millisecond precision. */
  timeToRender: number,
}


const sceneOptions = [
  ["Cornell Box", "cornell_box"],
  ["Cubes", "cubes"],
  ["Flying Unicorn", "flying_unicorn"],
];

const sppOptions = [
  4,
  8,
  16,
  32,
  64,
];


interface RenderJob {
  start: number,
  pixelsRendered: number,
}

let renderJob: RenderJob | null = null;
let socket: WebSocket;


enum MessageType {
  RenderedPixels = 0,
}


export function Raytracer() {
  const [scene, setScene] = useState('cornell_box');
  const [spp, setSpp] = useState(sppOptions[0]);
  const [rendering, setRendering] = useState(false);
  const [renderResults, setRenderResults] = useState([] as RenderResult[]);
  const canvasRef = useRef(null as HTMLCanvasElement | null);
  const [error, setError] = useState(null);
  const { darkModeOn } = useDarkMode();
  const [pixelsRendered, setPixelsRendered] = useState(0);

  const onMessage = async (e) => {
    const view = new DataView(e.data);
    const messageType = view.getUint8(0) as MessageType;
    switch (messageType) {
    case MessageType.RenderedPixels:
      const numPixels = view.getUint8(1);
      const ctx = canvasRef.current!.getContext('2d')!;
      // Leverage the fact pixels will be contiguous horizontal slice
      const x = view.getUint16(2, true);
      const y = view.getUint16(4, true);
      const pixels = new Uint8Array(view.buffer, 6);
      const imageData = ctx.createImageData(numPixels, 1);
      for (let i = 0; i < numPixels; i++) {
        imageData.data.set(pixels.subarray(i * 3, i * 3 + 3), i * 4);
        imageData.data[i * 4 + 3] = 255;
      }
      ctx.putImageData(imageData, x, y);

      renderJob!.pixelsRendered += numPixels;
      setPixelsRendered(renderJob!.pixelsRendered);
      const lastPixel = WIDTH * HEIGHT;
      if (renderJob!.pixelsRendered >= lastPixel) {
        const timeToRender = (Date.now() - renderJob!.start) / 1000;
        const imageBitmap =
          await createImageBitmap(ctx.getImageData(0, 0, WIDTH, HEIGHT));
        setRenderResults(rrs =>
          [{ imageBitmap, timeToRender }, ...renderResults]
        );
        renderJob = null;
        setRendering(false);
      }
      break;
    }
  };

  useEffect(() => {
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    socket = new WebSocket(SERVER);
    socket.binaryType = 'arraybuffer';

    socket.addEventListener('open', e => {
      console.log('Connected to server.');
    });

    socket.addEventListener('close', e => {
      console.log('Connection to server closed.');
    });

    socket.addEventListener('message', onMessage);

    return () => socket.close();
  }, []);

  const completion = (pixelsRendered / (WIDTH * HEIGHT) * 100).toFixed(1);

  return (
    <div className={styles.raytracer}>
      <div className={styles.canvasArea}>
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          style={{
            boxShadow:
              darkModeOn ?
                'none' :
                '0px 8px 15px #999'
          }}
        />
        {when(rendering, <p>Rendering: {completion}%</p>)}
      </div>
      <div className={styles.controlsArea}>
        <Controls
          rendering={rendering}
          scene={scene}
          setScene={setScene}
          spp={spp}
          setSpp={setSpp}
          onSubmit={e => {
            e.preventDefault();
            if (rendering) {
              socket.send(JSON.stringify({ type: 'stop_rendering' }));
              setPixelsRendered(0);
              setRendering(false);
              return;
            }
            renderJob = {
              pixelsRendered: 0,
              start: Date.now(),
            };
            setRendering(true);
            setPixelsRendered(0);
            socket.send(JSON.stringify({
              type: 'render',
              scene,
              spp,
            }));
          }}
        />
        {when(
          isSome(error),
          <div style={{ color: 'red' }}>{error}</div>
        )}
      </div>
      <div className={styles.resultsArea}>
        <RenderResults renderResults={renderResults}/>
      </div>
    </div>
  )
}


function Controls({ rendering, scene, setScene, spp, setSpp, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="select-scene">Scene</label>
        <select
          id="select-scene"
          value={scene}
          onChange={e => setScene(e.target.value)}
        >
          {sceneOptions.map(([name, value], i) => (
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
          {sppOptions.map((spp, i) => (
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
              <ImageBitmapView bitmap={imageBitmap}/>
            </td>
            <td>{timeToRender.toFixed(1)}s</td>
          </tr>
        ))}
      </tbody>
    </table>
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
