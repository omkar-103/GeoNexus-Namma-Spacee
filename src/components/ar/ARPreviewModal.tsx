import React, { useState } from 'react';
import {
  Smartphone,
  Compass,
  Navigation,
  X,
  AlertTriangle,
  Layers,
  Sparkles,
  Camera,
} from 'lucide-react';

interface ARPreviewModalProps {
  onClose: () => void;
  destinationName?: string;
  distanceMeters?: number;
}

export const ARPreviewModal: React.FC<ARPreviewModalProps> = ({
  onClose,
  destinationName = 'Executive Conference Room',
  distanceMeters = 18.5,
}) => {
  const [deviceOrientationSupported, setDeviceOrientationSupported] = useState(
    typeof window !== 'undefined' && 'DeviceOrientationEvent' in window
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                AR Wayfinding Preview
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Optional Bonus
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Mobile Visual Positioning & Augmented Reality</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Technical Reality Disclosure */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-amber-300">Technical Disclosure:</strong> Standard mobile web browsers cannot perform robust 6-DoF visual-inertial indoor relocalization from raw video without a specialized WebXR backend or VPS anchors. This preview demonstrates the HUD overlay design and spatial direction integration.
          </div>
        </div>

        {/* Simulated Camera Pass-through HUD */}
        <div className="relative h-64 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden flex flex-col justify-between p-4">
          {/* Subtle camera scanline effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

          {/* Top AR telemetry */}
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 z-10">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              VPS Visual Tracking: Standby
            </span>
            <span>Target: {destinationName}</span>
          </div>

          {/* Floating 3D Waypoint Spatial Reticle */}
          <div className="self-center flex flex-col items-center z-10 animate-bounce">
            <div className="px-3 py-1.5 rounded-xl bg-cyan-500/90 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-slate-950" />
              <span>{destinationName}</span>
              <span className="font-mono text-[10px] bg-slate-950 text-cyan-300 px-1.5 py-0.5 rounded">
                {distanceMeters}m
              </span>
            </div>
            <div className="w-0.5 h-8 bg-gradient-to-b from-cyan-400 to-transparent" />
            <div className="w-4 h-4 rounded-full border-2 border-cyan-400 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
            </div>
          </div>

          {/* Bottom Turn Guidance Banner */}
          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-slate-300">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Continue straight through Main Spine Corridor</span>
            </div>
            <span className="font-mono text-cyan-400 font-bold">12.5m</span>
          </div>
        </div>

        {/* Roadmap Steps */}
        <div className="space-y-1.5 text-xs text-slate-400">
          <div className="font-semibold text-slate-300">Round 2 / On-Site AR Roadmap:</div>
          <ul className="list-disc list-inside space-y-1 text-[11px]">
            <li>Integration of WebXR ARSession with hit-testing for floor anchoring</li>
            <li>Visual Positioning System (VPS) using AprilTags / ArUco markers at corridor portals</li>
            <li>Real-time sensor fusion with device gyroscope and accelerometer</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
        >
          Close Preview
        </button>
      </div>
    </div>
  );
};
