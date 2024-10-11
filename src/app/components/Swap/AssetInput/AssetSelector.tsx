import Image from 'next/image';
import React from 'react';

interface AssetSelectorProps {
  asset: {
    symbol: string;
    icon: string;
  };
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({ asset }) => (
  <div className="flex items-center ml-1 text-[16px]">
    {asset?.symbol ? (
      <>
        <Image src={asset.icon} alt={asset.symbol} width={22} height={22} className="mr-3" />
        <span>{asset.symbol}</span>
      </>
    ) : (
      <span className='text-sm'>Select asset</span>
    )}
    <Image src="/right.svg" alt="rightIcon" width={12} height={12} className="text-white ml-2 rotate-90" />
  </div>
);