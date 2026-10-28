const cacheClearers = new Set<() => void>();

export function createPaginationCache<TPage, TState>(initialState: TState) {
  let state = initialState;
  const pages = new Map<string, TPage>();

  const clear = () => {
    state = initialState;
    pages.clear();
  };

  cacheClearers.add(clear);

  return {
    getState: () => state,
    setState: (nextState: TState) => {
      state = nextState;
    },
    getPage: (key: string) => pages.get(key),
    setPage: (key: string, page: TPage) => {
      pages.set(key, page);
    },
    clear,
  };
}

export function clearPaginationCaches() {
  cacheClearers.forEach((clear) => clear());
}
