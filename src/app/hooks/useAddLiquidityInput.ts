import { useEffect, useState, useCallback, useMemo } from 'react';
import { useStores } from '@stores/useStores';
import { CryptoRouter } from '@blockchain/CryptoRouter';
import { CryptoFactory } from '@blockchain/CryptoFactory';
import { CryptoPair } from '@blockchain/CryptoPair';
import { useOracle } from '@hooks/useOracle';
import { IntervalUpdater } from '@utils/IntervalUpdater';
import { Account, AssetId } from 'fuels';
import { debounce } from 'lodash';
import { ZERO_ADDRESS, Asset } from '@utils/interface';
import BN from '@utils/BN';
import estimateLiquidityAmount, { estimateAmount } from '@hooks/useEstimateLiquidityAmount';
import { sortAsset, formatUnits } from '@utils/helpers';
import { runInAction } from 'mobx';
import useDebounce from '@hooks/useDebounce';


export const useAddLiquidityInput = (assetIndex: number) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [isPair, setIsPair] = useState(false);
  const [pair, setPair] = useState<string>('');
  const [updater, setUpdater] = useState<IntervalUpdater | null>(null);
  const [lastInputIndex, setLastInputIndex] = useState<number | null>(null);
  const [reserves, setReserves] = useState<[string, string]>(['0', '0']);
  const [totalSupply, setTotalSupply] = useState<string>('0');
  const { positionStore, balanceStore, accountStore, buttonStore, poolStore } = useStores();
  const assets = useMemo(() => positionStore.addLiquidityAssets, [positionStore.addLiquidityAssets]);
  
  const router = new CryptoRouter(accountStore.getWallet as Account);
  const factory = new CryptoFactory(accountStore.getWallet as Account);
  const pairContract = new CryptoPair(accountStore.getWallet as Account);

  useEffect(() => {
    const fetchPairInfo = async () => {
      try {
        if(assets.length < 2) return;

        const { isPair, pair } = await factory.getPair(assets[0].assetId, assets[1].assetId);
        const reserves = await pairContract.getReserves(pair);
        const totalSupply = await pairContract.getTotalSupply(pair);
        setReserves([reserves.value[0].toString(), reserves.value[1].toString()]);
        poolStore.setReserves([reserves.value[0].toString(), reserves.value[1].toString()]);
        setTotalSupply(totalSupply.value.toString());
        setIsPair(isPair);
        setPair(pair);

        updateButtonState();
      } catch (error) {
        console.error('Error fetching pair info:', error);
      }
    };
    fetchPairInfo();
  }, [assets, accountStore]);

  const updateData = useCallback(async (amount?: string, inputIndex?: number, isUserInput?: boolean) => {
    if (!accountStore.getWallet || assets.some(asset => asset.assetId === ZERO_ADDRESS) || !isPair || !amount || inputIndex === undefined) return;

    const currentIndex = inputIndex ?? lastInputIndex ?? 0;
    const currentAmount = amount;

    if (new BN(currentAmount).gt(BN.ZERO)) {
      try {
        let newAmounts = [...positionStore.addLiquidityAmounts];
        let liquidityAmount = new BN(0);
        if (positionStore.poolType === 'StablePool') {
          // 这里实现StablePool的逻辑
          newAmounts = [currentAmount];
        } else {
          if (inputValue === '') return;

          const asset0_bits = { bits: assets[0].assetId };
          const asset1_bits = { bits: assets[1].assetId };
          const [new_asset0, new_asset1] = sortAsset(asset0_bits, asset1_bits);

          const selectedAsset = { bits: assets[currentIndex].assetId };
          const isAsset0First = selectedAsset.bits === new_asset0.bits;

          const inputIndex = currentIndex;
          const otherIndex = 1 - inputIndex;

          positionStore.setLoading(true, otherIndex);

          const inputAmount = BN.parseUnits(currentAmount);
          const reserveIn = new BN(isAsset0First ? reserves[1] : reserves[0]);
          const reserveOut = new BN(isAsset0First ? reserves[0] : reserves[1]);
          const estimatedAmount = estimateAmount(inputAmount, reserveIn, reserveOut);

          newAmounts[inputIndex] = inputAmount.toString();
          newAmounts[otherIndex] = estimatedAmount.toString();
          newAmounts = newAmounts.map(amount => formatUnits(amount));

          liquidityAmount = estimateLiquidityAmount(
            BN.parseUnits(newAmounts[0]),
            BN.parseUnits(newAmounts[1]),
            new BN(reserves[0]),
            new BN(reserves[1]),
            new BN(totalSupply)
          );

        }

        runInAction(() => {
          if (isUserInput) {
            newAmounts[inputIndex] = positionStore.getUserInput(inputIndex);
          }
          positionStore.setAddLiquidityAmounts(newAmounts);
          positionStore.setLiquidityReceiceAmount(formatUnits(liquidityAmount.toString()));
        });

        updateButtonState(newAmounts);

      } catch (error) {
        console.error('Error updating amounts:', error);
      } finally {
        assets.forEach((_, index) => positionStore.setLoading(false, index));
      }
    } else {
      positionStore.setAddLiquidityAmounts(assets.map(() => ''));
      assets.forEach((_, index) => positionStore.setLoading(false, index));
    }
  }, [accountStore.getWallet, isPair, assets, lastInputIndex, reserves, totalSupply]);

  const debounceInputValue = useDebounce(inputValue, 500);

  useEffect(() => {
    if (debounceInputValue !== '') {
      updateData(debounceInputValue, assetIndex, true);
    }
  }, [debounceInputValue, updateData]);

  // const debouncedUpdateData = useCallback(
  //   debounce((amount: string, inputIndex: number, isUserInput?: boolean) => updateData(amount, inputIndex, isUserInput), 300),
  //   [updateData]
  // );

  // useEffect(() => {
  //   const newUpdater = new IntervalUpdater(() => updateData(), 10000);
  //   setUpdater(newUpdater);
  //   newUpdater.run(true);
  //   return () => newUpdater.stop();
  // }, [accountStore.getWallet, isPair, assets, updateData]);
  

  // useEffect(() => {
  //   if (updater) updater.reset();
  // }, [assets]);


  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let newAmount = e.target.value.replace(/[^0-9.]/g, '');
    
    if (newAmount.split('.').length > 2) {
      newAmount = newAmount.slice(0, newAmount.lastIndexOf('.') + 1);
    }

    positionStore.setUserInput(newAmount, assetIndex);

    if (new BN(newAmount).gt(BN.ZERO)) {
      newAmount = newAmount.replace(/^0+(?=\d)/, '');
    }

    const asset = assets[assetIndex];
    const currentBalance = balanceStore.getBalance(asset.assetId);

    positionStore.setAmount(newAmount, assetIndex);
    setLastInputIndex(assetIndex);

    if (assets.every(a => a.assetId !== ZERO_ADDRESS) && isPair) {
      assets.forEach((_, index) => {
        if (index !== assetIndex) positionStore.setLoading(true, index);
      });
    }

    if (accountStore.isConnected) {
      if (new BN(newAmount).gt(new BN(currentBalance))) {
        buttonStore.setPositionButtonName('Insufficient Asset Balance');
        buttonStore.setPositionButtonDisabled(true);
        buttonStore.setPositionButtonClassName(`bg-oxi-bg-03 text-oxi-text-01 ${positionStore.isPosition ? "border border-oxi-text-01" : ""}`);
      } else {
        if (assets.length === (positionStore.poolType === 'StablePool' ? 3 : 2)) {
          buttonStore.setPositionButtonName('Preview');
          buttonStore.setPositionButtonDisabled(false);
          buttonStore.setPositionButtonClassName(`bg-oxi-bg-03 text-oxi-text-01 ${positionStore.isPosition ? "border border-oxi-text-01" : ""}`);
        }
      }
    }
    
    if (newAmount.length === 0) {
      positionStore.setAddLiquidityAmounts([]);
    } else if (newAmount.length > 0 && new BN(newAmount).gt(BN.ZERO)) {
      setInputValue(newAmount);
    }

  };

  const updateButtonState = (newAmounts?: string[]) => {
    if (!accountStore.isConnected) return;

    if (assets.length < (positionStore.poolType === 'StablePool' ? 3 : 2)) {
      buttonStore.setPositionButtonName('Select assets');
      buttonStore.setPositionButtonDisabled(true);
      buttonStore.setPositionButtonClassName(`bg-oxi-bg-03 text-oxi-text-01 ${positionStore.isPosition ? "border border-oxi-text-01" : ""}`);
    } else if (
      assets.length === (positionStore.poolType === 'StablePool' ? 3 : 2) &&
      newAmounts?.every(amount => new BN(amount).eq(BN.ZERO))
    ) {
      buttonStore.setPositionButtonName('Enter an amount');
      buttonStore.setPositionButtonDisabled(true);
      buttonStore.setPositionButtonClassName(`bg-oxi-bg-03 text-oxi-text-01 ${positionStore.isPosition ? "border border-oxi-text-01" : ""}`);
    } else if (
      newAmounts && newAmounts.every(
        (amount, index) => 
          new BN(amount).gt(BN.ZERO) && new BN(amount).lt(new BN(balanceStore.getBalance(assets[index].assetId))) 
      )
    ) {
      buttonStore.setPositionButtonName('Preview');
      buttonStore.setPositionButtonDisabled(false);
      buttonStore.setPositionButtonClassName('bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 transition-all duration-300');
    } else if (newAmounts && newAmounts.some((amount, index) => new BN(amount).gt(new BN(balanceStore.getBalance(assets[index].assetId))))) {
      buttonStore.setPositionButtonName('Insufficient Asset Balance');
      buttonStore.setPositionButtonDisabled(true);
      buttonStore.setPositionButtonClassName(`bg-oxi-bg-03 text-oxi-text-01 ${positionStore.isPosition ? "border border-oxi-text-01" : ""}`);
    }
    
  };


  return {
    handleInputChange
  };

};