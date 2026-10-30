import test from 'node:test';
import assert from 'node:assert/strict';
import { IndoorAStarRouter } from './astar.ts';
import type { Obstacle } from '../../types/index.ts';

test('IndoorAStarRouter finds straight path on open grid', () => {
  const router = new IndoorAStarRouter({
    minX: -10,
    maxX: 10,
    minZ: -10,
    maxZ: 10,
    cellSize: 0.5,
  });

  router.setObstacles([]);

  const result = router.findRoute({ x: -5, y: 0, z: 0 }, { x: 5, y: 0, z: 0 });

  assert.equal(result.success, true);
  assert.ok(result.totalDistanceMeters >= 9.8 && result.totalDistanceMeters <= 10.2);
  assert.equal(result.validation.passed, true);
  assert.equal(result.validation.wallCollisionsDetected, 0);
});

test('IndoorAStarRouter navigates around an obstacle wall', () => {
  const router = new IndoorAStarRouter({
    minX: -10,
    maxX: 10,
    minZ: -10,
    maxZ: 10,
    cellSize: 0.5,
  });

  // Wall blocking direct path at X = 0, Z from -3 to 3
  const wall: Obstacle = {
    id: 'wall-1',
    name: 'Partition Wall',
    type: 'wall',
    bounds: { minX: -0.5, maxX: 0.5, minZ: -3, maxZ: 3 },
    height: 3,
    elevation: 0,
    isTraversable: false,
  };

  router.setObstacles([wall]);

  const result = router.findRoute({ x: -4, y: 0, z: 0 }, { x: 4, y: 0, z: 0 });

  assert.equal(result.success, true);
  // Route must detour around Z > 3 or Z < -3, so distance must be greater than straight line 8m
  assert.ok(result.totalDistanceMeters > 8.5);
  assert.ok(result.turnCount >= 2);
  assert.equal(result.validation.passed, true);
  assert.equal(result.validation.wallCollisionsDetected, 0);

  // Check that no waypoint passes right inside the wall
  for (const wp of result.waypoints) {
    const insideWall =
      wp.x >= wall.bounds.minX &&
      wp.x <= wall.bounds.maxX &&
      wp.z >= wall.bounds.minZ &&
      wp.z <= wall.bounds.maxZ;
    assert.equal(insideWall, false, `Waypoint at (${wp.x}, ${wp.z}) must not penetrate wall`);
  }
});

test('IndoorAStarRouter reports unreachable when completely blocked', () => {
  const router = new IndoorAStarRouter({
    minX: -5,
    maxX: 5,
    minZ: -5,
    maxZ: 5,
    cellSize: 0.5,
  });

  // Solid perimeter enclosing (3, 3)
  const surroundingWalls: Obstacle[] = [
    {
      id: 'w-left',
      name: 'Left Wall',
      type: 'wall',
      bounds: { minX: 1.5, maxX: 2.5, minZ: 1.5, maxZ: 4.5 },
      height: 3,
      elevation: 0,
      isTraversable: false,
    },
    {
      id: 'w-right',
      name: 'Right Wall',
      type: 'wall',
      bounds: { minX: 3.5, maxX: 4.5, minZ: 1.5, maxZ: 4.5 },
      height: 3,
      elevation: 0,
      isTraversable: false,
    },
    {
      id: 'w-bottom',
      name: 'Bottom Wall',
      type: 'wall',
      bounds: { minX: 1.5, maxX: 4.5, minZ: 1.5, maxZ: 2.5 },
      height: 3,
      elevation: 0,
      isTraversable: false,
    },
    {
      id: 'w-top',
      name: 'Top Wall',
      type: 'wall',
      bounds: { minX: 1.5, maxX: 4.5, minZ: 3.5, maxZ: 4.5 },
      height: 3,
      elevation: 0,
      isTraversable: false,
    },
  ];

  router.setObstacles(surroundingWalls);

  const result = router.findRoute({ x: -2, y: 0, z: -2 }, { x: 3, y: 0, z: 3 });
  assert.equal(result.success, false);
  assert.ok(result.unreachableReason !== undefined);
  assert.equal(result.validation.passed, false);
});
