'use client'
import Image from "next/image";
import React, { useState, useEffect} from "react";
import LiquidityButton from "@components/Pool/LiquidityButton";
import { PoolInfoProps } from "@utils/interface";
import { Skeleton } from "antd";
import { useStores } from "@stores/useStores";
import { observer } from "mobx-react";
import AddLiquidityAssetInput from "./AddLiquidityAssetInput";


const MultiAssetInputDiv: React.FC<Pick<PoolInfoProps, 'assets'> & { onAmountsChange: (amounts: string[]) => void }> = observer(({ assets, onAmountsChange }) => {
  const [amounts, setAmounts] = useState<string[]>(new Array(assets.length).fill(""));

  // const handleAmountChange = (index: number) => (amount: string) => {
  //   const newAmounts = [...amounts];
  //   newAmounts[index] = amount;
  //   setAmounts(newAmounts);
  //   onAmountsChange(newAmounts);
  // };

  return (
    <div className="w-full flex flex-col items-center">
      {assets.map((asset, index) => (
        <React.Fragment key={index}>
          <AddLiquidityAssetInput 
            icon={asset.icon} 
            symbol={asset.symbol} 
            assetId={asset.assetId}
            decimals={asset.decimals}
            assetIndex={index} 
            // onAmountChange={handleAmountChange(index)}
          />
          {index < assets.length - 1 && (
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

const AddLiquidityInputDiv: React.FC<PoolInfoProps> = observer(({ assets, onAction }) => {
  const [isLoading, setIsLoading] = useState(true);
  // const [amounts, setAmounts] = useState<string[]>(new Array(assets.length).fill(""));
  const { poolStore, accountStore, balanceStore, positionStore, buttonStore } = useStores();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    positionStore.setAddLiquidityAssets(assets);
  },[])

  const handleAmountsChange = (newAmounts: string[]) => {
    // setAmounts(newAmounts);
    poolStore.setAddLiquidityAmounts(newAmounts);
  };

  useEffect(() => {
    if (positionStore.manageName === "Add") {
      if (!accountStore.isConnected) {
        buttonStore.setPositionButtonName("Connect Wallet");
        buttonStore.setPositionButtonDisabled(false);
        buttonStore.setPositionButtonClassName("bg-button-100/30 text-text-200 hover:border-white hover:bg-button-100/70");
        return;
      }

      positionStore.setIsPosition(false);
      buttonStore.setPositionButtonName("Add Liquidity");
      buttonStore.setPositionButtonDisabled(true);
      buttonStore.setPositionButtonClassName("bg-oxi-bg-03 text-oxi-text-01");
    }
  }, [accountStore.isConnected]);

  return (
    <div className="w-full">
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 2 }} />
      ) : (
        <>
          <MultiAssetInputDiv assets={assets} onAmountsChange={handleAmountsChange} />
          <LiquidityButton onAction={() => onAction()} />
        </>
      )}
    </div>
  );
});

export default AddLiquidityInputDiv;