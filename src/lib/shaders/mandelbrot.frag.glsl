uniform vec2 u_center;
uniform float u_scale;

in vec2 frag_coord;
out vec4 frag_color;


const int MAX_STEPS = 500;

bool isDivergent(vec2 z) {
    return length(z) > 2.0;
}

int stepsToDivergence(vec2 c) {
    int steps = 0;
    vec2 z = c;
    while (steps < MAX_STEPS) {
        if (length(z) > 2.0) {
            return steps;
        }
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y)
            + c;
        steps++;
    }
    return -1;
}

vec3 PALETTE1[6] = vec3[](
    vec3(0.7, 0.0, 0.0),
    vec3(0.75, 0.0, 0.5),
    vec3(0.9, 0.0, 0.9),
    vec3(0.5, 0.0, 0.75),
    vec3(0.0, 0.0, 1.0),
    vec3(0.0) // Convergent color
);

vec3 PALETTE[6] = vec3[](
    vec3(0.3, 0.7, 0.0),
    vec3(0.2, 0.75, 0.5),
    vec3(0.1, 0.9, 0.9),
    vec3(0.05, 0.5, 0.75),
    vec3(0.01, 0.2, 1.0),
    vec3(0.0) // Convergent color
);

int PALETTE_LENGTH = 5;

vec3 colorFor(vec2 pos) {
    int steps = stepsToDivergence(pos);
    if (steps == -1) {
        return vec3(0.0);
    }
    float norm = float(steps) / float(MAX_STEPS);
    float color = float(PALETTE_LENGTH) * sqrt(norm);
    
    int firstColor = int(mod(3.0 * floor(color), float(PALETTE_LENGTH)));
    int secondColor = firstColor + 1;
    return mix(PALETTE[firstColor],
        PALETTE[secondColor], fract(color));
}

vec2 position(vec2 frag_coord, vec2 center, float scale, float time) {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 norm = map(frag_coord, vec2(0.0), u_resolution.xy,
        -scale * vec2(aspect, 1.0),
        scale * vec2(aspect, 1.0));
    return norm + center;
}

void main() {
    vec2 z = position(frag_coord, u_center, u_scale, u_time);
    vec3 col = colorFor(z);
    frag_color = vec4(col, 1.0);
}