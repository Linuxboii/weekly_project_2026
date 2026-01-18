import { useMemo, useRef, useState, useEffect } from 'react'
import { Color, Vector3 } from 'three'
import { Line, Sphere, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

// Get portal container once
const getPortalContainer = () => document.getElementById('html-portal')

export function Planet({ def, onClick, planetRef, isSelected, onClose }) {
    const radius = def.orbit
    const portalContainer = useMemo(() => getPortalContainer(), [])

    // PBR Material Props
    const color = useMemo(() => new Color().setHSL(def.hue, def.sat, def.lum), [def])
    const roughness = def.roughness ?? 1
    const metalness = def.metalness ?? 0

    // Orbit Path
    const orbitPoints = useMemo(() => {
        const points = []
        for (let i = 0; i <= 128; i++) {
            const a = (i / 128) * Math.PI * 2
            points.push(new Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
        }
        return points
    }, [radius])

    // Saturn Ring
    const isSaturn = def.name === 'saturn'

    return (
        <group>
            {/* Orbit Ring */}
            <Line points={orbitPoints} color="white" opacity={0.08} transparent lineWidth={1} />

            {/* The Planet Group - Position is controlled by parent via planetRef */}
            <group ref={planetRef} name={`planet-${def.name}`}>
                {/* Main Body */}
                <Sphere args={[def.size, 64, 64]} onClick={(e) => { e.stopPropagation(); onClick(def); }}>
                    <meshPhysicalMaterial
                        color={color}
                        roughness={roughness}
                        metalness={metalness}
                        clearcoat={def.name === 'earth' ? 0.2 : 0}
                        clearcoatRoughness={0.1}
                    />
                </Sphere>

                {/* Simple Atmosphere (Earth/Venus) */}
                {def.atmosphere && (
                    <Sphere args={[def.size * 1.2, 32, 32]}>
                        <meshBasicMaterial
                            color={new Color(0.2, 0.4, 0.8)}
                            transparent
                            opacity={0.1}
                            side={2} // BackSide
                            depthWrite={false}
                        />
                    </Sphere>
                )}

                {isSaturn && (
                    <mesh rotation-x={Math.PI * 0.35}>
                        <ringGeometry args={[def.size * 1.4, def.size * 2.4, 128]} />
                        <meshStandardMaterial
                            color="#cfa"
                            opacity={0.4}
                            transparent
                            side={2}
                            roughness={0.8}
                        />
                    </mesh>
                )}

                {/* Info Card Overlay - Portaled to avoid ScrollControls transform issues */}
                {isSelected && portalContainer && (
                    <Html
                        position={[def.size + 5, 0, 0]}
                        portal={{ current: portalContainer }}
                        zIndexRange={[100, 0]}
                        style={{
                            pointerEvents: 'none',
                        }}
                    >
                        <div className="popup-container" style={{
                            color: 'white',
                            background: 'rgba(5, 5, 10, 0.90)',
                            padding: '24px',
                            borderRadius: '16px',
                            width: '260px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(20px)',
                            fontFamily: 'system-ui, sans-serif',
                            pointerEvents: 'auto',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
                            textAlign: 'left'
                        }}>
                            <h3 className="popup-text-delayed" style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{def.displayName}</h3>
                            <p className="popup-text-delayed" style={{ margin: '0 0 16px 0', fontSize: '0.85rem', opacity: 0.8, lineHeight: '1.5' }}>{def.description}</p>

                            <div className="popup-text-delayed" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.75rem', opacity: 0.6, marginBottom: '20px', fontWeight: 500 }}>
                                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                                    Orbit: {def.orbit.toFixed(1)}
                                </span>
                                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '3px 6px', borderRadius: '4px' }}>
                                    Moons: {def.moons?.length || 0}
                                </span>
                            </div>

                            <button
                                onClick={(e) => { e.stopPropagation(); onClose(); }}
                                style={{
                                    background: 'white',
                                    border: 'none',
                                    color: 'black',
                                    padding: '8px 100%',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.8rem',
                                    transition: 'transform 0.1s'
                                }}
                                onMouseDown={(e) => e.target.style.transform = 'scale(0.96)'}
                                onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                            >
                                Continue Tour
                            </button>
                        </div>
                    </Html>
                )}
            </group>
        </group>
    )
}

function Moon({ def }) {
    const angle = useMemo(() => Math.random() * Math.PI * 2, [])
    const x = Math.cos(angle) * def.orbit
    const z = Math.sin(angle) * def.orbit
    const color = useMemo(() => new Color().setHSL(def.hue, def.sat, def.lum), [def])

    // Moon animation?
    const groupRef = useRef()
    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * def.speed
        }
    })

    return (
        <group position={[x, 0, z]}>
            <Sphere args={[def.size, 32, 32]}>
                <meshStandardMaterial color={color} roughness={0.8} metalness={0} />
            </Sphere>
        </group>
    )
}
