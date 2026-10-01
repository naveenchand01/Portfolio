export const LIQUID_VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

/**
 * Domain-warped fractal noise (fbm of fbm), coloured with three palette colours.
 * The cursor drags the field locally, and a sine of the field adds glossy "sheen" ridges.
 */
export const LIQUID_FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uIntensity; uniform float uScroll;
uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3;

float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++){ v += a*noise(p); p = m*p; a *= 0.5; }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float s = min(uRes.x, uRes.y);
  vec2 p = (gl_FragCoord.xy - 0.5*uRes) / s;
  vec2 m = (uMouse*uRes - 0.5*uRes) / s;

  vec2 dm = p - m;
  float d = length(dm);
  p -= dm * 0.32 * exp(-d*d*5.0);

  p.y += uScroll * 0.25;
  float t = uTime * 0.045;
  vec2 q = vec2(fbm(p*1.15 + vec2(0.0, t)), fbm(p*1.15 + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p*1.15 + 3.2*q + vec2(1.7, 9.2) + t*1.4), fbm(p*1.15 + 3.2*q + vec2(8.3, 2.8) - t*1.2));
  float f = fbm(p*1.15 + 3.4*r);

  vec3 col = vec3(0.018, 0.016, 0.03);
  col = mix(col, uC1, clamp(f*f*2.6, 0.0, 1.0));
  col = mix(col, uC2, clamp(length(q)*1.25 - 0.45, 0.0, 1.0) * 0.9);
  col = mix(col, uC3, clamp(r.y*r.y*2.4 - 0.32, 0.0, 1.0) * 0.85);

  float band = sin(f*24.0 + r.x*9.0 - uTime*0.35);
  col += vec3(1.0) * pow(max(band, 0.0), 18.0) * 0.22 * smoothstep(0.35, 0.8, f);

  col *= smoothstep(0.12, 0.9, f) * 1.6 + 0.07;

  float v = smoothstep(1.3, 0.15, length((uv - 0.5) * vec2(1.25, 1.0)) * 1.35);
  col *= mix(0.45, 1.0, v);
  col *= uIntensity;
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`;
