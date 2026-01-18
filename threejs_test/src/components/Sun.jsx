import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'

export function Sun() {
    const sunRef = useRef()

    useFrame((state, delta) => {
        // Subtle pulsation or rotation could go here
        if (sunRef.current) {
            sunRef.current.rotation.y += delta * 0.05
        }
    })

    return (
        <group>
            {/* Core */}
            <Sphere ref={sunRef} args={[1.5, 64, 64]}>
                <meshStandardMaterial
                    color="#ffddaa"
                    emissive="#ffaa00"
                    emissiveIntensity={2}
                    toneMapped={false}
                />
            </Sphere>

            {/* Light */}
            <pointLight intensity={2} distance={100} decay={2} color="#ffaa00" />

            {/* Simple Glow (Billboard or larger sphere with opacity) */}
            <Sphere args={[2.5, 32, 32]}>
                <meshBasicMaterial
                    color="#ffaa00"
                    transparent
                    opacity={0.1}
                    side={2} // BackSide or DoubleSide
                />
            </Sphere>
        </group>
    )
}
