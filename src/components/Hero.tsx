import { useRef, useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";

// ── Color palette (mirrors CSS vars) ───────────────────────────────────────
const TEAL = 0x00d4aa;
const TEAL_HEX = "#00d4aa";
const AMBER = 0xf5a623;
const AMBER_HEX = "#f5a623";
const BLUE = 0x4a9eff;
const BLUE_HEX = "#4a9eff";
const BG = 0x0a0f14;
const SURFACE = 0x111820;
const TEXT = "#e2e8f0";
const TEXT_DIM = "#8899aa";
const TEXT_MUTED = "#4a5568";
const WHITE = 0xffffff;

export default function Hero3D({ onTalkClick }: { onTalkClick: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const el = mountRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  }, []);

  useEffect(() => {
    
    let disposed = false;

    async function init() {
      
      if (disposed) return;

      const container = mountRef.current;
      if (!container) return;
      const W = container.clientWidth;
      const H = container.clientHeight;

      // ── Renderer ──
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      // ── Scene ──
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(BG, 0.012);

      // ── Camera ──
      const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 200);
      camera.position.set(8, 9, 14);
      camera.lookAt(0, 3, 0);

      // ── Lights (subtle — mostly for label sprites) ──
      scene.add(new THREE.AmbientLight(0xffffff, 0.3));
      const tealLight = new THREE.PointLight(TEAL, 0.8, 30);
      tealLight.position.set(-5, 8, 6);
      scene.add(tealLight);
      const amberLight = new THREE.PointLight(AMBER, 0.4, 20);
      amberLight.position.set(6, 4, -3);
      scene.add(amberLight);

      // ════════════════════════════════════════════════════════════════════
      // WIREFRAME BUILDING — white grid-outline only
      // ════════════════════════════════════════════════════════════════════
      const FLOORS = 10;
      const FLOOR_H = 0.65;
      const GAP = 0.06;
      const BW = 3.6;
      const BD = 2.4;
      const buildingGroup = new THREE.Group();

      const whiteLine = new THREE.LineBasicMaterial({
        color: WHITE,
        transparent: true,
        opacity: 0.35,
      });
      const whiteBright = new THREE.LineBasicMaterial({
        color: WHITE,
        transparent: true,
        opacity: 0.6,
      });

      // Thermal color ramp for accent edges
      const thermalColors = [
        new THREE.Color(0x00b4d8),
        new THREE.Color(0x00d4aa),
        new THREE.Color(0x2dd4a0),
        new THREE.Color(0x48d68e),
        new THREE.Color(0x7acc57),
        new THREE.Color(0xa8c430),
        new THREE.Color(0xd4b020),
        new THREE.Color(0xe89820),
        new THREE.Color(0xf57a20),
        new THREE.Color(AMBER),
      ];

      // Helper: create wireframe edges from a BoxGeometry
      function wireBox(
        w: number,
        h: number,
        d: number,
        mat: any
      ): any {
        const geo = new THREE.BoxGeometry(w, h, d);
        const edges = new THREE.EdgesGeometry(geo);
        return new THREE.LineSegments(edges, mat);
      }

      const windows: {
        mesh: any;
        floor: number;
        col: number;
        mat: any;
        baseOpacity: number;
      }[] = [];

      for (let i = 0; i < FLOORS; i++) {
        const y = i * (FLOOR_H + GAP);
        const color = thermalColors[i];

        // ── Floor slab outline ──
        const floorWire = wireBox(BW, FLOOR_H, BD, whiteLine);
        floorWire.position.set(0, y + FLOOR_H / 2, 0);
        buildingGroup.add(floorWire);

        // ── Thermal accent strip (left edge — colored line) ──
        const stripMat = new THREE.LineBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.7,
        });
        const stripGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-BW / 2, y, -BD / 2),
          new THREE.Vector3(-BW / 2, y + FLOOR_H, -BD / 2),
          new THREE.Vector3(-BW / 2, y + FLOOR_H, BD / 2),
          new THREE.Vector3(-BW / 2, y, BD / 2),
        ]);
        const strip = new THREE.Line(stripGeo, stripMat);
        buildingGroup.add(strip);

        // ── Front face windows — wireframe rectangles ──
        for (let w = 0; w < 4; w++) {
          const winMat = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.55,
          });
          const winWire = wireBox(0.5, 0.38, 0.01, winMat);
          const xPos = -BW / 2 + 0.55 + w * 0.75;
          winWire.position.set(xPos, y + FLOOR_H / 2, BD / 2 + 0.02);
          buildingGroup.add(winWire);
          windows.push({
            mesh: winWire,
            floor: i,
            col: w,
            mat: winMat,
            baseOpacity: 0.55,
          });
        }

        // ── Side face windows ──
        for (let w = 0; w < 3; w++) {
          const winMat = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.45,
          });
          const winWire = wireBox(0.01, 0.38, 0.45, winMat);
          const zPos = -BD / 2 + 0.5 + w * 0.7;
          winWire.position.set(BW / 2 + 0.02, y + FLOOR_H / 2, zPos);
          buildingGroup.add(winWire);
          windows.push({
            mesh: winWire,
            floor: i,
            col: w + 4,
            mat: winMat,
            baseOpacity: 0.45,
          });
        }
      }

      // ── Base outline ──
      const baseWire = wireBox(BW + 0.4, 0.12, BD + 0.4, whiteBright);
      baseWire.position.set(0, -0.06, 0);
      buildingGroup.add(baseWire);

      // ── Roof outline ──
      const roofWire = wireBox(BW + 0.1, 0.08, BD + 0.1, whiteBright);
      roofWire.position.set(0, FLOORS * (FLOOR_H + GAP) + 0.04, 0);
      buildingGroup.add(roofWire);

      // ── Roof antennas (thin white lines) ──
      const antennaLineMat = new THREE.LineBasicMaterial({
        color: WHITE,
        transparent: true,
        opacity: 0.5,
      });
      function makeAntenna(x: number, z: number) {
        const topY = FLOORS * (FLOOR_H + GAP);
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, topY + 0.08, z),
          new THREE.Vector3(x, topY + 0.84, z),
        ]);
        return new THREE.Line(geo, antennaLineMat);
      }
      buildingGroup.add(makeAntenna(BW / 2 - 0.3, BD / 2 - 0.3));
      buildingGroup.add(makeAntenna(-BW / 2 + 0.5, -BD / 2 + 0.3));

      // Antenna tip glow spheres (tiny, still colored)
      const tipGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const tip1Mat = new THREE.MeshBasicMaterial({
        color: TEAL,
        transparent: true,
        opacity: 0.9,
      });
      const tip1 = new THREE.Mesh(tipGeo, tip1Mat);
      tip1.position.set(
        BW / 2 - 0.3,
        FLOORS * (FLOOR_H + GAP) + 0.84,
        BD / 2 - 0.3
      );
      buildingGroup.add(tip1);

      const tip2Mat = new THREE.MeshBasicMaterial({
        color: AMBER,
        transparent: true,
        opacity: 0.9,
      });
      const tip2 = new THREE.Mesh(tipGeo, tip2Mat);
      tip2.position.set(
        -BW / 2 + 0.5,
        FLOORS * (FLOOR_H + GAP) + 0.84,
        -BD / 2 + 0.3
      );
      buildingGroup.add(tip2);

      buildingGroup.position.set(0, 0.1, 0);
      scene.add(buildingGroup);

      // ════════════════════════════════════════════════════════════════════
      // SCAN LINE — wireframe ring that sweeps up
      // ════════════════════════════════════════════════════════════════════
      const scanRingGeo = new THREE.RingGeometry(
        Math.max(BW, BD) * 0.68,
        Math.max(BW, BD) * 0.72,
        64
      );
      const scanRingMat = new THREE.MeshBasicMaterial({
        color: TEAL,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
      scanRing.rotation.x = -Math.PI / 2;
      buildingGroup.add(scanRing);

      // Thin horizontal scan line
      const scanLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-BW / 2 - 0.5, 0, 0),
        new THREE.Vector3(BW / 2 + 0.5, 0, 0),
      ]);
      const scanLineMat = new THREE.LineBasicMaterial({
        color: TEAL,
        transparent: true,
        opacity: 0.5,
      });
      const scanLine = new THREE.Line(scanLineGeo, scanLineMat);
      buildingGroup.add(scanLine);

      // ════════════════════════════════════════════════════════════════════
      // DATA PARTICLES
      // ════════════════════════════════════════════════════════════════════
      const particleCount = 100;
      const particlePositions = new Float32Array(particleCount * 3);
      const particleColors = new Float32Array(particleCount * 3);
      const particleMeta: {
        angle: number;
        radius: number;
        height: number;
        speed: number;
        ySpeed: number;
        yAmp: number;
      }[] = [];

      const tealC = new THREE.Color(TEAL);
      const amberC = new THREE.Color(AMBER);
      const blueC = new THREE.Color(BLUE);
      const palette = [tealC, amberC, blueC];

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 3 + Math.random() * 7;
        const height = Math.random() * 9;
        particlePositions[i * 3] = Math.cos(angle) * radius;
        particlePositions[i * 3 + 1] = height;
        particlePositions[i * 3 + 2] = Math.sin(angle) * radius;

        const c = palette[Math.floor(Math.random() * palette.length)];
        particleColors[i * 3] = c.r;
        particleColors[i * 3 + 1] = c.g;
        particleColors[i * 3 + 2] = c.b;

        particleMeta.push({
          angle,
          radius,
          height,
          speed: 0.08 + Math.random() * 0.15,
          ySpeed: 0.2 + Math.random() * 0.4,
          yAmp: 0.3 + Math.random() * 0.8,
        });
      }

      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(particlePositions, 3)
      );
      particleGeo.setAttribute(
        "color",
        new THREE.BufferAttribute(particleColors, 3)
      );

      const particleMat = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
        depthWrite: false,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // ════════════════════════════════════════════════════════════════════
      // CONNECTION LINES
      // ════════════════════════════════════════════════════════════════════
      const lineCount = 6;
      const lines: {
        geo: any;
        angle: number;
        floorY: number;
        speed: number;
        radius: number;
        segs: number;
      }[] = [];

      for (let i = 0; i < lineCount; i++) {
        const pts: any[] = [];
        const segs = 20;
        for (let s = 0; s <= segs; s++) pts.push(new THREE.Vector3(0, 0, 0));
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const lineMat = new THREE.LineBasicMaterial({
          color: i < 3 ? TEAL : i < 5 ? AMBER : BLUE,
          transparent: true,
          opacity: 0.15,
          depthWrite: false,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        scene.add(line);
        lines.push({
          geo: lineGeo,
          angle: (i / lineCount) * Math.PI * 2,
          floorY: (i / lineCount) * FLOORS * (FLOOR_H + GAP),
          speed: 0.3 + Math.random() * 0.3,
          radius: 4 + Math.random() * 3,
          segs,
        });
      }

      // ════════════════════════════════════════════════════════════════════
      // LABELS — floating 3D sprites
      // ════════════════════════════════════════════════════════════════════
      function makeTextSprite(text: string, color: string) {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "rgba(10,15,20,0.8)";
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(4, 4, 248, 56, 4);
        ctx.fill();
        ctx.stroke();
        ctx.font = "bold 22px monospace";
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 128, 32);

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        const spriteMat = new THREE.SpriteMaterial({
          map: tex,
          transparent: true,
          opacity: 0.9,
          depthWrite: false,
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(2.2, 0.55, 1);
        return sprite;
      }

      const eQuestLabel = makeTextSprite("eQuest", TEAL_HEX);
      eQuestLabel.position.set(
        -BW / 2 - 0.6,
        FLOORS * (FLOOR_H + GAP) - 0.5,
        BD / 2 + 1.2
      );
      buildingGroup.add(eQuestLabel);

      const iesLabel = makeTextSprite("IES VE", AMBER_HEX);
      iesLabel.position.set(BW / 2 + 0.8, 1.5, -BD / 2 - 1.0);
      buildingGroup.add(iesLabel);

      const liveLabel = makeTextSprite("● LIVE", TEAL_HEX);
      liveLabel.position.set(0, FLOORS * (FLOOR_H + GAP) + 1.0, 0);
      liveLabel.scale.set(1.6, 0.4, 1);
      buildingGroup.add(liveLabel);

      setLoaded(true);

      // ── Resize ──
      const onResize = () => {
        if (!container || disposed) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      // ── Animation loop ──
      const clock = new THREE.Clock();

      function animate() {
        if (disposed) return;
        frameRef.current = requestAnimationFrame(animate);

        const t = clock.getElapsedTime();
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;

        // Camera follow
        camera.position.x += (8 + mx * 2 - camera.position.x) * 0.03;
        camera.position.y += (9 + my * 1.5 - camera.position.y) * 0.03;
        camera.lookAt(0, 3.2, 0);

        // Building rotation
        buildingGroup.rotation.y =
          Math.sin(t * 0.15) * 0.06 + mx * 0.12;
        buildingGroup.rotation.x = my * 0.04;

        // Scan sweep
        const scanCycle = (t * 0.2) % 1;
        const scanY =
          scanCycle * (FLOORS * (FLOOR_H + GAP) + 1);
        scanRing.position.y = scanY;
        scanLine.position.y = scanY;
        scanRingMat.opacity = 0.15 + Math.sin(t * 2) * 0.1;
        scanLineMat.opacity = 0.3 + Math.sin(t * 2) * 0.2;

        // Window flicker
        windows.forEach((w) => {
          const flicker =
            Math.sin(t * 1.2 + w.floor * 0.7 + w.col * 1.1) * 0.5 + 0.5;
          w.mat.opacity = w.baseOpacity * 0.4 + flicker * w.baseOpacity * 0.6;
        });

        // Particles orbit
        const positions = particles.geometry.attributes.position
          .array as Float32Array;
        for (let i = 0; i < particleMeta.length; i++) {
          const p = particleMeta[i];
          p.angle += p.speed * 0.008;
          positions[i * 3] = Math.cos(p.angle) * p.radius;
          positions[i * 3 + 1] =
            p.height + Math.sin(t * p.ySpeed + p.angle) * p.yAmp;
          positions[i * 3 + 2] = Math.sin(p.angle) * p.radius;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        particles.rotation.y = t * 0.02;

        // Data flow lines
        lines.forEach((l) => {
          const posArr = l.geo.attributes.position.array as Float32Array;
          for (let s = 0; s <= l.segs; s++) {
            const frac = s / l.segs;
            const a = l.angle + t * l.speed + frac * 1.5;
            const r = frac * l.radius;
            posArr[s * 3] = Math.cos(a) * r;
            posArr[s * 3 + 1] =
              l.floorY + frac * 2 * Math.sin(t + frac * 3);
            posArr[s * 3 + 2] = Math.sin(a) * r;
          }
          l.geo.attributes.position.needsUpdate = true;
        });

        // Light pulse
        tealLight.intensity = 0.6 + Math.sin(t * 0.8) * 0.3;
        amberLight.intensity = 0.3 + Math.sin(t * 0.6 + 1) * 0.15;

        // Antenna tip blink
        tip1Mat.opacity = 0.5 + Math.sin(t * 2) * 0.4;
        tip2Mat.opacity = 0.5 + Math.sin(t * 2 + Math.PI) * 0.4;

        renderer.render(scene, camera);
      }

      animate();

      return () => {
        disposed = true;
        cancelAnimationFrame(frameRef.current);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    }

    const cleanup = init();
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      cleanup.then?.((fn: any) => fn?.());
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [onMouseMove]);

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════
  return (
    <section style={sx.hero} className="hero3d-section">
      <div style={sx.bgGlow} />

      <div style={sx.container} className="hero3d-container">
        {/* ── LEFT ── */}
        <div>
          <motion.div
            style={sx.greeting}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <span style={sx.greetLine} />
            <span style={sx.greetText}>Hello, I'm</span>
          </motion.div>

          <motion.h1
            style={sx.name}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            Khelan
            <br />
            <span style={sx.nameOutline}>Mehta</span>
          </motion.h1>

          <motion.div
            style={sx.roles}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {["Energy Modeler", "Full-Stack Dev", "LEED AP BD+C"].map((r) => (
              <span key={r} style={sx.roleChip}>
                {r}
              </span>
            ))}
          </motion.div>

          <motion.p
            style={sx.bio}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            Third-year B.Tech ECE student specializing in building energy
            modeling, simulation, and green building certification. Combining
            strong programming skills with sustainability knowledge to support
            energy workflows and building performance analysis.
          </motion.p>

          <motion.div
            style={sx.actions}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="hero3d-actions"
          >
            <button style={sx.talkBtn} onClick={onTalkClick} className="hero3d-talkBtn">
              <span style={sx.talkPulse} />
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              Talk with Me
            </button>
            <a href="#projects" style={sx.secondaryBtn} className="hero3d-secondaryBtn">
              View Projects <span style={sx.arrow}>↓</span>
            </a>
          </motion.div>
        </div>

        {/* ── RIGHT: Three.js ── */}
        <motion.div
          style={sx.vizWrapper}
          className="hero3d-vizWrapper"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div ref={mountRef} style={sx.canvasMount} />

          <motion.div
            style={{ ...sx.metricCard, top: "5%", right: "0%" } as any}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span style={{ ...sx.metricDot, background: TEAL_HEX }} />
            <div>
              <span style={sx.metricValue}>
                23.5 <small style={sx.metricSmall}>kWh/m²</small>
              </span>
              <span style={sx.metricLabel}>EUI Baseline</span>
            </div>
          </motion.div>

          <motion.div
            style={{ ...sx.metricCard, top: "44%", right: "-8%" } as any}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          >
            <span style={{ ...sx.metricDot, background: AMBER_HEX }} />
            <div>
              <span style={sx.metricValue}>42%</span>
              <span style={sx.metricLabel}>Energy Savings</span>
            </div>
          </motion.div>

          <motion.div
            style={{ ...sx.metricCard, bottom: "10%", left: "-6%" } as any}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
          >
            <span style={{ ...sx.metricDot, background: BLUE_HEX }} />
            <div>
              <span style={sx.metricValue}>
                LEED <small style={sx.metricSmall}>Gold</small>
              </span>
              <span style={sx.metricLabel}>BD+C Certified</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        style={sx.scrollIndicator}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
      >
        <span style={sx.scrollLine} />
        <span style={sx.scrollText}>Scroll</span>
      </motion.div>

      <style>{`
        @keyframes hero3d-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(1.6); }
        }
        @keyframes hero3d-scrollPulse {
          0%, 100% { transform: scaleY(1); opacity: 1; }
          50%      { transform: scaleY(0.4); opacity: 0.3; }
        }
        .hero3d-talkBtn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 0 30px rgba(0,212,170,0.4), 0 8px 24px rgba(0,0,0,0.4) !important;
        }
        .hero3d-secondaryBtn:hover {
          color: ${TEAL_HEX} !important;
          border-color: ${TEAL_HEX} !important;
          background: rgba(0,212,170,0.06) !important;
        }

        /* ── Mobile ──────────────────────────────────────────────────── */
        @media (max-width: 768px) {
          .hero3d-section {
            align-items: flex-start !important;
          }
          .hero3d-container {
            grid-template-columns: 1fr !important;
            padding: 110px 24px 96px !important;
            gap: 0 !important;
            align-items: start !important;
          }
          .hero3d-vizWrapper { display: none !important; }
          .hero3d-actions {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
            width: 100% !important;
          }
          .hero3d-talkBtn {
            width: 100% !important;
            justify-content: center !important;
            box-sizing: border-box !important;
          }
          .hero3d-secondaryBtn {
            width: 100% !important;
            justify-content: center !important;
            box-sizing: border-box !important;
          }
        }

        /* ── Small phones ────────────────────────────────────────────── */
        @media (max-width: 480px) {
          .hero3d-container {
            padding: 90px 16px 80px !important;
          }
        }
      `}</style>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════════════════════
const sx: Record<string, React.CSSProperties> = {
  hero: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  bgGlow: {
    position: "absolute",
    top: "-30%",
    right: "-10%",
    width: "65%",
    height: "130%",
    background:
      "radial-gradient(ellipse, rgba(0,212,170,0.06) 0%, transparent 65%)",
    pointerEvents: "none",
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 48px",
    width: "100%",
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: 80,
    alignItems: "center",
    position: "relative",
    zIndex: 1,
  },
  greeting: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 22,
  },
  greetLine: { width: 28, height: 1, background: TEAL_HEX },
  greetText: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: "0.7rem",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: TEAL_HEX,
  },
  name: {
    fontFamily: "var(--font-display, 'Inter', sans-serif)",
    fontSize: "clamp(3.8rem, 8.5vw, 7rem)",
    fontWeight: 800,
    lineHeight: 0.95,
    letterSpacing: "-0.03em",
    color: TEXT,
    margin: 0,
    marginBottom: 28,
  },
  nameOutline: {
    fontWeight: 400,
    display: "block",
    color: "transparent",
    WebkitTextStroke: `2px ${TEAL_HEX}`,
    letterSpacing: "-0.02em",
  },
  roles: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 },
  roleChip: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: "0.65rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    padding: "6px 14px",
    border: "1px solid rgba(26,37,48,1)",
    color: TEXT_DIM,
    background: "rgba(0,212,170,0.06)",
    borderRadius: 2,
  },
  bio: {
    fontSize: "0.95rem",
    lineHeight: 1.78,
    color: TEXT_DIM,
    maxWidth: 500,
    marginBottom: 44,
  },
  actions: { display: "flex", alignItems: "center", gap: 20 },
  talkBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "16px 32px",
    background: TEAL_HEX,
    color: "#0a0f14",
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
    borderRadius: 2,
    border: "none",
    cursor: "pointer",
  },
  talkPulse: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    background: AMBER_HEX,
    borderRadius: "50%",
    animation: "hero3d-pulse 2s infinite",
  },
  secondaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "16px 24px",
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: "0.75rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: TEXT_DIM,
    border: "1px solid rgba(26,37,48,1)",
    transition: "all 0.3s ease",
    borderRadius: 2,
    textDecoration: "none",
  },
  arrow: { transition: "transform 0.3s ease" },
  vizWrapper: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 500,
  },
  canvasMount: { width: "100%", height: "100%", borderRadius: 4 },
  metricCard: {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(10,15,20,0.88)",
    border: "1px solid rgba(26,37,48,1)",
    padding: "10px 14px",
    borderRadius: 4,
    minWidth: 128,
    boxShadow: "0 4px 24px rgba(0,0,0,0.45)",
    zIndex: 10,
    backdropFilter: "blur(8px)",
  },
  metricDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
    animation: "hero3d-pulse 2s infinite",
  },
  metricValue: {
    display: "block",
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: "0.9rem",
    fontWeight: 700,
    color: TEXT,
    lineHeight: 1.2,
  },
  metricSmall: { fontSize: "0.6rem", color: TEXT_MUTED, fontWeight: 400 },
  metricLabel: {
    display: "block",
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: "0.57rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: TEXT_MUTED,
    marginTop: 2,
    lineHeight: 1,
  },
  scrollIndicator: {
    position: "absolute",
    bottom: 40,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  scrollLine: {
    width: 1,
    height: 48,
    background: `linear-gradient(to bottom, ${TEAL_HEX}, transparent)`,
    animation: "hero3d-scrollPulse 2s ease-in-out infinite",
  },
  scrollText: {
    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
    fontSize: "0.55rem",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: TEXT_MUTED,
  },
};