#version 300 es

precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float map(float x, float min0, float max0, float min1, float max1) {
    return min1 + (max1 - min1) * (x - min0) / (max0 - min0);
}

vec2 map(vec2 x, vec2 min0, vec2 max0, vec2 min1, vec2 max1) {
    return min1 + (max1 - min1) * (x - min0) / (max0 - min0);
}

void circle(out vec3 result, in vec2 frag_coord, vec3 color, in vec2 center, float r) {
    float d = length(frag_coord - center);
    result = smoothstep(d, d + 0.1, r) * color;
}
