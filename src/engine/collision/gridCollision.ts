import type { BoundingBox2D, Obstacle, Vector3D } from '../../types/index.ts';

/**
 * Spatial Collision & Grid Occupancy Engine
 * Handles 2D/3D indoor bounding boxes, agent clearance radii, and line-of-sight raycasts
 */

export const AGENT_RADIUS_METERS = 0.4; // Average human clearance buffer

export function isPointInBox(x: number, z: number, box: BoundingBox2D, padding = 0): boolean {
  return (
    x >= box.minX - padding &&
    x <= box.maxX + padding &&
    z >= box.minZ - padding &&
    z <= box.maxZ + padding
  );
}

export function isPositionBlocked(
  x: number,
  z: number,
  obstacles: Obstacle[],
  agentRadius = AGENT_RADIUS_METERS
): { blocked: boolean; collidingObstacle?: Obstacle } {
  for (const obs of obstacles) {
    if (!obs.isTraversable) {
      if (isPointInBox(x, z, obs.bounds, agentRadius)) {
        return { blocked: true, collidingObstacle: obs };
      }
    }
  }
  return { blocked: false };
}

/**
 * Checks if line segment between (x1, z1) and (x2, z2) intersects an obstacle box
 */
export function lineIntersectsBox(
  x1: number,
  z1: number,
  x2: number,
  z2: number,
  box: BoundingBox2D,
  padding = 0.15
): boolean {
  const minX = box.minX - padding;
  const maxX = box.maxX + padding;
  const minZ = box.minZ - padding;
  const maxZ = box.maxZ + padding;

  // Quick bounds reject
  if (
    Math.max(x1, x2) < minX ||
    Math.min(x1, x2) > maxX ||
    Math.max(z1, z2) < minZ ||
    Math.min(z1, z2) > maxZ
  ) {
    return false;
  }

  // If either endpoint is inside
  if ((x1 >= minX && x1 <= maxX && z1 >= minZ && z1 <= maxZ) ||
      (x2 >= minX && x2 <= maxX && z2 >= minZ && z2 <= maxZ)) {
    return true;
  }

  // Line clipping / Liang-Barsky line-box test
  const dx = x2 - x1;
  const dz = z2 - z1;

  let p1 = -dx, q1 = x1 - minX;
  let p2 = dx,  q2 = maxX - x1;
  let p3 = -dz, q3 = z1 - minZ;
  let p4 = dz,  q4 = maxZ - z1;

  let u1 = 0.0;
  let u2 = 1.0;

  const pairs: [number, number][] = [
    [p1, q1],
    [p2, q2],
    [p3, q3],
    [p4, q4],
  ];

  for (const [p, q] of pairs) {
    if (p === 0) {
      if (q < 0) return false; // Parallel line outside
    } else {
      const t = q / p;
      if (p < 0) {
        if (t > u2) return false;
        if (t > u1) u1 = t;
      } else {
        if (t < u1) return false;
        if (t < u2) u2 = t;
      }
    }
  }

  return u1 <= u2;
}

/**
 * Validates whether two points have clear unobstructed line-of-sight
 */
export function hasLineOfSight(
  p1: { x: number; z: number },
  p2: { x: number; z: number },
  obstacles: Obstacle[],
  padding = 0.2
): boolean {
  for (const obs of obstacles) {
    if (!obs.isTraversable) {
      if (lineIntersectsBox(p1.x, p1.z, p2.x, p2.z, obs.bounds, padding)) {
        return false;
      }
    }
  }
  return true;
}
