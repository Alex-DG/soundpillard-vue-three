import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

import * as THREE from "three"

class Floor {
  constructor() {
    this.bind()
    this.modelLoader = new GLTFLoader()
  }

  init(scene) {
    this.scene = scene
    this.modelLoader.load("./assets/models/floor.glb", (glb) => {
      console.log("floor", { glb })
      this.scene.add(glb.scene)
    })
  }

  update() {}

  bind() {}
}

const _instance = new Floor()
export default _instance
