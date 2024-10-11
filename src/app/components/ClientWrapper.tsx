'use client'

import { useState } from "react";
import SelectWalletCard from '@components/Header/SelectWalletCard';
import DisconnectWallet from '@components/Header/DisconnectWallet';
import PopupModal from "@components/PopupModal";
import Header from "@components/Header/Header";
import { StoreContext } from "@stores/useStores";
import RootStore from "@stores/RootStore";
import { observer } from "mobx-react-lite";


const WalletAwareComponent = observer(({ children }: { children: React.ReactNode }) => {
  const [isWalletCardOpen, setIsWalletCardOpen] = useState(false);
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);

  const handleWalletCardOpen = () => {
    setIsWalletCardOpen(true);
  };

  const handleDisconnectOpen = () => {
    setIsDisconnectOpen(true);
  };

  return (
    <>
      <Header onOpenCard={handleWalletCardOpen} onDisconnected={handleDisconnectOpen} />
      {children}
      <PopupModal isOpen={isWalletCardOpen} onClose={() => setIsWalletCardOpen(false)}>
        <SelectWalletCard onAction={() => setIsWalletCardOpen(false)}/>  
      </PopupModal>
      <PopupModal isOpen={isDisconnectOpen} onClose={() => setIsDisconnectOpen(false)}>
        <DisconnectWallet onAction={() => setIsDisconnectOpen(false)}/>
      </PopupModal>
    </>
  );
});


export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <StoreContext.Provider value={RootStore.create()}>
      <WalletAwareComponent>
        {children}
      </WalletAwareComponent>
    </StoreContext.Provider>
  );
}