if (
  typeof globalThis !== "undefined" &&
  typeof globalThis.indexedDB === "undefined"
) {
  (globalThis as any).indexedDB = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "open") {
          return () => ({
            result: null,
            error: null,
            readyState: "done",
            onupgradeneeded: null,
            onsuccess: null,
            onerror: null,
          });
        }
        if (prop === "deleteDatabase") {
          return () => ({ onsuccess: null, onerror: null });
        }
        if (prop === "cmp") return () => 0;
        if (prop === "databases") return async () => [];
        return undefined;
      },
    }
  ) as unknown as IDBFactory;
}
