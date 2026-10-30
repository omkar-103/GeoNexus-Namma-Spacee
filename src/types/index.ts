/**
 * Core type definitions for Namma Space
 * Intelligent Indoor Digital Twin & Spatial Navigation Platform
 */

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface BoundingBox2D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export type POICategory =
  | 'reception'
  | 'workspace'
  | 'meeting'
  | 'conference'
  | 'lab'
  | 'infrastructure'
  | 'pantry'
  | 'restroom'
  | 'emergency'
  | 'transit'
  | 'custom';

export interface POI {
  id: string;
  name: string;
  category: POICategory;
  description: string;
  position: Vector3D;
  floor: number;
  roomCode?: string;
  source: 'cad_import' | 'manual_pin' | 'cv_detection' | 'demo_seed';
  tags: string[];
  aliases?: string[];
  accessible: boolean;
  occupancyStatus?: 'available' | 'in_use' | 'reserved' | 'unknown';
}

export interface Obstacle {
  id: string;
  name: string;
  type: 'wall' | 'furniture' | 'pillar' | 'glass_partition' | 'door_closed' | 'restricted_zone';
  bounds: BoundingBox2D;
  height: number;
  elevation: number;
  isTraversable: boolean;
  color?: string;
}

export interface Doorway {
  id: string;
  name: string;
  position: Vector3D;
  width: number;
  connectsRooms: [string, string];
  isOpen: boolean;
}

export interface NavigationNode {
  id: string;
  x: number;
  z: number;
  floor: number;
  isBlocked: boolean;
  type: 'corridor' | 'doorway' | 'room_interior' | 'poi_anchor' | 'elevator' | 'stairs';
  label?: string;
}

export interface NavigationEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  distance: number;
  isAccessible: boolean;
}

export interface PathStep {
  instruction: string;
  direction: 'straight' | 'slight_left' | 'turn_left' | 'sharp_left' | 'slight_right' | 'turn_right' | 'sharp_right' | 'arrive';
  distanceMeters: number;
  startPoint: Vector3D;
  endPoint: Vector3D;
  targetRoom?: string;
}

export interface RouteResult {
  success: boolean;
  path: Vector3D[];
  totalDistanceMeters: number;
  estimatedDurationSeconds: number; // calculated at walking speed 1.3m/s
  turnCount: number;
  steps: PathStep[];
  waypoints: Vector3D[];
  nodesEvaluated: number;
  gridCellsChecked: number;
  algorithm: 'A* Grid' | 'A* NavGraph' | 'Dijkstra Fallback';
  validation: {
    passed: boolean;
    wallCollisionsDetected: number;
    corridorClearanceMet: boolean;
    traversedDoorways: string[];
    isOptimalCost: boolean;
    notes: string[];
  };
  unreachableReason?: string;
}

export interface CaptureChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  category: 'perimeter' | 'corridors' | 'entrances' | 'lighting' | 'scale_reference';
}

export interface ExtractedFrame {
  id: string;
  timestamp: number;
  thumbnailUrl: string;
  width: number;
  height: number;
  sharpnessScore: number; // 0-100 heuristic
  selectedForReconstruction: boolean;
}

export interface SourceFileRecord {
  id: string;
  name: string;
  sizeBytes: number;
  type: 'image' | 'video' | 'floorplan' | 'model_glb' | 'model_gltf';
  uploadedAt: string;
  extractedFramesCount?: number;
  status: 'valid' | 'corrupt' | 'unsupported' | 'processed';
}

export interface CaptureConfidenceReport {
  overallReadiness: 'ready_for_import' | 'partial_inputs' | 'insufficient_coverage';
  heuristicScore: number; // 0-100 computed metric
  metrics: {
    sourceFilesCount: number;
    extractedFramesCount: number;
    checklistProgressPct: number;
    floorPlanProvided: boolean;
    scaleCalibrationPresent: boolean;
    importedModelPresent: boolean;
  };
  missingElements: string[];
  recommendations: string[];
  reconstructionJobStatus: 'idle' | 'awaiting_backend' | 'processing' | 'completed' | 'failed';
  backendAdapterConfigured: boolean;
}

export interface ProvenanceRecord {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  venueName: string;
  spaceType: string;
  floorCount: number;
  currentFloor: number;
  modelSource: 'procedural_demo' | 'imported_glb' | 'photogrammetry_reconstructed';
  dimensionsMeters: { width: number; length: number; height: number };
  coordinateSystem: string;
  unit: 'meters' | 'feet';
  createdAt: string;
  updatedAt: string;
  provenanceHistory: ProvenanceRecord[];
}
