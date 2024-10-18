import { useEffect } from 'react';
import { useStores } from '@stores/useStores';
import axios from 'axios';

export const useEthPrice = () => {
  const { oracleStore } = useStores();

  useEffect(() => {
    const getEthPrice = async () => {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      const ethPrice = response.data.ethereum.usd;
      oracleStore.setEthOraclePrice(ethPrice);
    }
    getEthPrice();
  }, []);
};
