// TEST-ONLY. The jsdom shims the HSE theme tests need: ResizeObserver,
// DOMRect, matchMedia and the Radix pointer and scroll APIs jsdom lacks.
// framer-motion animations are skipped, so a captured DOM holds the end
// state of every transition (the shell's rail and chat panel animate).
// Never import this file from application code.
import { MotionGlobalConfig } from 'framer-motion';

export function installDomShims() {
  MotionGlobalConfig.skipAnimations = true;
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  }
  if (!globalThis.DOMRect) {
    globalThis.DOMRect = class {
      constructor(x = 0, y = 0, w = 0, h = 0) {
        Object.assign(this, { x, y, width: w, height: h, top: y, left: x, right: x + w, bottom: y + h });
      }
      static fromRect(r = {}) { return new globalThis.DOMRect(r.x, r.y, r.width, r.height); }
    };
  }
  if (!window.matchMedia) {
    window.matchMedia = () => ({
      matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
    });
  }
  const proto = window.HTMLElement.prototype;
  proto.scrollIntoView = proto.scrollIntoView || (() => {});
  proto.hasPointerCapture = proto.hasPointerCapture || (() => false);
  proto.releasePointerCapture = proto.releasePointerCapture || (() => {});
  proto.setPointerCapture = proto.setPointerCapture || (() => {});
}
