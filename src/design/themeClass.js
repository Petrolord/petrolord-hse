// The one opt-in helper for SHARED pieces during the HSE rollout (ported
// from the Suite's rollout-era src/design/themeClass.js, which the Suite
// deleted once every page sat in a scope; HSE deletes this one the same way
// in its cleanup wave). Shared pieces are the ones that render on themed
// and unmigrated screens alike: the ui kit, the signed-in shell (TopBar,
// LeftNav, AppSwitcher, NotificationCenter, ChatBot) and any file two
// modules in different batches pull.
//
//   const tc = useThemeClass();
//   <div className={tc('bg-[#1f1f35] text-white', 'bg-pl-surface text-pl-text')} />
//
// Outside a scope tc() returns its first argument unchanged, so every screen
// that has not migrated renders byte for byte what it did before
// (src/design/__tests__/uiLegacyDom.test.jsx pins the ui kit). Inside a scope
// it returns the second argument when one is passed (even undefined, which
// drops the class), otherwise the entry for the legacy string in the
// component's table; a string with no entry passes through unchanged. Write
// the themed strings out literally so Tailwind generates them.
import { useDsTheme } from './themeContext.js';

const identity = (legacy) => legacy;
const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

/** tc() for a known theme value; `ds` is useDsTheme()'s result (null outside a scope). */
export function themeClassPicker(ds, table) {
  if (!ds) return identity;
  return (legacy, ...themed) => {
    if (themed.length) return themed[0];
    return table && hasOwn(table, legacy) ? table[legacy] : legacy;
  };
}

/** Hook form: tc(legacy[, themed]) for the nearest scope. */
export function useThemeClass(table) {
  return themeClassPicker(useDsTheme(), table);
}
