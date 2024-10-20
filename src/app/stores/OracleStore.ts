import { makeObservable, observable, action } from "mobx";

class OracleStore {
  @observable ethOraclePrice: string = "0";
  @observable assetPrices: string[] = [];

  constructor() {
    makeObservable(this);
  }

  @action 
  setEthOraclePrice(price: string) {
    this.ethOraclePrice = price;
  }

  @action
  setAssetPrices(price: string, index: number) {
    this.assetPrices[index] = price;
  }

  getAssetPrices(index: number) {
    if (this.assetPrices[index] !== undefined) {
      return this.assetPrices[index];
    }
    return "0.00";
  }

  get ethPrice() {
    return this.ethOraclePrice;
  }

}


export default OracleStore;