const VARIANT = {
  verified: { box: "stamp-verified", dot: "bg-verified" },
  pending: { box: "stamp-pending", dot: "bg-pending" },
  flagged: { box: "stamp-flagged", dot: "bg-flagged" },
};

export default function Stamp({ id, status, hideDot = false }) {
  const v = VARIANT[status] || { box: "stamp-neutral", dot: "bg-muted" };
  return (
    <span className={`stamp ${v.box}`}>
      {!hideDot && <span className={`stamp-dot ${v.dot}`} />}
      {id}
    </span>
  );
}
