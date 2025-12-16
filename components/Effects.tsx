'use client'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'

export function Effects() {
  return (
    <EffectComposer disableNormalPass>
      {/* BLOOM: Makes bright things glow.
        - luminanceThreshold: What brightness level triggers the glow? (0-1)
        - luminanceSmoothing: How smooth is the transition?
        - intensity: How strong is the glow?
      */}
      <Bloom 
        luminanceThreshold={0.2} // Glows easily
        luminanceSmoothing={0.9} 
        height={300} 
        intensity={0.5} 
      />

      {/* VIGNETTE: Darkens the corners.
        This is crucial for underwater scenes to make it feel deep and claustrophobic.
      */}
      <Vignette eskil={false} offset={0.1} darkness={1.1} />

      {/* NOISE: Adds subtle film grain.
        This prevents color banding in the dark ocean gradients.
      */}
      <Noise opacity={0.02} />
    </EffectComposer>
  )
}