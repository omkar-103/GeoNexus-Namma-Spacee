import type { POI, Vector3D } from '../../types/index.ts';

const SYNONYM_MAP: Record<string, string[]> = {
  pantry: ['tea', 'coffee', 'water', 'cafeteria', 'snack', 'drink', 'beverage', 'kitchen', 'chai'],
  conference: ['conf', 'boardroom', 'all-hands', 'presentation', 'meeting room', 'large meeting'],
  meeting: ['huddle', '1-on-1', 'discussion', 'sync', 'room a', 'room b'],
  lab: ['prototype', 'hardware', 'testing', '3d printer', 'electronics', 'workshop', 'maker'],
  restroom: ['washroom', 'toilet', 'loo', 'wc', 'bathroom', 'urinal'],
  emergency: ['exit', 'fire', 'stairs', 'evacuation', 'escape', 'stairwell'],
  infrastructure: ['server', 'rack', 'data center', 'network', 'datacenter', 'it'],
  reception: ['lobby', 'entrance', 'front desk', 'security', 'welcome', 'check-in'],
  transit: ['lift', 'elevator', 'stairs', 'lobby', 'corridor'],
  workspace: ['desk', 'bay', 'cubicle', 'open office', 'seating', 'engineering', 'devs'],
};

export interface POISearchMatch {
  poi: POI;
  score: number;
  matchedField: 'name' | 'alias' | 'tag' | 'synonym' | 'category' | 'description';
  distanceMeters?: number;
}

export function searchPOIs(
  pois: POI[],
  query: string,
  userPosition?: Vector3D,
  categoryFilter?: string
): POISearchMatch[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery && !categoryFilter) {
    return pois.map((poi) => ({
      poi,
      score: 1.0,
      matchedField: 'name',
      distanceMeters: userPosition ? calculateDistance(userPosition, poi.position) : undefined,
    }));
  }

  const tokens = cleanQuery.split(/\s+/).filter(Boolean);
  const results: POISearchMatch[] = [];

  for (const poi of pois) {
    if (categoryFilter && categoryFilter !== 'all' && poi.category !== categoryFilter) {
      continue;
    }

    if (tokens.length === 0) {
      results.push({
        poi,
        score: 1.0,
        matchedField: 'category',
        distanceMeters: userPosition ? calculateDistance(userPosition, poi.position) : undefined,
      });
      continue;
    }

    let maxScore = 0;
    let bestMatchedField: POISearchMatch['matchedField'] = 'name';

    const nameLower = poi.name.toLowerCase();
    const descLower = poi.description.toLowerCase();
    const aliases = (poi.aliases || []).map((a) => a.toLowerCase());
    const tags = poi.tags.map((t) => t.toLowerCase());

    // 1. Exact name match
    if (nameLower === cleanQuery) {
      maxScore = Math.max(maxScore, 100);
      bestMatchedField = 'name';
    } else if (nameLower.startsWith(cleanQuery)) {
      maxScore = Math.max(maxScore, 80);
      bestMatchedField = 'name';
    } else if (nameLower.includes(cleanQuery)) {
      maxScore = Math.max(maxScore, 60);
      bestMatchedField = 'name';
    }

    // 2. Alias match
    for (const alias of aliases) {
      if (alias === cleanQuery) {
        maxScore = Math.max(maxScore, 90);
        bestMatchedField = 'alias';
      } else if (alias.includes(cleanQuery)) {
        maxScore = Math.max(maxScore, 65);
        bestMatchedField = 'alias';
      }
    }

    // 3. Synonym dictionary matching
    for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
      const poiRelevant =
        poi.category === key ||
        nameLower.includes(key) ||
        tags.some((t) => t.includes(key));

      if (poiRelevant) {
        for (const syn of synonyms) {
          if (tokens.some((token) => syn.includes(token) || token.includes(syn))) {
            if (maxScore < 75) {
              maxScore = 75;
              bestMatchedField = 'synonym';
            }
          }
        }
      }
    }

    // 4. Tag matches
    for (const tag of tags) {
      if (tag === cleanQuery) {
        maxScore = Math.max(maxScore, 70);
        bestMatchedField = 'tag';
      } else if (tag.includes(cleanQuery)) {
        maxScore = Math.max(maxScore, 50);
        bestMatchedField = 'tag';
      }
    }

    // 5. Description matches
    if (descLower.includes(cleanQuery)) {
      maxScore = Math.max(maxScore, 30);
      bestMatchedField = 'description';
    }

    if (maxScore > 0) {
      results.push({
        poi,
        score: maxScore,
        matchedField: bestMatchedField,
        distanceMeters: userPosition ? calculateDistance(userPosition, poi.position) : undefined,
      });
    }
  }

  // Sort by score desc, then distance asc
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.distanceMeters !== undefined && b.distanceMeters !== undefined) {
      return a.distanceMeters - b.distanceMeters;
    }
    return a.poi.name.localeCompare(b.poi.name);
  });

  return results;
}

export function calculateDistance(a: Vector3D, b: Vector3D): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.round(Math.sqrt(dx * dx + dz * dz) * 10) / 10;
}
