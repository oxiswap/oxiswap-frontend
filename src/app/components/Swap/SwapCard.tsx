'use client';
import SwapHeader from '@components/Swap/SwapHeader';
import FromAssetInput from '@components/Swap/FromAssetInput';
import SwapSeparator from '@components/Swap/SwapSeparator';
import ToAssetInput from '@components/Swap/ToAssetInput';
import SwapButton from '@components/Swap/SwapButton';
import SwapDetail from '@components/Swap/SwapDetail';
import React, { useState, useEffect, Suspense } from 'react';
import { SwapCardProps } from '@utils/interface';
import { useStores } from '@stores/useStores';
import { observer } from 'mobx-react';
import { Skeleton } from 'antd';


const SwapCard: React.FC<Pick<SwapCardProps,'onAssetCardOpen' | 'onSwapClose' | 'onSetClose' | 'onConnectOpen'>> = ({ onAssetCardOpen, onSwapClose, onSetClose, onConnectOpen }) => {
  const { accountStore, buttonStore } = useStores();
  const isConnected = accountStore.isConnected;
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      buttonStore.setSwapButton(
        'Connect Wallet', 
        false, 
        'bg-button-100/30 text-text-200 hover:border-white hover:bg-button-100/70'
      );
    } else {
      buttonStore.setSwapButton(
        'Swap', 
        false, 
        'bg-oxi-bg-03 text-oxi-text-01'
      );
    }
  }, [isConnected]);


  return (
    <Suspense fallback={<SwapSkeleton />}>
      <div className="flex w-full justify-center font-basel-grotesk-book">
        <div className="flex flex-col bg-white rounded-3xl px-4 py-2 md:pt-4 md:pb-2 md:px-2 shadow-lg w-full mx-4 my-8 md:w-[480px]">
          <SwapHeader onAction={onSetClose} />
          <div className="flex flex-col relative">
            <FromAssetInput onAssetCardOpen={() => onAssetCardOpen(true)} />
            <SwapSeparator />
            <ToAssetInput onAssetCardOpen={() => onAssetCardOpen(false)} />
          </div>
          <SwapDetail isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
          <SwapButton onAction={isConnected ? onSwapClose : onConnectOpen} />
        </div>
      </div>
    </Suspense>
  );
};

const SwapSkeleton = () => (
  <Skeleton active paragraph={{ rows: 4 }} />
);

export default observer(SwapCard);
