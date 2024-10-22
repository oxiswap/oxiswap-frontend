import { useEffect, useState, useCallback, useMemo } from 'react';
import { useStores } from '@stores/useStores';
import { CryptoFactory } from '@blockchain/CryptoFactory';
import { CryptoPair } from '@blockchain/CryptoPair';
import { Account, Provider } from 'fuels';
import { ZERO_ADDRESS } from '@utils/interface';
import BN from '@utils/BN';
import estimateLiquidityAmount, { estimateAmount } from '@hooks/useEstimateLiquidityAmount';
import { sortAsset, formatUnits } from '@utils/helpers';
import { runInAction } from 'mobx';
import useDebounce from '@hooks/useDebounce';
import { useOracle } from '@hooks/useOracle';
import { FUEL_PROVIDER_URL } from '@utils/interface';

export const useAddLiquidityInput = (assetIndex: number, isExplore: boolean) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [isPair, setIsPair] = useState(false);
  const [pair, setPair] = useState<string>('');
  const [provider, setProvider] = useState<Provider | null>(null);
  const [lastInputIndex, setLastInputIndex] = useState<number | null>(null);
  const [reserves, setReserves] = useState<[string, string]>(['0', '0']);
  const [totalSupply, setTotalSupply] = useState<string>('0');
  const [amounts, setAmounts] = useState<string[]>(['0', '0']);
  const [assetPrices, setAssetPrices] = useState<[string, string]>(['0', '0']);
  const { positionStore, balanceStore, accountStore, buttonStore, poolStore, oracleStore } = useStores();
  const assets = useMemo(() => isExplore ? poolStore.addLiquidityAssets : positionStore.addLiquidityAssets, [poolStore.addLiquidityAssets, positionStore.addLiquidityAssets]);
  
  const factory = new CryptoFactory(accountStore.getWallet as Account);
  const pairContract = new CryptoPair(accountStore.getWallet as Account);

  useEffect(() => {
    const initProvider = async () => {
      const newProvider = await Provider.create(FUEL_PROVIDER_URL);
      setProvider(newProvider);
    };
    initProvider();
  }, []);

  useEffect(() => {
    const fetchPairInfo = async () => {
      try {
        if(assets.length < 2) return;

        const { isPair, pair } = await factory.getPair(assets[0].assetId, assets[1].assetId);
        const reserves = await pairContract.getReserves(pair);
        const totalSupply = await pairContract.getTotalSupply(pair);
        setReserves([reserves.value[0].toString(), reserves.value[1].toString()]);
        if (isExplore) {
          poolStore.setReserves([reserves.value[0].toString(), reserves.value[1].toString()]);
        } else {
          positionStore.setReserves([reserves.value[0].toString(), reserves.value[1].toString()]);
        }
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

  const oracleUpdate = useOracle({
    account: accountStore.isConnected ? accountStore.getWallet as Account : provider as Provider, 
    pair, 
    asset0: assets[0], 
    asset1: assets[1],
    amount0: amounts[0],
    amount1: amounts[1],
    ethPrice: oracleStore.ethPrice
  });

  useEffect(() => {
    const updateOracleData = async () => {
      const isZeroAddress = assets[0].assetId === ZERO_ADDRESS || assets[1].assetId === ZERO_ADDRESS;

      if (!isZeroAddress && amounts[0] !== '0' && amounts[1] !== '0') {
        const { assetPrices } = await oracleUpdate();
        // setAssetPrices(assetPrices);
        assetPrices.map((price, index) => {oracleStore.setAssetPrices(price, index)});
      }
    };
    
    if (assets.length > 1) {
      updateOracleData();
    }
  }, [amounts]);

  const updateData = useCallback(async (amount?: string, inputIndex?: number, isUserInput?: boolean) => {
    if (!accountStore.getWallet || assets.some(asset => asset.assetId === ZERO_ADDRESS) || !isPair || !amount || inputIndex === undefined) return;
    const currentIndex = inputIndex ?? lastInputIndex ?? 0;
    const currentAmount = amount;

    if (new BN(currentAmount).gt(BN.ZERO)) {
      try {
        let newAmounts = [...(isExplore ? poolStore.addLiquidityAmounts : positionStore.addLiquidityAmounts)];
        let liquidityAmount = new BN(0);
        let otherIndex = 0;
        if (isExplore ? poolStore.poolType === 'StablePool' : positionStore.poolType === 'StablePool') {
          //TODO:StablePool
          newAmounts = [currentAmount];
        } else {
          if (inputValue === '') return;

          const asset0_bits = { bits: assets[0].assetId };
          const asset1_bits = { bits: assets[1].assetId };
          const [new_asset0, new_asset1] = sortAsset(asset0_bits, asset1_bits);

          const selectedAsset = { bits: assets[currentIndex].assetId };
          const isAsset0First = selectedAsset.bits === new_asset0.bits;

          const inputIndex = currentIndex;
          otherIndex = 1 - inputIndex;

          if (isExplore) {
            poolStore.setLoading(true, otherIndex);
          } else {
            positionStore.setLoading(true, otherIndex);
          }
          const inputAmount = BN.parseUnits(currentAmount, assets[inputIndex].decimals || 9);
          const reserveIn = new BN(isAsset0First ? reserves[1] : reserves[0]);
          const reserveOut = new BN(isAsset0First ? reserves[0] : reserves[1]);
          const estimatedAmount = estimateAmount(inputAmount, reserveIn, reserveOut);
          const inputDecimals = assets[inputIndex].decimals || 9;
          const otherDecimals = assets[otherIndex].decimals || 9;
          newAmounts[inputIndex] = new BN(inputAmount.toString()).div(new BN(10).pow(inputDecimals)).toFixed(inputDecimals);
          newAmounts[otherIndex] = new BN(estimatedAmount.toString()).div(new BN(10).pow(otherDecimals)).toFixed(otherDecimals);

          const newAmount0 = isAsset0First ? newAmounts[1] : newAmounts[0];
          const newAmount1 = isAsset0First ? newAmounts[0] : newAmounts[1];

          liquidityAmount = estimateLiquidityAmount(
            BN.parseUnits(newAmount0, inputDecimals),
            BN.parseUnits(newAmount1, otherDecimals),
            new BN(reserves[0]),
            new BN(reserves[1]),
            new BN(totalSupply)
          );

        }

        runInAction(() => {
          if (isUserInput) {
            newAmounts[inputIndex] = isExplore ? poolStore.getUserInput(inputIndex) : positionStore.getUserInput(inputIndex);
          }
          if (isExplore) {
            poolStore.setLoading(false, otherIndex);
            poolStore.setAddLiquidityAmounts(newAmounts);
            poolStore.setLiquidityReceiceAmount(formatUnits(liquidityAmount.toString(), 9));
          } else {
            positionStore.setLoading(false, otherIndex);
            positionStore.setAddLiquidityAmounts(newAmounts);
            positionStore.setLiquidityReceiceAmount(formatUnits(liquidityAmount.toString(), 9));
          }
          setAmounts(newAmounts);
        });

        updateButtonState(newAmounts);

      } catch (error) {
        console.error('Error updating amounts:', error);
      } finally {
        assets.forEach((_, index) => {
          if (isExplore) {
            poolStore.setLoading(false, index);
          } else {
            positionStore.setLoading(false, index);
          }
        });
      }
    } else {
      if (isExplore) {
        poolStore.setAddLiquidityAmounts(assets.map(() => ''));
      } else {
        positionStore.setAddLiquidityAmounts(assets.map(() => ''));
      }
      assets.forEach((_, index) => {
        if (isExplore) {
          poolStore.setLoading(false, index);
        } else {
          positionStore.setLoading(false, index);
        }
      });
    }
  }, [accountStore.getWallet, isPair, assets, lastInputIndex, reserves, totalSupply]);

  const debounceInputValue = useDebounce(inputValue, 500);

  useEffect(() => {
    if (debounceInputValue !== '') {
      updateData(debounceInputValue, assetIndex, true);
    }
  }, [debounceInputValue, updateData]);


  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let newAmount = e.target.value.replace(/[^0-9.]/g, '');
    if (newAmount.split('.').length > 2) {
      newAmount = newAmount.slice(0, newAmount.lastIndexOf('.') + 1);
    }

    if (isExplore) {
      poolStore.setUserInput(newAmount, assetIndex);
    } else {
      positionStore.setUserInput(newAmount, assetIndex);
    }

    if (new BN(newAmount).gt(BN.ZERO)) {
      newAmount = newAmount.replace(/^0+(?=\d)/, '');
    }

    setInputValue(newAmount);

    const asset = assets[assetIndex];
    const currentBalance = balanceStore.getBalance(asset.assetId, asset.decimals);

    if (isExplore) {
      poolStore.setAmount(newAmount, assetIndex);
    } else {
      positionStore.setAmount(newAmount, assetIndex);
    }
    setLastInputIndex(assetIndex);

    if (assets.every(a => a.assetId !== ZERO_ADDRESS) && isPair) {
      assets.forEach((_, index) => {
        if (index !== assetIndex) {
          if (isExplore) {
            poolStore.setLoading(true, index);
          } else {
            positionStore.setLoading(true, index);
          }
        }
      });
    }

    if (accountStore.isConnected) {
      if (new BN(newAmount).gt(new BN(currentBalance))) {
        buttonStore.setPositionButton("Insufficient Asset Balance", true, `bg-oxi-bg-03 text-oxi-text-01 ${!isExplore ? "border border-oxi-text-01" : ""}`);
      } else {
        const isStablePool = isExplore 
          ? poolStore.poolType === 'StablePool'
          : positionStore.poolType === 'StablePool';

        const expectedAssetCount = isStablePool ? 3 : 2;

        if (assets.length === expectedAssetCount) {
          buttonStore.setPositionButton(
            "Preview", 
            false, 
            "bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
          );
        }
      }
    }
    
    if (newAmount.length === 0) {
      if (isExplore) {
        poolStore.setAddLiquidityAmounts([]);
        oracleStore.setAssetPrices("", 0);
        oracleStore.setAssetPrices("", 1);
        buttonStore.setPositionButton(
          "Add Liquidity", 
          true, 
          "bg-oxi-bg-03 text-oxi-text-01"
        );
      } else {
        positionStore.setAddLiquidityAmounts([]);
        oracleStore.setAssetPrices("", 0);
        oracleStore.setAssetPrices("", 1);
        buttonStore.setPositionButton(
          "Add Liquidity", 
          true, 
          "bg-oxi-bg-03 text-oxi-text-01 border border-oxi-text-01"
        );
      }
      assets.forEach((_, index) => {
        if (isExplore) {
          poolStore.setLoading(false, index);
        } else {
          positionStore.setLoading(false, index);
        }
      });
    } 
  };

  const updateButtonState = (newAmounts?: string[]) => {
    if (!accountStore.isConnected) return;

    const isStablePool = isExplore 
      ? poolStore.poolType === 'StablePool'
      : positionStore.poolType === 'StablePool';

    const expectedAssetCount = isStablePool ? 3 : 2;

    if (assets.length < expectedAssetCount) {
      buttonStore.setPositionButton("Select assets", true, `bg-oxi-bg-03 text-oxi-text-01 ${!isExplore ? "border border-oxi-text-01" : ""}`);
    } else if (
      assets.length === expectedAssetCount &&
      newAmounts?.every(amount => new BN(amount).eq(BN.ZERO))
    ) {
      buttonStore.setPositionButton("Enter an amount", true, `bg-oxi-bg-03 text-oxi-text-01 ${!isExplore ? "border border-oxi-text-01" : ""}`);
    } else if (
      newAmounts && newAmounts.every(
        (amount, index) => 
          new BN(amount).gt(BN.ZERO) && new BN(amount).lt(new BN(balanceStore.getBalance(assets[index].assetId, assets[index].decimals))) 
      )
    ) {
      buttonStore.setPositionButton(
        "Preview", 
        false, 
        "bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
      );
    } else if (newAmounts && newAmounts.some((amount, index) => new BN(amount).gt(new BN(balanceStore.getBalance(assets[index].assetId, assets[index].decimals))))) {
      buttonStore.setPositionButton(
        "Insufficient Asset Balance", 
        true, 
        `bg-oxi-bg-03 text-oxi-text-01 ${!isExplore ? "border border-oxi-text-01" : ""}`
      );
    }
    
  };


  return {
    handleInputChange
  };

};