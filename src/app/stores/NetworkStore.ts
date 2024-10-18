import { makeAutoObservable } from 'mobx';
import RootStore from '@stores/RootStore';
import { useFuel } from '@fuels/react';

class NetworkStore {
  currentNetwork: string | null = null;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
    this.initialize();
  }

  initialize = async () => {
    const { fuel } = useFuel();
    // if (fuel) {
    //   const network = await fuel.networks();
    //   this.setCurrentNetwork(network[0].url);

    //   fuel.on(fuel.events.currentNetwork, this.handleNetworkChange);
    // }
  };

  setCurrentNetwork = (network: string) => {
    this.currentNetwork = network;
  };

  handleNetworkChange = (newNetwork: any) => {
    this.setCurrentNetwork(newNetwork.url);
  };

  cleanup = () => {
    const { fuel } = useFuel();
    if (fuel) {
      fuel.off(fuel.events.currentNetwork, this.handleNetworkChange);
    }
  };
}

export default NetworkStore;