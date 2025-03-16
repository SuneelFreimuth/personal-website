import { ShaderCanvas } from "../../lib/shaders/ShaderCanvas";

export function Mandelbrot() {
  return (
    <ShaderCanvas
      width={window.innerWidth}
      height={window.innerHeight}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    />
  );
}