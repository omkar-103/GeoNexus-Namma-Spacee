import React, { useState, useMemo } from 'react';
import { POI, POICategory } from '../../types/index.ts';
import { searchPOIs } from '../../engine/spatial-index/poiIndex.ts';
import { clusterPOIs, type POICluster } from '../../engine/clustering/poiClustering.ts';
import {
  Search,
  MapPin,
  Navigation,
  Eye,
  Plus,
  Download,
  Upload,
  CheckCircle2,
  SlidersHorizontal,
  Coffee,
  Users,
  Briefcase,
  Wrench,
  Server,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';

interface PoiManagerProps {
  pois: POI[];
  selectedPoiId: string | null;
  onSelectPoi: (poi: POI | null) => void;
  onNavigateToPoi: (poi: POI) => void;
  onAddPoi: (newPoi: POI) => void;
  onExportPois: () => void;
  onImportPois: (imported: POI[]) => void;
  userPosition: { x: number; z: number };
}

export const PoiManager: React.FC<PoiManagerProps> = ({
  pois,
  selectedPoiId,
  onSelectPoi,
  onNavigateToPoi,
  onAddPoi,
  onExportPois,
  onImportPois,
  userPosition,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingPoi, setIsAddingPoi] = useState(false);

  // New POI Form state
  const [newPoiName, setNewPoiName] = useState('');
  const [newPoiCategory, setNewPoiCategory] = useState<POICategory>('meeting');
  const [newPoiDesc, setNewPoiDesc] = useState('');
  const [newPoiX, setNewPoiX] = useState<number>(0);
  const [newPoiZ, setNewPoiZ] = useState<number>(0);

  const [groupMode, setGroupMode] = useState<'individual' | 'clustered'>('individual');

  const searchResults = useMemo(() => {
    return searchPOIs(
      pois,
      searchQuery,
      { x: userPosition.x, y: 0.1, z: userPosition.z },
      selectedCategory
    );
  }, [pois, searchQuery, selectedCategory, userPosition]);

  // Spatial Clustering grouping for zoomed-out UI overview
  const clusteredResults = useMemo(() => {
    return clusterPOIs(pois, 32);
  }, [pois]);

  const categories = [
    { id: 'all', label: 'All Destinations', icon: MapPin },
    { id: 'conference', label: 'Conference', icon: Users },
    { id: 'meeting', label: 'Huddle & Sync', icon: Users },
    { id: 'workspace', label: 'Workstations', icon: Briefcase },
    { id: 'lab', label: 'Maker & Lab', icon: Wrench },
    { id: 'pantry', label: 'Pantry & Chai', icon: Coffee },
    { id: 'infrastructure', label: 'Server Room', icon: Server },
    { id: 'emergency', label: 'Emergency', icon: AlertOctagon },
  ];

  const handleCreatePoi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoiName.trim()) return;

    const newPoi: POI = {
      id: `poi-custom-${Date.now()}`,
      name: newPoiName.trim(),
      category: newPoiCategory,
      description: newPoiDesc.trim() || 'Custom designated spatial point of interest.',
      position: { x: Number(newPoiX), y: 0.1, z: Number(newPoiZ) },
      floor: 3,
      source: 'manual_pin',
      tags: ['custom', newPoiCategory],
      accessible: true,
      occupancyStatus: 'available',
    };

    onAddPoi(newPoi);
    setIsAddingPoi(false);
    setNewPoiName('');
    setNewPoiDesc('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportPois(parsed);
        }
      } catch (err) {
        console.error('Invalid POI JSON file:', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full bg-[#191e24] border border-[#303943] rounded-xl p-5 shadow-lg space-y-4">
      {/* Header & Quick Action Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#6ab7a8]" />
            Indoor POI Catalog & Search
          </h2>
          <p className="text-xs text-[#a6b0bb]">
            {pois.length} verified indoor destinations indexed
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingPoi(!isAddingPoi)}
            className="px-2.5 py-1.5 rounded-lg bg-[#202730] hover:bg-[#28323e] text-[#f0f2f4] border border-[#303943] text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#6ab7a8]" />
            Add POI
          </button>
          <button
            onClick={onExportPois}
            title="Export POIs as JSON"
            className="p-1.5 rounded-lg bg-[#202730] hover:bg-[#28323e] text-[#a6b0bb] hover:text-white border border-[#303943] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <label
            title="Import POIs JSON"
            className="p-1.5 rounded-lg bg-[#202730] hover:bg-[#28323e] text-[#a6b0bb] hover:text-white border border-[#303943] cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Add Custom POI Modal/Drawer */}
      {isAddingPoi && (
        <form onSubmit={handleCreatePoi} className="p-3.5 rounded-lg bg-[#202730] border border-[#303943] space-y-3 animate-fadeIn">
          <div className="text-xs font-semibold text-[#f0f2f4] uppercase tracking-wider">
            Pin New Point of Interest
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[11px] text-[#a6b0bb] block mb-1">Name</label>
              <input
                type="text"
                placeholder="e.g. Design Studio"
                value={newPoiName}
                onChange={(e) => setNewPoiName(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#14181e] border border-[#303943] text-white placeholder-[#778391] focus:outline-none focus:border-[#6ab7a8]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#a6b0bb] block mb-1">Category</label>
              <select
                value={newPoiCategory}
                onChange={(e) => setNewPoiCategory(e.target.value as POICategory)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#14181e] border border-[#303943] text-white focus:outline-none focus:border-[#6ab7a8]"
              >
                <option value="meeting">Meeting Room</option>
                <option value="conference">Conference</option>
                <option value="workspace">Workstation</option>
                <option value="lab">Lab & Hardware</option>
                <option value="pantry">Pantry</option>
                <option value="custom">Custom Point</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[11px] text-[#a6b0bb] block mb-1">X Coord (meters)</label>
              <input
                type="number"
                step="0.5"
                value={newPoiX}
                onChange={(e) => setNewPoiX(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#14181e] border border-[#303943] text-white focus:outline-none focus:border-[#6ab7a8]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#a6b0bb] block mb-1">Z Coord (meters)</label>
              <input
                type="number"
                step="0.5"
                value={newPoiZ}
                onChange={(e) => setNewPoiZ(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#14181e] border border-[#303943] text-white focus:outline-none focus:border-[#6ab7a8]"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-[#a6b0bb] block mb-1">Description</label>
            <input
              type="text"
              placeholder="Short description of location..."
              value={newPoiDesc}
              onChange={(e) => setNewPoiDesc(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#14181e] border border-[#303943] text-white placeholder-[#778391] focus:outline-none focus:border-[#6ab7a8] text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingPoi(false)}
              className="px-3 py-1 rounded-lg bg-[#28323e] text-[#a6b0bb] text-xs hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded-lg bg-[#6ab7a8] hover:bg-[#5aa899] text-slate-950 font-semibold text-xs shadow-sm"
            >
              Save POI
            </button>
          </div>
        </form>
      )}

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#778391]" />
        <input
          type="text"
          placeholder="Search rooms, 'chai', 'conf', 'lab', 'washroom'..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#14181e] border border-[#303943] text-sm text-white placeholder-[#778391] focus:outline-none focus:border-[#6ab7a8] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#a6b0bb] hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
              selectedCategory === cat.id
                ? 'bg-[#28323e] text-white font-semibold border border-[#3d4b5c]'
                : 'bg-[#202730] text-[#a6b0bb] hover:text-white border border-[#303943]'
            }`}
          >
            <cat.icon className="w-3 h-3 text-[#6ab7a8]" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* View Mode Toggle: All POIs vs Clustered Markers */}
      <div className="flex items-center justify-between pt-1 pb-1 px-0.5 border-b border-[#28323e]">
        <span className="text-[11px] font-medium text-[#a6b0bb] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#6ab7a8]" />
          Spatial Grouping:
        </span>
        <div className="flex items-center bg-[#14181e] p-0.5 rounded-lg border border-[#303943]">
          <button
            onClick={() => setGroupMode('individual')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              groupMode === 'individual'
                ? 'bg-[#28323e] text-white font-semibold shadow'
                : 'text-[#a6b0bb] hover:text-white'
            }`}
          >
            Individual ({pois.length})
          </button>
          <button
            onClick={() => setGroupMode('clustered')}
            className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
              groupMode === 'clustered'
                ? 'bg-[#28323e] text-[#6ab7a8] font-semibold shadow'
                : 'text-[#a6b0bb] hover:text-white'
            }`}
          >
            Clustered ({clusteredResults.length})
          </button>
        </div>
      </div>

      {/* POI Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[300px]">
        {groupMode === 'clustered' ? (
          clusteredResults.map((item) => {
            if (item.isCluster) {
              const cluster = item as POICluster;
              const isClusterSelected = cluster.pois.some((p) => p.id === selectedPoiId);
              return (
                <div
                  key={cluster.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isClusterSelected
                      ? 'bg-[#1b2633] border-[#6ab7a8] shadow-md ring-1 ring-[#6ab7a8]/50'
                      : 'bg-[#181f28] border-[#2b3542] hover:border-[#3d4b5c]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#6ab7a8]/20 text-[#6ab7a8] font-bold text-xs flex items-center justify-center border border-[#6ab7a8]/40">
                        {cluster.count}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                          <span>{cluster.label}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#202730] text-[#6ab7a8] font-mono border border-[#303943]">
                            Macro Cluster
                          </span>
                        </div>
                        <p className="text-[11px] text-[#a6b0bb]">
                          Centroid: ({cluster.center.x.toFixed(1)}m, {cluster.center.z.toFixed(1)}m)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Nested POIs inside this cluster */}
                  <div className="mt-2.5 pt-2 border-t border-[#28323e] space-y-1.5">
                    {cluster.pois.map((subPoi) => {
                      const isSel = subPoi.id === selectedPoiId;
                      return (
                        <div
                          key={subPoi.id}
                          onClick={() => onSelectPoi(subPoi)}
                          className={`p-2 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                            isSel
                              ? 'bg-[#202730] border-[#6ab7a8] text-white font-medium'
                              : 'bg-[#14181e] border-[#28323e] text-[#a6b0bb] hover:text-white hover:bg-[#191f27]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate pr-2">
                            <MapPin className="w-3 h-3 text-[#6ab7a8] shrink-0" />
                            <span className="truncate">{subPoi.name}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectPoi(subPoi);
                              onNavigateToPoi(subPoi);
                            }}
                            className="px-2 py-0.5 rounded bg-[#6ab7a8] hover:bg-[#5aa899] text-slate-950 font-semibold text-[10px] shrink-0"
                          >
                            Route
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            } else {
              const poi = item as POI;
              const isSelected = poi.id === selectedPoiId;
              return (
                <div
                  key={poi.id}
                  onClick={() => onSelectPoi(poi)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#202730] border-[#6ab7a8] shadow-sm ring-1 ring-[#6ab7a8]/40'
                      : 'bg-[#191e24] border-[#2b3542] hover:border-[#3d4b5c] hover:bg-[#202730]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{poi.name}</span>
                        {poi.roomCode && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#14181e] text-[#6ab7a8] border border-[#303943]">
                            {poi.roomCode}
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#202730] text-[#a6b0bb] font-mono border border-[#303943]">
                          Isolated
                        </span>
                      </div>
                      <p className="text-xs text-[#a6b0bb] mt-1 line-clamp-2 leading-relaxed">
                        {poi.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
          })
        ) : searchResults.length === 0 ? (
          <div className="p-8 text-center text-[#778391] text-xs">
            <p>No matching destinations found for "{searchQuery}".</p>
            <p className="mt-1 text-[#778391]">Try searching "conference", "tea", "exit", or "lab".</p>
          </div>
        ) : (
          searchResults.map(({ poi, score, matchedField, distanceMeters }) => {
            const isSelected = poi.id === selectedPoiId;
            return (
              <div
                key={poi.id}
                onClick={() => onSelectPoi(poi)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#202730] border-[#6ab7a8] shadow-sm ring-1 ring-[#6ab7a8]/40'
                    : 'bg-[#191e24] border-[#2b3542] hover:border-[#3d4b5c] hover:bg-[#202730]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{poi.name}</span>
                      {poi.roomCode && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#14181e] text-[#6ab7a8] border border-[#303943]">
                          {poi.roomCode}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#a6b0bb] mt-1 line-clamp-2 leading-relaxed">
                      {poi.description}
                    </p>
                  </div>

                  {distanceMeters !== undefined && (
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-[#6ab7a8]">
                        {distanceMeters}m
                      </div>
                      <div className="text-[10px] text-[#778391]">away</div>
                    </div>
                  )}
                </div>

                {/* Tags and Status */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#28323e] text-[11px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-[#202730] text-[#a6b0bb] text-[10px] uppercase font-mono border border-[#303943]">
                      {poi.category}
                    </span>
                    {poi.aliases && poi.aliases.length > 0 && (
                      <span className="text-[10px] text-[#778391] italic">
                        aka {poi.aliases[0]}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPoi(poi);
                      }}
                      title="Focus 3D Viewport on POI"
                      className="p-1.5 rounded-lg bg-[#202730] hover:bg-[#28323e] text-[#a6b0bb] hover:text-white border border-[#303943]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPoi(poi);
                        onNavigateToPoi(poi);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#6ab7a8] hover:bg-[#5aa899] text-slate-950 font-semibold text-xs flex items-center gap-1 transition-transform active:scale-95 shadow-sm"
                    >
                      <Navigation className="w-3 h-3" />
                      Navigate
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
