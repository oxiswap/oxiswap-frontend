import { useState, useEffect, useCallback } from 'react';
import { Asset } from '@utils/interface';
import { useStores } from '@stores/useStores';
import { estimateAmounts } from '@utils/calculateAssetAmounts';
import { Account } from 'fuels';

export const useCalculateAssetAmounts = (assets: Asset[], removeLiquidityAmounts: string) => {
  const [amounts, setAmounts] = useState<[string, string]>(['0', '0']);
  const { accountStore, poolStore } = useStores();

  const calculateAndUpdateAmounts = useCallback(async () => {
    try {
      const [reserveIn, reserveOut] = await estimateAmounts(assets, removeLiquidityAmounts, accountStore.getWallet as Account);
      setAmounts([reserveIn, reserveOut]);
      poolStore.setRemoveReceives([reserveIn, reserveOut]);
    } catch (error) {
      console.error('Error calculating and updating amounts:', error);
    }
  }, [assets, removeLiquidityAmounts, accountStore.getWallet, poolStore]);

  useEffect(() => {
    calculateAndUpdateAmounts();
  }, [calculateAndUpdateAmounts]);

  return {
    amounts,
    calculateAndUpdateAmounts
  };
};
