import { makeObservable, observable, action } from 'mobx';
import RootStore from '@stores/RootStore';

class ButtonStore {
  @observable swapButton = {
    text: 'Connect Wallet',
    disabled: false,
    className: ''
  };
  @observable positionButton = {
    text: 'Select assets',
    disabled: true,
    className: '',
  };


  constructor(private rootStore: RootStore) {
    makeObservable(this);
  }

  @action
  setSwapButton(text: string = 'Connect Wallet', disabled: boolean = false, className: string = '') {
    this.swapButton = { text, disabled, className };
  }

  @action
  setPositionButton(text: string = 'Select assets', disabled: boolean = true, className: string = '') {
    this.positionButton = { text, disabled, className };
  }

}

export default ButtonStore;
