import img from './light_dot.png'
let THREE = window.THREE

const INIT = Symbol('INIT')
const INIT_WORDS = Symbol('INIT_WORDS')
const BIND_EVENTS = Symbol('BIND_EVENTS')

function getStyle (el, name) {
  if (window.getComputedStyle) {
    return window.getComputedStyle(el, null)[name]
  } else {
    return el.currentStyle[name]
  }
}

let texture = new THREE.TextureLoader().load(img)

class Points {
  constructor (el, words = ['hello', 'world']) {
    this.el = el
    this.words = words
    this[ INIT ]()
    this[ INIT_WORDS ]()
    this[ BIND_EVENTS ]()
    this._render()
  }
  [ INIT ] () {
    this.time = 0
    this.stage = 0
    this.width = parseInt(getStyle(this.el, 'width'))
    this.height = parseInt(getStyle(this.el, 'height'))

    this.scene = new THREE.Scene()

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(this.width, this.height)
    this.el.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000)
    this.camera.position.z = 200

    this.cameraControl = new THREE.TrackballControls(this.camera, this.renderer.domElement)
  }

  [ INIT_WORDS ] () {
    this.fontLoader = new THREE.FontLoader()
    this.fontLoader.load('/static/optimer_bold.typeface.json', (font) => {
      let geometries = this.words.map(text => {
        let geometry = new THREE.TextGeometry(text, {
          font: font,
          size: 80,
          height: 5,
          curveSegments: 10
        })
        geometry.computeBoundingBox()
        let [minX, minY, maxX, maxY] = [geometry.boundingBox.min.x, geometry.boundingBox.min.y, geometry.boundingBox.max.x, geometry.boundingBox.max.y]
        let [centerX, centerY] = [(minX + maxX) / 2, (minY + maxY) / 2]
        let matrix = new THREE.Matrix4()
        matrix.makeTranslation(-centerX, -centerY, 0)
        geometry.applyMatrix(matrix)
        return geometry
      })
      var maxCounts = Math.max(...geometries.map(g => g.vertices.length))

      var geometry = new THREE.BufferGeometry()
      var positions = new Float32Array(maxCounts * 3)
      geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3))

      var speed = new Float32Array(maxCounts)
      for (let i = 0; i < maxCounts; i++) {
        speed[i] = Math.random() + 4
      }
      geometry.addAttribute('speed', new THREE.BufferAttribute(speed, 1))

      geometries.forEach((g, index) => {
        var iPositions = new Float32Array(maxCounts * 3)
        g.vertices.forEach((vertice, vIndex) => {
          vertice.toArray(iPositions, vIndex * 3)
        })
        geometry.addAttribute('position' + index, new THREE.BufferAttribute(iPositions, 3))
      })

      var material = new THREE.PointsMaterial({
        color: 0xffff00,
        depthTest: false,
        map: texture,
        transparent: true,
        size: 5
      })

      this.points = new THREE.Points(
        geometry,
        material
      )

      this.scene.add(this.points)
    })
  }

  update () {
    this.time += 0.008
    let step = this.time % 1
    this.stage = Math.floor(this.time % this.words.length)
    if (this.points) {
      let speed = this.points.geometry.attributes.speed.array

      let position = this.points.geometry.attributes.position.array
      let position1 = 'position' + (this.stage === 0 ? this.words.length - 1 : this.stage - 1)
      let position2 = 'position' + this.stage
      let start = this.points.geometry.attributes[position1].array
      let end = this.points.geometry.attributes[position2].array

      let length = speed.length
      for (let i = 0; i < length; i++) {
        position[i * 3] = start[i * 3] + Math.min(1, (step * speed[i])) * (end[i * 3] - start[i * 3])
        position[i * 3 + 1] = start[i * 3 + 1] + Math.min(1, (step * speed[i])) * (end[i * 3 + 1] - start[i * 3 + 1])
        position[i * 3 + 2] = start[i * 3 + 2] + Math.min(1, (step * speed[i])) * (end[i * 3 + 2] - start[i * 3 + 2])
      }

      this.points.geometry.attributes.position.needsUpdate = true
    }
  }

  render () {
    this.renderer.render(this.scene, this.camera)
    this.cameraControl.update()
  }

  _render () {
    this.update()
    this.render()
    window.requestAnimationFrame(this._render.bind(this))
  }

  [ BIND_EVENTS ] () {
    window.addEventListener('resize', this.resize.bind(this))
  }

  resize () {
    this.width = parseInt(getStyle(this.el, 'width'))
    this.height = parseInt(getStyle(this.el, 'height'))
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.width, this.height)
  }
}

export default Points
