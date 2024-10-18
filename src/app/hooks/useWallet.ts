import React, { useState, useCallback, useEffect } from "react";
import { useFuel, useConnectUI, useDisconnect, useIsConnected, useAccount} from '@fuels/react';
import { Account } from 'fuels';
import { useStores } from '@stores/useStores';


export const useWallet = () => {
  const { fuel } = useFuel();
  const { connect, isConnecting } = useConnectUI();
  const { disconnect, isPending: disconnectLoading } = useDisconnect();
  const { isConnected } = useIsConnected();
  const { account } = useAccount();

  const { accountStore } = useStores();
  const [ wallet, setWallet ] = useState<Account | null>(null);

  const handleDisconnect = useCallback(async () => {
    disconnect();
    await accountStore.disconnect();
  }, [fuel, accountStore, disconnect]);
  

  useEffect(() => {
    const checkConnection = async () => {
      if (isConnected && account) {
        const wallet = await fuel.getWallet(account as string);
        setWallet(wallet);
        accountStore.connect(wallet);
      }
    };
    checkConnection();
  }, [fuel, isConnected, accountStore, account]);

  return {
    isConnected,
    wallet,
    connect,
    disconnect: handleDisconnect,
  };
}

