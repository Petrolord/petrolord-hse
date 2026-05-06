/**
 * Utility to handle Page Visibility API events
 * Helps in managing state when user switches browser tabs or minimizes window
 */

export const initPageVisibility = (callbacks = {}) => {
  const { onVisible, onHidden, onChange } = callbacks;

  const handleVisibilityChange = () => {
    if (document.hidden) {
      if (onHidden) onHidden();
    } else {
      if (onVisible) onVisible();
    }
    if (onChange) onChange(document.visibilityState);
  };

  // Check compatibility
  if (typeof document.hidden !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  // Return cleanup function
  return () => {
    if (typeof document.hidden !== "undefined") {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  };
};

export const isPageVisible = () => {
  return !document.hidden;
};