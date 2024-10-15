import { useState, useEffect } from 'react';
import { Contract, Account } from 'fuels';
import { FACTORY_ADDRESS } from '@constants/index';
import FAC_ABI from '@constants/abi/crypto-factory-abi.json';
import { useStores } from '@stores/useStores';

export const usePairInfo = (asset1: string, asset2: string) => {
  const [pair, setPair] = useState<string>('');
  const [isPair, setIsPair] = useState<boolean>(false);
  const { accountStore } = useStores();

  useEffect(() => {
    const getPairInfo = async () => {
      if (asset2 === '0x0000000000000000000000000000000000000000000000000000000000000000' || !asset2) {
        setIsPair(false);
        return;
      }

      const factory = new Contract(
        FACTORY_ADDRESS,
        FAC_ABI,
        accountStore.getWallet as Account
      );

      const assetA = {
        bits: asset1,
      };
      const assetB = {
        bits: asset2,
      };

      const pair = await factory.functions.get_pair(assetA, assetB).get();

      if (
        pair.value.bits ===
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      ) {
        setIsPair(false);
        setPair(
          '0x0000000000000000000000000000000000000000000000000000000000000000'
        );
      } else {
        setIsPair(true);
        setPair(pair.value.bits);
      }
    };

    getPairInfo();
  }, [asset1, asset2, accountStore]);

  return { isPair, pair };
};
