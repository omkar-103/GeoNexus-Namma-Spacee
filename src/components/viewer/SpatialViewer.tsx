import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  Doorway,
  Obstacle,
  POI,
  RouteResult,
  Vector3D,
} from '../../types/index.ts';
import {
  createFloorMesh,
  createFurnitureGroup,
  createWallMesh,
  createDoorwayPortal,
  createPOIPinMesh,
  createPOIClusterMesh,
  createBiophilicPlanter,
} from './proceduralArchitecture.ts';
import { clusterPOIs, POICluster, POIOrCluster } from '../../engine/clustering/poiClustering.ts';
import { isPositionBlocked } from '../../engine/collision/gridCollision.ts';
import {
  Compass,
  Eye,
  Maximize2,
  Minimize2,
  RotateCcw,
  Layers,
  MapPin,
  ShieldAlert,
  Grid,
  Footprints,
  Play,
  Pause,
  Square,
  Navigation,
  ChevronRight,
  Sparkles,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export type CameraViewMode = 'orbit' | 'first_person' | 'top_down';

interface SpatialViewerProps {
  activeFloor: number;
  obstacles: Obstacle[];
  doorways: Doorway[];
  pois: POI[];
  selectedPoiId: string | null;
  onSelectPoi: (poi: POI | null) => void;
  activeRoute: RouteResult | null;
  showObstacleBounds: boolean;
  onToggleObstacleBounds: () => void;
  showNavGrid: boolean;
  onToggleNavGrid: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  customModelUrl?: string | null;
  onNavigateToPoi: (poi: POI) => void;
}

// Pre-allocated scratch objects to prevent garbage collection and eliminate frame stutter
const _scratchVecForward = new THREE.Vector3();
const _scratchVecRight = new THREE.Vector3();
const _scratchMoveDir = new THREE.Vector3();
const _scratchEuler = new THREE.Euler(0, 0, 0, 'YXZ');
const _upAxis = new THREE.Vector3(0, 1, 0);
const _raycaster = new THREE.Raycaster();
const _mouseVec = new THREE.Vector2();

export const SpatialViewer: React.FC<SpatialViewerProps> = ({
  activeFloor,
  obstacles,
  doorways,
  pois,
  selectedPoiId,
  onSelectPoi,
  activeRoute,
  showObstacleBounds,
  onToggleObstacleBounds,
  showNavGrid,
  onToggleNavGrid,
  showLabels,
  onToggleLabels,
  customModelUrl,
  onNavigateToPoi,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);

  // Viewer state
  const [viewMode, setViewMode] = useState<CameraViewMode>('orbit');
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [isSimulatingRoute, setIsSimulatingRoute] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [collisionWarning, setCollisionWarning] = useState<string | null>(null);

  // Throttled UI readout for coordinates (prevents 60fps React re-renders)
  const [uiPlayerCoord, setUiPlayerCoord] = useState<{ x: number; z: number }>({ x: -12.5, z: 8.0 });

  // Visual Floor Transition Banner State
  const [floorTransitionNotice, setFloorTransitionNotice] = useState<{
    floor: number;
    text: string;
    direction: 'up' | 'down' | 'initial';
  } | null>(null);

  // References to keep Three.js scene persistent across renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Dedicated scene sub-groups
  const floorArchitectureGroupRef = useRef<THREE.Group>(new THREE.Group());
  const poiPinsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const routeLineGroupRef = useRef<THREE.Group>(new THREE.Group());
  const obstacleBoundsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const navGridGroupRef = useRef<THREE.Group>(new THREE.Group());
  const playerAvatarGroupRef = useRef<THREE.Group>(new THREE.Group());
  const customModelGroupRef = useRef<THREE.Group>(new THREE.Group());

  // Camera animation target for smooth cluster zooming
  const cameraAnimRef = useRef<{
    active: boolean;
    startTime: number;
    duration: number;
    startPos: THREE.Vector3;
    targetPos: THREE.Vector3;
    startTarget: THREE.Vector3;
    endTarget: THREE.Vector3;
  }>({
    active: false,
    startTime: 0,
    duration: 650,
    startPos: new THREE.Vector3(),
    targetPos: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
  });

  // Floor cross-fade transition state
  const prevFloorRef = useRef<number>(activeFloor);
  const floorTransitionRef = useRef<{
    active: boolean;
    startTime: number;
    duration: number;
    direction: 'up' | 'down';
    startOpacity: number;
    startY: number;
  }>({
    active: false,
    startTime: 0,
    duration: 480, // 480ms smooth architectural cross-fade
    direction: 'up',
    startOpacity: 0,
    startY: 0,
  });

  // Mutable state for the 60fps physics/render loop
  const stateRef = useRef({
    viewMode: 'orbit' as CameraViewMode,
    isPointerLocked: false,
    keys: { w: false, a: false, s: false, d: false, Shift: false },
    pitch: 0,
    yaw: 0,
    playerPos: { x: -12.5, y: 1.65, z: 8.0 },
    simulatingRoute: false,
    simProgress: 0,
    simSpeed: 1,
    activeRoute: activeRoute,
    obstacles: obstacles,
    doorways: doorways,
    pois: pois,
    selectedPoiId: selectedPoiId,
    activeFloor: activeFloor,
    lastCameraDistance: 32,
    lastClusterCheckTime: 0,
    lastUiUpdateTime: 0,
    lastMinimapDrawTime: 0,
    lastMinimapPos: { x: -999, z: -999, yaw: -999 },
  });

  // Keep stateRef fast references in sync
  useEffect(() => {
    stateRef.current.viewMode = viewMode;
    stateRef.current.isPointerLocked = isPointerLocked;
    stateRef.current.simulatingRoute = isSimulatingRoute;
    stateRef.current.simSpeed = simulationSpeed;
    stateRef.current.activeRoute = activeRoute;
    stateRef.current.obstacles = obstacles;
    stateRef.current.doorways = doorways;
    stateRef.current.pois = pois;
    stateRef.current.selectedPoiId = selectedPoiId;
    stateRef.current.activeFloor = activeFloor;
  }, [viewMode, isPointerLocked, isSimulatingRoute, simulationSpeed, activeRoute, obstacles, doorways, pois, selectedPoiId, activeFloor]);

  // Re-cluster POIs function based on current camera distance
  const updatePOIClusterMeshes = useCallback((camDistance: number, force: boolean = false) => {
    const group = poiPinsGroupRef.current;
    const currentPois = stateRef.current.pois;
    const currentSelectedId = stateRef.current.selectedPoiId;

    if (!currentPois || currentPois.length === 0) {
      group.clear();
      return;
    }

    const clusters = clusterPOIs(currentPois, camDistance);

    group.clear();

    for (const item of clusters) {
      if (item.isCluster) {
        const cluster = item as POICluster;
        const isClusterSelected = cluster.pois.some((p) => p.id === currentSelectedId);
        const clusterMesh = createPOIClusterMesh(cluster, isClusterSelected);
        group.add(clusterMesh);
      } else {
        const poi = item as POI;
        const isSelected = poi.id === currentSelectedId;
        const pinMesh = createPOIPinMesh(poi, isSelected);
        pinMesh.userData = { poiId: poi.id, isCluster: false };
        group.add(pinMesh);
      }
    }
  }, []);

  // 1. Initialize Three.js Scene and Architectural World
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create Scene with architectural atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x131924);
    scene.fog = new THREE.FogExp2(0x131924, 0.012);
    sceneRef.current = scene;

    // Create Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 160);
    camera.position.set(0, 24, 22);
    cameraRef.current = camera;

    // Create Renderer with High-Performance Settings and Damped DPR
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    const renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.09;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 2.5;
    controls.maxDistance = 55;
    controls.target.set(0, 1.2, 0);
    controlsRef.current = controls;

    // Architectural Lighting Rig (Crisp sunlight + diffuse sky + ambient fill)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xdbe6f2, 0x1e2632, 0.85);
    hemiLight.position.set(0, 32, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffaee, 1.45);
    dirLight.position.set(16, 30, 16);
    dirLight.castShadow = !isHeadless;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 65;
    dirLight.shadow.camera.left = -22;
    dirLight.shadow.camera.right = 22;
    dirLight.shadow.camera.top = 22;
    dirLight.shadow.camera.bottom = -22;
    dirLight.shadow.bias = -0.0003;
    scene.add(dirLight);

    // Soft secondary fill light
    const fillLight = new THREE.DirectionalLight(0xa5c4e0, 0.45);
    fillLight.position.set(-16, 20, -14);
    scene.add(fillLight);

    // Add Architectural Container Group
    scene.add(floorArchitectureGroupRef.current);

    // Build Initial Floor Layer
    rebuildFloorArchitecture(floorArchitectureGroupRef.current, obstacles, doorways);

    // Add biophilic planters in corridors & entrances
    const plantersGroup = new THREE.Group();
    plantersGroup.add(createBiophilicPlanter(-6.0, 3.2));
    plantersGroup.add(createBiophilicPlanter(2.2, 3.2));
    plantersGroup.add(createBiophilicPlanter(-11.0, 4.5));
    plantersGroup.add(createBiophilicPlanter(-2.5, -5.5));
    plantersGroup.add(createBiophilicPlanter(14.0, 3.2));
    floorArchitectureGroupRef.current.add(plantersGroup);

    // Add sub-groups
    scene.add(poiPinsGroupRef.current);
    scene.add(routeLineGroupRef.current);
    scene.add(obstacleBoundsGroupRef.current);
    scene.add(navGridGroupRef.current);
    scene.add(playerAvatarGroupRef.current);
    scene.add(customModelGroupRef.current);

    // Player Avatar Mesh (shows when in Orbit mode)
    const avatarGroup = playerAvatarGroupRef.current;
    avatarGroup.clear();
    const avatarGeo = new THREE.CylinderGeometry(0.24, 0.24, 1.6, 16);
    const avatarMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      metalness: 0.6,
      roughness: 0.3,
    });
    const avatarMesh = new THREE.Mesh(avatarGeo, avatarMat);
    avatarMesh.position.y = 0.8;
    avatarMesh.castShadow = true;
    avatarGroup.add(avatarMesh);

    // Heading cone for player
    const coneGeo = new THREE.ConeGeometry(0.18, 0.38, 12);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.rotation.x = Math.PI / 2;
    coneMesh.position.set(0, 1.2, -0.32);
    avatarGroup.add(coneMesh);

    // Initial POI clusters setup
    updatePOIClusterMeshes(camera.position.distanceTo(controls.target), true);

    // Window Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Main 60fps Animation Loop
    let lastTime = performance.now();
    const animate = (time: number) => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const s = stateRef.current;

      // Handle Floor Cross-Fade Transition Animation
      if (floorTransitionRef.current.active) {
        const trans = floorTransitionRef.current;
        const elapsed = time - trans.startTime;
        const progress = Math.min(1.0, elapsed / trans.duration);

        // Ease-out cubic curve
        const ease = 1 - Math.pow(1 - progress, 3);

        const group = floorArchitectureGroupRef.current;
        const verticalOffset = trans.direction === 'up'
          ? (1 - ease) * -1.8
          : (1 - ease) * 1.8;

        group.position.y = verticalOffset;

        // Modulate transparent materials opacity
        group.traverse((obj) => {
          if (obj instanceof THREE.Mesh && obj.material) {
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            for (const mat of mats) {
              if (mat.transparent) {
                mat.opacity = THREE.MathUtils.lerp(0.2, 1.0, ease);
              }
            }
          }
        });

        if (progress >= 1.0) {
          trans.active = false;
          group.position.y = 0;
        }
      }

      // Smooth Camera Animation (e.g. fly-to when clicking cluster)
      if (cameraAnimRef.current.active) {
        const anim = cameraAnimRef.current;
        const elapsed = time - anim.startTime;
        const progress = Math.min(1.0, elapsed / anim.duration);
        const ease = 1 - Math.pow(1 - progress, 3); // Ease out cubic

        camera.position.lerpVectors(anim.startPos, anim.targetPos, ease);
        controls.target.lerpVectors(anim.startTarget, anim.endTarget, ease);
        controls.update();

        if (progress >= 1.0) {
          anim.active = false;
          // Trigger POI re-clustering immediately upon landing
          updatePOIClusterMeshes(camera.position.distanceTo(controls.target), true);
        }
      }

      // First-person Roaming Movement
      if (s.viewMode === 'first_person') {
        if (controlsRef.current) controlsRef.current.enabled = false;

        const moveSpeed = (s.keys.Shift ? 6.5 : 3.6) * delta;
        _scratchVecForward.set(0, 0, -1).applyAxisAngle(_upAxis, s.yaw);
        _scratchVecRight.set(1, 0, 0).applyAxisAngle(_upAxis, s.yaw);

        _scratchMoveDir.set(0, 0, 0);
        if (s.keys.w) _scratchMoveDir.add(_scratchVecForward);
        if (s.keys.s) _scratchMoveDir.sub(_scratchVecForward);
        if (s.keys.d) _scratchMoveDir.add(_scratchVecRight);
        if (s.keys.a) _scratchMoveDir.sub(_scratchVecRight);

        if (_scratchMoveDir.lengthSq() > 0) {
          _scratchMoveDir.normalize().multiplyScalar(moveSpeed);

          const targetX = s.playerPos.x + _scratchMoveDir.x;
          const targetZ = s.playerPos.z + _scratchMoveDir.z;

          // Wall & Obstacle Collision Checks with sliding
          const checkX = isPositionBlocked(targetX, s.playerPos.z, s.obstacles, 0.35);
          const checkZ = isPositionBlocked(s.playerPos.x, targetZ, s.obstacles, 0.35);

          let newX = s.playerPos.x;
          let newZ = s.playerPos.z;

          if (!checkX.blocked) {
            newX = targetX;
          }
          if (!checkZ.blocked) {
            newZ = targetZ;
          }

          if (checkX.blocked || checkZ.blocked) {
            setCollisionWarning('Boundary collision detected - obstacle clearance enforced');
          } else {
            setCollisionWarning(null);
          }

          // Boundary clamp to room perimeter
          newX = Math.max(-14.8, Math.min(14.8, newX));
          newZ = Math.max(-12.8, Math.min(11.8, newZ));

          s.playerPos.x = newX;
          s.playerPos.z = newZ;
        }

        // Apply camera transformation for First-Person
        camera.position.set(s.playerPos.x, s.playerPos.y, s.playerPos.z);
        _scratchEuler.set(s.pitch, s.yaw, 0, 'YXZ');
        camera.quaternion.setFromEuler(_scratchEuler);
      } else if (s.viewMode === 'top_down') {
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
          controlsRef.current.maxPolarAngle = 0.05;
        }
      } else {
        // Orbit Mode
        if (controlsRef.current && !cameraAnimRef.current.active) {
          controlsRef.current.enabled = true;
          controlsRef.current.maxPolarAngle = Math.PI / 2 - 0.05;
          controlsRef.current.update();
        }
      }

      // Simulated Route Navigation
      if (s.simulatingRoute && s.activeRoute && s.activeRoute.path.length > 1) {
        const path = s.activeRoute.path;
        s.simProgress += delta * 0.12 * s.simSpeed;

        if (s.simProgress >= 1.0) {
          s.simProgress = 1.0;
          setIsSimulatingRoute(false);
        }

        // Interpolate along route path
        const totalSegments = path.length - 1;
        const currentSegment = Math.min(Math.floor(s.simProgress * totalSegments), totalSegments - 1);
        const segmentProgress = s.simProgress * totalSegments - currentSegment;

        const pA = path[currentSegment];
        const pB = path[currentSegment + 1];

        const curX = pA.x + (pB.x - pA.x) * segmentProgress;
        const curZ = pA.z + (pB.z - pA.z) * segmentProgress;

        s.playerPos.x = curX;
        s.playerPos.z = curZ;

        // Calculate heading
        const heading = Math.atan2(pA.x - pB.x, pA.z - pB.z);
        s.yaw = heading;

        if (s.viewMode === 'first_person') {
          camera.position.set(curX, 1.65, curZ);
          _scratchEuler.set(0, heading, 0, 'YXZ');
          camera.quaternion.setFromEuler(_scratchEuler);
        }
      }

      // Check camera distance & dynamic POI clustering
      const currentCamDist = camera.position.distanceTo(controls.target);
      if (
        time - s.lastClusterCheckTime > 180 &&
        Math.abs(currentCamDist - s.lastCameraDistance) > 1.8
      ) {
        s.lastClusterCheckTime = time;
        s.lastCameraDistance = currentCamDist;
        updatePOIClusterMeshes(currentCamDist);
      }

      // Update avatar mesh position & orientation
      avatarGroup.position.set(s.playerPos.x, 0, s.playerPos.z);
      avatarGroup.rotation.y = s.yaw;
      avatarGroup.visible = s.viewMode !== 'first_person';

      // Throttled UI coordinate state update (120ms cadence = silky smooth 60fps)
      if (time - s.lastUiUpdateTime > 120) {
        s.lastUiUpdateTime = time;
        setUiPlayerCoord({ x: s.playerPos.x, z: s.playerPos.z });
      }

      // Throttled Minimap Draw (every 33ms = 30fps direct canvas render)
      if (time - s.lastMinimapDrawTime > 33) {
        s.lastMinimapDrawTime = time;
        drawMinimapDirect(s.playerPos.x, s.playerPos.z, s.yaw);
      }

      renderer.render(scene, camera);
    };

    animate(performance.now());

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      controls.dispose();
    };
  }, [updatePOIClusterMeshes]);

  // Helper: Rebuilds floor meshes cleanly into a group
  function rebuildFloorArchitecture(
    group: THREE.Group,
    currentObstacles: Obstacle[],
    currentDoorways: Doorway[]
  ) {
    group.clear();

    // 1. Build Base Floor
    const floorMesh = createFloorMesh(32, 28);
    group.add(floorMesh);

    // 2. Build Walls & Furniture
    const obsGroup = new THREE.Group();
    for (const obs of currentObstacles) {
      if (obs.type === 'wall' || obs.type === 'glass_partition') {
        obsGroup.add(createWallMesh(obs));
      } else {
        obsGroup.add(createFurnitureGroup(obs));
      }
    }
    group.add(obsGroup);

    // 3. Build Doorways
    const doorGroup = new THREE.Group();
    for (const door of currentDoorways) {
      doorGroup.add(createDoorwayPortal(door));
    }
    group.add(doorGroup);
  }

  // 2. Handle Floor Switch Transition Animation
  useEffect(() => {
    if (activeFloor === prevFloorRef.current) return;

    const isGoingUp = activeFloor > prevFloorRef.current;
    const direction = isGoingUp ? 'up' : 'down';
    prevFloorRef.current = activeFloor;

    // Trigger visual notification
    setFloorTransitionNotice({
      floor: activeFloor,
      text: isGoingUp ? `Elevator ascending to Level 0${activeFloor}` : `Elevator descending to Level 0${activeFloor}`,
      direction,
    });

    const timeout = setTimeout(() => {
      setFloorTransitionNotice(null);
    }, 2400);

    // Trigger Three.js cross-fade transition
    if (floorArchitectureGroupRef.current) {
      floorTransitionRef.current = {
        active: true,
        startTime: performance.now(),
        duration: 480,
        direction,
        startOpacity: 0.2,
        startY: direction === 'up' ? -1.8 : 1.8,
      };

      // Rebuild architecture for this floor level
      rebuildFloorArchitecture(floorArchitectureGroupRef.current, obstacles, doorways);
    }

    // Refresh POI clusters for this floor
    if (cameraRef.current && controlsRef.current) {
      const dist = cameraRef.current.position.distanceTo(controlsRef.current.target);
      updatePOIClusterMeshes(dist, true);
    }

    return () => clearTimeout(timeout);
  }, [activeFloor, obstacles, doorways, updatePOIClusterMeshes]);

  // 3. POI selection or list change update
  useEffect(() => {
    if (cameraRef.current && controlsRef.current) {
      const dist = cameraRef.current.position.distanceTo(controlsRef.current.target);
      updatePOIClusterMeshes(dist, true);
    }
  }, [pois, selectedPoiId, updatePOIClusterMeshes]);

  // 4. Update 3D Route Line & Waypoint Markers
  useEffect(() => {
    const group = routeLineGroupRef.current;
    group.clear();

    if (!activeRoute || activeRoute.path.length < 2) return;

    const points = activeRoute.path.map((p) => new THREE.Vector3(p.x, 0.08, p.z));

    // Architectural Path Ribbon / Tube (calm mineral teal)
    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.1);
    const tubeGeo = new THREE.TubeGeometry(curve, points.length * 8, 0.08, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x6ab7a8,
      emissive: 0x244a43,
      emissiveIntensity: 0.4,
      roughness: 0.38,
      metalness: 0.3,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    group.add(tubeMesh);

    // Floor projection baseline
    const lineMat = new THREE.LineBasicMaterial({ color: 0x4d8a7e, linewidth: 2 });
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMesh = new THREE.Line(lineGeo, lineMat);
    lineMesh.position.y = 0.085;
    group.add(lineMesh);

    // Start point beacon (Calm Green)
    const startPoint = activeRoute.path[0];
    const startRingGeo = new THREE.RingGeometry(0.24, 0.38, 24);
    const startRingMat = new THREE.MeshBasicMaterial({ color: 0x79b99b, side: THREE.DoubleSide });
    const startRing = new THREE.Mesh(startRingGeo, startRingMat);
    startRing.rotation.x = -Math.PI / 2;
    startRing.position.set(startPoint.x, 0.09, startPoint.z);
    group.add(startRing);

    // Destination beacon (Architectural Amber target rings)
    const endPoint = activeRoute.path[activeRoute.path.length - 1];
    const endRingGeo = new THREE.RingGeometry(0.28, 0.46, 24);
    const endRingMat = new THREE.MeshBasicMaterial({ color: 0xd5a45d, side: THREE.DoubleSide });
    const endRing = new THREE.Mesh(endRingGeo, endRingMat);
    endRing.rotation.x = -Math.PI / 2;
    endRing.position.set(endPoint.x, 0.09, endPoint.z);
    group.add(endRing);

    // Intermediate waypoint nodes
    for (let i = 1; i < activeRoute.path.length - 1; i++) {
      const wp = activeRoute.path[i];
      const wpGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12);
      const wpMat = new THREE.MeshBasicMaterial({ color: 0x6ab7a8 });
      const wpMesh = new THREE.Mesh(wpGeo, wpMat);
      wpMesh.position.set(wp.x, 0.09, wp.z);
      group.add(wpMesh);
    }
  }, [activeRoute]);

  // 5. Update Obstacle Bounds Overlay (Route Trust Inspector)
  useEffect(() => {
    const group = obstacleBoundsGroupRef.current;
    group.clear();
    group.visible = showObstacleBounds;

    if (!showObstacleBounds) return;

    for (const obs of obstacles) {
      const width = obs.bounds.maxX - obs.bounds.minX;
      const depth = obs.bounds.maxZ - obs.bounds.minZ;
      const height = obs.height;
      const centerX = (obs.bounds.minX + obs.bounds.maxX) / 2;
      const centerZ = (obs.bounds.minZ + obs.bounds.maxZ) / 2;

      // Wireframe bounding volume
      const boxGeo = new THREE.BoxGeometry(width, height, depth);
      const wireGeo = new THREE.WireframeGeometry(boxGeo);
      const wireMat = new THREE.LineBasicMaterial({
        color: obs.type === 'wall' ? 0xd97777 : 0xd5a45d,
        linewidth: 1,
      });
      const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
      wireMesh.position.set(centerX, height / 2, centerZ);
      group.add(wireMesh);

      // Floor footprint shaded tile
      const footGeo = new THREE.PlaneGeometry(width, depth);
      const footMat = new THREE.MeshBasicMaterial({
        color: obs.type === 'wall' ? 0xd97777 : 0xd5a45d,
        transparent: true,
        opacity: 0.14,
        side: THREE.DoubleSide,
      });
      const footMesh = new THREE.Mesh(footGeo, footMat);
      footMesh.rotation.x = -Math.PI / 2;
      footMesh.position.set(centerX, 0.015, centerZ);
      group.add(footMesh);
    }
  }, [obstacles, showObstacleBounds]);

  // 6. Update Navigation Grid Overlay (Route Trust Inspector)
  useEffect(() => {
    const group = navGridGroupRef.current;
    group.clear();
    group.visible = showNavGrid;

    if (!showNavGrid) return;

    const nodeGeo = new THREE.PlaneGeometry(0.12, 0.12);
    const nodeMat = new THREE.MeshBasicMaterial({
      color: 0x6ab7a8,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
    });

    const instancedMesh = new THREE.InstancedMesh(nodeGeo, nodeMat, 1200);
    const dummy = new THREE.Object3D();
    dummy.rotation.x = -Math.PI / 2;

    let instanceCount = 0;
    for (let x = -14.5; x <= 14.5; x += 0.8) {
      for (let z = -12.5; z <= 11.5; z += 0.8) {
        if (!isPositionBlocked(x, z, obstacles, 0.35).blocked && instanceCount < 1200) {
          dummy.position.set(x, 0.02, z);
          dummy.updateMatrix();
          instancedMesh.setMatrixAt(instanceCount, dummy.matrix);
          instanceCount++;
        }
      }
    }

    instancedMesh.count = instanceCount;
    instancedMesh.instanceMatrix.needsUpdate = true;
    group.add(instancedMesh);
  }, [obstacles, showNavGrid]);

  // 7. Raycast Click on Canvas: Smooth Fly-to for Clusters or Select for Individual POIs
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (viewMode === 'first_person' && !isPointerLocked) {
      mountRef.current?.requestPointerLock();
      return;
    }

    if (!mountRef.current || !cameraRef.current || !sceneRef.current || !controlsRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    _mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    _mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_mouseVec, cameraRef.current);

    const intersects = _raycaster.intersectObjects(poiPinsGroupRef.current.children, true);
    if (intersects.length > 0) {
      let topObj: THREE.Object3D | null = intersects[0].object;
      while (topObj && !topObj.userData?.poiId && !topObj.userData?.isCluster && topObj.parent) {
        topObj = topObj.parent;
      }

      if (topObj && topObj.userData) {
        const u = topObj.userData;

        // If clicked on a Cluster: initiate smooth fly-to zoom into cluster centroid
        if (u.isCluster && u.center) {
          const targetCenter = new THREE.Vector3(u.center.x, 1.2, u.center.z);
          const currentCamPos = cameraRef.current.position.clone();
          const currentTarget = controlsRef.current.target.clone();

          // Calculate zoomed-in camera position (distance ~14m from cluster)
          const dir = currentCamPos.clone().sub(currentTarget).normalize();
          const targetCamPos = targetCenter.clone().add(dir.multiplyScalar(15.0));
          targetCamPos.y = Math.max(8.0, targetCamPos.y);

          cameraAnimRef.current = {
            active: true,
            startTime: performance.now(),
            duration: 650,
            startPos: currentCamPos,
            targetPos: targetCamPos,
            startTarget: currentTarget,
            endTarget: targetCenter,
          };

          // Also select the representative primary POI
          const primaryPoi = u.cluster?.primaryPoi || pois.find((p) => p.id === u.poiId);
          if (primaryPoi) {
            onSelectPoi(primaryPoi);
          }
        } else if (u.poiId) {
          // Standard single POI pin clicked
          const found = pois.find((p) => p.id === u.poiId);
          if (found) {
            onSelectPoi(found);
          }
        }
      }
    }
  };

  // 8. Keyboard Controls for Roaming
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') stateRef.current.keys.w = true;
      if (key === 'a' || key === 'arrowleft') stateRef.current.keys.a = true;
      if (key === 's' || key === 'arrowdown') stateRef.current.keys.s = true;
      if (key === 'd' || key === 'arrowright') stateRef.current.keys.d = true;
      if (e.key === 'Shift') stateRef.current.keys.Shift = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') stateRef.current.keys.w = false;
      if (key === 'a' || key === 'arrowleft') stateRef.current.keys.a = false;
      if (key === 's' || key === 'arrowdown') stateRef.current.keys.s = false;
      if (key === 'd' || key === 'arrowright') stateRef.current.keys.d = false;
      if (e.key === 'Shift') stateRef.current.keys.Shift = false;
    };

    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === mountRef.current;
      setIsPointerLocked(locked);
      stateRef.current.isPointerLocked = locked;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (stateRef.current.viewMode === 'first_person' && document.pointerLockElement === mountRef.current) {
        const sens = 0.0022;
        stateRef.current.yaw -= e.movementX * sens;
        stateRef.current.pitch -= e.movementY * sens;
        stateRef.current.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, stateRef.current.pitch));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // 9. Camera View Mode Switcher Handlers
  const handleSetMode = (mode: CameraViewMode) => {
    setViewMode(mode);
    if (mode === 'first_person') {
      mountRef.current?.requestPointerLock();
    } else {
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      if (cameraRef.current && controlsRef.current) {
        if (mode === 'top_down') {
          cameraRef.current.position.set(0, 32, 0.01);
          controlsRef.current.target.set(0, 0, 0);
        } else {
          cameraRef.current.position.set(0, 24, 22);
          controlsRef.current.target.set(0, 1.2, 0);
        }
        controlsRef.current.update();
        updatePOIClusterMeshes(cameraRef.current.position.distanceTo(controlsRef.current.target), true);
      }
    }
  };

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 24, 22);
      controlsRef.current.target.set(0, 1.2, 0);
      controlsRef.current.update();
      updatePOIClusterMeshes(cameraRef.current.position.distanceTo(controlsRef.current.target), true);
    }
  };

  // 10. Direct High-Performance Minimap 2D Canvas Drawing (Zero React State Overhead)
  const drawMinimapDirect = useCallback(
    (playerX: number, playerZ: number, playerYaw: number) => {
      const canvas = minimapCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // Floor bounds: X in [-16, 16], Z in [-14, 14]
      const toMapX = (worldX: number) => ((worldX + 16) / 32) * (w - 16) + 8;
      const toMapY = (worldZ: number) => ((worldZ + 14) / 28) * (h - 16) + 8;

      ctx.fillStyle = '#111418';
      ctx.fillRect(0, 0, w, h);

      // Floor boundary
      ctx.strokeStyle = '#28323e';
      ctx.lineWidth = 1;
      ctx.strokeRect(8, 8, w - 16, h - 16);

      // Obstacles
      const curObs = stateRef.current.obstacles;
      for (const obs of curObs) {
        const ox1 = toMapX(obs.bounds.minX);
        const oy1 = toMapY(obs.bounds.minZ);
        const ox2 = toMapX(obs.bounds.maxX);
        const oy2 = toMapY(obs.bounds.maxZ);
        const bw = Math.max(1, ox2 - ox1);
        const bh = Math.max(1, oy2 - oy1);

        if (obs.type === 'wall' || obs.type === 'glass_partition') {
          ctx.fillStyle = obs.type === 'glass_partition' ? 'rgba(106, 183, 168, 0.35)' : '#2a333f';
        } else {
          ctx.fillStyle = '#1d242c';
        }
        ctx.fillRect(ox1, oy1, bw, bh);
      }

      // Doorways
      const curDoors = stateRef.current.doorways;
      ctx.fillStyle = '#6ab7a8';
      for (const door of curDoors) {
        const dx = toMapX(door.position.x);
        const dy = toMapY(door.position.z);
        ctx.fillRect(dx - 1.5, dy - 1.5, 3, 3);
      }

      // Active Route line
      const curRoute = stateRef.current.activeRoute;
      if (curRoute && curRoute.path.length > 1) {
        ctx.strokeStyle = '#6ab7a8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(toMapX(curRoute.path[0].x), toMapY(curRoute.path[0].z));
        for (let i = 1; i < curRoute.path.length; i++) {
          ctx.lineTo(toMapX(curRoute.path[i].x), toMapY(curRoute.path[i].z));
        }
        ctx.stroke();
      }

      // POI markers
      const curPois = stateRef.current.pois;
      const selPoiId = stateRef.current.selectedPoiId;
      for (const poi of curPois) {
        const px = toMapX(poi.position.x);
        const py = toMapY(poi.position.z);
        const isSel = poi.id === selPoiId;
        ctx.fillStyle = isSel ? '#d5a45d' : '#6b7989';
        ctx.beginPath();
        ctx.arc(px, py, isSel ? 3.5 : 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Player Sight Cone & Marker
      const px = toMapX(playerX);
      const py = toMapY(playerZ);

      ctx.fillStyle = 'rgba(106, 183, 168, 0.22)';
      ctx.beginPath();
      ctx.moveTo(px, py);
      const coneAngle = 0.52;
      const viewDir = playerYaw - Math.PI / 2;
      ctx.arc(px, py, 16, viewDir - coneAngle, viewDir + coneAngle);
      ctx.closePath();
      ctx.fill();

      // Player dot
      ctx.fillStyle = '#6ab7a8';
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f0f2f4';
      ctx.lineWidth = 1;
      ctx.stroke();
    },
    []
  );

  return (
    <div className="relative w-full h-full bg-[#111418] overflow-hidden select-none">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Dynamic Floor & Environment Status Pill */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-auto">
        <div className="px-3 py-1.5 rounded-lg bg-[#191e24]/95 border border-[#303943] shadow-md flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#6ab7a8] animate-pulse" />
          <span className="text-xs font-semibold text-[#f0f2f4] tracking-wide">
            Floor 0{activeFloor} Twin
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#202730] text-[#a6b0bb] font-mono border border-[#303943]">
            {activeFloor === 3 ? 'Demo Suite' : activeFloor === 2 ? 'R&D Labs' : 'Ground Atrium'}
          </span>
        </div>

        {collisionWarning && (
          <div className="px-3 py-1.5 rounded-lg bg-[#2b221c]/95 border border-[#d5a45d]/40 text-[#d5a45d] text-xs flex items-center gap-1.5 animate-fadeIn shadow-md">
            <ShieldAlert className="w-3.5 h-3.5 text-[#d5a45d] shrink-0" />
            <span>{collisionWarning}</span>
          </div>
        )}
      </div>

      {/* Smooth Floor Cross-Fade Transition Notification HUD */}
      {floorTransitionNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-fadeIn">
          <div className="px-4 py-2.5 rounded-xl bg-[#141b24]/95 border border-[#6ab7a8]/50 shadow-2xl backdrop-blur-md flex items-center gap-2.5">
            {floorTransitionNotice.direction === 'up' ? (
              <ArrowUp className="w-4 h-4 text-[#6ab7a8] animate-bounce" />
            ) : (
              <ArrowDown className="w-4 h-4 text-[#6ab7a8] animate-bounce" />
            )}
            <div className="text-left">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Transitioning to Level 0{floorTransitionNotice.floor}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#202730] text-[#6ab7a8]">
                  480ms Fade
                </span>
              </div>
              <div className="text-[10px] text-[#a6b0bb]">{floorTransitionNotice.text}</div>
            </div>
          </div>
        </div>
      )}

      {/* Viewport Control Bar (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
        <div className="flex bg-[#191e24]/95 p-1 rounded-lg border border-[#303943] shadow-md">
          <button
            onClick={() => handleSetMode('orbit')}
            title="Orbit 3D Inspection Mode"
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'orbit'
                ? 'bg-[#28323e] text-white font-semibold border border-[#3d4b5c]'
                : 'text-[#a6b0bb] hover:text-white hover:bg-[#202730]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#6ab7a8]" />
            Orbit
          </button>

          <button
            onClick={() => handleSetMode('first_person')}
            title="First-Person Roaming (WASD + Mouse Look)"
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'first_person'
                ? 'bg-[#28323e] text-white font-semibold border border-[#3d4b5c]'
                : 'text-[#a6b0bb] hover:text-white hover:bg-[#202730]'
            }`}
          >
            <Footprints className="w-3.5 h-3.5 text-[#6ab7a8]" />
            First-Person
          </button>

          <button
            onClick={() => handleSetMode('top_down')}
            title="Top-Down Plan View"
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'top_down'
                ? 'bg-[#28323e] text-white font-semibold border border-[#3d4b5c]'
                : 'text-[#a6b0bb] hover:text-white hover:bg-[#202730]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#6ab7a8]" />
            Plan
          </button>
        </div>

        {/* Viewport Overlays Quick Toggles */}
        <div className="flex bg-[#191e24]/95 p-1 rounded-lg border border-[#303943] shadow-md">
          <button
            onClick={onToggleObstacleBounds}
            title="Toggle Obstacle Footprints & Walls (Trust Inspector)"
            className={`p-1.5 rounded-md transition-colors ${
              showObstacleBounds
                ? 'bg-[#2f271e] text-[#d5a45d] border border-[#d5a45d]/50'
                : 'text-[#a6b0bb] hover:text-white hover:bg-[#202730]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleNavGrid}
            title="Toggle Walkable Navigation Grid Cells"
            className={`p-1.5 rounded-md transition-colors ${
              showNavGrid
                ? 'bg-[#1b2b28] text-[#6ab7a8] border border-[#6ab7a8]/50'
                : 'text-[#a6b0bb] hover:text-white hover:bg-[#202730]'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetCamera}
            title="Reset Camera View & Angle"
            className="p-1.5 rounded-md text-[#a6b0bb] hover:text-white hover:bg-[#202730] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* First-Person Guidance Banner when in FPS mode */}
      {viewMode === 'first_person' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <div className="px-4 py-2 rounded-lg bg-[#191e24]/95 border border-[#303943] shadow-lg text-center">
            <p className="text-xs font-medium text-[#f0f2f4] flex items-center justify-center gap-2">
              <Footprints className="w-4 h-4 text-[#6ab7a8]" />
              {isPointerLocked ? (
                <>
                  <span className="font-semibold text-white">Roaming Active:</span> Use{' '}
                  <kbd className="px-1.5 py-0.5 bg-[#202730] rounded border border-[#303943] text-slate-200">
                    W
                  </kbd>
                  <kbd className="px-1.5 py-0.5 bg-[#202730] rounded border border-[#303943] text-slate-200">
                    A
                  </kbd>
                  <kbd className="px-1.5 py-0.5 bg-[#202730] rounded border border-[#303943] text-slate-200">
                    S
                  </kbd>
                  <kbd className="px-1.5 py-0.5 bg-[#202730] rounded border border-[#303943] text-slate-200">
                    D
                  </kbd>{' '}
                  to walk, mouse to look. Press{' '}
                  <kbd className="px-1.5 py-0.5 bg-[#202730] rounded border border-[#303943] text-slate-200">
                    ESC
                  </kbd>{' '}
                  to unlock.
                </>
              ) : (
                <>Click viewport to lock mouse look & roam through corridors</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Floating 2D Tactical Minimap (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-auto">
        <div className="bg-[#141a24]/95 p-2 rounded-xl border border-slate-700/60 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 px-1">
            <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
              <Navigation className="w-3 h-3 text-cyan-400" />
              CAD Floorplan (Click to Teleport)
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-semibold">
              ({uiPlayerCoord.x.toFixed(1)}m, {uiPlayerCoord.z.toFixed(1)}m)
            </span>
          </div>
          <canvas
            ref={minimapCanvasRef}
            width={180}
            height={155}
            onClick={(e) => {
              const rect = minimapCanvasRef.current?.getBoundingClientRect();
              if (!rect) return;
              const clickX = e.clientX - rect.left;
              const clickY = e.clientY - rect.top;
              const w = rect.width;
              const h = rect.height;
              const worldX = ((clickX - 8) / (w - 16)) * 32 - 16;
              const worldZ = ((clickY - 8) / (h - 16)) * 28 - 14;
              const clampedX = Math.max(-14.5, Math.min(14.5, worldX));
              const clampedZ = Math.max(-12.5, Math.min(11.5, worldZ));
              stateRef.current.playerPos.x = clampedX;
              stateRef.current.playerPos.z = clampedZ;
              setUiPlayerCoord({ x: clampedX, z: clampedZ });
            }}
            title="Click anywhere on floorplan to teleport avatar"
            className="rounded-lg border border-slate-800 bg-[#0c1017] cursor-crosshair hover:border-cyan-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Route Simulation Playback Controls */}
      {activeRoute && activeRoute.success && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <div className="px-4 py-2.5 rounded-xl bg-[#191e24]/95 border border-[#303943] shadow-xl flex items-center gap-3">
            <div className="flex items-center gap-2 pr-3 border-r border-[#28323e]">
              <Navigation className="w-4 h-4 text-[#6ab7a8]" />
              <div className="text-left">
                <div className="text-xs font-semibold text-white">
                  {activeRoute.totalDistanceMeters}m Path
                </div>
                <div className="text-[10px] text-[#a6b0bb]">
                  ~{activeRoute.estimatedDurationSeconds}s walk ({activeRoute.turnCount} turns)
                </div>
              </div>
            </div>

            {/* Play/Pause Simulation */}
            <button
              onClick={() => setIsSimulatingRoute(!isSimulatingRoute)}
              className="p-2 rounded-lg bg-[#6ab7a8] hover:bg-[#5aa899] text-slate-950 font-semibold transition-transform active:scale-95 shadow flex items-center gap-1.5 text-xs"
            >
              {isSimulatingRoute ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  Pause Walk
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  Simulate Walk
                </>
              )}
            </button>

            {/* Speed Multipliers */}
            <div className="flex items-center bg-[#202730] rounded-lg p-0.5 border border-[#303943] text-xs">
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSimulationSpeed(spd)}
                  className={`px-2 py-1 rounded text-[11px] font-mono ${
                    simulationSpeed === spd
                      ? 'bg-[#28323e] text-[#6ab7a8] font-bold border border-[#303943]'
                      : 'text-[#a6b0bb] hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setIsSimulatingRoute(false);
                stateRef.current.simProgress = 0;
                if (activeRoute.path.length > 0) {
                  stateRef.current.playerPos.x = activeRoute.path[0].x;
                  stateRef.current.playerPos.z = activeRoute.path[0].z;
                  setUiPlayerCoord({ x: activeRoute.path[0].x, z: activeRoute.path[0].z });
                }
              }}
              title="Reset to start of route"
              className="p-2 rounded-lg bg-[#202730] hover:bg-[#28323e] text-[#a6b0bb] hover:text-white border border-[#303943]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
