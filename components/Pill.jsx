const VARIANT = {
  ink: "pill-ink",
  brass: "pill-brass",
  restricted: "pill-restricted",
};

export default function Pill({ children, variant = "ink" }) {
  return <span className={VARIANT[variant] || VARIANT.ink}>{children}</span>;
}
