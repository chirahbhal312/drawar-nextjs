'use client'

import { Canvas } from '@react-three/fiber'
import { ARButton, XR, Controllers, Hands } from '@react-three/xr'
import { useRef } from 'react'

function SpinningBox() {
  const meshRef = useRef()

  return (
    <mesh ref={meshRef} position={[0, 0, -2]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  )
}

export default function Page() {
  return (
    <>
      <ARButton sessionInit={{ requiredFeatures: ['hit-test'] }} />

      <Canvas>
        <XR>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <Controllers />
          <Hands />
          <SpinningBox />
        </XR>
      </Canvas>
    </>
  )
}
