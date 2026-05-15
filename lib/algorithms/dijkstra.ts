import type { DijkstraResult, GraphLevel, NodeId } from "@/types/graph";

type Neighbor = {
  to: NodeId;
  weight: number;
};

class MinHeap {
  private heap: [number, NodeId][] = [];

  get size() {
    return this.heap.length;
  }

  push(dist: number, node: NodeId) {
    this.heap.push([dist, node]);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): [number, NodeId] | null {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  private bubbleUp(i: number) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.heap[parent][0] <= this.heap[i][0]) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  private sinkDown(i: number) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left][0] < this.heap[smallest][0]) smallest = left;
      if (right < n && this.heap[right][0] < this.heap[smallest][0]) smallest = right;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

export function getEdgeKey(from: NodeId, to: NodeId): string {
  return from < to ? `${from}::${to}` : `${to}::${from}`;
}

export function buildAdjacency(level: GraphLevel): Map<NodeId, Neighbor[]> {
  const adjacency = new Map<NodeId, Neighbor[]>();

  for (const node of level.nodes) {
    adjacency.set(node.id, []);
  }

  for (const edge of level.edges) {
    adjacency.get(edge.from)?.push({ to: edge.to, weight: edge.weight });
    adjacency.get(edge.to)?.push({ to: edge.from, weight: edge.weight });
  }

  return adjacency;
}

export function getEdgeWeight(
  level: GraphLevel,
  from: NodeId,
  to: NodeId
): number | null {
  for (const edge of level.edges) {
    const isMatch =
      (edge.from === from && edge.to === to) ||
      (edge.from === to && edge.to === from);

    if (isMatch) {
      return edge.weight;
    }
  }

  return null;
}

export function computePathCost(level: GraphLevel, path: NodeId[]): number | null {
  if (path.length <= 1) {
    return 0;
  }

  let totalCost = 0;

  for (let index = 1; index < path.length; index += 1) {
    const weight = getEdgeWeight(level, path[index - 1], path[index]);

    if (weight === null) {
      return null;
    }

    totalCost += weight;
  }

  return totalCost;
}

export function dijkstra(
  level: GraphLevel,
  start: NodeId,
  goal: NodeId
): DijkstraResult {
  const adjacency = buildAdjacency(level);
  const distances = new Map<NodeId, number>();
  const previous = new Map<NodeId, NodeId | null>();
  const visited = new Set<NodeId>();

  for (const node of level.nodes) {
    distances.set(node.id, Number.POSITIVE_INFINITY);
    previous.set(node.id, null);
  }

  if (!distances.has(start) || !distances.has(goal)) {
    return {
      path: [],
      distance: Number.POSITIVE_INFINITY,
      reachable: false,
      visitedNodes: 0,
    };
  }

  distances.set(start, 0);

  const heap = new MinHeap();
  heap.push(0, start);

  let visitedNodes = 0;

  while (heap.size > 0) {
    const entry = heap.pop();
    if (entry === null) break;

    const [dist, currentNode] = entry;

    if (visited.has(currentNode)) continue;
    visited.add(currentNode);
    visitedNodes += 1;

    if (currentNode === goal) break;

    for (const neighbor of adjacency.get(currentNode) ?? []) {
      if (visited.has(neighbor.to)) continue;

      const alternative = dist + neighbor.weight;
      const known = distances.get(neighbor.to) ?? Number.POSITIVE_INFINITY;

      if (alternative < known) {
        distances.set(neighbor.to, alternative);
        previous.set(neighbor.to, currentNode);
        heap.push(alternative, neighbor.to);
      }
    }
  }

  const finalDistance = distances.get(goal) ?? Number.POSITIVE_INFINITY;

  if (!Number.isFinite(finalDistance)) {
    return {
      path: [],
      distance: Number.POSITIVE_INFINITY,
      reachable: false,
      visitedNodes,
    };
  }

  const path: NodeId[] = [];
  let cursor: NodeId | null = goal;

  while (cursor !== null) {
    path.unshift(cursor);
    cursor = previous.get(cursor) ?? null;
  }

  return {
    path,
    distance: finalDistance,
    reachable: true,
    visitedNodes,
  };
}
