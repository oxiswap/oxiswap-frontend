import { makeObservable, observable, action } from 'mobx';
import RootStore from '@stores/RootStore';

class ButtonStore {
  @observable swapButtonPlay = 'Connect Wallet';
  @observable swapButtonDisabled = false;
  @observable positionButtonPlay = 'Select assets';
  @observable positionButtonDisabled = true;
  @observable buttonClassName = '';
  @observable positionButtonClassName = '';
  @observable positionButtonName = '';

  constructor(private rootStore: RootStore) {
    makeObservable(this);
  }

  @action
  setSwapButtonPlay(text: string) {
    this.swapButtonPlay = text;
  }

  @action
  setSwapButtonDisabled(disabled: boolean) {
    this.swapButtonDisabled = disabled;
  }

  @action
  setPositionButtonPlay(text: string) {
    this.positionButtonPlay = text;
  }

  @action
  setPositionButtonDisabled(disabled: boolean) {
    this.positionButtonDisabled = disabled;
  }

  @action
  setButtonClassName(className: string) {
    this.buttonClassName = className;
  }

  @action
  setPositionButtonClassName(className: string) {
    this.positionButtonClassName = className;
  }

  @action
  setPositionButtonName(name: string) {
    this.positionButtonName = name;
  }
}

export default ButtonStore;
