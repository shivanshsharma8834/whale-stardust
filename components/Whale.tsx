'use client'
import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useTexture, Html } from '@react-three/drei'
import * as THREE from 'three'

// ==================== SHADER DEFINITIONS ====================
// (Keep these exactly as they were)
const causticVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const causticFragmentShader = `
  uniform sampler2D uCausticTex;
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uIntensity; 
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  void main() {
    vec2 animatedUV = vUv * 4.0 + vec2(uTime * 0.05, uTime * 0.02);
    vec4 texColor = texture2D(uCausticTex, animatedUV);
    float topMask = max(0.0, vWorldNormal.y);
    topMask = pow(topMask, 3.0); 
    vec3 finalColor = texColor.rgb * uColor * topMask * uIntensity;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`
// ============================================================

export function Whale() {
  const { scene } = useGLTF('/whale.glb')
  const textures = useTexture({
    skin: '/textures/whale_skin.png',
    caustics: '/textures/caustics.png', 
  })

  // --- STATE ---
  const [clicked, setClicked] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)
  
  // Timer Ref to clear timeouts if user clicks fast
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const messages = useMemo(() => [
    "The currents are warm today...",
    "Have you seen the surface?",
    "I am ancient and vast.",
    "Drifting... forever drifting...",
    "Hello, traveler."
  ], [])

  // --- LOGIC: CLICK WHALE ---
  const handleWhaleClick = (e: any) => {
    e.stopPropagation() // Prevent this click from hitting the "Background Catcher"
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (!clicked) {
        setClicked(true)
    } else {
        // Cycle message if already open
        setMessageIndex((prev) => (prev + 1) % messages.length)
    }

    // Auto-close after 5 seconds
    timeoutRef.current = setTimeout(() => {
        setClicked(false)
    }, 5000)
  }

  // --- LOGIC: CLICK OUTSIDE ---
  // We use a simple transparent plane that covers the scene to catch "missed" clicks
  const handleBackgroundClick = () => {
    setClicked(false)
  }

  // --- LAYERS SETUP (Standard) ---
  const skinLayer = useMemo(() => scene.clone(), [scene])
  const causticLayer = useMemo(() => scene.clone(), [scene])
  const causticMaterials = useRef<THREE.ShaderMaterial[]>([])

  useMemo(() => {
    // Skin
    textures.skin.flipY = false
    textures.skin.colorSpace = THREE.SRGBColorSpace
    skinLayer.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
        mesh.material = new THREE.MeshStandardMaterial({
          map: textures.skin,
          roughness: 0.4,
          metalness: 0.1,
          color: new THREE.Color('#aaddff') 
        })
      }
    })
    // Caustics
    textures.caustics.wrapS = THREE.RepeatWrapping
    textures.caustics.wrapT = THREE.RepeatWrapping
    causticMaterials.current = []
    causticLayer.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        const shaderMat = new THREE.ShaderMaterial({
          vertexShader: causticVertexShader,
          fragmentShader: causticFragmentShader,
          uniforms: {
            uCausticTex: { value: textures.caustics },
            uColor: { value: new THREE.Color('#00FFFF') },
            uTime: { value: 0 },
            uIntensity: { value: 0.8 } 
          },
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.FrontSide
        })
        mesh.material = shaderMat
        causticMaterials.current.push(shaderMat)
      }
    })
  }, [skinLayer, causticLayer, textures])


  // --- ANIMATION ---
  const groupRef = useRef<THREE.Group>(null)
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    causticMaterials.current.forEach(mat => mat.uniforms.uTime.value = t)

    if (groupRef.current) {
        const floatY = Math.sin(t * 0.5) * 0.5
        const swimRoll = Math.sin(t * 0.3) * 0.05
        
        const targetRotX = -state.pointer.y * 0.3; 
        const targetRotY = state.pointer.x * 0.5;

        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05)
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05)
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, swimRoll, 0.05)
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, floatY, 0.05)
    }
  })

  return (
    <>
      {/* 1. BACKGROUND CATCHER PLANE
          This invisible plane sits behind the whale. If you click it, the menu closes. 
      */}
      {clicked && (
          <mesh position={[0, 0, -5]} onClick={handleBackgroundClick} visible={false}>
             <planeGeometry args={[100, 100]} />
             <meshBasicMaterial />
          </mesh>
      )}

      {/* 2. THE WHALE GROUP */}
      <group 
          ref={groupRef} 
          dispose={null} 
          scale={0.05}
          onClick={handleWhaleClick} // Click logic handles opening + resetting timer
          onPointerOver={() => document.body.style.cursor = 'pointer'} 
          onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <primitive object={skinLayer} />
        <primitive object={causticLayer} scale={1.001} />

        {clicked && (
          <Html
              position={[0, 15, 0]} 
              center 
              distanceFactor={15}
          >
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-cyan-200 text-center animate-fade-in pointer-events-none min-w-[200px] transition-all duration-300">
                  <p className="text-cyan-900 font-medium text-lg font-sans">
                      {messages[messageIndex]}
                  </p>
                  
                  {/* Timer Bar (Optional visual touch) */}
                  <div className="w-full h-1 bg-cyan-100 mt-2 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 w-full animate-[shrink_5s_linear_forwards]" />
                  </div>

                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 
                      border-l-[10px] border-l-transparent
                      border-r-[10px] border-r-transparent
                      border-t-[10px] border-t-white/80">
                  </div>
              </div>
          </Html>
        )}
      </group>
    </>
  )
}