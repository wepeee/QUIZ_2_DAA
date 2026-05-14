import { getEdgeKey } from "@/lib/algorithms/dijkstra";
import type { GraphLevel, NodeId } from "@/types/graph";

const W = 700;
const H = 360;

// ── Color constants (dark-mode palette) ──
const C = {
  bg: "oklch(0.09 0.012 265)",
  dot: "oklch(0.30 0.018 265 / 50%)",
  edgeDim: "oklch(0.36 0.020 265)",
  edgeActive: "oklch(0.64 0.24 268)",
  edgeGlow: "oklch(0.64 0.24 268 / 24%)",
  wBg: "oklch(0.16 0.018 265)",
  wBorder: "oklch(0.34 0.022 265)",
  wBorderActive: "oklch(0.64 0.24 268)",
  wText: "oklch(0.68 0.020 265)",
  wTextActive: "oklch(0.72 0.24 268)",
  nodeDefault: "oklch(0.18 0.018 265)",
  nodeBorder: "oklch(0.40 0.022 265)",
  nodeText: "oklch(0.72 0.020 265)",
  nodeStart: "oklch(0.50 0.20 148)",
  nodeStartGlow: "oklch(0.50 0.20 148 / 26%)",
  nodeGoal: "oklch(0.55 0.22 25)",
  nodeGoalGlow: "oklch(0.55 0.22 25 / 26%)",
  nodePath: "oklch(0.52 0.22 268)",
  nodePathGlow: "oklch(0.52 0.22 268 / 24%)",
  nodeWhiteText: "oklch(0.97 0 0)",
};

type Props = {
  level: GraphLevel;
  path: NodeId[];
  onNodeClick: (id: NodeId) => void;
};

export function GraphBoard({ level, path, onNodeClick }: Props) {
  const pathEdgeSet = new Set<string>();
  const pathNodeSet = new Set(path);
  for (let i = 1; i < path.length; i++) {
    pathEdgeSet.add(getEdgeKey(path[i - 1], path[i]));
  }

  /* grid dots */
  const dots: { x: number; y: number }[] = [];
  for (let gx = 56; gx <= W - 40; gx += 72)
    for (let gy = 36; gy <= H - 30; gy += 72) dots.push({ x: gx, y: gy });

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-[oklch(0.09_0.012_265)] shadow-inner">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-[340px] w-full min-w-[580px]"
        style={{ display: "block" }}
      >
        {/* Background */}
        <rect x={0} y={0} width={W} height={H} rx={14} fill={C.bg} />

        {/* Dot grid */}
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={1} fill={C.dot} />
        ))}

        {/* ── Edges ── */}
        {level.edges.map((edge) => {
          const fn = level.nodes.find((n) => n.id === edge.from);
          const tn = level.nodes.find((n) => n.id === edge.to);
          if (!fn || !tn) return null;

          const used = pathEdgeSet.has(getEdgeKey(edge.from, edge.to));
          const mx = (fn.x + tn.x) / 2;
          const my = (fn.y + tn.y) / 2;

          return (
            <g key={edge.id}>
              {/* Glow */}
              {used && (
                <line
                  x1={fn.x}
                  y1={fn.y}
                  x2={tn.x}
                  y2={tn.y}
                  stroke={C.edgeGlow}
                  strokeWidth={14}
                  strokeLinecap="round"
                />
              )}
              {/* Line */}
              <line
                x1={fn.x}
                y1={fn.y}
                x2={tn.x}
                y2={tn.y}
                stroke={used ? C.edgeActive : C.edgeDim}
                strokeWidth={used ? 2 : 1.5}
                strokeLinecap="round"
              />
              {/* Weight bubble */}
              <g transform={`translate(${mx},${my})`}>
                <rect
                  x={-11}
                  y={-9}
                  width={22}
                  height={18}
                  rx={5}
                  fill={C.wBg}
                  stroke={used ? C.wBorderActive : C.wBorder}
                  strokeWidth={used ? 1.2 : 0.8}
                />
                <text
                  x={0}
                  y={4.5}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight={600}
                  fontFamily="var(--font-geist-mono, monospace)"
                  fill={used ? C.wTextActive : C.wText}
                >
                  {edge.weight}
                </text>
              </g>
            </g>
          );
        })}

        {/* ── Nodes ── */}
        {level.nodes.map((node) => {
          const isStart = node.id === level.start;
          const isGoal = node.id === level.goal;
          const inPath = pathNodeSet.has(node.id);
          const special = isStart || isGoal || inPath;

          const fill = isStart
            ? C.nodeStart
            : isGoal
              ? C.nodeGoal
              : inPath
                ? C.nodePath
                : C.nodeDefault;

          const glow = isStart
            ? C.nodeStartGlow
            : isGoal
              ? C.nodeGoalGlow
              : inPath
                ? C.nodePathGlow
                : null;

          const stroke = isStart
            ? "oklch(0.62 0.18 148)"
            : isGoal
              ? "oklch(0.65 0.22 25)"
              : inPath
                ? "oklch(0.68 0.22 268)"
                : C.nodeBorder;

          const textFill = special ? C.nodeWhiteText : C.nodeText;

          return (
            <g
              key={node.id}
              role="button"
              tabIndex={0}
              aria-label={`Node ${node.label}`}
              className="cursor-pointer"
              onClick={() => onNodeClick(node.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onNodeClick(node.id);
                }
              }}
            >
              {/* Glow halo */}
              {glow && <circle cx={node.x} cy={node.y} r={30} fill={glow} />}
              {/* Dashed ring for start / goal */}
              {(isStart || isGoal) && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={25}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={0.8}
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
              )}
              {/* Main circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={19}
                fill={fill}
                stroke={stroke}
                strokeWidth={special ? 1.5 : 1}
              />
              {/* Label */}
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                fontSize="12"
                fontWeight={700}
                fontFamily="var(--font-geist-sans, sans-serif)"
                fill={textFill}
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
