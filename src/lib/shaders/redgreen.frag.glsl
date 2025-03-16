in vec2 frag_coord;

out vec4 frag_color;

void main() {
    // vec2 pos = frag_coord / u_resolution;
    // float b = 0.5 * cos(u_time) + 0.5;
    vec3 color;
    circle(color, frag_coord, vec3(1.0), u_mouse, 10.0);
    frag_color = vec4(color, 1.0);
}
