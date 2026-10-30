# GeoNexus Namma Space — System Architecture

## 1. High-Level Modular Design

GeoNexus Namma Space is organized into four clean, decoupled operational layers:

```text
+-------------------------------------------------------------+
|                      User Interface Layer                   |
|  • 3D Digital Twin Viewer (SpatialViewer.tsx)               |
|  • POI Search & Catalog (PoiManager.tsx)                   |
|  • Route Trust Inspector (RouteTrustInspector.tsx)         |
|  • Capture Studio & SOP Auditor (CaptureStudio.tsx)         |
|  • Model Provenance & Metadata (SpatialInspector.tsx)       |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                   WebGL Presentation Engine                 |
|  • Three.js WebGLRenderer (ACESFilmic, SRGB, PCF Soft)      |
|  • PBR Procedural Architecture (proceduralArchitecture.ts)  |
|  • Dynamic Agglomerative POI Clustering (poiClustering.ts)  |
|  • Multi-Floor 480ms Cubic Cross-Fade (multiFloorData.ts)   |
|  • Direct 30fps Minimap 2D Canvas Pipeline                  |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                    Mathematical Core Engines                |
|  • Indoor A* Pathfinder on 0.40m Grid (astar.ts)           |
|  • 2D Axis-Aligned Sliding Collision (gridCollision.ts)     |
|  • Semantic POI Index & Workplace Synonyms (poiIndex.ts)    |
|  • Raycast String-Pulling Path Smoother                    |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                      Data & Ingestion Layer                 |
|  • Multi-Floor Spatial Catalog (Levels 1, 2, 3)             |
|  • Client-Side Video Keyframe Extractor                     |
|  • Binary GLTF/GLB Ingestion Pipeline (GLTFLoader)          |
+-------------------------------------------------------------+
```

## 2. Component Directory Structure
- `src/components/viewer/`: Three.js rendering, camera controls, floor cross-fade, and minimap.
- `src/components/poi/`: POI catalog, synonym search, and spatial grouping switcher.
- `src/components/inspector/`: Route Trust Inspector and spatial model provenance log.
- `src/components/capture/`: Video keyframe extraction and capture confidence scorecard.
- `src/components/demo/`: 10-step automated evaluation tour for competition judging.
- `src/components/ar/`: Mobile WebXR visual guidance HUD simulation.
- `src/engine/`: Pure decoupled mathematical algorithms verified by automated unit tests.
- `src/data/`: Multi-floor definitions, verified CAD dimensions, obstacle footprints.
