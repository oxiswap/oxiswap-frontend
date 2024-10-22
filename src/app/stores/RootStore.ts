import { autorun, makeAutoObservable } from 'mobx';
import AccountStore, { IAccountStore } from '@stores/AccountStore';
import BalanceStore from '@stores/BalanceStore';
import SwapStore from '@stores/SwapStore';
import ButtonStore from '@stores/ButtonStore';
import NotificationStore from '@stores/NotificationStore';
import SettingStore from '@stores/SettingStore';
import PoolStore from '@stores/PoolStore';
import OracleStore from '@stores/OracleStore';
import PositionStore from '@stores/PositionStore';

export interface IRootStore {
  accountStore?: IAccountStore;
}

class RootStore {
  accountStore: AccountStore;
  balanceStore: BalanceStore;
  swapStore: SwapStore;
  buttonStore: ButtonStore;
  notificationStore: NotificationStore;
  settingStore: SettingStore;
  poolStore: PoolStore;
  oracleStore: OracleStore;
  positionStore: PositionStore;

  constructor(initState?: IRootStore) {
    makeAutoObservable(this);
    this.accountStore = new AccountStore(this, initState?.accountStore);
    this.balanceStore = new BalanceStore(this);
    this.swapStore = new SwapStore(this);
    this.buttonStore = new ButtonStore(this);
    this.notificationStore = new NotificationStore();
    this.settingStore = new SettingStore(this);
    this.poolStore = new PoolStore(this);
    this.oracleStore = new OracleStore();
    this.positionStore = new PositionStore(this);
    autorun(() => {
      this.saveState();
    }, { delay: 1000 });
  }


  saveState = () => {
    const state = this.serialize();
    // localStorage.setItem('rootStore', JSON.stringify(state));
  };

  serialize = (): IRootStore => ({
    accountStore: this.accountStore.serialize(),
  });

  static create(initState?: IRootStore): RootStore {
    return new RootStore(initState);
  }

  get initialized() {
    return this.accountStore.initialized;
  }

}


export default RootStore;