'use client'
import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useHelper } from '@react-three/drei'
import * as THREE from 'three'

export function CausticProjector() {
  const textureRef = useRef<THREE.CanvasTexture>(null!)
  const lightRef = useRef<THREE.SpotLight>(null!)
  
  // 1. Setup Canvas & Context
  // We use a Ref so we can draw on it every single frame
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)

  // 2. Generate "Wave Agents"
  // Instead of random lines, we create persistent "waves" that we can animate
  const waves = useMemo(() => {
    const temp = []
    for (let i = 0; i < 30; i++) {
      temp.push({
        x: Math.random() * 512,
        y: Math.random() * 512,
        // Random speed for each wave to move independently
        speedX: (Math.random() - 0.5) * 2, 
        speedY: (Math.random() - 0.5) * 2,
        // Random size for variety
        size: Math.random() * 100 + 50
      })
    }
    return temp
  }, [])

  // Initialize Canvas once
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    canvasRef.current = canvas
    contextRef.current = canvas.getContext('2d')
  }, [])

  // 3. The Animation Loop (Redraws the texture 60 times a second)
  useFrame((state) => {
    const canvas = canvasRef.current
    const ctx = contextRef.current
    if (!canvas || !ctx || !textureRef.current) return

    const t = state.clock.getElapsedTime()

    // Clear the screen (Black background)
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, 512, 512)

    // Setup style
    ctx.globalCompositeOperation = 'lighter'
    ctx.strokeStyle = '#00FFFF'
    ctx.lineWidth = 12
    ctx.lineCap = 'round'

    // Draw and Move each wave
    waves.forEach((wave, i) => {
      ctx.beginPath()
      
      // MOVEMENT LOGIC:
      // Move base position
      wave.x += wave.speedX
      wave.y += wave.speedY

      // Wrap around edges (Infinite scroll effect)
      if (wave.x > 512) wave.x = 0
      if (wave.x < 0) wave.x = 512
      if (wave.y > 512) wave.y = 0
      if (wave.y < 0) wave.y = 512

      // ANIMATION LOGIC:
      // Use Sine/Cosine to make the curves wiggle and breathe
      const wobble = Math.sin(t * 2 + i) * 20 

      ctx.moveTo(wave.x, wave.y)
      ctx.bezierCurveTo(
        wave.x + 50 + wobble, wave.y + wobble,
        wave.x - 50 - wobble, wave.y + 100,
        wave.x + wobble, wave.y + 200
      )
      ctx.stroke()
    })

    // CRITICAL: Tell Three.js the image has changed and needs an update
    textureRef.current.needsUpdate = true
  })

  // DEBUG Helper (Yellow Cone)
  useHelper(lightRef, THREE.SpotLightHelper, 'yellow')

  return (
    <spotLight
      ref={lightRef}
      position={[0, 10, 5]} // Keep this close to the whale (Adjust as needed)
      angle={0.5}
      penumbra={0.5}
      intensity={200}
      distance={20}
      castShadow
      color="#FFFFFF"
    >
        {/* Create the texture container. 
            We pass the canvasRef.current, but since it's null initially, 
            we rely on the useFrame loop to populate it. 
        */}
        <canvasTexture 
            ref={textureRef} 
            attach="map" 
            args={[canvasRef.current || document.createElement('canvas')]} 
            wrapS={THREE.RepeatWrapping}
            wrapT={THREE.RepeatWrapping}
            repeat={[10,10]}
        />
    </spotLight>
  )
}