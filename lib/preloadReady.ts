// The root layout (and therefore Preloader) mounts once and persists across
// client-side route changes — its effect never re-runs, so the raw
// `window.addEventListener("ttfm:preloaded", ...)` pattern only ever fires once,
// on the very first load. Anything that mounts *after* that first load (e.g. a
// SplitHeading with trigger="preload" reached by navigating from "/" to
// "/creators") would wait forever for an event that already happened.
//
// Preloader calls markPreloaded() the moment its timeline completes, before it
// dispatches the DOM event. Consumers call onPreloadReady(cb): if preload has
// already happened, cb runs immediately; otherwise it subscribes and waits.
let hasPreloaded = false;
const waiters = new Set<() => void>();

export function markPreloaded() {
  if (hasPreloaded) return;
  hasPreloaded = true;
  waiters.forEach((cb) => cb());
  waiters.clear();
}

export function onPreloadReady(cb: () => void) {
  if (hasPreloaded) {
    // Always resolve asynchronously, even when preload already happened —
    // calling `cb` synchronously here (i.e. inside the same tick as the
    // consumer's mount effect) raced with React's own mount/cleanup cycle: a
    // SplitText DOM mutation landing mid-reconciliation produced a "Failed to
    // execute 'removeChild'" crash. A microtask keeps a simple, consistent
    // contract ("subscribers always run after this call returns") without
    // reintroducing the original bug of waiting on an event that already fired.
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) cb();
    });
    return () => {
      cancelled = true;
    };
  }
  waiters.add(cb);
  return () => waiters.delete(cb);
}
