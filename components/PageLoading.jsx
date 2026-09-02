import Image from "next/image";

export default function PageLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-muted text-sm">
      <span className="relative h-9 w-9 rounded-full overflow-hidden shrink-0 motion-safe:animate-pulse">
        <Image src="/logo.jpeg" alt="Surulere Local Government seal" fill sizes="36px" className="object-cover" />
      </span>
      Loading…
    </div>
  );
}
