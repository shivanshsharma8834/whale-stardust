'use client'
import { Canvas, useThree } from '@react-three/fiber'
import { Sparkles, OrbitControls, PerspectiveCamera, useTexture, Environment, Caustics } from '@react-three/drei'
import { Whale } from './Whale'
import { Suspense } from 'react'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { GlowingParticles } from './GlowingParticles'
import { CausticProjector } from './CausticProjector'
import { GodRays } from './GodRays'
import { CinematicCamera } from './CinematicCamera'
import { Effects } from './Effects'

// 1. Create the Skybox Component
function OceanBackground() {
  // Load the 360 image (Make sure 'underwater-bg.jpg' is in your public folder)
  const texture = useTexture('/underwater.jpg')
  
  // Set the texture wrapping/encoding for a 360 sphere
  texture.mapping = THREE.EquirectangularReflectionMapping
  texture.colorSpace = THREE.SRGBColorSpace

  return (
    <mesh scale={[100, 100, 100]}> {/* Big enough to contain the scene */}
      <sphereGeometry />
      {/* 'side={THREE.BackSide}' paints the image on the INSIDE of the sphere */}
      <meshBasicMaterial map={texture} side={THREE.BackSide} color={"#aaaaaa"} />
    </mesh>
  )
}

export default function UnderwaterScene() {
  return (
    <div className="h-screen w-full bg-black">
      <Canvas gl={{antialias: false, toneMappingExposure: 0.5 }} onCreated={({ scene }) => {
           scene.backgroundIntensity = 0.5
           scene.environmentIntensity = 0.5 
        }}>
        <PerspectiveCamera makeDefault position={[0, 2, 12]} />
        {/* <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 1.5} /> */}
        <CinematicCamera />

        {/* 2. LIGHTING: The "Sun from Surface" Effect */}
        {/* Ambient light simulates light scattering in water (dark blue/teal) */}
        <ambientLight intensity={0.5} color="#001133" />
        
        {/* Main Directional Light (Sun) */}
        <directionalLight 
          position={[0, 20, 0]} // High up on Y axis
          intensity={3} 
          color="#00FFFF" // Cyan/Turquoise color mimics water filtration
          castShadow 
        />
        
        {/* Optional: A spotlight to create a focused "God ray" effect on the whale */}
        <spotLight 
          position={[0, 30, 0]} 
          angle={0.3} 
          penumbra={1} 
          intensity={5} 
          color="#aaddff" 
        />

        {/* <Effects /> */}
        {/* 3. PARTICLES */}
        {/* <Sparkles 
        count={2000}        // Increased from 500 to 2000
        scale={[50, 50, 50]} // Increased area so particles are everywhere
        size={30} 
        speed={0.4} 
        opacity={0.6} 
        color="#ffffff"   // White is usually best for "marine snow"
        blending={THREE.AdditiveBlending}
        transparent={true}
        depthWrite={false}
        /> */}
        <GlowingParticles count={2000} />
        {/* <GodRays />  */}

        {/* 4. SCENE CONTENT */}
        <Suspense fallback={null}>
          
            <Whale/>
          
          <Environment 
            files="/skyrender.hdr" 
            background 
            blur={0.01} 
          />
        </Suspense> 

        {/* Fog is still good to blend the sphere seam, but make it lighter to match your image */}
        <fogExp2 attach="fog" args={['#020817', 0.009]} />

        <EffectComposer multisampling={4}>
            {/* luminanceThreshold: Only pixels brighter than this value will glow (0-1)
            intensity: How strong the glow is
            */}
            <Bloom 
                luminanceThreshold={0.6} 
                luminanceSmoothing={0.3} 
                intensity={1.5} 
            />
        </EffectComposer>
      </Canvas>
    </div>
  )
}