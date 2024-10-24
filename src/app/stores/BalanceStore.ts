import { makeAutoObservable, reaction, runInAction } from 'mobx';
import RootStore from '@stores/RootStore';
import { IntervalUpdater } from '@utils/IntervalUpdater';
import { CoinQuantity } from 'fuels';
import { BN } from '@fuel-ts/math';
import OxiBN from '@utils/BN';

const UPDATE_INTERVAL = 5 * 1000;
const ETH_ASSET_ID = '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07';

class BalanceStore {
  balances: Map<string, BN> = new Map();
  initialized = false;

  private balancesUpdater: IntervalUpdater;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    this.balancesUpdater = new IntervalUpdater(this.update, UPDATE_INTERVAL);
    this.balancesUpdater.run();

    const { accountStore } = rootStore;
    reaction(
      () => [accountStore.isConnected, accountStore.address],
      ([isConnected]) => {
        if (!isConnected) {
          this.balances = new Map();
          this.initialized = false;
          return;
        }
        this.initialize();
        this.balancesUpdater.update();
      },
      { fireImmediately: true }
    );
  }

  initialize = async () => {
    await this.update();
    runInAction(() => {
      this.initialized = true;
    });
  };

  update = async () => {
    const { accountStore } = this.rootStore;
    if (!accountStore.isConnected) return;

    try {
      if (accountStore.getWallet) {
        const { balances } = await accountStore.getWallet.getBalances();
        balances.forEach((balance: CoinQuantity) => {
          runInAction(() => {
            this.balances.set(balance.assetId, balance.amount);
          });
        });
      }
    } catch (error) {
      console.error('Error updating balances: ', error);
    }
  };

  getAllBalances = () => {
    return this.balances;
  };

  getNativeBalance = () => {
    const b = this.balances.get(ETH_ASSET_ID);
    if (b) {
      return OxiBN.formatUnits(b.toString(), 9).toFixed(6).toString();
    }
    return '0';
  };

  getBalance = (assetId: string, decimals: number = 9) => {
    const b = this.balances.get(assetId);
    if (b) {
      return OxiBN.formatUnits(b.toString(), decimals).toFixed(6).toString();
    }
    return '0';
  };

  getExactBalance = (assetId: string, decimals: number | undefined) => {
    const b = this.balances.get(assetId);
    if (b) {
      return new OxiBN(b.toString()).div(new OxiBN(10).pow(decimals || 9)).toString();
    }
    return '0';
  };

}

export default BalanceStore;
