'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

export function CinematicCamera() {
  const controlsRef = useRef<OrbitControlsImpl>(null)

  useFrame((state) => {
    if (!controlsRef.current) return;
    
    const t = state.clock.getElapsedTime()

    // OSCILLATION LOGIC:
    // Math.sin(t * 0.2) creates a wave from -1 to 1.
    // We multiply by 1.3 radians (approx 75 degrees).
    // This sweeps from -75° to +75° (Total 150° range).
    const azimuth = Math.sin(t * 0.2) * 1.3 
    
    // Force the camera to this angle
    controlsRef.current.setAzimuthalAngle(azimuth)
    
    // Optional: Add a very slight slow zoom breathe effect
    // controlsRef.current.object.position.z = 12 + Math.sin(t * 0.1) * 0.5
    
    controlsRef.current.update()
  })

  return (
    <OrbitControls
      ref={controlsRef}
      // DISABLE MANUAL INTERACTION
      enableZoom={false}
      enablePan={false}
      enableRotate={false} 
      
      // RESTRICTIONS (Just in case)
      minPolarAngle={Math.PI / 2 - 0.3} // Don't look too high up
      maxPolarAngle={Math.PI / 2 + 0.3} // Don't look too low down
      target={[0, 0, 0]} // Always look at the center (the whale)
    />
  )
}