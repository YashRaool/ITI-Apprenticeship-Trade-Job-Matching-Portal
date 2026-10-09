import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/* ================================================================
   Hero3DBackground — Interactive 3D Modular Cube Formation
   ─────────────────────────────────────────────────────────────────
   Rotating Coordinate Frame Motion Model:
   - Default resting state: A LARGE 3D CUBE made from 64 smaller rounded cubes.
   - Normal animation: The whole large cube rotates slowly with subtle breathing.
   - Individual module dragging: Pulling a specific small cube detaches ONLY that piece.
   - Release: The detached module participates in the MAIN CUBE'S ROTATION FRAME!
     It remains at its relative offset and orbits/rotates with the main cube.
   - Delayed return: After the main cube completes approximately ONE full
     rotation (2π rad) from release, the detached cube smoothly travels back
     inside the rotating frame and docks into its slot.
   - Re-grab: Grabbing a detached piece allows repositioning and resets the timer.
   - Transparent full-viewport interaction layer with click-through UI accessibility.
   - Mobile: completely suppressed, zero WebGL/canvas overhead.
   ================================================================ */

interface ModuleConfig {
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  phase: number;
  distFromCenter: number;
  isSatellite?: boolean;
}

// Deterministic pseudo-random generator
function pseudoHash(a: number, b: number, c: number): number {
  const n = (Math.sin(a * 12.9898 + b * 78.233 + c * 45.164) * 43758.5453123) % 1;
  return Math.abs(n);
}

// ─── Formation & Sizing matching template ───
const BLOCK_SIZE = 0.32; // Micro-scaled ~6.7% for enhanced visual presence
const SPACING = 0.380; // Proportionally scaled; seam gap preserved at exact 0.060
const BEVEL_RADIUS = 0.040; // Clean rounded chamfer edges (proportional to block scale)

const REST_EMISSIVE = 0x1b5fe0;
const REST_EMISSIVE_INTENSITY = 0.18; // Clean subtle glow, no hazy glare

// Helper to draw shared 256x256 frosted glass face texture with diagonal gradient and refined grain
function createFaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // a) Diagonal linear gradient (top-left to bottom-right): 0.0 #0a2fe0, 0.55 #1a8cf5, 1.0 #8ff0ff
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0.0, '#0a2fe0');
    grad.addColorStop(0.55, '#1a8cf5');
    grad.addColorStop(1.0, '#8ff0ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // b) Refined frosted grain: ~700 subtle speckles (alpha 0.03-0.07) for smooth polished glass
    for (let i = 0; i < 700; i++) {
      const rx = pseudoHash(i * 3.71 + 1.2, i * 7.13 + 3.4, i * 11.29 + 5.6) * 256;
      const ry = pseudoHash(i * 5.47 + 2.1, i * 9.83 + 4.3, i * 13.67 + 6.5) * 256;
      const isWhite = pseudoHash(i * 2.19, i * 4.31, i * 8.77) > 0.5;
      const alpha = 0.03 + pseudoHash(i * 6.71, i * 1.83, i * 9.17) * 0.04;
      ctx.fillStyle = isWhite ? `rgba(255, 255, 255, ${alpha.toFixed(3)})` : `rgba(180, 235, 255, ${alpha.toFixed(3)})`;
      ctx.fillRect(rx, ry, 1.5, 1.5);
    }

    // c) Inset lighter border band ~8px wide (white, alpha ~0.30) for glowing edges
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.30)';
    ctx.strokeRect(4, 4, 248, 248);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

// Art-directed 3D modular cluster formation based on DESIGN 1:
// Front/Silhouette blueprint:
//           ■
//       ■ ■ ■ ■
//     ■ ■ ■ ■ ■
//       ■ ■ ■ ■
//           ■ ■

interface BlueprintCell {
  col: number; // 0..4 (col 0 is leftmost protruding wing)
  row: number; // 0..4 (row 4 is top, row 0 is bottom)
  zLayers: number[]; // Discrete depth layers in gz: -1.5, -0.5, 0.5, 1.5
  isAccent?: boolean; // Accent feature (crest, wing, anchors)
}

const DESIGN_1_CELLS: BlueprintCell[] = [
  // Row 4 (top): solitary crest peak [Col 3]
  { col: 3, row: 4, zLayers: [-0.5, 0.5], isAccent: true },

  // Row 3: 4 modules [Cols 1, 2, 3, 4]
  { col: 1, row: 3, zLayers: [-0.5, 0.5, 1.5] },
  { col: 2, row: 3, zLayers: [-1.5, -0.5, 0.5, 1.5] },
  { col: 3, row: 3, zLayers: [-1.5, -0.5, 0.5, 1.5] },
  { col: 4, row: 3, zLayers: [-0.5, 0.5], isAccent: true },

  // Row 2 (middle equator): 5 modules [Cols 0, 1, 2, 3, 4]
  // Col 0 is the protruding left wing reaching towards hero text
  { col: 0, row: 2, zLayers: [-0.5, 0.5], isAccent: true },
  { col: 1, row: 2, zLayers: [-1.5, -0.5, 0.5, 1.5] },
  { col: 2, row: 2, zLayers: [-1.5, -0.5, 0.5, 1.5] },
  { col: 3, row: 2, zLayers: [-1.5, -0.5, 0.5, 1.5] },
  { col: 4, row: 2, zLayers: [-1.5, -0.5, 0.5] },

  // Row 1: 4 modules [Cols 1, 2, 3, 4]
  { col: 1, row: 1, zLayers: [-1.5, -0.5, 0.5] },
  { col: 2, row: 1, zLayers: [-1.5, -0.5, 0.5, 1.5] },
  { col: 3, row: 1, zLayers: [-1.5, -0.5, 0.5, 1.5] },
  { col: 4, row: 1, zLayers: [-0.5, 0.5] },

  // Row 0 (bottom): 2 modules [Cols 3, 4]
  { col: 3, row: 0, zLayers: [-0.5, 0.5, 1.5], isAccent: true },
  { col: 4, row: 0, zLayers: [-0.5, 0.5], isAccent: true },
];

function generateCubeFormation(): ModuleConfig[] {
  interface RawModule {
    x: number;
    y: number;
    z: number;
    rotX: number;
    rotY: number;
    rotZ: number;
    phase: number;
    isAccent: boolean;
  }

  const rawConfigs: RawModule[] = [];

  for (const cell of DESIGN_1_CELLS) {
    for (const gz of cell.zLayers) {
      let posX = cell.col * SPACING;
      let posY = cell.row * SPACING;
      let posZ = gz * SPACING;

      // 1. Harmonic layer staggering (prevents rigid planar flattening across angles)
      const layerStaggerX = Math.sin(cell.row * 1.57 + gz * 1.05) * 0.012;
      const layerStaggerY = Math.cos(cell.col * 1.25 + gz * 1.45) * 0.010;
      const layerStaggerZ = Math.sin(cell.col * 1.45 + cell.row * 1.15) * 0.014;

      posX += layerStaggerX;
      posY += layerStaggerY;
      posZ += layerStaggerZ;

      // 2. Sculpted relief for distinctive features
      if (cell.isAccent) {
        if (cell.row === 4) {
          // Top crest subtle lift and forward step
          posY += 0.018;
          if (gz > 0) posZ += 0.014;
        } else if (cell.col === 0) {
          // Left wing protrusion
          posX -= 0.020;
          if (gz > 0) posZ += 0.012;
        } else if (cell.row === 0) {
          // Bottom anchor grounding
          posY -= 0.014;
        } else if (cell.col === 4 && cell.row === 3) {
          // Right upper shoulder accent
          posX += 0.014;
        }
      }

      // 3. Controlled per-block micro-rotations (improves specular facet separation)
      let rotX = Math.sin(cell.col * 2.3 + cell.row * 1.9 + gz * 0.7) * 0.035;
      let rotY = Math.cos(cell.col * 1.1 + cell.row * 2.7 + gz * 2.1) * 0.038;
      let rotZ = Math.sin(cell.col * 1.7 + cell.row * 0.9 + gz * 3.1) * 0.030;

      if (cell.isAccent) {
        rotX += cell.row === 4 ? 0.02 : -0.015;
        rotY += cell.col === 0 ? 0.02 : -0.015;
      }

      rawConfigs.push({
        x: posX,
        y: posY,
        z: posZ,
        rotX,
        rotY,
        rotZ,
        phase: (cell.col * 1.2 + cell.row * 1.5 + gz * 1.7) * 0.5,
        isAccent: !!cell.isAccent,
      });
    }
  }

  // 4. Exact Center-of-Mass / Centroid Calculation
  // Guarantees zero rotational wobble/eccentricity around the formation pivot (0,0,0)
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  for (const c of rawConfigs) {
    sumX += c.x;
    sumY += c.y;
    sumZ += c.z;
  }
  const comX = sumX / rawConfigs.length;
  const comY = sumY / rawConfigs.length;
  const comZ = sumZ / rawConfigs.length;

  const modules: ModuleConfig[] = [];
  for (const c of rawConfigs) {
    const finalX = c.x - comX;
    const finalY = c.y - comY;
    const finalZ = c.z - comZ;
    const dist = Math.hypot(finalX, finalY, finalZ);

    modules.push({
      x: finalX,
      y: finalY,
      z: finalZ,
      rotX: c.rotX,
      rotY: c.rotY,
      rotZ: c.rotZ,
      phase: c.phase,
      distFromCenter: dist,
      isSatellite: c.isAccent,
    });
  }

  return modules;
}

// ─── Four Dominant Multi-Axis Low-Gravity Tumble Vectors ───
// Phase 1: Horizontal / lateral tumble (predominantly Y axis with subtle forward tilt)
// Phase 2: Diagonal / tilted tumble (canted diagonal axis across XY/YZ)
// Phase 3: Vertical / up-down tumble (predominantly X axis end-over-end pitch)
// Phase 4: Opposite / alternate tilted tumble (counter-diagonal return arc to Phase 1)
const DOMINANT_AXES: THREE.Vector3[] = [
  new THREE.Vector3(0.10, 0.98, 0.16).normalize(),   // Phase 1: Lateral / horizontal
  new THREE.Vector3(0.68, 0.64, 0.35).normalize(),   // Phase 2: Diagonal / tilted
  new THREE.Vector3(0.96, 0.14, -0.22).normalize(),  // Phase 3: Vertical / pitch
  new THREE.Vector3(-0.46, 0.82, -0.34).normalize(), // Phase 4: Opposite counter-tilt
];

// Angular rotation constants
const DWELL_ANGLE = 2.0 * Math.PI; // Full 360-degree rotation completed around dominant axis
const TRANSITION_ANGLE = 0.85 * Math.PI; // Smooth C^2 continuous transition steering window (~153°)
const PHASE_TOTAL_ANGLE = DWELL_ANGLE + TRANSITION_ANGLE; // 2.85π rad per phase
const CYCLE_TOTAL_ANGLE = 4 * PHASE_TOTAL_ANGLE; // 11.4π rad per full 4-phase cycle
const TUMBLE_SPEED = 0.44; // rad/s: steady, calm zero-gravity angular velocity

// Initial iconic 3D presentation orientation (shows front silhouette with readable depth)
const INITIAL_EULER = new THREE.Euler(0.20, 0.45, -0.05, 'YXZ');

// Computes the smoothly evolving unit rotation axis at any accumulated tumble angle
function computeEvolvingAxis(accumulatedAngle: number, outAxis: THREE.Vector3): void {
  const cycleAngle = ((accumulatedAngle % CYCLE_TOTAL_ANGLE) + CYCLE_TOTAL_ANGLE) % CYCLE_TOTAL_ANGLE;
  const phaseIndex = Math.floor(cycleAngle / PHASE_TOTAL_ANGLE);
  const localAngle = cycleAngle - phaseIndex * PHASE_TOTAL_ANGLE;

  if (localAngle <= DWELL_ANGLE) {
    outAxis.copy(DOMINANT_AXES[phaseIndex]);
  } else {
    const u = (localAngle - DWELL_ANGLE) / TRANSITION_ANGLE;
    // C^2 continuous smootherstep: 6u^5 - 15u^4 + 10u^3 (zero velocity & acceleration at boundaries)
    const ease = u * u * u * (u * (u * 6 - 15) + 10);
    const nextPhaseIndex = (phaseIndex + 1) % 4;
    outAxis.lerpVectors(DOMINANT_AXES[phaseIndex], DOMINANT_AXES[nextPhaseIndex], ease).normalize();
  }
}

function checkIsDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  const isLarge = window.innerWidth >= 1024;
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  return isLarge && hasFinePointer;
}

export default function Hero3DBackground() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(checkIsDesktop);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(checkIsDesktop());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const canvasContainer = canvasContainerRef.current;
    if (!canvasContainer) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── Scene & Camera Setup ───
    const scene = new THREE.Scene();

    // Perspective camera framing matching template
    const camera = new THREE.PerspectiveCamera(
      34,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 6.7);
    camera.lookAt(0, 0, 0);

    // ─── WebGL Renderer ───
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    canvasContainer.appendChild(renderer.domElement);

    const canvas = renderer.domElement;
    canvas.style.pointerEvents = 'none';

    // ─── Shared Face Texture ───
    const faceTexture = createFaceTexture();

    // ─── Studio Reflection Environment (PMREM) ───
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envCanvas = document.createElement('canvas');
    envCanvas.width = 512;
    envCanvas.height = 256;
    const envCtx = envCanvas.getContext('2d');
    if (envCtx) {
      const grad = envCtx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0.00, '#ffffff');
      grad.addColorStop(0.06, '#ffffff');
      grad.addColorStop(0.14, '#6fd8ff');
      grad.addColorStop(0.38, '#1488f5');
      grad.addColorStop(0.62, '#0a56d8');
      grad.addColorStop(0.85, '#062a8a');
      grad.addColorStop(1.00, '#031a5c');
      envCtx.fillStyle = grad;
      envCtx.fillRect(0, 0, 512, 256);

      // Softbox rectangles for bright edge glints
      envCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      envCtx.fillRect(60, 20, 70, 46);
      envCtx.fillRect(280, 30, 90, 36);

      // Two thin vertical white strips for sharp reflection lines on sides
      envCtx.fillStyle = 'rgba(255, 255, 255, 0.90)';
      envCtx.fillRect(150, 60, 10, 120);
      envCtx.fillRect(380, 60, 10, 120);
    }
    const envCanvasTexture = new THREE.CanvasTexture(envCanvas);
    envCanvasTexture.mapping = THREE.EquirectangularReflectionMapping;
    const envRenderTarget = pmremGenerator.fromEquirectangular(envCanvasTexture);
    scene.environment = envRenderTarget.texture;

    // ─── High-Fidelity PBR Lighting ───
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Key Light: Overhead key light creating white specular highlights
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.6);
    keyLight.position.set(8, 14, 10);
    scene.add(keyLight);

    // Top Specular Accent Light: Sharp highlight on top faces
    const topSpecularLight = new THREE.DirectionalLight(0xe0f7ff, 3.0);
    topSpecularLight.position.set(0, 15, 5);
    scene.add(topSpecularLight);

    // Rim Light: Vibrant electric cyan backlight
    const rimLight = new THREE.DirectionalLight(0x00f0ff, 3.0);
    rimLight.position.set(-8, 6, -6);
    scene.add(rimLight);

    // Fill Light: Rich azure blue fill
    const fillLight = new THREE.DirectionalLight(0x0044ff, 1.8);
    fillLight.position.set(-4, -4, 6);
    scene.add(fillLight);

    // Internal Core Glow Light
    const coreGlowLight = new THREE.PointLight(0x2fd8ff, 2.5, 5.0);
    coreGlowLight.position.set(0, 0, 0);
    scene.add(coreGlowLight);

    // ─── Sleek Beveled Modular Cube Geometry ───
    const moduleGeometry = new RoundedBoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE, 6, BEVEL_RADIUS);
    moduleGeometry.computeVertexNormals();

    // ─── Shared Single Crisp Edge Outline (No Fuzz/Blur) ───
    const edgeBoxGeometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    const edgeGeometry = new THREE.EdgesGeometry(edgeBoxGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0xd8f8ff,
      transparent: true,
      opacity: 0.75,
      toneMapped: false,
    });

    const hoverColor = new THREE.Color('#00d8ff'); // Glowing cyan highlight
    const dragColor = new THREE.Color('#38bdf8');

    // ─── Formation Group (The Modular Cluster) ───
    const formationDefs = generateCubeFormation();
    const formationGroup = new THREE.Group();

    // Initialize orientation to iconic 3D presentation stance
    formationGroup.quaternion.setFromEuler(INITIAL_EULER);
    scene.add(formationGroup);

    interface ModuleItem {
      mesh: THREE.Mesh;
      material: THREE.MeshPhysicalMaterial;
      homePos: THREE.Vector3;
      homeRot: THREE.Euler;
      radialDir: THREE.Vector3;
      phase: number;
      distFromCenter: number;
      isSatellite: boolean;
      state: 'docked' | 'dragging' | 'detached' | 'returning';
      detachedLocalPos: THREE.Vector3;
      detachedLocalRot: THREE.Euler;
      startReturnLocalPos: THREE.Vector3;
      rotationTravelSinceRelease: number;
      returnProgress: number;
    }

    const modules: ModuleItem[] = [];

    formationDefs.forEach((def) => {
      // Frosted glass with diagonal gradient face texture and single crisp edge outline
      const material = new THREE.MeshPhysicalMaterial({
        map: faceTexture,
        color: 0xffffff,
        emissiveMap: faceTexture,
        emissive: new THREE.Color(REST_EMISSIVE),
        emissiveIntensity: REST_EMISSIVE_INTENSITY,
        roughness: 0.05,
        metalness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.00,
        transmission: 0.0,
        ior: 1.50,
        reflectivity: 0.98,
        sheen: 0.4,
        sheenColor: new THREE.Color('#5fd6ff'),
        specularColor: new THREE.Color('#ffffff'),
        specularIntensity: 1.0,
      });

      const mesh = new THREE.Mesh(moduleGeometry, material);
      mesh.position.set(def.x, def.y, def.z);
      mesh.rotation.set(def.rotX, def.rotY, def.rotZ);

      // Add single crisp edge outline to mesh (non-raycastable)
      const edgeLine = new THREE.LineSegments(edgeGeometry, edgeMaterial);
      edgeLine.raycast = () => {};
      mesh.add(edgeLine);

      formationGroup.add(mesh);

      const homePos = new THREE.Vector3(def.x, def.y, def.z);
      const radialDir = homePos.clone().normalize();
      if (radialDir.lengthSq() < 0.001) radialDir.set(0, 1, 0);

      modules.push({
        mesh,
        material,
        homePos,
        homeRot: new THREE.Euler(def.rotX, def.rotY, def.rotZ),
        radialDir,
        phase: def.phase,
        distFromCenter: def.distFromCenter,
        isSatellite: !!def.isSatellite,
        state: 'docked',
        detachedLocalPos: new THREE.Vector3(),
        detachedLocalRot: new THREE.Euler(),
        startReturnLocalPos: new THREE.Vector3(),
        rotationTravelSinceRelease: 0,
        returnProgress: 0,
      });
    });

    // ─── Stage Placement ───
    const targetGroupPos = new THREE.Vector3(0, 0, 0);
    let visibleWidth = 8.0;

    const computeTargetGroupPos = () => {
      if (!canvasContainerRef.current) return;
      const w = canvasContainerRef.current.clientWidth;
      const h = canvasContainerRef.current.clientHeight;
      if (w === 0 || h === 0) return;

      const vFov = (camera.fov * Math.PI) / 180;
      const visibleHeight = 2 * Math.tan(vFov / 2) * camera.position.z;
      visibleWidth = visibleHeight * (w / h);

      // Center-right of hero at about 71% of width
      targetGroupPos.x = visibleWidth * 0.205;
      targetGroupPos.y = 0.0;
    };

    const updateSize = () => {
      if (!canvasContainerRef.current) return;
      const w = canvasContainerRef.current.clientWidth;
      const h = canvasContainerRef.current.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      computeTargetGroupPos();
      formationGroup.position.copy(targetGroupPos);
    };
    updateSize();

    // ─── Raycasting & Pointer Interaction ───
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2(-999, -999);
    let hoveredModule: ModuleItem | null = null;
    let draggedModule: ModuleItem | null = null;

    const dragPlane = new THREE.Plane();
    const planeIntersection = new THREE.Vector3();
    const dragOffsetWorld = new THREE.Vector3();

    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    const updatePointer = (clientX: number, clientY: number) => {
      if (!canvasContainerRef.current) return;
      const rect = canvasContainerRef.current.getBoundingClientRect();
      pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    // ─── Pointer Event Handlers ───
    const onWindowPointerMove = (e: PointerEvent) => {
      updatePointer(e.clientX, e.clientY);

      if (!draggedModule) {
        const cubeNdcX = targetGroupPos.x / (visibleWidth / 2 || 1);
        targetParallaxX = (pointerNDC.x - cubeNdcX) * 0.16;
        targetParallaxY = pointerNDC.y * 0.12;
      }

      raycaster.setFromCamera(pointerNDC, camera);

      // ── Actively Dragging Single Module ──
      if (draggedModule) {
        canvas.style.pointerEvents = 'auto';
        canvas.style.cursor = 'grabbing';

        if (raycaster.ray.intersectPlane(dragPlane, planeIntersection)) {
          const targetWorld = planeIntersection.clone().sub(dragOffsetWorld);
          draggedModule.mesh.position.lerp(targetWorld, 0.55);
        }
        return;
      }

      // ── Hover Detection ──
      const allMeshes = modules.map((m) => m.mesh);
      const intersects = raycaster.intersectObjects(allMeshes, false);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const hitModule = modules.find((m) => m.mesh === hitMesh) || null;

        if (hitModule !== hoveredModule) {
          if (hoveredModule && hoveredModule.state !== 'dragging') {
            hoveredModule.material.emissive.set(REST_EMISSIVE);
            hoveredModule.material.emissiveIntensity = REST_EMISSIVE_INTENSITY;
            hoveredModule.mesh.scale.set(1.0, 1.0, 1.0);
          }

          hoveredModule = hitModule;

          if (hoveredModule) {
            hoveredModule.material.emissive.copy(hoverColor);
            hoveredModule.material.emissiveIntensity = 0.65;
            hoveredModule.mesh.scale.set(1.06, 1.06, 1.06);
          }
        }

        canvas.style.pointerEvents = 'auto';
        canvas.style.cursor = 'grab';
      } else {
        if (hoveredModule && hoveredModule.state !== 'dragging') {
          hoveredModule.material.emissive.set(REST_EMISSIVE);
          hoveredModule.material.emissiveIntensity = REST_EMISSIVE_INTENSITY;
          hoveredModule.mesh.scale.set(1.0, 1.0, 1.0);
          hoveredModule = null;
        }

        canvas.style.pointerEvents = 'none';
        canvas.style.cursor = 'default';
      }
    };

    const onWindowPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      updatePointer(e.clientX, e.clientY);

      raycaster.setFromCamera(pointerNDC, camera);
      const allMeshes = modules.map((m) => m.mesh);
      const intersects = raycaster.intersectObjects(allMeshes, false);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const hitModule = modules.find((m) => m.mesh === hitMesh);

        if (hitModule) {
          e.preventDefault();
          e.stopPropagation();

          draggedModule = hitModule;
          draggedModule.state = 'dragging';
          // Re-grab safety: cancel pending return/docking and reset rotation accumulator
          draggedModule.rotationTravelSinceRelease = 0;
          draggedModule.returnProgress = 0;

          // Attach to scene while dragging so global rotation does not fight mouse dragging
          scene.attach(draggedModule.mesh);

          canvas.style.pointerEvents = 'auto';
          canvas.style.cursor = 'grabbing';

          draggedModule.material.emissive.copy(dragColor);
          draggedModule.material.emissiveIntensity = 0.85;
          draggedModule.mesh.scale.set(1.10, 1.10, 1.10);

          const moduleWorldPos = new THREE.Vector3();
          draggedModule.mesh.getWorldPosition(moduleWorldPos);

          const camDir = new THREE.Vector3();
          camera.getWorldDirection(camDir).negate();
          dragPlane.setFromNormalAndCoplanarPoint(camDir, moduleWorldPos);

          if (raycaster.ray.intersectPlane(dragPlane, planeIntersection)) {
            dragOffsetWorld.copy(planeIntersection).sub(moduleWorldPos);
          } else {
            dragOffsetWorld.set(0, 0, 0);
          }
        }
      }
    };

    const onWindowPointerUp = () => {
      if (draggedModule) {
        // Re-attach to formation group so the released module continues
        // participating in the main cube's rotational frame and orbits with it!
        formationGroup.attach(draggedModule.mesh);

        draggedModule.state = 'detached';
        draggedModule.detachedLocalPos.copy(draggedModule.mesh.position);
        draggedModule.detachedLocalRot.copy(draggedModule.mesh.rotation);
        // Reset rotation travel accumulator: will only return after ONE FULL 360° of rotation
        draggedModule.rotationTravelSinceRelease = 0;
        draggedModule.returnProgress = 0;

        draggedModule.material.emissive.set(REST_EMISSIVE);
        draggedModule.material.emissiveIntensity = REST_EMISSIVE_INTENSITY;
        draggedModule.mesh.scale.set(1.0, 1.0, 1.0);

        draggedModule = null;
        canvas.style.cursor = 'default';
        canvas.style.pointerEvents = 'none';
      }
    };

    window.addEventListener('pointermove', onWindowPointerMove, { passive: true });
    window.addEventListener('pointerdown', onWindowPointerDown);
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('resize', updateSize);

    // ─── Main Animation Loop ───
    let animFrameId = 0;
    const clock = new THREE.Clock();

    // Orientation state: continuous quaternion multi-axis integration
    let accumulatedAngle = 0;
    const qTumble = new THREE.Quaternion().setFromEuler(INITIAL_EULER);

    // Pre-allocated math helpers for zero per-frame garbage collection
    const currentAxis = new THREE.Vector3();
    const qDelta = new THREE.Quaternion();
    const qTempDrift = new THREE.Quaternion();
    const qTempParallax = new THREE.Quaternion();
    const eulerTempDrift = new THREE.Euler(0, 0, 0, 'YXZ');
    const eulerTempParallax = new THREE.Euler(0, 0, 0, 'YXZ');
    const tempSlotLocal = new THREE.Vector3();
    const qPrevFormation = new THREE.Quaternion().copy(formationGroup.quaternion);

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      if (targetGroupPos.x === 0) {
        computeTargetGroupPos();
      }

      // Track horizontal placement on right side of Hero
      formationGroup.position.x = targetGroupPos.x;

      // Smooth mouse parallax lerp
      currentParallaxX += (targetParallaxX - currentParallaxX) * 0.04;
      currentParallaxY += (targetParallaxY - currentParallaxY) * 0.04;

      if (!reducedMotion) {
        // ─── Continuous Multi-Axis Low-Gravity Tumble Integration ───
        const deltaAngle = TUMBLE_SPEED * delta;
        accumulatedAngle += deltaAngle;

        // Dynamically compute smoothly evolving unit rotation axis
        computeEvolvingAxis(accumulatedAngle, currentAxis);

        // Incremental frame rotation quaternion around world-space axis
        qDelta.setFromAxisAngle(currentAxis, deltaAngle);

        // Premultiply: continuous, uninterrupted rotation without axis snapping or pauses
        qTumble.premultiply(qDelta);
        qTumble.normalize();

        // Subtle zero-gravity secondary gyroscopic drift
        const driftPitch = Math.sin(elapsed * 0.16 + 0.4) * 0.018;
        const driftYaw = Math.cos(elapsed * 0.12) * 0.020;
        const driftRoll = Math.sin(elapsed * 0.19 + 1.8) * 0.012;
        const qDrift = qTempDrift.setFromEuler(
          eulerTempDrift.set(driftPitch, driftYaw, driftRoll, 'YXZ')
        );

        // Interactive mouse parallax offset
        const qParallax = qTempParallax.setFromEuler(
          eulerTempParallax.set(-currentParallaxY * 0.08, currentParallaxX * 0.08, 0, 'YXZ')
        );

        // Composite orientation: Camera Parallax * Zero-G Drift * Tumbling Formation
        formationGroup.quaternion.copy(qParallax).multiply(qDrift).multiply(qTumble);

        // Organic low-gravity vertical levitation (dual-frequency harmonic motion)
        formationGroup.position.y =
          targetGroupPos.y +
          Math.sin(elapsed * 0.42) * 0.028 +
          Math.sin(elapsed * 0.21 + 1.2) * 0.014;
      } else {
        formationGroup.quaternion.setFromEuler(INITIAL_EULER);
        formationGroup.position.y = targetGroupPos.y;
      }

      // ─── Calculate exact 3D angular travel of the formation for this frame ───
      const frameAngleDelta = qPrevFormation.angleTo(formationGroup.quaternion);
      qPrevFormation.copy(formationGroup.quaternion);

      // Animate individual modules
      modules.forEach((mod) => {
        // 1. Actively being dragged by pointer (in world space)
        if (mod.state === 'dragging') {
          return;
        }

        // 2. Docked in the modular cluster: subtle resting breathing with individual satellite motion
        if (mod.state === 'docked') {
          const amp = mod.isSatellite ? 0.022 : 0.007;
          const breathe = Math.sin(elapsed * 0.85 + mod.phase) * amp;
          tempSlotLocal.copy(mod.homePos).addScaledVector(mod.radialDir, breathe);
          mod.mesh.position.copy(tempSlotLocal);
          return;
        }

        // 3. Detached: ORBITS AND ROTATES with the main cluster in its rotating coordinate frame!
        if (mod.state === 'detached') {
          // Accumulate formation's actual 3D rotational movement since release
          mod.rotationTravelSinceRelease += frameAngleDelta;

          const floatY = Math.sin(elapsed * 1.5 + mod.phase) * 0.018;
          mod.mesh.position.set(
            mod.detachedLocalPos.x,
            mod.detachedLocalPos.y + floatY,
            mod.detachedLocalPos.z
          );

          // Auto-return begins ONLY after ONE FULL 360° (2π radians) of rotational travel!
          if (mod.rotationTravelSinceRelease >= 2 * Math.PI) {
            mod.state = 'returning';
            mod.startReturnLocalPos.copy(mod.mesh.position);
            mod.returnProgress = 0;
          }
          return;
        }

        // 4. Returning to its slot inside the rotating frame
        if (mod.state === 'returning') {
          mod.returnProgress += delta * 0.85; // ~1.18s smooth return
          const t = Math.min(mod.returnProgress, 1.0);
          const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

          const amp = mod.isSatellite ? 0.022 : 0.007;
          const breathe = Math.sin(elapsed * 0.85 + mod.phase) * amp;
          tempSlotLocal.copy(mod.homePos).addScaledVector(mod.radialDir, breathe);

          // Travel back to slot within the rotating coordinate frame
          mod.mesh.position.lerpVectors(mod.startReturnLocalPos, tempSlotLocal, ease);
          mod.mesh.rotation.x = THREE.MathUtils.lerp(mod.detachedLocalRot.x, mod.homeRot.x, ease);
          mod.mesh.rotation.y = THREE.MathUtils.lerp(mod.detachedLocalRot.y, mod.homeRot.y, ease);
          mod.mesh.rotation.z = THREE.MathUtils.lerp(mod.detachedLocalRot.z, mod.homeRot.z, ease);

          if (t >= 1.0) {
            mod.state = 'docked';
            mod.rotationTravelSinceRelease = 0;
            mod.returnProgress = 0;
            mod.mesh.position.copy(mod.homePos);
            mod.mesh.rotation.copy(mod.homeRot);
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // ─── Cleanup ───
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerdown', onWindowPointerDown);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('resize', updateSize);

      moduleGeometry.dispose();
      modules.forEach((m) => m.material.dispose());
      edgeBoxGeometry.dispose();
      edgeGeometry.dispose();
      edgeMaterial.dispose();
      faceTexture.dispose();
      envRenderTarget.dispose();
      envCanvasTexture.dispose();
      pmremGenerator.dispose();
      renderer.dispose();

      if (canvasContainer.contains(renderer.domElement)) {
        canvasContainer.removeChild(renderer.domElement);
      }
    };
  }, [isDesktop]);

  if (!isDesktop) {
    return null;
  }

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden">
      {/* Decorative radial halo behind cluster */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 34% 52% at 71% 50%, rgba(120,195,240,0.25) 0%, rgba(160,215,245,0.12) 45%, rgba(255,255,255,0) 75%)',
        }}
      />
      <div
        ref={canvasContainerRef}
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{ touchAction: 'none' }}
        aria-label="Interactive 3D modular formation"
      />
    </div>
  );
}
