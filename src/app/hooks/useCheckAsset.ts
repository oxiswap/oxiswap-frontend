import { useState, useEffect } from 'react';
import { Asset, IAsset, ZERO_ADDRESS } from '@utils/interface';
import { Src20Standard } from '@blockchain/Src20Standard';
import { useStores } from '@stores/useStores';
import { Account, createAssetId, isB256, InvokeFunctions } from 'fuels';

export function useCheckAsset(wallet: Account, contractId?: string | null, assetId?: string) {
  // const [asset, setAsset] = useState<Asset | null>(null);
  // const { accountStore } = useStores();

  // useEffect(() => {
  //   async function checkAsset() {
  //     if (!contractId) {
  //       setAsset(null);
  //       return;
  //     }

  //     if (!isB256(contractId)) {
  //       setAsset(null);
  //       return;
  //     }

  //     try {
  //       const wallet = accountStore.getWallet;
  //       const src20 = new Src20Standard(wallet as Account);
  //       const name = await src20.getName(contractId, assetId);
  //       const symbol = await src20.getSymbol(contractId, assetId);
  //       const decimals = await src20.getDecimals(contractId, assetId);
  //       // const newAssetId = assetId === ZERO_ADDRESS ? createAssetId(contractId, ZERO_ADDRESS).bits : assetId;
  //       const newAsset = IAsset.new(name.value, "/stable.svg", symbol.value, assetId, decimals.value, contractId, "", "");
  //       setAsset(newAsset);
  //     } catch (error) {
  //       console.error('Error checking asset: ', error);
  //       setAsset(null);
  //     }
  //   }

  //   checkAsset();
  // }, [contractId, accountStore]);

  // return asset;
  return (contractId: string, assetId: string) => {
    if (!isB256(contractId)) {
      return null;
    }

    const src20 = new Src20Standard(wallet);
    
    return {
      getName: () => src20.getName(contractId, assetId),
      getSymbol: () => src20.getSymbol(contractId, assetId),
      getDecimals: () => src20.getDecimals(contractId, assetId)
    };
  };
}