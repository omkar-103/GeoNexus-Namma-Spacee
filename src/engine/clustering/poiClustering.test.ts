import { describe, it } from 'node:test';
import assert from 'node:assert';
import { clusterPOIs, isPoiInCluster } from './poiClustering.ts';
import type { POICluster } from './poiClustering.ts';
import type { POI } from '../../types/index.ts';

const mockPois: POI[] = [
  {
    id: 'poi-1',
    name: 'Meeting Room Alpha',
    category: 'meeting',
    description: 'Conference room 1',
    position: { x: 0, y: 0.1, z: 0 },
    floor: 3,
    roomCode: 'MR-01',
    source: 'demo_seed',
    tags: ['meeting'],
    aliases: ['Alpha'],
    accessible: true,
  },
  {
    id: 'poi-2',
    name: 'Meeting Room Beta',
    category: 'meeting',
    description: 'Conference room 2',
    position: { x: 2, y: 0.1, z: 1 }, // 2.23m away from poi-1
    floor: 3,
    roomCode: 'MR-02',
    source: 'demo_seed',
    tags: ['meeting'],
    aliases: ['Beta'],
    accessible: true,
  },
  {
    id: 'poi-3',
    name: 'Isolated Hardware Lab',
    category: 'lab',
    description: 'Far lab',
    position: { x: 25, y: 0.1, z: 20 }, // Far away
    floor: 3,
    roomCode: 'LAB-01',
    source: 'demo_seed',
    tags: ['lab'],
    aliases: ['Lab'],
    accessible: true,
  },
];

describe('POI Clustering Algorithm', () => {
  it('does not cluster when camera distance is close (< 20m)', () => {
    const result = clusterPOIs(mockPois, 15);
    assert.strictEqual(result.length, 3);
    assert.strictEqual(result.every((r) => !r.isCluster), true);
  });

  it('clusters nearby POIs into a single marker when camera distance is zoomed out (> 25m)', () => {
    const result = clusterPOIs(mockPois, 30);
    // poi-1 and poi-2 should be clustered together into 1 cluster
    // poi-3 is isolated so remains standalone
    assert.strictEqual(result.length, 2);

    const cluster = result.find((r) => r.isCluster) as POICluster;
    assert.ok(cluster, 'Should contain a cluster');
    assert.strictEqual(cluster.count, 2);
    assert.strictEqual(cluster.pois.length, 2);
    assert.strictEqual(cluster.center.x, 1);
    assert.strictEqual(cluster.center.z, 0.5);
    assert.strictEqual(isPoiInCluster('poi-1', cluster), true);
    assert.strictEqual(isPoiInCluster('poi-2', cluster), true);

    const standalone = result.find((r) => !r.isCluster) as POI;
    assert.strictEqual(standalone.id, 'poi-3');
  });

  it('handles empty POI list safely', () => {
    const result = clusterPOIs([], 30);
    assert.deepStrictEqual(result, []);
  });
});
