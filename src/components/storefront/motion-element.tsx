"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createElement, useEffect, useRef, type ComponentPropsWithoutRef, type HTMLAttributes } from "react";
import { allowEnhancedMotion } from "@/modules/storefront/motion-policy";

type Motion = "reveal" | "hero" | "parallax";
type Connection = { saveData?: boolean; addEventListener?: (type: string, callback: () => void) => void; removeEventListener?: (type: string, callback: () => void) => void };

/** Animate only this component's own committed DOM node, never dehydrated descendants. */
function useElementMotion<T extends HTMLElement>(motion: Motion, order: number) {
  const ref = useRef<T>(null);
  const pathname = usePathname();
  useEffect(() => {
    if (pathname !== "/" && pathname !== "/about") return;
    const media = window.matchMedia("(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const device = navigator as Navigator & { deviceMemory?: number; connection?: Connection };
    let disposed = false, generation = 0;
    let cleanup = () => {};
    async function update() {
      const current = ++generation;
      cleanup();
      cleanup = () => {};
      if (!ref.current || !media.matches || !allowEnhancedMotion({ reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches, width: window.innerWidth, finePointer: true, memory: device.deviceMemory, cores: device.hardwareConcurrency, saveData: device.connection?.saveData })) return;
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
        if (disposed || generation !== current || !ref.current || !media.matches) return;
        const element = ref.current;
        gsap.registerPlugin(ScrollTrigger);
        const context = gsap.context(() => {
          if (motion === "hero") {
            if (window.scrollY < 40 && performance.now() < 2500) gsap.fromTo(element, { y: 18, opacity: 0.5 }, { y: 0, opacity: 1, duration: 0.65, delay: order * 0.09, ease: "power2.out", clearProps: "transform,opacity" });
          } else if (motion === "reveal") {
            if (element.getBoundingClientRect().top < window.innerHeight * 0.85) return;
            gsap.fromTo(element, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power2.out", clearProps: "transform,opacity", scrollTrigger: { trigger: element, start: "top 92%", once: true } });
          } else {
            gsap.fromTo(element, { y: -10, scale: 1.06 }, { y: 10, scale: 1.06, ease: "none", scrollTrigger: { trigger: element.parentElement, start: "top bottom", end: "bottom top", scrub: 0.6 } });
          }
        }, element);
        cleanup = () => context.revert();
      } catch { /* Visible server-rendered content is the fallback. */ }
    }
    const changed = () => { void update(); };
    media.addEventListener("change", changed);
    device.connection?.addEventListener?.("change", changed);
    void update();
    return () => {
      disposed = true;
      generation++;
      media.removeEventListener("change", changed);
      device.connection?.removeEventListener?.("change", changed);
      cleanup();
    };
  }, [pathname, motion, order]);
  return ref;
}

type Props = HTMLAttributes<HTMLElement> & { as?: "div" | "section" | "article" | "p" | "h1"; motion?: Motion; order?: number };

export function MotionElement({ as = "div", motion = "reveal", order = 0, ...props }: Props) {
  const ref = useElementMotion<HTMLElement>(motion, order);
  return createElement(as, { ...props, ref,
    "data-reveal": motion === "reveal" ? true : undefined,
    "data-hero-entry": motion === "hero" ? true : undefined,
    "data-parallax": motion === "parallax" ? "" : undefined,
  });
}

export function MotionLink(props: ComponentPropsWithoutRef<typeof Link>) {
  const ref = useElementMotion<HTMLAnchorElement>("reveal", 0);
  return <Link {...props} ref={ref} data-reveal />;
}
