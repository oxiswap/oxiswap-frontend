import { makeObservable, observable, action } from "mobx";
import RootStore from "@stores/RootStore";

class SettingStore {
  @observable slippage: string = "0.5";

  constructor(private rootStore: RootStore) {
    makeObservable(this);
  }

  @action
  setSlippage(slippage: string) {
    this.slippage = slippage;
  }

}

export default SettingStore;