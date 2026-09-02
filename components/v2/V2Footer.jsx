import Link from "next/link";

export default function V2Footer() {
  return (
    <footer className="border-t border-v2-line mt-24">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <p className="font-display text-base font-semibold text-v2-text">Ilé Surulere</p>
          <p className="text-sm text-v2-muted mt-2 leading-relaxed max-w-xs">
            A concept redesign exploring what a modern front door for the Surulere
            Local Government Secretariat could look like.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-v2-brass-deep font-medium mb-3">Explore</p>
          <ul className="space-y-2 text-sm text-v2-muted">
            <li><Link href="/history" className="hover:text-v2-text">History</Link></li>
            <li><Link href="/leadership" className="hover:text-v2-text">Leadership</Link></li>
            <li><Link href="/departments" className="hover:text-v2-text">Departments</Link></li>
            <li><Link href="/wards" className="hover:text-v2-text">Wards &amp; CDAs</Link></li>
            <li><Link href="/news" className="hover:text-v2-text">News</Link></li>
            <li><Link href="/contact" className="hover:text-v2-text">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-v2-brass-deep font-medium mb-3">Resident Registry</p>
          <ul className="space-y-2 text-sm text-v2-muted">
            <li><Link href="/registry" className="hover:text-v2-text">Overview</Link></li>
            <li><Link href="/registry/login" className="hover:text-v2-text">Log in</Link></li>
            <li><Link href="/registry/signup" className="hover:text-v2-text">Register as an owner</Link></li>
            <li><Link href="/registry/field-form" className="hover:text-v2-text">Field data collection</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-v2-brass-deep font-medium mb-3">About this page</p>
          <p className="text-sm text-v2-muted leading-relaxed">
            History and ward/CDA data are sourced and cited where noted. Departments,
            news, activities and contact details are illustrative sample content, not
            confirmed current records — see each page for specifics.
          </p>
        </div>
      </div>
    </footer>
  );
}
