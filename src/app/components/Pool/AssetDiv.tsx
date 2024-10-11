import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { PoolDetailProps } from "@utils/interface";
import { CryptoFactory } from '@blockchain/CryptoFactory';
import { CryptoPair } from '@blockchain/CryptoPair';
import { useStores } from '@stores/useStores';
import { Account } from 'fuels';
import { sortAsset } from "@utils/helpers";
import BN from "@utils/BN";

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
      return [sorted[0].toString(), sorted[1].toString()];
    }
    return undefined;
  }, [assets, assetLength]);

  useEffect(() => {
    const fetchPairInfo = async () => {
      try {
        if (assetLength < 2) return;

        if (assetLength === 2) {
          const { isPair, pair } = await factory.getPair(assets[0].assetId, assets[1].assetId);
          const reservesResult = await pairContract.getReserves(pair);
          setReserves([BN.formatUnits(reservesResult.value[0]).toSignificant(4).toString(), BN.formatUnits(reservesResult.value[1]).toSignificant(4).toString()]);
        } else if (assetLength === 3) {
          setReserves(["0", "0", "0"]);
        }
      } catch (error) {
        console.error('Error fetching pair info:', error);
      }
    };
    fetchPairInfo();
  }, [assets, assetLength, factory, pairContract]);


  return (
    <div className="flex flex-col w-full space-y-4 mt-2">
      {assets.map((asset, index) => (
        <div key={index} className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-row items-center">
            <Image src={asset.icon} alt={asset.name} width={18} height={18} className="mr-2" />
            <span className="text-sm text-gray-600">{asset.name}</span>
          </div>
          <div className="flex flex-row items-center space-x-1">
            <span className="text-sm font-medium">
              {sortedAssets && sortedAssets[0] === asset.assetId
                ? reserves[0]
                : reserves[1]
              }
            </span>
            <span className="text-sm font-normal text-gray-400">{asset.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
});

export default AssetDiv;