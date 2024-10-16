import Image from 'next/image';
import React, { useState, useEffect, useMemo } from 'react';
import { Asset, SelectAssetProps } from '@utils/interface';
import { Skeleton } from 'antd';
import { observer } from 'mobx-react-lite';
import { useStores } from '@stores/useStores';
import useResponsive from '@hooks/useResponsive';
import SearchInput from '@components/SearchInput';
import { useFilteredAssets } from '@hooks/useFilteredAssets';
import { useEthPrice } from '@hooks/useEthPrice';

const SelectAsset: React.FC<SelectAssetProps> = observer(({ onAction, assets, popularAssets, isFromAsset, isSwapAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const { swapStore, balanceStore, positionStore } = useStores();
  const isMobile = useResponsive();
  useEthPrice();
  const sortedAssets = useMemo(() => {
    return [...assets].sort((a, b) => {
      const balanceA = Number(balanceStore.getBalance(a.assetId, a.decimals));
      const balanceB = Number(balanceStore.getBalance(b.assetId, b.decimals));
      if (balanceA > 0 && balanceB === 0) return -1;
      if (balanceA === 0 && balanceB > 0) return 1;
      return balanceB - balanceA;
    });
  }, [assets, balanceStore]);

  const filteredAssets = useFilteredAssets(sortedAssets, searchTerm);
  useEffect(() => {
    setIsVisible(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  const handleAssetSelect = (asset: Asset) => {
    if (isSwapAction) {
      const fromAsset = swapStore.fromAsset;
      const toAsset = swapStore.toAsset;
      const fromAmount = swapStore.fromAmount;
      const toAmount = swapStore.toAmount;
      const currentAsset = isFromAsset ? fromAsset : toAsset;
      const oppositeAsset = isFromAsset ? toAsset : fromAsset;

      if (currentAsset.assetId !== asset.assetId) {
        if (oppositeAsset.assetId === asset.assetId) {
          swapStore.setFromAsset(toAsset);  
          swapStore.setToAsset(fromAsset);
          swapStore.setFromAmount(toAmount);
          swapStore.setToAmount(fromAmount);
        } else {
          isFromAsset
            ? swapStore.setFromAsset(asset)
            : swapStore.setToAsset(asset);
          swapStore.setFromAmount(fromAmount);
          swapStore.setToAmount(toAmount);
        }
      }
    }

    onAction(asset);
    handleClose();
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onAction, 300);
  };

  const renderAssetIcon = (asset: Asset) => {
    if (asset.icon) {
      return (
        <Image
          src={asset.icon}
          alt={asset.name}
          width={32}
          height={32}
          className="mr-3 rounded-full"
        />
      );
    } else {
      return (
        <div className="w-8 h-8 mr-3 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          {asset.name.slice(0, 2).toUpperCase()}
        </div>
      );
    }
  };

  return (
    <div
      className={`
        bg-white text-black p-4 shadow-2xl
        ${isMobile ? 'fixed inset-0 w-full h-full' : 'rounded-2xl w-[500px] mb-12'}
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}
      `}>
      <div className="flex items-center justify-between p-2 mb-1">
        <span className="text-base">Select a asset</span>
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-8 h-8">
          <Image src="/close.svg" alt="closeCard" width={24} height={24} />
        </button>
      </div>
      <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {isLoading ? (
        <div>
          <div className="flex flex-wrap gap-2 mb-4 pb-6 border-b-2 border-gray-200">
            {[...Array(5)].map((_, index) => (
              <Skeleton.Button
                key={index}
                active
                style={{ width: '80px', height: '32px' }}
              />
            ))}
          </div>
          <div className={`flex-1 overflow-y-auto custom-scrollbar pr-2 ${isMobile ? 'h-[calc(100vh-250px)]' : 'h-96'}`}>
            <div className="space-y-2">
              {[...Array(10)].map((_, index) => (
                <Skeleton key={index} active avatar paragraph={{ rows: 1 }} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4 pb-6 border-b-2 border-gray-200">
            {popularAssets.map((symbol) => {
              const asset = sortedAssets.find((t) => t.symbol === symbol);
              return (
                asset && (
                  <button
                    key={symbol}
                    className="bg-white hover:bg-oxi-bg-02 rounded-md py-2 px-3 text-sm flex items-center justify-center border border-gray-300"
                    onClick={() => handleAssetSelect(asset)}>
                    <Image
                      src={asset.icon}
                      alt={asset.symbol}
                      width={20}
                      height={20}
                      className="mr-2"
                    />
                    {asset.symbol}
                  </button>
                )
              );
            })}
          </div>
          <div className={`flex-1 overflow-y-auto custom-scrollbar pr-2 ${isMobile ? 'h-[calc(100vh-250px)]' : 'h-96'}`}>
            {isSearching ? (
              <Skeleton active avatar paragraph={{ rows: 1 }} />
            ) : filteredAssets.length > 0 ? (
              <div className="space-y-2">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.symbol || asset.assetId}
                    className="flex items-center justify-between p-2 hover:bg-oxi-bg-02 rounded cursor-pointer"
                    onClick={() => handleAssetSelect(asset)}>
                    <div className="flex items-center">
                      {renderAssetIcon(asset)}
                      <div>
                        <div className='text-base'>{asset.name}</div>
                        <div className="text-xs text-gray-400">
                          {asset.symbol || asset.assetId.slice(0, 10) + '...'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div>{balanceStore.getBalance(asset.assetId, asset.decimals)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full pb-36">
                <Image src="/no-result.svg" alt="No results" width={36} height={36} />
                <p className="mt-4 text-gray-500">No assets found</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
});

export default SelectAsset;
