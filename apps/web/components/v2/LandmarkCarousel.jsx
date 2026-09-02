"use client";

import { useState } from "react";
import Image from "next/image";
import PlaceholderImage from "./PlaceholderImage";

const LANDMARKS = [
  { type: "photo", src: "/shitta-roundabout.jpeg", caption: "Shitta roundabout" },
  { type: "photo", src: "/ojuelegba.jpeg", caption: "Ojuelegba junction" },
  { type: "photo", src: "/ogunlana.jpeg", caption: "Ogunlana Drive" },
  { type: "placeholder", caption: "National Stadium, Lagos" },
];

export default function LandmarkCarousel() {
  const [index, setIndex] = useState(0);
  const item = LANDMARKS[index];

  function prev() {
    setIndex((i) => (i - 1 + LANDMARKS.length) % LANDMARKS.length);
  }
  function next() {
    setIndex((i) => (i + 1) % LANDMARKS.length);
  }

  return (
    <div className="w-full max-w-sm mx-auto lg:mx-0">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Surulere landmarks"
        className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border v2-placeholder"
      >
        {item.type === "photo" ? (
          <Image
            src={item.src}
            alt={item.caption}
            fill
            sizes="(min-width: 1024px) 30vw, 90vw"
            className="object-cover"
          />
        ) : (
          <PlaceholderImage label={item.caption} className="absolute inset-0" />
        )}

        <button
          type="button"
          onClick={prev}
          aria-label="Previous landmark"
          className="absolute left-2 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full flex items-center justify-center v2-glass hover:border-[var(--color-v2-brass-glow)]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next landmark"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full flex items-center justify-center v2-glass hover:border-[var(--color-v2-brass-glow)]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        {LANDMARKS.map((l, i) => (
          <button
            key={l.caption}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show ${l.caption}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-[var(--color-v2-brass-glow)]" : "w-2 bg-v2-line"}`}
          />
        ))}
      </div>
      <p aria-live="polite" className="text-center text-sm text-v2-muted mt-2">{item.caption}</p>
    </div>
  );
}
