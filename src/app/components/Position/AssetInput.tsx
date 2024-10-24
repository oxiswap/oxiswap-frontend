'use client';

import Image from 'next/image';
import React, { useState, useMemo, useEffect } from 'react';
import { Asset, AssetInputProps, nullAsset } from '@utils/interface';
import { observer } from 'mobx-react';
import { useStores } from '@stores/useStores';
import { debounce } from 'lodash';
import { useAddLiquidityInput } from '@hooks/useAddLiquidityInput';
import { Skeleton } from 'antd';
import DrawAssetIcon from '@components/AssetIcon/DrawAssetIcon';
import WalletIcon from '@assets/icons/WalletIcon';

interface InputDivProps extends Pick<Asset, 'icon' | 'symbol'> {
  isLoading: boolean;
  isLoadingStates: boolean;
  amount: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  debouncedHandleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  assetPrice: string;
  currentBalance: string;
  className?: string;
  disabled?: boolean;
}

const InputDiv: React.FC<InputDivProps> = ({
  icon,
  symbol,
  isLoading,
  isLoadingStates,
  amount,
  handleInputChange,
  debouncedHandleInputChange,
  assetPrice,
  currentBalance,
  className,
  disabled = false
}) => {
  const containerClasses = `
    bg-white p-4 mt-1 mb-2 rounded-lg w-full
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className || ''}
  `.trim();

  const inputClasses = `
    bg-transparent text-xl outline-none text-black appearance-none
    [&::-webkit-inner-spin-button]:appearance-none
    [&::-webkit-outer-spin-button]:appearance-none
    ${disabled ? 'cursor-not-allowed' : ''}
  `.trim();

  const assetSelectorClasses = `
    flex items-center justify-center 
    bg-oxi-bg-02 p-2 rounded-xl 
    transition-colors duration-200 
    text-black text-sm
    ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-oxi-bg-03'}
  `.trim();

  return (
    <div className={containerClasses}>
      <div className="flex justify-between items-center">
        {isLoading || isLoadingStates ? (
          <Skeleton.Input style={{ width: '66%', height: '16px' }} active />
        ) : (
          <input
            type="text"
            autoComplete="off"
            autoCorrect="off"
            min={0}
            value={amount}
            placeholder="0.00"
            onChange={(e) => {
              if (!disabled) {
                handleInputChange(e);
                debouncedHandleInputChange(e);
              }
            }}
            disabled={disabled}
            className={inputClasses}
          />
        )}
        <div className={assetSelectorClasses}>
          {icon ? (
            <Image
              src={icon}
              alt="assetIcon"
              width={18}
              height={18}
              className="mr-2"
            />
          ) : (
            <DrawAssetIcon 
              assetName={symbol} 
              className="w-8 h-8 mr-3 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold" 
            />
          )}
          <span>{symbol}</span>
        </div>
      </div>
      <div className="flex justify-between mt-2">
        {isLoading ? (
          <Skeleton.Input style={{ width: '66%', height: '16px' }} active />
        ) : (
          <span className="text-sm text-[#8f9ba7]">${assetPrice}</span>
        )}
        <div className="flex items-center">
          <span className="text-sm text-[#8f9ba7] mr-2">
            {currentBalance}
          </span>
          <WalletIcon width={16} height={16} className="text-text-100" />
        </div>
      </div>
    </div>
  );
};

const AssetInput: React.FC<
  Pick<Asset, 'symbol' | 'icon' | 'assetId' | 'decimals'> & { 
    assetIndex: number;
    disabled?: boolean;
  }
> = observer(({ 
  symbol, 
  icon, 
  assetId, 
  decimals, 
  assetIndex,
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const {accountStore, positionStore, balanceStore, oracleStore} = useStores();
  const currentBalance = balanceStore.getBalance(assetId, decimals);

  const { handleInputChange } = useAddLiquidityInput(assetIndex, false);
  const debouncedHandleInputChange = useMemo(
    () => debounce(handleInputChange, 300), 
    [handleInputChange]
  );

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [assetId]);

  return (
    <InputDiv
      icon={icon}
      symbol={symbol}
      isLoading={isLoading}
      isLoadingStates={positionStore.loadingStates[assetIndex]}
      amount={positionStore.getAmount(assetIndex)}
      assetPrice={oracleStore.getAssetPrices(assetIndex)}
      currentBalance={accountStore.isConnected ? currentBalance : "0"}
      handleInputChange={handleInputChange}
      debouncedHandleInputChange={debouncedHandleInputChange}
      disabled={disabled}
    />
  );
});

const MultiAssetInputDiv: React.FC<AssetInputProps> = observer(({ assets }) => {
  const filteredAssets = assets.filter(asset => asset && asset !== nullAsset);
  const hasEnoughAssets = filteredAssets.length >= 2;
  
  return (
    <div className="relative flex flex-col items-center mt-2">
      {filteredAssets.map((asset, index) => (
        <React.Fragment key={asset.assetId}>
          <AssetInput
            symbol={asset.symbol}
            icon={asset.icon}
            assetId={asset.assetId}
            decimals={asset.decimals}
            assetIndex={assets.indexOf(asset)}
            disabled={!hasEnoughAssets}
          />
          {index < filteredAssets.length - 1 && (
            <div className="relative w-full">
              <Image
                src="/add-liquidity.svg"
                alt="addLiquidity"
                width={24}
                height={24}
                className={`
                  absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10
                  ${!hasEnoughAssets ? 'opacity-50' : ''}
                `}
              />
            </div>
          )}
        </React.Fragment>
      ))}
      {!hasEnoughAssets && (
        <div className="absolute inset-0 rounded-lg pointer-events-none" />
      )}
    </div>
  );
});

export default MultiAssetInputDiv;