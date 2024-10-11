import React from 'react';
import Image from 'next/image';

interface AssetInfoProps {
  price: string;
  balance: string;
  priceImpact?: string;
}

export const AssetInfo: React.FC<AssetInfoProps> = ({ price, balance, priceImpact }) => (
  <>
    <div className="flex items-center">
      <span className="text-sm text-[#8f9ba7]">~${price}</span>
      {priceImpact && priceImpact !== '0' && (
        <span className={`text-sm ${Number(priceImpact) > 5 ? 'text-red-600' : 'text-[#8f9ba7]'}`}>
          &nbsp;(-{priceImpact}%)
        </span>
      )}
    </div>
    <div className="flex items-center cursor-pointer">
      <span className="text-sm text-[#8f9ba7] mr-2">{balance}</span>
      <Image src="/wallet.svg" alt="wallet" width={16} height={16} />
    </div>
  </>
);