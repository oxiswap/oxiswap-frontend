import React, { useMemo } from "react";
import { observer } from "mobx-react";
import { useStores } from "@stores/useStores";
import { useAddLiquidityInput } from '@hooks/useAddLiquidityInput';
import { debounce } from 'lodash';
import { Asset } from "@utils/interface";
import Image from "next/image";
import { Skeleton } from 'antd';
import DrawAssetIcon from "@components/AssetIcon/DrawAssetIcon";
import WalletIcon from '@assets/icons/WalletIcon';

const AddLiquidityAssetInput: React.FC<Pick<Asset, 'icon' | 'symbol' | 'assetId' | 'decimals'> & { assetIndex: number }> = observer(({ icon, symbol, assetId, decimals, assetIndex }) => {
  const { balanceStore, accountStore, oracleStore, poolStore} = useStores();
  const currentBalance = balanceStore.getBalance(assetId, decimals);

  const { handleInputChange } = useAddLiquidityInput(assetIndex, true); 
  const debouncedHandleInputChange = useMemo(() => debounce(handleInputChange, 300), [handleInputChange]); 


  return (
    <div className="bg-oxi-bg-02 p-6 mt-1 mb-2 rounded-2xl w-full">
      <div className="flex justify-between items-center">
      {poolStore.loadingStates[assetIndex] ? (
          <Skeleton.Input style={{ width: '66%%', height: '16px' }} active />
        ) : 
        (<input
          type="text"
          autoComplete="off"
          autoCorrect="off"
          min={0}
          value={poolStore.getAmount(assetIndex)}
          placeholder="0.00"
          onChange={(e) => {
            handleInputChange(e);
            debouncedHandleInputChange(e);
          }}
          className="bg-transparent text-2xl md:text-3xl outline-none w-full mr-2 text-black appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />)}     
        <div className="flex items-center justify-center bg-white px-4 py-2 rounded-xl text-black text-base cursor-no-drop flex-shrink-0">
          {icon ? (
            <Image src={icon} alt="assetIcon" width={16} height={16} className="mr-2" />
          ) : (
            <DrawAssetIcon assetName={symbol} className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] mr-2" />
          )}
          <span>{symbol}</span>
        </div>
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-text-500">
          $ {accountStore.isConnected ? oracleStore.getAssetPrices(assetIndex) : "0.00" }
        </span>
        <div className="flex items-center">
          <span className="text-xs text-text-500 mr-2">{accountStore.isConnected ? currentBalance : "0"}</span>
          <WalletIcon width={16} height={16} className="text-text-100" />
        </div>
      </div>
    </div>
  );
});

export default AddLiquidityAssetInput;