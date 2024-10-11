import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '@stores/useStores';
import { useSwapInput } from '@hooks/useSwapInput';
import { ZERO_ADDRESS } from '@utils/interface';
import { AssetInputBase } from '@components/Swap/AssetInput/AssetInputBase';

interface ToAssetInputProps {
  onAssetCardOpen: () => void;
}

const ToAssetInput: React.FC<ToAssetInputProps> = observer(({ onAssetCardOpen }) => {
  const { swapStore, accountStore } = useStores();
  const { currentBalance, handleInputChange } = useSwapInput(false);

  return (
    <AssetInputBase
      loading={swapStore.toLoading}
      amount={swapStore.toAmount}
      placeholder="0.00"
      readOnly={swapStore.toAsset.assetId === ZERO_ADDRESS}
      onChange={handleInputChange}
      onAssetCardOpen={onAssetCardOpen}
      asset={swapStore.toAsset}
      price={swapStore.toAssetPrice}
      balance={accountStore.isConnected ? currentBalance : '0'}
      priceImpact={swapStore.priceImpact}
      isFrom={false}
    />
  );
});

export default ToAssetInput;