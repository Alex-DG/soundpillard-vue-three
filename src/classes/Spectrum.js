import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

import MyGUI from "../utils/MyGUI"
import * as THREE from "three"

import vertexShader from "../shaders/spectrum.vert"
import fragmentShader from "../shaders/spectrum.frag"

class Spectrum {
  constructor() {
    this.bind()
    this.modelLoader = new GLTFLoader()
    this.textureLoader = new THREE.TextureLoader()

    this.shaderFolder = MyGUI.addFolder("Spectrum Folder")
    this.shaderFolder.open()
  }

  init(scene) {
    this.scene = scene
    this.spectrum

    this.uniforms = {
      uMatCap: {
        value: this.textureLoader.load("./assets/textures/blackMetal.png"),
      },
      uSpecterSize: {
        value: 0.6,
      },
      uTime: {
        value: 0.0,
      },
      uWaveSpeed: {
        value: 0.15,
      },
      uWaveBorder: {
        value: 0.1,
      },
      uBorderColor: {
        value: new THREE.Color("hsl(287, 80%, 80%)"),
      },
    }

    this.shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: this.uniforms,
    })
    this.modelLoader.load("./assets/models/spectrum.glb", (glb) => {
      glb.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          this.spectrum = child

          child.material = this.shaderMaterial
          child.scale.multiplyScalar(2.7)
          child.position.y = -2.9
        }
      })
      //   this.spectrum.translateY(-3)
      this.scene.add(this.spectrum)
    })

    this.shaderFolder
      .add(this.uniforms.uSpecterSize, "value")
      .min(-1)
      .max(1)
      .name("Spectrum Size")
    this.shaderFolder
      .add(this.uniforms.uWaveBorder, "value")
      .min(-1)
      .max(1)
      .name("Border Size")
    this.shaderFolder
      .add(this.uniforms.uWaveSpeed, "value")
      .min(0)
      .max(1)
      .name("Wave Speed")
  }

  update() {
    this.uniforms.uTime.value += 0.2
  }

  bind() {}
}

const _instance = new Spectrum()
export default _instance
