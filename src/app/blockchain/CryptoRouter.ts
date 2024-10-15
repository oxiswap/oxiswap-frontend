import { Contract, Account, bn, BN, Provider } from 'fuels';
import { ROUTER_ADDRESS } from '@constants/index';
import ROUTER_ABI from '@constants/abi/crypto-router-abi.json';
import { CryptoPair } from './CryptoPair';
import { CryptoFactory } from './CryptoFactory';
import { Asset } from '@utils/interface';

export class CryptoRouter {
  private contract: Contract;
  wallet: Account;

  constructor(walletOrProvider: Account | Provider) {
    this.contract = new Contract(ROUTER_ADDRESS, ROUTER_ABI, walletOrProvider);
    this.wallet = walletOrProvider as Account;
  }

  async getAmountsOut(amountIn: string, fromAsset: string, toAsset: string) {
    const asset0 = { bits: fromAsset };
    const asset1 = { bits: toAsset };
    const formatedAmountIn = bn.parseUnits(amountIn);
    const { value } = await this.contract.functions
      .get_amounts_out(formatedAmountIn, [asset0, asset1])
      .get();
    const amountOut = new BN(value[1].toString()).format();
    return amountOut;
  }

  async getAmountsIn(amountOut: string, fromAsset: string, toAsset: string) {
    const asset0 = { bits: fromAsset };
    const asset1 = { bits: toAsset };
    const formatedAmountOut = bn.parseUnits(amountOut);
    const { value } = await this.contract.functions
      .get_amounts_in(formatedAmountOut, [asset0, asset1])
      .get();
    const amountIn = new BN(value[0].toString()).format();
    return amountIn;
  }

  async swapExactInput(
    fromAsset: string,
    toAsset: string,
    slippage: number,
    fromAmount: string,
    toAmount: string,
    onSubmitted?: () => void
  ) {
    if (!fromAsset || !toAsset || fromAmount === '0' || fromAmount === '0.00') {
      throw new Error('invalid input');
    }

    const asset0 = { bits: fromAsset };
    const asset1 = { bits: toAsset };
    const path = [asset0, asset1];

    const formatedAmountIn = bn.parseUnits(fromAmount);
    const amountOutMin = bn.parseUnits(toAmount).toNumber() * (1 - slippage);
    const formatedAmountOutMin = bn(amountOutMin);
    
    const now = new BN(Math.round(new Date().getTime() / 1000));
    const time = now.add(new BN(2).pow(new BN(62))).add(new BN(15 * 60));

    const account = { bits: this.wallet.address.toB256() };
    const to = { Address: account };
    const pair = new CryptoPair(this.wallet);

    try {
      const { transactionId, waitForResult } = await this.contract.functions
        .swap_exact_input(formatedAmountIn, formatedAmountOutMin, path, to, time)
        .addContracts([pair.instance])
        .callParams({
          forward: [formatedAmountIn, fromAsset],
        })
        .call();

      if (onSubmitted) {
        onSubmitted();
      }

      const { transactionResult } = await waitForResult();

      return {
        success: transactionResult.status === 'success',
        transactionId, 
        transactionResult, 
      };
    } catch (err: any) {
      const message = err.message.toLowerCase();
      if (message.includes('user rejected action') || message.includes('user rejected the transaction')) {
        console.log('User rejected the transaction');
        return {
          success: false,
          userCancelled: true
        };
      }
      throw err;
    }
  }

  async swapExactOutput(
    fromAsset: string,
    toAsset: string,
    slippage: number,
    fromAmount: string,
    toAmount: string,
    onSubmitted?: () => void
  ) {
    if (!fromAsset || !toAsset || fromAmount === '0' || fromAmount === '0.00') {
      throw new Error('invalid input');
    }

    const asset0 = { bits: fromAsset };
    const asset1 = { bits: toAsset };
    const path = [asset0, asset1];

    const amountOut = bn.parseUnits(toAmount);
    const amountInMax = bn.parseUnits(fromAmount).toNumber() * (1 + slippage);
    const formatedAmountInMax = bn(amountInMax);
    const formatedAmountOut = bn(amountOut);

    const now = new BN(Math.round(new Date().getTime() / 1000));
    const time = now.add(new BN(2).pow(new BN(62))).add(new BN(15 * 60));

    const account = { bits: this.wallet.address.toB256() };
    const to = { Address: account };
    const pair = new CryptoPair(this.wallet);

    try {
      const { transactionId, waitForResult } = await this.contract.functions
        .swap_exact_output(formatedAmountOut, formatedAmountInMax, path, to, time)
        .addContracts([pair.instance])
        .callParams({
          forward: [formatedAmountInMax, fromAsset],
        })
        .call();

      if (onSubmitted) {
        onSubmitted();
      }

      const { transactionResult } = await waitForResult();

      return {
        success: transactionResult.status === 'success',
        transactionId, 
        transactionResult
      };
    } catch (err: any) {
      const message = err.message.toLowerCase();
      if (message.includes('user rejected action') || message.includes('user rejected the transaction')) {
        console.log('User rejected the transaction');
        return {
          success: false,
          userCancelled: true
        };
      }
      throw err;
    }
  }

  async deposit(asset: string, depositAmount: string, onSubmitted?: () => void) {
    const pair = new CryptoPair(this.wallet);

    const formatedDepositAmount = bn.parseUnits(depositAmount);
    try {
      const { transactionId, waitForResult } = await this.contract.functions
        .deposit()
        .addContracts([pair.instance])
        .callParams({
          forward: [formatedDepositAmount, asset],
        })
        // .txParams({ gasLimit: 20_00_000, })
        .call();
      
      if (onSubmitted) {
        onSubmitted();
      } 

      const { transactionResult } = await waitForResult();

      return {
        success: transactionResult.status === 'success',
        transactionId, 
        transactionResult, 
      };
    } catch (err: any) {
    const message = err.message.toLowerCase();
      if (message.includes('user rejected action') || message.includes('user rejected the transaction')) {
        console.log('User rejected the transaction');
        return {
          success: false,
          userCancelled: true
        };
      }
      throw err;
    }
  }

  async addLiquidity(assets: Asset[], amounts: string[], onSubmitted?: () => void) {
    const account = { bits: this.wallet.address.toB256() };
    const to = { Address: account };    
    const pair = new CryptoPair(this.wallet);
    const factory = new CryptoFactory(this.wallet);

    const asset0 = { bits: assets[0].assetId };
    const asset1 = { bits: assets[1].assetId };
    const amount0Desired = amounts[0];
    const amount1Desired = amounts[1];
    const formatedAmount0Desired = bn.parseUnits(amount0Desired);
    const formattedAmount1Desired = bn.parseUnits(amount1Desired);
    const amount0Min = bn.parseUnits(amount0Desired).toNumber() * 0.992;
    const amount1Min = bn.parseUnits(amount1Desired).toNumber() * 0.992;

    const formattedAmount0Min = bn(amount0Min);
    const formattedAmount1Min = bn(amount1Min);

    const now = new BN(Math.round(new Date().getTime() / 1000));
    const deadline = now.add(new BN(2).pow(new BN(62))).add(new BN(15 * 60));
    
    try{
      const { transactionId, waitForResult } = await this.contract.functions
        .add_liquidity(
          asset0,
          asset1,
          formatedAmount0Desired,
          formattedAmount1Desired,
          formattedAmount0Min,
          formattedAmount1Min,
          to,
          deadline
        )
        .addContracts([pair.instance, factory.instance])
        .call();

      if (onSubmitted) {
        onSubmitted();
      }

      const { transactionResult } = await waitForResult();

      return {
        success: transactionResult.status === 'success',
        transactionId, 
        transactionResult, 
      };
    } catch (err: any) {
      const message = err.message.toLowerCase();
      if (message.includes('user rejected action') || message.includes('user rejected the transaction')) {
        console.log('User rejected the transaction');
        return {
          success: false,
          userCancelled: true
        };
      }
      throw err;
    }
  }

  async addLiquidityMultiCall(assets: Asset[], amounts: string[], onSubmitted?: () => void) {
    const pair = new CryptoPair(this.wallet);
    const factory = new CryptoFactory(this.wallet);
    const account = { bits: this.wallet.address.toB256() };
    const to = { Address: account }; 
    const formatedDepositAmount0 = bn.parseUnits(amounts[0]);
    const formatedDepositAmount1 = bn.parseUnits(amounts[1]);
    console.log(formatedDepositAmount0.toString(), formatedDepositAmount1.toString());
    const asset0 = { bits: assets[0].assetId };
    const asset1 = { bits: assets[1].assetId };
    // const amount0Min = formatedDepositAmount0.toNumber() * 0.5;
    // const amount1Min = formatedDepositAmount1.toNumber() * 0.5;

    // const formattedAmount0Min = bn(amount0Min);
    // const formattedAmount1Min = bn(amount1Min);
    const formattedAmount0Min = formatedDepositAmount0.mul(5).div(10);
    const formattedAmount1Min = formatedDepositAmount1.mul(5).div(10);
    console.log(new BN(formattedAmount0Min).toString(), new BN(formattedAmount1Min).toString());
    const now = new BN(Math.round(new Date().getTime() / 1000));
    const deadline = now.add(new BN(2).pow(new BN(62))).add(new BN(15 * 60));
    
    try {
      const { waitForResult } = await this.contract
        .multiCall([
          this.contract.functions.deposit().addContracts([pair.instance]).callParams({
            forward: [formatedDepositAmount0, asset0.bits],
          }),
          this.contract.functions.deposit().addContracts([pair.instance]).callParams({
            forward: [formatedDepositAmount1, asset1.bits],
          }),
          this.contract.functions.add_liquidity(
            asset0,
            asset1,
            formatedDepositAmount0,
            formatedDepositAmount1,
            formattedAmount0Min,
            formattedAmount1Min,
            to,
            deadline
          )
          .addContracts([pair.instance, factory.instance]),
        ])
        .call();

      if (onSubmitted) {
        onSubmitted();
      }

      const { value: results } = await waitForResult();

      if (results[2] && results[2].length === 3) {
        return {
          success: true,
        }
      }
      return {
        success: false,
        userCancelled: false
      };
    } catch (err: any) {
      const message = err.message.toLowerCase();
      if (message.includes('user rejected action') || message.includes('user rejected the transaction')) {
        console.log('User rejected the transaction');
        return {
          success: false,
          userCancelled: true
        };
      }
      throw err;
    }
  }

  async simulateAddLiquidity(assets: Asset[], amounts: string[]) {
    const pair = new CryptoPair(this.wallet);
    const factory = new CryptoFactory(this.wallet);
    const account = { bits: this.wallet.address.toB256() };
    const to = { Address: account };  

    const formatedDepositAmount0 = bn.parseUnits(amounts[0]);
    const formatedDepositAmount1 = bn.parseUnits(amounts[1]);
    const asset0 = { bits: assets[0].assetId };
    const asset1 = { bits: assets[1].assetId };
    const amount0Min = formatedDepositAmount0.toNumber() * 0.5;
    const amount1Min = formatedDepositAmount1.toNumber() * 0.5;

    const formattedAmount0Min = bn(amount0Min);
    const formattedAmount1Min = bn(amount1Min);

    const now = new BN(Math.round(new Date().getTime() / 1000));
    const deadline = now.add(new BN(2).pow(new BN(62))).add(new BN(15 * 60));
    
    const { value } = await this.contract
      .multiCall([
        this.contract.functions.deposit().addContracts([pair.instance]).callParams({
          forward: [formatedDepositAmount0, asset0.bits],
        }),
        this.contract.functions.deposit().addContracts([pair.instance]).callParams({
          forward: [formatedDepositAmount1, asset1.bits],
        }),
        this.contract.functions.add_liquidity(
          asset0,
          asset1,
          formatedDepositAmount0,
          formatedDepositAmount1,
          formattedAmount0Min,
          formattedAmount1Min,
          to,
          deadline
        )
        .addContracts([pair.instance, factory.instance]),
      ])
      .dryRun();
    
    return value;
  }

  async removeLiquidity(poolAssetId: string, assets: Asset[], amounts: string[], onSubmitted?: () => void ) {
    const account = { bits: this.wallet.address.toB256() };
    const to = { Address: account };  

    const pair = new CryptoPair(this.wallet);
    const factory = new CryptoFactory(this.wallet);

    const asset0 = { bits: assets[0].assetId };
    const asset1 = { bits: assets[1].assetId };
    const liquidity = amounts[0];
    const formatedLiquidity = bn.parseUnits(liquidity);
    const amount0Min = bn.parseUnits("0").toNumber() * 0.992;
    const amount1Min = bn.parseUnits("0").toNumber() * 0.992;

    const formattedAmount0Min = bn(amount0Min);
    const formattedAmount1Min = bn(amount1Min);

    const now = new BN(Math.round(new Date().getTime() / 1000));
    const deadline = now.add(new BN(2).pow(new BN(62))).add(new BN(15 * 60));
    
    try{
      const { transactionId, waitForResult } = await this.contract.functions
        .remove_liquidity(
          asset0,
          asset1,
          formatedLiquidity,
          formattedAmount0Min,
          formattedAmount1Min,
          to,
          deadline
        )
        .addContracts([pair.instance, factory.instance])
        .callParams({
          forward: [formatedLiquidity, poolAssetId],
        })
        .call();

      if (onSubmitted) {
        onSubmitted();
      }

      const { transactionResult } = await waitForResult();

      console.log(transactionResult.status);
      return {
        success: transactionResult.status === 'success',
        transactionId, 
        transactionResult, 
      };
    } catch (err: any) {
      const message = err.message.toLowerCase();
      if (message.includes('user rejected action') || message.includes('user rejected the transaction')) {
        console.log('User rejected the transaction');
        return {
          success: false,
          userCancelled: true
        };
      }
      throw err;
    }
  }

  get instance() {
    return this.contract;
  }
}