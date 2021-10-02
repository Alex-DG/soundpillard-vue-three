import SoundReactor from "./SoundReactor"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import MyGUI from "../utils/MyGUI"

import * as THREE from "three"

class SpherePillards {
  constructor() {
    this.bind()
    this.modelLoader = new GLTFLoader()
    this.textureLoader = new THREE.TextureLoader()

    this.params = {
      waveSpeed: 1,
      subDiv: 3,
      pillardSize: 0.2,
    }

    this.sphereFolder = MyGUI.addFolder("Sphere Pillards")
    this.sphereFolder.open()
  }

  init(scene) {
    this.scene = scene
    this.upVector = new THREE.Vector3(0, 1, 0) // pointing up!
    this.pillards = new THREE.Group()
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
          // Base + pillard inside
          this.pillard = child
          child.material = this.bMatCap
        }

        if (child.name === "Cylinder") {
          child.material = this.gMatCap
        }
      })

      this.computePosition()
    })

    this.sphereFolder
      .add(this.params, "waveSpeed")
      .min(0.001)
      .max(3)
      .name("Wave Speed")

    this.sphereFolder
      .add(this.params, "subDiv")
      .min(1)
      .max(5)
      .step(1)
      .name("Ico Subdivisions")
      .onChange((_) => this.computePosition())

    this.sphereFolder
      .add(this.params, "pillardSize")
      .min(0.0)
      .max(1)
      .name("Pill Size")
      .onChange((_) => this.computePosition())
  }

  computePosition() {
    if (this.sphere) {
      this.scene.remove(this.sphere)
      this.pillards.clear()
    }

    // Create ico sphere
    const sphereGeometry = new THREE.IcosahedronGeometry(2, this.params.subDiv)
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

        // Clone base (with pillard inside clone.childre[0] is the pillard)
        const clone = this.pillard.clone()

        // Pillard with positions
        const posVector = new THREE.Vector3(
          vertexArray[i].x,
          vertexArray[i].y,
          vertexArray[i].z
        )
        clone.position.copy(posVector)

        clone.scale.multiplyScalar(this.params.pillardSize)

        // Rotate pillard in the good position
        clone.quaternion.setFromUnitVectors(
          this.upVector,
          posVector.normalize()
        )

        // this.scene.add(clone)
        this.pillards.add(clone)
      }
    }

    this.scene.add(this.pillards)
  }

  update() {
    if (SoundReactor.playFlag) {
      let i = 0
      const intensity = 4
      while (i < this.pillards.children.length) {
        const base = this.pillards.children[i]
        const pillard = base.children[0]
        pillard.position.y = (SoundReactor.fdata[i] / 255) * intensity
        i++
      }
    } else {
      let i = 0
      while (i < this.pillards.children.length) {
        const base = this.pillards.children[i]
        const pillard = base.children[0]
        pillard.position.y =
          (Math.sin(
            Date.now() * 0.01 * this.params.waveSpeed + base.position.x
          ) +
            1) *
          1.5

        i++
      }
    }
  }

  bind() {
    this.computePosition = this.computePosition.bind(this)
  }
}

const _instance = new SpherePillards()
export default _instance
