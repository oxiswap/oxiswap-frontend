import {autorun, makeObservable, observable, action } from 'mobx';
import RootStore from '@stores/RootStore';
import { Position, Asset, defaultETH } from '@utils/interface';

class PositionStore {
  @observable assets: Position[] = [];
  @observable poolType: string = 'VolatilePool';
  @observable isPreview: boolean = false;
  @observable addLiquidityAssets: Asset[] = [defaultETH];
  @observable addLiquidityAmounts: string[] = [];
  @observable liquidityReceiceAmount: string = '0';
  @observable depositAssets: boolean[] = [];
  @observable fromInput: boolean = true;
  @observable manageName: string = '';
  @observable loadingStates: boolean[] = [];
  @observable private userInputs: string[] = [];
  @observable isPosition: boolean = true;

  constructor(private rootStore: RootStore) {
    makeObservable(this);

    autorun(async () => {
      await this.initialize();
    });
  }

  initialize = async () => {
    await this.rootStore.balanceStore.initialize();
  };


  @action
  setAssets(assets: Position[]) {
    this.assets = assets;
  }

  @action
  setPoolType(poolType: string) {
    this.poolType = poolType;
  }

  @action
  setIsPreview(isPreview: boolean) {
    this.isPreview = isPreview;
  }

  @action
  setAddLiquidityAssets(assets: Asset[]) {
    this.addLiquidityAssets = assets;
  }

  @action
  setAddLiquidityAmounts(amounts: string[]) {
    this.addLiquidityAmounts = amounts;
  }

  @action
  setLiquidityReceiceAmount(amount: string) {
    this.liquidityReceiceAmount = amount;
  }

  @action
  setDepositAssets(resluts: boolean[]) {
    this.depositAssets = resluts;
  }

  @action
  setFromInput(input: boolean) {
    this.fromInput = input;
  }

  @action
  setManageName(name: string) {
    this.manageName = name;
  }

  @action
  setAmount(amount: string, index: number) {
    this.addLiquidityAmounts[index] = amount;
  }

  @action
  setLoading(loading: boolean, index: number) {
    this.loadingStates[index] = loading;
  }

  @action
  setInitialize(index: number) {
    this.loadingStates[index] = false;
    this.addLiquidityAmounts[index] = '';
  }

  getAmount(index: number) {
    return this.addLiquidityAmounts[index] || '';
  }

  isLoading(index: number) {
    return this.loadingStates[index] || false;
  }

  @action
  setUserInput(value: string, index: number) {
    this.userInputs[index] = value;
  }

  getUserInput(index: number) {
    return this.userInputs[index] || '';
  }

  @action
  setIsPosition(isPosition: boolean) {
    this.isPosition = isPosition;
  }

  @action
  setAllInitialize() {
    this.poolType = 'VolatilePool';
    this.isPreview = false;
    this.addLiquidityAssets = [defaultETH];
    this.addLiquidityAmounts = [];
    this.liquidityReceiceAmount = '0';
    this.depositAssets = [];
    this.fromInput = true;
    this.manageName = '';
    this.loadingStates = [];
    this.userInputs = [];
    this.isPosition = true;
  }


}

export default PositionStore;
