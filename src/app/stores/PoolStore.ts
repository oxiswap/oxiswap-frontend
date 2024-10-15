import { makeObservable, observable, action } from "mobx";
import RootStore from "./RootStore";
import { IPoolStatistics, PoolStatistics, Asset, PoolButtonProps } from "@utils/interface";


class PoolStore {
  @observable searchTerm: string = "";
  @observable statistics: IPoolStatistics = PoolStatistics.new("", "", "", "", "");
  @observable addLiquidityAmounts: string[] = [];
  @observable poolAssetId: string = "";
  @observable removeLiquidityAmounts: string = "0";
  @observable pool: PoolButtonProps = {
    assets: [],
    type: "",
    tvl: "",
    volume: "",
    apr: "",
    poolAssetId: "",
  };
  @observable poolButtonProps: PoolButtonProps[] = [];
  @observable removeAllLiquidity: boolean = false;
  @observable reserves: string[] = [];
  @observable removeReceives: string[] = [];

  constructor(rootStore: RootStore) {
    makeObservable(this);
  }

  @action
  setSearchTerm(term: string) {
    this.searchTerm = term;
  }

  @action
  setStatistics(tvl: string, apr: string, fees: string, volume: string, liquidity: string) {
    this.statistics = PoolStatistics.new(tvl, apr, fees, volume, liquidity);
  }

  @action
  setPool(pool: PoolButtonProps) {
    this.pool = pool;
  }

  @action
  setAddLiquidityAmounts(amounts: string[]) {
    this.addLiquidityAmounts = amounts;
  }

  @action
  setPoolAssetId(assetId: string) {
    this.poolAssetId = assetId;
  }

  @action
  setRemoveLiquidityAmounts(amounts: string) {
    this.removeLiquidityAmounts = amounts;
  }

  @action
  setRemoveAllLiquidity(value: boolean) {
    this.removeAllLiquidity = value;
  }

  @action
  setPoolButtonProps(props: PoolButtonProps[]) {
    this.poolButtonProps = props;
  }

  @action
  setReserves(reserves: string[]) {
    this.reserves = reserves;
  }

  @action
  setRemoveReceives(amounts: string[]) {
    this.removeReceives = amounts;
  }

  @action
  setRemoveInitialization() {
    this.removeLiquidityAmounts = "0";
    this.removeReceives = ['0', '0'];
  }
}


export default PoolStore;