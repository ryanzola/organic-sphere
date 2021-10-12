varying vec3 vNormal;
varying float vPerlinStrength;
varying vec3 vColor;

void main() {


  gl_FragColor = vec4(vec3(vColor), 1.0);
  // float temp = vPerlinStrength + 0.5;
  // temp *= 0.5;
  // gl_FragColor = vec4(vec3(temp), 1.0);
}