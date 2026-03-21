import { useRef, useMemo, useState, useCallback, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Billboard, Text, Stars, Float, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGraphStore } from '../../stores/graphStore';

/* B&W node shades — lighter = more emphasis */
const NODE_COLORS: Record<string, string> = {
  person: '#ffffff',
  skill: '#d4d4d4',
  project: '#e8e8e8',
  language: '#a3a3a3',
  certification: '#c0c0c0',
  company: '#b0b0b0',
  education: '#bfbfbf',
  repo: '#999999',
  domain: '#aaaaaa',
  tool: '#888888',
};

const EDGE_COLORS: Record<string, string> = {
  owns: '#d4d4d4',
  uses: '#a3a3a3',
  domain: '#b0b0b0',
  knows: '#c0c0c0',
  focus: '#e8e8e8',
};

function computeLayout(nodes: any[], edges: any[], focusNodeId?: string | null) {
  const positions = new Map<string, THREE.Vector3>();
  const centerNodeId = focusNodeId || 'person';

  nodes.forEach((node) => {
    if (node.id === centerNodeId) {
      positions.set(node.id, new THREE.Vector3(0, 0, 0));
      return;
    }
    const r = 8 + Math.random() * 10;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    positions.set(node.id, new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    ));
  });

  for (let iter = 0; iter < 50; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const ni = nodes[i];
        const nj = nodes[j];
        if (ni.id === centerNodeId && nj.id === centerNodeId) continue;
        const pi = positions.get(ni.id)!;
        const pj = positions.get(nj.id)!;
        const distSq = pi.distanceToSquared(pj) + 0.1;
        const force = 100 / distSq;
        const dir = new THREE.Vector3().subVectors(pi, pj).normalize().multiplyScalar(force);
        if (ni.id !== centerNodeId) pi.add(dir);
        if (nj.id !== centerNodeId) pj.sub(dir);
      }
    }
    for (const edge of edges) {
      const ps = positions.get(edge.source);
      const pt = positions.get(edge.target);
      if (!ps || !pt) continue;
      const dist = ps.distanceTo(pt) + 0.1;
      const force = (dist - 6) * 0.05;
      const dir = new THREE.Vector3().subVectors(pt, ps).normalize().multiplyScalar(force);
      if (edge.source !== centerNodeId) ps.add(dir);
      if (edge.target !== centerNodeId) pt.sub(dir);
    }
    for (const [id, pos] of positions) {
      if (id !== centerNodeId) pos.multiplyScalar(0.98);
    }
  }
  return positions;
}

function GraphNode({ node, position, onClick, onDoubleClick, isSelected }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { edges } = useGraphStore();

  const isPerson = node.id === 'person';
  const radius = isPerson ? 2 : 0.4 + (node.weight / 10) * 0.6;
  const color = NODE_COLORS[node.type] || '#999999';
  const targetScale = isSelected ? 1.4 : hovered ? 1.2 : 1;

  const connectionCount = useMemo(() => {
    return edges.filter((e: any) => e.source === node.id || e.target === node.id).length;
  }, [edges, node.id]);

  const adminConfig = useGraphStore((s) => s.adminConfig);
  const adminRank = adminConfig.projects[node.id]?.rank;
  const liveUrl = adminConfig.projects[node.id]?.liveUrl;

  useFrame((state) => {
    if (meshRef.current) meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
    if (outerRef.current) {
      outerRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
      outerRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      outerRef.current.rotation.x = state.clock.elapsedTime * 0.3;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(node); };
  const handleDoubleClick = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); if (isPerson && onDoubleClick) onDoubleClick(); };

  return (
    <group position={position}>
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[radius * 1.5, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={hovered || isSelected ? 0.3 : 0.05} />
      </mesh>

      <mesh
        ref={meshRef}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isPerson ? 1.2 : isSelected ? 1.5 : hovered ? 0.8 : 0.2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {adminRank && adminRank <= 10 && (
        <Billboard>
          <Text fontSize={0.28} color="#666666" anchorY="top" anchorX="right"
            position={[radius + 0.3, radius + 0.1, 0]} outlineWidth={0.04} outlineColor="#000000" font={undefined}>
            {`#${adminRank}`}
          </Text>
        </Billboard>
      )}

      {(hovered || isSelected || isPerson || node.weight >= 8 || (adminRank && adminRank <= 5)) && (
        <Billboard>
          <Text fontSize={isPerson ? 0.8 : 0.4} color="#ffffff" anchorY="bottom"
            position={[0, radius + (isPerson ? 1 : 0.4), 0]} outlineWidth={0.03} outlineColor="#000000" letterSpacing={0.05}>
            {node.label}
          </Text>
        </Billboard>
      )}

      {hovered && !isPerson && (
        <Billboard>
          <Text fontSize={0.22} color="#ffffff" fillOpacity={0.53} anchorY="top"
            position={[0, -(radius + 0.3), 0]} outlineWidth={0.02} outlineColor="#000000">
            {`${node.type} · ${connectionCount} links`}
          </Text>
        </Billboard>
      )}

      {hovered && isPerson && (
        <Billboard>
          <Text fontSize={0.25} color="#999999" fillOpacity={0.6} anchorY="top"
            position={[0, -(radius + 0.5), 0]} outlineWidth={0.02} outlineColor="#000000">
            Double-click for admin
          </Text>
        </Billboard>
      )}

      {liveUrl && (
        <>
          <Line points={[[0, radius + 0.6, 0], [0, radius + 3, 0]]} color="#999999" transparent opacity={hovered || isSelected ? 0.5 : 0.15} lineWidth={1} />
          <Html position={[0, radius + 5.5, 0]} transform center distanceFactor={10}>
            <div style={{
              width: 280, height: 180, background: '#111111',
              border: `1px solid ${hovered || isSelected ? 'rgba(160,160,160,0.4)' : 'rgba(160,160,160,0.15)'}`,
              borderRadius: 8, overflow: 'hidden',
              boxShadow: hovered || isSelected ? '0 0 30px rgba(255,255,255,0.08)' : '0 0 20px rgba(255,255,255,0.03)',
              opacity: hovered || isSelected ? 1 : 0.75,
              transition: 'opacity 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
              pointerEvents: hovered || isSelected ? 'auto' as const : 'none' as const,
            }}>
              <div style={{
                height: 22, background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', padding: '0 8px', gap: 5,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#666', boxShadow: '0 0 6px rgba(100,100,100,0.5)', flexShrink: 0 }} />
                <span style={{ fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, flex: 1 }}>
                  {liveUrl.replace(/^https?:\/\//, '')}
                </span>
                <span style={{ fontSize: 7, fontFamily: 'monospace', color: '#888', letterSpacing: 1.5, flexShrink: 0 }}>LIVE</span>
              </div>
              <div style={{ width: '100%', height: 'calc(100% - 22px)', overflow: 'hidden', position: 'relative' as const }}>
                <iframe src={liveUrl} style={{
                  width: 1280, height: 800, border: 'none', background: '#111', display: 'block',
                  transform: 'scale(0.21875)', transformOrigin: 'top left', position: 'absolute' as const, top: 0, left: 0,
                }} title={`${node.label} live preview`} loading="lazy" sandbox="allow-scripts allow-same-origin" />
              </div>
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

function GraphEdges({ edges, positions, selectedNodeId }: any) {
  const lines = useMemo(() => {
    return edges.map((edge: any, index: number) => {
      const ps = positions.get(edge.source);
      const pt = positions.get(edge.target);
      if (!ps || !pt) return null;
      const isHighlighted = selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId);
      const edgeColor = isHighlighted ? (EDGE_COLORS[edge.type] || '#cccccc') : '#333333';
      const opacity = isHighlighted ? 0.6 : 0.1;
      const lineWidth = isHighlighted ? 2 : 1;
      const key = edge.id || `${edge.source}-${edge.target}-${edge.type}-${index}`;
      return (
        <group key={key}>
          <Line points={[ps, pt]} color={edgeColor} transparent opacity={opacity} lineWidth={lineWidth} />
          {isHighlighted && (
            <Billboard position={[(ps.x + pt.x) / 2, (ps.y + pt.y) / 2 + 0.3, (ps.z + pt.z) / 2]}>
              <Text fontSize={0.18} color={edgeColor} outlineWidth={0.02} outlineColor="#000000">{edge.type}</Text>
            </Billboard>
          )}
        </group>
      );
    }).filter(Boolean);
  }, [edges, positions, selectedNodeId]);
  return <>{lines}</>;
}

function CameraController({ positions }: any) {
  const { camera } = useThree();
  const selectedNode = useGraphStore((s) => s.selectedNode);
  const zoomAction = useGraphStore((s) => s._zoomAction);
  const prevTs = useRef(0);

  useFrame(() => {
    if (selectedNode) {
      const targetPos = positions.get(selectedNode.id);
      if (targetPos) {
        const offset = targetPos.clone().normalize().multiplyScalar(15);
        if (offset.lengthSq() < 0.1) offset.set(0, 0, 20);
        camera.position.lerp(targetPos.clone().add(offset), 0.05);
        const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
        currentLookAt.lerp(targetPos, 0.05);
        camera.lookAt(currentLookAt);
      }
    }
  });

  useEffect(() => {
    if (!zoomAction || zoomAction.ts === prevTs.current) return;
    prevTs.current = zoomAction.ts;
    if (zoomAction.type === 'in') camera.position.multiplyScalar(0.7);
    else if (zoomAction.type === 'out') camera.position.multiplyScalar(1.3);
    else { camera.position.set(0, 0, 35); camera.lookAt(0, 0, 0); }
  }, [zoomAction, camera]);

  return null;
}

function Scene() {
  const { nodes, edges, selectedNode, selectNode, filterTypes, setShowAdminModal, searchQuery, isFocusedMode } = useGraphStore();

  const { filteredNodes, filteredEdges } = useMemo(() => {
    let resultNodes = nodes;
    let resultEdges = edges;
    if (filterTypes.length > 0) {
      resultNodes = resultNodes.filter((n: any) => !filterTypes.includes(n.type));
    }
    if (isFocusedMode && selectedNode) {
      const connectedEdges = resultEdges.filter((e: any) => e.source === selectedNode.id || e.target === selectedNode.id);
      const connectedNodeIds = new Set<string>();
      connectedNodeIds.add(selectedNode.id);
      connectedEdges.forEach((e: any) => { connectedNodeIds.add(e.source); connectedNodeIds.add(e.target); });
      resultNodes = resultNodes.filter((n: any) => connectedNodeIds.has(n.id));
      resultEdges = connectedEdges;
    }
    return { filteredNodes: resultNodes, filteredEdges: resultEdges };
  }, [nodes, edges, filterTypes, isFocusedMode, selectedNode]);

  const positions = useMemo(() => computeLayout(filteredNodes, filteredEdges, isFocusedMode ? selectedNode?.id : null), [filteredNodes, filteredEdges, isFocusedMode, selectedNode]);

  const handleClick = useCallback((node: any) => {
    selectNode(selectedNode?.id === node.id ? null : node);
  }, [selectedNode, selectNode]);

  const handlePersonDoubleClick = useCallback(() => { setShowAdminModal(true); }, [setShowAdminModal]);

  return (
    <>
      <color attach="background" args={['#080808']} />
      <ambientLight intensity={0.3} />
      <pointLight position={[20, 20, 20]} intensity={1} color="#ffffff" />
      <pointLight position={[-20, -20, -20]} intensity={0.5} color="#888888" />

      <Stars radius={100} depth={50} count={3000} factor={3} saturation={0} fade speed={1} />

      <CameraController positions={positions} />

      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
        <group>
          {filteredNodes.map((node: any) => {
            const pos = positions.get(node.id);
            if (!pos) return null;
            const isSelected = selectedNode?.id === node.id;
            const isMatch = searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());
            const shouldDim = searchQuery ? !isMatch : false;
            return (
              <group key={node.id} scale={shouldDim ? 0.5 : 1}>
                <GraphNode
                  node={node} position={pos} onClick={handleClick}
                  onDoubleClick={node.id === 'person' ? handlePersonDoubleClick : undefined}
                  isSelected={isSelected || !!isMatch}
                />
              </group>
            );
          })}
          <GraphEdges edges={filteredEdges} positions={positions} selectedNodeId={selectedNode?.id} />
        </group>
      </Float>

      <OrbitControls enableDamping dampingFactor={0.05} minDistance={5} maxDistance={80}
        autoRotate={!selectedNode && !searchQuery && !isFocusedMode} autoRotateSpeed={0.5} />
    </>
  );
}

export default function GraphCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 35], fov: 50 }} gl={{ antialias: false, powerPreference: 'high-performance' }}>
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
