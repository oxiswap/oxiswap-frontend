import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import { ButtonProps, WalletInfo } from "@utils/interface";
import { useWallet } from "@hooks/useWallet";
import useResponsive from "@hooks/useResponsive";

const WalletCard: React.FC<WalletInfo & { onConnect: (name: string) => void }> = ({ name, icon, onConnect }) => {

  return (
    <button
      onClick={() => onConnect(name)}
      className="bg-oxi-bg-02 text-black flex items-center justify-between rounded-md border border-gray-300 w-full px-4 py-3">
      <span>{name}</span>
      <Image src={icon} alt={name} width={20} height={20} />
    </button>
  );
};

const SelectWalletCard: React.FC<Pick<ButtonProps, 'onAction'>> = ({
  onAction,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { connect } = useWallet();
  const isMobile = useResponsive();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onAction, 300);
  }, [onAction]);

  const handleConnect = useCallback(async () => {
    connect();
    handleClose();
  }, [connect, handleClose]);

  return (
    <div
      className={`
        flex flex-col bg-oxi-bg-02 shadow-2xl rounded-md font-basel-grotesk-book
        ${isMobile ? 'fixed bottom-0 left-0 right-0 w-full rounded-b-none' : 'w-[500px] mb-36'}
        p-6 transition-all duration-300 ease-in-out
        ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
        }
      `}>
      <div className="flex items-center justify-between">
        <h2 className="text-black text-2xl">Connect wallet</h2>
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-8 h-8">
          <Image
            src="/close.svg"
            alt="closeWalletCard"
            width={24}
            height={24}
          />
        </button>
      </div>
      <h2 className="text-text-400 text-sm mt-4">
        Choose how you want to connect.
      </h2>
      <div className="space-y-2 mt-4">
        <span className="text-text-400 text-sm">Popular</span>
        <WalletCard
          name="Fuel Wallet"
          icon="/fuel-icon.svg"
          onConnect={handleConnect}
        />
        <WalletCard
          name="Fuelet Wallet"
          icon="/fuel-icon.svg"
          onConnect={handleConnect}
        />
        <WalletCard
          name="Burner Wallet"
          icon="/fuel-icon.svg"
          onConnect={handleConnect}
        />
        <WalletCard
          name="Bako Wallet"
          icon="/fuel-icon.svg"
          onConnect={handleConnect}
        />
      </div>
      <div className="space-y-2 mt-4">
        <span className="text-text-400 text-sm">More</span>
        <WalletCard
          name="Ethereum Wallets"
          icon="/fuel-icon.svg"
          onConnect={handleConnect}
        />
        <WalletCard
          name="Solana Wallets"
          icon="/fuel-icon.svg"
          onConnect={handleConnect}
        />
      </div>
    </div>
  );
};

export default SelectWalletCard;
