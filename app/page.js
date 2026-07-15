import Link from "next/link";
import Seal from "@/components/Seal";
import Stamp from "@/components/Stamp";
import Pill from "@/components/Pill";
import Icon from "@/components/Icon";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="text-text">
      <header className="border-b border-line bg-surface/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 text-ink">
              <span className="text-brass"><Image src="/logo.png" alt="Ilé Surulere" width={32} height={32} /></span>
            <span className="font-display font-semibold text-base">Ilé Surulere</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted">
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#roles" className="hover:text-ink">Who it&rsquo;s for</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link href="/login" className="btn-ghost text-sm px-3.5 py-2">Log in</Link>
            <Link href="/signup" className="btn-primary text-sm px-4 py-2">Register as an owner</Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-5 lg:px-8 pt-14 pb-16 lg:pt-20 lg:pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Pill variant="brass">Surulere Local Government · Pilot registry</Pill>
            <h1 className="font-display text-4xl lg:text-[2.75rem] leading-[1.1] font-semibold text-ink mt-5">
              Every property in Surulere, on record.
            </h1>
            <p className="mt-5 text-base text-muted leading-relaxed max-w-md">
              Property owners list their houses and tenants, Community Development
              Associations confirm it on the ground, and the Local Government keeps
              a single, trustworthy record — without handing anyone more access to
              personal data than their work needs.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="btn-primary px-5 py-3">Register as an owner</Link>
              <Link href="/login" className="btn-secondary px-5 py-3">I already have an account</Link>
            </div>
            <p className="mt-5 text-xs text-muted">
              Tenants don&rsquo;t sign up here — your landlord adds you, and you&rsquo;ll
              get your own login by email the moment they do.
            </p>
          </div>

          <div className="card p-1.5 shadow-sm">
            <div className="card-header bg-ink border-ink rounded-t-[var(--radius-card)]">
              <div className="flex items-center gap-2 text-on-ink">
                <span className="text-brass"><Seal className="h-6 w-6" /></span>
                <span className="text-sm font-medium">Property record</span>
              </div>
              <span className="font-mono text-xs text-on-ink/70">Sample</span>
            </div>
            <div className="card-body space-y-4">
              <div>
                <p className="text-xs text-muted uppercase tracking-wide">Address</p>
                <p className="font-display text-lg text-ink">14 Bode Thomas Street</p>
                <p className="text-sm text-muted">Ward E1 · Owner: Ronke Afolabi</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Stamp id="PROP-E1-0001" status="verified" />
                <Stamp id="PROP-E1-0001-U01" status="verified" />
              </div>
              <div className="border-t border-line pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted uppercase tracking-wide">CDA</p>
                  <p className="text-sm font-medium text-ink mt-0.5">Ojuelegba CDA</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wide">Tenant</p>
                  <p className="text-sm font-medium text-ink mt-0.5">Biodun Salako — RES-000101</p>
                </div>
              </div>
              <div className="border-t border-line pt-4">
                <p className="text-xs text-muted uppercase tracking-wide mb-2">Tenant&rsquo;s NIN, masked for CDA view</p>
                <p className="font-mono text-sm text-ink">•••••••5812</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="bg-surface border-y border-line">
          <div className="max-w-6xl mx-auto px-5 lg:px-8 py-16">
            <h2 className="font-display text-2xl text-ink font-semibold">How a property gets on the registry</h2>
            <p className="text-muted mt-2 max-w-lg">A few different people, one shared record.</p>
            <div className="mt-10 grid md:grid-cols-3 gap-8">
              <Step n="Step 1" title="The owner registers">
                A landlord signs up and lists their property — address, ward, CDA,
                units, any domestic staff. Or a CDA member registers it for them
                on a site visit, and the owner gets their login by email instead.
              </Step>
              <Step n="Step 2" title="The owner adds each tenant">
                Tenants never sign up themselves. The owner fills in each tenant&rsquo;s
                details against their unit, and the tenant is emailed their own
                Resident ID and a temporary password the moment it&rsquo;s submitted.
              </Step>
              <Step n="Step 3" title="CDA verifies, LG Staff oversee">
                A CDA member visits, confirms what&rsquo;s on file, and marks it verified
                or flagged — NIN stays hidden from them throughout. LG Staff can see
                and search everyone, and are the only office that can add a CDA member.
              </Step>
            </div>
          </div>
        </section>

        {/* Roles */}
        <section id="roles" className="max-w-6xl mx-auto px-5 lg:px-8 py-16">
          <h2 className="font-display text-2xl text-ink font-semibold">Built for four different jobs</h2>
          <p className="text-muted mt-2 max-w-lg">Each role sees exactly what it needs — nothing held back, nothing over-shared.</p>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <RoleCard icon="house" title="Property owner" href="/signup" cta="Register a property →">
              List your properties and tenants, and keep both up to date.
            </RoleCard>
            <RoleCard icon="doorOpen" title="Tenant" href="/login" cta="Log in →">
              Added by your landlord — log in to see your own record and household.
            </RoleCard>
            <RoleCard icon="shield" title="CDA member" href="/login" cta="Log in →">
              Issued by LG Staff. Verify properties in your ward, with NIN masked.
            </RoleCard>
            <RoleCard icon="building" title="LG Staff" href="/login" cta="Log in →">
              Full visibility across the LGA, full profiles for everyone, plus the only office that can add a CDA member.
            </RoleCard>
          </div>
        </section>

        {/* CTA band */}
        <section className="bg-ink">
          <div className="max-w-6xl mx-auto px-5 lg:px-8 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-xl lg:text-2xl text-on-ink font-semibold">Own property in Surulere?</h2>
              <p className="text-on-ink/70 mt-1.5 text-sm">Get it on the record in a few minutes.</p>
            </div>
            <Link href="/signup" className="btn-brass px-5 py-3 shrink-0">Register your property</Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-ink">
            <Icon name="house" className="h-5 w-5" />
            <span className="font-display text-sm font-semibold">Ilé Surulere</span>
          </div>
          <p className="text-xs text-muted text-center md:text-right max-w-md">
            Demo build for the Surulere Local Government Secretariat — a working
            prototype of the registry, not a live record of real residents.
            See SPEC.md for the full plan.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Step({ n, title, children }) {
  return (
    <div>
      <div className="font-mono text-xs text-brass border border-brass/40 bg-brass-tint rounded-[var(--radius-stamp)] w-fit px-2 py-0.5 mb-3">{n}</div>
      <h3 className="font-display text-lg text-ink">{title}</h3>
      <p className="text-sm text-muted mt-2 leading-relaxed">{children}</p>
    </div>
  );
}

function RoleCard({ icon, title, href, cta, children }) {
  return (
    <div className="card card-body">
      <span className="text-brass"><Icon name={icon} className="h-5 w-5" /></span>
      <h3 className="font-display text-base text-ink mt-3">{title}</h3>
      <p className="text-sm text-muted mt-1.5 leading-relaxed">{children}</p>
      <Link href={href} className="text-sm font-medium text-brass mt-3 inline-block hover:underline">{cta}</Link>
    </div>
  );
}
