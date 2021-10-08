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
    
    if(this.debug) {
      this.debugFolder = this.debug.addFolder({
        title: 'sphere'
      })
    }

    this.setGeometry()
    this.setMaterial()
    this.setMesh()
  }

  setGeometry() {
    this.geometry = new THREE.SphereGeometry(1, 512, 512)
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({ 
      // wireframe: true,
      uniforms: {
        uDistortionFrequency: { value: 3 },
        uDistortionStrength: { value: 2 },
        uDisplacementFrequency: { value: 2 },
        uDisplacementStrength: { value: 0.2 },
        uTime: { value: 0 }
      },
      vertexShader: vertex,
      fragmentShader: fragment
    })

    if(this.debug) {
      this.debugFolder.addInput(
        this.material.uniforms.uDistortionFrequency,
        'value',
        { min: 0, max: 4, step: 0.001, label: 'uDistortionFrequency' }
      )
      this.debugFolder.addInput(
        this.material.uniforms.uDistortionStrength,
        'value',
        { min: 0, max: 4, step: 0.001, label: 'uDistortionStrength' }
      )

      this.debugFolder.addInput(
        this.material.uniforms.uDisplacementFrequency,
        'value',
        { min: 0, max: 6, step: 0.001, label: 'uDisplacementFrequency' }
      )

      this.debugFolder.addInput(
        this.material.uniforms.uDisplacementStrength,
        'value',
        { min: 0, max: 0.4, step: 0.001, label: 'uDisplacementStrength' }
      )
    }
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.scene.add(this.mesh)
  }

  update() {
    if(this.material)
      this.material.uniforms.uTime.value = this.time.elapsed
  }
}