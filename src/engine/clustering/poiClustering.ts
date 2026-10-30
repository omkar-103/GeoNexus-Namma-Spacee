import type { POI, POICategory } from '../../types/index.ts';

export interface POICluster {
  id: string;
  isCluster: true;
  count: number;
  center: { x: number; y: number; z: number };
  pois: POI[];
  primaryPoi: POI;
  dominantCategory: POICategory;
  categoryCounts: Record<string, number>;
  label: string;
}

export type POIOrCluster = (POI & { isCluster?: false }) | POICluster;

/**
 * Visual clustering algorithm for POIs.
 * Groups nearby points into a single cluster marker when the camera zoom level is low
 * (i.e. camera distance is high / zoomed out) to drastically reduce 3D/UI clutter.
 *
 * @param pois The list of POIs to cluster
 * @param cameraDistance The current distance from the camera to its Orbit target
 * @param zoomLevel Optional explicit zoom level (1.0 = normal, < 0.8 = zoomed out)
 */
export function clusterPOIs(
  pois: POI[],
  cameraDistance: number,
  zoomLevel: number = 1.0
): POIOrCluster[] {
  if (!pois || pois.length === 0) return [];

  // When zoomed in close (< 20m) or high zoom level, do not cluster: show full individual detail
  if (cameraDistance < 20 && zoomLevel >= 0.9) {
    return pois.map((p) => ({ ...p, isCluster: false }));
  }

  // Calculate dynamic spatial threshold based on camera distance:
  // Further out = larger grouping radius
  let clusterDistanceThreshold: number;
  if (cameraDistance < 28) {
    clusterDistanceThreshold = 4.8; // Group only adjacent/paired rooms
  } else if (cameraDistance < 40) {
    clusterDistanceThreshold = 7.5; // Group zone-level clusters
  } else {
    clusterDistanceThreshold = 10.5; // Group macro wings
  }

  // Adjust threshold if explicit zoom level is provided
  if (zoomLevel < 0.7) {
    clusterDistanceThreshold *= 1.35;
  }

  // Spatial clustering using centroid agglomeration
  const clusters: POICluster[] = [];
  const assigned = new Set<string>();

  // Process POIs by category priority so important hubs become cluster primaries
  const priorityOrder: Record<string, number> = {
    conference: 10,
    lab: 9,
    workspace: 8,
    reception: 7,
    transit: 6,
    pantry: 5,
    meeting: 4,
    infrastructure: 3,
    restroom: 2,
    emergency: 1,
  };

  const sortedPois = [...pois].sort((a, b) => {
    const prioA = priorityOrder[a.category] || 0;
    const prioB = priorityOrder[b.category] || 0;
    return prioB - prioA;
  });

  for (let i = 0; i < sortedPois.length; i++) {
    const seedPoi = sortedPois[i];
    if (assigned.has(seedPoi.id)) continue;

    const clusterItems: POI[] = [seedPoi];
    assigned.add(seedPoi.id);

    let sumX = seedPoi.position.x;
    let sumY = seedPoi.position.y;
    let sumZ = seedPoi.position.z;

    for (let j = i + 1; j < sortedPois.length; j++) {
      const candidate = sortedPois[j];
      if (assigned.has(candidate.id)) continue;

      // Check current cluster centroid distance
      const curCenterX = sumX / clusterItems.length;
      const curCenterZ = sumZ / clusterItems.length;

      const dx = candidate.position.x - curCenterX;
      const dz = candidate.position.z - curCenterZ;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist <= clusterDistanceThreshold) {
        clusterItems.push(candidate);
        assigned.add(candidate.id);
        sumX += candidate.position.x;
        sumY += candidate.position.y;
        sumZ += candidate.position.z;
      }
    }

    if (clusterItems.length > 1) {
      // Multiple items: construct cluster
      const categoryCounts: Record<string, number> = {};
      for (const item of clusterItems) {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      }

      // Find dominant category
      let dominantCat: POICategory = seedPoi.category;
      let maxCount = 0;
      for (const [cat, count] of Object.entries(categoryCounts)) {
        if (count > maxCount) {
          maxCount = count;
          dominantCat = cat as POICategory;
        }
      }

      const count = clusterItems.length;
      const label = formatClusterLabel(dominantCat, count, clusterItems);

      clusters.push({
        id: `cluster-${seedPoi.id}-${count}`,
        isCluster: true,
        count,
        center: {
          x: sumX / count,
          y: sumY / count,
          z: sumZ / count,
        },
        pois: clusterItems,
        primaryPoi: seedPoi,
        dominantCategory: dominantCat,
        categoryCounts,
        label,
      });
    } else {
      // Single item: leave as standalone POI
      // No cluster object needed
    }
  }

  // Combine standalone POIs and clusters
  const result: POIOrCluster[] = [];

  for (const poi of pois) {
    // If poi is not part of any multi-item cluster, add as standalone
    const isClustered = clusters.some((c) => c.pois.some((p) => p.id === poi.id));
    if (!isClustered) {
      result.push({ ...poi, isCluster: false });
    }
  }

  // Add the formed multi-item clusters
  for (const cl of clusters) {
    result.push(cl);
  }

  return result;
}

function formatClusterLabel(category: string, count: number, items: POI[]): string {
  // If items share a common room prefix or department
  const names = items.map((i) => i.name);
  if (category === 'meeting') return `Meeting Pods (${count})`;
  if (category === 'conference') return `Conference Wing (${count})`;
  if (category === 'workspace') return `Workstation Hub (${count})`;
  if (category === 'lab') return `R&D Lab Zone (${count})`;
  if (category === 'pantry' || category === 'restroom') return `Amenities Wing (${count})`;
  if (category === 'reception' || category === 'transit') return `Entrance Hub (${count})`;
  return `${items[0].name.split(' ')[0]} Hub (${count})`;
}

/**
 * Checks whether a given POI ID is contained within a cluster
 */
export function isPoiInCluster(poiId: string, cluster: POICluster): boolean {
  return cluster.pois.some((p) => p.id === poiId);
}
