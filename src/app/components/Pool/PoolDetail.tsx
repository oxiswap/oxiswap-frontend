'use client'

import React, { Suspense, lazy, useState, useEffect } from "react";
import Image from "next/image";
import { Skeleton } from "antd";
import { observer } from "mobx-react";
import { useStores } from "@stores/useStores";
import PopupModal from '@components/PopupModal';
import PositionConfirm from '@components/Position/PositionConfirm';
import { useRouter, usePathname } from 'next/navigation';
import SwapNotification from '@components/Swap/SwapNotification';
import { Asset, PoolDetailProps } from "@utils/interface";
import PoolNameDiv from "./PoolName";
import SwapButton from "./SwapButton";
import StatsDiv from "./StatsDiv";
import AssetDiv from "./AssetDiv";
import RightIcon from '@assets/icons/rightIcon';
import { useEthPrice } from '@hooks/useEthPrice';
import { fetchPoolDetail } from "@utils/api";

const AddLiquidityInputDiv = lazy(() => import("@components/Pool/AddLiquidity"));
const RemoveLiquidityDiv = lazy(() => import("@components/Pool/RemoveLiquidity"));
const MyPosition = lazy(() => import("@components/Pool/MyPosition"));
const Rewards = lazy(() => import("@components/Pool/Rewards"));


const PoolDetail: React.FC<Pick<PoolDetailProps, 'poolAssetId' | 'initialData'>> = observer(({ poolAssetId: propPoolAssetId, initialData }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [pathName, setPathName] = useState("Add");
  const [poolId, setPoolId] = useState(propPoolAssetId);
  const [liquidityCardOpen, setLiquidityCardOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { poolStore, notificationStore, buttonStore, oracleStore } = useStores();
  useEthPrice();

  useEffect(() => {
    if (!propPoolAssetId) {
      const pathSegments = pathname.split('/');
      const urlPoolId = pathSegments[pathSegments.length - 1];
      if (urlPoolId) {
        setPoolId(urlPoolId);
      } else {
        console.error('Pool ID not found in URL');
        router.push('/explore/pool');
      }
    }
  }, [propPoolAssetId, pathname]);

  useEffect(() => {
    if (initialData) {
      poolStore.setPool(initialData);
      poolStore.setManageName("Add");
      const fees = initialData.volume.replace(/[^0-9.-]+/g, '') * 0.003;
      poolStore.setStatistics(initialData.tvl, initialData.apr, fees.toString(), initialData.volume, initialData.tvl);
      setIsLoading(false);
    } else {
      const fetchPoolData = async () => {
        if (!poolId) {
          return;
        }
        setIsLoading(true);
        try {
          const poolData = await fetchPoolDetail(poolId);
          if (poolData) {
            poolStore.setPool(poolData);
            poolStore.setManageName("Add");
            const fees = parseFloat(poolData.volume.replace(/[^0-9.-]+/g, '')) * 0.003;
            poolStore.setStatistics(poolData.tvl, poolData.apr, fees.toString(), poolData.volume, poolData.tvl);
          }
        } catch (error) {
          console.error('Error fetching pool ', error);
        } finally {
          setIsLoading(false);
        }
      }
      fetchPoolData();
    }
  }, [poolId, initialData]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  const handleAddLiquidity = () => setPathName("Add");
  const handleRemoveLiquidity = () => setPathName("Remove");
  const handleOnClick = (name: string) => {
    setPathName(name);
    poolStore.setManageName(name);
  };

  const handlePositionConfirmClose = () => {
    setConfirmOpen(false);
    buttonStore.setPositionButton(
      "Preview", 
      true, 
      "bg-oxi-bg-03 text-oxi-text-01"
    );
    poolStore.setInitialize();
    oracleStore.setAssetPrices("", 0);
    oracleStore.setAssetPrices("", 1);
  };

  const handleAddLiquidityConfirm = () => {
    buttonStore.setPositionButton(
      "Confirm add liquidity", 
      false, 
      "bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
    );
    setConfirmOpen(true);
  }

  const ManageButton = React.memo(({ buttonName, onButtonClick, isActive = false }: Pick<PoolDetailProps, 'buttonName' | 'onButtonClick' | 'isActive'>) => (
    <button
      onClick={() => onButtonClick()}
      className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg whitespace-nowrap text-xs
        ${isActive ? 'bg-button-100/30' : 'hover:bg-button-100/5'}`}
    >
      {buttonName}
    </button>
  ));

  return (
    <main className="w-full h-auto overflow-hidden text-black mx-auto max-w-5xl px-4 font-basel-grotesk-book pt-16 md:pt-20">
      <div className="flex flex-col space-y-4">
        <button
          onClick={() => router.push('/explore/pool')}
          className="flex flex-row items-center justify-start text-text-200 text-sm space-x-2"
        >
          <RightIcon width={16} height={16} className="rotate-180 text-text-200 hover:text-blue-700" />
          <span className="hover:text-blue-700">Pools</span>
        </button>

        {isLoading ? (
          <Skeleton active paragraph={{ rows: 2 }} />
        ) : (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-row items-center space-x-2">
              <PoolNameDiv assets={poolStore.pool.assets} />
              <div className="rounded-lg border border-blue-500 px-2 py-1 text-xs text-text-200 flex flex-row space-x-1">
                <Image src={poolStore.pool.type === "StablePool" ? "/stable.svg" : "/volatile.svg"} alt={poolStore.pool.type} width={12} height={12} />
                <span>{poolStore.pool.type}</span>
              </div>
            </div>
            <div className="flex flex-row space-x-2 mt-2 md:mt-0">
              <SwapButton name="Swap" icon="/swap.svg" />
            </div>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row items-start w-full h-auto overflow-x-auto">
          <div className="w-full flex flex-col items-start shadow-md ring-1 ring-gray-200 bg-oxi-bg-04 p-6 rounded-lg h-auto max-w-full md:max-w-[566px] flex-shrink-0 mb-4 md:mb-0">
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
              <>
                <div className="flex flex-col">
                  <span className="text-base text-text-600">Manage</span>
                  <span className="text-gray-400 text-xs">Manage your position</span>
                </div>
                <div className="flex justify-between w-full gap-4 bg-gradient-to-r from-[#d8e0f2] via-[#f4f6fd] to-[#ece2f3] rounded-lg py-1 px-1 mt-4">
                  <ManageButton buttonName="Add" onButtonClick={() => handleOnClick("Add")} isActive={pathName === "Add"} />
                  <ManageButton buttonName="Remove" onButtonClick={() => handleOnClick("Remove")} isActive={pathName === "Remove"} />
                  <ManageButton buttonName="My Position" onButtonClick={() => handleOnClick("Position")} isActive={pathName === "Position"} />
                  <ManageButton buttonName="Rewards" onButtonClick={() => handleOnClick("Rewards")} isActive={pathName === "Rewards"} />
                </div>
                <div className="border-t-2 border-gray-100 p-2 w-full mt-4"></div>

                <Suspense fallback={<Skeleton active />}>
                  {pathName === "Add" && <AddLiquidityInputDiv assets={poolStore.pool.assets} onAction={handleAddLiquidityConfirm} />}
                  {pathName === "Remove" && <RemoveLiquidityDiv pool={poolStore.pool} />}
                  {pathName === "Position" && (
                    <MyPosition 
                      addLiquidityOpen={handleAddLiquidity}
                      noPositionSpan1="You have no position in this pool."
                      removeLiquidityOpen={handleRemoveLiquidity}
                      hasPosition={true} 
                      assets={poolStore.pool.assets} 
                      type={poolStore.pool.type}
                      cardClick={() => setLiquidityCardOpen(!liquidityCardOpen)}
                      isCardOpen={liquidityCardOpen}
                      isExplore={true}
                      poolAssetId={poolId}
                    />
                  )}
                  {pathName === "Rewards" && <Rewards />}
                </Suspense>
              </>
            )}
          </div>
          
          <div className="flex-grow flex flex-col space-y-2 w-full md:w-auto md:ml-6 mb-24 md:mb-0">
            {isLoading ? (
              <>
                <Skeleton active paragraph={{ rows: 4 }} />
                <Skeleton active paragraph={{ rows: 4 }} />
              </>
            ) : (
              <>
                <div className="bg-oxi-bg-04 rounded-lg shadow-md ring-1 ring-gray-200 p-6 w-full md:w-auto md:mb-4">
                  <div className="flex flex-col">
                    <span className="text-xl text-text-600">Pool Liquidity</span>
                    <span className="text-md text-text-500">{poolStore.statistics.liquidity || "-"} </span>
                  </div>
                  <div className="flex flex-col mt-4">
                    <span className="text-xs text-text-500 mb-1">Assets</span>
                    <AssetDiv assets={poolStore.pool.assets} />
                  </div>
                </div>
                <div className="space-y-4 rounded-lg shadow-md ring-1 ring-gray-200 bg-oxi-bg-04 p-6 w-full">
                  <span className="text-xl text-text-600">Statistics</span>
                  <StatsDiv statsName="TVL" statsValue={poolStore.statistics.tvl || "-"} />
                  <StatsDiv statsName="APR for LPs" statsValue={poolStore.statistics.apr || "-"} />
                  <StatsDiv statsName="Fees (24h)" statsValue={poolStore.statistics.fees || "-"} />
                  <StatsDiv statsName="Volume (24h)" statsValue={poolStore.statistics.volume || "-"} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {confirmOpen && (
        <PopupModal isOpen={confirmOpen} onClose={handlePositionConfirmClose}>
          <PositionConfirm 
            assets={poolStore.pool.assets}
            amounts={poolStore.addLiquidityAmounts}
            onAction={handlePositionConfirmClose} 
            isExplore={true} 
            poolAssetId={poolId}
            poolType={poolStore.pool.type}
            isPreview={true}
          />
        </PopupModal>
      )} 
      <div className='relative z-50'>
        <div className='fixed right-0 top-32 w-72 h-auto flex flex-col'>
          {notificationStore.notifications.length > 0 && (
            <SwapNotification />
          )}
        </div>
      </div>
    </main>
  );
});

export default PoolDetail;