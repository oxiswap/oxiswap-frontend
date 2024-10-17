import { useEffect, useState, useCallback } from 'react';
import { useStores } from '@stores/useStores';
import { CryptoRouter } from '@blockchain/CryptoRouter';
import { CryptoFactory } from '@blockchain/CryptoFactory';
import { Src20Standard } from '@blockchain/Src20Standard';
import { useOracle } from '@hooks/useOracle';
import useDebounce from '@hooks/useDebounce';
import { Account, Provider } from 'fuels';
import { ZERO_ADDRESS } from '@utils/interface';
import { FUEL_PROVIDER_URL } from '@utils/interface';
import BN from '@utils/BN'


export const useSwapInput = (isFromInput: boolean) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [isPair, setIsPair] = useState(false);
  const [pair, setPair] = useState<string>('');
  const [provider, setProvider] = useState<Provider | null>(null);
  const [router, setRouter] = useState<CryptoRouter | null>(null);
  const [factory, setFactory] = useState<CryptoFactory | null>(null);
  const [src20, setSrc20] = useState<Src20Standard | null>(null);
  const { swapStore, balanceStore, accountStore, buttonStore, settingStore } = useStores();
  const asset = isFromInput ? swapStore.fromAsset : swapStore.toAsset;
  const currentBalance = balanceStore.getBalance(asset.assetId, asset.decimals);

  const isZeroAddress = swapStore.fromAsset.assetId === ZERO_ADDRESS || swapStore.toAsset.assetId === ZERO_ADDRESS;
  
  useEffect(() => {
    const initProvider = async () => {
      const newProvider = await Provider.create(FUEL_PROVIDER_URL);
      setProvider(newProvider);
      setRouter(new CryptoRouter(newProvider));
      setFactory(new CryptoFactory(newProvider));
      setSrc20(new Src20Standard(newProvider));
    };
    initProvider();
  }, []);

  const fetchPairInfo = useCallback(async () => {
    if (!factory) return;
    try {
      const { isPair, pair } = await factory.getPair(swapStore.fromAsset.assetId, swapStore.toAsset.assetId);
      setIsPair(isPair);
      setPair(pair);

    } catch (error) {
      console.error('Error fetching pair info:', error);
    }
  }, [swapStore.fromAsset.assetId, swapStore.toAsset.assetId, accountStore.isConnected, factory]);

  useEffect(() => {
    if (factory) {
      fetchPairInfo();
    }
  }, [factory, fetchPairInfo]);

  const oracleUpdate = useOracle(
    accountStore.isConnected ? accountStore.getWallet as Account : provider as Provider, 
    pair, 
    swapStore.fromAsset.assetId, 
    swapStore.toAsset.assetId
  );

  const updateData = useCallback(async (amount?: string) => {
    if (!isPair || !router) return;
    
    if (swapStore.swapType === (isFromInput ? 0 : 1)) {
      const currentAmount = amount || (isFromInput ? swapStore.fromAmount : swapStore.toAmount);
      if (new BN(currentAmount).gt(BN.ZERO)) {
        try {
          const amounts = isFromInput 
            ? await router.getAmountsOut(currentAmount, swapStore.fromAsset.assetId, swapStore.toAsset.assetId)
            : await router.getAmountsIn(currentAmount, swapStore.fromAsset.assetId, swapStore.toAsset.assetId);
          const newAmount = amounts.replace(/,/g, '');

          if (isFromInput) {
            if (swapStore.fromAmount === '') {
              swapStore.setInitalize();
              return;
            }
            swapStore.setToLoading(true);
            swapStore.setToAmount(newAmount);
          } else {
            if (swapStore.toAmount === '') {
              swapStore.setInitalize();
              return;
            }
            swapStore.setFromLoading(true);
            swapStore.setFromAmount(newAmount);
          }

        } catch (error) {
          console.error('Error updating amounts:', error);
        } finally {
          swapStore.setFromLoading(false);
          swapStore.setToLoading(false);
        }

        if (!isZeroAddress) {
          await oracleUpdate();
        } 

        updateButtonState(isPair, pair, swapStore.fromAmount, swapStore.toAmount);

      } else {
        isFromInput ? swapStore.setToAmount('') : swapStore.setFromAmount('');
        // swapStore.setInitalize();
        swapStore.setFromLoading(false);
        swapStore.setToLoading(false);
      }
    }
    }, [accountStore.getWallet, isPair, swapStore.fromAsset.assetId, swapStore.toAsset.assetId, isFromInput, isZeroAddress, oracleUpdate]);

  const debouncedInputValue = useDebounce(inputValue, 500);

  useEffect(() => {
    if (debouncedInputValue !== '') {
      updateData(debouncedInputValue);
    }
  }, [debouncedInputValue, updateData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      swapStore.setFromLoading(false);
      swapStore.setToLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);


  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let newAmount = e.target.value.replace(/[^0-9.]/g, '');
    if (newAmount.split('.').length > 2) {
      return; 
    }
    
    if (new BN(newAmount).gt(BN.ZERO)) {
      newAmount = newAmount.replace(/^0+(?=\d)/, '');
    }
    

    if (isFromInput) {
      swapStore.setFromAmount(newAmount);
      swapStore.setSwapType(0);

      if (swapStore.fromAsset.assetId !== ZERO_ADDRESS && swapStore.toAsset.assetId !== ZERO_ADDRESS) {
        swapStore.setToLoading(true);
      }

    } else {
      swapStore.setToAmount(newAmount);
      swapStore.setSwapType(1);
      if (swapStore.fromAsset.assetId !== ZERO_ADDRESS && swapStore.toAsset.assetId !== ZERO_ADDRESS) {
        swapStore.setFromLoading(true);
      }
    }

    if (newAmount.length === 0) {
      swapStore.setInitalize();
    } else if (newAmount.length > 0 && new BN(newAmount).gt(BN.ZERO)) {
      isFromInput ? swapStore.setToLoading(true) : swapStore.setFromLoading(true);
      setInputValue(newAmount);
    }
    
    updateButtonState(isPair, pair, swapStore.fromAmount, swapStore.toAmount);

  };

  const updateButtonState = useCallback((isPair: boolean, pair: string, fromAmount: string, toAmount: string) => {
    if (!accountStore.isConnected) return;

    const setButtonState = (text: string, disabled: boolean, className: string) => {
      buttonStore.setSwapButtonPlay(text);
      buttonStore.setSwapButtonDisabled(disabled);
      buttonStore.setButtonClassName(className);
    };

    if (!isPair && pair === ZERO_ADDRESS) {
      if (swapStore.fromAsset.assetId !== ZERO_ADDRESS && swapStore.toAsset.assetId !== ZERO_ADDRESS) {
        setButtonState('Insufficient liquidity', true, 'bg-oxi-bg-03 text-oxi-text-01');
        return;
      } else {
        setButtonState('Swap', true, 'bg-oxi-bg-03 text-oxi-text-01');
        return;
      }
    } else {
      if (fromAmount === '' || toAmount === '') {
        setButtonState('Swap', true, 'bg-oxi-bg-03 text-oxi-text-01');
        return;
      }

      const currentBalance = BN.parseUnits(balanceStore.getBalance(swapStore.fromAsset.assetId, swapStore.fromAsset.decimals));
      const formatFromAmount = BN.parseUnits(fromAmount);
      const formatToAmount = BN.parseUnits(toAmount);
    
      if (formatFromAmount.eq(0) || formatToAmount.eq(0)) {
        setButtonState('Swap', true, 'bg-oxi-bg-03 text-oxi-text-01');
        return;
      }
    
      if (formatFromAmount.gt(currentBalance)) {
        setButtonState('Insufficient Asset Balance', true, 'bg-oxi-bg-03 text-oxi-text-01');
        return;
      }
    
      const slippage = new BN(settingStore.slippage).div(100);
      const minReceived = formatToAmount.mul(new BN(1).sub(slippage));
      const priceImpact = new BN(swapStore.priceImpact).div(1000);
    
      if (priceImpact.gt(50)) {
        setButtonState('High price impact', true, 'bg-oxi-bg-03 text-oxi-text-01');
      } else if (slippage.lt(priceImpact)) {
        setButtonState('Slippage is too high', true, 'bg-oxi-bg-03 text-oxi-text-01');
      } else {
        setButtonState(
          'Swap',
          false,
          'bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 transition-all duration-300'
        );
      }
    }


  }, [accountStore.isConnected, balanceStore, buttonStore, settingStore, swapStore]);

  useEffect(() => {
    updateButtonState(isPair, pair, swapStore.fromAmount, swapStore.toAmount);
  }, [updateButtonState, isPair, pair, swapStore.fromAmount, swapStore.toAmount, swapStore.fromAsset.assetId, swapStore.toAsset.assetId]);

  return {
    currentBalance,
    handleInputChange,
    asset,
  };

}