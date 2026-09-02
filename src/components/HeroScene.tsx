import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'

/* ── The energy core: a distorted wireframe icosahedron that breathes and
   reacts to the pointer, wrapped in an orbiting particle field. Indigo on
   paper — the "simulation running" motif from the resume's energy work. ── */

function EnergyCore() {
  const group = useRef<THREE.Group>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const geoRef = useRef<THREE.IcosahedronGeometry>(null)
  const basePositions = useRef<Float32Array | null>(null)
  const pointer = useRef(new THREE.Vector2(0, 0))
  const { viewport } = useThree()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    // smooth pointer follow
    pointer.current.x += (state.pointer.x - pointer.current.x) * 0.05
    pointer.current.y += (state.pointer.y - pointer.current.y) * 0.05

    if (group.current) {
      group.current.rotation.y = t * 0.12 + pointer.current.x * 0.5
      group.current.rotation.x = pointer.current.y * 0.35
    }

    // vertex noise displacement — "distort" without extra deps
    const geo = geoRef.current
    if (geo && mesh.current) {
      const pos = geo.attributes.position as THREE.BufferAttribute
      if (!basePositions.current) {
        basePositions.current = pos.array.slice() as Float32Array
      }
      const base = basePositions.current
      const arr = pos.array as Float32Array
      const amp = 0.18 + Math.abs(pointer.current.x) * 0.12
      for (let i = 0; i < arr.length; i += 3) {
        const bx = base[i], by = base[i + 1], bz = base[i + 2]
        const n =
          Math.sin(bx * 2.2 + t * 1.1) *
          Math.cos(by * 2.4 + t * 0.9) *
          Math.sin(bz * 2.0 + t * 1.3)
        const scale = 1 + n * amp
        arr[i] = bx * scale
        arr[i + 1] = by * scale
        arr[i + 2] = bz * scale
      }
      pos.needsUpdate = true
      geo.computeVertexNormals()
    }
  })

  const portrait = viewport.aspect < 1
  const scale = (Math.min(viewport.width, viewport.height) / 5) * (portrait ? 0.72 : 1)

  return (
    <group ref={group} scale={scale}>
      {/* solid inner shell */}
      <mesh ref={mesh}>
        <icosahedronGeometry ref={geoRef} args={[1.35, 12]} />
        <meshStandardMaterial
          color="#4b3bff"
          roughness={0.35}
          metalness={0.1}
          flatShading
          transparent
          opacity={0.94}
        />
      </mesh>
      {/* wireframe cage */}
      <mesh>
        <icosahedronGeometry args={[1.62, 2]} />
        <meshBasicMaterial color="#0b0b0c" wireframe transparent opacity={0.14} />
      </mesh>
    </group>
  )
}

function ParticleField() {
  const points = useRef<THREE.Points>(null)
  const count = 340
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 3.2 + Math.random() * 4.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.04
      points.current.rotation.x = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.045} color="#0b0b0c" transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

/* Pushes the core + ring off-center to the right so the wordmark stays clear.
   Offset scales with viewport so it never flies off a narrow screen. */
function Rig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  const { viewport } = useThree()
  useFrame(() => {
    if (!ref.current) return
    const portrait = viewport.aspect < 1
    const tx = viewport.width * (portrait ? 0.2 : 0.26)
    const ty = portrait ? viewport.height * 0.2 : 0
    ref.current.position.x += (tx - ref.current.position.x) * 0.08
    ref.current.position.y += (ty - ref.current.position.y) * 0.08
  })
  return <group ref={ref}>{children}</group>
}

function OrbitRing() {
  const pts = useMemo(() => {
    const p: [number, number, number][] = []
    const seg = 128
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2
      p.push([Math.cos(a) * 3.1, Math.sin(a) * 0.001, Math.sin(a) * 3.1])
    }
    return p
  }, [])
  const ring = useRef<THREE.Group>(null)
  useFrame((s) => {
    if (ring.current) ring.current.rotation.z = s.clock.elapsedTime * 0.08
  })
  return (
    <group ref={ring} rotation={[Math.PI / 2.6, 0, 0]}>
      <Line points={pts} color="#4b3bff" lineWidth={1} transparent opacity={0.35} />
    </group>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 42 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: 'none' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 6, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-5, -2, -4]} intensity={0.8} color="#6a5cff" />
        <Rig>
          <EnergyCore />
          <OrbitRing />
        </Rig>
        <ParticleField />
      </Suspense>
    </Canvas>
  )
}
