"use client";

import { useMemo, useState } from "react";
import { GraphBoard } from "@/components/game/graph-board";
import { ScorePanel } from "@/components/game/score-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

type DijkstraGameProps = {
  levels: GraphLevel[];
};

type EvaluationState =
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
    levels.length > 0 ? initialPath(levels[0]) : []
  );
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationState>({
    kind: "idle",
    message: null,
  });

  const optimalAnalysis = useMemo(() => {
    if (!level) {
      return {
        result: {
          path: [],
          distance: Number.POSITIVE_INFINITY,
          reachable: false,
          visitedNodes: 0,
        },
      };
    }

    const result = dijkstra(level, level.start, level.goal);

    return { result };
  }, [level]);

  const playerCost = useMemo(() => {
    if (!level) {
      return null;
    }

    return computePathCost(level, path);
  }, [level, path]);

  function handleNodeClick(nodeId: NodeId) {
    if (!level || path.length === 0) {
      return;
    }

    const lastNode = path[path.length - 1];

    if (nodeId === lastNode) {
      return;
    }

    if (path.includes(nodeId)) {
      setEvaluation({
        kind: "error",
        message: "Node sudah dipakai.",
      });
      return;
    }

    const weight = getEdgeWeight(level, lastNode, nodeId);

    if (weight === null) {
      setEvaluation({
        kind: "error",
        message: "Node tidak terhubung.",
      });
      return;
    }

    setPath([...path, nodeId]);
    setIsReportOpen(false);
    setEvaluation({ kind: "idle", message: null });
  }

  function handleUndo() {
    if (path.length <= 1) {
      return;
    }

    setPath(path.slice(0, -1));
    setIsReportOpen(false);
    setEvaluation({ kind: "idle", message: null });
  }

  function handleReset() {
    if (!level) {
      return;
    }

    setPath(initialPath(level));
    setIsReportOpen(false);
    setEvaluation({ kind: "idle", message: null });
  }

  function handleCheckRoute() {
    if (!level || path.length === 0) {
      return;
    }

    const endsAtGoal = path[path.length - 1] === level.goal;

    if (!endsAtGoal) {
      setEvaluation({
        kind: "error",
        message: `Akhiri di node ${level.goal}.`,
      });
      setIsReportOpen(false);
      return;
    }

    if (playerCost === null || playerCost <= 0) {
      setEvaluation({
        kind: "error",
        message: "Rute saat ini tidak valid.",
      });
      setIsReportOpen(false);
      return;
    }

    if (!optimalAnalysis.result.reachable) {
      setEvaluation({
        kind: "error",
        message: "Goal tidak dapat dicapai pada level ini.",
      });
      setIsReportOpen(false);
      return;
    }

    const difference = playerCost - optimalAnalysis.result.distance;
    const efficiencyScore = Math.round(
      (optimalAnalysis.result.distance / playerCost) * 100
    );
    const score = Math.min(100, Math.max(0, efficiencyScore));
    const isOptimal = difference === 0;

    setEvaluation({
      kind: "done",
      score,
      difference,
      isOptimal,
      message: isOptimal
        ? "Rute optimal."
        : `Belum optimal (+${difference}).`,
    });
    setIsReportOpen(true);
  }

  function handleLevelChange(nextIndex: number) {
    const nextLevel = levels[nextIndex];

    if (!nextLevel) {
      return;
    }

    setLevelIndex(nextIndex);
    setPath(initialPath(nextLevel));
    setIsReportOpen(false);
    setEvaluation({ kind: "idle", message: null });
  }

  if (!level) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No level available</CardTitle>
          <CardDescription>
            Tambahkan data level ke data/levels.ts terlebih dulu.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const nodeCount = level.nodes.length;
  const edgeCount = level.edges.length;

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
      <Card className="border-border/70 bg-card/70">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle>Board</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleUndo}>
              Undo
            </Button>
            <Button variant="secondary" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <Button size="sm" onClick={handleCheckRoute}>
              Check
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <GraphBoard level={level} path={path} onNodeClick={handleNodeClick} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-border/70 bg-card/70" size="sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Level</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-5 gap-2">
              {levels.map((item, index) => (
                <Button
                  key={item.id}
                  size="sm"
                  variant={index === levelIndex ? "default" : "outline"}
                  onClick={() => handleLevelChange(index)}
                  className="h-8 px-0"
                >
                  {index + 1}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <Badge variant="outline">S {level.start}</Badge>
              <Badge variant="outline">G {level.goal}</Badge>
              <Badge variant="secondary" className="ml-auto">
                {nodeCount}/{edgeCount}
              </Badge>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              disabled={evaluation.kind !== "done"}
              onClick={() => setIsReportOpen(true)}
            >
              Lihat Report
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle>Report</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4">
            <ScorePanel
              playerPath={path}
              playerCost={playerCost}
              optimalResult={optimalAnalysis.result}
              showOptimal={evaluation.kind === "done"}
              compact
              evaluationStatus={evaluation.kind}
              evaluationMessage={evaluation.message}
              score={evaluation.kind === "done" ? evaluation.score : null}
              difference={evaluation.kind === "done" ? evaluation.difference : null}
              isOptimal={evaluation.kind === "done" ? evaluation.isOptimal : false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
