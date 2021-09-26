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
    this.upVector = new THREE.Vector3(0, 1, 0) // pointing up!
    this.pillard

    this.modelLoader.load("./assets/models/pillard.glb", (glb) => {
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
          this.pillard = child
          child.material = this.bMatCap
        }

        if (child.name === "Cylinder") {
          child.material = this.gMatCap
        }
      })

      this.computePosition()
    })
  }

  computePosition() {
    // Create ico sphere
    const sphereGeometry = new THREE.IcosahedronGeometry(2, 3)
    const sphereMaterial = this.gMatCap
    this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    this.scene.add(this.sphere)

    // Create a position array of each vertecis of the sphere
    let vertexArray = []
    for (
      let i = 0;
      i < sphereGeometry.attributes.position.array.length;
      i += 3
    ) {
      const x = sphereGeometry.attributes.position.array[i]
      const y = sphereGeometry.attributes.position.array[i + 1]
      const z = sphereGeometry.attributes.position.array[i + 2]

      vertexArray.push({ x, y, z })
    }

    // Create pillard positions
    let pillardPositions = []
    for (let i = 0; i < vertexArray.length; i++) {
      let existsFlag = false

      for (let j = 0; j < pillardPositions.length; j++) {
        const shouldUpdateFlag =
          pillardPositions[j].x === vertexArray[i].x &&
          pillardPositions[j].y === vertexArray[i].y &&
          pillardPositions[j].z === vertexArray[i].z

        if (shouldUpdateFlag) existsFlag = true
      }

      if (!existsFlag) {
        // Vertice not in use so we can push it in the pillard positions array
        pillardPositions.push({
          x: vertexArray[i].x,
          y: vertexArray[i].y,
          z: vertexArray[i].z,
        })

        const clone = this.pillard.clone()

        // Pillard with positions
        const posVector = new THREE.Vector3(
          vertexArray[i].x,
          vertexArray[i].y,
          vertexArray[i].z
        )
        clone.position.copy(posVector)

        clone.scale.multiplyScalar(0.2)

        // Rotate pillard in the good position
        clone.quaternion.setFromUnitVectors(
          this.upVector,
          posVector.normalize()
        )

        this.scene.add(clone)
      }
    }

    this.scene.add(this.sphere)
  }

  update() {}

  bind() {}
}

const _instance = new SpherePillards()
export default _instance
