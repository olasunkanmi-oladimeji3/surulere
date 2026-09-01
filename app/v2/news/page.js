import Reveal from "@/components/v2/Reveal";

export const metadata = { title: "News & Activities — Surulere LG v2" };

const SAMPLES = [
  { date: "Sample", title: "Road rehabilitation begins on a local street", body: "Illustrative example: drainage and resurfacing works on a residential road within the LGA." },
  { date: "Sample", title: "Free health outreach at a primary healthcare centre", body: "Illustrative example: a one-day screening and vaccination outreach for residents." },
  { date: "Sample", title: "Ward town hall meeting", body: "Illustrative example: a Councillor-hosted meeting to hear resident concerns." },
  { date: "Sample", title: "CDA verification exercise in progress", body: "Illustrative example: field agents confirming property and resident records ward by ward." },
  { date: "Sample", title: "Sanitation exercise across CDAs", body: "Illustrative example: a coordinated environmental clean-up across several CDAs." },
  { date: "Sample", title: "School resumption support programme", body: "Illustrative example: distribution of learning materials ahead of a new term." },
];

export default function NewsPage() {
  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-20">
      <span className="v2-sample-tag">Sample content</span>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-5">News &amp; activities</h1>
      <p className="text-v2-muted mt-4 max-w-2xl leading-relaxed">
        No real news feed exists to pull from yet, so every card below is an illustrative
        example of the kind of update a live portal would carry — not an actual reported
        event.
      </p>

      <Reveal as="div" stagger className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SAMPLES.map((n) => (
          <div key={n.title} className="v2-glass p-5 flex flex-col gap-2">
            <span className="v2-sample-tag w-fit">{n.date}</span>
            <h2 className="font-display text-base font-semibold mt-1">{n.title}</h2>
            <p className="text-sm text-v2-muted leading-relaxed">{n.body}</p>
          </div>
        ))}
      </Reveal>
    </div>
  );
}
