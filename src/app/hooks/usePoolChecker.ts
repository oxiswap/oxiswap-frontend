import { useState, useEffect } from "react";
import { CryptoFactory } from "@blockchain/CryptoFactory";
import { Src20Standard } from "@blockchain/Src20Standard";
import { useStores } from "@stores/useStores";
import { Account } from "fuels";

export const usePoolChecker = () => {
  const [poolAssets, setPoolAssets] = useState<Array<{
    id: string[];
    name: string[];
    symbol: string[];
  }>>([]);
  const { balanceStore, accountStore } = useStores();
  const factory = new CryptoFactory(accountStore.getWallet as Account);
  const src20 = new Src20Standard(accountStore.getWallet as Account);

  useEffect(() => {
    const fetchAssets = async () => {
      const allBalances = balanceStore.getAllBalances();
      const assetIds = Array.from(allBalances.keys());
      
      try {
        const poolAssetsPromises = assetIds.map(async (assetId) => {
          const pair = {bits: assetId};
          const result = await factory.getAssets(pair);
         
          const [asset0, asset1] = result.value;
          
          if (asset0.bits !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
            
            const name0 = (await src20.getName(asset0)).value;
            const symbol0 = (await src20.getSymbol(asset0)).value;
            const name1 = (await src20.getName(asset1)).value;
            const symbol1 = (await src20.getSymbol(asset1)).value;
            return { id: [asset0, asset1], name: [name0, name1], symbol: [symbol0, symbol1] };
          }
          return null;
        });
        const poolAssetsResults = await Promise.all(poolAssetsPromises);
        const validPoolAssets = poolAssetsResults.filter((asset): asset is NonNullable<typeof asset> => asset !== null);
        setPoolAssets(validPoolAssets);

      } catch (error) {
        console.error("Error fetching pool assets:", error);
      }
    };

    fetchAssets();
  }, [balanceStore, accountStore, factory, src20]);

  return poolAssets;
};