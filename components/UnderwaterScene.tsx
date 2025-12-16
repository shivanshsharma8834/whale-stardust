'use client'
import { Canvas } from '@react-three/fiber'
import { Environment, Sparkles, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Whale } from './Whale' // Import your whale component
import { Suspense } from 'react'

export default function UnderwaterScene() {
  return (
    <div className="h-screen w-full bg-black">
      <Canvas>
        {/* Camera setup */}
        <PerspectiveCamera makeDefault position={[0, 2, 10]} />
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 1.8} />

        {/* 1. THE UNDERWATER ATMOSPHERE */}
        {/* Deep blue fog to hide the "end" of the world */}
        <fog attach="fog" args={['#051829', 0, 35]} />
        <color attach="background" args={['#051829']} />

        {/* 2. LIGHTING */}
        {/* Ambient light for general visibility */}
        <ambientLight intensity={0.5} />
        {/* Directional light acting as the sun from above */}
        <directionalLight position={[5, 10, 5]} intensity={2} color="#80e0ff" />
        
        {/* 3. PARTICLES (Stardust/Plankton) */}
        {/* These float around the whale giving a sense of water density */}
        <Sparkles 
          count={500} 
          scale={[20, 20, 20]} 
          size={4} 
          speed={0.4} 
          opacity={0.6}
          color="#aaddff"
        />

        {/* 4. THE WHALE & REFLECTIONS */}
        <Suspense fallback={null}>
          <Whale />
          
          {/* Optional: Environment map for realistic reflections on the whale's skin */}
          <Environment preset="night" />
        </Suspense>

      </Canvas>
    </div>
  )
}