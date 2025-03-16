import { Link } from 'react-router';

import { Color, randomHsl, random, lerp, hslToRgb, rgbString as rgbString, lerpColors, map } from '../lib'

import styles from './Home.module.scss'
import navStyles from '../components/Nav.module.scss'
import { AnimatedBackground } from '../components/AnimatedBackground';
import { icons } from '../../assets';


export function Home() {
  return (
    <div className={styles.home}>
      <TreeAnimation />
      <h1>Suneel Freimuth</h1>
      <div>
        <Link to="/flow" className={navStyles.glassButton}>
          <span>Simulations</span>
        </Link>
        <Link to="/reading" className={navStyles.glassButton}>
          <span><span style={{ zIndex: 3 }}>📚</span> Reading</span>
        </Link>
        <a href="https://github.com/SuneelFreimuth" className={navStyles.glassButton}>
          <span>
            <img src={icons.github.href} alt="Github logo" />
            Github
          </span>
        </a>
        <a href="/resume.pdf" className={navStyles.glassButton}><span>Resume</span></a>
      </div>
    </div>
  )
}


function TreeAnimation() {
  const randomPrettyColorHsl = (): Color => randomHsl([0, 0.7, 0.45], [359, 1, 0.8]);

  interface TreeConfig {
    maxDepth: number,
    lengthTrunk: number,
    lengthScaleLeft: number,
    lengthScaleRight: number,
    lineWidthMin: number,
    lineWidthMax: number,
    angleLeft: number,
    angleRight: number,
    colorBase: Color,
    colorTip: Color
  }

  const randomTreeConfig = (canvasWidth: number, canvasHeight: number): TreeConfig => {
    const colorTipHsl = randomPrettyColorHsl()
    const colorBaseHsl: Color = [
      colorTipHsl[0] + (Math.random() < 0.5 ? 1 : -1) * random(60, 80),
      colorTipHsl[1] - 0.3 * Math.random(),
      colorTipHsl[2] - 0.2 * Math.random()
    ];

    const angleLeft = random(Math.PI / 3, Math.PI / 10)
    const angleRight = angleLeft + random(-0.5, 0.5)

    return {
      maxDepth: 10,
      lengthTrunk: canvasHeight * 0.333,
      lengthScaleLeft: random(0.55, 0.65),
      lengthScaleRight: random(0.55, 0.65),
      lineWidthMin: 0.5,
      lineWidthMax: lerp(Math.pow(Math.random(), 2), 4, 10),
      angleLeft,
      angleRight,
      colorBase: hslToRgb(colorBaseHsl),
      colorTip: hslToRgb(colorTipHsl)
    }
  }

  let config: TreeConfig;
  let currLevel: Float32Array;
  let nextLevel: Float32Array;

  function setup(ctx: CanvasRenderingContext2D) {
    config = randomTreeConfig(ctx.canvas.width, ctx.canvas.height)
    currLevel = new Float32Array(((1 << config.maxDepth) - 1) * 4)
    nextLevel = new Float32Array(((1 << config.maxDepth) - 1) * 4)
  }

  function draw(ctx: CanvasRenderingContext2D, frameCount: number) {
    const { width, height } = ctx.canvas;
    ctx.clearRect(0, 0, width, height);
    drawTree(ctx, frameCount, width / 2, height, config);
  }

  // Draws tree using level-order traversal so that all segments with the same
  // color can be drawn as a single path.
  function drawTree(ctx: CanvasRenderingContext2D, frameCount: number, x: number, y: number, config: TreeConfig) {
    const { maxDepth, lengthTrunk, lengthScaleLeft, lengthScaleRight, lineWidthMin, lineWidthMax,
      angleLeft, angleRight, colorBase, colorTip } = config;
    ctx.lineCap = 'round'
    currLevel[0] = x
    currLevel[1] = y
    currLevel[2] = lengthTrunk
    currLevel[3] = 3/2 * Math.PI
    for (let depth = 0; depth < maxDepth; depth++) {
      ctx.beginPath()
      ctx.strokeStyle = rgbString(lerpColors(depth / maxDepth, colorBase, colorTip));
      ctx.lineWidth = map(depth, 0, maxDepth, lineWidthMax, lineWidthMin)
      const angleOffset = 0.1 * Math.sin((frameCount - 15 * Math.pow(depth, 2)) * 0.002);
      for (let i = 0; i < (1 << depth); i++) {
        const x      = currLevel[4 * i]
        const y      = currLevel[4 * i + 1]
        const length = currLevel[4 * i + 2]
        const angle  = currLevel[4 * i + 3]

        const endX = x + length * Math.cos(angle)
        const endY = y + length * Math.sin(angle)
        if (lineSegmentIsVisible(ctx, x, y, endX, endY)) {
          ctx.moveTo(x, y)
          ctx.lineTo(endX, endY)
        }

        if (depth < maxDepth - 1) {
          let j = 2 * i
          nextLevel[4 * j]     = endX
          nextLevel[4 * j + 1] = endY
          nextLevel[4 * j + 2] = length * lengthScaleLeft
          nextLevel[4 * j + 3] = angle - angleLeft + angleOffset
          
          j++
          nextLevel[4 * j] = endX
          nextLevel[4 * j + 1] = endY
          nextLevel[4 * j + 2] = length * lengthScaleRight
          nextLevel[4 * j + 3] = angle + angleRight + angleOffset
        }
      }
      ctx.stroke();
      [currLevel, nextLevel] = [nextLevel, currLevel];
    }
  }

  const lineSegmentIsVisible =
    (ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number): boolean =>
  {
    const { width, height } = ctx.canvas;

    // If neither of the line segment's endpoints are visible yet it still
    // crosses the screen, then it must cross at least one of the screen's side.
    return (
      inBounds(ctx, x0, y0) ||
      inBounds(ctx, x1, y1) ||
      intersectsHorizontalSide(x0, y0, x1, y1, 0, width) ||
      intersectsHorizontalSide(x0, y0, x1, y1, height, width) ||
      intersectsVerticalSide(x0, y0, x1, y1, 0, height) ||
      intersectsVerticalSide(x0, y0, x1, y1, width, height)
    );
  };

  const inBounds = (ctx: CanvasRenderingContext2D, x: number, y: number): boolean =>
    x >= 0 && x < ctx.canvas.width && y >= 0 && y < ctx.canvas.height;

  const intersectsVerticalSide = (x0: number, y0: number, x1: number, y1: number,
    x: number, h: number): boolean =>
  {
    const EPS = 0.0001
    const y = y0 + (y1 - y0) / (x1 - x0) * (x - x0)
    return y + EPS >= 0 && y - EPS <= h
  };

  const intersectsHorizontalSide = (x0: number, y0: number, x1: number, y1: number,
    y: number, w: number): boolean =>
  {
    const EPS = 0.0001
    const x = x0 + (x1 - x0) / (y1 - y0) * (y - y0)
    return x + EPS >= 0 && x - EPS <= w
  };

  return <AnimatedBackground setup={setup} draw={draw} />
}