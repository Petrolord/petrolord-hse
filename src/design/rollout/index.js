// The signed-in modules that render inside the design-system scope during
// the rollout. One file per batch (w0.js, w1a.js ...), imported statically,
// so two batches never edit the same file. The end-state wave (4A) deletes
// this folder and themes every module (docs/scope/DesignSystem-Rollout.md).
import w0 from './w0.js';
import w1a from './w1a.js';
import w1b from './w1b.js';
import w1c from './w1c.js';
import w2a from './w2a.js';
import w2b from './w2b.js';
import w2c from './w2c.js';
import w2d from './w2d.js';

export const ROLLOUT_BATCHES = Object.freeze({ w0, w1a, w1b, w1c, w2a, w2b, w2c, w2d });

export const THEMED_MODULES = Object.freeze([...new Set(Object.values(ROLLOUT_BATCHES).flat())]);

/** The module MainContent renders when none is chosen. */
export const DEFAULT_MODULE = 'dashboard';

/** True when the signed-in module `id` (MainContent's activeModule.id) is migrated. */
export function isThemedModule(id) {
  return THEMED_MODULES.includes(id || DEFAULT_MODULE);
}
