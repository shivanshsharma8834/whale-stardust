'use client'
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export function Whale() {
  // Replace '/whale.glb' with your actual file path inside the public folder
  const { scene, animations } = useGLTF('/whale.glb') 
  const whaleRef = useRef<THREE.Group>(null)

  // Add a gentle floating animation (swimming motion)
  useFrame((state) => {
    if (!whaleRef.current) return;
    const t = state.clock.getElapsedTime()
    // Bobbing up and down
    whaleRef.current.position.y = Math.sin(t * 0.5) * 0.5
    // Slight rotation to mimic swimming
    whaleRef.current.rotation.z = Math.sin(t * 0.3) * 0.05
  })

  return (
    <group ref={whaleRef} dispose={null} scale={0.05}>
      {/* Primitive allows you to render a loaded GLTF scene */}
      <primitive object={scene} />
    </group>
  )
}