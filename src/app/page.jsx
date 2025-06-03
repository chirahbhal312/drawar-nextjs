'use client'

import { useState } from 'react'
import CanvasUI from '@/components/CanvasUI'
import ARScene from '@/components/ARScene'
import * as THREE from 'three'

export default function DrawingARPage() {
  const [showUI, setShowUI] = useState(true)
  const [brushColor, setBrushColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(5)
  const [currentMaterial, setCurrentMaterial] = useState(null)
  const [allowPlacement, setAllowPlacement] = useState(false)

  const handleDrawToAR = (canvasEl) => {
  if (!canvasEl) return

  const dataURL = canvasEl.toDataURL('image/png')
  const loader = new THREE.TextureLoader()

  loader.load(dataURL, (texture) => {
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    setCurrentMaterial(material)
    setAllowPlacement(true) // ✅ Now allow AR placement
  }, undefined, (err) => {
    alert("Texture loading failed", err)
  })
}


  return (
    <>
      <button onClick={() => setShowUI(!showUI)} style={hamburgerStyle}>☰</button>

      <CanvasUI
        visible={showUI}
        brushColor={brushColor}
        setBrushColor={setBrushColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        onDrawToAR={handleDrawToAR}
      />

      <ARScene currentMaterial={currentMaterial} allowPlacement={!showUI && allowPlacement} />
    </>
  )
}

const hamburgerStyle = {
  position: 'fixed', top: 10, right: 10,
  fontSize: '28px', zIndex: 3,
  background: 'rgba(255,255,255,0.9)',
  padding: '5px 10px', borderRadius: '8px', cursor: 'pointer'
}
