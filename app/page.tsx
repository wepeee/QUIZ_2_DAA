import { DijkstraGame } from "@/components/game/dijkstra-game";
import { levels } from "@/data/levels";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Ambient background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-64 -top-64 h-175 w-175 rounded-full bg-[oklch(0.64_0.24_268/9%)] blur-[130px]" />
        <div className="absolute -bottom-48 -right-32 h-125 w-125 rounded-full bg-[oklch(0.58_0.20_200/7%)] blur-[110px]" />
      </div>

      {/* Navbar */}
      <header className="glass sticky top-0 z-50 border-b border-border">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md border border-primary/40 bg-primary/15 text-primary">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className="h-3.5 w-3.5"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <circle cx="8" cy="8" r="1.8" />
                <circle cx="2" cy="3" r="1.4" />
                <circle cx="14" cy="3" r="1.4" />
                <circle cx="2" cy="13" r="1.4" />
                <circle cx="14" cy="13" r="1.4" />
                <path d="M3.3 4.3 6.3 6.5M9.7 6.5l2.9-2.2M3.3 11.7l3-2.2M9.7 9.5l2.9 2.2" />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Net<span className="text-primary">Trace</span>
            </span>
          </div>

          {/* Right pill */}
          <span className="rounded-full border border-border bg-muted/60 px-3 py-0.5 font-mono text-[11px] text-muted-foreground">
            DAA · Quiz 2
          </span>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-10">
        {/* Page heading */}
        <div className="mb-6 space-y-0.5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Packet Routing Mission
          </h1>
          <p className="text-sm text-muted-foreground">
            Route a packet from{" "}
            <span className="font-medium text-[oklch(0.68_0.20_148)]">SRC</span>{" "}
            to{" "}
            <span className="font-medium text-[oklch(0.68_0.22_25)]">DST</span>{" "}
            — then see how your route compares to the system&apos;s optimal path.
          </p>
        </div>

        <DijkstraGame levels={levels} />
      </main>
    </div>
  );
}
