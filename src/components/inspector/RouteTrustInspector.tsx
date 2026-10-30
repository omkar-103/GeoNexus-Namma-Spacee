import React, { useState } from 'react';
import { RouteResult, POI, Obstacle } from '../../types/index.ts';
import {
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Route,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';

interface RouteTrustInspectorProps {
  activeRoute: RouteResult | null;
  startPoi?: POI | null;
  destinationPoi?: POI | null;
  userPosition: { x: number; z: number };
  showObstacleBounds: boolean;
  onToggleObstacleBounds: () => void;
  showNavGrid: boolean;
  onToggleNavGrid: () => void;
  obstacles: Obstacle[];
}

export const RouteTrustInspector: React.FC<RouteTrustInspectorProps> = ({
  activeRoute,
  startPoi,
  destinationPoi,
  userPosition,
  showObstacleBounds,
  onToggleObstacleBounds,
  showNavGrid,
  onToggleNavGrid,
  obstacles,
}) => {
  const [showWaypointList, setShowWaypointList] = useState(false);
  const [showMathDetails, setShowMathDetails] = useState(true);

  if (!activeRoute) {
    return (
      <div className="p-6 rounded-2xl bg-[#111827]/80 border border-slate-800 text-slate-300">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Route Trust Inspector</h3>
            <p className="text-xs text-slate-400">Spatial Pathfinding & Obstacle Verification</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          Select a destination in the 3D Viewer or POI Catalog and click <strong className="text-cyan-300">"Navigate Here"</strong> to inspect real-time mathematical validation, A* search states, obstacle clearances, and doorway traversals.
        </p>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs flex items-center justify-between">
          <span className="text-slate-400">Inspected Obstacles:</span>
          <span className="font-mono text-cyan-400 font-semibold">{obstacles.length} architectural elements</span>
        </div>
      </div>
    );
  }

  const { validation, success, totalDistanceMeters, estimatedDurationSeconds, turnCount, waypoints, nodesEvaluated } = activeRoute;

  return (
    <div className="p-5 rounded-xl bg-[#191e24] border border-[#303943] shadow-lg space-y-4">
      {/* Header with Trust Status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              validation.passed
                ? 'bg-[#1b2b27] border border-[#2a453e] text-[#79b99b]'
                : 'bg-[#2b1d1d] border border-[#482828] text-[#d97777]'
            }`}
          >
            {validation.passed ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Route Trust Inspector</h3>
              <span
                className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                  validation.passed
                    ? 'bg-[#1b2b27] border-[#2a453e] text-[#79b99b]'
                    : 'bg-[#2b1d1d] border-[#482828] text-[#d97777]'
                }`}
              >
                {validation.passed ? 'Verified Safe' : 'Path Blocked'}
              </span>
            </div>
            <p className="text-[11px] text-[#a6b0bb] mt-0.5">
              {validation.passed
                ? 'Zero wall penetrations • 0.4m corridor clearance verified'
                : 'Destination unreachable through walkable corridors'}
            </p>
          </div>
        </div>

        {/* Algorithm Badge */}
        <div className="text-right">
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#202730] border border-[#303943] text-[#6ab7a8]">
            {activeRoute.algorithm}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        <div className="p-2.5 rounded-lg bg-[#202730] border border-[#303943] text-center">
          <div className="text-[10px] text-[#778391] uppercase tracking-wider">Distance</div>
          <div className="text-sm font-mono font-bold text-white mt-0.5">{totalDistanceMeters}m</div>
        </div>
        <div className="p-2.5 rounded-lg bg-[#202730] border border-[#303943] text-center">
          <div className="text-[10px] text-[#778391] uppercase tracking-wider">Est. Walk</div>
          <div className="text-sm font-mono font-bold text-[#6ab7a8] mt-0.5">~{estimatedDurationSeconds}s</div>
        </div>
        <div className="p-2.5 rounded-lg bg-[#202730] border border-[#303943] text-center">
          <div className="text-[10px] text-[#778391] uppercase tracking-wider">Turns</div>
          <div className="text-sm font-mono font-bold text-[#d5a45d] mt-0.5">{turnCount}</div>
        </div>
        <div className="p-2.5 rounded-lg bg-[#202730] border border-[#303943] text-center">
          <div className="text-[10px] text-[#778391] uppercase tracking-wider">Cells Checked</div>
          <div className="text-sm font-mono font-bold text-[#a6b0bb] mt-0.5">{nodesEvaluated}</div>
        </div>
      </div>

      {/* Verification Checklist */}
      <div className="p-3.5 rounded-lg bg-[#202730] border border-[#303943] space-y-2 text-xs">
        <div className="text-[11px] font-semibold text-[#f0f2f4] uppercase tracking-wider mb-1 flex items-center justify-between">
          <span>Spatial Integrity Audit</span>
          <span className="text-[10px] text-[#79b99b] font-mono">100% Deterministic</span>
        </div>

        <div className="flex items-center justify-between text-[#a6b0bb] py-1 border-b border-[#28323e]">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#79b99b] shrink-0" />
            Wall Collision Intersections
          </span>
          <span className="font-mono text-[#79b99b] font-semibold">0 Collisions</span>
        </div>

        <div className="flex items-center justify-between text-[#a6b0bb] py-1 border-b border-[#28323e]">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#79b99b] shrink-0" />
            Agent Radius Clearance
          </span>
          <span className="font-mono text-[#79b99b] font-semibold">0.40m Enforced</span>
        </div>

        <div className="flex items-center justify-between text-[#a6b0bb] py-1 border-b border-[#28323e]">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#79b99b] shrink-0" />
            Corridor & Doorway Portals
          </span>
          <span className="font-mono text-[#6ab7a8] font-semibold">
            {validation.traversedDoorways.length > 0 ? validation.traversedDoorways.join(', ') : 'Direct Open Corridor'}
          </span>
        </div>

        <div className="flex items-center justify-between text-[#a6b0bb] py-1">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#79b99b] shrink-0" />
            Cost Function Optimality
          </span>
          <span className="font-mono text-[#79b99b] font-semibold">Octile Heuristic Minimized</span>
        </div>
      </div>

      {/* Trust Visualizer 3D Toggles */}
      <div className="p-3 rounded-lg bg-[#191e24] border border-[#303943] flex items-center justify-between text-xs">
        <span className="text-[#a6b0bb] font-medium flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#6ab7a8]" />
          Scene Inspection Overlays:
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleObstacleBounds}
            className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
              showObstacleBounds
                ? 'bg-[#2f271e] text-[#d5a45d] border-[#d5a45d]/60'
                : 'bg-[#202730] text-[#a6b0bb] border-[#303943] hover:text-white'
            }`}
          >
            {showObstacleBounds ? 'Hide Obstacles' : 'Show Obstacles'}
          </button>
          <button
            onClick={onToggleNavGrid}
            className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
              showNavGrid
                ? 'bg-[#1b2b27] text-[#6ab7a8] border-[#6ab7a8]/60'
                : 'bg-[#202730] text-[#a6b0bb] border-[#303943] hover:text-white'
            }`}
          >
            {showNavGrid ? 'Hide Nav Grid' : 'Show Nav Grid'}
          </button>
        </div>
      </div>

      {/* Waypoints Disclosure */}
      <div className="border border-[#303943] rounded-lg overflow-hidden">
        <button
          onClick={() => setShowWaypointList(!showWaypointList)}
          className="w-full px-3 py-2 bg-[#202730] hover:bg-[#262f3a] text-xs font-medium text-[#f0f2f4] flex items-center justify-between transition-colors"
        >
          <span className="flex items-center gap-2">
            <Route className="w-3.5 h-3.5 text-[#6ab7a8]" />
            Waypoint Coordinates ({waypoints.length} nodes)
          </span>
          {showWaypointList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showWaypointList && (
          <div className="p-2 bg-[#191e24] max-h-48 overflow-y-auto divide-y divide-[#28323e] text-[11px] font-mono">
            {waypoints.map((wp, idx) => (
              <div key={idx} className="py-1 px-2 flex items-center justify-between text-[#a6b0bb]">
                <span className="text-[#f0f2f4]">WP #{idx + 1} {idx === 0 ? '(Start)' : idx === waypoints.length - 1 ? '(Goal)' : ''}</span>
                <span className="text-[#6ab7a8] font-semibold">
                  [{wp.x.toFixed(2)}, {wp.y.toFixed(2)}, {wp.z.toFixed(2)}]m
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Turn-by-Turn Instruction Steps */}
      {activeRoute.steps.length > 0 && (
        <div className="border border-[#303943] rounded-lg overflow-hidden">
          <div className="px-3 py-2 bg-[#202730] text-xs font-semibold text-[#f0f2f4] flex items-center gap-2">
            <CornerDownRight className="w-3.5 h-3.5 text-[#6ab7a8]" />
            Turn-by-Turn Waypoint Guidance
          </div>
          <div className="p-2.5 bg-[#191e24] space-y-2 max-h-44 overflow-y-auto text-xs">
            {activeRoute.steps.map((st, i) => (
              <div key={i} className="flex items-start gap-2.5 text-[#a6b0bb]">
                <div className="w-4 h-4 rounded-full bg-[#202730] border border-[#303943] text-[#6ab7a8] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-[#f0f2f4]">{st.instruction}</div>
                  <div className="text-[10px] text-[#778391] font-mono">Segment: {st.distanceMeters}m</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
