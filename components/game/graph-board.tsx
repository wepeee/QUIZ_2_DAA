import { getEdgeKey } from "@/lib/algorithms/dijkstra";
import type { GraphLevel, NodeId } from "@/types/graph";

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 360;

type GraphBoardProps = {
  level: GraphLevel;
  path: NodeId[];
  onNodeClick: (nodeId: NodeId) => void;
};

export function GraphBoard({ level, path, onNodeClick }: GraphBoardProps) {
  const pathEdges = new Set<string>();
  const pathNodes = new Set(path);

  for (let index = 1; index < path.length; index += 1) {
    pathEdges.add(getEdgeKey(path[index - 1], path[index]));
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-card/60 p-3">
      <svg
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        className="h-[360px] w-full min-w-[640px]"
      >
        <rect
          x={0}
          y={0}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          rx={20}
          fill="oklch(0.985 0 0)"
        />

        {level.edges.map((edge) => {
          const fromNode = level.nodes.find((node) => node.id === edge.from);
          const toNode = level.nodes.find((node) => node.id === edge.to);

          if (!fromNode || !toNode) {
            return null;
          }

          const edgeUsed = pathEdges.has(getEdgeKey(edge.from, edge.to));
          const labelX = (fromNode.x + toNode.x) / 2;
          const labelY = (fromNode.y + toNode.y) / 2;

          return (
            <g key={edge.id}>
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={edgeUsed ? "oklch(0.55 0.2 255)" : "oklch(0.78 0 0)"}
                strokeWidth={edgeUsed ? 5 : 3}
              />
              <g transform={`translate(${labelX}, ${labelY})`}>
                <rect
                  x={-12}
                  y={-11}
                  width={24}
                  height={22}
                  rx={6}
                  fill="white"
                  stroke="oklch(0.83 0 0)"
                />
                <text
                  x={0}
                  y={4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={600}
                  fill="oklch(0.35 0 0)"
                >
                  {edge.weight}
                </text>
              </g>
            </g>
          );
        })}

        {level.nodes.map((node) => {
          const isStart = node.id === level.start;
          const isGoal = node.id === level.goal;
          const inPath = pathNodes.has(node.id);
          const fillColor = isStart
            ? "oklch(0.74 0.17 152)"
            : isGoal
              ? "oklch(0.65 0.22 25)"
              : inPath
                ? "oklch(0.63 0.19 255)"
                : "white";
          const textColor = isStart || isGoal || inPath ? "white" : "oklch(0.3 0 0)";

          return (
            <g
              key={node.id}
              role="button"
              tabIndex={0}
              aria-label={`Node ${node.label}`}
              className="cursor-pointer"
              onClick={() => onNodeClick(node.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onNodeClick(node.id);
                }
              }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={21}
                fill={fillColor}
                stroke="oklch(0.68 0 0)"
                strokeWidth={2}
              />
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                fontSize="14"
                fontWeight={700}
                fill={textColor}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
