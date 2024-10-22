import { makeObservable, observable, action } from "mobx";
import RootStore from "./RootStore";
import { IPoolStatistics, PoolStatistics, Asset, PoolButtonProps } from "@utils/interface";


class PoolStore {
  @observable searchTerm: string = "";
  @observable statistics: IPoolStatistics = PoolStatistics.new("", "", "", "", "");
  @observable addLiquidityAmounts: string[] = [];
  @observable addLiquidityAssets: Asset[] = [];
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

  @observable manageName: string = "Add";
  @observable isPreview: boolean = false;
  @observable poolType: string = "VolatilePool";
  @observable loadingStates: boolean[] = [];
  @observable private userInputs: string[] = [];
  @observable liquidityReceiceAmount: string = '0';
  @observable private rootStore: RootStore;

  constructor(rootStore: RootStore) {
    makeObservable(this);
    this.rootStore = rootStore;
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

  @action
  setManageName(name: string) {
    this.manageName = name;
  }

  @action
  setIsPreview(value: boolean) {
    this.isPreview = value;
  }

  @action
  setAddLiquidityAssets(assets: Asset[]) {
    this.addLiquidityAssets = assets;
  }

  @action
  setPoolType(type: string) {
    this.poolType = type;
  }

  @action
  setLoading(loading: boolean, index: number) {
    this.loadingStates[index] = loading;
  }

  @action
  setUserInput(value: string, index: number) {
    this.userInputs[index] = value;
  }

  @action
  setLiquidityReceiceAmount(amount: string) {
    this.liquidityReceiceAmount = amount;
  }

  @action
  setAmount(amount: string, index: number) {
    this.addLiquidityAmounts[index] = amount;
  }

  @action
  setInitialize() {
    this.loadingStates = [];
    this.addLiquidityAmounts = [];
  }

  @action
  setAddLiquidityInitialization() {
    this.addLiquidityAmounts = [];
    this.rootStore.oracleStore.setAssetPrices("", 0);
    this.rootStore.oracleStore.setAssetPrices("", 1);
    this.rootStore.buttonStore.setPositionButton("Add Liquidity", true, "bg-oxi-bg-03 text-oxi-text-01");
  }


  getUserInput(index: number) {
    return this.userInputs[index] || '';
  }

  getAmount(index: number) {
    return this.addLiquidityAmounts[index] || '';
  }
}


export default PoolStore;