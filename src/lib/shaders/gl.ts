/**
 * Code adapted from examples from https://webgl2fundamentals.org/
 */

import prelude from './prelude.frag.glsl';

export enum ShaderType {
    VERTEX = "VERTEX",
    FRAGMENT = "FRAGMENT",
}

export function glShaderType(
    gl: WebGL2RenderingContext,
    type: ShaderType
): GLenum {
    switch (type) {
        case ShaderType.VERTEX:
            return gl.VERTEX_SHADER;
        case ShaderType.FRAGMENT:
            return gl.FRAGMENT_SHADER;
    }
}

export function createShader(
    gl: WebGL2RenderingContext,
    type: ShaderType,
    source: string
): WebGLShader {
    if (type === ShaderType.FRAGMENT) {
        source = prelude + '\n' + source;
    }

    console.log('Created shader:');
    console.log(source);
    const shader = gl.createShader(glShaderType(gl, type))!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw new Error("Failed to compile shader.");
    }
    return shader;
}

export function createProgram(
    gl: WebGL2RenderingContext,
    vertex: WebGLShader,
    fragment: WebGLShader
): WebGLProgram {
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        throw new Error("Error compiling shader program");
    }
    return program;
}
