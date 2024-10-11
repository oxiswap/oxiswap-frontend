'use client';

import { defaultConnectors } from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { coinbaseWallet, walletConnect } from '@wagmi/connectors';
import { http, createConfig, injected, Config } from '@wagmi/core';
import { mainnet, sepolia } from '@wagmi/core/chains';

const queryClient = new QueryClient();
const WC_PROJECT_ID = 'cf4ad9eca02fdf75b8c6ef0b687ddd16';

const METADATA = {
  name: 'OxiSwap',
  description:
    'Lightning-Fast Decentralized Exchange Built On The Fuel Network',
  url: '',
  icons: ['https://connectors.fuel.network/logo_white.png'],
};

const wagmiConfig: Config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [
    injected({ shimDisconnect: false }),
    walletConnect({
      projectId: WC_PROJECT_ID,
      metadata: METADATA,
      showQrModal: false,
    }),
    coinbaseWallet({
      appName: METADATA.name,
      appLogoUrl: METADATA.icons[0],
      darkMode: true,
      reloadOnDisconnect: true,
    }),
  ],
});

const fuelConfig = {
  connectors: defaultConnectors({
    devMode: false,
    wcProjectId: WC_PROJECT_ID,
    ethWagmiConfig: wagmiConfig,
  }),
};

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <FuelProvider fuelConfig={fuelConfig}>
        {/* @ts-ignore */}
        {children}
      </FuelProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
};
