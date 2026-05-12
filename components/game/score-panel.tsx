import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DijkstraResult, NodeId } from "@/types/graph";

type ScorePanelProps = {
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

function renderPath(path: NodeId[]): string {
  return path.length === 0 ? "-" : path.join(" -> ");
}

function formatCost(value: number | null): string {
  return value === null ? "-" : value.toString();
}

export function ScorePanel({
  playerPath,
  playerCost,
  optimalResult,
  showOptimal,
  compact = false,
  evaluationStatus,
  evaluationMessage,
  score,
  difference,
  isOptimal,
}: ScorePanelProps) {
  const statusVariant =
    evaluationStatus === "done"
      ? isOptimal
        ? "default"
        : "secondary"
      : evaluationStatus === "error"
        ? "destructive"
        : "outline";
  const statusLabel =
    evaluationStatus === "done"
      ? "Selesai"
      : evaluationStatus === "error"
        ? "Error"
        : "Siap";

  const content = (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex items-center justify-end">
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">Biaya Kamu</p>
          <p className="font-semibold">{formatCost(playerCost)}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">Biaya Optimal</p>
          <p className="font-semibold">
            {showOptimal
              ? optimalResult.reachable
                ? optimalResult.distance
                : "-"
              : "?"}
          </p>
        </div>
        <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">Score</p>
          <p className="font-semibold">{score ?? "-"}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">Selisih</p>
          <p className="font-semibold">{difference ?? "-"}</p>
        </div>
      </div>

      <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3">
        <p className="text-xs text-muted-foreground">Jalur Kamu</p>
        <p className="font-mono text-sm">{renderPath(playerPath)}</p>
      </div>

      <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3">
        <p className="text-xs text-muted-foreground">Jalur Optimal</p>
        <p className="font-mono text-sm">
          {showOptimal ? renderPath(optimalResult.path) : "?"}
        </p>
      </div>

      <div className="space-y-1 rounded-lg border border-border/70 bg-background p-3">
        <p className="text-xs text-muted-foreground">Status</p>
        {evaluationMessage ? (
          <p className="text-sm">{evaluationMessage}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Klik node lalu tekan Check.
          </p>
        )}
      </div>

      <div className="space-y-1 rounded-lg border border-border/70 bg-muted/10 p-3">
        <p className="text-xs text-muted-foreground">Info</p>
        <p className="text-sm">
          Nodes dikunjungi:{" "}
          <span className="font-medium">{showOptimal ? optimalResult.visitedNodes : "?"}</span>
        </p>
      </div>
    </div>
  );

  if (compact) {
    return content;
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Hasil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {content}
      </CardContent>
    </Card>
  );
}
