import Reveal from "@/components/v2/Reveal";
import Counter from "@/components/v2/Counter";

export const metadata = { title: "History — Surulere LG v2" };

const ERAS = [
  {
    year: "19th century",
    title: "Aguda and Saro settlement",
    body: "As Lagos grew westward across the lagoon, freed Afro-Brazilian and Afro-Cuban returnees — known locally as Aguda or Saro — settled across the wider Lagos area, part of the broader migration story that shaped districts including present-day Surulere.",
  },
  {
    year: "1976",
    title: "Surulere LGA established",
    body: "Surulere Local Government Area was formally created in 1976, during the era of local government reforms that reorganised Lagos into its present system of LGAs.",
  },
  {
    year: "Today",
    title: "A dense, central residential and commercial hub",
    body: "Surulere is now one of the most recognisable districts in central Lagos, organised into wards and Community Development Associations (CDAs) that anchor grassroots civic life.",
  },
];

export default function HistoryPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-20">
      <span className="v2-sample-tag">Sourced &amp; cited</span>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-5">A brief history of Surulere</h1>
      <p className="text-v2-muted mt-4 max-w-2xl leading-relaxed">
        Surulere sits among the oldest and most notable urban districts in Lagos State —
        established as a Local Government Area in <Counter to={1976} className="v2-glow-text font-semibold" />,
        but shaped by settlement patterns that stretch back much further.
      </p>

      <Reveal as="div" stagger className="mt-14 space-y-5">
        {ERAS.map((era) => (
          <div key={era.year} className="v2-glass p-6 sm:p-8 flex flex-col sm:flex-row gap-4 sm:gap-8">
            <p className="font-mono text-sm v2-glow-text shrink-0 sm:w-32">{era.year}</p>
            <div>
              <h2 className="font-display text-lg font-semibold">{era.title}</h2>
              <p className="text-sm text-v2-muted mt-2 leading-relaxed">{era.body}</p>
            </div>
          </div>
        ))}
      </Reveal>

      <p className="text-xs text-v2-muted mt-12 leading-relaxed border-t border-v2-line pt-6">
        General historical background drawn from public reference sources on Lagos and
        Surulere; the 1976 founding date reflects Nigeria&rsquo;s 1976 local government
        reform. This page summarises broadly known history — it is not an official
        Secretariat publication.
      </p>
    </div>
  );
}
