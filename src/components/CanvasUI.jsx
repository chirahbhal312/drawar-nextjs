'use client'
import { useRef, useEffect } from 'react'

export default function CanvasUI({ brushColor, setBrushColor, brushSize, setBrushSize, onDrawToAR, visible }) {
  const canvasRef = useRef(null)

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
    let lastX = 0, lastY = 0

    const start = (x, y) => { drawing = true; lastX = x; lastY = y }
    const draw = (x, y) => {
      if (!drawing) return
      ctx.strokeStyle = brushColor
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(lastX, lastY)
      ctx.lineTo(x, y)
      ctx.stroke()
      lastX = x; lastY = y
    }

    // Events
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

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [brushColor, brushSize])

  if (!visible) return null

  return (
    <>
      <div style={controlsStyle}>
        <div>
          <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} />
          <input type="range" min="1" max="50" value={brushSize} onChange={e => setBrushSize(e.target.value)} />
          <button onClick={() => onDrawToAR(canvasRef.current)}>Draw → AR</button>
        </div>
        <button onClick={() => {
          const ctx = canvasRef.current.getContext('2d')
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }}>Clear</button>
      </div>
      <canvas ref={canvasRef} style={canvasStyle}></canvas>
    </>
  )
}

const canvasStyle = {
  position: 'absolute', top: 0, left: 0,
  zIndex: 1, touchAction: 'none'
}

const controlsStyle = {
  position: 'fixed', top: 10, left: 10,
  zIndex: 2, background: 'rgba(255,255,255,0.9)',
  padding: '10px', borderRadius: '8px',
  display: 'flex', flexDirection: 'column', gap: '10px'
}
