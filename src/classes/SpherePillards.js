import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

import * as THREE from "three"

class SpherePillards {
  constructor() {
    this.bind()
    this.modelLoader = new GLTFLoader()
    this.textureLoader = new THREE.TextureLoader()
  }

  init(scene) {
    this.scene = scene
    this.modelLoader.load("./assets/models/pillard.glb", (glb) => {
      console.log("sphere pillard", { glb })

      /// Load matcap textures
      const gTexture = this.textureLoader.load(
        "./assets/textures/greyMetal.png"
      )
      const bTexture = this.textureLoader.load(
        "./assets/textures/blackMetal.png"
      )

      // Create matcaps
      this.gMatCap = new THREE.MeshMatcapMaterial({
        matcap: gTexture,
      })
      this.bMatCap = new THREE.MeshMatcapMaterial({
        matcap: bTexture,
      })

      glb.scene.traverse((child) => {
        // if (child instanceof THREE.Mesh) {
        if (child.name === "base") {
          child.material = this.bMatCap
        }
        if (child.name === "Cylinder") {
          child.material = this.gMatCap
        }
      })
      this.scene.add(glb.scene)
    })
  }

  update() {}

  bind() {}
}

const _instance = new SpherePillards()
export default _instance
