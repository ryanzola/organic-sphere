uniform float uTime;
uniform float uDistortionFrequency;
uniform float uDistortionStrength;
uniform float uDisplacementFrequency;
uniform float uDisplacementStrength;

varying vec3 vNormal;
varying float vPerlinStrength;

#pragma glslify: perlin3d = require('../partials/perlin3d.glsl')
#pragma glslify: perlin4d = require('../partials/perlin4d.glsl')

void main() {


  vec3 displacementPosition = position;
  displacementPosition.x += perlin4d(vec4(displacementPosition * uDistortionFrequency, uTime * 0.00012)) * uDistortionStrength;
  // displacementPosition.y += perlin3d(vec3(position.xz * uDistortionFrequency, uTime * 0.00012)) * uDistortionStrength;
  // displacementPosition.z += perlin3d(vec3(position.xy * uDistortionFrequency, uTime * 0.00012)) * uDistortionStrength;

  float perlinStrength = perlin4d(vec4(displacementPosition * uDisplacementFrequency, uTime * 0.0001)) * uDisplacementStrength;
  
  vec3 newPosition = position;
  newPosition += normal * perlinStrength;

  vec4 viewPosition = viewMatrix *vec4(newPosition, 1.0);
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vNormal = normal;
  vPerlinStrength = perlinStrength;
}