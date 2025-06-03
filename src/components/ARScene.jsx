'use client'
import { useEffect } from 'react'
import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton'

export default function ARScene({ currentMaterial, allowPlacement }) {
  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera()
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.xr.enabled = true
    document.body.appendChild(renderer.domElement)

    const arButton = ARButton.createButton(renderer, {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay'],
      domOverlay: { root: document.body }
    })
    document.body.appendChild(arButton)

    const controller = renderer.xr.getController(0)
    scene.add(controller)

    controller.addEventListener('select', () => {
  if (!allowPlacement || !currentMaterial) return

  const aspect = window.innerWidth / window.innerHeight
  const geometry = new THREE.PlaneGeometry(0.4, 0.4 / aspect)
  const mesh = new THREE.Mesh(geometry, currentMaterial.clone())

  const cameraDir = new THREE.Vector3()
  camera.getWorldDirection(cameraDir)
  mesh.position.copy(camera.position).add(cameraDir.multiplyScalar(1.5))
  mesh.quaternion.copy(camera.quaternion)

  scene.add(mesh)
})


    renderer.setAnimationLoop(() => renderer.render(scene, camera))

    return () => {
      renderer.dispose()
      document.body.removeChild(renderer.domElement)
      document.body.removeChild(arButton)
    }
  }, [currentMaterial, allowPlacement])

  return null
}
