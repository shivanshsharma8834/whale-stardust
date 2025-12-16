'use client'
import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function GlowingParticles({ count = 3000 }) {
  const mesh = useRef<THREE.Points>(null!)
  const { viewport } = useThree()

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const cols = new Float32Array(count * 3)
    const s = new Float32Array(count)
    
    const tempColor = new THREE.Color()
    
    // 1. A Magical Palette (Gold, Pink, Cyan, Deep Purple, White)
    const palette = [
        '#ffaa00', // Gold/Sunlight
        '#ff00aa', // Hot Pink
        '#00ffff', // Cyan
        '#ffffff', // Pure White
        '#aa00ff', // Deep Magic Purple
    ]

    for (let i = 0; i < count; i++) {
      // POSITIONS: Spread wide
      pos[i * 3] = (Math.random() - 0.5) * 150
      pos[i * 3 + 1] = (Math.random() - 0.5) * 150
      pos[i * 3 + 2] = (Math.random() - 0.5) * 150

      // COLORS: Pick random color from palette
      const hex = palette[Math.floor(Math.random() * palette.length)]
      tempColor.set(hex)
      
      // *** THE GLOW TRICK ***
      // We multiply the color by a high number (intensity).
      // This sends values > 1.0 to the GPU, forcing the Bloom effect to trigger hard.
      // Randomize intensity so some twinkle brighter than others.
      const intensity = Math.random() * 4 + 1 // range: 1x to 5x brighter
      tempColor.multiplyScalar(intensity)

      cols[i * 3] = tempColor.r
      cols[i * 3 + 1] = tempColor.g
      cols[i * 3 + 2] = tempColor.b

      // SIZES: Make them bigger generally, with some huge "Hero" sparks
      s[i] = Math.random() * 3 + 0.5 
    }
    return [
        new THREE.BufferAttribute(pos, 3), 
        new THREE.BufferAttribute(cols, 3), 
        new THREE.BufferAttribute(s, 1)
    ]
  }, [count])

  // Animation: Gentle rotation
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 0.05
    mesh.current.rotation.y = t
    mesh.current.rotation.z = t * 0.2
  })

  // Texture Generation (Sharper core for "Spark" look)
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128 // High res
    canvas.height = 128
    const context = canvas.getContext('2d')
    if (context) {
        const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64)
        // Very hot white center (0% - 10%)
        gradient.addColorStop(0, 'rgba(255,255,255,1)') 
        gradient.addColorStop(0.1, 'rgba(255,255,255,0.8)') 
        // Rapid falloff to create a "star" point
        gradient.addColorStop(0.4, 'rgba(255,255,255,0.1)') 
        gradient.addColorStop(1, 'rgba(0,0,0,0)')
        context.fillStyle = gradient
        context.fillRect(0, 0, 128, 128)
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  return (
    <points ref={mesh}>
      <bufferGeometry>
        {/* We use 'primitive' because 'positions' is already a THREE.BufferAttribute instance */}
        {/* Use 'primitive' to attach the already-created BufferAttribute instances */}
        <primitive object={positions} attach="attributes-position" />
        <primitive object={colors} attach="attributes-color" />
        <primitive object={sizes} attach="attributes-size" />
      </bufferGeometry>
      <pointsMaterial
        size={2.5} // Base size increased
        vertexColors={true}
        map={texture}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={1}
        sizeAttenuation={true}
      />
    </points>
  )
}   