import { useScroll } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useState, useRef, useEffect } from 'react'
import { PLANET_DEFS } from '../data'
import { Sun } from './Sun'
import { Planet } from './Planet'
import { easing } from 'maath'

export function Experience() {
    // Manual selection state (overrides auto)
    const [selectedPlanetName, setSelectedPlanetName] = useState(null)
    const [activePlanetName, setActivePlanetName] = useState(null)

    const planetRefs = useRef([])

    const planetStates = useMemo(() => {
        return PLANET_DEFS.map((def, i) => ({
            angle: i * 0.8,
            speed: def.speed * 0.2,
            orbit: def.orbit,
            def
        }))
    }, [])

    return (
        <group>
            {/* Stars background */}
            <mesh scale={[100, 100, 100]}>
                <sphereGeometry />
                <meshBasicMaterial color="#000" side={THREE.BackSide} />
            </mesh>
            <Stars />

            <Sun />

            {planetStates.map((p, i) => (
                <Planet
                    key={p.def.name}
                    def={p.def}
                    planetRef={(el) => (planetRefs.current[i] = el)}
                    // Logic: Only show when actually close to the planet (proximity)
                    isSelected={activePlanetName === p.def.name}
                    onClick={(def) => {
                        console.log('Clicked', def.name)
                        setSelectedPlanetName(def.name)
                    }}
                    onClose={() => setSelectedPlanetName(null)}
                />
            ))}

            <SystemController
                planetStates={planetStates}
                planetRefs={planetRefs}
                onActivePlanetChange={setActivePlanetName}
                selectedPlanetName={selectedPlanetName}
                setSelectedPlanetName={setSelectedPlanetName}
            />
        </group>
    )
}

function Stars() {
    const points = useMemo(() => {
        const p = []
        for (let i = 0; i < 3000; i++) {
            const x = (Math.random() - 0.5) * 200
            const y = (Math.random() - 0.5) * 200
            const z = (Math.random() - 0.5) * 200
            p.push(x, y, z)
        }
        return new Float32Array(p)
    }, [])

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={points.length / 3} array={points} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.3} color="white" transparent opacity={0.8} sizeAttenuation={true} />
        </points>
    )
}

function SystemController({ planetStates, planetRefs, onActivePlanetChange, selectedPlanetName, setSelectedPlanetName }) {
    const scroll = useScroll()
    const { camera } = useThree()
    const lookAtTarget = useMemo(() => new THREE.Vector3(0, 0, 0), [])
    const speedMultiplier = useRef(1)

    // Scroll to planet logic
    useEffect(() => {
        if (selectedPlanetName) {
            const index = planetStates.findIndex(p => p.def.name === selectedPlanetName)
            if (index !== -1) {
                // Calculate target normalized offset (0 to 1)
                // Formula corresponds to the camera tour path mapping: offset = 0.1 + (index / (total - 1)) * 0.9
                const total = planetStates.length
                const targetOffset = 0.1 + (index / (total - 1)) * 0.9

                // Convert to pixel scroll position
                const el = scroll.el
                // scrollHeight - clientHeight is the total scrollable distance
                const targetTop = targetOffset * (el.scrollHeight - el.clientHeight)

                el.scrollTo({ top: targetTop, behavior: 'smooth' })
            }
        }
    }, [selectedPlanetName, planetStates, scroll])

    // Esc to top logic
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setSelectedPlanetName(null)
                scroll.el.scrollTo({ top: 0, behavior: 'smooth' })
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [setSelectedPlanetName, scroll])

    useFrame((state, delta) => {
        // 1. Orbit Physics
        const isScrolling = Math.abs(scroll.delta) > 0.0001
        easing.damp(speedMultiplier, 'current', isScrolling ? 0 : 1, 0.1, delta)

        const currentPositions = []
        planetStates.forEach((p, i) => {
            p.angle += p.speed * delta * speedMultiplier.current * 0.5
            const x = Math.cos(p.angle) * p.orbit
            const z = Math.sin(p.angle) * p.orbit
            if (planetRefs.current[i]) planetRefs.current[i].position.set(x, 0, z)
            currentPositions.push({ x, z, angle: p.angle, def: p.def })
        })

        // 2. Camera Path
        const curvePoints = []
        currentPositions.forEach((p) => {
            const dist = 8 + p.def.size * 4
            const cx = Math.cos(p.angle) * (p.def.orbit + dist)
            const cy = 3
            const cz = Math.sin(p.angle) * (p.def.orbit + dist)
            curvePoints.push(new THREE.Vector3(cx, cy, cz))
        })

        const last = currentPositions[currentPositions.length - 1]
        curvePoints.push(new THREE.Vector3(
            Math.cos(last.angle) * (last.def.orbit + 15),
            10,
            Math.sin(last.angle) * (last.def.orbit + 15)
        ))

        const curve = new THREE.CatmullRomCurve3(curvePoints)

        // 3. Camera Movement
        const offset = scroll.offset
        let newActivePlanet = null;

        if (offset < 0.1) {
            // Descent
            const t = offset / 0.1
            const startPos = new THREE.Vector3(0, 60, 40)
            const endPos = curve.getPoint(0)
            easing.damp3(camera.position, startPos.clone().lerp(endPos, t), 0.2, delta)

            const sunPos = new THREE.Vector3(0, 0, 0)
            const p1 = currentPositions[0]
            const p1Pos = new THREE.Vector3(Math.cos(p1.angle) * p1.def.orbit, 0, Math.sin(p1.angle) * p1.def.orbit)
            easing.damp3(lookAtTarget, sunPos.clone().lerp(p1Pos, t), 0.2, delta)
        } else {
            // Tour
            const tourProgress = Math.min(1, Math.max(0, (offset - 0.1) / 0.9))
            const point = curve.getPoint(tourProgress)
            easing.damp3(camera.position, point, 0.2, delta)

            // LookAt Interpolation
            const total = currentPositions.length
            const progress = tourProgress * (total - 1)
            let index = Math.floor(progress)
            const nextIndex = Math.min(index + 1, total - 1)
            const mix = progress - index

            const p1 = currentPositions[index]
            const p1Pos = new THREE.Vector3(Math.cos(p1.angle) * p1.def.orbit, 0, Math.sin(p1.angle) * p1.def.orbit)
            const p2 = currentPositions[nextIndex]
            const p2Pos = new THREE.Vector3(Math.cos(p2.angle) * p2.def.orbit, 0, Math.sin(p2.angle) * p2.def.orbit)

            easing.damp3(lookAtTarget, p1Pos.clone().lerp(p2Pos, mix), 0.2, delta)

            // DISTANCE-BASED POPUP TRIGGER (Much more reliable)
            // Check distance to all planets
            let minDistance = 999
            let closestPlanetName = null

            currentPositions.forEach(p => {
                const pPos = new THREE.Vector3(p.x, 0, p.z)
                const dist = camera.position.distanceTo(pPos)
                if (dist < minDistance) {
                    minDistance = dist
                    closestPlanetName = p.def.name
                }
            })

            // If we are comfortably close. Note: Camera orbit dist is up to ~20 units for large planets.
            if (minDistance < 25) {
                newActivePlanet = closestPlanetName
            }
        }

        camera.lookAt(lookAtTarget)

        // Dedup state updates
        if (state.activePlanet !== newActivePlanet) {
            state.activePlanet = newActivePlanet
            onActivePlanetChange(newActivePlanet)
        }
    })

    return null
}
