import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/v2/Reveal";
import PlaceholderImage from "@/components/v2/PlaceholderImage";

export const metadata = { title: "Leadership — Surulere LG v2" };

const EXECUTIVE_TEAM = [
  { role: "Secretary to the Local Government", note: "Heads the civil-service administration of the Secretariat." },
  { role: "Supervisory Councillor — Works & Physical Planning" },
  { role: "Supervisory Councillor — Health Services" },
  { role: "Supervisory Councillor — Education" },
  { role: "Supervisory Councillor — Finance & Supplies" },
  { role: "Supervisory Councillor — Social Welfare & Community Development" },
];

export default function LeadershipPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-20">
      <span className="v2-sample-tag">Reported, not confirmed current</span>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-5">Leadership</h1>
      <p className="text-v2-muted mt-4 max-w-2xl leading-relaxed">
        Like every Lagos LGA, Surulere is led by an Executive Chairman and a Legislative
        Arm made up of elected Councillors, one per ward.
      </p>

      <Reveal as="div" className="v2-glass p-6 sm:p-8 mt-12 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
        <div className="relative h-32 w-32 rounded-full overflow-hidden border v2-placeholder shrink-0">
          <Image
            src="/chairman.jpeg"
            alt="Hon. Sulaiman Bamidele Yusuf, Executive Chairman"
            fill
            sizes="128px"
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-v2-brass-deep font-medium">Executive Chairman</p>
          <h2 className="font-display text-2xl font-semibold mt-2">Hon. Sulaiman Bamidele Yusuf</h2>
          <p className="text-sm text-v2-muted mt-3 leading-relaxed max-w-xl">
            Publicly reported as Surulere LG&rsquo;s Executive Chairman as of 2023 news
            coverage. Local government leadership can change between electoral cycles —
            confirm the current officeholder directly with the Secretariat before treating
            this as current fact.
          </p>
        </div>
      </Reveal>

      <div className="mt-14">
        <h2 className="font-display text-xl font-semibold">Executive team</h2>
        <p className="text-sm text-v2-muted mt-2 max-w-xl leading-relaxed">
          Typical roles in a Lagos LG executive team, alongside the departments each would
          usually oversee. Current appointee names weren&rsquo;t verifiable from public
          sources, so these are placeholders — not a confirmed staff list.
        </p>
        <Reveal as="div" stagger className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXECUTIVE_TEAM.map((e) => (
            <div key={e.role} className="v2-glass p-5 flex flex-col items-center text-center gap-3">
              <PlaceholderImage label={e.role} compact className="h-20 w-20 rounded-full shrink-0" />
              <div>
                <h3 className="font-display text-sm font-semibold">{e.role}</h3>
                {e.note && <p className="text-xs text-v2-muted mt-1.5 leading-relaxed">{e.note}</p>}
              </div>
            </div>
          ))}
        </Reveal>
      </div>

      <Reveal as="div" className="v2-glass p-6 sm:p-8 mt-8">
        <p className="text-xs uppercase tracking-wide text-v2-brass-deep font-medium">Legislative Arm</p>
        <h2 className="font-display text-xl font-semibold mt-2">Councillors, one per ward</h2>
        <p className="text-sm text-v2-muted mt-3 leading-relaxed max-w-xl">
          Each ward elects a Councillor to the Legislative Arm, presided over by a Leader
          of the Council. This structure is common to Lagos LGAs generally — specific
          current Councillor names aren&rsquo;t included here, since they weren&rsquo;t
          verifiable from public sources at time of writing.
        </p>
        <Link href="/wards" className="text-sm v2-glow-text mt-4 inline-block">See the wards they represent →</Link>
      </Reveal>

      <p className="text-xs text-v2-muted mt-10 leading-relaxed border-t border-v2-line pt-6">
        Sourced from 2023 public news and social reporting on Surulere LG&rsquo;s
        Executive Chairman; not an official Secretariat publication. The Chairman&rsquo;s
        photo and the LG seal used on this page were provided directly for this project.
      </p>
    </div>
  );
}
