import { Contract, Account, Provider, createAssetId } from 'fuels';
import Src20Abi from '@constants/abi/src20_abi.json';
import { SRC20_ADDRESS } from '@constants';


export class Src20Standard {
  private contract: Contract;
  
  constructor(walletOrProvider: Account | Provider) {
    this.contract = new Contract(SRC20_ADDRESS, Src20Abi, walletOrProvider);
  }

  async getName(contractId: string) {
    const contractId_bits = {bits: contractId};
    // const zeroId = "0x0000000000000000000000000000000000000000000000000000000000000000";
    // const assetId = createAssetId(contractId, zeroId);
    const name = await this.contract.functions.get_name(contractId_bits).get();
    return name;
  }

  async getSymbol(contractId: string) {
    const contractId_bits = {bits: contractId};
    const symbol = await this.contract.functions.get_symbol(contractId_bits).get();
    return symbol;
  }

  async getDecimals(contractId: string) {
    const contractId_bits = {bits: contractId};
    const decimals = await this.contract.functions.get_decimals(contractId_bits).get();
    return decimals;
  }

  async getTotalSupply(contractId: string) {
    const contractId_bits = {bits: contractId};
    const totalSupply = await this.contract.functions.get_total_supply(contractId_bits).get();
    return totalSupply;
  }
}
