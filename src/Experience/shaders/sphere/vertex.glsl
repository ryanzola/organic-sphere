#define M_PI 3.1415926535897932384626433832795

uniform vec3 uLightAColor;
uniform vec3 uLightAPosition;
uniform float uLightAIntensity;
uniform vec3 uLightBColor;
uniform vec3 uLightBPosition;
uniform float uLightBIntensity;

uniform vec2 uSubdivision;

uniform float uDistortionFrequency;
uniform float uDistortionStrength;
uniform float uDisplacementFrequency;
uniform float uDisplacementStrength;

uniform float uFresnelOffset;
uniform float uFresnelMultiplier;
uniform float uFresnelPower;

uniform float uTime;

varying vec3 vNormal;
varying float vPerlinStrength;
varying vec3 vColor;

#pragma glslify: perlin3d = require('../partials/perlin3d.glsl')
#pragma glslify: perlin4d = require('../partials/perlin4d.glsl')

vec4 getDisplacedPosition(vec3 _position) {
  vec3 displacementPosition = _position;
  displacementPosition.x += perlin4d(vec4(displacementPosition * uDistortionFrequency, uTime)) * uDistortionStrength;

  float perlinStrength = perlin4d(vec4(displacementPosition * uDisplacementFrequency, uTime));
  
  vec3 displacedPosition = _position;
  displacedPosition += normalize(_position) * perlinStrength  * uDisplacementStrength;

  return vec4(displacedPosition, perlinStrength);
}

void main() {
  // position
  vec4 displacedPosition = getDisplacedPosition(position);

  // bitangents
  float distanceA = (M_PI * 2.0) / uSubdivision.x;
  float distanceB = M_PI / uSubdivision.y;

  vec3 biTangent = cross(normal, tangent.xyz);

  vec3 positionA = position + tangent.xyz * distanceA;
  vec3 displacedPositionA = getDisplacedPosition(positionA).xyz;

  vec3 positionB = position + biTangent * distanceB;
  vec3 displacedPositionB = getDisplacedPosition(positionB).xyz;

  vec3 computedNormal = cross(displacedPositionA - displacedPosition.xyz, displacedPositionB - displacedPosition.xyz);
  computedNormal = normalize(computedNormal);

  // fresnel
  vec3 viewDirection = normalize(displacedPosition.xyz - cameraPosition);
  float fresnel = uFresnelOffset + (1.0 + dot(viewDirection, computedNormal)) * uFresnelMultiplier;
  fresnel = pow(max(0.0, fresnel), uFresnelPower);


  // color
  float lightAIntensity = max(0.0, - dot(computedNormal, normalize(- uLightAPosition))) * uLightAIntensity;
  float lightBIntensity = max(0.0, - dot(computedNormal, normalize(- uLightBPosition))) * uLightBIntensity;


  vec3 color = vec3(0.0);
  // color = mix(color, uLightAColor, fresnel);
  color = mix(color, uLightAColor, lightAIntensity * fresnel);
  color = mix(color, uLightBColor, lightBIntensity * fresnel);
  color = mix(color, vec3(1.0), clamp(pow(fresnel - 0.8, 3.0), 0.0, 1.0));

  vec4 viewPosition = viewMatrix *vec4(displacedPosition.xyz, 1.0);
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  // varying
  vNormal = normal;
  vPerlinStrength = displacedPosition.a;
  vColor = color;
}