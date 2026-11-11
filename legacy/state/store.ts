import { useSyncExternalStore } from 'react';

/** Minimal external store (no extra dependency): get/set/subscribe + a React hook. */
export function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(next: Partial<T> | ((s: T) => Partial<T>)) {
      const patch = typeof next === 'function' ? (next as (s: T) => Partial<T>)(state) : next;
      let changed = false;
      for (const k in patch) if (!Object.is((patch as T)[k], state[k])) changed = true;
      if (!changed) return;
      state = { ...state, ...patch };
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    use<S>(selector: (s: T) => S): S {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useSyncExternalStore(this.subscribe, () => selector(state), () => selector(state));
    },
  };
}
