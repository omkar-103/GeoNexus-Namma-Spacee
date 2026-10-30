# GeoNexus Namma Space — Test Suite & Sample Datasets

This directory contains test suites, validation utilities, and sample dataset files for the **Namma Space** intelligent indoor digital-twin platform.

---

## 1. Automated Unit Test Suites

The mathematical routing and indexing engines are tested using the native Node.js test runner (`node:test` and `node:assert/strict`):

```bash
# Run all unit tests
npm test

# Run tests in watch mode during development
npm run test:watch
```

### Test Coverage
| Test Suite | File Location | Validated Capabilities |
| :--- | :--- | :--- |
| **Indoor A\* Pathfinder** | `src/engine/pathfinding/astar.test.ts` | • Open grid Euclidean straight path<br>• Obstacle detour routing around walls<br>• Wall collision non-penetration check<br>• Unreachable target boundary detection |
| **Semantic POI Search** | `src/engine/spatial-index/poiIndex.test.ts` | • Exact and partial name search<br>• Alias and workplace synonym matching ("chai", "coffee", "boardroom", "lab")<br>• Department category filtering |
| **POI Visual Clustering** | `src/engine/clustering/poiClustering.test.ts` | • Zoom-in de-clustering threshold (<20m)<br>• Centroid calculation and distance threshold grouping (>25m)<br>• Empty POI array error safety |

---

## 2. Sample Datasets in `sample-data/`

- **`powai_hub_floor3_cad.json`**: Architectural blueprint bounds, 34 obstacle bounding boxes, 9 doorway portal coordinates, and 11 verified destination POIs for Level 3.
- **`sample_poi_import.json`**: Standard POI schema export file formatted for drag-and-drop ingestion in the **POI Manager**.

---

## 3. Sample Keyframe Assets in `sample-frames/`

- Contains metadata and format specifications for keyframes extracted by the **Capture Studio** video ingestion engine (1080p, 60% minimum photometric overlap, Laplacian variance sharpness scores).
