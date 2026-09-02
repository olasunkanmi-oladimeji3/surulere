import Reveal from "@/components/v2/Reveal";

export const metadata = { title: "Contact — Surulere LG v2" };

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-8 py-20">
      <span className="v2-sample-tag">Placeholder details</span>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-5">Contact</h1>
      <p className="text-v2-muted mt-4 max-w-xl leading-relaxed">
        No verified contact details were available to source for this concept, so the
        fields below are placeholders in the right shape — swap them for the
        Secretariat&rsquo;s real address, phone line and email before this page goes live
        anywhere.
      </p>

      <Reveal as="div" stagger className="mt-12 grid sm:grid-cols-3 gap-4">
        <div className="v2-glass p-5">
          <p className="text-xs uppercase tracking-wide text-v2-brass-deep font-medium">Address</p>
          <p className="text-sm mt-2 leading-relaxed">Surulere LG Secretariat<br />Surulere, Lagos, Nigeria</p>
        </div>
        <div className="v2-glass p-5">
          <p className="text-xs uppercase tracking-wide text-v2-brass-deep font-medium">Phone</p>
          <p className="text-sm font-mono mt-2">+234 (0)1 XXX XXXX</p>
        </div>
        <div className="v2-glass p-5">
          <p className="text-xs uppercase tracking-wide text-v2-brass-deep font-medium">Email</p>
          <p className="text-sm font-mono mt-2">info@surulerelg.example</p>
        </div>
      </Reveal>
    </div>
  );
}
