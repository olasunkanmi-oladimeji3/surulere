const BBOX = "3.335,6.475,3.385,6.515"; // left,bottom,right,top — Surulere LGA, Lagos
const MARKER = "6.4926,3.3577"; // approx. National Stadium, Surulere
const SRC = `https://www.openstreetmap.org/export/embed.html?bbox=${BBOX}&layer=mapnik&marker=${MARKER}`;
const LINK = `https://www.openstreetmap.org/?mlat=${MARKER.split(",")[0]}&mlon=${MARKER.split(",")[1]}#map=13/${MARKER}`;

/** Real OpenStreetMap embed centered on Surulere LGA — no API key, no fabricated data. */
export default function SurulereMap() {
  return (
    <div className="w-full rounded-2xl overflow-hidden border v2-placeholder">
      <iframe
        title="Map of Surulere, Lagos"
        src={SRC}
        className="w-full aspect-video"
        style={{ border: 0 }}
        loading="lazy"
      />
      <div className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-v2-muted">
        <span>Map data © OpenStreetMap contributors</span>
        <a href={LINK} target="_blank" rel="noopener noreferrer" className="v2-glow-text shrink-0">
          View larger map ↗
        </a>
      </div>
    </div>
  );
}
