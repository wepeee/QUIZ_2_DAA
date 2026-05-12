import type { DijkstraResult, NodeId } from "@/types/graph";

type Props = {
  playerPath: NodeId[];
  playerCost: number | null;
  optimalResult: DijkstraResult;
  showOptimal: boolean;
  compact?: boolean;
  evaluationStatus: "idle" | "error" | "done";
  evaluationMessage: string | null;
  score: number | null;
  difference: number | null;
  isOptimal: boolean;
};

function fmt(v: number | null) {
  return v === null ? "—" : String(v);
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
            <span className="text-muted-foreground">Efisiensi</span>
            <span className="font-mono font-semibold text-foreground">
              {pct}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/40">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isOptimal ? "bg-[oklch(0.62_0.20_148)]" : "bg-primary"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p
            className={`text-xs font-medium ${
              isOptimal
                ? "text-[oklch(0.72_0.20_148)]"
                : "text-muted-foreground"
            }`}
          >
            {evaluationMessage}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Biaya Kamu", value: fmt(playerCost) },
          {
            label: "Biaya Optimal",
            value: showOptimal
              ? optimalResult.reachable
                ? String(optimalResult.distance)
                : "∞"
              : "?",
          },
          {
            label: "Selisih",
            value:
              difference !== null
                ? difference === 0
                  ? "0"
                  : `+${difference}`
                : "—",
            highlight: (difference ?? 0) > 0,
          },
          { label: "Score", value: fmt(score) },
        ].map(({ label, value, highlight }) => (
          <div
            key={label}
            className="rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5 space-y-0.5"
          >
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            <p
              className={`font-mono text-lg font-bold leading-none ${
                highlight ? "text-[oklch(0.68_0.22_25)]" : "text-foreground"
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
          { label: "Jalur Kamu", value: renderPath(playerPath) },
          {
            label: "Jalur Optimal",
            value: showOptimal ? renderPath(optimalResult.path) : "?",
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5 space-y-1"
          >
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            <p className="font-mono text-[11px] text-foreground/85 break-all">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Error / idle message */}
      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/8 px-3 py-2.5">
          <p className="text-xs text-destructive">{evaluationMessage}</p>
        </div>
      )}

      {/* Footer info */}
      <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/10 px-3 py-2">
        <p className="text-[10px] text-muted-foreground">
          Node dikunjungi Dijkstra
        </p>
        <p className="font-mono text-xs font-semibold">
          {showOptimal ? optimalResult.visitedNodes : "—"}
        </p>
      </div>
    </div>
  );
}
