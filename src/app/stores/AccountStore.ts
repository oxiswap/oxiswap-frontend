import { Nullable } from '@utils/types';
import { makeAutoObservable, runInAction } from 'mobx';
import { Account, B256Address, WalletLocked, WalletUnlocked } from 'fuels';
import RootStore from '@stores/RootStore';

export interface IAccountStore {
  account: Nullable<Account>;
}

class AccountStore {
  initialized = false;
  address: Nullable<B256Address> = null;
  wallet: Nullable<Account | WalletLocked | WalletUnlocked> = null;
  private rootStore: RootStore;

  constructor(rootStore: RootStore, initState?: IAccountStore) {
    makeAutoObservable(this);
    if (initState?.account) {
      this.address = initState.account.address.toB256() as B256Address;
    }
    this.rootStore = rootStore;
    this.init();
  }

  init = async () => {
    this.initialized = true;
  };

  connect = async (wallet: Account) => {
    runInAction(() => {
      this.wallet = wallet;
      this.address = wallet.address.toB256();
      this.rootStore.buttonStore.setSwapButton(
        'Swap', 
        false, 
        'bg-oxi-bg-03 text-oxi-text-01'
      );
    });
  };

  disconnect = async () => {
    runInAction(() => {
      this.wallet = null;
      this.address = null;
      this.rootStore.buttonStore.setSwapButton(
        'Connect Wallet', 
        true, 
        'bg-button-100/30 text-text-200 hover:border-white hover:bg-button-100/70'
      );
    });
  };

  get getAddress(): Nullable<B256Address> {
    return this.wallet?.address.toB256() || null;
  }

  get getWallet() {
    return this.wallet;
  }

  get isConnected() {
    return !!this.wallet;
  }

  serialize = (): IAccountStore => ({
    account: this.wallet,
  });
}

export default AccountStore;
