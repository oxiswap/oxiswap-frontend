import React, { useState, useEffect } from "react";
import Image from "next/image";
import { PositionProps } from "@utils/interface";
import { Skeleton } from "antd";
import { observer } from "mobx-react";
import DrawIcon from '@components/AssetIcon/DrawAssetIcon';
import { useStores } from "@stores/useStores";
import { estimateAmounts } from '@utils/calculateAssetAmounts';
import { Account } from "fuels";

const NoPositionDiv: React.FC<Pick<PositionProps, 'noPositionSpan1' >> = observer(({ noPositionSpan1 }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
      <Image src="/position.svg" alt="position" width={46} height={46} />
      <span className="text-sm">{noPositionSpan1}</span>
    </div>
  );
});

const PositionDiv: React.FC<Pick<PositionProps, 'assets' | 'cardClick' | 'isExplore' | 'type' | 'amounts'>> = observer(({ assets, cardClick, isExplore, type, amounts }) => {
  return (
    <button 
      onClick={cardClick}
      className={`flex-shrink-0 flex flex-col rounded-lg justify-start p-4 box-border border border-transparent hover:border-blue-400 ${
        !isExplore && (
          'bg-white'
        )
      }`}
    >
      <div className="flex flex-row items-center justify-start space-x-2">
        {assets?.map((asset, index) => (
          <React.Fragment key={index}>
            <div className="flex items-center"> 
              {asset.icon ? (
                <Image src={asset.icon} alt={asset.name} width={16} height={16} className="mr-2" />
              ) : (
                <DrawIcon assetName={asset.name} className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] mr-2" />
              )}
              <span className="text-base leading-none">{asset.symbol}</span> 
            </div>
            {index < assets.length - 1 && <span className="mx-1 text-text-500">/</span>}
          </React.Fragment>
        ))}
        {!isExplore && (
          <div className="flex justify-center items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
            <Image src={type === "StablePool" ? "/stable.svg" : "/volatile.svg"} alt="stable" width={12} height={12} />
            <span>{type}</span>
        </div>
        )}
      </div>
      <div className="flex flex-row flex-wrap mt-2 text-xs text-text-500">
        {assets?.map((asset, index) => (
          <React.Fragment key={index}>
            <span className="mr-2">
              {asset.symbol}:{" "} 
              <span className="text-black">
                {amounts?.[index] || '0.0000'}
              </span>
            </span>
            {index < assets.length - 1 && <span className="mr-2">•</span>}
          </React.Fragment>
        ))}
      </div>
    </button>
  );
});

const MyPosition: React.FC<PositionProps> = observer(({ 
  addLiquidityOpen,
  removeLiquidityOpen, 
  cardClick,
  noPositionSpan1,
  isCardOpen, 
  hasPosition, 
  assets, 
  type,
  isExplore,
  poolAssetId
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [amounts, setAmounts] = useState<[string, string]>(['0', '0']);

  const { balanceStore, accountStore } = useStores();
  const exactBalance = balanceStore.getExactBalance(poolAssetId, 9);

  useEffect(() => {
    const fetchAmounts = async () => {
      try {
        const [reserveIn, reserveOut] = await estimateAmounts(assets, exactBalance, accountStore.getWallet as Account);
        setAmounts([reserveIn, reserveOut]);
      } catch (error) {
        console.error('Error estimating amounts:', error);
      }
    };

    fetchAmounts();
  }, [assets, exactBalance, accountStore.getWallet]);

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 4 }} />;
  }

  if (!hasPosition) {
    return (
      <div className="w-full">
        <NoPositionDiv noPositionSpan1={noPositionSpan1} />
      </div>
    );
  }

  return (
    <div className="w-full border flex flex-col rounded-lg">
      {isExplore && (
        <div className="border-b-1 py-2 px-4">
          <span className="text-xs text-text-100 ">Your Positions</span>
        </div>
      )}

      <PositionDiv assets={assets} cardClick={cardClick} isExplore={isExplore} type={type} amounts={amounts} />

      {(isCardOpen && isExplore) && (
        <div className="flex flex-row border-t-1 py-3 px-4 space-x-2">
          <button
            onClick={addLiquidityOpen}
            className="py-2 px-8 rounded-lg text-text-200 text-xs border hover:border-blue-400"
          >
            Increase Liquidity
          </button>
          <button
            onClick={removeLiquidityOpen}
            className="py-2 px-8 rounded-lg border text-text-200 text-xs hover:border-blue-400"
          > 
            Remove Liquidity
          </button>
        </div>
      )}
    </div>
  );
});

export default MyPosition;