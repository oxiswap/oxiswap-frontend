import Image from 'next/image';
import React, { useState, useEffect, useMemo } from 'react';
import LiquidityButton from '@components/Pool/LiquidityButton';
import { PositionConfirmProps} from '@utils/interface';
import useResponsive from '@hooks/useResponsive';
import { observer } from 'mobx-react';
import { useStores } from '@stores/useStores';
import { CryptoRouter } from '@blockchain/CryptoRouter';
import { Account } from 'fuels';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { CryptoFactory } from '@src/app/blockchain';
import { addLiquidity, updatePoolTvlAndApr } from "@utils/api";
import { sortAsset } from '@utils/helpers';

const AssetDiv = observer(() => {
  const { positionStore, oracleStore } = useStores();

  return (
    <div className="flex flex-col w-full space-y-4 mt-2">
      {positionStore.addLiquidityAssets.map((asset, index) => (
        <div
          key={index}
          className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-row items-center">
            <Image
              src={asset.icon}
              alt={asset.symbol}
              width={20}
              height={20}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">{asset.symbol}</span>
          </div>
          <div className="flex flex-row items-center space-x-1">
            <span className="text-sm font-medium">
              {positionStore.getAmount(index)}
            </span>
            <span className="text-sm font-normal text-gray-400">
              ${oracleStore.getAssetPrices(index)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
});

const PositionConfirm: React.FC<Pick<PositionConfirmProps, 'onAction'>> = observer(({ onAction }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isPair, setIsPair] = useState(false);
    const [isSpin, setIsSpin] = useState(false);
    const isMobile = useResponsive();
    const { accountStore, positionStore, notificationStore, buttonStore} = useStores();
    
    const router = new CryptoRouter(accountStore.getWallet as Account);
    const factory = new CryptoFactory(accountStore.getWallet as Account);
    
    const assetNumber = positionStore.poolType === 'StablePool' ? 3 : 2;
    const assets = useMemo(() => positionStore.addLiquidityAssets, [positionStore.addLiquidityAssets]);


    useEffect(() => {
      const fetchPairInfo = async () => {
        try {
          const { isPair, pair} = await factory.getPair(assets[0].assetId, assets[1].assetId);
          setIsPair(isPair);
        } catch (error) {
          console.error('Error fetching pair info:', error);
        }
      };
      fetchPairInfo();
    }, [assets[0].assetId, assets[1].assetId, accountStore]);

    const addMessage = `Add liquidity to the ${positionStore.getAmount(0)} ${assets[0].symbol} / ${positionStore.getAmount(1)} ${assets[1].symbol} pool`;

    useEffect(() => {
      setIsVisible(true);
    }, []);

    useEffect(() => {
      if (!accountStore.isConnected) {
        buttonStore.setPositionButtonName('Connect Wallet');
        buttonStore.setPositionButtonClassName("bg-button-100/30 text-text-200 hover:border-white hover:bg-button-100/70");
      } else {
        buttonStore.setPositionButtonName('Confirm add liquidity');
        buttonStore.setPositionButtonClassName("bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 transition-all duration-300");
      }
    },[accountStore.isConnected]);

    const handleClick = async () => {
      setIsSpin(true);
      const notificationId = notificationStore.addNotification({
        open: true,
        type: 'submitted',
        message: addMessage
      });

      const handleAddLiquidity = () => {
        notificationStore.setNotificationVisible('addLiquidity', true);
        notificationStore.transitionNotificationState(notificationId, 'submitted');
      }

      let results;
      try {
         results = await router.addLiquidityMultiCall(assets, [positionStore.getAmount(0), positionStore.getAmount(1)], handleAddLiquidity);
      } catch (error) {
        const newAssets = [assets[1], assets[0]];
        results = await router.addLiquidityMultiCall(newAssets, [positionStore.getAmount(1), positionStore.getAmount(0)], handleAddLiquidity);
      }
      
      if (results.success) {
        notificationStore.addNotification({
          open: true,
          type: 'succeed',
          message: addMessage
        });
        positionStore.setIsPreview(false);
        
        const { pair } = await factory.getPair(assets[0].assetId, assets[1].assetId);

        const asset0_bits = { bits: assets[0].assetId };
        const asset1_bits = { bits: assets[1].assetId};
        const [new_asset0] = sortAsset(asset0_bits, asset1_bits);

        let insertData;
        if (positionStore.poolType === 'VolatilePool') {
          if (new_asset0.bits === assets[0].assetId) {
            insertData = {
              address: accountStore.address,
              asset_0_name: assets[0].symbol,
              asset_0_icon: assets[0].icon,
              asset_0: assets[0].assetId,
              asset_0_num: positionStore.getAmount(0),
              asset_0_decimals: assets[0].decimals,
              asset_1_name: assets[1].symbol,
              asset_1: assets[1].assetId,
              asset_1_icon: assets[1].icon,
              asset_1_num: positionStore.getAmount(1),
              asset_1_decimals: assets[1].decimals,
              pool_assetId: pair,
              only_key: accountStore.address + pair,
              type: positionStore.poolType
            }
          } else {
            insertData = {
              address: accountStore.address,
              asset_0_name: assets[1].symbol,
              asset_0_icon: assets[1].icon,
              asset_0: assets[1].assetId,
              asset_0_num: positionStore.getAmount(1),
              asset_0_decimals: assets[1].decimals,
              asset_1_name: assets[0].symbol,
              asset_1: assets[0].assetId,
              asset_1_icon: assets[0].icon,
              asset_1_num: positionStore.getAmount(0),
              asset_1_decimals: assets[0].decimals,
              pool_assetId: pair,
              only_key: accountStore.address + pair,
              type: positionStore.poolType
            }
          }
        } else {
          insertData = {
            address: accountStore.address,
            asset_0_name: assets[0].symbol,
            asset_0: assets[0].assetId,
            asset_0_icon: assets[0].icon,
            asset_0_num: positionStore.addLiquidityAmounts[0],
            asset_1_name: assets[1].symbol,
            asset_1: assets[1].assetId,
            asset_1_icon: assets[1].icon,
            asset_1_num: positionStore.addLiquidityAmounts[1],
            asset_2_name: assets[2].symbol,
            asset_2: assets[2].assetId,
            asset_2_icon: assets[2].icon,
            asset_2_num: positionStore.addLiquidityAmounts[2],
            pool_assetId: pair,
            only_key: accountStore.address + pair,
            type: positionStore.poolType
          }
        }
        const onlyKey = accountStore.address + pair;
        // supabase
       await addLiquidity(assets, insertData, isPair, onlyKey);
       await updatePoolTvlAndApr(pair);
        // form input initialize
        await new Promise(resolve => setTimeout(resolve, 3000));
        positionStore.addLiquidityAssets.map((_, index) => {
          positionStore.setInitialize(index)
        });
        buttonStore.setPositionButtonName('Enter an amount');
        buttonStore.setPositionButtonDisabled(true);
        buttonStore.setPositionButtonClassName('bg-oxi-bg-03 border border-oxi-text-01 text-oxi-text-01');
        onAction();
      } else {
        positionStore.setIsPreview(false);
      }
    };


    const content = (
      <>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">You will receive</h2>
          <Image
            src="/close.svg"
            alt="close"
            width={24}
            height={24}
            className="cursor-pointer hover:opacity-70 transition-opacity"
            onClick={onAction}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg mb-6 bg-gray-50">
          <div className="flex items-center">
            <Image
              src="/stable.svg"
              alt="stable"
              width={32}
              height={32}
              className="mr-3"
            />
            <span className="text-2xl font-bold">
              {positionStore.liquidityReceiceAmount}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-600">LP assets</span>
        </div>

        <div className="text-sm text-gray-600 space-y-2 mb-6">
          <p className="flex items-start">
            <span className="mr-2">•</span>
            Fees earned are automatically compounded into your position.
          </p>
          <p className="flex items-start">
            <span className="mr-2">•</span>
            Output is estimated. If the price changes by more than 15%, your
            transaction will revert.
          </p>
        </div>

        <div className="w-full h-px bg-gray-200 mb-6"></div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Assets</h3>
          <AssetDiv />
        </div>
        {isSpin ? (
          <Spin indicator={<LoadingOutlined spin />} size="large" className="flex items-center justify-center w-full h-12 bg-gray-100 border border-gray-300 rounded-lg text-blue-500" />
        ) : (
          <LiquidityButton onAction={handleClick} />
        )}
      </>
    );

    if (isMobile) {
      return (
        <div
          className={`
          fixed bottom-0 left-0 right-0 w-full font-basel-grotesk-book
          flex flex-col bg-oxi-bg-02 shadow-2xl rounded-t-2xl
          p-2 transition-all duration-300 ease-in-out
          ${isVisible ? 'translate-y-0' : 'translate-y-full'}
        `}>
          <div className="p-6 overflow-y-auto max-h-[80vh]">{content}</div>
        </div>
      );
    }

    return (
      <div
        className={`font-basel-grotesk-book w-[480px] flex flex-col p-6 bg-white rounded-lg shadow-lg transition-all duration-300 ease-in-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
        }`}>
        {content}

      </div>
    );
  });

export default PositionConfirm;
