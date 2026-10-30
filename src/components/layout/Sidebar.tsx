import React from 'react';
import {
  Compass,
  MapPin,
  ShieldCheck,
  Camera,
  Layers,
  ChevronLeft,
  ChevronRight,
  Route,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export type ActiveWorkspace = 'viewer' | 'pois' | 'trust' | 'capture' | 'inspector';

interface SidebarProps {
  activeWorkspace: ActiveWorkspace;
  onSelectWorkspace: (workspace: ActiveWorkspace) => void;
  poiCount: number;
  obstacleCount: number;
  hasActiveRoute: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeWorkspace,
  onSelectWorkspace,
  poiCount,
  obstacleCount,
  hasActiveRoute,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'viewer' as ActiveWorkspace,
      label: '3D Digital Twin',
      sublabel: 'Interactive Spatial Roaming',
      icon: Compass,
    },
    {
      id: 'pois' as ActiveWorkspace,
      label: 'Places & POIs',
      sublabel: `${poiCount} Indexed Destinations`,
      icon: MapPin,
    },
    {
      id: 'trust' as ActiveWorkspace,
      label: 'Route Trust Inspector',
      sublabel: hasActiveRoute ? 'Active Route Verified' : 'Spatial Validation',
      icon: ShieldCheck,
      badge: hasActiveRoute ? 'Live' : undefined,
    },
    {
      id: 'capture' as ActiveWorkspace,
      label: 'Capture Studio',
      sublabel: 'SOP, Frames & Readiness',
      icon: Camera,
    },
    {
      id: 'inspector' as ActiveWorkspace,
      label: 'Spatial Inspector',
      sublabel: 'Provenance & Calibration',
      icon: Layers,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 z-40 md:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-[#14181e] border-r border-[#303943] flex flex-col justify-between p-3 select-none z-50 md:z-20 shrink-0 transition-transform duration-200 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation Buttons */}
        <div className="space-y-1">
          <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-[#778391]">
            Workspaces
          </div>
          {navItems.map((item) => {
            const isActive = activeWorkspace === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectWorkspace(item.id);
                  onCloseMobile();
                }}
                className={`w-full p-2.5 rounded-lg text-left transition-all flex items-center justify-between group ${
                  isActive
                    ? 'bg-[#1f2630] border border-[#303943] text-white shadow-sm'
                    : 'text-[#a6b0bb] hover:text-white hover:bg-[#191e24] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-[#28323e] border border-[#3d4b5c] text-[#6ab7a8]'
                        : 'bg-[#191e24] border border-[#28323e] text-[#a6b0bb] group-hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-xs font-medium ${isActive ? 'text-white font-semibold' : 'text-[#f0f2f4]'}`}>
                      {item.label}
                    </div>
                    <div className="text-[10px] text-[#778391]">{item.sublabel}</div>
                  </div>
                </div>

                {item.badge && (
                  <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#1d2b27] text-[#79b99b] border border-[#2a453e]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Real Spatial System Status Footer */}
        <div className="p-3 rounded-lg bg-[#191e24] border border-[#303943] space-y-2 text-[11px]">
          <div className="flex items-center justify-between text-[#a6b0bb]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#79b99b]" />
              A* Spatial Router
            </span>
            <span className="font-mono text-[#79b99b] font-medium">Online</span>
          </div>

          <div className="flex items-center justify-between text-[#a6b0bb]">
            <span>Obstacle Bounds:</span>
            <span className="font-mono text-[#f0f2f4]">{obstacleCount} elements</span>
          </div>

          <div className="flex items-center justify-between text-[#a6b0bb]">
            <span>Grid Cell Size:</span>
            <span className="font-mono text-[#6ab7a8]">0.40m</span>
          </div>

          <div className="pt-1.5 border-t border-[#28323e] text-[10px] text-[#778391] text-center font-medium">
            Techfest IIT Bombay 2026–27
          </div>
        </div>
      </aside>
  </>
  );
};
