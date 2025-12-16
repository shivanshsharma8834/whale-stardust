'use client'
import dynamic from 'next/dynamic'

// We must dynamically import the scene with ssr: false 
// because Three.js relies on the 'window' object which doesn't exist on the server.
const UnderwaterScene = dynamic(() => import('@/components/UnderwaterScene'), {
  ssr: false,
  loading: () => <div className="flex h-screen items-center justify-center text-white">Loading Ocean...</div>
})

export default function Home() {
  return (
    <main>
       <UnderwaterScene />
    </main>
  )
}