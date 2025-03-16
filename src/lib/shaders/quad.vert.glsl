#version 300 es

precision highp float;

uniform vec2 u_resolution;

in vec4 a_position;

out vec2 frag_coord;

float map(float x, float min0, float max0, float min1, float max1) {
    return min1 + (max1 - min1) * (x - min0) / (max0 - min0);
}

vec2 map(vec2 x, vec2 min0, vec2 max0, vec2 min1, vec2 max1) {
    return min1 + (max1 - min1) * (x - min0) / (max0 - min0);
}

void main() {
    frag_coord = a_position.xy;
    vec2 pos = map(a_position.xy, vec2(0), u_resolution, vec2(-1.0, 1.0), vec2(1.0, -1.0));
    gl_Position = vec4(pos, 0, 1);
}