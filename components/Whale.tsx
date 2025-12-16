'use client'
import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'

// ==================== SHADER DEFINITIONS ====================

const causticVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldNormal;

  void main() {
    vUv = uv;
    // Get World Space Normal for the Top-Mask
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const causticFragmentShader = `
  uniform sampler2D uCausticTex;
  uniform vec3 uColor;
  uniform float uTime; // <--- NEW: Time for animation
  uniform float uIntensity;
  
  varying vec2 vUv;
  varying vec3 vWorldNormal;

  void main() {
    // 1. ANIMATION & TILING LOGIC
    // Instead of JS 'repeat.set(4,4)', we multiply vUv by 4.0 here.
    // Instead of JS 'offset.x', we add uTime here.
    vec2 animatedUV = vUv * 4.0 + vec2(uTime * 0.05, uTime * 0.02);

    // Sample the texture using the moving UVs
    vec4 texColor = texture2D(uCausticTex, animatedUV);

    // 2. THE TOP MASK (Only show on back)
    float topMask = max(0.0, vWorldNormal.y);
    topMask = pow(topMask, 3.0); // Sharpen the mask

    // 3. COMBINE
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

  // Clone scenes for layers
  const skinLayer = useMemo(() => scene.clone(), [scene])
  const causticLayer = useMemo(() => scene.clone(), [scene])
  
  // We need a reference to the shader materials to update 'uTime'
  const causticMaterials = useRef<THREE.ShaderMaterial[]>([])

  useMemo(() => {
    // --- A. SKIN LAYER ---
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

    // --- B. CAUSTIC LAYER ---
    // Note: We don't need to set repeat/offset here anymore. 
    // The shader handles it now.
    textures.caustics.wrapS = THREE.RepeatWrapping
    textures.caustics.wrapT = THREE.RepeatWrapping

    // Clear previous refs
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
            uTime: { value: 0 }, // Initialize time
            uIntensity: { value: 1.0 }
          },
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.FrontSide
        })

        mesh.material = shaderMat
        // Save reference so we can animate it later
        causticMaterials.current.push(shaderMat)
      }
    })
  }, [skinLayer, causticLayer, textures])

  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    // 1. Physical Whale Movement
    if (groupRef.current) {
        groupRef.current.position.y = Math.sin(t * 0.5) * 0.5
        groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.05
    }

    // 2. Update Shader Time (This creates the flow)
    causticMaterials.current.forEach(mat => {
        mat.uniforms.uTime.value = t;
    })
  })

  return (
    <group ref={groupRef} dispose={null} scale={0.05}>
      <primitive object={skinLayer} />
      <primitive object={causticLayer} scale={1.02} />
    </group>
  )
}