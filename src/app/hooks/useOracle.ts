import { Account, Provider, Address } from 'fuels';
import { CryptoPair } from '@blockchain/CryptoPair';
import BN from '@utils/BN';
import { ETH_ASSET_ID, Asset } from '@utils/interface';
import { useCallback } from 'react';

interface OracleParams {
  account: Account | Provider;
  pair: string;
  asset0: Asset;
  asset1: Asset;
  amount0: string;
  amount1: string;
  ethPrice: string;
}

interface OracleResult {
  swapRate: string;
  priceImpact: string;
  assetPrices: [string, string];
  rateValue: string;
}

function sortAssets(asset1: string, asset2: string) {
  const new_asset1 = Address.fromString(asset1).toB256();
  const new_asset2 = Address.fromString(asset2).toB256();
  if (new_asset1 > new_asset2) {
    return [new_asset2, new_asset1];
  } 
  return [new_asset1, new_asset2];
}

function getPriceImpact(fromAssetIsAsset0: boolean, fromAmount: string, reserve0: string, reserve1: string, fromDecimals: number | undefined, toDecimals: number | undefined) { 
  const fromAmountFormated = BN.parseUnits(fromAmount.toString(), fromDecimals|| 9);
  const fee = new BN(3).div(new BN(1000));

  const amountInWithFee = new BN(fromAmountFormated).mul(new BN(1).sub(fee));
  let idealAmountOut: BN;
  let priceImpact: BN;
  let priceImpactValue: BN;

  if (fromAssetIsAsset0) {
    // asset0 -> asset1
    const numerator = amountInWithFee.mul(reserve1);
    const denominator = new BN(reserve0).add(amountInWithFee);
    idealAmountOut = numerator.div(denominator);

    const midPirce = new BN(reserve1).div(reserve0);
    const executionPrice = fromAmountFormated.div(idealAmountOut);
    priceImpact = new BN(midPirce.sub(executionPrice)).div(midPirce).mul(new BN(100));
    priceImpactValue = new BN(midPirce).sub(executionPrice);
  } else {
    // asset1 -> asset0
    const numerator = amountInWithFee.mul(reserve0);
    const denominator = new BN(reserve1).add(amountInWithFee);
    idealAmountOut = numerator.div(denominator);

    const midPrice = new BN(reserve0).div(reserve1);
    const executionPrice = idealAmountOut.div(fromAmountFormated);

    priceImpact = midPrice.sub(executionPrice).div(midPrice).mul(new BN(100));
    priceImpactValue = midPrice.sub(executionPrice);

  }

  return { priceImpact, priceImpactValue };
}


const calculateAssetPrice = (amount: string, ethPrice: string, decimals: number, swapRate: number = 1): string => {
  return new BN(amount)
    .mul(new BN(ethPrice))
    .mul(new BN(10).pow(decimals))
    .div(new BN(swapRate))
    .div(new BN(10).pow(9))
    .toFixed(6);
};

export const useOracle = (params: OracleParams) => {
  const updateOracle = useCallback(async (): Promise<OracleResult> => {
    const pairContract = new CryptoPair(params.account);
    const [new_asset0, new_asset1] = sortAssets(params.asset0.assetId, params.asset1.assetId);
    const reserves = await pairContract.getReserves(params.pair);

    const isAsset0First = new_asset0 === params.asset0.assetId;
    const newAmount0 = isAsset0First ? params.amount0 : params.amount1;
    const newAmount1 = isAsset0First ? params.amount1 : params.amount0;
    const swapRate = isAsset0First ? reserves.value[1] / reserves.value[0] : reserves.value[0] / reserves.value[1];

    const { priceImpact } = getPriceImpact(
      isAsset0First,
      params.amount0,
      reserves.value[0],
      reserves.value[1],
      params.asset0.decimals,
      params.asset1.decimals
    );

    const formattedPriceImpact = Number(priceImpact) > 0.01 ? Number(priceImpact).toFixed(2) : '<0.01';

    let price0: string, price1: string, price0Value: string, price1Value: string, rateValue: string;

    if (params.asset0.assetId === ETH_ASSET_ID || params.asset1.assetId === ETH_ASSET_ID) {
      if (params.asset0.assetId === ETH_ASSET_ID) {
        rateValue = params.ethPrice;
        price0 = calculateAssetPrice(params.amount0, params.ethPrice, params.asset0.decimals || 9);
        price1 = calculateAssetPrice(params.amount1, params.ethPrice, params.asset1.decimals || 9, swapRate);
        // price0Value = new BN(params.amount0).mul(new BN(params.ethPrice)).toFixed(4);
        // price1Value = new BN(params.amount1).mul(new BN(10).pow(params.asset1.decimals || 9)).div(new BN(swapRate).pow(params.asset0.decimals || 9)).mul(new BN(params.ethPrice)).toFixed(4);
      } else {
        price0 = calculateAssetPrice(newAmount0, params.ethPrice, params.asset0.decimals || 9, 1 / swapRate);
        price1 = calculateAssetPrice(newAmount1, params.ethPrice, params.asset1.decimals || 9);
        rateValue = new BN(swapRate).mul(new BN(params.ethPrice)).toFixed(9);
        // price0Value = new BN(params.amount0).mul(new BN(10).pow(params.asset0.decimals || 9)).div(new BN(rateValue).pow(params.asset1.decimals || 9)).toFixed(4);
        // price1Value = new BN(params.amount1).mul(new BN(params.ethPrice)).toFixed(4);
      }
    } else {
      price0 = '0';
      price1 = '0';
      price0Value = '0';
      price1Value = '0';
      rateValue = '0';
    }

    return {
      swapRate: swapRate.toFixed(swapRate > 1 ? 2 : 10),
      priceImpact: formattedPriceImpact,
      assetPrices: [price0, price1],
      rateValue: rateValue
    };
  }, [params]);

  return updateOracle;
};