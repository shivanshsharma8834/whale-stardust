'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { SpotLight } from '@react-three/drei'
import * as THREE from 'three'

export function GodRays() {
  const beamsRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!beamsRef.current) return;
    const t = state.clock.getElapsedTime()
    
    // Gentle swaying of the light rays to simulate surface wave movement
    beamsRef.current.rotation.x = Math.sin(t * 0.1) * 0.05
    beamsRef.current.rotation.z = Math.cos(t * 0.15) * 0.05
  })

  return (
    <group ref={beamsRef}>
      {/* Volumetric SpotLight 1: The Main Beam 
        - volumetric: Enables the fog effect
        - attenuation: How fast the light fades (higher = sharper beam)
        - anglePower: Sharpening of the edge
      */}
      <SpotLight
        position={[4, 15, -5]} // High up and slightly offset
        target-position={[0, 0, 0]} // Aim at center
        color="#aaddff"
        volumetric
        attenuation={8}
        anglePower={5} // High anglePower = defined beams
        intensity={2}
        distance={40}
        angle={0.5}
        opacity={0.4} // Visibility of the fog
      />

      {/* Volumetric SpotLight 2: The Secondary "Fill" Beam */}
      <SpotLight
        position={[-4, 15, 2]}
        target-position={[0, 0, 0]}
        color="#00FFFF" // More Cyan
        volumetric
        attenuation={10}
        anglePower={7}
        intensity={1}
        distance={40}
        angle={0.4}
        opacity={0.2} // Subtler
      />
    </group>
  )
}