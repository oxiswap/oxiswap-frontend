import Image from 'next/image';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Asset, SelectAssetProps } from '@utils/interface';
import { Skeleton, Spin } from 'antd';
import { observer } from 'mobx-react-lite';
import { useStores } from '@stores/useStores';
import useResponsive from '@hooks/useResponsive';
import SearchInput from '@components/SearchInput';
import { useFilteredAssets } from '@hooks/useFilteredAssets';
import { useEthPrice } from '@hooks/useEthPrice';
import styles from '@src/app/SelectAsset.module.css';

const SelectAsset: React.FC<SelectAssetProps> = observer(({ onAction, assets, popularAssets, isFromAsset, isSwapAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { swapStore, balanceStore } = useStores();
  const isMobile = useResponsive();
  useEthPrice();
  const observerRef = useRef<HTMLDivElement | null>(null);

  const sortedAssets = useMemo(() => {
    return [...assets]
      .filter(asset => asset.name.toString() !== "unknown")
      .sort((a, b) => {
        const balanceA = Number(balanceStore.getBalance(a.assetId, a.decimals));
        const balanceB = Number(balanceStore.getBalance(b.assetId, b.decimals));
        if (balanceA > 0 && balanceB === 0) return -1;
        if (balanceA === 0 && balanceB > 0) return 1;
        return balanceB - balanceA;
      });
  }, [assets, balanceStore]);

  const { filteredAssets, loadMoreAssets, hasMore, isLoading, isInitialLoad } = useFilteredAssets(sortedAssets, searchTerm);

  useEffect(() => {
    setIsVisible(true);
    setTimeout(() => {
      setIsInitialLoading(false);
    }, 1500);
  }, []);


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

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !isLoading && loadMoreAssets) {
      loadMoreAssets();
    }
  }, [hasMore, loadMoreAssets, isLoading]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '20px',
      threshold: 1.0
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (observerRef.current) observer.observe(observerRef.current);
    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [handleObserver]);

  const renderAssetList = () => {
    const assetsToRender = searchTerm ? filteredAssets : sortedAssets;

    if (isInitialLoading) {
      return (
        <div className="flex h-full">
          <Skeleton active avatar paragraph={{ rows: 1 }} />
        </div>
      );
    }

    if (assetsToRender.length === 0 && !isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full pb-36">
          <Image src="/no-result.svg" alt="No results" width={36} height={36} />
          <p className="mt-4 text-gray-500">No assets found</p>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-2">
          {assetsToRender.map((asset) => (
            <div
              key={`${asset.symbol}-${asset.assetId}`}
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
        {(hasMore || isLoading) && (
          <div ref={observerRef} className="py-4">
            <Skeleton active avatar paragraph={{ rows: 1 }} />
          </div>
        )}
      </>
    );
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

      {!isInitialLoading && (
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
      )}
      <div className={`flex-1 overflow-y-auto pr-2 ${isMobile ? 'h-[calc(100vh-250px)]' : 'h-96'} ${styles.customScrollbar}`}>
        {renderAssetList()}
      </div>
    </div>
  );
});

export default SelectAsset;