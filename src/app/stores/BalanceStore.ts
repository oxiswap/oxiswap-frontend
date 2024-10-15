import { makeAutoObservable, reaction, runInAction } from 'mobx';
import RootStore from '@stores/RootStore';
import { IntervalUpdater } from '@utils/IntervalUpdater';
import { CoinQuantity } from 'fuels';
import { BN } from '@fuel-ts/math';

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
      return this.formatBalance(Number(b));
    }
    return '0';
  };

  getBalance = (assetId: string) => {
    const b = this.balances.get(assetId);
    if (b) {
      return this.formatBalance(Number(b));
    }
    return '0';
  };

  getExactBalance = (assetId: string) => {
    const amount = this.balances.get(assetId);
    if (amount) {
      return (Number(amount) / 10 ** 9).toString();
    }
    return '0';
  };

  private formatBalance = (amount: number | string): string => {
    return (Number(amount) / 10 ** 9).toFixed(4);
  };
}

export default BalanceStore;
