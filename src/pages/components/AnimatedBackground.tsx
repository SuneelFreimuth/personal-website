import { useState, useEffect, useRef, EffectCallback } from 'react'

import { debounce } from '../lib';

export function AnimatedBackground({ setup, draw }: {
  setup: (ctx: CanvasRenderingContext2D) => void,
  draw: (ctx: CanvasRenderingContext2D, frameCount: number) => void,
}) {
  const viewport = useViewportSize()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const fitCanvasToViewport = debounce(200, () => {
    if (canvasRef.current) {
      const canvas: HTMLCanvasElement = canvasRef.current
      const ctx = canvasRef.current.getContext('2d')!;
      
      const dpr = window.devicePixelRatio ?? 1;
      canvas.width = viewport.width * dpr;
      canvas.height = viewport.height * dpr;
      canvas.style.width = viewport.width + 'px';
      canvas.style.height = viewport.height + 'px';
      ctx.scale(dpr, dpr);
    }
  }) as EffectCallback;

  useEffect(() => {
    if (!canvasRef.current)
      return
    const canvas: HTMLCanvasElement = canvasRef.current;
    fitCanvasToViewport();
    const ctx = canvas.getContext('2d');
    if (!ctx)
      throw new Error('Failed to obtain 2D context from canvas');
    setup(ctx);

    let frameId;
    let frameCount = 0;
    (function animate() {
      draw(ctx, frameCount);
      frameCount++;
      frameId = requestAnimationFrame(animate);
    })();

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [canvasRef])

  useEffect(fitCanvasToViewport, [canvasRef, viewport])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden',
        zIndex: -1,
      }}
    />
  )
}

function useViewportSize() {
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    const onWindowResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    window.addEventListener('resize', onWindowResize)
    return () => {
      window.removeEventListener('resize', onWindowResize)
    }
  }, [])

  return viewportSize
}