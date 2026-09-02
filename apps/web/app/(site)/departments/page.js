import Image from "next/image";
import Reveal from "@/components/v2/Reveal";

export const metadata = { title: "Departments — Surulere LG v2" };

const DEPARTMENTS = [
  { name: "Office of the Executive Chairman", body: "Overall administration and policy direction for the Local Government." },
  { name: "Administration & General Services", body: "Personnel, records, and the day-to-day running of the Secretariat." },
  { name: "Finance & Supplies", body: "Revenue, budgeting execution, and procurement." },
  { name: "Budget, Planning, Research & Statistics", body: "Development planning and the LGA's statistical records." },
  { name: "Works & Physical Planning", body: "Roads, drainage, public buildings, and land-use planning." },
  { name: "Health Services", body: "Primary healthcare centres and public health programmes." },
  { name: "Education", body: "Support for public primary education within the LGA." },
  { name: "Agriculture & Natural Resources", body: "Urban agriculture support and extension services." },
  { name: "Social Welfare & Community Development", body: "Community programmes, welfare support, and CDA liaison." },
  { name: "Environmental Health & Sanitation", body: "Waste management coordination and public sanitation enforcement." },
];

export default function DepartmentsPage() {
  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-20">
      <span className="v2-sample-tag">Typical structure, not a confirmed org chart</span>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-5">Departments</h1>
      <p className="text-v2-muted mt-4 max-w-2xl leading-relaxed">
        Lagos LG Secretariats are typically organised into departments along these lines.
        This list reflects that general structure — it is not Surulere&rsquo;s confirmed,
        current organogram, which would need to come directly from the Secretariat.
      </p>

      <Reveal as="div" className="relative w-full aspect-video rounded-2xl overflow-hidden border v2-placeholder mt-10">
        <Image
          src="/secretariat-2.jpeg"
          alt="Surulere Local Government Secretariat"
          fill
          sizes="90vw"
          className="object-cover"
        />
      </Reveal>

      <Reveal as="div" stagger className="mt-10 grid sm:grid-cols-2 gap-4">
        {DEPARTMENTS.map((d) => (
          <div key={d.name} className="v2-glass p-5">
            <h2 className="font-display text-base font-semibold">{d.name}</h2>
            <p className="text-sm text-v2-muted mt-1.5 leading-relaxed">{d.body}</p>
          </div>
        ))}
      </Reveal>
    </div>
  );
}
