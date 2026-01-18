import { Canvas } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import { Suspense } from 'react'
import { Experience } from './components/Experience'

export default function App() {
    return (
        <Canvas camera={{ position: [0, 50, 0], fov: 45 }}>
            <color attach="background" args={['#000000']} />
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 0, 0]} intensity={1} />

            <Suspense fallback={null}>
                <ScrollControls pages={10} damping={0.2}>
                    <Experience />
                </ScrollControls>
            </Suspense>
        </Canvas>
    )
}
