"use client";

import { useEffect, useMemo, useState } from "react";
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

const COMPLETED_KEY = "nettrace-completed";
const SUBMISSIONS_KEY = "nettrace-submissions";

type GameProps = { levels: GraphLevel[] };

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

type Submission = {
  path: NodeId[];
  score: number;
  difference: number;
  isOptimal: boolean;
};

function initialPath(level: GraphLevel): NodeId[] {
  return [level.start];
}

function evalFromSub(sub: Submission): EvalState {
  return {
    kind: "done",
    score: sub.score,
    difference: sub.difference,
    isOptimal: sub.isOptimal,
    message: sub.isOptimal
      ? "Optimal route — system match."
      : `Suboptimal (+${sub.difference} overhead)`,
  };
}

function loadCompleted(): Set<string> {
  try {
    const raw = sessionStorage.getItem(COMPLETED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveCompleted(completed: Set<string>) {
  try {
    sessionStorage.setItem(COMPLETED_KEY, JSON.stringify([...completed]));
  } catch {}
}

function loadSubmissions(): Record<string, Submission> {
  try {
    const raw = sessionStorage.getItem(SUBMISSIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSubmissions(subs: Record<string, Submission>) {
  try {
    sessionStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(subs));
  } catch {}
}

export function DijkstraGame({ levels }: GameProps) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const comp = loadCompleted();
    const subs = loadSubmissions();
    setCompleted(comp);
    setSubmissions(subs);
    // Restore submission for the initial level if it exists
    const firstSub = subs[levels[0]?.id ?? ""];
    if (firstSub) {
      setPath(firstSub.path);
      setEval(evalFromSub(firstSub));
    }
    setMounted(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const safeIndex = Math.min(levelIndex, Math.max(levels.length - 1, 0));
  const level = levels[safeIndex] ?? null;

  const [path, setPath] = useState<NodeId[]>(() =>
    levels.length > 0 ? initialPath(levels[0]) : [],
  );
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [eval_, setEval] = useState<EvalState>({ kind: "idle", message: null });

  function isUnlocked(idx: number): boolean {
    if (idx === 0) return true;
    return completed.has(levels[idx - 1]?.id ?? "");
  }

  const optimalResult = useMemo(() => {
    if (!level)
      return { path: [], distance: Infinity, reachable: false, visitedNodes: 0 };
    return dijkstra(level, level.start, level.goal);
  }, [level]);

  const playerCost = useMemo(
    () => (level ? computePathCost(level, path) : null),
    [level, path],
  );

  function handleNodeClick(nodeId: NodeId) {
    if (!level || !path.length) return;
    const last = path[path.length - 1];
    if (nodeId === last) return;
    if (path.includes(nodeId)) {
      setEval({ kind: "error", message: "Node already in route." });
      return;
    }
    if (getEdgeWeight(level, last, nodeId) === null) {
      setEval({ kind: "error", message: "No direct link to this node." });
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
      setEval({ kind: "error", message: `Route must terminate at "${level.goal}".` });
      return;
    }
    if (!playerCost || playerCost <= 0) {
      setEval({ kind: "error", message: "Invalid packet route." });
      return;
    }
    if (!optimalResult.reachable) {
      setEval({ kind: "error", message: "Destination unreachable." });
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
      message: isOptimal ? "Optimal route — system match." : `Suboptimal (+${diff} overhead)`,
    });

    if (!completed.has(level.id)) {
      const nextComp = new Set(completed);
      nextComp.add(level.id);
      setCompleted(nextComp);
      saveCompleted(nextComp);
    }
    const sub: Submission = { path, score, difference: diff, isOptimal };
    const nextSubs = { ...submissions, [level.id]: sub };
    setSubmissions(nextSubs);
    saveSubmissions(nextSubs);
    setIsReportOpen(true);
  }

  function handleLevelChange(idx: number) {
    if (!isUnlocked(idx)) return;
    const next = levels[idx];
    if (!next) return;
    setLevelIndex(idx);
    setIsReportOpen(false);
    const sub = submissions[next.id];
    if (sub) {
      setPath(sub.path);
      setEval(evalFromSub(sub));
    } else {
      setPath(initialPath(next));
      setEval({ kind: "idle", message: null });
    }
  }

  function handleNextMission() {
    const nextIdx = levelIndex + 1;
    if (nextIdx < levels.length) {
      handleLevelChange(nextIdx);
      setIsReportOpen(false);
    }
  }

  if (!level) return null;

  const isError = eval_.kind === "error";
  const isDone = eval_.kind === "done";
  const hasNextLevel = levelIndex < levels.length - 1;
  const completedCount = levels.filter((l) => completed.has(l.id)).length;

  return (
    <>
      {/* Two-column grid */}
      <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        {/* Left: Board card */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/90 p-4 shadow-[0_4px_32px_oklch(0_0_0/40%)] backdrop-blur-sm">
          {/* Board header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                Mission {safeIndex + 1}
              </p>
              <h2 className="text-sm font-semibold text-foreground leading-snug">
                {level.title}
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
                className="h-7 px-2.5 text-[11px]"
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleCheck}
                className="h-7 px-3 text-[11px] glow-violet bg-primary hover:bg-primary/90"
              >
                TRACE ✓
              </Button>
            </div>
          </div>

          {/* Graph */}
          <GraphBoard level={level} path={path} onNodeClick={handleNodeClick} />

          {/* Status bar */}
          <div className="flex min-h-[32px] items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Packet Path
              </span>
              <span className="truncate font-mono text-[11px] text-foreground/90">
                {path.join(" → ")}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {playerCost !== null && playerCost > 0 && (
                <span className="rounded-md border border-primary/50 bg-primary/20 px-2 py-0.5 font-mono text-[11px] text-primary font-semibold">
                  {playerCost} ms
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
                      ? "border-[oklch(0.52_0.20_148/60%)] bg-[oklch(0.52_0.20_148/18%)] text-[oklch(0.76_0.20_148)]"
                      : "border-primary/50 bg-primary/15 text-primary"
                  }`}
                >
                  {eval_.isOptimal ? "✓ Optimal" : `+${eval_.difference} ms`}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-3">
          {/* Mission picker */}
          <div className="rounded-2xl border border-border bg-card/90 p-4 shadow-[0_4px_32px_oklch(0_0_0/30%)] backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Missions
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {mounted ? completedCount : 0}/{levels.length} done
                </span>
                <div className="flex gap-1">
                  <span className="rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    SRC:{level.start}
                  </span>
                  <span className="rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    DST:{level.goal}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {levels.map((item, i) => {
                const unlocked = !mounted || isUnlocked(i);
                const isComp = mounted && completed.has(item.id);
                const isCurrent = i === levelIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleLevelChange(i)}
                    disabled={!unlocked}
                    title={!unlocked ? "Complete previous mission first" : item.title}
                    className={`h-9 w-full rounded-xl text-xs font-bold transition-all duration-150 ${
                      isCurrent
                        ? "bg-primary text-primary-foreground glow-violet"
                        : isComp
                          ? "border border-[oklch(0.52_0.20_148/70%)] bg-[oklch(0.52_0.20_148/15%)] text-[oklch(0.76_0.20_148)] hover:bg-[oklch(0.52_0.20_148/25%)] glow-green"
                          : unlocked
                            ? "border border-border bg-muted/50 text-muted-foreground hover:border-primary/60 hover:text-foreground"
                            : "border border-border/30 bg-muted/15 text-muted-foreground/25 cursor-not-allowed"
                    }`}
                  >
                    {mounted && !unlocked ? "🔒" : isComp && !isCurrent ? "✓" : i + 1}
                  </button>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted/50">
              <div
                className="h-full rounded-full bg-[oklch(0.62_0.20_148)] transition-all duration-700 ease-out"
                style={{ width: `${mounted ? (completedCount / levels.length) * 100 : 0}%` }}
              />
            </div>

            {/* Node / link counts */}
            <div className="mt-3 flex gap-2">
              <div className="flex-1 rounded-lg border border-border bg-muted/40 px-3 py-2">
                <p className="text-[10px] text-muted-foreground">Nodes</p>
                <p className="font-mono text-sm font-bold text-foreground">
                  {level.nodes.length}
                </p>
              </div>
              <div className="flex-1 rounded-lg border border-border bg-muted/40 px-3 py-2">
                <p className="text-[10px] text-muted-foreground">Links</p>
                <p className="font-mono text-sm font-bold text-foreground">
                  {level.edges.length}
                </p>
              </div>
            </div>
          </div>

          {/* Trace result card */}
          <div
            className={`rounded-2xl border p-4 shadow-[0_4px_32px_oklch(0_0_0/30%)] backdrop-blur-sm transition-all duration-300 ${
              isDone && eval_.isOptimal
                ? "border-[oklch(0.52_0.20_148/55%)] bg-[oklch(0.52_0.20_148/8%)]"
                : "border-border bg-card/90"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Trace Result
              </span>
              {isDone && (
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="text-[10px] text-primary hover:underline underline-offset-2"
                >
                  Full Report →
                </button>
              )}
            </div>

            {!isDone ? (
              <p className="text-xs text-muted-foreground">
                {isError ? eval_.message : "Complete your route, then hit TRACE."}
              </p>
            ) : (
              <div className="space-y-3 animate-fade-up">
                {/* Efficiency bar */}
                <div>
                  <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                    <span>Efficiency</span>
                    <span className="font-mono font-bold text-foreground">
                      {eval_.score}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
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

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Your Latency", value: `${playerCost ?? "—"} ms` },
                    {
                      label: "Min Latency",
                      value: optimalResult.reachable
                        ? `${optimalResult.distance} ms`
                        : "∞",
                    },
                    {
                      label: "Overhead",
                      value:
                        eval_.difference === 0 ? "0 ms" : `+${eval_.difference} ms`,
                      colored: eval_.difference > 0,
                    },
                    { label: "Score", value: String(eval_.score) },
                  ].map(({ label, value, colored }) => (
                    <div
                      key={label}
                      className="rounded-lg border border-border bg-muted/40 px-2.5 py-2"
                    >
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        {label}
                      </p>
                      <p
                        className={`font-mono text-base font-bold leading-tight ${
                          colored
                            ? "text-[oklch(0.72_0.24_25)]"
                            : "text-foreground"
                        }`}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <p
                  className={`text-xs font-medium ${
                    eval_.isOptimal
                      ? "text-[oklch(0.76_0.20_148)]"
                      : "text-muted-foreground"
                  }`}
                >
                  {eval_.message}
                </p>

                {hasNextLevel && (
                  <Button
                    size="sm"
                    onClick={handleNextMission}
                    className="w-full h-8 text-[11px] glow-violet bg-primary hover:bg-primary/90 mt-1"
                  >
                    Next Mission →
                  </Button>
                )}
              </div>
            )}
          </div>

          <p className="text-center text-[10px] text-muted-foreground/50">
            Click a node to extend your packet route
          </p>
        </div>
      </div>

      {/* Full report dialog */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="border-border bg-card/95 p-0 backdrop-blur-2xl sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="px-5 pt-5">
            <DialogTitle className="text-sm font-semibold">
              Trace Report — Mission {safeIndex + 1}
            </DialogTitle>
          </DialogHeader>
          <div className="px-5 pb-5">
            <ScorePanel
              playerPath={path}
              playerCost={playerCost}
              optimalResult={optimalResult}
              showOptimal={isDone}
              evaluationStatus={eval_.kind}
              evaluationMessage={eval_.message}
              score={isDone ? eval_.score : null}
              difference={isDone ? eval_.difference : null}
              isOptimal={isDone ? eval_.isOptimal : false}
            />
            {isDone && hasNextLevel && (
              <Button
                size="sm"
                onClick={() => { handleNextMission(); setIsReportOpen(false); }}
                className="w-full h-8 text-[11px] glow-violet bg-primary hover:bg-primary/90 mt-4"
              >
                Next Mission →
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
