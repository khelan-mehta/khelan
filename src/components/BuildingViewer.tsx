/* ============================================================
 *  BuildingViewer — three.js canvas for a reconstructed eQUEST model.
 *
 *  Renders each parsed zone as an opaque extruded prism (footprint × height),
 *  stacked by floor, with glass window panes on the facades, coloured in the
 *  eQUEST massing palette. Auto-rotates like a turntable; drag to orbit, scroll
 *  to zoom. Coordinates: model is (X east, Y north, Z up); three.js is Y-up,
 *  so every point maps (X, Y, Z) → (X, Z, −Y).
 * ============================================================ */
import { useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Edges } from '@react-three/drei'
import * as THREE from 'three'

// model (X,Y,Z-up) → three (Y-up)
const tp = (X: number, Y: number, Z: number): [number, number, number] => [X, Z, -Y]

interface Win { p1: [number, number]; p2: [number, number]; z0: number; z1: number }
interface ZoneT { id: string; footprint: [number, number][]; z0: number; z1: number; windows: Win[] }
interface BBox { cx: number; cy: number; cz: number; size: number; minZ: number; maxZ: number }
interface Model { zones: ZoneT[]; bbox: BBox }

function prismGeometry(footprint: [number, number][], z0: number, z1: number) {
  const n = footprint.length
  const contour = footprint.map((p) => new THREE.Vector2(p[0], p[1]))
  let faces: number[][] = []
  try { faces = THREE.ShapeUtils.triangulateShape(contour, []) } catch { faces = [] }
  const pos: number[] = []
  const push = (X: number, Y: number, Z: number) => pos.push(...tp(X, Y, Z))
  for (const [a, b, c] of faces) {
    const A = footprint[a], B = footprint[b], C = footprint[c]
    push(A[0], A[1], z0); push(C[0], C[1], z0); push(B[0], B[1], z0) // bottom
    push(A[0], A[1], z1); push(B[0], B[1], z1); push(C[0], C[1], z1) // top
  }
  for (let i = 0; i < n; i++) {
    const A = footprint[i], B = footprint[(i + 1) % n]
    push(A[0], A[1], z0); push(B[0], B[1], z0); push(B[0], B[1], z1)
    push(A[0], A[1], z0); push(B[0], B[1], z1); push(A[0], A[1], z1)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.computeVertexNormals()
  return g
}

function windowsGeometry(windows: Win[]) {
  const pos: number[] = []
  const push = (X: number, Y: number, Z: number) => pos.push(...tp(X, Y, Z))
  for (const w of windows) {
    const [x1, y1] = w.p1, [x2, y2] = w.p2
    push(x1, y1, w.z0); push(x2, y2, w.z0); push(x2, y2, w.z1)
    push(x1, y1, w.z0); push(x2, y2, w.z1); push(x1, y1, w.z1)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.computeVertexNormals()
  return g
}

// eQUEST-ish warm massing: tan that lightens up the tower.
function zoneColor(z0: number, minZ: number, maxZ: number) {
  const t = maxZ > minZ ? (z0 - minZ) / (maxZ - minZ) : 0.5
  return new THREE.Color().setHSL(0.09, 0.34, 0.55 + t * 0.16)
}

function Zone({ zone, color }: { zone: ZoneT; color: THREE.Color }) {
  const geom = useMemo(() => prismGeometry(zone.footprint, zone.z0, zone.z1), [zone])
  const wins = useMemo(() => (zone.windows.length ? windowsGeometry(zone.windows) : null), [zone])
  return (
    <group>
      <mesh geometry={geom}>
        <meshStandardMaterial color={color} roughness={0.82} metalness={0.03} side={THREE.DoubleSide} flatShading />
        <Edges threshold={22} color="#5b5347" />
      </mesh>
      {wins && (
        <mesh geometry={wins}>
          <meshStandardMaterial
            color="#3aa6d8"
            emissive="#1a6f9e"
            emissiveIntensity={0.35}
            roughness={0.18}
            metalness={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}

function Ground({ bbox }: { bbox: BBox }) {
  const s = bbox.size * 2.2
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[bbox.cx, bbox.minZ - 0.1, -bbox.cy]}>
      <planeGeometry args={[s, s]} />
      <meshStandardMaterial color="#e9e7df" roughness={1} />
    </mesh>
  )
}

export default function BuildingViewer({ model }: { model: Model }) {
  const bbox = model.bbox
  const target = tp(bbox.cx, bbox.cy, bbox.cz)
  const dist = bbox.size * 1.75
  const camPos: [number, number, number] = [target[0] + dist * 0.75, target[1] + dist * 0.55, target[2] + dist * 0.75]

  const colors = useMemo(
    () => model.zones.map((z) => zoneColor(z.z0, bbox.minZ, bbox.maxZ)),
    [model, bbox],
  )

  return (
    <Canvas
      camera={{ position: camPos, near: 0.5, far: dist * 12, fov: 40 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <hemisphereLight intensity={0.9} groundColor="#d3cfc2" color="#ffffff" />
        <directionalLight position={[dist, dist * 1.4, dist * 0.5]} intensity={1.15} />
        <directionalLight position={[-dist, dist, -dist * 0.6]} intensity={0.45} color="#e7ecff" />

        <Ground bbox={bbox} />
        {model.zones.map((z, i) => (
          <Zone key={z.id || i} zone={z} color={colors[i]} />
        ))}

        <OrbitControls
          target={target as unknown as THREE.Vector3}
          makeDefault
          autoRotate
          autoRotateSpeed={0.9}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={dist * 0.25}
          maxDistance={dist * 4}
          minPolarAngle={0.15}
          maxPolarAngle={Math.PI / 2 - 0.02}
        />
      </Suspense>
    </Canvas>
  )
}
