import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type LoadingContextValue = {
  isLoading: boolean;
  show: () => void;
  hide: () => void;
};

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [count, setCount] = useState(0);

  const show = useCallback(() => setCount((c) => c + 1), []);
  const hide = useCallback(() => setCount((c) => (c > 0 ? c - 1 : 0)), []);

  const value = useMemo(() => ({ isLoading: count > 0, show, hide }), [count, show, hide]);

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};

export const useLoading = (): LoadingContextValue => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider');
  return ctx;
};


