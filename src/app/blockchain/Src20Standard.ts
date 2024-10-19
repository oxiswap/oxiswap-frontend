import { Contract, Account, Provider, FunctionInvocationScope } from 'fuels';
import { SRC20_ADDRESS } from '@constants';
import Src20Abi from '@constants/abi/check-src20-abi.json';

export class Src20Standard {
  private contract: Contract;
  
  constructor(walletOrProvider: Account | Provider) {
    this.contract = new Contract(SRC20_ADDRESS, Src20Abi, walletOrProvider);
  }

  async getName(contractId: string, assetId: string) {
    const contractId_bits = {bits: contractId};
    const assetId_bits = { bits: assetId };
    const name = await this.contract.functions.get_name(contractId_bits, assetId_bits).get();
    return name;
  }

  async getSymbol(contractId: string, assetId: string) {
    const contractId_bits = {bits: contractId};
    const assetId_bits = { bits: assetId };

    const symbol = await this.contract.functions.get_symbol(contractId_bits, assetId_bits).get();
    return symbol;
  }

  async getDecimals(contractId: string, assetId: string) {
    const contractId_bits = {bits: contractId};
    const assetId_bits = { bits: assetId };

    const decimals = await this.contract.functions.get_decimals(contractId_bits, assetId_bits).get();
    return decimals;
  }

  async getTotalSupply(contractId: string, assetId: string) {
    const contractId_bits = {bits: contractId};
    const assetId_bits = { bits: assetId };

    const totalSupply = await this.contract.functions.get_total_supply(contractId_bits, assetId_bits).get();
    return totalSupply;
  }

  // async multiCall(calls: Array<FunctionInvocationScope>) {
  //   return this.contract.functions.multi_call(calls).get();
  // }

  get instance() {
    return this.contract;
  }
}