import * as THREE from 'three';
import type { Doorway, Obstacle, POI } from '../../types/index.ts';
import type { POICluster } from '../../engine/clustering/poiClustering.ts';

/**
 * Procedural Architectural Digital Twin Builder
 * Generates an architecturally credible, human-designed 3D corporate innovation facility.
 * Features realistic proportions, premium PBR materials, baseboards, mullions,
 * glass manifestation frost bands, biophilic planters, detailed furniture, and fixtures.
 */

// Architectural PBR Materials Palette
export const MAT_BASE_FLOOR = new THREE.MeshStandardMaterial({
  color: 0x6e7885,
  roughness: 0.65,
  metalness: 0.08,
});

export const MAT_WALKWAY_SPINE = new THREE.MeshStandardMaterial({
  color: 0x8a96a4,
  roughness: 0.48,
  metalness: 0.12,
});

export const MAT_CARPET_ZONE = new THREE.MeshStandardMaterial({
  color: 0x2b3440,
  roughness: 0.92,
  metalness: 0.02,
});

export const MAT_TILE_ZONE = new THREE.MeshStandardMaterial({
  color: 0xb5bcc4,
  roughness: 0.42,
  metalness: 0.15,
});

export const MAT_BOARDROOM_FLOOR = new THREE.MeshStandardMaterial({
  color: 0x4e3321, // Smoked walnut architectural flooring
  roughness: 0.38,
  metalness: 0.05,
});

export const MAT_LAB_FLOOR = new THREE.MeshStandardMaterial({
  color: 0x36404c, // Industrial antistatic ESD floor
  roughness: 0.6,
  metalness: 0.15,
});

// Walls: Elegant architectural gallery off-white plaster with high volumetric presence
export const MAT_WALL_PLASTER = new THREE.MeshStandardMaterial({
  color: 0xd8dde4,
  roughness: 0.82,
  metalness: 0.04,
});

export const MAT_WALL_ACCENT = new THREE.MeshStandardMaterial({
  color: 0x384452, // Architectural charcoal accent feature wall
  roughness: 0.72,
  metalness: 0.08,
});

export const MAT_BASEBOARD = new THREE.MeshStandardMaterial({
  color: 0x1a212b, // Anodized dark bronze/charcoal baseboard
  roughness: 0.45,
  metalness: 0.4,
});

export const MAT_DOOR_FRAME = new THREE.MeshStandardMaterial({
  color: 0x242d38,
  roughness: 0.4,
  metalness: 0.6,
});

export const MAT_GLASS_PARTITION = new THREE.MeshPhysicalMaterial({
  color: 0xbfe4f2,
  transparent: true,
  opacity: 0.28,
  roughness: 0.08,
  transmission: 0.85,
  ior: 1.52,
  thickness: 0.05,
  depthWrite: false,
});

export const MAT_GLASS_FROST_BAND = new THREE.MeshStandardMaterial({
  color: 0xd0e2eb,
  transparent: true,
  opacity: 0.62,
  roughness: 0.6,
  depthWrite: false,
});

export const MAT_GLASS_MULLION = new THREE.MeshStandardMaterial({
  color: 0x1e252f,
  roughness: 0.35,
  metalness: 0.7,
});

export const MAT_WALNUT_WOOD = new THREE.MeshStandardMaterial({
  color: 0x5a3b25,
  roughness: 0.4,
  metalness: 0.04,
});

export const MAT_LIGHT_OAK = new THREE.MeshStandardMaterial({
  color: 0xc4b397,
  roughness: 0.55,
  metalness: 0.05,
});

export const MAT_DESK_SURFACE = new THREE.MeshStandardMaterial({
  color: 0xd3cbbe, // Scandinavian birch laminate
  roughness: 0.55,
  metalness: 0.06,
});

export const MAT_STEEL_FRAME = new THREE.MeshStandardMaterial({
  color: 0x2a333d,
  roughness: 0.35,
  metalness: 0.82,
});

export const MAT_CHAIR_FABRIC = new THREE.MeshStandardMaterial({
  color: 0x262f3a,
  roughness: 0.85,
  metalness: 0.05,
});

export const MAT_CHAIR_CHROME = new THREE.MeshStandardMaterial({
  color: 0xdde4ec,
  roughness: 0.15,
  metalness: 0.95,
});

export const MAT_SCREEN_DISPLAY = new THREE.MeshStandardMaterial({
  color: 0x0f1722,
  emissive: 0x162c42,
  emissiveIntensity: 0.35,
  roughness: 0.25,
  metalness: 0.3,
});

export const MAT_CEILING_FIXTURE = new THREE.MeshStandardMaterial({
  color: 0x252c35,
  roughness: 0.4,
  metalness: 0.7,
});

export const MAT_LIGHT_DIFFUSER = new THREE.MeshBasicMaterial({
  color: 0xfffaed,
});

export const MAT_PLANT_LEAF = new THREE.MeshStandardMaterial({
  color: 0x245e32,
  roughness: 0.55,
  metalness: 0.05,
});

export const MAT_PLANT_POT = new THREE.MeshStandardMaterial({
  color: 0xd9d3c7,
  roughness: 0.7,
  metalness: 0.05,
});

/**
 * Builds the composite architectural floor with material transitions
 */
export function createFloorMesh(width: number, length: number): THREE.Group {
  const group = new THREE.Group();

  // 1. Base honed architectural floor
  const floorGeo = new THREE.PlaneGeometry(width + 4, length + 4);
  const floorMesh = new THREE.Mesh(floorGeo, MAT_BASE_FLOOR);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // 2. Subtle architectural expansion joint grid (1.6m modular grid)
  const gridHelper = new THREE.GridHelper(Math.max(width, length) + 4, 20, 0x5a6472, 0x48525e);
  gridHelper.position.y = 0.005;
  group.add(gridHelper);

  // 3. Central Spine Corridor Walkway Flooring Transition (Terrazzo)
  const walkwayGeo = new THREE.PlaneGeometry(28, 3.4);
  const walkwayMesh = new THREE.Mesh(walkwayGeo, MAT_WALKWAY_SPINE);
  walkwayMesh.rotation.x = -Math.PI / 2;
  walkwayMesh.position.set(0, 0.008, 3.2);
  walkwayMesh.receiveShadow = true;
  group.add(walkwayMesh);

  // 4. Executive Boardroom Smoked Walnut Floor Inset
  const confCarpetGeo = new THREE.PlaneGeometry(11.2, 6.4);
  const confCarpetMesh = new THREE.Mesh(confCarpetGeo, MAT_BOARDROOM_FLOOR);
  confCarpetMesh.rotation.x = -Math.PI / 2;
  confCarpetMesh.position.set(8.5, 0.009, -1.2);
  confCarpetMesh.receiveShadow = true;
  group.add(confCarpetMesh);

  // 5. Open Workstation Bay Charcoal Carpet Inset
  const workCarpetGeo = new THREE.PlaneGeometry(10.8, 6.8);
  const workCarpetMesh = new THREE.Mesh(workCarpetGeo, MAT_CARPET_ZONE);
  workCarpetMesh.rotation.x = -Math.PI / 2;
  workCarpetMesh.position.set(8.5, 0.009, 8.5);
  workCarpetMesh.receiveShadow = true;
  group.add(workCarpetMesh);

  // 6. Pantry & Cafeteria Honed Quartz Tile Inset
  const pantryTileGeo = new THREE.PlaneGeometry(7.8, 8.8);
  const pantryTileMesh = new THREE.Mesh(pantryTileGeo, MAT_TILE_ZONE);
  pantryTileMesh.rotation.x = -Math.PI / 2;
  pantryTileMesh.position.set(-10.5, 0.009, -8.5);
  pantryTileMesh.receiveShadow = true;
  group.add(pantryTileMesh);

  // 7. Prototype Hardware Lab ESD Floor
  const labTileGeo = new THREE.PlaneGeometry(7.8, 6.2);
  const labTileMesh = new THREE.Mesh(labTileGeo, MAT_LAB_FLOOR);
  labTileMesh.rotation.x = -Math.PI / 2;
  labTileMesh.position.set(-10.5, 0.009, -1.0);
  labTileMesh.receiveShadow = true;
  group.add(labTileMesh);

  // 8. Meeting Room A Tile Inset
  const meetTileGeo = new THREE.PlaneGeometry(5.8, 6.8);
  const meetTileMesh = new THREE.Mesh(meetTileGeo, MAT_CARPET_ZONE);
  meetTileMesh.rotation.x = -Math.PI / 2;
  meetTileMesh.position.set(-1.0, 0.009, 8.5);
  meetTileMesh.receiveShadow = true;
  group.add(meetTileMesh);

  return group;
}

/**
 * Builds realistic architectural walls with baseboards, cornices, and glass mullions
 */
export function createWallMesh(obstacle: Obstacle): THREE.Group {
  const group = new THREE.Group();
  const width = Math.max(0.2, obstacle.bounds.maxX - obstacle.bounds.minX);
  const depth = Math.max(0.2, obstacle.bounds.maxZ - obstacle.bounds.minZ);
  const height = obstacle.height;

  const centerX = (obstacle.bounds.minX + obstacle.bounds.maxX) / 2;
  const centerZ = (obstacle.bounds.minZ + obstacle.bounds.maxZ) / 2;
  const isGlass = obstacle.type === 'glass_partition';

  if (isGlass) {
    // Glass Partition with Top & Bottom Dark Anodized Aluminum Mullions
    const glassThickness = 0.04;
    const isNorthSouth = depth > width;
    const glassW = isNorthSouth ? glassThickness : width;
    const glassD = isNorthSouth ? depth : glassThickness;

    // Glass Pane
    const glassGeo = new THREE.BoxGeometry(glassW, height - 0.16, glassD);
    const glassMesh = new THREE.Mesh(glassGeo, MAT_GLASS_PARTITION);
    glassMesh.position.set(centerX, height / 2, centerZ);
    group.add(glassMesh);

    // Architectural Frosted Privacy Band (1.2m - 1.5m height manifestation)
    const frostBandHeight = 0.32;
    const frostGeo = new THREE.BoxGeometry(
      isNorthSouth ? glassThickness + 0.002 : width - 0.02,
      frostBandHeight,
      isNorthSouth ? depth - 0.02 : glassThickness + 0.002
    );
    const frostMesh = new THREE.Mesh(frostGeo, MAT_GLASS_FROST_BAND);
    frostMesh.position.set(centerX, 1.35, centerZ);
    group.add(frostMesh);

    // Floor Base Mullion Channel
    const baseMullionGeo = new THREE.BoxGeometry(
      isNorthSouth ? 0.08 : width,
      0.08,
      isNorthSouth ? depth : 0.08
    );
    const baseMullion = new THREE.Mesh(baseMullionGeo, MAT_GLASS_MULLION);
    baseMullion.position.set(centerX, 0.04, centerZ);
    group.add(baseMullion);

    // Ceiling Top Mullion Channel
    const topMullion = new THREE.Mesh(baseMullionGeo, MAT_GLASS_MULLION);
    topMullion.position.set(centerX, height - 0.04, centerZ);
    group.add(topMullion);

    // Vertical intermediate mullion divide
    if (Math.max(width, depth) > 2.5) {
      const vertMullionGeo = new THREE.BoxGeometry(
        isNorthSouth ? 0.07 : 0.06,
        height,
        isNorthSouth ? 0.06 : 0.07
      );
      const vertMullion = new THREE.Mesh(vertMullionGeo, MAT_GLASS_MULLION);
      vertMullion.position.set(centerX, height / 2, centerZ);
      group.add(vertMullion);
    }
  } else {
    // Solid Architectural Wall (Gallery off-white plaster)
    const wallGeo = new THREE.BoxGeometry(width, height, depth);
    const wallMesh = new THREE.Mesh(wallGeo, MAT_WALL_PLASTER);
    wallMesh.position.set(centerX, height / 2, centerZ);
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    group.add(wallMesh);

    // Architectural Skirting / Baseboard (120mm height)
    const baseboardHeight = 0.12;
    const baseboardTrim = 0.025;
    const baseboardGeo = new THREE.BoxGeometry(
      width + (width > depth ? 0 : baseboardTrim),
      baseboardHeight,
      depth + (depth > width ? 0 : baseboardTrim)
    );
    const baseboardMesh = new THREE.Mesh(baseboardGeo, MAT_BASEBOARD);
    baseboardMesh.position.set(centerX, baseboardHeight / 2, centerZ);
    group.add(baseboardMesh);

    // Clean top architectural shadow reveals / capping
    const topRevealGeo = new THREE.BoxGeometry(width + 0.01, 0.04, depth + 0.01);
    const topRevealMesh = new THREE.Mesh(topRevealGeo, MAT_WALL_ACCENT);
    topRevealMesh.position.set(centerX, height - 0.02, centerZ);
    group.add(topRevealMesh);
  }

  return group;
}

/**
 * Builds realistic composite furniture assemblies (3-14 parts per group)
 */
export function createFurnitureGroup(obstacle: Obstacle): THREE.Group {
  const group = new THREE.Group();
  const width = obstacle.bounds.maxX - obstacle.bounds.minX;
  const depth = obstacle.bounds.maxZ - obstacle.bounds.minZ;
  const height = obstacle.height;
  const centerX = (obstacle.bounds.minX + obstacle.bounds.maxX) / 2;
  const centerZ = (obstacle.bounds.minZ + obstacle.bounds.maxZ) / 2;

  if (obstacle.id.includes('boardroom')) {
    // 1. Executive Boardroom Hardwood Table
    const topThickness = 0.08;
    const tableTopGeo = new THREE.BoxGeometry(width, topThickness, depth);
    const tableTop = new THREE.Mesh(tableTopGeo, MAT_WALNUT_WOOD);
    tableTop.position.set(centerX, height - topThickness / 2, centerZ);
    tableTop.castShadow = true;
    group.add(tableTop);

    // Chamfered underside bevel
    const chamferTrimGeo = new THREE.BoxGeometry(width - 0.08, 0.02, depth - 0.08);
    const chamferTrim = new THREE.Mesh(chamferTrimGeo, MAT_STEEL_FRAME);
    chamferTrim.position.set(centerX, height - topThickness - 0.01, centerZ);
    group.add(chamferTrim);

    // Dual architectural slab pedestal legs
    const legWidth = 0.22;
    const legDepth = depth * 0.7;
    const legHeight = height - topThickness;
    const legGeo = new THREE.BoxGeometry(legWidth, legHeight, legDepth);

    const leg1 = new THREE.Mesh(legGeo, MAT_STEEL_FRAME);
    leg1.position.set(centerX - width * 0.32, legHeight / 2, centerZ);
    leg1.castShadow = true;
    group.add(leg1);

    const leg2 = new THREE.Mesh(legGeo, MAT_STEEL_FRAME);
    leg2.position.set(centerX + width * 0.32, legHeight / 2, centerZ);
    leg2.castShadow = true;
    group.add(leg2);

    // Tabletop embedded power/data conference pop-up boxes
    const boxGeo = new THREE.BoxGeometry(0.5, 0.01, 0.22);
    const box1 = new THREE.Mesh(boxGeo, MAT_STEEL_FRAME);
    box1.position.set(centerX - 1.4, height + 0.005, centerZ);
    group.add(box1);

    const box2 = new THREE.Mesh(boxGeo, MAT_STEEL_FRAME);
    box2.position.set(centerX + 1.4, height + 0.005, centerZ);
    group.add(box2);

    // 8 Executive Conference Chairs around table
    const chairCount = 4;
    for (let i = 0; i < chairCount; i++) {
      const offsetX = centerX - width * 0.35 + (i / (chairCount - 1)) * (width * 0.7);

      // North side chair
      const chairNorth = createOfficeChairGroup(offsetX, centerZ - depth / 2 - 0.42, 0);
      group.add(chairNorth);

      // South side chair
      const chairSouth = createOfficeChairGroup(offsetX, centerZ + depth / 2 + 0.42, Math.PI);
      group.add(chairSouth);
    }

    // Wall-mounted 98" 4K Video Telepresence Display
    const tvGeo = new THREE.BoxGeometry(2.4, 1.35, 0.06);
    const tvMesh = new THREE.Mesh(tvGeo, MAT_SCREEN_DISPLAY);
    tvMesh.position.set(centerX + width / 2 + 0.8, 1.85, centerZ);
    tvMesh.rotation.y = -Math.PI / 2;
    group.add(tvMesh);

    // Telepresence Soundbar / Camera Bar
    const soundbarGeo = new THREE.BoxGeometry(1.2, 0.08, 0.08);
    const soundbarMesh = new THREE.Mesh(soundbarGeo, MAT_STEEL_FRAME);
    soundbarMesh.position.set(centerX + width / 2 + 0.8, 1.1, centerZ);
    soundbarMesh.rotation.y = -Math.PI / 2;
    group.add(soundbarMesh);

    // Suspended Linear Architectural Pendant Light
    const pendant = createLinearPendantFixture(centerX, 2.5, centerZ, width * 0.8);
    group.add(pendant);

  } else if (obstacle.id.includes('reception-desk')) {
    // 2. Quartz & Fluted Walnut Reception Counter
    const deskGeo = new THREE.BoxGeometry(width, height, depth);
    const deskMesh = new THREE.Mesh(deskGeo, MAT_DESK_SURFACE);
    deskMesh.position.set(centerX, height / 2, centerZ);
    deskMesh.castShadow = true;
    group.add(deskMesh);

    // Raised transaction counter ledge on visitor side
    const ledgeGeo = new THREE.BoxGeometry(width + 0.12, 0.06, 0.38);
    const ledge = new THREE.Mesh(ledgeGeo, MAT_WALNUT_WOOD);
    ledge.position.set(centerX, height + 0.03, centerZ - depth / 2 + 0.19);
    ledge.castShadow = true;
    group.add(ledge);

    // Warm recessed floor kick-plate wash
    const kickGeo = new THREE.BoxGeometry(width - 0.1, 0.04, 0.02);
    const kickMat = new THREE.MeshBasicMaterial({ color: 0xe6b87d });
    const kickMesh = new THREE.Mesh(kickGeo, kickMat);
    kickMesh.position.set(centerX, 0.03, centerZ - depth / 2 - 0.01);
    group.add(kickMesh);

    // Countertop check-in tablet terminal
    const tabletGeo = new THREE.BoxGeometry(0.28, 0.2, 0.02);
    const tablet = new THREE.Mesh(tabletGeo, MAT_SCREEN_DISPLAY);
    tablet.position.set(centerX - 0.6, height + 0.18, centerZ - 0.1);
    tablet.rotation.x = -0.35;
    group.add(tablet);

    // Receptionist ergonomic chair
    const recChair = createOfficeChairGroup(centerX, centerZ + 0.5, 0);
    group.add(recChair);

    // Biophilic Planter next to reception
    const plant = createBiophilicPlanter(centerX - width / 2 - 0.65, centerZ);
    group.add(plant);

  } else if (obstacle.id.includes('desks-row')) {
    // 3. Open Workstation Sit-Stand Desk Pods with Dual Monitors
    const tableTopGeo = new THREE.BoxGeometry(width, 0.05, depth);
    const tableTop = new THREE.Mesh(tableTopGeo, MAT_DESK_SURFACE);
    tableTop.position.set(centerX, height - 0.025, centerZ);
    tableTop.castShadow = true;
    group.add(tableTop);

    // Steel leg frame under desks
    const legGeo = new THREE.BoxGeometry(0.08, height - 0.05, depth * 0.8);
    const legL = new THREE.Mesh(legGeo, MAT_STEEL_FRAME);
    legL.position.set(centerX - width / 2 + 0.15, (height - 0.05) / 2, centerZ);
    group.add(legL);

    const legR = new THREE.Mesh(legGeo, MAT_STEEL_FRAME);
    legR.position.set(centerX + width / 2 - 0.15, (height - 0.05) / 2, centerZ);
    group.add(legR);

    // Central acoustic felt divider screen (heather slate/sage)
    const dividerGeo = new THREE.BoxGeometry(width * 0.95, 0.42, 0.04);
    const dividerMat = new THREE.MeshStandardMaterial({ color: 0x485868, roughness: 0.9 });
    const divider = new THREE.Mesh(dividerGeo, dividerMat);
    divider.position.set(centerX, height + 0.21, centerZ);
    group.add(divider);

    // 4 Dual Monitor Setups & Task Chairs
    const workstationCount = 3;
    for (let i = 0; i < workstationCount; i++) {
      const deskX = centerX - width * 0.35 + (i / (workstationCount - 1)) * (width * 0.7);

      // South-facing monitors & chairs
      const mon1 = createDualMonitorGroup(deskX, height, centerZ + 0.28, 0);
      group.add(mon1);
      const chair1 = createOfficeChairGroup(deskX, centerZ + depth / 2 + 0.45, Math.PI);
      group.add(chair1);

      // North-facing monitors & chairs
      const mon2 = createDualMonitorGroup(deskX, height, centerZ - 0.28, Math.PI);
      group.add(mon2);
      const chair2 = createOfficeChairGroup(deskX, centerZ - depth / 2 - 0.45, 0);
      group.add(chair2);
    }

    // Suspended overhead linear fixture
    const workPendant = createLinearPendantFixture(centerX, 2.4, centerZ, width * 0.85);
    group.add(workPendant);

  } else if (obstacle.id.includes('server-racks')) {
    // 4. Data Center Server Racks with realistic perforated glass & indicators
    const rackGeo = new THREE.BoxGeometry(width, height, depth);
    const rackMat = new THREE.MeshStandardMaterial({
      color: 0x161c24,
      roughness: 0.42,
      metalness: 0.78,
    });
    const rackMesh = new THREE.Mesh(rackGeo, rackMat);
    rackMesh.position.set(centerX, height / 2, centerZ);
    rackMesh.castShadow = true;
    group.add(rackMesh);

    // Perforated vented front door panel
    const doorFrameGeo = new THREE.BoxGeometry(width - 0.06, height - 0.1, 0.02);
    const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x27313d, roughness: 0.45 });
    const doorFrame = new THREE.Mesh(doorFrameGeo, doorFrameMat);
    doorFrame.position.set(centerX, height / 2, centerZ + depth / 2 + 0.01);
    group.add(doorFrame);

    // Server unit horizontal tray slots
    for (let u = 0; u < 8; u++) {
      const trayGeo = new THREE.BoxGeometry(width - 0.12, 0.015, 0.01);
      const trayMesh = new THREE.Mesh(trayGeo, MAT_STEEL_FRAME);
      trayMesh.position.set(centerX, 0.25 + u * 0.26, centerZ + depth / 2 + 0.02);
      group.add(trayMesh);
    }

    // Calm status LED clusters
    const ledGeo = new THREE.BoxGeometry(0.04, 0.02, 0.01);
    const ledGreenMat = new THREE.MeshBasicMaterial({ color: 0x48e588 });
    const ledBlueMat = new THREE.MeshBasicMaterial({ color: 0x58b6ff });

    for (let r = 0; r < 5; r++) {
      const ledY = height * 0.25 + r * 0.32;
      const ledG = new THREE.Mesh(ledGeo, ledGreenMat);
      ledG.position.set(centerX - 0.38, ledY, centerZ + depth / 2 + 0.025);
      group.add(ledG);

      const ledB = new THREE.Mesh(ledGeo, ledBlueMat);
      ledB.position.set(centerX + 0.38, ledY, centerZ + depth / 2 + 0.025);
      group.add(ledB);
    }

  } else if (obstacle.id.includes('lab-bench')) {
    // 5. Heavy-Duty Prototype Lab Workbench
    const benchTopGeo = new THREE.BoxGeometry(width, 0.08, depth);
    const benchTopMat = new THREE.MeshStandardMaterial({ color: 0x7a5b3a, roughness: 0.5 }); // Maple butcher block
    const benchTop = new THREE.Mesh(benchTopGeo, benchTopMat);
    benchTop.position.set(centerX, height - 0.04, centerZ);
    benchTop.castShadow = true;
    group.add(benchTop);

    // Steel leg frame
    const legGeo = new THREE.BoxGeometry(0.1, height - 0.08, 0.1);
    const l1 = new THREE.Mesh(legGeo, MAT_STEEL_FRAME);
    l1.position.set(centerX - width / 2 + 0.12, (height - 0.08) / 2, centerZ - depth / 2 + 0.12);
    group.add(l1);

    const l2 = new THREE.Mesh(legGeo, MAT_STEEL_FRAME);
    l2.position.set(centerX + width / 2 - 0.12, (height - 0.08) / 2, centerZ - depth / 2 + 0.12);
    group.add(l2);

    // Electronics oscilloscope test instrument
    const scopeGeo = new THREE.BoxGeometry(0.48, 0.24, 0.32);
    const scopeMat = new THREE.MeshStandardMaterial({ color: 0x2e3640, roughness: 0.4 });
    const scope = new THREE.Mesh(scopeGeo, scopeMat);
    scope.position.set(centerX - 1.2, height + 0.12, centerZ);
    group.add(scope);

    // Oscilloscope digital waveform screen
    const waveGeo = new THREE.PlaneGeometry(0.28, 0.16);
    const waveMat = new THREE.MeshBasicMaterial({ color: 0x39d98a });
    const wave = new THREE.Mesh(waveGeo, waveMat);
    wave.position.set(centerX - 1.2, height + 0.12, centerZ + 0.161);
    group.add(wave);

    // Desktop 3D Printer Unit
    const printerGeo = new THREE.BoxGeometry(0.45, 0.5, 0.45);
    const printerMat = new THREE.MeshStandardMaterial({ color: 0x1d242c, roughness: 0.35, metalness: 0.6 });
    const printer = new THREE.Mesh(printerGeo, printerMat);
    printer.position.set(centerX + 1.2, height + 0.25, centerZ);
    group.add(printer);

  } else if (obstacle.id.includes('pantry-counter')) {
    // 6. Pantry Espresso Bar & Kitchen Counter
    const counterGeo = new THREE.BoxGeometry(width, height, depth);
    const counterMat = new THREE.MeshStandardMaterial({ color: 0x252e38, roughness: 0.65 });
    const counterMesh = new THREE.Mesh(counterGeo, counterMat);
    counterMesh.position.set(centerX, height / 2, centerZ);
    counterMesh.castShadow = true;
    group.add(counterMesh);

    // Stone Countertop slab (Calacatta quartz)
    const stoneTopGeo = new THREE.BoxGeometry(width + 0.08, 0.05, depth + 0.08);
    const stoneTopMat = new THREE.MeshStandardMaterial({ color: 0xdde2e6, roughness: 0.25 });
    const stoneTop = new THREE.Mesh(stoneTopGeo, stoneTopMat);
    stoneTop.position.set(centerX, height + 0.025, centerZ);
    stoneTop.castShadow = true;
    group.add(stoneTop);

    // Commercial Espresso Coffee Machine (Stainless steel)
    const espressoGeo = new THREE.BoxGeometry(0.68, 0.44, 0.48);
    const espressoMat = new THREE.MeshStandardMaterial({ color: 0x98a2ad, metalness: 0.9, roughness: 0.15 });
    const espresso = new THREE.Mesh(espressoGeo, espressoMat);
    espresso.position.set(centerX - 1.1, height + 0.27, centerZ);
    group.add(espresso);

    // Dual Portafilters
    const pfGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.14, 8);
    const pfMat = new THREE.MeshStandardMaterial({ color: 0x1a212b, roughness: 0.3 });
    const pf1 = new THREE.Mesh(pfGeo, pfMat);
    pf1.rotation.x = Math.PI / 2;
    pf1.position.set(centerX - 1.2, height + 0.2, centerZ + 0.28);
    group.add(pf1);

    const pf2 = new THREE.Mesh(pfGeo, pfMat);
    pf2.rotation.x = Math.PI / 2;
    pf2.position.set(centerX - 1.0, height + 0.2, centerZ + 0.28);
    group.add(pf2);

    // 2 Bar Stools with steel footrests
    const stool1 = createBarStoolGroup(centerX + 0.8, centerZ + depth / 2 + 0.45);
    group.add(stool1);
    const stool2 = createBarStoolGroup(centerX + 1.8, centerZ + depth / 2 + 0.45);
    group.add(stool2);

  } else {
    // General Furniture Table/Bench
    const tableGeo = new THREE.BoxGeometry(width, height, depth);
    const tableMat = new THREE.MeshStandardMaterial({
      color: obstacle.color ? parseInt(obstacle.color.replace('#', '0x'), 16) : 0x3a4654,
      roughness: 0.55,
      metalness: 0.2,
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.set(centerX, height / 2, centerZ);
    tableMesh.castShadow = true;
    tableMesh.receiveShadow = true;
    group.add(tableMesh);
  }

  return group;
}

/**
 * Creates an ergonomic office task chair assembly
 */
function createOfficeChairGroup(x: number, z: number, rotationY: number): THREE.Group {
  const chair = new THREE.Group();
  chair.position.set(x, 0, z);
  chair.rotation.y = rotationY;

  // Seat cushion
  const seatGeo = new THREE.BoxGeometry(0.46, 0.06, 0.46);
  const seat = new THREE.Mesh(seatGeo, MAT_CHAIR_FABRIC);
  seat.position.y = 0.46;
  chair.add(seat);

  // Mesh Backrest
  const backGeo = new THREE.BoxGeometry(0.44, 0.46, 0.04);
  const back = new THREE.Mesh(backGeo, MAT_CHAIR_FABRIC);
  back.position.set(0, 0.74, -0.21);
  chair.add(back);

  // Ergonomic Headrest
  const headrestGeo = new THREE.BoxGeometry(0.24, 0.12, 0.03);
  const headrest = new THREE.Mesh(headrestGeo, MAT_CHAIR_FABRIC);
  headrest.position.set(0, 1.02, -0.22);
  chair.add(headrest);

  // Cantilever Armrests
  const armGeo = new THREE.BoxGeometry(0.06, 0.18, 0.26);
  const armL = new THREE.Mesh(armGeo, MAT_STEEL_FRAME);
  armL.position.set(-0.25, 0.6, 0);
  chair.add(armL);

  const armR = new THREE.Mesh(armGeo, MAT_STEEL_FRAME);
  armR.position.set(0.25, 0.6, 0);
  chair.add(armR);

  // Center support piston & 5-star chrome base
  const pistonGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8);
  const piston = new THREE.Mesh(pistonGeo, MAT_CHAIR_CHROME);
  piston.position.y = 0.22;
  chair.add(piston);

  const starBaseGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.04, 5);
  const starBase = new THREE.Mesh(starBaseGeo, MAT_CHAIR_CHROME);
  starBase.position.y = 0.04;
  chair.add(starBase);

  return chair;
}

/**
 * Creates a dual monitor desktop setup
 */
function createDualMonitorGroup(x: number, tableY: number, z: number, rotationY: number): THREE.Group {
  const monitors = new THREE.Group();
  monitors.position.set(x, tableY, z);
  monitors.rotation.y = rotationY;

  // Dual displays (27-inch bezelless) angled inward by 12 degrees
  const screenGeo = new THREE.BoxGeometry(0.54, 0.32, 0.02);

  const leftMon = new THREE.Mesh(screenGeo, MAT_SCREEN_DISPLAY);
  leftMon.position.set(-0.28, 0.26, 0);
  leftMon.rotation.y = 0.2;
  monitors.add(leftMon);

  const rightMon = new THREE.Mesh(screenGeo, MAT_SCREEN_DISPLAY);
  rightMon.position.set(0.28, 0.26, 0);
  rightMon.rotation.y = -0.2;
  monitors.add(rightMon);

  // Articulating monitor arm stand
  const standGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.26, 8);
  const stand = new THREE.Mesh(standGeo, MAT_STEEL_FRAME);
  stand.position.set(0, 0.13, -0.06);
  monitors.add(stand);

  // Low-profile keyboard & mousepad
  const kbGeo = new THREE.BoxGeometry(0.38, 0.01, 0.13);
  const kbMesh = new THREE.Mesh(kbGeo, MAT_STEEL_FRAME);
  kbMesh.position.set(0, 0.005, 0.24);
  monitors.add(kbMesh);

  return monitors;
}

/**
 * Creates an architectural bar stool
 */
function createBarStoolGroup(x: number, z: number): THREE.Group {
  const stool = new THREE.Group();
  stool.position.set(x, 0, z);

  const seatGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.05, 16);
  const seatMesh = new THREE.Mesh(seatGeo, MAT_WALNUT_WOOD);
  seatMesh.position.y = 0.72;
  stool.add(seatMesh);

  const columnGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8);
  const column = new THREE.Mesh(columnGeo, MAT_STEEL_FRAME);
  column.position.y = 0.35;
  stool.add(column);

  const baseGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.03, 16);
  const base = new THREE.Mesh(baseGeo, MAT_STEEL_FRAME);
  base.position.y = 0.02;
  stool.add(base);

  return stool;
}

/**
 * Creates an architectural biophilic planter pot with lush greenery
 */
export function createBiophilicPlanter(x: number, z: number): THREE.Group {
  const planter = new THREE.Group();
  planter.position.set(x, 0, z);

  // Fluted ceramic planter pot
  const potGeo = new THREE.CylinderGeometry(0.3, 0.24, 0.65, 16);
  const pot = new THREE.Mesh(potGeo, MAT_PLANT_POT);
  pot.position.y = 0.325;
  pot.castShadow = true;
  planter.add(pot);

  // Dark soil
  const soilGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.04, 16);
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x221a14, roughness: 0.9 });
  const soil = new THREE.Mesh(soilGeo, soilMat);
  soil.position.y = 0.64;
  planter.add(soil);

  // Organic foliage clusters (Fiddle leaf fig / snake plant)
  const leafCount = 7;
  for (let i = 0; i < leafCount; i++) {
    const angle = (i / leafCount) * Math.PI * 2;
    const leafGeo = new THREE.SphereGeometry(0.18, 6, 6);
    leafGeo.scale(0.8, 1.8, 0.3);
    const leaf = new THREE.Mesh(leafGeo, MAT_PLANT_LEAF);
    leaf.position.set(
      Math.cos(angle) * 0.16,
      0.95 + (i % 3) * 0.15,
      Math.sin(angle) * 0.16
    );
    leaf.rotation.set(0.3 * Math.sin(angle), angle, 0.3 * Math.cos(angle));
    leaf.castShadow = true;
    planter.add(leaf);
  }

  return planter;
}

/**
 * Creates suspended linear architectural LED pendant lighting
 */
function createLinearPendantFixture(x: number, y: number, z: number, length: number): THREE.Group {
  const fixture = new THREE.Group();
  fixture.position.set(x, y, z);

  // Extruded aluminum profile
  const barGeo = new THREE.BoxGeometry(length, 0.05, 0.08);
  const bar = new THREE.Mesh(barGeo, MAT_CEILING_FIXTURE);
  fixture.add(bar);

  // Underside opal diffuser lens (glows soft warm white)
  const lensGeo = new THREE.BoxGeometry(length - 0.04, 0.01, 0.06);
  const lens = new THREE.Mesh(lensGeo, MAT_LIGHT_DIFFUSER);
  lens.position.y = -0.025;
  fixture.add(lens);

  // Two thin steel aircraft suspension cables
  const cableGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.8, 4);
  const cableMat = new THREE.MeshBasicMaterial({ color: 0x8899aa });

  const c1 = new THREE.Mesh(cableGeo, cableMat);
  c1.position.set(-length * 0.4, 0.4, 0);
  fixture.add(c1);

  const c2 = new THREE.Mesh(cableGeo, cableMat);
  c2.position.set(length * 0.4, 0.4, 0);
  fixture.add(c2);

  return fixture;
}

/**
 * Builds realistic architectural doorframes with jambs, header lintel, and threshold
 */
export function createDoorwayPortal(door: Doorway): THREE.Group {
  const group = new THREE.Group();
  const frameHeight = 2.3;
  const frameWidth = door.width;
  const jambWidth = 0.09;
  const wallDepth = 0.22;

  // Doorway header lintel
  const lintelGeo = new THREE.BoxGeometry(frameWidth + jambWidth * 2, jambWidth, wallDepth);
  const lintel = new THREE.Mesh(lintelGeo, MAT_DOOR_FRAME);
  lintel.position.set(door.position.x, frameHeight + jambWidth / 2, door.position.z);
  group.add(lintel);

  // Left jamb
  const jambGeo = new THREE.BoxGeometry(jambWidth, frameHeight, wallDepth);
  const leftJamb = new THREE.Mesh(jambGeo, MAT_DOOR_FRAME);
  leftJamb.position.set(door.position.x - frameWidth / 2 - jambWidth / 2, frameHeight / 2, door.position.z);
  group.add(leftJamb);

  // Right jamb
  const rightJamb = new THREE.Mesh(jambGeo, MAT_DOOR_FRAME);
  rightJamb.position.set(door.position.x + frameWidth / 2 + jambWidth / 2, frameHeight / 2, door.position.z);
  group.add(rightJamb);

  // Architectural floor threshold transition plate (brushed dark steel)
  const threshGeo = new THREE.BoxGeometry(frameWidth, 0.008, 0.28);
  const threshMesh = new THREE.Mesh(threshGeo, MAT_BASEBOARD);
  threshMesh.position.set(door.position.x, 0.01, door.position.z);
  group.add(threshMesh);

  // Clean room signage plaque mounted adjacent to doorway at eye level (1.5m)
  const plaqueGeo = new THREE.BoxGeometry(0.24, 0.12, 0.02);
  const plaqueMat = new THREE.MeshStandardMaterial({
    color: 0x1a212a,
    roughness: 0.35,
    metalness: 0.7,
  });
  const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
  plaque.position.set(door.position.x + frameWidth / 2 + 0.25, 1.5, door.position.z);
  group.add(plaque);

  return group;
}

/**
 * Creates restrained architectural POI spatial markers (not glowing neon blobs)
 */
export function createPOIPinMesh(poi: POI, isSelected: boolean): THREE.Group {
  const group = new THREE.Group();
  group.position.set(poi.position.x, poi.position.y, poi.position.z);

  const baseColor = isSelected ? 0xd97736 : getArchitecturalCategoryColorHex(poi.category);

  // Precision ground coordinate disc
  const discGeo = new THREE.RingGeometry(0.24, 0.32, 28);
  const discMat = new THREE.MeshBasicMaterial({
    color: baseColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: isSelected ? 0.95 : 0.65,
  });
  const discMesh = new THREE.Mesh(discGeo, discMat);
  discMesh.rotation.x = -Math.PI / 2;
  discMesh.position.y = 0.015;
  group.add(discMesh);

  // Slim architectural stem
  const stemHeight = isSelected ? 1.6 : 1.2;
  const stemGeo = new THREE.CylinderGeometry(0.008, 0.008, stemHeight, 8);
  const stemMat = new THREE.MeshBasicMaterial({
    color: baseColor,
    transparent: true,
    opacity: 0.7,
  });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = stemHeight / 2;
  group.add(stem);

  // Precision faceted diamond beacon
  const headGeo = isSelected
    ? new THREE.OctahedronGeometry(0.15, 0)
    : new THREE.OctahedronGeometry(0.1, 0);
  const headMat = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.25,
    metalness: 0.65,
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = stemHeight;
  group.add(head);

  return group;
}

function getArchitecturalCategoryColorHex(cat: string): number {
  switch (cat) {
    case 'conference':
      return 0x2563eb; // Royal blue
    case 'meeting':
      return 0x0284c7; // Sky blue
    case 'workspace':
      return 0x059669; // Emerald green
    case 'lab':
      return 0xd97706; // Amber gold
    case 'pantry':
      return 0xe11d48; // Berry red
    case 'infrastructure':
      return 0x475569; // Slate gray
    case 'emergency':
      return 0xdc2626; // High-vis red
    case 'reception':
      return 0x0891b2; // Cyan teal
    default:
      return 0x64748b;
  }
}

/**
 * Generates a dynamic 2D canvas texture for a POI Cluster badge displaying item count
 */
const clusterTextureCache = new Map<string, THREE.CanvasTexture>();

function getClusterBadgeTexture(count: number, hexColor: number, isSelected: boolean): THREE.CanvasTexture {
  const cacheKey = `${count}_${hexColor}_${isSelected}`;
  if (clusterTextureCache.has(cacheKey)) {
    return clusterTextureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const hexStr = `#${hexColor.toString(16).padStart(6, '0')}`;
    
    // Outer halo glow
    ctx.shadowColor = isSelected ? '#ffffff' : hexStr;
    ctx.shadowBlur = isSelected ? 16 : 8;

    // Solid badge circular backdrop
    ctx.fillStyle = hexStr;
    ctx.beginPath();
    ctx.arc(64, 64, 48, 0, Math.PI * 2);
    ctx.fill();

    // Crisp high-contrast border
    ctx.lineWidth = isSelected ? 7 : 5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Reset shadow for crisp text
    ctx.shadowBlur = 0;

    // Count number text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${count}`, 64, 66);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  clusterTextureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates an architectural POI Cluster 3D Marker for zoomed-out viewpoints.
 * Groups nearby destinations into a unified, non-cluttering landmark beacon
 * with count badge and ground target rings.
 */
export function createPOIClusterMesh(cluster: POICluster, isSelected: boolean): THREE.Group {
  const group = new THREE.Group();
  group.position.set(cluster.center.x, cluster.center.y, cluster.center.z);

  const baseColor = isSelected ? 0xd97736 : getArchitecturalCategoryColorHex(cluster.dominantCategory);

  // 1. Concentric ground footprint target rings
  const outerDiscGeo = new THREE.RingGeometry(0.55, 0.68, 32);
  const outerDiscMat = new THREE.MeshBasicMaterial({
    color: baseColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: isSelected ? 0.9 : 0.6,
  });
  const outerDisc = new THREE.Mesh(outerDiscGeo, outerDiscMat);
  outerDisc.rotation.x = -Math.PI / 2;
  outerDisc.position.y = 0.02;
  group.add(outerDisc);

  const innerDiscGeo = new THREE.RingGeometry(0.28, 0.42, 32);
  const innerDiscMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.35,
  });
  const innerDisc = new THREE.Mesh(innerDiscGeo, innerDiscMat);
  innerDisc.rotation.x = -Math.PI / 2;
  innerDisc.position.y = 0.022;
  group.add(innerDisc);

  // 2. High-precision cluster stem pillar
  const stemHeight = isSelected ? 1.85 : 1.5;
  const stemGeo = new THREE.CylinderGeometry(0.018, 0.032, stemHeight, 12);
  const stemMat = new THREE.MeshStandardMaterial({
    color: baseColor,
    metalness: 0.8,
    roughness: 0.25,
  });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = stemHeight / 2;
  group.add(stem);

  // 3. Floating Count Badge Sprite (faces camera automatically)
  const badgeTexture = getClusterBadgeTexture(cluster.count, baseColor, isSelected);
  const spriteMat = new THREE.SpriteMaterial({
    map: badgeTexture,
    depthTest: false,
    transparent: true,
  });
  const sprite = new THREE.Sprite(spriteMat);
  const badgeScale = isSelected ? 0.95 : 0.82;
  sprite.scale.set(badgeScale, badgeScale, 1);
  sprite.position.y = stemHeight + 0.35;
  group.add(sprite);

  // 4. Crown beacon ring
  const crownGeo = new THREE.TorusGeometry(0.22, 0.025, 8, 24);
  const crownMat = new THREE.MeshStandardMaterial({
    color: baseColor,
    metalness: 0.6,
    roughness: 0.3,
  });
  const crown = new THREE.Mesh(crownGeo, crownMat);
  crown.rotation.x = Math.PI / 2;
  crown.position.y = stemHeight;
  group.add(crown);

  // Tag group metadata for interaction
  group.userData = {
    isCluster: true,
    cluster,
    clusterId: cluster.id,
    poiId: cluster.primaryPoi.id,
    poiIds: cluster.pois.map((p) => p.id),
    center: cluster.center,
  };

  // Also tag children so raycaster hits propagate upward
  for (const child of group.children) {
    child.userData = group.userData;
  }

  return group;
}

