import { memo, useRef, useState } from 'react';
import { Animation, Ctx, InputObserver } from './Animation';
import { createNoise3D, NoiseFunction3D } from 'simplex-noise';


const colorSchemes: Record<string, ColorScheme> = {
  purple: {
    background: 'rgb(255, 255, 255, 5%)',
    forceField: 'rgb(120, 70, 170)',
    particle: 'rgb(200, 180, 220)'
  },
  graphite: {
    background: 'rgb(255, 255, 255, 5%)',
    forceField: '#cfd5d3',
    particle: '#2e2e2e'
  }
};


const EPS = 1e-5;
const NUM_PARTICLES = 2e4;

export function FlowField() {
  const simulationRef = useRef<Simulation | null>(null);
  const rendererRef = useRef<Renderer | null>(null);

  function simulation(): Simulation {
    if (simulationRef.current)
      return simulationRef.current;
    const sim = new Simulation({
      numParticles: NUM_PARTICLES,
      width: window.innerWidth,
      height: window.innerHeight,
    });
    simulationRef.current = sim;
    return sim;
  }

  function renderer(): Renderer {
    if (rendererRef.current)
      return rendererRef.current;
    const renderer_ = new Renderer(simulation(), {
      colorScheme: colorSchemes.graphite,
    });
    rendererRef.current = renderer_;
    return renderer_;
  }

  const frameRate = useFrameRate({ history: 10 });

  return (
    <div style={{
      width: '100vw',
      height: '100vh'
    }}>
      <AnimationMemoized
        width={window.innerWidth}
        height={window.innerHeight}
        setup={(ctx) => {}}
        draw={(ctx, t, dt, inputs) => {
          frameRate.update(dt);
          const { width, height } = ctx.canvas;

          renderer().draw(ctx, t, dt, inputs);
        }}
      />
      <div style={{
        position: 'absolute',
        right: '20px',
        bottom: '20px',
        backgroundColor: 'black',
        color: 'white',
      }}>
        <table>
          <tbody>
            <tr>
              <td>Frame Rate:</td>
              <td style={{ minWidth: '40px'}}>{frameRate.value.toFixed(0)}</td>
            </tr>
            <tr>
              <td>Particles:</td>
              <td style={{ minWidth: '40px'}}>{simulation().bodies.numBodies}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

const AnimationMemoized = memo(Animation);

function useFrameRate({ history }: {
  history: number;
}): { value: number; update: (t: number) => void; } {
  const [value, setValue] = useState(0);
  const avg = useRef<MovingAverage | null>(null);
  if (avg.current === null) {
    avg.current = new MovingAverage(history);
  }

  return {
    value,
    update: (dt: number) => {
      const frameRate = 1 / dt;
      avg.current!.update(frameRate);
      setValue(avg.current!.avg());
    },
  };
}

class MovingAverage {
  private writeHead: number;
  buffer: Float32Array;

  constructor(history: number) {
    this.writeHead = 0;
    this.buffer = new Float32Array(history);
  }

  update = (value: number) => {
    this.writeHead = (this.writeHead + 1) % this.buffer.length;
    this.buffer[this.writeHead] = value;
  }

  avg = () => {
    let result = 0;
    for (const v of this.buffer)
      result += v;
    return result / this.buffer.length;
  }
}


const FORCE_GRID_SIZE = 10;
const PARTICLE_SIZE = 0.6;

interface ColorScheme {
  background: string;
  forceField: string;
  particle: string;
}

class Renderer {
  t: number;
  width: number;
  height: number;
  sim: Simulation;
  colorScheme: ColorScheme;
  particleCanvas: OffscreenCanvas;
  particleCtx: OffscreenCanvasRenderingContext2D;

  constructor(simulation: Simulation, { colorScheme }: {
    colorScheme: ColorScheme;
  }) {
    console.log('Constructing renderer');
    this.sim = simulation;

    this.particleCanvas = new OffscreenCanvas(simulation.width, simulation.height);
    this.particleCtx = this.particleCanvas.getContext('2d')!;
    this.colorScheme = colorScheme;
  }

  draw = (ctx: Ctx, t: number, dt: number, inputs: InputObserver) => {
    const { width, height } = ctx.canvas;
    this.width = width;
    this.height = height;
    this.t = t;

    this.sim.step(t);

    this.drawForceField(ctx);
    this.drawParticles(ctx);

    ctx.fillStyle = inputs.buttons.primary ? 'red' : 'blue';
    ctx.beginPath();
    ctx.ellipse(inputs.mouseX, inputs.mouseY, 10, 10, 0, 0, 2 * Math.PI);
    ctx.fill();
  }

  drawForceField = (ctx: Ctx) => {
    ctx.fillStyle = this.colorScheme.background;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.strokeStyle = this.colorScheme.forceField;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = 0; y < this.height; y += FORCE_GRID_SIZE) {
      for (let x = 0; x < this.width; x += FORCE_GRID_SIZE) {
        const [fx, fy] = this.sim.forceField(x, y);
        this.drawVector(ctx, x, y, fx, fy);
      }
    }
    ctx.stroke();
  }

  drawVector = (ctx: Ctx, x: number, y: number, vx: number, vy: number) => {
    const LENGTH = 5;
    // const mag = magnitude(vx, vy);
    const heading_ = heading(vx, vy);
    ctx.moveTo(x, y);
    ctx.lineTo(x + LENGTH * Math.cos(heading_), y + LENGTH * Math.sin(heading_));
  }

  drawParticles = (ctx: Ctx) => {
    this.particleCtx.fillStyle = this.colorScheme.background;
    this.particleCtx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.particleCtx.fillStyle = this.colorScheme.particle;
    for (let i = 0; i < this.sim.bodies.pos.items.length; i += 2) {
      this.particleCtx.beginPath();
      this.particleCtx.ellipse(this.sim.bodies.pos.items[i], this.sim.bodies.pos.items[i + 1],
        PARTICLE_SIZE, PARTICLE_SIZE, 0, 0, 2 * Math.PI);
      this.particleCtx.fill();
    }
    ctx.globalCompositeOperation = "darken";
    ctx.drawImage(this.particleCanvas, 0, 0);
    ctx.globalCompositeOperation = "source-over";
  }
}


const DT = 0.1;
const DOMAIN_MARGIN = 5;
const MAX_FORCE = 5;
const MAX_SPEED = 20;
const FIELD_SPACE_SCALE = 0.005;
const FIELD_TIME_SCALE = 0.05;
// const DRAG_COEFF = 0.01;

class Simulation {
  t: number;
  width: number;
  height: number;
  bodies: Bodies;
  noiseGen: NoiseFunction3D;
    
  constructor({ numParticles, width, height }: {
    numParticles: number;
    width: number;
    height: number;
  }) {
    console.log('Constructing simulation')
    this.t = 0;
    this.width = width;
    this.height = height;
    this.noiseGen = createNoise3D();
    this.bodies = new Bodies({ numBodies: numParticles })
    for (let i = 0; i < this.bodies.pos.items.length; i += 2) {
      this.bodies.pos.items[i] = randInt(width);
      this.bodies.pos.items[i + 1] = randInt(height);
    }
  }

  step(t: number) {
    this.t = t;
    
    this.applyForces();
    this.bodies.step(DT);
    this.bodies.wrap(this.width, this.height);
  }

  applyForces = () => {
    for (let i = 0; i < 2 * this.bodies.numBodies; i += 2) {
      // Force field
      const [fx, fy] = this.forceField(
        this.bodies.pos.items[i],
        this.bodies.pos.items[i + 1],
      );
      this.bodies.acc.items[i] = fx;
      this.bodies.acc.items[i + 1] = fy;
    }
  }

  forceField = (x: number, y: number): [number, number] => {
    const fx = MAX_FORCE * this.noise(x * FIELD_SPACE_SCALE, y * FIELD_SPACE_SCALE, this.t * FIELD_TIME_SCALE);
    const fy = MAX_FORCE * this.noise(x * FIELD_SPACE_SCALE + 1e5, y * FIELD_SPACE_SCALE + 1e5, this.t * FIELD_TIME_SCALE);
    return [fx, fy];
  }

  noise = (x: number, y: number, t: number): number => {
    // const cyclicX = Math.cos(2 * Math.PI / this.width * x);
    // const cyclicY = Math.cos(2 * Math.PI / this.height * y);
    const cyclicX = x;
    const cyclicY = y;
    return this.noiseGen(cyclicX, cyclicY, t);
  }
}

class Bodies {
  numBodies: number;
  buffer: ArrayBuffer;
  pos: Vec2Array;
  dpos: Vec2Array;
  vel: Vec2Array;
  dvel: Vec2Array;
  acc: Vec2Array;

  constructor({ numBodies }: {
    numBodies: number;
  }) {
    this.numBodies = numBodies;

    const byteLength = Vec2Array.byteLength(numBodies);
    const bufferSize = byteLength * 5;
    // console.log(`Bodies buffer is ${bufferSize} bytes long`)
    this.buffer = new ArrayBuffer(bufferSize);

    const slice = (i: number): Slice => ({
      buffer: this.buffer,
      byteOffset: byteLength * i,
    });
    this.pos = new Vec2Array(numBodies, slice(0));
    this.dpos = new Vec2Array(numBodies, slice(1));
    this.vel = new Vec2Array(numBodies, slice(2));
    this.dvel = new Vec2Array(numBodies, slice(3));
    this.acc = new Vec2Array(numBodies, slice(4));
  }

  step = (dt: number) => {
    Vec2Array.mul(this.dvel, this.acc, dt);
    Vec2Array.add(this.vel, this.vel, this.dvel);
    Vec2Array.mul(this.dpos, this.vel, dt);
    Vec2Array.add(this.pos, this.pos, this.dpos);
    Vec2Array.limit(this.vel, this.vel, MAX_SPEED);
    this.acc.fill(0);
  }

  wrap = (domainWidth: number, domainHeight: number) => {
    for (let i = 0; i < this.pos.items.length; i += 2) {
      this.pos.items[i] = wrap(this.pos.items[i], -DOMAIN_MARGIN, domainWidth + DOMAIN_MARGIN);
      this.pos.items[i + 1] = wrap(this.pos.items[i + 1], -DOMAIN_MARGIN, domainHeight + DOMAIN_MARGIN);
    }
  }
}

function wrap(x: number, min: number, max: number): number {
  if (x < min)
    return max - EPS;
  if (x > max)
    return min + EPS;
  return x;
}


interface Slice {
  buffer: ArrayBuffer;
  byteOffset: number;
}


class Vec2Array {
  readonly length: number;
  items: Float32Array;

  static byteLength = (length: number) => 2 * Float32Array.BYTES_PER_ELEMENT * length;

  constructor(length: number, slice: Slice | null = null) {
    this.length = length;
    this.items =
      slice ?
        new Float32Array(slice.buffer, slice.byteOffset, length) :
        new Float32Array(length);
  }

  get = (i: number): [number, number] => (
    [this.items[2 * i], this.items[2 * i + 1]]
  );

  set = (i: number, x: number, y: number) => {
    this.items[2 * i] = x;
    this.items[2 * i + 1] = y;
  }

  static add = (result: Vec2Array, a: Vec2Array, b: Vec2Array) => {
    for (let i = 0; i < result.items.length; i += 2) {
      result.items[i] = a.items[i] + b.items[i];
      result.items[i + 1] = a.items[i + 1] + b.items[i + 1];
    }
  }

  static sub = (result: Vec2Array, a: Vec2Array, b: Vec2Array) => {
    for (let i = 0; i < result.items.length; i += 2) {
      result.items[i] = a.items[i] - b.items[i];
      result.items[i + 1] = a.items[i + 1] - b.items[i + 1];
    }
  }

  static mul = (result: Vec2Array, x: Vec2Array, c: number) => {
    for (let i = 0; i < result.items.length; i++) {
      result.items[i] = x.items[i] * c;
    }
  }

  static limit = (result: Vec2Array, x: Vec2Array, mag: number) => {
    for (let i = 0; i < result.items.length; i += 2) {
      const m = magnitude(x.items[i], x.items[i + 1]);
      if (m > mag) {
        result.items[i] *= mag / m;
        result.items[i + 1] *= mag / m;
      }
    }
  }

  fill = (v: number) => {
    this.items.fill(v);
  }
}

function magnitude(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

/** Returns in radians. */
function heading(x: number, y: number): number {
  return Math.atan2(y, x);
}

function normalize(x: number, y: number): [number, number] {
  const m = magnitude(x, y);
  return [x / m, y / m];
}

const randInt = (a: number, b: number | null = null) =>
  b === null ?
    Math.floor(Math.random() * a) :
    Math.floor(a + Math.random() * (b - a));

const map = (x: number, min0: number, max0: number, min1: number, max1: number): number =>
  min1 + (x - min0) / (max0 - min0) * (max1 - min1);
