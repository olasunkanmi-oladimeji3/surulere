import Seal from "./Seal";

export default function PageLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-muted text-sm">
      <span className="text-brass motion-safe:animate-pulse">
        <Seal className="h-9 w-9" />
      </span>
      Loading…
    </div>
  );
}
