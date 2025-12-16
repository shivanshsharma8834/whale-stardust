import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

// 1. Define the Shader Code
const CausticShaderMaterial = shaderMaterial(
  // UNIFORMS (Variables we pass from React)
  {
    uTime: 0,
    uColor: new THREE.Color('#00FFFF'), // Cyan glow
    uTexture: new THREE.Texture(),      // The original whale skin
  },
  // VERTEX SHADER (Shape & Position)
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // FRAGMENT SHADER (Color & Light)
  `
    uniform float uTime;
    uniform vec3 uColor;
    uniform sampler2D uTexture;
    varying vec2 vUv;

    // A simple function to create wavy caustic lines
    float caustics(vec2 uv) {
      // Create two interfering sine waves
      float v1 = sin(uv.x * 50.0 + uTime);
      float v2 = sin(uv.y * 50.0 + uTime * 0.5);
      float v3 = sin((uv.x + uv.y) * 40.0 - uTime);
      
      // Combine them
      float value = v1 + v2 + v3;
      
      // Sharpen the result to make it look like light rays ("crispy")
      // The high power (4.0) makes the lines thin and bright
      return pow(0.5 + 0.5 * value, 4.0);
    }

    void main() {
      // 1. Get the original whale color (Dots/Skin)
      vec4 baseColor = texture2D(uTexture, vUv);

      // 2. Calculate the caustic pattern
      // We scale vUv * 2.0 to make the pattern denser
      float lightIntensity = caustics(vUv * 3.0);

      // 3. Mix them!
      // Add the caustic light on top of the base color
      vec3 finalColor = baseColor.rgb + (uColor * lightIntensity * 0.8); // 0.8 = Intensity

      gl_FragColor = vec4(finalColor, baseColor.a);
    }
  `
)

// 2. Register it with React Three Fiber
extend({ CausticShaderMaterial })

// TypeScript support (optional but recommended)
declare global {
  namespace JSX {
    interface IntrinsicElements {
      causticShaderMaterial: any
    }
  }
}

export { CausticShaderMaterial }