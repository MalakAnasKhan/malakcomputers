"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { allowEnhancedMotion, sameDocumentAnchor } from "@/modules/storefront/motion-policy";

type Connection = { saveData?: boolean; addEventListener?: (type: string, callback: () => void) => void; removeEventListener?: (type: string, callback: () => void) => void };

/** Shared scrolling on every route; heavier reveal/parallax code stays homepage-only. */
export function MotionSurface({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const device = navigator as Navigator & { deviceMemory?: number; connection?: Connection };
    let generation = 0, disposed = false;
    let cleanup = () => {};
    async function update() {
      const current = ++generation;
      cleanup();
      cleanup = () => {};
      if (!scope.current || !media.matches || !allowEnhancedMotion({ reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches, width: window.innerWidth, finePointer: true, memory: device.deviceMemory, cores: device.hardwareConcurrency, saveData: device.connection?.saveData })) return;
      try {
        const [{ default: Lenis }, animation] = await Promise.all([
          import("lenis"),
          pathname === "/" ? Promise.all([import("gsap"), import("gsap/ScrollTrigger")]) : Promise.resolve(null),
        ]);
        if (disposed || current !== generation || !media.matches || !scope.current) return;
        // Home uses the GSAP ticker; all other pages use Lenis's own RAF.
        // Exactly one frame driver owns each instance.
        const lenis = new Lenis({ autoRaf: animation === null, smoothWheel: true, syncTouch: false, lerp: 0.14, anchors: false, stopInertiaOnNavigate: true });
        let live = true;
        let cleanupAnimation = () => {};
        if (animation) {
          const [{ gsap }, { ScrollTrigger }] = animation;
          gsap.registerPlugin(ScrollTrigger);
          const tick = (seconds: number) => lenis.raf(seconds * 1000);
          const unsubscribe = lenis.on("scroll", ScrollTrigger.update);
          gsap.ticker.add(tick);
          gsap.ticker.lagSmoothing(0);
          const context = gsap.context(() => {
            if (window.scrollY < 40 && performance.now() < 2500) gsap.fromTo("[data-hero-entry]", { y: 18, opacity: 0.5 }, { y: 0, opacity: 1, duration: 0.65, stagger: 0.09, ease: "power2.out", clearProps: "transform,opacity" });
            scope.current!.querySelectorAll<HTMLElement>("[data-reveal], [data-product-card]").forEach(element => {
              if (element.getBoundingClientRect().top < window.innerHeight * 0.85) return;
              gsap.fromTo(element, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power2.out", clearProps: "transform,opacity", scrollTrigger: { trigger: element, start: "top 92%", once: true } });
            });
            scope.current!.querySelectorAll<HTMLElement>("[data-parallax]").forEach(element => {
              gsap.fromTo(element, { y: -10, scale: 1.06 }, { y: 10, scale: 1.06, ease: "none", scrollTrigger: { trigger: element.parentElement, start: "top bottom", end: "bottom top", scrub: 0.6 } });
            });
          }, scope);
          void document.fonts.ready.then(() => { if (live) ScrollTrigger.refresh(); });
          cleanupAnimation = () => {
            context.revert();
            unsubscribe();
            gsap.ticker.remove(tick);
            gsap.ticker.lagSmoothing(500, 33);
          };
        }
        const focused = new Map<HTMLElement, string | null>();
        function anchors(event: MouseEvent) {
          if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !(event.target instanceof Element)) return;
          const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
          if (!anchor || anchor.hasAttribute("download") || anchor.target && anchor.target !== "_self") return;
          const id = sameDocumentAnchor(anchor.href, window.location.href);
          const target = id ? document.getElementById(id) : null;
          if (!target) return;
          event.preventDefault();
          if (window.location.hash !== new URL(anchor.href).hash) window.history.pushState(null, "", anchor.href);
          if (!focused.has(target)) focused.set(target, target.getAttribute("tabindex"));
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
          // Lenis 1.3 reads CSS scroll-margin-top itself. Do not double-offset it.
          lenis.scrollTo(target, { duration: 0.7 });
        }
        const stopForKeyboard = (event: KeyboardEvent) => {
          if (["Tab", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) lenis.scrollTo(window.scrollY, { immediate: true });
        };
        const stopForHistory = () => lenis.scrollTo(window.scrollY, { immediate: true });
        document.addEventListener("click", anchors, true);
        document.addEventListener("keydown", stopForKeyboard);
        window.addEventListener("popstate", stopForHistory);
        cleanup = () => {
          live = false;
          document.removeEventListener("click", anchors, true);
          document.removeEventListener("keydown", stopForKeyboard);
          window.removeEventListener("popstate", stopForHistory);
          for (const [element, original] of focused) { if (original === null) element.removeAttribute("tabindex"); else element.setAttribute("tabindex", original); }
          cleanupAnimation();
          lenis.destroy();
        };
      } catch { /* Native scrolling and visible server-rendered content remain the fallback. */ }
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
  }, [pathname]);
  return <div ref={scope}>{children}</div>;
}
