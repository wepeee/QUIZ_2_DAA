import type { DijkstraResult, NodeId } from "@/types/graph";

type Props = {
  playerPath: NodeId[];
  playerCost: number | null;
  optimalResult: DijkstraResult;
  showOptimal: boolean;
  evaluationStatus: "idle" | "error" | "done";
  evaluationMessage: string | null;
  score: number | null;
  difference: number | null;
  isOptimal: boolean;
};

function fmt(v: number | null, unit = "") {
  return v === null ? "—" : `${v}${unit}`;
}
function renderPath(p: NodeId[]) {
  return p.length === 0 ? "—" : p.join(" → ");
}

export function ScorePanel({
  playerPath,
  playerCost,
  optimalResult,
  showOptimal,
  evaluationStatus,
  evaluationMessage,
  score,
  difference,
  isOptimal,
}: Props) {
  const isDone = evaluationStatus === "done";
  const isError = evaluationStatus === "error";
  const pct = score ?? 0;

  return (
    <div className="space-y-4 pt-2">
      {/* Efficiency meter */}
      {isDone && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Efficiency</span>
            <span className="font-mono font-bold text-foreground">{pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isOptimal ? "bg-[oklch(0.62_0.20_148)]" : "bg-primary"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p
            className={`text-xs font-medium ${
              isOptimal ? "text-[oklch(0.76_0.20_148)]" : "text-muted-foreground"
            }`}
          >
            {evaluationMessage}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Your Latency", value: fmt(playerCost, " ms") },
          {
            label: "Min Latency",
            value: showOptimal
              ? optimalResult.reachable
                ? `${optimalResult.distance} ms`
                : "∞"
              : "?",
          },
          {
            label: "Overhead",
            value:
              difference !== null
                ? difference === 0
                  ? "0 ms"
                  : `+${difference} ms`
                : "—",
            highlight: (difference ?? 0) > 0,
          },
          { label: "Score", value: fmt(score) },
        ].map(({ label, value, highlight }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 space-y-0.5"
          >
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            <p
              className={`font-mono text-lg font-bold leading-none ${
                highlight ? "text-[oklch(0.72_0.24_25)]" : "text-foreground"
              }`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Paths */}
      <div className="space-y-2">
        {[
          { label: "Your Route", value: renderPath(playerPath) },
          {
            label: "System Route",
            value: showOptimal ? renderPath(optimalResult.path) : "?",
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 space-y-1"
          >
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            <p className="font-mono text-[11px] text-foreground/90 break-all">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Error message */}
      {isError && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2.5">
          <p className="text-xs text-destructive">{evaluationMessage}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2">
        <p className="text-[10px] text-muted-foreground">Nodes traversed by router</p>
        <p className="font-mono text-xs font-bold text-foreground">
          {showOptimal ? optimalResult.visitedNodes : "—"}
        </p>
      </div>
    </div>
  );
}
