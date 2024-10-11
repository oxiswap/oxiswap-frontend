import React, { createContext } from 'react';
import RootStore from '@stores/RootStore';

export const StoreContext = createContext<RootStore | null>(null);

export const useStores = () => {
  const rootStore = React.useContext(StoreContext);
  if (!rootStore) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return rootStore;
};