import Link from "next/link";
import Image from "next/image";
import { WARDS, CDAS } from "@/lib/wards";
import Reveal from "@/components/v2/Reveal";
import Counter from "@/components/v2/Counter";
import HeroHeadline from "@/components/v2/HeroHeadline";
import LandmarkCarousel from "@/components/v2/LandmarkCarousel";
import SurulereMap from "@/components/v2/SurulereMap";

export default function V2Home() {
  return (
    <>
      {/* Hero */}
      <section className="v2-mesh-bg relative">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 pt-24 pb-20 lg:pt-32 lg:pb-28 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:items-center">
          <div>
            <span className="v2-sample-tag">Concept preview · v2</span>
            <HeroHeadline className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] font-semibold mt-6 max-w-3xl">
              Surulere Local Government, reimagined for what&rsquo;s next.
            </HeroHeadline>
            <p className="text-v2-muted text-base sm:text-lg mt-6 max-w-xl leading-relaxed">
              BYE-LAW to establish requirements for proof of address(Know your neighbour) for residents of surulere local government area of lagos state.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/history" className="v2-glow-btn px-5 py-3">Explore the LGA</Link>
              <Link href="/registry" className="v2-ghost-btn px-5 py-3">Go to the registry ↗</Link>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-xl">
              <Stat value={<Counter to={1976} className="font-display v2-glow-text text-2xl sm:text-3xl font-semibold" />} label="Established" />
              <Stat value={<Counter to={WARDS.length} className="font-display v2-glow-text text-2xl sm:text-3xl font-semibold" />} label="Wards" />
              <Stat value={<Counter to={CDAS.length} className="font-display v2-glow-text text-2xl sm:text-3xl font-semibold" />} label="CDAs on record" />
            </div>
          </div>

          <div className="relative w-full aspect-video lg:aspect-[4/3] rounded-2xl overflow-hidden border v2-placeholder">
            <Image
              src="/secretariat-1.jpeg"
              alt="Surulere Local Government Secretariat building"
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Landmark carousel */}
      <Reveal as="section" className="max-w-6xl mx-auto px-5 lg:px-8 py-16 grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-center">
        <LandmarkCarousel />
        <div>
          <p className="text-xs uppercase tracking-wide text-v2-brass-deep font-medium mb-3">Around Surulere</p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold">Streets residents know by heart</h2>
          <p className="text-v2-muted mt-4 max-w-md leading-relaxed">
            From Shitta and Ogunlana Drive to Ojuelegba and the National Stadium corridor,
            Surulere&rsquo;s wards are dense, walkable, and unmistakably central Lagos.
          </p>
        </div>
      </Reveal>

      {/* Map */}
      <Reveal as="section" className="max-w-6xl mx-auto px-5 lg:px-8 pb-16">
        <p className="text-xs uppercase tracking-wide text-v2-brass-deep font-medium mb-3">Find your way</p>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-6">Surulere on the map</h2>
        <SurulereMap />
      </Reveal>

      {/* Section previews */}
      <Reveal as="section" stagger className="max-w-6xl mx-auto px-5 lg:px-8 py-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <PreviewCard href="/history" title="History" body="Founded 1976 — from Lagos's westward growth to a defining Surulere identity." />
        <PreviewCard href="/leadership" title="Leadership" body="The Executive Chairman and the Council's Legislative Arm." />
        <PreviewCard href="/departments" title="Departments" body="How a Lagos LG Secretariat is typically organised, office by office." />
        <PreviewCard href="/wards" title="Wards & CDAs" body="Every ward and Community Development Association on record." />
        <PreviewCard href="/news" title="News & activities" body="Sample coverage of the kind of updates a live portal would carry." />
        <PreviewCard href="/contact" title="Contact" body="How residents would reach the Secretariat." />
      </Reveal>
    </>
  );
}

function Stat({ value, label }) {
  return (
    <div className="flex flex-col gap-1">
      {value}
      <span className="text-xs text-v2-muted uppercase tracking-wide">{label}</span>
    </div>
  );
}

function PreviewCard({ href, title, body }) {
  return (
    <Link href={href} className="v2-glass p-6 flex flex-col gap-2 hover:-translate-y-0.5 transition-transform">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="text-sm text-v2-muted leading-relaxed">{body}</p>
      <span className="text-sm v2-glow-text mt-2">Explore →</span>
    </Link>
  );
}
