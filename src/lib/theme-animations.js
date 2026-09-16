/**
 * Theme Transition Animation System
 * Powered by CSS View Transitions API
 * Cinematic Slow & Smooth Circular Reveal
 */

const getClipPathPosition = (position) => {
  if (typeof position === "string" && (position.includes("%") || position.includes("px"))) {
    return position;
  }
  if (typeof position === "object" && position !== null && position.x !== undefined) {
    return `${position.x}px ${position.y}px`;
  }
  switch (position) {
    case "top-left":
      return "0% 0%";
    case "top-right":
      return "92% 4%";
    case "bottom-left":
      return "0% 100%";
    case "bottom-right":
      return "100% 100%";
    case "top-center":
      return "50% 0%";
    case "bottom-center":
      return "50% 100%";
    case "center":
      return "50% 50%";
    default:
      return typeof position === "string" ? position : "92% 4%";
  }
};

export const createAnimation = (
  variant = "circle",
  start = "top-right",
  blur = false,
  url = ""
) => {
  const clipPosition = getClipPathPosition(start);
  const animId = typeof start === "string" ? start.replace(/[^a-zA-Z0-9]/g, "-") : "coords";

  if (variant === "rectangle") {
    return {
      name: `rect-${animId}`,
      css: `
      ::view-transition-group(root) {
        animation-duration: 1.6s !important;
        animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1) !important;
      }
      ::view-transition-old(root) {
        animation: none !important;
        mix-blend-mode: normal !important;
        z-index: 1 !important;
      }
      ::view-transition-new(root) {
        animation: reveal-rect-${animId} 1.6s cubic-bezier(0.22, 1, 0.36, 1) forwards !important;
        mix-blend-mode: normal !important;
        z-index: 999999 !important;
      }
      @keyframes reveal-rect-${animId} {
        from {
          clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
          ${blur ? "filter: blur(8px);" : ""}
        }
        to {
          clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
          ${blur ? "filter: blur(0px);" : ""}
        }
      }
      `,
    };
  }

  // Default: Cinematic circular ripple from clicked pill button
  return {
    name: `circle-${animId}`,
    css: `
    ::view-transition-group(root) {
      animation-duration: 1.6s !important;
      animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1) !important;
      z-index: 999999 !important;
    }
    ::view-transition-old(root) {
      animation: none !important;
      mix-blend-mode: normal !important;
      z-index: 1 !important;
    }
    ::view-transition-new(root) {
      animation: reveal-circle-${animId} 1.6s cubic-bezier(0.22, 1, 0.36, 1) forwards !important;
      mix-blend-mode: normal !important;
      z-index: 999999 !important;
    }
    @keyframes reveal-circle-${animId} {
      0% {
        clip-path: circle(0px at ${clipPosition});
        ${blur ? "filter: blur(8px);" : ""}
      }
      100% {
        clip-path: circle(250vmax at ${clipPosition});
        ${blur ? "filter: blur(0px);" : ""}
      }
    }
    `,
  };
};

export const updateThemeStyles = (css) => {
  if (typeof window === "undefined") return;
  const styleId = "theme-transition-styles";
  let styleElement = document.getElementById(styleId);

  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = css;
};
