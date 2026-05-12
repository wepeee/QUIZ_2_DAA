import type { DijkstraResult, GraphLevel, NodeId } from "@/types/graph";

type Neighbor = {
  to: NodeId;
  weight: number;
};

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
  const unvisited = new Set<NodeId>();

  for (const node of level.nodes) {
    distances.set(node.id, Number.POSITIVE_INFINITY);
    previous.set(node.id, null);
    unvisited.add(node.id);
  }

  if (!unvisited.has(start) || !unvisited.has(goal)) {
    return {
      path: [],
      distance: Number.POSITIVE_INFINITY,
      reachable: false,
      visitedNodes: 0,
    };
  }

  distances.set(start, 0);
  let visitedNodes = 0;

  while (unvisited.size > 0) {
    let currentNode: NodeId | null = null;
    let shortestDistance = Number.POSITIVE_INFINITY;

    for (const nodeId of unvisited) {
      const distance = distances.get(nodeId) ?? Number.POSITIVE_INFINITY;

      if (distance < shortestDistance) {
        shortestDistance = distance;
        currentNode = nodeId;
      }
    }

    if (currentNode === null || !Number.isFinite(shortestDistance)) {
      break;
    }

    unvisited.delete(currentNode);
    visitedNodes += 1;

    if (currentNode === goal) {
      break;
    }

    for (const neighbor of adjacency.get(currentNode) ?? []) {
      if (!unvisited.has(neighbor.to)) {
        continue;
      }

      const alternativeDistance = shortestDistance + neighbor.weight;
      const knownDistance =
        distances.get(neighbor.to) ?? Number.POSITIVE_INFINITY;

      if (alternativeDistance < knownDistance) {
        distances.set(neighbor.to, alternativeDistance);
        previous.set(neighbor.to, currentNode);
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
