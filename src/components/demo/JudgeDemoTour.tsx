import React from 'react';
import {
  Award,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Play,
  Footprints,
  Navigation,
  ShieldCheck,
  Camera,
  Layers,
  X,
} from 'lucide-react';

export interface DemoStep {
  stepNumber: number;
  title: string;
  instruction: string;
  targetWorkspace: 'viewer' | 'pois' | 'inspector' | 'capture';
  actionLabel?: string;
  actionKey:
    | 'open_twin'
    | 'fps_mode'
    | 'search_conf'
    | 'calc_route'
    | 'open_trust'
    | 'toggle_overlays'
    | 'simulate_walk'
    | 'open_capture'
    | 'review_confidence'
    | 'final_summary';
}

export const DEMO_STEPS: DemoStep[] = [
  {
    stepNumber: 1,
    title: 'Explore Floor 3 Digital Twin',
    instruction: 'Inspect the procedural 3D model of the IIT Bombay Techfest Innovation Center. Orbit, pan, and zoom to view corridors, boardrooms, and workstation bays.',
    targetWorkspace: 'viewer',
    actionKey: 'open_twin',
    actionLabel: 'Launch 3D View',
  },
  {
    stepNumber: 2,
    title: 'First-Person Roaming & Collision',
    instruction: 'Switch to First-Person roaming at eye level (1.65m). Walk with W/A/S/D keys. The collision engine prevents walking through walls or furniture.',
    targetWorkspace: 'viewer',
    actionKey: 'fps_mode',
    actionLabel: 'Enter First-Person',
  },
  {
    stepNumber: 3,
    title: 'Spatial Search & POI Indexing',
    instruction: 'Search for "Conference Room" or synonyms like "boardroom", "tea", or "lab". The deterministic spatial index ranks matches instantly.',
    targetWorkspace: 'pois',
    actionKey: 'search_conf',
    actionLabel: 'Select Conference Room',
  },
  {
    stepNumber: 4,
    title: 'Obstacle-Aware A* Route Calculation',
    instruction: 'Calculate the real 3D walkable path. The A* algorithm steers around walls and furniture, guiding through doorway portals.',
    targetWorkspace: 'viewer',
    actionKey: 'calc_route',
    actionLabel: 'Calculate Route',
  },
  {
    stepNumber: 5,
    title: 'Route Trust Inspector',
    instruction: 'Open the Route Trust Inspector to verify 0 wall collisions, inspect waypoint coordinates, and verify mathematical optimality.',
    targetWorkspace: 'inspector',
    actionKey: 'open_trust',
    actionLabel: 'Inspect Route Trust',
  },
  {
    stepNumber: 6,
    title: 'Obstacle & Grid Overlays',
    instruction: 'Enable the 3D bounding box wireframes and walkable navigation grid cells to see the exact spatial geometry used by the pathfinder.',
    targetWorkspace: 'viewer',
    actionKey: 'toggle_overlays',
    actionLabel: 'Enable 3D Grid Overlays',
  },
  {
    stepNumber: 7,
    title: 'Simulate Desktop Walk',
    instruction: 'Play simulated navigation to animate the camera/avatar smoothly along the calculated path with turn-by-turn waypoints.',
    targetWorkspace: 'viewer',
    actionKey: 'simulate_walk',
    actionLabel: 'Start Walk Simulation',
  },
  {
    stepNumber: 8,
    title: 'Capture Studio & Video Frames',
    instruction: 'Open Capture Studio to review the photogrammetry SOP checklist and inspect client-side keyframes extracted from walkthrough video.',
    targetWorkspace: 'capture',
    actionKey: 'open_capture',
    actionLabel: 'Open Capture Studio',
  },
  {
    stepNumber: 9,
    title: 'Capture Confidence Report',
    instruction: 'Review the transparent Capture Confidence & Readiness Report (heuristic score calculated from verifiable evidence, not fake claims).',
    targetWorkspace: 'capture',
    actionKey: 'review_confidence',
    actionLabel: 'View Confidence Scorecard',
  },
  {
    stepNumber: 10,
    title: 'Provenance & Export',
    instruction: 'Inspect data provenance, coordinate frame calibrations, and export the complete project JSON bundle for reproduction.',
    targetWorkspace: 'inspector',
    actionKey: 'final_summary',
    actionLabel: 'Review Provenance Audit',
  },
];

interface JudgeDemoTourProps {
  currentStepIndex: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  onSelectStep: (index: number) => void;
  onCloseTour: () => void;
  onExecuteStepAction: (actionKey: DemoStep['actionKey']) => void;
}

export const JudgeDemoTour: React.FC<JudgeDemoTourProps> = ({
  currentStepIndex,
  onNextStep,
  onPrevStep,
  onSelectStep,
  onCloseTour,
  onExecuteStepAction,
}) => {
  const currentStep = DEMO_STEPS[currentStepIndex];

  return (
    <div className="bg-[#111827]/95 border border-cyan-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md max-w-xl mx-auto space-y-3">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-slate-950 shadow">
            <Award className="w-4 h-4 font-bold" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              IIT Bombay Techfest Judge Demo Mode
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                Step {currentStepIndex + 1} of {DEMO_STEPS.length}
              </span>
            </h3>
          </div>
        </div>

        <button
          onClick={onCloseTour}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Step Content */}
      <div className="space-y-1.5">
        <div className="text-sm font-semibold text-cyan-300 flex items-center gap-1.5">
          <span>{currentStep.title}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {currentStep.instruction}
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1">
          {DEMO_STEPS.map((step, idx) => (
            <button
              key={idx}
              onClick={() => onSelectStep(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStepIndex
                  ? 'w-6 bg-cyan-400'
                  : idx < currentStepIndex
                  ? 'w-2 bg-emerald-400'
                  : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Action Button & Step Navigation */}
        <div className="flex items-center gap-2">
          {currentStep.actionLabel && (
            <button
              onClick={() => onExecuteStepAction(currentStep.actionKey)}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {currentStep.actionLabel}
            </button>
          )}

          <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
            <button
              onClick={onPrevStep}
              disabled={currentStepIndex === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNextStep}
              disabled={currentStepIndex === DEMO_STEPS.length - 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
