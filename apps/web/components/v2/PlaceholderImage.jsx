/**
 * Honest "image goes here" slot — a dashed glass frame with a photo icon and
 * caption, not a fake photo. Swap for a real <Image src=... /> later; sizing
 * (including border-radius) comes entirely from the className passed in.
 * `compact` hides the caption for small headshot-style uses — the label
 * still reaches assistive tech via aria-label on the frame itself.
 */
export default function PlaceholderImage({ label, className = "", compact = false }) {
  return (
    <div
      role="img"
      aria-label={`Placeholder image: ${label}`}
      className={`v2-placeholder border-2 border-dashed flex flex-col items-center justify-center text-center transition-all duration-200 ${compact ? "gap-1 p-2" : "gap-3 p-8"} ${className}`}
      style={{ borderColor: "var(--v2-glass-border)", background: "var(--v2-glass)" }}
    >
      <svg
        aria-hidden="true"
        className={`${compact ? "h-6 w-6" : "h-10 w-10"} shrink-0`}
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
      {!compact && (
        <div aria-hidden="true">
          <p className="text-sm font-medium text-v2-text">Image placeholder</p>
          <p className="text-xs text-v2-muted mt-1 max-w-xs">{label}</p>
        </div>
      )}
    </div>
  );
}
