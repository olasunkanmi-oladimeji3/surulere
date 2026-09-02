import Reveal from "@/components/v2/Reveal";
import { WARDS, CDAS, getCdasForWard } from "@/lib/wards";

export const metadata = { title: "Wards & CDAs — Surulere LG v2" };

export default function WardsPage() {
  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-20">
      <span className="v2-sample-tag">Real data — from this registry</span>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-5">Wards &amp; CDAs</h1>
      <p className="text-v2-muted mt-4 max-w-2xl leading-relaxed">
        {`${WARDS.length} wards, ${CDAS.length} Community Development Associations — the same list the property registry uses, as supplied by the CDA General Secretary. This is the one section on this page grounded entirely in the app's own real data, not sample content.`}
      </p>

      <Reveal as="div" stagger className="mt-12 grid sm:grid-cols-2 gap-4">
        {WARDS.map((ward) => {
          const cdas = getCdasForWard(ward.id);
          return (
            <div key={ward.id} className="v2-glass p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-base font-semibold">{ward.name}</h2>
                <span className="text-xs font-mono text-v2-brass-deep shrink-0">{cdas.length} CDA{cdas.length !== 1 ? "s" : ""}</span>
              </div>
              <ul className="text-sm text-v2-muted mt-2.5 space-y-1">
                {cdas.map((c) => <li key={c.id}>{c.name}</li>)}
              </ul>
            </div>
          );
        })}
      </Reveal>
    </div>
  );
}
