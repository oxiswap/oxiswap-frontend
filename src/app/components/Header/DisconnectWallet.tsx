import Image from "next/image";
import { ButtonProps } from "@utils/interface";
import { useState, useEffect } from "react";
import { useWallet } from "@hooks/useWallet";
import { useStores } from "@stores/useStores";
import { observer } from "mobx-react-lite";
import useResponsive from "@hooks/useResponsive";
import { Popover } from 'antd';
import AbstractIcon from "@components/Header/CreateAbstractIcon";

const CopyAddressButton: React.FC<Pick<ButtonProps, 'className'>> = observer(({ className }) => {
  const { accountStore } = useStores();
  const [popoverContent, setPopoverContent] = useState('Copy');

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(accountStore.getAddress?.toString() ?? "");
      setPopoverContent('Copied');
      setTimeout(() => setPopoverContent('Copy'), 2000);
    } catch (err) {
      console.error('Copy address failed', err);
    }
  };

  return (
    <Popover
      content={popoverContent}
      trigger="hover"
      placement="top"
    >
      <div className={className}>
        <IconButton 
          src="/copy.svg" 
          alt="copy" 
          className='w-full h-full flex items-center justify-center'
          onAction={handleCopyAddress}
        >
          Copy address
        </IconButton>
      </div>

    </Popover>
  );
});

const IconButton: React.FC<Pick<ButtonProps, 'src' | 'alt' | 'children' | 'className' | 'onAction'>> = ({ src, alt, children, className, onAction }) => (
  <button
    onClick={onAction}
    className={`flex flex-row items-center justify-center ${className}`}>
    <Image src={src} alt={alt} width={16} height={16} className="mr-2" />
    <span>{children}</span>
  </button>
);

const DisconnectWallet: React.FC<Pick<ButtonProps, 'onAction'>> = observer(({ onAction }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { disconnect } = useWallet();
  const { accountStore } = useStores();
  const isMobile = useResponsive();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = (id: number) => {
    if (id === 1) {
      disconnect();
    }
    setIsVisible(false);
    setTimeout(onAction, 300); 
  };

  const buttonClasses = `${isMobile ? 'w-full' : 'flex-1'} bg-button-100/20 text-black text-sm py-2 rounded-xl hover:bg-button-100 hover:text-white transition duration-200`;

  return (
    <div 
      className={`
        flex flex-col bg-oxi-bg-02 shadow-2xl rounded-lg font-basel-grotesk-book
        ${isMobile ? 'fixed bottom-0 left-0 right-0 rounded-b-none' : 'w-[430px] mb-36'}
        p-6 transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
      `}
    >
      <button onClick={() => handleClose(0)} className="self-end text-gray-400 hover:text-black">
        <Image src="/close.svg" alt="close" width={20} height={20} />
      </button>
      
      <div className="flex flex-col items-center mt-4">
        <AbstractIcon address={accountStore.getAddress?.toString() ?? ''} />
        <p className="text-black text-xl font-semibold mb-2 mt-4 md:mt-2">
          {accountStore.getAddress?.toString().slice(0, 6)}...{accountStore.getAddress?.toString().slice(-4)}
        </p>
        <IconButton 
          src="/disconnect.svg" 
          alt="disconnect" 
          className="text-black text-sm border border-gray-300 hover:border-blue-400 rounded-xl px-4 py-1 mb-12 mt-1"
          onAction={() => handleClose(1)}
        >
          Disconnect
        </IconButton>
        
        <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'flex-row space-x-4'} w-full`}>
          <CopyAddressButton className={buttonClasses} />
          <IconButton 
            src="/view-on.svg" 
            alt="view" 
            className={buttonClasses}
            onAction={() => window.open(`https://app.fuel.network/account/${accountStore.getAddress}`, "_blank")}
          >
            View on explorer
          </IconButton>
        </div>

      </div>
    </div>
  );
});

export default DisconnectWallet;