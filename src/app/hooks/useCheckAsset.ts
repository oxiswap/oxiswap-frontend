import { useState, useEffect } from 'react';
import { Asset, IAsset, ZERO_ADDRESS } from '@utils/interface';
import { Src20Standard } from '@blockchain/Src20Standard';
import { useStores } from '@stores/useStores';
import { Account, createAssetId, isB256 } from 'fuels';

export function useCheckAsset(contractId: string | null) {
  const [asset, setAsset] = useState<Asset | null>(null);
  const { accountStore } = useStores();

  useEffect(() => {
    async function checkAsset() {
      if (!contractId) {
        setAsset(null);
        return;
      }

      if (!isB256(contractId)) {
        setAsset(null);
        return;
      }

      try {
        const wallet = accountStore.getWallet;
        const src20 = new Src20Standard(wallet as Account);
        const name = await src20.getName(contractId);
        const symbol = await src20.getSymbol(contractId);
        const decimals = await src20.getDecimals(contractId);
        const assetId = createAssetId(contractId, ZERO_ADDRESS);
        const newAsset = IAsset.new(name.value, "/stable.svg", symbol.value, assetId.bits, decimals.value, contractId, "", "");
        setAsset(newAsset);
      } catch (error) {
        console.error('Error checking asset: ', error);
        setAsset(null);
      }
    }

    checkAsset();
  }, [contractId, accountStore]);

  return asset;
}