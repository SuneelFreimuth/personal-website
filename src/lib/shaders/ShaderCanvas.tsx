import { forwardRef, memo, RefObject, useEffect, useRef, useState } from "react";
import { createProgram, createShader, ShaderType } from "./gl";

import identity from './quad.vert.glsl';
import redgreen from './mandelbrot.frag.glsl';

// At zoom = 0
const SIM_SPACE_PER_PIXEL = 0.001;

export function ShaderCanvas({ ...props }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [paused, pausedRef, setPaused] = useRefState(true);
  const [zoom, zoomRef, setZoom] = useRefState(0);
  const [scale, scaleRef, setScale] = useRefState(Math.exp(0));

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p') {
        setPaused(!pausedRef.current);
      }
    };
    document.body.addEventListener('keydown', onKeyDown);
    return () => document.body.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!ref.current)
      return;

    const canvas = ref.current;

    const center = { x: 0.3037279, y: -0.0241415 }
    const mouse = { x: 0, y: 0 };
    let dragStart: { x: number; y: number; } = null;
    let disp: { x: number, y: number } = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      if (dragStart) {
        disp.x = (dragStart.x - e.offsetX) / canvas.width * scaleRef.current;
        disp.y = (dragStart.y - e.offsetY) / canvas.width * scaleRef.current;
        console.log(disp.x, disp.y, scaleRef.current);
      }
    };
    const onMouseDown = (e: MouseEvent) => {
      if (e.buttons & 1) {
        dragStart = { x: e.offsetX, y: e.offsetY };
      } else {
        dragStart = null;
      }
    };
    const onMouseUp = (e: MouseEvent) => {
      disp.x = (dragStart.x - e.offsetX) / canvas.width * scaleRef.current;
      disp.y = (dragStart.y - e.offsetY) / canvas.width * scaleRef.current;
      center.x += disp.x;
      center.y += disp.y;
      dragStart = null;
      disp = { x: 0, y: 0 };
    };
    const onWheel = (e: WheelEvent) => {
      const newZoom = zoomRef.current - e.deltaY * 0.001;
      setZoom(newZoom);
      setScale(Math.exp(-newZoom));
    };
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('wheel', onWheel);

    const gl = canvas.getContext('webgl2');
    if (!gl)
      throw new Error('Whoops! WebGL2 is not available.');
    const program = setup(gl);

    const locResolution = gl.getUniformLocation(program, 'u_resolution');
    gl.uniform2f(locResolution, gl.canvas.width, gl.canvas.height);

    let animationFrame: number;
    animationFrame = requestAnimationFrame(function animate(t: DOMHighResTimeStamp) {
      const time = t / 1000;
      const locTime = gl.getUniformLocation(program, 'u_time');
      // gl.uniform1f(locTime, t / 1000);

      const locCenter = gl.getUniformLocation(program, 'u_center');
      const movedCenter = {
        x: center.x + disp.x,
        y: center.y + disp.y
      };
      gl.uniform2f(locCenter, movedCenter.x, movedCenter.y);

      const locScale = gl.getUniformLocation(program, 'u_scale');
      gl.uniform1f(locScale, scaleRef.current);

      const locMouse = gl.getUniformLocation(program, 'u_mouse');
      gl.uniform2f(locMouse, mouse.x, mouse.y);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrame = requestAnimationFrame(animate);
    });

    return () => {
      cancelAnimationFrame(animationFrame);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseMove);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, []);

  return (
    <>
      <Canvas
        ref={ref}
        {...props}
      />
      <div style={{
        position: 'absolute',
        right: 10,
        bottom: 10,
        backgroundColor: '#000a',
        color: 'white',
        fontFamily: 'sans-serif',
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}>
        <div>Scale: {scale.toPrecision(3)}</div>
      </div>
    </>
  );
}

type RefStateSetter<T> = (value: T | ((value: T) => T)) => void;

function useRefState<T>(movedValue: T): [T, RefObject<T>, RefStateSetter<T>] {
  const [state, setState] = useState(movedValue);
  const ref = useRef<T>(movedValue);
  const setRefState: RefStateSetter<T> = (arg) => {
    if (typeof arg === 'function') {
      setState(arg);
      ref.current = (arg as Function)(state);
    } else {
      setState(arg);
      ref.current = arg;
    }
  };

  return [ state, ref, setRefState ];
}

const Canvas = memo(forwardRef<HTMLCanvasElement>(function Canvas({ ...props }, ref) {
  return (
    <canvas
      ref={ref}
      {...props}
    />
  );
}));

function setup(gl: WebGL2RenderingContext): WebGLProgram {
  const vertex = createShader(gl, ShaderType.VERTEX, identity);
  const fragment = createShader(gl, ShaderType.FRAGMENT, redgreen);
  const program = createProgram(gl, vertex, fragment);

  const locPosition = gl.getAttribLocation(program, 'a_position');
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = new Float32Array([
    0, 0,
    gl.canvas.width, 0,
    0, gl.canvas.height,
    gl.canvas.width, 0,
    gl.canvas.width, gl.canvas.height,
    0, gl.canvas.height,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(locPosition);
  gl.vertexAttribPointer(locPosition, 2, gl.FLOAT, false, 0, 0)

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);
  const locResolution = gl.getUniformLocation(program, 'u_resolution');
  gl.uniform2f(locResolution, gl.canvas.width, gl.canvas.height);
  gl.bindVertexArray(vao);

  return program;
}
