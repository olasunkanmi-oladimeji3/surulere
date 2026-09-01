"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Animated stat counter, e.g. <Counter to={1976} prefix="Est. " />. Jumps straight to the final value under prefers-reduced-motion. */
export default function Counter({ to, prefix = "", suffix = "", duration = 1.4, className = "" }) {
  const ref = useRef(null);

  useGSAP(() => {
    const el = ref.current;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: to,
        duration,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
        onUpdate: () => { el.textContent = prefix + Math.round(obj.val) + suffix; },
      });
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      el.textContent = prefix + to + suffix;
    });
    return () => mm.revert();
  }, { scope: ref, dependencies: [to, prefix, suffix, duration] });

  return <span ref={ref} className={className}>{prefix}0{suffix}</span>;
}
