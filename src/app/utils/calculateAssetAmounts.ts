import { Asset } from '@utils/interface';
import { CryptoFactory } from '@blockchain/CryptoFactory';
import { CryptoPair } from '@blockchain/CryptoPair';
import { Account } from 'fuels';
import BN from "@utils/BN";
import { sortAsset } from '@utils/helpers';

export const calculateAmounts = async (
  assets: Asset[],
  removeLiquidityAmounts: string,
  reserves: any,
  totalSupply: any
): Promise<[string, string]> => {
  if (assets.length < 2) return ['0', '0'];

  const asset0_bits = { bits: assets[0].assetId };
  const asset1_bits = { bits: assets[1].assetId };
  const [new_asset0, new_asset1] = sortAsset(asset0_bits, asset1_bits);
  const isAsset0First = asset0_bits.bits === new_asset0.bits;
  const fromDecimals = assets[0].decimals || 9;
  const toDecimals = assets[1].decimals || 9;
  const fromRemoveLiquidity = new BN(removeLiquidityAmounts).mul(new BN(10).pow(new BN(9 - fromDecimals)));
  const toRemoveLiquidity = new BN(removeLiquidityAmounts).mul(new BN(10).pow(new BN(9 - toDecimals)));
  const amount0 = (fromRemoveLiquidity.mul(reserves.value[0])).div(totalSupply.value.toNumber()).toFixed(assets[0].decimals || 9);
  const amount1 = (toRemoveLiquidity.mul(reserves.value[1])).div(totalSupply.value.toNumber()).toFixed(assets[1].decimals || 9);
  const reserveIn = isAsset0First ? amount0 : amount1;
  const reserveOut = isAsset0First ? amount1 : amount0;

  return [reserveIn, reserveOut];
};

export const estimateAmounts = async (
  assets: Asset[],
  removeLiquidityAmounts: string,
  account: Account
): Promise<[string, string]> => {
  try {
    if (assets.length < 2) return ['0', '0'];

    const factory = new CryptoFactory(account);
    const pairContract = new CryptoPair(account);

    const { pair } = await factory.getPair(assets[0].assetId, assets[1].assetId);
    const reserves = await pairContract.getReserves(pair);
    const totalSupply = await pairContract.getTotalSupply(pair);

    return calculateAmounts(assets, removeLiquidityAmounts, reserves, totalSupply);
  } catch (error) {
    console.error('Error estimating amounts:', error);
    return ['0', '0'];
  }
};