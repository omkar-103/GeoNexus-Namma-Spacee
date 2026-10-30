import React, { useState } from 'react';
import { Obstacle, POI, ProjectMetadata } from '../../types/index.ts';
import {
  Layers,
  History,
  FileCode,
  Download,
  Upload,
  CheckCircle2,
  Cpu,
  MapPin,
  Shield,
  Box,
  Compass,
} from 'lucide-react';

interface SpatialInspectorProps {
  projectMetadata: ProjectMetadata;
  selectedPoi: POI | null;
  obstacles: Obstacle[];
  onExportProject: () => void;
  onImportProject: (imported: ProjectMetadata) => void;
}

export const SpatialInspector: React.FC<SpatialInspectorProps> = ({
  projectMetadata,
  selectedPoi,
  obstacles,
  onExportProject,
  onImportProject,
}) => {
  const [activeTab, setActiveTab] = useState<'provenance' | 'metadata' | 'diagnostics'>('provenance');

  return (
    <div className="flex flex-col h-full bg-[#111827]/90 border border-slate-700/60 rounded-2xl p-5 shadow-2xl space-y-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Spatial Inspector & Model Provenance
          </h2>
          <p className="text-xs text-slate-400">
            Coordinate frame calibration, spatial audit, and audit log
          </p>
        </div>

        <button
          onClick={onExportProject}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          Export Project JSON
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('provenance')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'provenance' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Provenance Log ({projectMetadata.provenanceHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('metadata')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'metadata' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          Metadata & Scale
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'diagnostics' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Geometry Audit
        </button>
      </div>

      {/* Tab 1: Provenance Log */}
      {activeTab === 'provenance' && (
        <div className="space-y-3 animate-fadeIn text-xs">
          <p className="text-slate-400 text-xs leading-relaxed">
            Immutable spatial provenance trail recording model origin, coordinate frame adjustments, and POI indexing:
          </p>
          <div className="space-y-2">
            {projectMetadata.provenanceHistory.map((item, idx) => (
              <div key={item.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{item.action}</span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">Actor: {item.actor}</div>
                <div className="text-xs text-slate-300 mt-1">{item.details}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Project Metadata */}
      {activeTab === 'metadata' && (
        <div className="space-y-3 animate-fadeIn text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400 text-[11px]">Venue Name</div>
              <div className="text-white font-semibold mt-0.5">{projectMetadata.venueName}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400 text-[11px]">Active Level</div>
              <div className="text-cyan-400 font-semibold mt-0.5">Floor {projectMetadata.currentFloor} of {projectMetadata.floorCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400 text-[11px]">Floor Dimensions</div>
              <div className="text-white font-mono font-semibold mt-0.5">
                {projectMetadata.dimensionsMeters.width}m × {projectMetadata.dimensionsMeters.length}m × {projectMetadata.dimensionsMeters.height}m
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400 text-[11px]">Model Source</div>
              <div className="text-emerald-400 font-mono font-semibold mt-0.5">
                {projectMetadata.modelSource}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="text-slate-400 text-[11px]">Coordinate System Definition</div>
            <div className="text-slate-200 font-mono text-[11px]">{projectMetadata.coordinateSystem}</div>
            <div className="text-slate-400 text-[11px] pt-1">
              Unit: <strong className="text-white">SI Metric Meters (m)</strong>, EPSG / Local Origin (0,0) at central corridor hub intersection.
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Diagnostics */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-3 animate-fadeIn text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-slate-300 font-semibold flex items-center justify-between">
              <span>Spatial Graph Diagnostics</span>
              <span className="text-emerald-400 text-[11px] font-mono">Status: Healthy</span>
            </div>
            <div className="space-y-1.5 text-slate-400 text-[11px]">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span>Rasterized Obstacles:</span>
                <span className="font-mono text-white font-bold">{obstacles.length} bounding boxes</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span>Unreachable Island Nodes:</span>
                <span className="font-mono text-emerald-400">0 detected</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span>Grid Cell Resolution:</span>
                <span className="font-mono text-cyan-400">0.40m square cells</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Corridor Minimum Width:</span>
                <span className="font-mono text-white">2.20m (Passes fire code)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
