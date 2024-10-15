import { Contract, Account, Provider } from 'fuels';
import PAIR_ABI from '@constants/abi/crypto-pairs-abi.json';
import { PAIR_ADDRESS } from '@constants/index';


export class CryptoPair {
  private contract: Contract;

  constructor(walletOrProvider: Account | Provider) {
    this.contract = new Contract(PAIR_ADDRESS, PAIR_ABI, walletOrProvider);
  }

  async getReserves(pool: string) {
    const poolId = { bits: pool };
    return await this.contract.functions.get_reserves(poolId).get();
  }

  async getTotalSupply(pool: string) {
    const poolId = { bits: pool };
    return await this.contract.functions.total_supply(poolId).get();
  }

  get instance() {
    return this.contract;
  }

}