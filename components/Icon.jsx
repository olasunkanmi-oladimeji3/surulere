const PATHS = {
  house: "M3 9.5 12 3l9 6.5M5 8.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V8.5",
  shield: "M12 3 4 6v6c0 5 3.5 7.8 8 9 4.5-1.2 8-4 8-9V6l-8-3Z",
  users: "M2 20c0-3.3 3-6 7-6s7 2.7 7 6M22 20c0-2.5-1.9-4.6-4.5-5.4",
  doorOpen: "M3 21h12M9 21V4l9-1v18",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  plus: "M12 5v14M5 12h14",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
  arrowLeft: "M19 12H5M11 18l-6-6 6-6",
  check: "M20 6 9 17l-5-5",
  flag: "M5 21V4M5 4h13l-3 4 3 4H5",
  search: "M21 21l-4.3-4.3",
  building: "M4 21V6l8-3 8 3v15M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01",
  x: "M18 6 6 18M6 6l12 12",
  key: "M14.5 9.5a3.5 3.5 0 1 1-4.9-4.9 3.5 3.5 0 0 1 4.9 4.9ZM10.6 13.4 3 21M16 14l2 2M19 11l2 2",
  edit: "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z",
};

const CIRCLES = {
  users: [{ cx: 9, cy: 8, r: 3 }, { cx: 17, cy: 9, r: 2.3 }],
  search: [{ cx: 11, cy: 11, r: 7 }],
};

export default function Icon({ name, className = "h-4 w-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {(CIRCLES[name] || []).map((c, i) => (
        <circle key={i} cx={c.cx} cy={c.cy} r={c.r} />
      ))}
      <path d={PATHS[name] || ""} />
    </svg>
  );
}
