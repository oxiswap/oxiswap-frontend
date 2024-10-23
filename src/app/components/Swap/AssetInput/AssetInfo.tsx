import React from 'react';
import WalletIcon from '@assets/icons/WalletIcon';
import BN from '@utils/BN';

interface AssetInfoProps {
  price: string;
  balance: string;
  priceImpact?: string;
  toAmount?: string;
}

export const AssetInfo: React.FC<AssetInfoProps> = ({ price, balance, priceImpact, toAmount }) => (
  <>
    <div className="flex items-center">
      <span className="text-sm text-[#8f9ba7]">${price === undefined || price === 'NaN' ? '0.00' : price}</span>
        {toAmount !== "" && toAmount !== "0" && (
          <span className={`text-sm ${Number(priceImpact) > 5 ? 'text-red-600' : 'text-[#8f9ba7]'}`}>
            &nbsp;(-{priceImpact}%)
          </span>
        )}
    </div>
    <div className="flex items-center cursor-pointer">
      <span className="text-sm text-[#8f9ba7] mr-2">{balance}</span>
      <WalletIcon width={16} height={16} className="text-text-100" />
    </div>
  </>
);