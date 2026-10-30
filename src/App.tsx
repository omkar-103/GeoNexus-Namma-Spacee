import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Doorway,
  Obstacle,
  POI,
  ProjectMetadata,
  RouteResult,
  Vector3D,
} from './types/index.ts';
import {
  DEMO_DOORWAYS,
  DEMO_OBSTACLES,
  DEMO_POIS,
  DEMO_PROJECT_METADATA,
} from './data/demoEnvironment.ts';
import { getFloorEnvironment } from './data/multiFloorData.ts';
import { IndoorAStarRouter } from './engine/pathfinding/astar.ts';
import { TopBar } from './components/layout/TopBar.tsx';
import { Sidebar, ActiveWorkspace } from './components/layout/Sidebar.tsx';
import { SpatialViewer } from './components/viewer/SpatialViewer.tsx';
import { RouteTrustInspector } from './components/inspector/RouteTrustInspector.tsx';
import { PoiManager } from './components/poi/PoiManager.tsx';
import { CaptureStudio } from './components/capture/CaptureStudio.tsx';
import { SpatialInspector } from './components/inspector/SpatialInspector.tsx';
import { JudgeDemoTour, DEMO_STEPS } from './components/demo/JudgeDemoTour.tsx';
import { ARPreviewModal } from './components/ar/ARPreviewModal.tsx';
import {
  Navigation,
  MapPin,
  ShieldCheck,
  Award,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  X,
} from 'lucide-react';

export default function App() {
  // Core state
  const [activeWorkspace, setActiveWorkspace] = useState<ActiveWorkspace>('viewer');
  const [projectMetadata, setProjectMetadata] = useState<ProjectMetadata>(DEMO_PROJECT_METADATA);
  const [obstacles, setObstacles] = useState<Obstacle[]>(DEMO_OBSTACLES);
  const [doorways, setDoorways] = useState<Doorway[]>(DEMO_DOORWAYS);
  const [pois, setPois] = useState<POI[]>(DEMO_POIS);
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>('poi-conf');
  const [activeFloor, setActiveFloor] = useState<number>(3);

  // User starting position (Elevator Lobby)
  const [userPosition, setUserPosition] = useState<Vector3D>({ x: -12.5, y: 1.65, z: 8.0 });

  // Inspection overlays
  const [showObstacleBounds, setShowObstacleBounds] = useState<boolean>(false);
  const [showNavGrid, setShowNavGrid] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // Custom imported model (GLB)
  const [customModelUrl, setCustomModelUrl] = useState<string | null>(null);

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Judge Demo Tour state
  const [isJudgeTourOpen, setIsJudgeTourOpen] = useState<boolean>(false);
  const [judgeTourStepIndex, setJudgeTourStepIndex] = useState<number>(0);

  // AR Preview modal state
  const [isARPreviewOpen, setIsARPreviewOpen] = useState<boolean>(false);

  // Initialize Indoor A* Pathfinder Router
  const router = useMemo(() => {
    const r = new IndoorAStarRouter({
      minX: -16,
      maxX: 16,
      minZ: -14,
      maxZ: 14,
      cellSize: 0.4, // 0.4m high-precision grid
    });
    r.setObstacles(obstacles, doorways);
    return r;
  }, [obstacles, doorways]);

  // Compute Initial Route to Executive Conference Room
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(() => {
    const target = DEMO_POIS.find((p) => p.id === 'poi-conf');
    if (target) {
      return router.findRoute({ x: -12.5, y: 0.1, z: 8.0 }, target.position);
    }
    return null;
  });

  // Calculate route to a specific POI
  const handleNavigateToPoi = useCallback(
    (targetPoi: POI) => {
      setSelectedPoiId(targetPoi.id);
      const startPoint = { x: userPosition.x, y: 0.1, z: userPosition.z };
      const routeResult = router.findRoute(startPoint, targetPoi.position);
      setActiveRoute(routeResult);

      // Append provenance log
      setProjectMetadata((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
        provenanceHistory: [
          {
            id: `prov-route-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'Route Calculated via A*',
            actor: 'Indoor A* Pathfinder',
            details: `Calculated ${routeResult.totalDistanceMeters}m safe path to ${targetPoi.name} (0 wall collisions).`,
          },
          ...prev.provenanceHistory,
        ],
      }));
    },
    [router, userPosition]
  );

  const selectedPoi = useMemo(() => {
    return pois.find((p) => p.id === selectedPoiId) || null;
  }, [pois, selectedPoiId]);

  // POI Operations
  const handleAddPoi = (newPoi: POI) => {
    setPois((prev) => [newPoi, ...prev]);
  };

  const handleExportPois = () => {
    const blob = new Blob([JSON.stringify(pois, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `namma_space_pois_floor3_${Date.now()}.json`;
    a.click();
  };

  const handleImportPois = (imported: POI[]) => {
    setPois(imported);
  };

  const handleExportProject = () => {
    const projectBundle = {
      metadata: projectMetadata,
      pois,
      obstaclesCount: obstacles.length,
      doorwaysCount: doorways.length,
      coordinateSystem: projectMetadata.coordinateSystem,
      exportTimestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(projectBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `namma_space_project_export_${Date.now()}.json`;
    a.click();
  };

  const handleImportCustomModel = (modelUrl: string, modelName: string) => {
    setCustomModelUrl(modelUrl);
    setProjectMetadata((prev) => ({
      ...prev,
      modelSource: 'imported_glb',
      name: `${modelName} - Imported Digital Twin`,
      provenanceHistory: [
        {
          id: `prov-import-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'Custom 3D Model Ingested',
          actor: 'GLTFLoader Service',
          details: `Imported binary GLTF asset ${modelName} into active scene hierarchy.`,
        },
        ...prev.provenanceHistory,
      ],
    }));
    setActiveWorkspace('viewer');
  };

  // Multi-Floor switcher handler with state synchronization
  const handleChangeFloor = useCallback((newFloor: number) => {
    setActiveFloor(newFloor);
    const env = getFloorEnvironment(newFloor);
    setPois(env.pois);
    setObstacles(env.obstacles);
    setDoorways(env.doorways);
    setSelectedPoiId(env.defaultTargetPoiId);
    setUserPosition(env.defaultUserPosition);

    // Calculate default route on new floor
    const target = env.pois.find((p) => p.id === env.defaultTargetPoiId);
    if (target) {
      const r = new IndoorAStarRouter({
        minX: -16,
        maxX: 16,
        minZ: -14,
        maxZ: 14,
        cellSize: 0.4,
      });
      r.setObstacles(env.obstacles, env.doorways);
      const newRoute = r.findRoute(
        { x: env.defaultUserPosition.x, y: 0.1, z: env.defaultUserPosition.z },
        target.position
      );
      setActiveRoute(newRoute);
    } else {
      setActiveRoute(null);
    }

    setProjectMetadata((prev) => ({
      ...prev,
      currentFloor: newFloor,
      updatedAt: new Date().toISOString(),
      provenanceHistory: [
        {
          id: `prov-floor-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: `Active Floor Switched to Level 0${newFloor}`,
          actor: 'Digital Twin Concourse',
          details: `Loaded Level 0${newFloor} architecture layer (${env.pois.length} spatial POIs).`,
        },
        ...prev.provenanceHistory,
      ],
    }));
  }, []);

  // IIT Bombay Judge Demo Tour step executor
  const handleExecuteJudgeTourAction = (actionKey: (typeof DEMO_STEPS)[0]['actionKey']) => {
    switch (actionKey) {
      case 'open_twin':
        setActiveWorkspace('viewer');
        setShowObstacleBounds(false);
        setShowNavGrid(false);
        break;
      case 'fps_mode':
        setActiveWorkspace('viewer');
        break;
      case 'search_conf':
        setActiveWorkspace('pois');
        const confPoi = pois.find((p) => p.id === 'poi-conf');
        if (confPoi) setSelectedPoiId(confPoi.id);
        break;
      case 'calc_route':
        setActiveWorkspace('viewer');
        const target = pois.find((p) => p.id === 'poi-conf') || pois[0];
        handleNavigateToPoi(target);
        break;
      case 'open_trust':
        setActiveWorkspace('trust');
        break;
      case 'toggle_overlays':
        setActiveWorkspace('viewer');
        setShowObstacleBounds(true);
        setShowNavGrid(true);
        break;
      case 'simulate_walk':
        setActiveWorkspace('viewer');
        break;
      case 'open_capture':
        setActiveWorkspace('capture');
        break;
      case 'review_confidence':
        setActiveWorkspace('capture');
        break;
      case 'final_summary':
        setActiveWorkspace('inspector');
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0b1020] text-slate-100 overflow-hidden font-sans">
      {/* Top Application Bar */}
      <TopBar
        metadata={projectMetadata}
        onOpenJudgeTour={() => setIsJudgeTourOpen(true)}
        onOpenARPreview={() => setIsARPreviewOpen(true)}
        activeFloor={activeFloor}
        onChangeFloor={handleChangeFloor}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Layout Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Navigation Rail */}
        <Sidebar
          activeWorkspace={activeWorkspace}
          onSelectWorkspace={(ws) => setActiveWorkspace(ws)}
          poiCount={pois.length}
          obstacleCount={obstacles.length}
          hasActiveRoute={Boolean(activeRoute?.success)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Central Workspace Canvas Area */}
        <main className="flex-1 relative overflow-hidden bg-[#0b1020]">
          {/* Workspace 1: 3D Digital Twin Viewer */}
          {activeWorkspace === 'viewer' && (
            <div className="relative w-full h-full">
              <SpatialViewer
                activeFloor={activeFloor}
                obstacles={obstacles}
                doorways={doorways}
                pois={pois}
                selectedPoiId={selectedPoiId}
                onSelectPoi={(poi) => {
                  if (poi) {
                    setSelectedPoiId(poi.id);
                  }
                }}
                activeRoute={activeRoute}
                showObstacleBounds={showObstacleBounds}
                onToggleObstacleBounds={() => setShowObstacleBounds(!showObstacleBounds)}
                showNavGrid={showNavGrid}
                onToggleNavGrid={() => setShowNavGrid(!showNavGrid)}
                showLabels={showLabels}
                onToggleLabels={() => setShowLabels(!showLabels)}
                customModelUrl={customModelUrl}
                onNavigateToPoi={handleNavigateToPoi}
              />

              {/* Selected Destination Quick Floating Card (Top Left overlay) */}
              {selectedPoi && (
                <div className="absolute top-16 left-6 z-20 pointer-events-auto max-w-xs animate-fadeIn">
                  <div className="p-3.5 rounded-2xl bg-[#111827]/95 border border-cyan-500/40 shadow-2xl backdrop-blur-md space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{selectedPoi.name}</span>
                          {selectedPoi.roomCode && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                              {selectedPoi.roomCode}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                          {selectedPoi.description}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedPoiId(null)}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {selectedPoi.category}
                      </span>
                      <button
                        onClick={() => handleNavigateToPoi(selectedPoi)}
                        className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow transition-transform active:scale-95"
                      >
                        <Navigation className="w-3 h-3" />
                        Navigate Here
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Workspace 2: POI Catalog & Search */}
          {activeWorkspace === 'pois' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full p-4 gap-4 overflow-hidden">
              <div className="lg:col-span-5 h-full overflow-hidden">
                <PoiManager
                  pois={pois}
                  selectedPoiId={selectedPoiId}
                  onSelectPoi={(poi) => {
                    if (poi) {
                      setSelectedPoiId(poi.id);
                    }
                  }}
                  onNavigateToPoi={(poi) => {
                    handleNavigateToPoi(poi);
                    setActiveWorkspace('viewer');
                  }}
                  onAddPoi={handleAddPoi}
                  onExportPois={handleExportPois}
                  onImportPois={handleImportPois}
                  userPosition={userPosition}
                />
              </div>

              {/* Side 3D Preview */}
              <div className="hidden lg:block lg:col-span-7 h-full rounded-2xl border border-slate-700/60 overflow-hidden relative shadow-2xl">
                <SpatialViewer
                  activeFloor={activeFloor}
                  obstacles={obstacles}
                  doorways={doorways}
                  pois={pois}
                  selectedPoiId={selectedPoiId}
                  onSelectPoi={(poi) => {
                    if (poi) setSelectedPoiId(poi.id);
                  }}
                  activeRoute={activeRoute}
                  showObstacleBounds={showObstacleBounds}
                  onToggleObstacleBounds={() => setShowObstacleBounds(!showObstacleBounds)}
                  showNavGrid={showNavGrid}
                  onToggleNavGrid={() => setShowNavGrid(!showNavGrid)}
                  showLabels={showLabels}
                  onToggleLabels={() => setShowLabels(!showLabels)}
                  customModelUrl={customModelUrl}
                  onNavigateToPoi={handleNavigateToPoi}
                />
              </div>
            </div>
          )}

          {/* Workspace 3: Route Trust Inspector */}
          {activeWorkspace === 'trust' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 h-full p-4 gap-4 overflow-hidden">
              <div className="lg:col-span-5 h-full overflow-y-auto pr-1">
                <RouteTrustInspector
                  activeRoute={activeRoute}
                  startPoi={null}
                  destinationPoi={selectedPoi}
                  userPosition={userPosition}
                  showObstacleBounds={showObstacleBounds}
                  onToggleObstacleBounds={() => setShowObstacleBounds(!showObstacleBounds)}
                  showNavGrid={showNavGrid}
                  onToggleNavGrid={() => setShowNavGrid(!showNavGrid)}
                  obstacles={obstacles}
                />
              </div>

              {/* Side 3D Viewer with highlighted route & obstacles */}
              <div className="hidden lg:block lg:col-span-7 h-full rounded-2xl border border-slate-700/60 overflow-hidden relative shadow-2xl">
                <SpatialViewer
                  activeFloor={activeFloor}
                  obstacles={obstacles}
                  doorways={doorways}
                  pois={pois}
                  selectedPoiId={selectedPoiId}
                  onSelectPoi={(poi) => {
                    if (poi) setSelectedPoiId(poi.id);
                  }}
                  activeRoute={activeRoute}
                  showObstacleBounds={true}
                  onToggleObstacleBounds={() => setShowObstacleBounds(!showObstacleBounds)}
                  showNavGrid={showNavGrid}
                  onToggleNavGrid={() => setShowNavGrid(!showNavGrid)}
                  showLabels={showLabels}
                  onToggleLabels={() => setShowLabels(!showLabels)}
                  customModelUrl={customModelUrl}
                  onNavigateToPoi={handleNavigateToPoi}
                />
              </div>
            </div>
          )}

          {/* Workspace 4: Capture Studio */}
          {activeWorkspace === 'capture' && (
            <div className="h-full p-4 overflow-hidden">
              <CaptureStudio
                onImportCustomModel={handleImportCustomModel}
                onOpenViewer={() => setActiveWorkspace('viewer')}
              />
            </div>
          )}

          {/* Workspace 5: Spatial Inspector & Provenance */}
          {activeWorkspace === 'inspector' && (
            <div className="h-full p-4 overflow-hidden">
              <SpatialInspector
                projectMetadata={projectMetadata}
                selectedPoi={selectedPoi}
                obstacles={obstacles}
                onExportProject={handleExportProject}
                onImportProject={(imported) => setProjectMetadata(imported)}
              />
            </div>
          )}

          {/* Floating Judge Demo Tour Overlay */}
          {isJudgeTourOpen && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 pointer-events-auto animate-fadeIn">
              <JudgeDemoTour
                currentStepIndex={judgeTourStepIndex}
                onNextStep={() =>
                  setJudgeTourStepIndex((prev) => Math.min(DEMO_STEPS.length - 1, prev + 1))
                }
                onPrevStep={() => setJudgeTourStepIndex((prev) => Math.max(0, prev - 1))}
                onSelectStep={(idx) => setJudgeTourStepIndex(idx)}
                onCloseTour={() => setIsJudgeTourOpen(false)}
                onExecuteStepAction={handleExecuteJudgeTourAction}
              />
            </div>
          )}
        </main>
      </div>

      {/* AR Navigation Preview Modal */}
      {isARPreviewOpen && (
        <ARPreviewModal
          onClose={() => setIsARPreviewOpen(false)}
          destinationName={selectedPoi?.name}
          distanceMeters={activeRoute?.totalDistanceMeters}
        />
      )}
    </div>
  );
}
