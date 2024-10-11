import { makeObservable, observable, action } from "mobx";

class OracleStore {
  @observable ethOraclePrice: string = "2400";

  constructor() {
    makeObservable(this);
  }

  @action 
  setEthOraclePrice(price: string) {
    this.ethOraclePrice = price;
  }


  getAssetPrice(assetId: string) {
    return "0";
  }

  get ethPrice() {
    return this.ethOraclePrice;
  }

}


export default OracleStore;