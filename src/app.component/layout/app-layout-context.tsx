'use client';

import React from 'react';

interface AppLayoutContextValue {
  hasRightSidebar: boolean;
  isRightSidebarCollapsed: boolean;
}

const AppLayoutContext = React.createContext<AppLayoutContextValue>({
  hasRightSidebar: false,
  isRightSidebarCollapsed: false,
});

export function AppLayoutProvider({
  value,
  children,
}: {
  value: AppLayoutContextValue;
  children: React.ReactNode;
}): React.ReactElement {
  return <AppLayoutContext.Provider value={value}>{children}</AppLayoutContext.Provider>;
}

export function useAppLayoutContext(): AppLayoutContextValue {
  return React.useContext(AppLayoutContext);
}
