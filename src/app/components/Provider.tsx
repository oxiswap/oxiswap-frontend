'use client';

import { 
  BakoSafeConnector,
  BurnerWalletConnector,
  createConfig as createFuelConfig,
  FueletWalletConnector,
  FuelWalletConnector,
  SolanaConnector,
  WalletConnectConnector 
} from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { coinbaseWallet, walletConnect } from '@wagmi/connectors';
import { http, createConfig, injected, Config } from '@wagmi/core';
import { mainnet, sepolia } from '@wagmi/core/chains';
import { CHAIN_IDS, Network, Provider } from "fuels";
import { FUEL_PROVIDER_URL } from "@utils/interface"
import {isMobile} from "react-device-detect";

type ExternalConnectorConfig = Partial<{ chainId: number, fuelProvider: Promise<Provider> }>;

const queryClient = new QueryClient();
const WC_PROJECT_ID = 'cf4ad9eca02fdf75b8c6ef0b687ddd16';

const METADATA = {
  name: 'OxiSwap',
  description:
    'Lightning-Fast Decentralized Exchange Built On The Fuel Network',
  url: '',
  icons: ['https://connectors.fuel.network/logo_white.png'],
};

const networks: Array<Network> = [
  {
    chainId: CHAIN_IDS.fuel.mainnet,
    url: FUEL_PROVIDER_URL,
  }
];
const fuelProvider = Provider.create(FUEL_PROVIDER_URL);

const externalConnectorConfig: ExternalConnectorConfig = {
  chainId: CHAIN_IDS.fuel.mainnet,
  fuelProvider,
};

const wagmiConfig: Config = createConfig({
  syncConnectedChain: false,
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

const fuelConfig = createFuelConfig(() => {
  const fueletWalletConnector = new FueletWalletConnector();
  const fuelWalletConnector = new FuelWalletConnector();
  const bakoSafeConnector = new BakoSafeConnector();
  const walletConnectConnector = new WalletConnectConnector({
    projectId: WC_PROJECT_ID,
    wagmiConfig: wagmiConfig as any,
    ...externalConnectorConfig
  });
  const solanaConnector = new SolanaConnector({
    projectId: WC_PROJECT_ID,
    ...externalConnectorConfig
  });

  return {
    connectors: [
      fueletWalletConnector,
      walletConnectConnector,
      solanaConnector,
      ...(isMobile ? [] : [fuelWalletConnector, bakoSafeConnector]),
    ]
  }
});

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <FuelProvider
        networks={networks} 
        fuelConfig={fuelConfig}
        uiConfig={{suggestBridge: false}}
      >
        {children}
      </FuelProvider>
    </QueryClientProvider>
  );
};
