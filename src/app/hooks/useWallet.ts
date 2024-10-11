import React, { useState, useCallback, useEffect } from "react";
import { useFuel, useConnectUI } from '@fuels/react';
import { Account } from 'fuels';
import { useStores } from '@stores/useStores';


export const useWallet = () => {
  const { fuel } = useFuel();
  const { connect, isConnecting } = useConnectUI();

  const { accountStore } = useStores();
  const [ wallet, setWallet ] = useState<Account | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleDisconnect = useCallback(async () => {
    await fuel.disconnect();
    await accountStore.disconnect();
    
  }, [fuel, accountStore]);
  

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await fuel.isConnected();
      setIsConnected(connected);
      if (connected) {
        const accounts = await fuel.accounts();
        const wallet = await fuel.getWallet(accounts[0]);
        setWallet(wallet);
      }
    };
    checkConnection();
  }, [fuel, isConnecting]);


  useEffect(() => {
    if (!isConnected || !wallet) return;

    accountStore.connect(wallet);
  }, [isConnected, wallet, accountStore]);

  
  return {
    isConnected,
    wallet,
    connect,
    disconnect: handleDisconnect,
  };
}

