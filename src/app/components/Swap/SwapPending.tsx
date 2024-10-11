import Image from 'next/image';
import { useEffect } from 'react';
import { Account } from 'fuels';
import { ButtonProps } from '@utils/interface';
import { useStores } from '@stores/useStores';
import { CryptoRouter } from '@blockchain/CryptoRouter';
import { supabase, signInWithPassword } from '@utils/supabaseClient';

const SwapPending: React.FC<Pick<ButtonProps, 'onAction'>> = ({ onAction }) => {
  const { accountStore, swapStore, notificationStore, settingStore } = useStores();

  const router = new CryptoRouter(accountStore.getWallet as Account);
  const swapMessage = `Swap ${swapStore.fromAmount} ${swapStore.fromAsset.name} for ${swapStore.toAmount} ${swapStore.toAsset.name}`;
  const handleSwap = () => {
    notificationStore.addNotification({
      open: true,
      type: 'submitted',
      message: swapMessage
    });
  }

  useEffect(() => {
    const swap = async () => {
      try {
        let result;

        if (swapStore.swapType === 0) {
          result = await router.swapExactInput(
            swapStore.fromAsset.assetId,
            swapStore.toAsset.assetId,
            Number(settingStore.slippage) / 100,
            swapStore.fromAmount,
            swapStore.toAmount,
            handleSwap
          );
        } else {
          result = await router.swapExactOutput(
            swapStore.fromAsset.assetId,
            swapStore.toAsset.assetId,
            Number(settingStore.slippage) / 100,
            swapStore.fromAmount,
            swapStore.toAmount,
            handleSwap
          );
        }

        if (result.success) {
          // swapStore.setIsPendingOpen(false);
          notificationStore.addNotification({
            open: true,
            type: 'succeed',
            message: swapMessage
          });
          setTimeout(onAction, 300);
          
          const insertData = {
            tx_id: result.transactionId,
            address: accountStore.address,
            from_asset_id: swapStore.fromAsset.assetId,
            from_name: swapStore.fromAsset.name,
            from_amount: swapStore.fromAmount,
            to_asset_id: swapStore.toAsset.assetId,
            to_name: swapStore.toAsset.name,
            to_amount: swapStore.toAmount,
            slippage: settingStore.slippage
          }

          // login supabase
          await signInWithPassword();
          await supabase
              .from('oxiswap_transaction_info')
              .insert(insertData)

        } else {
          swapStore.setIsPendingOpen(false);
        }
      } catch (error) {
        console.error(error);
      }
    };

    swap();
  }, []);

  return (
    <div className="flex flex-col bg-oxi-bg-02 shadow-2xl rounded-lg w-[420px] p-6 mb-36">
      <div className="flex items-center relative">
        <span className="text-black text-xl absolute left-1/2 transform -translate-x-1/2">
          Confirm swap
        </span>
        <button
          onClick={onAction}
          className="text-gray-400 hover:text-white ml-auto">
          <Image src="/close.svg" alt="close" width={20} height={20} />
        </button>
      </div>
      <div className="flex items-center justify-center mt-8 mb-2">
        <Image src="/tx-pending.svg" alt="txPending" width={96} height={96} />
      </div>
      <span className="text-gray-400 text-sm text-center my-10">
        Please, sign transaction in your wallet
      </span>
      <button
        onClick={onAction}
        className="items-center justify-center bg-button-100/30 text-text-200 text-lg rounded-lg p-2 shadow-2xl border border-transparent hover:border-blue-400">
        Close
      </button>
    </div>
  );
};

const SwapCancelled: React.FC<Pick<ButtonProps, 'onAction'>> = ({
  onAction,
}) => {
  return (
    <div className="flex flex-col bg-oxi-bg-02 shadow-2xl rounded-lg w-[420px] p-4 mb-36">
      <div className="flex items-center relative">
        <span className="text-black text-center text-xl whitespace-nowrap absolute left-1/2 transform -translate-x-1/2">
          Transaction cancelled
        </span>
        <button
          onClick={onAction}
          className="text-gray-400 hover:text-black ml-auto">
          <Image src="/close.svg" alt="close" width={20} height={20} />
        </button>
      </div>
      <div className="flex items-center justify-center mt-12 mb-2">
        <Image src="/swap-cancel.svg" alt="txPending" width={96} height={96} />
      </div>
    </div>
  );
};

export default SwapPending;
export { SwapCancelled };
