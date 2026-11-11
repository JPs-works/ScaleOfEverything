/**
 * React Three Fiber reports *caught* render errors through window.reportError
 * (it hard-wires reportError as the canvas root's onCaughtError), which
 * browsers surface as an uncaught "error" event even though our asset
 * boundary handled it. Boundaries mark their errors here, and
 * installReportErrorFilter() downgrades just those to a console warning.
 */
const caught = new WeakSet<object>();

export const markCaughtError = (e: unknown) => {
  if (e && typeof e === 'object') caught.add(e);
};

export function installReportErrorFilter() {
  const original = window.reportError?.bind(window);
  if (!original) return;
  window.reportError = (e: unknown) => {
    if (e && typeof e === 'object' && caught.has(e)) return; // already logged by the boundary
    original(e);
  };
}
