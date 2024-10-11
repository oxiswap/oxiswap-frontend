'use client';

import Image from 'next/image';
import React, { useState, useMemo, useEffect } from 'react';
import { Asset, AssetInputProps, nullAsset } from '@utils/interface';
import { observer } from 'mobx-react';
import { useStores } from '@stores/useStores';
import { debounce } from 'lodash';
import { useAddLiquidityInput } from '@hooks/useAddLiquidityInput';
import { Skeleton } from 'antd';

const AssetInput: React.FC<Pick<Asset, 'symbol' | 'icon' | 'assetId'>  & { assetIndex: number}> = observer(({ symbol, icon, assetId, assetIndex}) => {
  const [isLoading, setIsLoading] = useState(false);
  const {accountStore, positionStore, balanceStore, oracleStore} = useStores();
  const currentBalance = balanceStore.getBalance(assetId);

  const { handleInputChange } = useAddLiquidityInput(assetIndex); 
  const debouncedHandleInputChange = useMemo(() => debounce(handleInputChange, 300), [handleInputChange]); 

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [assetId]);

  return (
    <div className="bg-white p-4 mt-1 mb-2 rounded-lg w-full">
      <div className="flex justify-between items-center">
      {isLoading ? (
          <Skeleton.Input style={{ width: '66%%', height: '16px' }} active />
        ) : (<input
          type="text"
          autoComplete="off"
          autoCorrect="off"
          min={0}
          value={positionStore.getAmount(assetIndex)}
          placeholder="0.00"
          onChange={(e) => {
            handleInputChange(e);
            debouncedHandleInputChange(e);
          }}
          className="bg-transparent text-xl outline-none text-black appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />)}
        <div className="flex items-center justify-center bg-oxi-bg-02 p-2 rounded-xl transition-colors duration-200 text-black text-sm cursor-no-drop">
          <Image
            src={icon}
            alt="assetIcon"
            width={18}
            height={18}
            className="mr-2"
          />
          <span>{symbol}</span>
        </div>
      </div>
      <div className="flex justify-between mt-2">
        {isLoading ? (
          <Skeleton.Input style={{ width: '66%%', height: '16px' }} active />
        ) : (
          <span className="text-sm text-[#8f9ba7]">~${oracleStore.getAssetPrice(assetId)}</span>
        )}
        <div className="flex items-center">
          <span className="text-sm text-[#8f9ba7] mr-2">
            {accountStore.isConnected ? currentBalance : '0'}
          </span>
          <Image src="/wallet.svg" alt="wallet" width={16} height={16} />
        </div>
      </div>
    </div>
  );
});

const MultiAssetInputDiv: React.FC<AssetInputProps> = observer(({ assets }) => {
  
  return (
    <div className="relative flex flex-col items-center mt-2">
      {assets.filter(asset => asset && asset !== nullAsset).map((asset, index, filteredAssets) => (
        <React.Fragment key={asset.assetId}>
          <AssetInput
            symbol={asset.symbol}
            icon={asset.icon}
            assetId={asset.assetId}
            assetIndex={assets.indexOf(asset)}
            // onAmountChange={handleAmountChange(assets.indexOf(asset))}
          />
          {index < filteredAssets.length - 1 && (
            <div className="relative w-full">
              <Image
                src="/add-liquidity.svg"
                alt="addLiquidity"
                width={24}
                height={24}
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
});

export default MultiAssetInputDiv;
