export type NodeId = string;

export type GraphNode = {
  id: NodeId;
  label: string;
  x: number;
  y: number;
};

export type GraphEdge = {
  id: string;
  from: NodeId;
  to: NodeId;
  weight: number;
};

export type GraphLevel = {
  id: string;
  title: string;
  description: string;
  start: NodeId;
  goal: NodeId;
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type DijkstraResult = {
  path: NodeId[];
  distance: number;
  reachable: boolean;
  visitedNodes: number;
};
