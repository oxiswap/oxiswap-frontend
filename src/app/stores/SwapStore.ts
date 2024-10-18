import { autorun, makeObservable, observable, action } from 'mobx';
import RootStore from '@stores/RootStore';
import { Asset, defaultETH, nullAsset, AssetConfig } from '@utils/interface';

class SwapStore {
  @observable assets: Asset[] = [];
  @observable fromAsset: Asset = defaultETH;
  @observable toAsset: Asset = nullAsset;
  @observable fromAmount: string = '';
  @observable toAmount: string = '';
  @observable fromAssetPrice: string = '0';
  @observable toAssetPrice: string = '0';
  @observable swapRate: string = '0';
  @observable swapRateValue: string = '0';
  @observable priceImpact: string = '0';
  @observable maxSlippage: string = '0';
  @observable minReceived: string = '0';
  @observable routePath: string = '';
  @observable swapType: number = 0;
  @observable fromLoading: boolean = true;
  @observable toLoading: boolean = true;
  @observable isPendingOpen: boolean = false;
  @observable popularAssets: string[] = [];

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
  setInitalize() {
    this.fromAmount = '';
    this.toAmount = '';
    this.fromAssetPrice = '0';
    this.toAssetPrice = '0';
    this.priceImpact = '0';
    this.maxSlippage = '0';
    this.minReceived = '0';
    this.routePath = '';
    this.swapType = 0;
    this.fromLoading = false;
    this.toLoading = false;
  }

  @action
  setFromAsset(Asset: Asset) {
    this.fromAsset = Asset;
    this.fromAssetPrice = Asset.value as string;
  }

  @action
  setToAsset(Asset: Asset) {
    this.toAsset = Asset;
    this.toAssetPrice = Asset.value as string;
  }

  @action
  setFromAmount(amount: string) {
    this.fromAmount = amount;
  }

  @action
  setToAmount(amount: string) {
    this.toAmount = amount;
  }

  @action
  setFromAssetPrice(amount: string) {
    this.fromAssetPrice = amount;
  }

  @action
  setToAssetPrice(amount: string) {
    this.toAssetPrice = amount;
  }

  @action
  setSwapRate(amount: string) {
    this.swapRate = amount;
  }

  @action
  setPriceImpact(amount: string) {
    this.priceImpact = amount;
  }

  @action
  setMaxSlippage(amount: string) {
    this.maxSlippage = amount;
  }

  @action
  setMinReceived(amount: string) {
    this.minReceived = amount;
  }

  @action
  setRoutePath(route: string) {
    this.routePath = route;
  }

  @action
  setSwapRateValue(amount: string) {
    this.swapRateValue = amount;
  }

  @action
  setSwapType(type: number) {
    this.swapType = type;
  }

  @action
  setFromLoading(loading: boolean) {
    this.fromLoading = loading;
  }

  @action
  setToLoading(loading: boolean) {
    this.toLoading = loading;
  }

  @action
  setIsPendingOpen(open: boolean) {
    this.isPendingOpen = open;
  }

  @action
  setAsset(assets: Asset[]) {
    this.assets = assets;
  }
  @action
  setPopularAssets(popularAssets: string[]) {
    this.popularAssets = popularAssets;
  }

}

export default SwapStore;
