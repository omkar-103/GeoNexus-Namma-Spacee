import React, { useState } from 'react';
import { ProjectMetadata } from '../../types/index.ts';
import {
  Compass,
  Award,
  Layers,
  HelpCircle,
  Smartphone,
  CheckCircle2,
  Share2,
  Download,
  Info,
  X,
  Keyboard,
} from 'lucide-react';

interface TopBarProps {
  metadata: ProjectMetadata;
  onOpenJudgeTour: () => void;
  onOpenARPreview: () => void;
  activeFloor: number;
  onChangeFloor: (floor: number) => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  metadata,
  onOpenJudgeTour,
  onOpenARPreview,
  activeFloor,
  onChangeFloor,
  isMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <>
      <header className="h-14 bg-[#14181e] border-b border-[#303943] px-4 flex items-center justify-between select-none z-30">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-lg bg-[#191e24] border border-[#303943] text-[#a6b0bb] hover:text-white"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
          </button>

          <div className="w-8 h-8 rounded-lg bg-[#202730] border border-[#303943] flex items-center justify-center text-[#6ab7a8] shadow-sm shrink-0">
            <Compass className="w-4 h-4 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-[#f0f2f4]">
                NAMMA<span className="text-[#6ab7a8] font-semibold">SPACE</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#202730] text-[#a6b0bb] border border-[#303943]">
                Spatial Twin
              </span>
            </div>
            <p className="text-[10px] text-[#778391] font-medium truncate max-w-[140px] sm:max-w-md">
              {metadata.venueName}
            </p>
          </div>
        </div>

        {/* Center: Floor Selector */}
        <div className="hidden md:flex items-center gap-1 bg-[#191e24] p-1 rounded-lg border border-[#303943] text-xs">
          <span className="text-[#778391] text-[11px] px-2 font-medium">Floor:</span>
          {[1, 2, 3].map((floor) => (
            <button
              key={floor}
              onClick={() => onChangeFloor(floor)}
              className={`px-2.5 py-1 rounded-md font-mono text-xs transition-colors ${
                activeFloor === floor
                  ? 'bg-[#28323e] text-white font-semibold border border-[#3d4b5c]'
                  : 'text-[#a6b0bb] hover:text-white hover:bg-[#202730]'
              }`}
            >
              Lvl 0{floor} {floor === 3 ? '(Demo)' : ''}
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* IIT Bombay Judge Demo Mode Button */}
          <button
            onClick={onOpenJudgeTour}
            className="px-3 py-1.5 rounded-lg bg-[#6ab7a8] hover:bg-[#5aa899] text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
          >
            <Award className="w-3.5 h-3.5 font-bold" />
            <span>Judge Demo</span>
          </button>

          {/* AR Bonus Button */}
          <button
            onClick={onOpenARPreview}
            className="hidden sm:flex px-2.5 py-1.5 rounded-lg bg-[#191e24] hover:bg-[#202730] text-[#a6b0bb] hover:text-white border border-[#303943] text-xs font-medium items-center gap-1.5 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#6ab7a8]" />
            <span>AR Preview</span>
          </button>

          {/* Help & Shortcut Modal Toggle */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-1.5 rounded-lg bg-[#191e24] hover:bg-[#202730] text-[#a6b0bb] hover:text-white border border-[#303943] transition-colors"
            title="Keyboard Shortcuts & Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Keyboard Shortcuts & System Guide Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Navigation & Roaming Controls</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="font-semibold text-cyan-300">First-Person Roaming:</div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">W</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">↑</kbd> : Walk Forward</div>
                  <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">S</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">↓</kbd> : Walk Backward</div>
                  <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">A</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">←</kbd> : Strafe Left</div>
                  <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">D</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">→</kbd> : Strafe Right</div>
                  <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">Shift</kbd> : Fast Walk</div>
                  <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">Esc</kbd> : Unlock Mouse</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="font-semibold text-cyan-300">Collision & Pathfinding:</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  The indoor spatial engine computes 8-directional A* paths on a 0.4m grid, avoiding 48 architectural walls and furniture obstacles. Paths pass through active doorway thresholds.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
