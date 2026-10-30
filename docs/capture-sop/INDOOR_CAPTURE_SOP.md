# GeoNexus Namma Space — Indoor Venue Capture SOP
**Standard Operating Procedure for Smartphone-Based Indoor Digital Twin Ingestion**

---

## 1. Objective
Establish a reproducible, photometrically reliable field protocol enabling consumer smartphone operators to capture complex indoor venues with high feature stability, metric scale calibration, and complete loop closure for 3D reconstruction.

---

## 2. Equipment Specifications
- **Recommended Devices:** iPhone 14/15/16 Pro, Samsung Galaxy S23/S24 Ultra, Google Pixel 7/8/9 Pro.
- **Recording Settings:** 4K UHD (3840x2160) @ 60 fps (or 30 fps locked shutter).
- **Camera Controls:**
  - Exposure & ISO: Manually locked (ISO 100–400).
  - Shutter Speed: $\ge 1/120\text{s}$ to prevent motion blur.
  - White Balance: Fixed (e.g., 4500K fluorescent / 5500K daylight).
  - Stabilization: 3-Axis motorized gimbal (DJI Osmo Mobile 6 / Insta360 Flow).
- **Scale Calibration:** Two 1.00m optical checkerboard scale bars placed on corridor floors.

---

## 3. The 8-Stage Capture Protocol

### Stage 1: Path Planning & Loop Design
- Survey facility boundaries and identify all rooms, doors, and transition corridors.
- Design a single Eulerian continuous walkthrough loop that starts and ends at the exact same physical coordinates (enabling loop-closure bundle adjustment in Structure-from-Motion).

### Stage 2: Illumination Control
- Turn on all overhead facility lighting to achieve uniform diffuse illumination ($> 300\text{ lux}$).
- Close exterior window blinds to avoid severe dynamic range saturation or lens flares on glass partitions.

### Stage 3: Scale Reference Setup
- Lay down at least one physical 1.00m scale bar in the central circulation corridor.
- Record standard structural ground-truth metrics (e.g. 2.10m doorway frame height, 3.20m slab-to-slab height).

### Stage 4: Continuous Roaming Traversal
- Walking pace: Smooth heel-to-toe gait at $\le 0.65\text{ m/s}$.
- Overlap requirement: Maintain $\ge 70\%$ visual overlap between adjacent frames.
- Posture: Chest height ($1.40\text{m}$), pitched $12^\circ$ downward to capture floor boundaries and door thresholds.
- Corner technique: Walk a wide exterior arc around corners rather than pivoting in place.

### Stage 5: Doorway & Portal Transitions
- When approaching a room doorway, pause for 1.5 seconds at the threshold.
- Slowly pan $45^\circ$ left and right to bridge feature descriptors between corridor walls and interior room furnishings before stepping through.

### Stage 6: Room Interior Coverage
- Circle the room perimeter clockwise, facing the central fixtures (e.g. conference table, workstation clusters).
- Return to the doorway threshold and resume the main corridor path.

### Stage 7: Perimeter Loop Closure
- Complete the circuit by returning to the exact initial starting point and filming the origin anchor for 2–3 seconds from the starting orientation.

### Stage 8: Data Offloading & Integrity Verification
- Offload video footage via high-speed USB 3.2.
- Ingest into **Capture Studio** to extract keyframes, inspect sharpness distribution, and compute the quantitative readiness score.
