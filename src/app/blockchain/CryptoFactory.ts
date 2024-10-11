import { Contract, Account, Provider } from 'fuels';
import { FACTORY_ADDRESS } from '@constants/index';
import FAC_ABI from '@constants/abi/fuelswap-factory-abi.json';


export class CryptoFactory {
  private contract: Contract;

  constructor(walletOrProvider: Account | Provider) {
    this.contract = new Contract(FACTORY_ADDRESS, FAC_ABI, walletOrProvider);
  }

  async getPair(fromAsset: string, toAsset: string): Promise<{ isPair: boolean; pair: string }> {
    if (!fromAsset || !toAsset) {
      throw new Error("AssetId must be provided");
    }

    const asset0 = { bits: fromAsset };
    const asset1 = { bits: toAsset };

    try {
      const pairResult = await this.contract.functions.get_pair(asset0, asset1).get();
      const pairAddress = pairResult.value.bits;

      if (pairAddress === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        return { isPair: false, pair: '0x0000000000000000000000000000000000000000000000000000000000000000' };
      }

      return { isPair: true, pair: pairAddress };
    } catch (error) {
      console.error('Error fetching pair:', error);
      return { isPair: false, pair: '0x0000000000000000000000000000000000000000000000000000000000000000' };
    }

  }


  get instance() {
    return this.contract;
  }


  async allPairs() {
    return await this.contract.functions.all_pairs_length().get();
  }

}