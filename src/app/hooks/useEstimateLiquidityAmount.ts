import BN from '@utils/BN';


function sqrt(value: BN): BN {
  let z = value.add(1).div(2);
  let y = value;
  while (z.lt(y)) {
    y = z;
    z = value.div(z).add(z).div(2);
  }
  return y;
}

export default function estimateLiquidityAmount(
  amount0: BN,
  amount1: BN,
  reserve0: BN,
  reserve1: BN,
  totalSupply: BN
): BN {
  if (totalSupply.isZero() && reserve0.isZero() && reserve1.isZero()) {
    return sqrt(new BN(amount0).mul(amount1)).sub(new BN(1000)); 
  }

  const amount0WithFee = new BN(amount0).mul(new BN(997));
  const amount1WithFee = new BN(amount1).mul(new BN(997));

  const liquidity0 = amount0WithFee.mul(totalSupply).div(reserve0.mul(new BN(1000)));
  const liquidity1 = amount1WithFee.mul(totalSupply).div(reserve1.mul(new BN(1000)));

  return liquidity0.lt(liquidity1) ? liquidity0 : liquidity1;
}


export function estimateAmount(
  amount: BN,
  reserveIn: BN,
  reserveOut: BN,
): BN {
  if (reserveIn.isZero() || reserveOut.isZero()) {
    return new BN(0);
  }
  return new BN(amount).mul(reserveIn).div(reserveOut);
}


export function removeAssetAmounts(
  reserve0: BN,
  reserve1: BN,
  liquidity: BN,
  totalLiquidity: BN
): { amount0: BN, amount1: BN } {
  if (reserve0.isZero() || reserve1.isZero() || totalLiquidity.isZero()) {
    return { amount0: new BN(0), amount1: new BN(1)};
  }

  const rate = liquidity.mul(new BN(10000)).div(totalLiquidity);
  const amount0 = reserve0.mul(rate).div(new BN(10000));
  const amount1 = reserve1.mul(rate).div(new BN(10000));

  return {amount0: amount0, amount1: amount1 };
}