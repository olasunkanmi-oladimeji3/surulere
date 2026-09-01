import Link from "next/link";
import Reveal from "@/components/v2/Reveal";

export const metadata = { title: "Leadership — Surulere LG v2" };

export default function LeadershipPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-20">
      <span className="v2-sample-tag">Reported, not confirmed current</span>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-5">Leadership</h1>
      <p className="text-v2-muted mt-4 max-w-2xl leading-relaxed">
        Like every Lagos LGA, Surulere is led by an Executive Chairman and a Legislative
        Arm made up of elected Councillors, one per ward.
      </p>

      <Reveal as="div" className="v2-glass p-6 sm:p-8 mt-12">
        <p className="text-xs uppercase tracking-wide text-v2-brass-deep font-medium">Executive Chairman</p>
        <h2 className="font-display text-2xl font-semibold mt-2">Hon. Sulaiman Bamidele Yusuf</h2>
        <p className="text-sm text-v2-muted mt-3 leading-relaxed max-w-xl">
          Publicly reported as Surulere LG&rsquo;s Executive Chairman as of 2023 news
          coverage. Local government leadership can change between electoral cycles —
          confirm the current officeholder directly with the Secretariat before treating
          this as current fact.
        </p>
      </Reveal>

      <Reveal as="div" className="v2-glass p-6 sm:p-8 mt-6">
        <p className="text-xs uppercase tracking-wide text-v2-brass-deep font-medium">Legislative Arm</p>
        <h2 className="font-display text-xl font-semibold mt-2">Councillors, one per ward</h2>
        <p className="text-sm text-v2-muted mt-3 leading-relaxed max-w-xl">
          Each ward elects a Councillor to the Legislative Arm, presided over by a Leader
          of the Council. This structure is common to Lagos LGAs generally — specific
          current Councillor names aren&rsquo;t included here, since they weren&rsquo;t
          verifiable from public sources at time of writing.
        </p>
        <Link href="/v2/wards" className="text-sm v2-glow-text mt-4 inline-block">See the wards they represent →</Link>
      </Reveal>

      <p className="text-xs text-v2-muted mt-10 leading-relaxed border-t border-v2-line pt-6">
        Sourced from 2023 public news and social reporting on Surulere LG&rsquo;s
        Executive Chairman; not an official Secretariat publication.
      </p>
    </div>
  );
}
