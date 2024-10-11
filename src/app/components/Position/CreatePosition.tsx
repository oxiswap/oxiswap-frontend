'use client';

import Image from 'next/image';
import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import MultiAssetInputDiv from '@components/Position/AssetInput';
import LiquidityButton from '@components/Pool/LiquidityButton';
import PositionConfirm from '@components/Position/PositionConfirm';
import PopupModal from '@components/PopupModal';
import SelectAsset from '@components/Swap/SelectAsset';
import { Asset, CreatePositionProps, AssetConfig} from '@utils/interface';
import { useStores } from '@stores/useStores';
import { observer } from 'mobx-react';
import { fetchServerAssetConfig } from "@utils/api";
import { useWallet } from '@hooks/useWallet';
import RightIcon from '@assets/icons/rightIcon';
import SwapNotification from '@components/Swap/SwapNotification';
import { nullAsset } from '@utils/interface';
import { Skeleton } from 'antd';

const AssetsDiv: React.FC<Pick<CreatePositionProps, 'assets' | 'onAction' | 'poolType'>> = observer(({ assets, onAction, poolType }) => {
  const assetNum = poolType === 'StablePool' ? 3 : 2;

  const renderAssetButton = useCallback(
    (index: number) => (
      <button
        onClick={() => onAction?.(index)}
        key={index}
        className={`
          w-full md:flex-1 py-2 px-2 rounded-2xl flex items-center justify-between box-border border border-transparent
          ${assets[index] && assets[index] !== nullAsset ? 'bg-white text-black hover:bg-oxi-bg-01' : 'bg-button-100 text-white hover:opacity-80'}
        `}
      >
        <div className="flex items-center ml-1 text-base">
          {assets[index] && assets[index] !== nullAsset ? (
            <>
              <Image
                src={assets[index].icon}
                alt={assets[index].name}
                width={18}
                height={18}
                className="mr-2"
              />
              <span>{assets[index].symbol}</span>
            </>
          ) : (
            <span>Select asset</span>
          )}
        </div>
        <RightIcon color={assets[index] && assets[index] !== nullAsset ? '#000000' : 'text-white'} width={16} height={16} />
      </button>
    ),
    [assets, onAction]
  );

  return (
    <div className="flex flex-col mt-4 w-full">
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 justify-between w-full">
        {Array.from({ length: assetNum }, (_, index) =>
          renderAssetButton(index)
        )}
      </div>

      <div className="mt-6">
        <div className="flex flex-col mb-2">
          <h3 className="text-base font-semibold">Deposit</h3>
          <p className="text-sm text-gray-400 mt-1">
            Select the amount of assets you want to deposit.
          </p>
        </div>
        <MultiAssetInputDiv assets={assets} />
      </div>
    </div>
  );
});

const CreatePositionPage = observer(() => {
  const router = useRouter();
  const [isAssetCardOpen, setIsAssetCardOpen] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [selectedPoolType, setSelectedPoolType] = useState<string>('VolatilePool');
  const [currentSelectionIndex, setCurrentSelectionIndex] = useState<number>(0);
  const { positionStore, accountStore, buttonStore, notificationStore } = useStores();
  const [assetConfig, setAssetConfig] = useState<AssetConfig>({
    assets: [],
    popularAssets: []
  });
  const { connect } = useWallet();

  useEffect(() => {
    const fetchAssetConfig = async () => {
      const assetConfig = await fetchServerAssetConfig();
      setAssetConfig(assetConfig);
    }
    fetchAssetConfig();
  },[])

  useEffect(() => {
    if (!accountStore.isConnected) {
      buttonStore.setPositionButtonDisabled(false);
      buttonStore.setPositionButtonName('Connect Wallet');
      buttonStore.setPositionButtonClassName("bg-button-100/30 text-text-200 hover:border-white hover:bg-button-100/70");
    } else {
      buttonStore.setPositionButtonDisabled(true);
      buttonStore.setPositionButtonName('Select assets');
      buttonStore.setPositionButtonClassName("bg-oxi-bg-03 border border-oxi-text-01 text-oxi-text-01");
    }
  },[accountStore.isConnected]);

  const handleSelectPoolType = useCallback((poolType: string) => {
    setSelectedPoolType(poolType);
    positionStore.setPoolType(poolType);
    setSelectedAssets([]);
    positionStore.setAddLiquidityAmounts([]);
  }, []);

  const handleAssetSelection = useCallback((asset: Asset | null) => {
    if (!asset) return;
    const maxTokens = selectedPoolType === 'StablePool' ? 3 : 2;
  
    setSelectedAssets((prevAssets) => {
      let newAssets = [...prevAssets];
      
      while (newAssets.length < maxTokens) {
        newAssets.push(nullAsset);
      }
  
      const existingIndex = newAssets.findIndex((a) => a && a !== nullAsset && a.symbol === asset.symbol);
  
      if (existingIndex !== -1 && existingIndex !== currentSelectionIndex) {
        [newAssets[existingIndex], newAssets[currentSelectionIndex]] = [
          newAssets[currentSelectionIndex],
          asset,
        ];
      } else {
        newAssets[currentSelectionIndex] = asset;
      }
  
      positionStore.setAddLiquidityAssets([...newAssets]);
      positionStore.setDepositAssets([]);
      return newAssets;
    });
  
    setIsAssetCardOpen(false);
    positionStore.setAddLiquidityAmounts([]);
  }, [selectedPoolType, currentSelectionIndex, positionStore]);

  const handleAssetButtonClick = useCallback((index: number) => {
    setIsAssetCardOpen(true);
    setCurrentSelectionIndex(index);
  }, []);

  const handlePositionConfirmClose = () => {
    // setIsPreview(false);
    positionStore.setIsPreview(false);

    if (notificationStore.addLiquidityNotificationVisible) {
      setTimeout(() => {
        router.push('/pool');
      }, 3000);
    }
  };

  useEffect(() => {
    setSelectedAssets(positionStore.addLiquidityAssets);
  }, []);

  return (
    <main className="w-full md:w-[520px] h-auto overflow-hidden text-black mx-auto max-w-[1200px] px-4 relative font-basel-grotesk-book pt-16 md:pt-20">
      <div className="flex flex-col space-y-4 mb-16">
        <button
          onClick={() => router.push('/pool')}
          className="flex flex-row items-center justify-start text-text-200 text-sm space-x-2"
        >
          <RightIcon width={16} height={16} className="rotate-180 text-text-200 hover:text-blue-700" />
          <span className="hover:text-blue-700">Positions</span>
        </button>
        <div className="flex flex-col p-4">
          <div className="items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xl">Add Liquidity</span>
              <span className="text-sm text-text-700 mt-1">
                Create a new pool or create a liquidity position on an existing
                pool.
              </span>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-col">
              <span className="text-base">Pool Type</span>
              <span className="text-sm text-text-700 mt-1">
                The pool type determines how the pool will utilize liquidity.
              </span>
            </div>
            <div className="flex flex-col mt-4 space-y-2">
              {['StablePool', 'VolatilePool'].map((poolType) => (
                <button
                  key={poolType}
                  className={`
                    flex flex-col p-4 rounded-lg border 
                    ${selectedPoolType === poolType ? 'border-blue-400' : ''}
                    ${poolType === 'StablePool' ? 'cursor-not-allowed' : ''}
                    shadow-md space-y-2 hover:bg-blue-100
                  `}
                  onClick={() => handleSelectPoolType(poolType)}
                  disabled={poolType === 'StablePool'}
                >
                  <div className="flex flex-row items-center justify-center">
                    <Image
                      src={poolType === 'StablePool' ? '/stable.svg' : '/volatile.svg'}
                      alt={poolType}
                      width={16}
                      height={16}
                    />
                    <span className="text-black ml-2">{poolType}</span>
                  </div>
                  <span className="text-text-700 text-sm">
                    {poolType === 'StablePool'
                      ? 'Best for stablecoins pegged to 1:1'
                      : 'Volatile pool supports virtually any assets'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-col">
              <span className="text-base">Assets</span>
              <span className="text-sm text-text-700 mt-1">
                Which asset pair would you like to add liquidity to.
              </span>
            </div>
          </div>

          <AssetsDiv
            onAction={handleAssetButtonClick}
            assets={selectedAssets}
            poolType={selectedPoolType}
          />

          {accountStore.isConnected ? (
            <LiquidityButton
              onAction={() => positionStore.setIsPreview(true)}
            />
          ) : (
            <LiquidityButton
              onAction={() => connect()}
            />
          )}
        </div>
      </div>

      {positionStore.isPreview && (
        <PopupModal isOpen={positionStore.isPreview} onClose={handlePositionConfirmClose}>
          <PositionConfirm onAction={handlePositionConfirmClose} />
        </PopupModal>
      )}

      {isAssetCardOpen && (
        <PopupModal
          isOpen={isAssetCardOpen}
          onClose={() => setIsAssetCardOpen(false)}>
          <SelectAsset
            onAction={handleAssetSelection}
            assets={assetConfig.assets}
            popularAssets={assetConfig.popularAssets}
            isFromAsset={false}
            isSwapAction={false}
          />
        </PopupModal>
      )}
      <div className='relative z-50'>
        <div className='fixed right-0 top-32 w-72 h-auto flex flex-col'>
          {notificationStore.notificationStates['addLiquidity'] && (
            <SwapNotification />
          )}
        </div>
      </div>
    </main>
  );
});

const PositionSkeleton = () => {
  return (
    <Skeleton active paragraph={{ rows: 4 }} />
  );
};

const CreatePosition = observer(() => {
  return (
    <Suspense fallback={<PositionSkeleton />}>
      <CreatePositionPage />
    </Suspense>
  );
});

export default CreatePosition;
