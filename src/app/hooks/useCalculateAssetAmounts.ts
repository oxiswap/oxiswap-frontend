import { useState, useEffect } from 'react';
import { Asset } from '@utils/interface';
import { useStores } from '@stores/useStores';
import { CryptoFactory } from '@blockchain/CryptoFactory';
import { CryptoPair } from '@blockchain/CryptoPair';
import { Account } from 'fuels';
import BN from "@utils/BN";
import { sortAsset } from '@utils/helpers';

export const useCalculateAssetAmounts = (assets: Asset[], removeLiquidityAmounts: string) => {
  const [amounts, setAmounts] = useState<[string, string]>(['0', '0']);
  const { accountStore, poolStore} = useStores();

  const factory = new CryptoFactory(accountStore.getWallet as Account);
  const pairContract = new CryptoPair(accountStore.getWallet as Account);

  useEffect(() => {
    const fetchRemoveAmonuts = async () => {
      try {
        if(assets.length < 2) return;

        const { pair } = await factory.getPair(assets[0].assetId, assets[1].assetId);
        const reserves = await pairContract.getReserves(pair);

        const asset0_bits = { bits: assets[0].assetId };
        const asset1_bits = { bits: assets[1].assetId };
        const [new_asset0, new_asset1] = sortAsset(asset0_bits, asset1_bits);
        const isAsset0First = asset0_bits.bits === new_asset0.bits;
        const totalSupply = await pairContract.getTotalSupply(pair);
        const fromDecimals = assets[0].decimals || 9;
        const toDecimals = assets[1].decimals || 9;
        const fromRemoveLiquidity = new BN(removeLiquidityAmounts).mul(new BN(10).pow(new BN(9 - fromDecimals)));
        const toRemoveLiquidity = new BN(removeLiquidityAmounts).mul(new BN(10).pow(new BN(9 - toDecimals)));
        const amount0 = (fromRemoveLiquidity.mul(reserves.value[0])).div(totalSupply.value.toNumber()).toFixed(assets[0].decimals || 9);
        const amount1 = (toRemoveLiquidity.mul(reserves.value[1])).div(totalSupply.value.toNumber()).toFixed(assets[1].decimals || 9);
        const reserveIn = isAsset0First ? amount0 : amount1;
        const reserveOut = isAsset0First ? amount1 : amount0;
        setAmounts([reserveIn, reserveOut]);

        poolStore.setRemoveReceives([reserveIn, reserveOut]);
      } catch (error) {
        console.error('Error fetching remove amounts:', error);
      }
    };
    fetchRemoveAmonuts();
  }, [assets, accountStore, removeLiquidityAmounts]);

  return amounts;
}