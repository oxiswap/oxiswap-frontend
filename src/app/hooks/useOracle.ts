'use client';
import React, { useCallback } from 'react';
import { Account, Address, Provider, returnZeroScript } from 'fuels';
import { CryptoPair } from '@blockchain/CryptoPair';
import { useStores } from '@stores/useStores';
import { ETH_ASSET_ID } from '@utils/interface';
import BN from '@utils/BN';

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


export const useOracle = (account: Account | Provider, pair: string, asset1: string, asset2: string, fromDecimals: number | undefined, toDecimals: number | undefined) => {
  const { oracleStore, swapStore, settingStore, buttonStore, positionStore } = useStores();
  const pairContract = new CryptoPair(account);
  const [new_asset1, new_asset2] = sortAssets(asset1, asset2);
  
  const updateRate = useCallback(async () => {
    const reserves = await pairContract.getReserves(pair);

    const isFromAssetFirst = new_asset1 === swapStore.fromAsset.assetId;

    const swapRate = isFromAssetFirst ? reserves.value[1] / reserves.value[0] : reserves.value[0] / reserves.value[1];

    const { priceImpact } = getPriceImpact(isFromAssetFirst, swapStore.fromAmount, reserves.value[0], reserves.value[1], fromDecimals, toDecimals);

    const formattedPriceImpactPercentage = Number(priceImpact) > 0.01 ? Number(priceImpact).toFixed(2) : '<0.01';
    swapStore.setPriceImpact(`${formattedPriceImpactPercentage}`);

    const fixedIndex = swapRate > 1 ? 2 : 10;
    swapStore.setSwapRate(swapRate.toFixed(fixedIndex));

    const isETHInvolved = new_asset1 === ETH_ASSET_ID || new_asset2 === ETH_ASSET_ID;
    let swapRateValue = '0';

    if (isETHInvolved) {
      const isFromAssetETH = swapStore.fromAsset.assetId === ETH_ASSET_ID;
      const isToAssetETH = swapStore.toAsset.assetId === ETH_ASSET_ID;
      const isAddFromAssetETH = positionStore.addLiquidityAssets[0]?.assetId === ETH_ASSET_ID;
      const isAddToAssetETH = positionStore.addLiquidityAssets[1]?.assetId === ETH_ASSET_ID;
      if (isFromAssetETH || isToAssetETH || isAddFromAssetETH || isAddToAssetETH) {
        if (isFromAssetETH ) {
          swapRateValue = oracleStore.ethPrice;
          swapStore.setFromAssetPrice((Number(swapStore.fromAmount) * Number(swapRateValue)).toFixed(4));
          swapStore.setToAssetPrice((Number(swapStore.toAmount) * (10 ** (toDecimals || 9)) / (10 ** (fromDecimals || 9)) / Number(swapRate) * Number(swapRateValue)).toFixed(4));
        } else if (isToAssetETH) {
          swapRateValue = (Number(swapRate) * Number(oracleStore.ethPrice)).toFixed(9);
          swapStore.setFromAssetPrice((Number(swapStore.fromAmount) * (10 ** (fromDecimals || 9)) / (10 ** (toDecimals || 9)) * Number(swapRateValue)).toFixed(4));
          swapStore.setToAssetPrice((Number(swapStore.toAmount) * Number(oracleStore.ethPrice)).toFixed(4));
        } 
        if (isAddFromAssetETH) {
          swapRateValue = oracleStore.ethPrice;
          oracleStore.setAssetPrices((Number(positionStore.getAmount(0)) * Number(swapRateValue)).toFixed(4), 0);
          oracleStore.setAssetPrices((Number(positionStore.getAmount(1)) * (10 ** (toDecimals || 9)) / (10 ** (fromDecimals || 9)) / Number(swapRate) * Number(swapRateValue)).toFixed(4), 1)
        } else if (isAddToAssetETH) {
          console.log('isAddToAssetETH');
          swapRateValue = (Number(swapRate) * Number(oracleStore.ethPrice)).toFixed(9);
          oracleStore.setAssetPrices((Number(positionStore.getAmount(1)) * Number(swapRateValue)).toFixed(4), 1);
          oracleStore.setAssetPrices((Number(positionStore.getAmount(0)) * (10 ** (fromDecimals || 9)) / (10 ** (toDecimals || 9)) / Number(swapRate) * Number(swapRateValue)).toFixed(4), 0);
        }
      }
    }

    swapStore.setSwapRateValue(swapRateValue);

    const slippage = Number(settingStore.slippage) / 100;
    const toAmount = Number(swapStore.toAmount);
    swapStore.setMinReceived((toAmount * (1 - slippage)).toFixed(6));
    swapStore.setMaxSlippage((toAmount * slippage).toFixed(6));
    swapStore.setRoutePath(`${swapStore.fromAsset.symbol} - ${swapStore.toAsset.symbol}`);
    
    if (new BN(formattedPriceImpactPercentage).div(1000).gt(new BN(slippage).div(100))) {
      buttonStore.setSwapButtonPlay('Slippage is too high');
      buttonStore.setSwapButtonDisabled(true);
      buttonStore.setButtonClassName('bg-oxi-bg-03 text-oxi-text-01');
    }
  }, [pairContract, pair, swapStore, settingStore, oracleStore]);


  return updateRate;

};