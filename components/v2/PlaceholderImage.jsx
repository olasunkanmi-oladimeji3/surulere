/**
 * Honest "image goes here" slot — a dashed glass frame with a photo icon and
 * caption, not a fake photo. Swap for a real <Image src=... /> later; sizing
 * comes entirely from the aspect-ratio/height classes passed via className.
 */
export default function PlaceholderImage({ label, className = "" }) {
  return (
    <div
      className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 p-8 text-center ${className}`}
      style={{ borderColor: "var(--v2-glass-border)", background: "var(--v2-glass)" }}
    >
      <svg
        className="h-10 w-10 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-v2-brass-deep)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10" r="1.5" />
        <path d="M21 15l-5-5-9 9" />
      </svg>
      <div>
        <p className="text-sm font-medium text-v2-text">Image placeholder</p>
        <p className="text-xs text-v2-muted mt-1 max-w-xs">{label}</p>
      </div>
    </div>
  );
}
