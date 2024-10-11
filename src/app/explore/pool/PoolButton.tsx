import React, { useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useStores } from "@stores/useStores";
import { PoolButtonProps } from "@utils/interface";

export const PoolButton: React.FC<Pick<PoolButtonProps, 'assets' | 'type' | 'tvl' | 'apr' | 'poolAssetId'>> = React.memo(({ assets, type, tvl, apr, poolAssetId }) => {
  const router = useRouter();
  const { positionStore } = useStores();

  const handleClick = useCallback(() => {
    router.push(`/explore/pool/${poolAssetId}`);
    positionStore.setManageName("Add");
  }, [router, positionStore, poolAssetId]);


  return (
    <div className="block w-full">
      <button className="flex flex-row text-black items-center justify-between w-full px-6 py-6 bg-white rounded-3xl hover:bg-blue-100 " onClick={handleClick} >
        <div className="flex -space-x-2">
          {assets.map((asset, index) => (
            <Image 
              key={index}
              src={asset.icon} 
              alt={asset.symbol} 
              width={24} 
              height={24} 
              className={`rounded-full border-2 border-white ${index > 0 ? 'relative' : ''}`}
              style={{ zIndex: assets.length - index }}
            />
          ))}
        </div>

        <div className="flex flex-col flex-grow ml-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              {assets.map((asset, index) => (
                <React.Fragment key={index}>
                  {asset.symbol}
                  {index < assets.length - 1 && ' / '}
                </React.Fragment>
              ))}
            </span>
            <div className="flex justify-center items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
              <Image src={type === "StablePool" ? "/stable.svg" : "/volatile.svg"} alt="stable" width={12} height={12} />
              <span>{type}</span>
            </div>
          </div>
          <div className="flex space-x-4 text-xs mt-1">
            <span className="text-gray-500">TVL: <span className="text-black">{tvl}</span></span>
            <span className="text-gray-500">APR: <span className="text-black">{apr}</span></span>
          </div>
        </div>

        <div className="flex items-center">
          <Image src="/right.svg" alt="Expand" width={20} height={20} />
        </div>
      </button>
    </div>
  );
});

PoolButton.displayName = 'PoolButton';