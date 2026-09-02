"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

/** Character-by-character reveal for a short headline. Renders plain and static under prefers-reduced-motion. */
export default function HeroHeadline({ children, className = "" }) {
  const ref = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // "words, chars" keeps each word in its own wrapper so lines still
      // break on word boundaries — "chars" alone lets the browser break
      // mid-word, since each character becomes its own inline-block span.
      const split = new SplitText(ref.current, { type: "words, chars" });
      gsap.from(split.chars, {
        opacity: 0,
        y: 20,
        rotateX: -40,
        duration: 0.6,
        stagger: 0.015,
        ease: "expo.out",
      });
      return () => split.revert();
    });
    return () => mm.revert();
  }, { scope: ref });

  return (
    <h1 ref={ref} className={className}>
      {children}
    </h1>
  );
}
