import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";

export default function SmoothScroll({ children }) {
  const location = useLocation();
  const instancesRef = useRef([]);
  const rafIdRef = useRef(null);

  useEffect(() => {
    // Clean up any existing instances
    instancesRef.current.forEach((item) => {
      try {
        item.lenis.destroy();
      } catch (e) {
        // ignore
      }
    });
    instancesRef.current = [];

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Scroll targets: center page, left sidebar, right now playing
    const targets = [
      { selector: ".spotify-page", name: "page" },
      { selector: ".sidebar-scroll-container", name: "sidebar" },
      { selector: ".now-playing-scroll-container", name: "now-playing" },
    ];

    const activeInstances = [];

    targets.forEach(({ selector, name }) => {
      const el = document.querySelector(selector);
      if (el) {
        if (name === "page") {
          // Reset page scroll position on navigation
          el.scrollTop = 0;
        }

        try {
          const lenis = new Lenis({
            wrapper: el,
            content: el.firstElementChild || el,
            duration: 1.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1.05,
            touchMultiplier: 1.6,
            infinite: false,
            autoRaf: false,
          });

          activeInstances.push({ el, lenis, name });
        } catch (err) {
          console.warn(`Could not initialize Lenis on ${selector}:`, err);
        }
      }
    });

    instancesRef.current = activeInstances;

    // Unified RAF loop driving all active Lenis instances
    function raf(time) {
      instancesRef.current.forEach(({ lenis }) => {
        try {
          lenis.raf(time);
        } catch (e) {
          // ignore
        }
      });
      rafIdRef.current = requestAnimationFrame(raf);
    }

    rafIdRef.current = requestAnimationFrame(raf);

    // ResizeObserver to dynamically update Lenis when dynamic content loads
    const resizeObserver = new ResizeObserver(() => {
      instancesRef.current.forEach(({ lenis }) => {
        try {
          lenis.resize();
        } catch (e) {
          // ignore
        }
      });
    });

    activeInstances.forEach(({ el }) => {
      resizeObserver.observe(el);
      if (el.firstElementChild) {
        resizeObserver.observe(el.firstElementChild);
      }
    });

    const handleWindowResize = () => {
      instancesRef.current.forEach(({ lenis }) => {
        try {
          lenis.resize();
        } catch (e) {
          // ignore
        }
      });
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
      resizeObserver.disconnect();
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      activeInstances.forEach(({ lenis }) => {
        try {
          lenis.destroy();
        } catch (e) {
          // ignore
        }
      });
      instancesRef.current = [];
    };
  }, [location.pathname]);

  return children;
}

