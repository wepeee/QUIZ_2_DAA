"use client";

import { useMemo, useState } from "react";
import { GraphBoard } from "@/components/game/graph-board";
import { ScorePanel } from "@/components/game/score-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  computePathCost,
  dijkstra,
  getEdgeWeight,
} from "@/lib/algorithms/dijkstra";
import type { GraphLevel, NodeId } from "@/types/graph";

type DijkstraGameProps = { levels: GraphLevel[] };

type EvalState =
  | { kind: "idle"; message: null }
  | { kind: "error"; message: string }
  | {
      kind: "done";
      message: string;
      score: number;
      difference: number;
      isOptimal: boolean;
    };

function initialPath(level: GraphLevel): NodeId[] {
  return [level.start];
}

export function DijkstraGame({ levels }: DijkstraGameProps) {
  const [levelIndex, setLevelIndex] = useState(0);
  const safeIndex = Math.min(levelIndex, Math.max(levels.length - 1, 0));
  const level = levels[safeIndex] ?? null;

  const [path, setPath] = useState<NodeId[]>(() =>
    levels.length > 0 ? initialPath(levels[0]) : [],
  );
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [eval_, setEval] = useState<EvalState>({ kind: "idle", message: null });

  const optimalResult = useMemo(() => {
    if (!level)
      return {
        path: [],
        distance: Infinity,
        reachable: false,
        visitedNodes: 0,
      };
    return dijkstra(level, level.start, level.goal);
  }, [level]);

  const playerCost = useMemo(
    () => (level ? computePathCost(level, path) : null),
    [level, path],
  );

  /* ── Handlers ── */
  function handleNodeClick(nodeId: NodeId) {
    if (!level || !path.length) return;
    const last = path[path.length - 1];
    if (nodeId === last) return;
    if (path.includes(nodeId)) {
      setEval({ kind: "error", message: "Node sudah dipilih." });
      return;
    }
    if (getEdgeWeight(level, last, nodeId) === null) {
      setEval({ kind: "error", message: "Tidak ada edge ke node ini." });
      return;
    }
    setPath([...path, nodeId]);
    setEval({ kind: "idle", message: null });
  }

  function handleUndo() {
    if (path.length <= 1) return;
    setPath(path.slice(0, -1));
    setEval({ kind: "idle", message: null });
  }

  function handleReset() {
    if (!level) return;
    setPath(initialPath(level));
    setIsReportOpen(false);
    setEval({ kind: "idle", message: null });
  }

  function handleCheck() {
    if (!level || !path.length) return;
    if (path[path.length - 1] !== level.goal) {
      setEval({ kind: "error", message: `Akhiri di node "${level.goal}".` });
      return;
    }
    if (!playerCost || playerCost <= 0) {
      setEval({ kind: "error", message: "Rute tidak valid." });
      return;
    }
    if (!optimalResult.reachable) {
      setEval({ kind: "error", message: "Goal tidak dapat dicapai." });
      return;
    }
    const diff = playerCost - optimalResult.distance;
    const score = Math.min(
      100,
      Math.max(0, Math.round((optimalResult.distance / playerCost) * 100)),
    );
    const isOptimal = diff === 0;
    setEval({
      kind: "done",
      score,
      difference: diff,
      isOptimal,
      message: isOptimal ? "Rute optimal!" : `Belum optimal (+${diff})`,
    });
    setIsReportOpen(true);
  }

  function handleLevelChange(idx: number) {
    const next = levels[idx];
    if (!next) return;
    setLevelIndex(idx);
    setPath(initialPath(next));
    setIsReportOpen(false);
    setEval({ kind: "idle", message: null });
  }

  if (!level) return null;

  const isError = eval_.kind === "error";
  const isDone = eval_.kind === "done";

  return (
    <>
      {/* ── Two-column grid ── */}
      <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        {/* ── Left: Board card ── */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/60 p-4 shadow-[0_2px_24px_oklch(0_0_0/25%)] backdrop-blur-sm">
          {/* Board header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                Level {safeIndex + 1}
              </p>
              <h2 className="text-sm font-semibold text-foreground leading-snug">
                {level.title.replace(/^Level \d+:\s*/, "")}
              </h2>
            </div>

            {/* Action buttons */}
            <div className="flex shrink-0 gap-1.5">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleUndo}
                className="h-7 px-2.5 text-[11px] text-muted-foreground hover:text-foreground"
              >
                ↩ Undo
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReset}
                className="h-7 px-2.5 text-[11px] border-border/60"
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleCheck}
                className="h-7 px-3 text-[11px] glow-violet bg-primary hover:bg-primary/90"
              >
                Check ✓
              </Button>
            </div>
          </div>

          {/* Graph */}
          <GraphBoard level={level} path={path} onNodeClick={handleNodeClick} />

          {/* Status bar */}
          <div className="flex min-h-[32px] items-center justify-between gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Jalur
              </span>
              <span className="truncate font-mono text-[11px] text-foreground/80">
                {path.join(" → ")}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {playerCost !== null && playerCost > 0 && (
                <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[11px] text-primary">
                  {playerCost}
                </span>
              )}
              {isError && (
                <Badge variant="destructive" className="h-5 text-[10px] px-2">
                  {eval_.message}
                </Badge>
              )}
              {isDone && (
                <Badge
                  variant="outline"
                  className={`h-5 text-[10px] px-2 ${
                    eval_.isOptimal
                      ? "border-[oklch(0.52_0.20_148/50%)] bg-[oklch(0.52_0.20_148/12%)] text-[oklch(0.72_0.20_148)]"
                      : "border-primary/40 bg-primary/10 text-primary"
                  }`}
                >
                  {eval_.isOptimal ? "✓ Optimal" : `+${eval_.difference}`}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex flex-col gap-3">
          {/* Level picker */}
          <div className="rounded-2xl border border-border/50 bg-card/60 p-4 shadow-[0_2px_24px_oklch(0_0_0/20%)] backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Level
              </span>
              <div className="flex gap-1">
                <span className="rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  S:{level.start}
                </span>
                <span className="rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  G:{level.goal}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {levels.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => handleLevelChange(i)}
                  className={`h-9 w-full rounded-xl text-xs font-semibold transition-all duration-150 ${
                    i === levelIndex
                      ? "bg-primary text-primary-foreground glow-violet"
                      : "border border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Node/edge info */}
            <div className="mt-3 flex gap-2">
              <div className="flex-1 rounded-lg border border-border/40 bg-muted/20 px-3 py-2">
                <p className="text-[10px] text-muted-foreground">Nodes</p>
                <p className="font-mono text-sm font-semibold">
                  {level.nodes.length}
                </p>
              </div>
              <div className="flex-1 rounded-lg border border-border/40 bg-muted/20 px-3 py-2">
                <p className="text-[10px] text-muted-foreground">Edges</p>
                <p className="font-mono text-sm font-semibold">
                  {level.edges.length}
                </p>
              </div>
            </div>
          </div>

          {/* Score card */}
          <div
            className={`rounded-2xl border p-4 shadow-[0_2px_24px_oklch(0_0_0/20%)] backdrop-blur-sm transition-all duration-300 ${
              isDone && eval_.isOptimal
                ? "border-[oklch(0.52_0.20_148/40%)] bg-[oklch(0.52_0.20_148/6%)]"
                : "border-border/50 bg-card/60"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Hasil
              </span>
              {isDone && (
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="text-[10px] text-primary hover:underline underline-offset-2"
                >
                  Detail →
                </button>
              )}
            </div>

            {!isDone ? (
              <p className="text-xs text-muted-foreground">
                {isError ? eval_.message : "Selesaikan rute lalu tekan Check."}
              </p>
            ) : (
              <div className="space-y-3 animate-fade-up">
                {/* Efficiency bar */}
                <div>
                  <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                    <span>Efisiensi</span>
                    <span className="font-mono font-semibold text-foreground">
                      {eval_.score}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        eval_.isOptimal
                          ? "bg-[oklch(0.62_0.20_148)]"
                          : "bg-primary"
                      }`}
                      style={{ width: `${eval_.score}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Biayamu", value: playerCost ?? "—" },
                    {
                      label: "Optimal",
                      value: optimalResult.reachable
                        ? optimalResult.distance
                        : "∞",
                    },
                    {
                      label: "Selisih",
                      value:
                        eval_.difference === 0 ? "0" : `+${eval_.difference}`,
                      colored: eval_.difference > 0,
                    },
                    { label: "Score", value: eval_.score },
                  ].map(({ label, value, colored }) => (
                    <div
                      key={label}
                      className="rounded-lg border border-border/40 bg-muted/20 px-2.5 py-2"
                    >
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        {label}
                      </p>
                      <p
                        className={`font-mono text-base font-bold leading-tight ${
                          colored
                            ? "text-[oklch(0.68_0.22_25)]"
                            : "text-foreground"
                        }`}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Message */}
                <p
                  className={`text-xs font-medium ${
                    eval_.isOptimal
                      ? "text-[oklch(0.72_0.20_148)]"
                      : "text-muted-foreground"
                  }`}
                >
                  {eval_.message}
                </p>
              </div>
            )}
          </div>

          {/* Hint */}
          <p className="text-center text-[10px] text-muted-foreground/60">
            Klik node untuk memilih jalur
          </p>
        </div>
      </div>

      {/* ── Full report dialog ── */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="border-border/60 bg-card/95 p-0 backdrop-blur-2xl sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="px-5 pt-5">
            <DialogTitle className="text-sm font-semibold">
              Laporan Lengkap
            </DialogTitle>
          </DialogHeader>
          <div className="px-5 pb-5">
            <ScorePanel
              playerPath={path}
              playerCost={playerCost}
              optimalResult={optimalResult}
              showOptimal={isDone}
              compact
              evaluationStatus={eval_.kind}
              evaluationMessage={eval_.message}
              score={isDone ? eval_.score : null}
              difference={isDone ? eval_.difference : null}
              isOptimal={isDone ? eval_.isOptimal : false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
