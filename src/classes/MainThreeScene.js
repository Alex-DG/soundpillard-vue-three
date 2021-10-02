import * as THREE from "three"

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import RAF from "../utils/RAF"
import config from "../utils/config"
import MyGUI from "../utils/MyGUI"

import SpherePillards from "./SpherePillards"
import Floor from "./Floor"
import Spectrum from "./Spectrum"
import ParticleSystem from "./ParticleSystem"
import CamParallax from "./CamParallax"

class MainThreeScene {
  constructor() {
    this.bind()
    this.camera
    this.scene
    this.renderer
    this.controls

    this.camFolder = MyGUI.addFolder("Camera Folder")
    this.camFolder.open()
  }

  init(container) {
    //RENDERER SETUP
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.debug.checkShaderErrors = true
    container.appendChild(this.renderer.domElement)

    //MAIN SCENE INSTANCE
    this.scene = new THREE.Scene()

    //CAMERA AND ORBIT CONTROLLER
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.set(0, 0, 10)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enabled = false //config.
    this.controls.maxDistance = 1500
    this.controls.minDistance = 0
    CamParallax.init(this.camera)

    SpherePillards.init(this.scene)
    Floor.init(this.scene)
    Spectrum.init(this.scene)
    ParticleSystem.init(this.scene)

    MyGUI.hide()
    if (config.myGui) MyGUI.show()

    this.camFolder
      .add(this.controls, "enabled")
      .onChange(() => {
        if (this.controls.enabled) {
          CamParallax.active = false
        }
      })
      .listen()
      .name("Orbit Controls")
    this.camFolder
      .add(CamParallax, "active")
      .onChange(() => {
        if (CamParallax.active) {
          this.controls.enabled = false
        }
      })
      .listen()
      .name("Cam Parallax")

    this.camFolder.add(CamParallax.params, "intensity", 0.001, 0.01)
    this.camFolder.add(CamParallax.params, "ease", 0.01, 0.1)

    //RENDER LOOP AND WINDOW SIZE UPDATER SETUP
    window.addEventListener("resize", this.resizeCanvas)
    RAF.subscribe("threeSceneUpdate", this.update)
  }

  update() {
    this.renderer.render(this.scene, this.camera)
    SpherePillards.update()
    Spectrum.update()
    ParticleSystem.update()
    CamParallax.update()
  }

  resizeCanvas() {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }

  bind() {
    this.resizeCanvas = this.resizeCanvas.bind(this)
    this.update = this.update.bind(this)
    this.init = this.init.bind(this)
  }
}

const _instance = new MainThreeScene()
export default _instance
