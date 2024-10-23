import Image from 'next/image';
import React from 'react';
import DrawAssetIcon from "@components/AssetIcon/DrawAssetIcon";

interface AssetSelectorProps {
  asset: {
    symbol: string;
    name: string;
    icon: string;
  };
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({ asset }) => (
  <div className="flex items-center ml-1 text-[16px]">
    {asset?.symbol ? (
      <>
        {asset.icon ? (
              <Image 
                src={asset.icon} 
                alt={asset.symbol} 
                width={22} 
                height={22} 
                className="mr-3"
              />
            ) : (
              <DrawAssetIcon 
                assetName={asset.name} 
                className="w-8 h-8 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-white font-bold mr-3"
              />
            )}
        <span>{asset.symbol}</span>
      </>
    ) : (
      <span className='text-sm'>Select asset</span>
    )}
    <Image src="/right.svg" alt="rightIcon" width={12} height={12} className="text-white ml-2 rotate-90" />
  </div>
);