import * as THREE from 'three'
import Experience from './Experience';

import vertex from './shaders/sphere/vertex.glsl'
import fragment from './shaders/sphere/fragment.glsl'

export default class Sphere {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.time = this.experience.time
    this.debug = this.experience.debug

    // this.timeFrequency = 0.0003
    this.timeFrequency = 0.0006
    
    if(this.debug) {
      this.debugFolder = this.debug.addFolder({
        title: 'sphere'
      })

      const timeFolder = this.debugFolder.addFolder({
        title: 'time'
      })

      timeFolder.addInput(
        this,
        'timeFrequency',
        { min: 0, max: 0.001, step: 0.000001}
      )
    }

    this.setGeometry()
    this.setLights()
    this.setOffset()
    this.setMaterial()
    this.setMesh()
  }

  setLights() {
    this.lights = {}

    // light a
    this.lights.a = {}

    this.lights.a.intensity = 1.85

    this.lights.a.color = {}
    this.lights.a.color.value = '#ff3e00'
    // this.lights.a.color.value = '#00acff'
    this.lights.a.color.instance = new THREE.Color(this.lights.a.color.value)

    this.lights.a.spherical = new THREE.Spherical(1, 0.615, 2.049)

    // light b
    this.lights.b = {}

    this.lights.b.intensity = 1.4

    this.lights.b.color = {}
    this.lights.b.color.value = '#0063ff'
    this.lights.b.color.instance = new THREE.Color(this.lights.b.color.value)

    this.lights.b.spherical = new THREE.Spherical(1, 2.561, - 1.844)

    if(this.debug) {
      for(const _lightName in this.lights) {
        const light = this.lights[_lightName]

        const folder = this.debugFolder.addFolder({
          title: `light ${_lightName}`
        })

        folder.addInput(
          light.color,
          'value',
          { label: 'color' }
        )
        .on('change', () => {
          light.color.instance.set(light.color.value)
        })

        folder.addInput(
          light,
          'intensity',
          { min: 0, max: 10, step: 0.001 }
        )
        .on('change', () => {
          this.material.uniforms[`uLight${_lightName.toUpperCase()}Intensity`].value = light.intensity
        })

        folder.addInput(
          light.spherical,
          'phi',
          { min: 0, max: Math.PI, step: 0.001 }
        )
        .on('change', () => {
          this.material.uniforms[`uLight${_lightName.toUpperCase()}Position`].value.setFromSpherical(light.spherical)
        })

        folder.addInput(
          light.spherical,
          'theta',
          { min: - Math.PI, max: Math.PI, step: 0.001 }
        )
        .on('change', () => {
          this.material.uniforms[`uLight${_lightName.toUpperCase()}Position`].value.setFromSpherical(light.spherical)
        })
      }
    }
  }

  setOffset() {
      this.offset = {}
      this.offset.spherical = new THREE.Spherical(1, Math.random() * Math.PI, Math.random() * Math.PI * 2)
      this.offset.direction = new THREE.Vector3()
      this.offset.direction.setFromSpherical(this.offset.spherical)
  }

  setGeometry() {
    this.geometry = new THREE.SphereGeometry(1, 512, 512)
    this.geometry.computeTangents()
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({ 
      // wireframe: true,
      defines: {
        USE_TANGENT: ''
      },
      uniforms: {
        uLightAColor: { value: this.lights.a.color.instance },
        uLightAPosition: { value: new THREE.Vector3(1, 1, 0) },
        uLightAIntensity: { value: this.lights.a.intensity },

        uLightBColor: { value: this.lights.b.color.instance },
        uLightBPosition: { value: new THREE.Vector3(- 1, - 1, 0) },
        uLightBIntensity: { value: this.lights.b.intensity },

        uSubdivision: { value: new THREE.Vector2(this.geometry.parameters.widthSegments, this.geometry.parameters.heightSegments) },

        uOffsetDirection: { value: this.offset.direction },
        uOffsetSpeed: { value: 2 },

        uOffset: { value: new THREE.Vector3() },

        uDistortionFrequency: { value: 1.5 },
        uDistortionStrength: { value: 0.65 },
        uDisplacementFrequency: { value: 2.120 },
        uDisplacementStrength: { value: 0.152 },
        // uDisplacementStrength: { value: 0.083 },

        uFresnelOffset: { value: -1.609 },
        uFresnelMultiplier: { value: 3.587 },
        uFresnelPower: { value: 1.793 },

        uTime: { value: 0 }
      },
      vertexShader: vertex,
      fragmentShader: fragment
    })

    this.material.uniforms.uLightAPosition.value.setFromSpherical(this.lights.a.spherical)
    this.material.uniforms.uLightBPosition.value.setFromSpherical(this.lights.b.spherical)

    if(this.debug) {
      const distortionFolder = this.debugFolder.addFolder({
        title: 'distortion'
      })
      distortionFolder.addInput(
        this.material.uniforms.uDistortionFrequency,
        'value',
        { min: 0, max: 10, step: 0.001, label: 'frequency' }
      )

      distortionFolder.addInput(
        this.material.uniforms.uDistortionStrength,
        'value',
        { min: 0, max: 4, step: 0.001, label: 'strength' }
      )

      const displacementFolder = this.debugFolder.addFolder({
        title: 'displacement'
      })
      displacementFolder.addInput(
        this.material.uniforms.uDisplacementFrequency,
        'value',
        { min: 0, max: 6, step: 0.001, label: 'frequency' }
      )

      displacementFolder.addInput(
        this.material.uniforms.uDisplacementStrength,
        'value',
        { min: 0, max: 0.4, step: 0.001, label: 'strength' }
      )

      const fresnelFolder = this.debugFolder.addFolder({
        title: 'fresnel'
      })

      fresnelFolder.addInput(
        this.material.uniforms.uFresnelOffset,
        'value',
        { min: -2, max: 2, step: 0.001, label: 'offset' }
      )

      fresnelFolder.addInput(
        this.material.uniforms.uFresnelMultiplier,
        'value',
        { min: 0, max: 5, step: 0.001, label: 'multiplier' }
      )

      fresnelFolder.addInput(
        this.material.uniforms.uFresnelPower,
        'value',
        { min: 0, max: 5, step: 0.001, label: 'power' }
      )
    }
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.scene.add(this.mesh)
  }

  update() {
    this.offset.spherical.phi = (Math.sin(this.time.elapsed * 0.001) * 0.5 + 0.5) * Math.PI
    this.offset.direction.setFromSpherical(this.offset.spherical)
    if(this.material)
      this.material.uniforms.uTime.value += this.time.delta * this.timeFrequency
  }
}