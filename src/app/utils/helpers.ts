import { AssetId, bn } from "fuels";
import BN from "@utils/BN";

export function sortAsset(asset0: AssetId, asset1: AssetId): [AssetId, AssetId] {
  const asset0BN = bn(asset0.bits);
  const asset1BN = bn(asset1.bits);

  if (asset0BN.eq(asset1BN)) {
    throw new Error('IdenticalAddresses');
  }

  if (asset0BN.lt(asset1BN)) {
    return [asset0, asset1];
  } else {
    return [asset1, asset0];
  }
}


export function formatUnits(amount: string, decimals = 9): string {
  return BN.formatUnits(new BN(amount))
    .toFormat(decimals)
    .replace(/\.?0+$/, '')
    .replace(/,/g, '')
    .replace(/^0+(?=\d)/, '');
}
