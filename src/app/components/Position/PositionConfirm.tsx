import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import LiquidityButton from '@components/Pool/LiquidityButton';
import { PositionConfirmProps, Asset } from '@utils/interface';
import useResponsive from '@hooks/useResponsive';
import { observer } from 'mobx-react';
import { useStores } from '@stores/useStores';
import { CryptoRouter } from '@blockchain/CryptoRouter';
import { Account } from 'fuels';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { addLiquidity, updatePoolTvlAndApr } from "@utils/api";
import { sortAsset } from '@utils/helpers';
import DrawAssetIcon from '@components/AssetIcon/DrawAssetIcon';

const AssetDiv = observer(({ assets, amounts }: { assets: Asset[], amounts: string[] }) => {
  const { oracleStore } = useStores();

  return (
    <div className="flex flex-col w-full space-y-4 mt-2">
      {assets.map((asset, index) => (
        <div
          key={index}
          className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-row items-center">
            {asset.icon ? (
              <Image
                src={asset.icon}
                alt={asset.symbol}
                width={20}
                height={20}
                className="mr-2"
              />
            ) : (
              <DrawAssetIcon assetName={asset.name} className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] mr-2" />
            )}

            <span className="text-sm text-gray-600">{asset.symbol}</span>
          </div>
          <div className="flex flex-row items-center space-x-1">
            <span className="text-sm font-medium">
              {amounts[index]}
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

const PositionConfirm: React.FC<PositionConfirmProps> = observer(({ 
  assets, 
  amounts, 
  onAction, 
  isExplore, 
  poolAssetId, 
  poolType,
  isPreview
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isSpin, setIsSpin] = useState(false);
    const isMobile = useResponsive();
    const { accountStore, positionStore, notificationStore, poolStore} = useStores();
    
    const router = new CryptoRouter(accountStore.getWallet as Account);
    
    const addMessage = `Add liquidity to the ${amounts[0]} ${assets[0].symbol} / ${amounts[1]} ${assets[1].symbol} pool`;

    useEffect(() => {
      setIsVisible(isPreview);
    }, []);

    const handleClick = async () => {
      setIsSpin(true);

      let results;

      try {
        const result = await notificationStore.handleMultiStepTransactionNotification(
          addMessage,
          router.addLiquidityMultiCall(assets, amounts),
          () => {onAction()}
        );
        results = result;
      } catch (error) {
        const newAssets = [assets[1], assets[0]];
        const newAmounts = [amounts[1], amounts[0]];
        const result = await notificationStore.handleMultiStepTransactionNotification(
          addMessage,
          router.addLiquidityMultiCall(newAssets, newAmounts),
          () => {onAction()}
        );
        results = result;
      }

      if (results.success) {
        const asset0_bits = { bits: assets[0].assetId };
        const asset1_bits = { bits: assets[1].assetId};
        const [new_asset0] = sortAsset(asset0_bits, asset1_bits);

        let insertData;
        if (poolType === 'VolatilePool') {
          if (new_asset0.bits === assets[0].assetId) {
            insertData = {
              address: accountStore.address,
              asset_0_name: assets[0].symbol,
              asset_0_icon: assets[0].icon,
              asset_0: assets[0].assetId,
              asset_0_num: amounts[0],
              asset_0_decimals: assets[0].decimals,
              asset_1_name: assets[1].symbol,
              asset_1: assets[1].assetId,
              asset_1_icon: assets[1].icon,
              asset_1_num: amounts[1],
              asset_1_decimals: assets[1].decimals,
              pool_assetId: poolAssetId,
              only_key: accountStore.address + poolAssetId,
              type: poolType
            }
          } else {
            insertData = {
              address: accountStore.address,
              asset_0_name: assets[1].symbol,
              asset_0_icon: assets[1].icon,
              asset_0: assets[1].assetId,
              asset_0_num: amounts[1],
              asset_0_decimals: assets[1].decimals,
              asset_1_name: assets[0].symbol,
              asset_1: assets[0].assetId,
              asset_1_icon: assets[0].icon,
              asset_1_num: amounts[0],
              asset_1_decimals: assets[0].decimals,
              pool_assetId: poolAssetId,
              only_key: accountStore.address + poolAssetId,
              type: poolType
            }
          }
        } else {
          insertData = {
            address: accountStore.address,
            asset_0_name: assets[0].symbol,
            asset_0: assets[0].assetId,
            asset_0_icon: assets[0].icon,
            asset_0_num: amounts[0],
            asset_1_name: assets[1].symbol,
            asset_1: assets[1].assetId,
            asset_1_icon: assets[1].icon,
            asset_1_num: amounts[1],
            asset_2_name: assets[2].symbol,
            asset_2: assets[2].assetId,
            asset_2_icon: assets[2].icon,
            asset_2_num: amounts[2],
            pool_assetId: poolAssetId,
            only_key: accountStore.address + poolAssetId,
            type: poolType
          }
        }
        const onlyKey = accountStore.address + poolAssetId;
        // supabase
        await addLiquidity(assets, insertData, true, onlyKey);
        await updatePoolTvlAndApr(poolAssetId);
        // form input initialize
        await new Promise(resolve => setTimeout(resolve, 3000));

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
              src="/oxiswap.png"
              alt="lp"
              width={32}
              height={32}
              className="mr-3"
            />
            <span className="text-2xl font-bold">
              {isExplore ? poolStore.liquidityReceiceAmount : positionStore.liquidityReceiceAmount}
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
          <AssetDiv assets={assets} amounts={amounts} />
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
