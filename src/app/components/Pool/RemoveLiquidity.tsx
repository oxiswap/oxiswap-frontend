'use client'
import React, { useState, useEffect } from "react";
import LiquidityButton from "./LiquidityButton";
import { RemoveLiquidityProps } from "@utils/interface";
import { Skeleton } from "antd";
import { useStores } from "@stores/useStores";
import { observer } from "mobx-react";
import { reaction } from "mobx";
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { CryptoRouter } from '@blockchain/CryptoRouter';
import { Account } from 'fuels';
import { useRouter } from 'next/navigation';
import { useCalculateAssetAmounts } from "@hooks/useCalculateAssetAmounts";
import { CryptoFactory } from '@src/app/blockchain';
import RemoveSliderDiv from "./RemoveSliderDiv";
import RemoveAssetDiv from "./RemoveAssetDiv";
import { removeLiquidity, updatePoolTvlAndApr } from "@utils/api";

const RemoveLiquidityDiv: React.FC<Pick<RemoveLiquidityProps, 'pool' >> = observer(({ pool }) => {
  const router = useRouter();
  const [isSpin, setIsSpin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { poolStore, balanceStore, accountStore, buttonStore, notificationStore} = useStores();

  const exactBalance = balanceStore.getExactBalance(pool.poolAssetId, 9);
  const factory = new CryptoFactory(accountStore.getWallet as Account);
  const routerContract = new CryptoRouter(accountStore.getWallet as Account);

  const { amounts } = useCalculateAssetAmounts(pool.assets, poolStore.removeLiquidityAmounts);
  
  useEffect(() => {
    const getButtonName = ({isConnected, manageName, amount, balance}: {isConnected: boolean, manageName: string, amount: string, balance: string}) => {
      if (manageName === "Remove") {
        if (!isConnected) {
          buttonStore.setPositionButton("Connect Wallet", false, "bg-button-100/30 text-text-200 hover:border-white hover:bg-button-100/70");
          return;
        } 

        if (amount === "" || Number(amount) === 0) {
          buttonStore.setPositionButton("Enter an Amount", true, "bg-oxi-bg-03 text-oxi-text-01");
          return;
        } 
       
        if (Number(amount) > Number(balance)) {
          buttonStore.setPositionButton("Insufficient Balance", true, "bg-oxi-bg-03 text-oxi-text-01");
          return;
        }

        buttonStore.setPositionButton("Remove Liquidity", false, "bg-gradient-to-r from-blue-500 to-blue-700 text-white");
      }
    };

    getButtonName({
      isConnected: accountStore.isConnected,
      manageName: poolStore.manageName,
      amount: poolStore.removeLiquidityAmounts,
      balance: exactBalance
    });

    const disposer = reaction(
      () => ({
        isConnected: accountStore.isConnected,
        manageName: poolStore.manageName,
        amount: poolStore.removeLiquidityAmounts,
        balance: exactBalance
      }),
      getButtonName
    );

    return () => disposer();
  }, [accountStore, balanceStore, buttonStore, pool.assets, poolStore]);

  const removeMessage = `remove ${poolStore.removeLiquidityAmounts} liquidity to the ${pool.assets[0].symbol} / ${pool.assets[1].symbol}`;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handelRemoveLiquidity = async () => {
    setIsSpin(true);

    let results;

    try {
      results = await notificationStore.handleMultiStepTransactionNotification(
        removeMessage,
        routerContract.removeLiquidity(pool.poolAssetId, pool.assets, [poolStore.removeLiquidityAmounts], () => {}),
        () => {}
      );
    } catch (error) {
      console.error('Error removing liquidity:', error);
    }


    if (results.success){

      setIsSpin(false);

      const { pair } = await factory.getPair(pool.assets[0].assetId, pool.assets[1].assetId);
      const onlyKey = accountStore.address + pair;
      // supabase
      await removeLiquidity(pool, onlyKey, poolStore.removeAllLiquidity, amounts);
      await updatePoolTvlAndApr(pair);
      poolStore.setRemoveInitialization();

    } else {
      setIsSpin(false);
    }
  };

  return (
    <div className="w-full h-auto">
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Skeleton active paragraph={{ rows: 3 }} />
        </div>
      ) : (
        <>
          <RemoveSliderDiv pool={pool}/>
          <div className="bg-oxi-bg-02 p-6 mt-1 mb-2 rounded-2xl w-full flex flex-col">
            <span className="text-xs text-gray-500">You&apos;ll receive at least:</span>
            <RemoveAssetDiv assets={pool.assets} />
          </div>
          {isSpin ? (
            <Spin indicator={<LoadingOutlined spin />} size="large" className="flex items-center justify-center w-full h-12 bg-gray-100 border border-gray-300 rounded-lg text-blue-500" />
          ) : (
            <LiquidityButton onAction={handelRemoveLiquidity} />
          )}
        </>
      )}
    </div>
  );
});

export default RemoveLiquidityDiv;