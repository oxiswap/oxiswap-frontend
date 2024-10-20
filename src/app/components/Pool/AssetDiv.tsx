import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { PoolDetailProps } from "@utils/interface";
import { CryptoFactory } from '@blockchain/CryptoFactory';
import { CryptoPair } from '@blockchain/CryptoPair';
import { useStores } from '@stores/useStores';
import { Account, BN as FuelsBN } from 'fuels';
import { sortAsset } from "@utils/helpers";
import BN from "@utils/BN";
import DrawAssetIcon from "@components/AssetIcon/DrawAssetIcon";

interface DryRunResult<T> {
  value: T;
}

const AssetDiv = React.memo(({ assets }: Pick<PoolDetailProps, 'assets'>) => {
  const assetLength = assets.length;
  const [reserves, setReserves] = useState<string[]>(Array(assetLength).fill("0"));
  const { accountStore } = useStores();
  const factory = new CryptoFactory(accountStore.getWallet as Account);
  const pairContract = new CryptoPair(accountStore.getWallet as Account);

  const sortedAssets = useMemo(() => {
    if (assetLength === 2) {
      const asset0 = { bits: assets[0].assetId };
      const asset1 = { bits: assets[1].assetId };
      const sorted = sortAsset(asset0, asset1);
      return sorted.map(asset => asset.bits);
    }
    return assets.map(asset => asset.assetId);
  }, [assets, assetLength]);

  useEffect(() => {
    const fetchPairInfo = async () => {
      try {
        if (assetLength < 2) return;

        if (assetLength === 2) {
          const { pair } = await factory.getPair(assets[0].assetId, assets[1].assetId);
          const reservesResult: DryRunResult<FuelsBN[]> = await pairContract.getReserves(pair);
                    
          if (Array.isArray(reservesResult.value) && reservesResult.value.length >= 2) {
            const formattedReserves = reservesResult.value.slice(0, 2).map((reserve: FuelsBN) => 
              BN.formatUnits(reserve.toString()).toSignificant(4).toString()
            );
            setReserves(formattedReserves);
          } else {
            console.error('Unexpected reserves result format:', reservesResult);
            setReserves(["0", "0"]);
          }
        } else if (assetLength === 3) {
          setReserves(["0", "0", "0"]);
        }
      } catch (error) {
        console.error('Error fetching pair info:', error);
        setReserves(Array(assetLength).fill("0"));
      }
    };
    fetchPairInfo();
  }, [assets, assetLength, factory, pairContract]);

  return (
    <div className="flex flex-col w-full space-y-4 mt-2">
      {assets.map((asset, index) => {
        const reserveIndex = sortedAssets.indexOf(asset.assetId);
        return (
          <div key={index} className="flex flex-row items-center justify-between w-full">
            <div className="flex flex-row items-center">
              {asset.icon ? (
                <Image src={asset.icon} alt={asset.name} width={20} height={20} className="mr-2" />
              ) : (
                <DrawAssetIcon assetName={asset.name} className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] mr-2" />
              )}
              <span className="text-sm text-gray-600">{asset.name}</span>
            </div>
            <div className="flex flex-row items-center space-x-1">
              <span className="text-sm font-medium">
                {reserveIndex >= 0 ? reserves[reserveIndex] : '0'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default AssetDiv;