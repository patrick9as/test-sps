import { useState, useEffect } from "react";

/**
 * Returns true when the given media query matches, and updates when it changes.
 * @param {string} query - CSS media query (e.g. "(max-width: 767px)")
 * @returns {boolean}
 */
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);
    const listener = (e) => setMatches(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export default useMediaQuery;
