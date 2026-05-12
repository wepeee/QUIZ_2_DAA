import { DijkstraGame } from "@/components/game/dijkstra-game";
import { levels } from "@/data/levels";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col bg-[radial-gradient(circle_at_top,oklch(0.98_0.01_255),transparent_55%)] px-4 py-4 sm:px-6 lg:px-10">
      <section className="mx-auto w-full max-w-7xl space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Dijkstra Pathfinding Game
        </h1>
        <DijkstraGame levels={levels} />
      </section>
    </main>
  );
}
