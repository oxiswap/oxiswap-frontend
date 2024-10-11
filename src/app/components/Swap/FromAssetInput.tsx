import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '@stores/useStores';
import { useSwapInput } from '@hooks/useSwapInput';
import { ZERO_ADDRESS } from '@utils/interface';
import { AssetInputBase } from '@components/Swap/AssetInput/AssetInputBase';

interface FromAssetInputProps {
  onAssetCardOpen: () => void;
}

const FromAssetInput: React.FC<FromAssetInputProps> = observer(({ onAssetCardOpen }) => {
  const { swapStore, accountStore } = useStores();
  const { currentBalance, handleInputChange } = useSwapInput(true);

  return (
    <AssetInputBase
      loading={swapStore.fromLoading}
      amount={swapStore.fromAmount}
      placeholder="0.00"
      readOnly={swapStore.fromAsset.assetId === ZERO_ADDRESS}
      onChange={handleInputChange}
      onAssetCardOpen={onAssetCardOpen}
      asset={swapStore.fromAsset}
      price={swapStore.fromAssetPrice}
      balance={accountStore.isConnected ? currentBalance : '0'}
      isFrom={true}
    />
  );
});

export default FromAssetInput;