import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import SwapButton from '@components/Swap/SwapButton';
import { SwapConfirmProps } from '@utils/interface';
import useResponsive from '@hooks/useResponsive';
import { Skeleton } from 'antd';
import { useStores } from '@stores/useStores';
import { observer } from 'mobx-react';

const ReviewDiv: React.FC<Pick<SwapConfirmProps, 'reviewInfo'>> = observer(({
  reviewInfo,
}) => {
  return (
    <div className="flex items-center justify-between py-2 rounded">
      <div className="flex items-center">
        {/* <div className="w-8 h-8 bg-blue-500 rounded-full mr-3"></div> */}
        <Image
          src={reviewInfo.icon}
          alt={reviewInfo.symbol}
          width={32}
          height={32}
          className="mr-3"
        />
        <div>
          <div className="font-semibold text-black">{reviewInfo.name}</div>
          <div className="text-sm text-gray-400">{reviewInfo.balance}</div>
        </div>
      </div>
      <div className="text-right text-black">
        <div>{reviewInfo.amount}</div>
        <div className="text-gray-400">{reviewInfo.value}</div>
      </div>
    </div>
  );
});

const SwapDetailDiv: React.FC<Pick<SwapConfirmProps, 'swapDetailInfo'>> = observer(({
  swapDetailInfo,
}) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-100 text-sm">{swapDetailInfo.title}</span>
      <div className="text-black text-sm">{swapDetailInfo.value}</div>
    </div>
  );
});

const SwapConfirm: React.FC<Pick<SwapConfirmProps, 'onAction' | 'onSwap'>> = observer(({
  onAction,
  onSwap,
}) => {
  const isMobile = useResponsive();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { swapStore, buttonStore, balanceStore } = useStores();

  useEffect(() => {
    setIsVisible(true);
    swapStore.setFromLoading(true);
    swapStore.setToLoading(true);
    buttonStore.setSwapButtonPlay('Confirm swap');
    const timer = setTimeout(() => {
      setIsLoading(false);
      swapStore.setFromLoading(false);
      swapStore.setToLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
    setIsVisible(false);
    buttonStore.setSwapButtonPlay('Swap');
    setTimeout(onAction, 300);
  };

  return (
    <div
      className={`
        flex flex-col bg-white shadow-2xl
        ${
          isMobile
            ? 'fixed bottom-0 left-0 right-0 w-full rounded-t-lg'
            : 'rounded-lg w-[500px] mb-36'
        }
        p-6 transition-all duration-300 ease-in-out
        ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
        }
      `}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-black text-xl">Confirm Swap</h2>
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

      <div className="flex flex-col bg-oxi-bg-02 rounded-lg p-4">
        <span className="text-black text-base">You pay</span>
        {swapStore.fromLoading ? (
          <Skeleton active avatar paragraph={{ rows: 1 }} />
        ) : (
          <ReviewDiv
            reviewInfo={{
              name: `${swapStore.fromAsset.name}`,
              symbol: `${swapStore.fromAsset.symbol}`,
              icon: `${swapStore.fromAsset.icon}`,
              balance: `${balanceStore.getBalance(swapStore.fromAsset.assetId)}`,
              amount: `${swapStore.fromAmount}`,
              value: `\$${swapStore.fromAssetPrice}`,
            }}
          />
        )}
      </div>

      <div className="flex flex-col bg-oxi-bg-02 rounded-lg p-4 mt-2">
        <span className="text-black text-base">You will get</span>
        {swapStore.toLoading ? (
          <Skeleton active avatar paragraph={{ rows: 1 }} />
        ) : (
          <ReviewDiv
            reviewInfo={{
              name: `${swapStore.toAsset.name}`,
              symbol: `${swapStore.toAsset.symbol}`,
              icon: `${swapStore.toAsset.icon}`,
              balance: `${balanceStore.getBalance(swapStore.toAsset.assetId)}`,
              amount: `${swapStore.toAmount}`,
              value: `\$${swapStore.toAssetPrice}`,
            }}
          />
        )}
      </div>

      <div className="flex flex-col bg-oxi-bg-02 rounded-lg p-4 mt-2 space-y-1">
        {isLoading ? (
          <>
            <Skeleton active paragraph={{ rows: 4 }} />
          </>
        ) : (
          <>
            <SwapDetailDiv
              swapDetailInfo={{
                title: 'Price impact',
                value: swapStore.priceImpact,
              }}
            />
            <SwapDetailDiv
              swapDetailInfo={{
                title: 'Max slippage',
                value: `${swapStore.maxSlippage} (\$${(Number(swapStore.maxSlippage) * Number(swapStore.swapRateValue) / Number(swapStore.swapRate)).toFixed(2)})`,
              }}
            />
            <SwapDetailDiv
              swapDetailInfo={{
                title: 'Min received',
                value: `${swapStore.minReceived} ${swapStore.toAsset.symbol}`,
              }}
            />
            <SwapDetailDiv
              swapDetailInfo={{ title: 'Route', value: swapStore.routePath }}
            />
          </>
        )}
      </div>

      <SwapButton onAction={onSwap} />
    </div>
  );
});

export default SwapConfirm;
