'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton'

export default function DrawingARPage() {
  const canvasRef = useRef(null)
  const [brushColor, setBrushColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(5)
  const [showUI, setShowUI] = useState(true)
  const [rendererRef, setRendererRef] = useState(null)
  const [currentMaterial, setCurrentMaterial] = useState(null)
  const [isNewARDrawingReady, setNewARDrawingReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let drawing = false
    let lastX = 0
    let lastY = 0

    const start = (x, y) => {
      drawing = true
      lastX = x
      lastY = y
    }

    const draw = (x, y) => {
      if (!drawing) return
      ctx.strokeStyle = brushColor
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(lastX, lastY)
      ctx.lineTo(x, y)
      ctx.stroke()
      lastX = x
      lastY = y
    }

    canvas.addEventListener('mousedown', e => start(e.offsetX, e.offsetY))
    canvas.addEventListener('mousemove', e => draw(e.offsetX, e.offsetY))
    canvas.addEventListener('mouseup', () => drawing = false)
    canvas.addEventListener('mouseout', () => drawing = false)

    canvas.addEventListener('touchstart', e => {
      const t = e.touches[0]
      start(t.clientX, t.clientY)
      e.preventDefault()
    })
    canvas.addEventListener('touchmove', e => {
      const t = e.touches[0]
      draw(t.clientX, t.clientY)
      e.preventDefault()
    })
    canvas.addEventListener('touchend', () => drawing = false)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [brushColor, brushSize])

  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera()
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.xr.enabled = true
    document.body.appendChild(renderer.domElement)
    setRendererRef(renderer)

    const arButton = ARButton.createButton(renderer, {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay'],
      domOverlay: { root: document.body }
    })
    document.body.appendChild(arButton)

    const controller = renderer.xr.getController(0)
    scene.add(controller)

    controller.addEventListener('select', () => {
      if (showUI || !isNewARDrawingReady || !currentMaterial) return

      const aspect = canvasRef.current.width / canvasRef.current.height
      const geometry = new THREE.PlaneGeometry(0.4, 0.4 / aspect)
      const plane = new THREE.Mesh(geometry, currentMaterial.clone())

      const cameraDirection = new THREE.Vector3()
      camera.getWorldDirection(cameraDirection)
      plane.position.copy(camera.position).add(cameraDirection.multiplyScalar(1.5))
      plane.quaternion.copy(camera.quaternion)
      scene.add(plane)
      setNewARDrawingReady(false)
    })

    renderer.setAnimationLoop(() => renderer.render(scene, camera))

    return () => {
      renderer.dispose()
      document.body.removeChild(renderer.domElement)
      document.body.removeChild(arButton)
    }
  }, [currentMaterial, isNewARDrawingReady, showUI])

  const loadCanvasToTexture = () => {
    const textureLoader = new THREE.TextureLoader()
    const dataURL = canvasRef.current.toDataURL('image/png')
    textureLoader.load(dataURL, texture => {
      setCurrentMaterial(new THREE.MeshBasicMaterial({ map: texture, transparent: true }))
      setNewARDrawingReady(true)
    })
  }

  return (
    <>
      <button onClick={() => setShowUI(!showUI)} style={hamburgerStyle}>☰</button>
      {showUI && (
        <div style={controlsStyle}>
          <div>
            <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} />
            <input type="range" min="1" max="50" value={brushSize} onChange={e => setBrushSize(e.target.value)} />
            <button onClick={loadCanvasToTexture}>Draw → AR</button>
          </div>
          <button onClick={() => {
            const ctx = canvasRef.current.getContext('2d')
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
          }}>Clear</button>
        </div>
      )}
      <canvas ref={canvasRef} style={canvasStyle}></canvas>
    </>
  )
}

const canvasStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 1,
  touchAction: 'none'
}

const controlsStyle = {
  position: 'fixed',
  top: 10,
  left: 10,
  zIndex: 2,
  background: 'rgba(255,255,255,0.9)',
  padding: '10px',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
}

const hamburgerStyle = {
  position: 'fixed',
  top: 10,
  right: 10,
  fontSize: '28px',
  zIndex: 3,
  background: 'rgba(255,255,255,0.9)',
  padding: '5px 10px',
  borderRadius: '8px',
  cursor: 'pointer'
}
