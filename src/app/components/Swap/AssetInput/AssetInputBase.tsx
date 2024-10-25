import React from 'react';
import { Skeleton } from 'antd';
import { AssetSelector } from '@components/Swap/AssetInput/AssetSelector';
import { SkeletonLoader } from '@components/Swap/AssetInput/SkeletonLoader';
import { AssetInfo } from '@components/Swap/AssetInput/AssetInfo';

interface AssetInputBaseProps {
  loading: boolean;
  amount: string;
  placeholder: string;
  readOnly: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAssetCardOpen: () => void;
  asset: any;
  price: string;
  balance: string;
  priceImpact?: string;
  isFrom: boolean;
}

export const AssetInputBase: React.FC<AssetInputBaseProps> = ({
  loading,
  amount,
  placeholder,
  readOnly,
  onChange,
  onAssetCardOpen,
  asset,
  price,
  balance,
  priceImpact,
  isFrom,
}) => (
  <div className={`bg-oxi-bg-02 p-6 rounded-2xl ${isFrom ? 'mt-4 mb-2' : ''}`}>
    <div className="flex justify-between items-center">
      {loading ? (
        <Skeleton.Input style={{ width: '66%', height: '16px' }} active />
      ) : (
        <input
          type="text"
          autoComplete="off"
          autoCorrect="off"
          min={0}
          value={amount}
          placeholder={placeholder}
          onChange={onChange}
          readOnly={readOnly}
          className={`
            font-basel-grotesk-book bg-transparent text-2xl md:text-2xl outline-none w-2/3 text-black appearance-none 
            [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
            ${readOnly ? 'cursor-not-allowed' : ''}
          `}
        />
      )}
      <button
        onClick={onAssetCardOpen}
        className={`flex items-center justify-between px-2 py-1 rounded-xl shadow-md whitespace-nowrap ${
          asset.symbol ? 'bg-oxi-bg-02 text-black hover:shadow-lg hover:bg-oxi-bg-03' : 'bg-button-100 text-white hover:shadow-lg hover:bg-button-100/90'
        }`}
      >
        <AssetSelector asset={asset} />
      </button>
    </div>
    <div className="flex justify-between mt-2">
      {loading ? (
        <SkeletonLoader />
      ) : (
        <AssetInfo price={price} balance={balance} priceImpact={priceImpact} toAmount={isFrom ? "" : amount} />
      )}
    </div>
  </div>
);