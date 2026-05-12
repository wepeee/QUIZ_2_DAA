import { DijkstraGame } from "@/components/game/dijkstra-game";
import { levels } from "@/data/levels";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* ── Ambient background blobs ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-64 -top-64 h-[700px] w-[700px] rounded-full bg-[oklch(0.62_0.22_268/7%)] blur-[130px]" />
        <div className="absolute -bottom-48 -right-32 h-[500px] w-[500px] rounded-full bg-[oklch(0.58_0.20_200/5%)] blur-[110px]" />
      </div>

      {/* ── Navbar ── */}
      <header className="glass sticky top-0 z-50 border-b border-border/40">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className="h-3.5 w-3.5"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <circle cx="8" cy="8" r="2.5" />
                <circle cx="2" cy="4" r="1.5" />
                <circle cx="14" cy="4" r="1.5" />
                <circle cx="2" cy="12" r="1.5" />
                <circle cx="14" cy="12" r="1.5" />
                <path d="M3.4 5 6 6.5M10 6.5l2.6-1.5M3.4 11l2.6-1.5M10 9.5l2.6 1.5" />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Dijkstra Game
            </span>
          </div>

          {/* Right pill */}
          <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-0.5 font-mono text-[11px] text-muted-foreground">
            DAA · Quiz 2
          </span>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-10">
        {/* Page heading */}
        <div className="mb-6 space-y-0.5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Pathfinding Challenge
          </h1>
          <p className="text-sm text-muted-foreground">
            Pilih jalur dari{" "}
            <span className="font-medium text-[oklch(0.64_0.20_148)]">
              Start
            </span>{" "}
            ke{" "}
            <span className="font-medium text-[oklch(0.62_0.22_25)]">Goal</span>
            , lalu bandingkan dengan Dijkstra.
          </p>
        </div>

        <DijkstraGame levels={levels} />
      </main>
    </div>
  );
}
