export default function Seal({ className = "h-9 w-9" }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2.2 2.2" />
      <circle cx="20" cy="20" r="14.5" stroke="currentColor" strokeWidth="1.2" />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 21 20 14.5 27 21" />
        <path d="M15 19.5V27h10v-7.5" />
      </g>
    </svg>
  );
}
