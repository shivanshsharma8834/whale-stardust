'use client'
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { SpotLight } from '@react-three/drei'
import * as THREE from 'three'

// Helper component for a SINGLE moving ray
function MovingRay({ 
  position, 
  color, 
  delay = 0, 
  size = 1 
}: { 
  position: [number, number, number], 
  color: string, 
  delay?: number, 
  size?: number 
}) {
  const lightRef = useRef<THREE.Group>(null)
  const targetRef = useRef(new THREE.Object3D())

  useFrame((state) => {
    if (!lightRef.current) return
    const t = state.clock.getElapsedTime() + delay

    // 1. SWAY ANIMATION (Source moves gently)
    // Increased movement range for more epic feeling
    lightRef.current.position.x = position[0] + Math.sin(t * 0.1) * 5.0
    lightRef.current.position.z = position[2] + Math.cos(t * 0.15) * 5.0

    // 2. TARGET WANDER (The spot on the floor moves)
    targetRef.current.position.x = Math.sin(t * 0.1) * 8
    targetRef.current.position.z = Math.cos(t * 0.15) * 8
  })

  return (
    <>
      {/* Invisible target far below */}
      <primitive object={targetRef.current} position={[0, -50, 0]} />
      
      <SpotLight
        ref={lightRef}
        target={targetRef.current}
        position={position}
        color={color}
        volumetric
        // --- UPDATED SETTINGS FOR BIGGER RAYS ---
        attenuation={25}   // Higher = fades out softer at the bottom
        anglePower={3}     // Lower = softer edges, wider feel
        intensity={4 * size} // Brighter to compensate for size
        distance={150}     // Much longer beams (was 60)
        angle={0.8 * size} // Much wider cone (was 0.4)
        opacity={0.5}      // Slightly more visible fog
        castShadow={false}
      />
    </>
  )
}

export function GodRays() {
  return (
    // RENDER ORDER FIX:
    // Setting renderOrder to -1 forces these beams to be drawn BEFORE
    // standard items like your particles and whale. 
    // This pushes them into the background and prevents graphical glitches.
    <group renderOrder={-1}>
      {/* Moved positions much higher (Y=50 instead of Y=20) 
         so the cones are huge when they enter the camera view.
      */}
      {/* Main Central Beam */}
      <MovingRay position={[0, 50, 0]} color="#ffffff" size={1.5} delay={0} />

      {/* Wide Left Beam (Cyan) */}
      <MovingRay position={[-15, 45, 5]} color="#00FFFF" size={1.2} delay={2} />

      {/* Wide Right Beam (Deep Blue) */}
      <MovingRay position={[15, 45, -5]} color="#00aaff" size={1.3} delay={5} />

      {/* Background Filler Beam */}
      <MovingRay position={[0, 48, -15]} color="#aaddff" size={1.0} delay={3.5} />
    </group>
  )
}