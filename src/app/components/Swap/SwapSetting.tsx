import Image from "next/image";
import React, { useState, useEffect } from "react";
import { SwapSettingProps } from "@utils/interface";
import useResponsive from "@hooks/useResponsive";
import { useStores } from "@stores/useStores";
import { observer } from "mobx-react";

const SlippageButton: React.FC<Pick<SwapSettingProps, 'value' | 'onAction' | 'isChecked'>> = observer(({ value, onAction, isChecked }) => {
  return (
    <button 
      onClick={onAction}
      className={`text-black text-sm rounded-lg px-4 py-3 border transition-colors duration-200 ${isChecked ? 'bg-oxi-bg-02 border-blue-400' : 'border-transparent hover:border-blue-400'}`}
    >
      {value}
    </button>
  )
});

const SwapSetting: React.FC<Pick<SwapSettingProps, 'onAction'>> = observer(({ onAction }) => {
  const isMobile = useResponsive();
  const [isVisible, setIsVisible] = useState(false);
  const { settingStore } = useStores();
  const [slippage, setSlippage] = useState<string>("0.5");
  const [isAuto, setIsAuto] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    settingStore.setSlippage("0.5");
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onAction, 300); 
  };

  const handleSlippage = (value: string, auto: boolean = false) => {
    setSlippage(value);
    setIsAuto(auto);
    settingStore.setSlippage(value);
  };

  const isSlippageSelected = (value: string, auto: boolean = false) => {
    return slippage === value && isAuto === auto;
  };

  return (
    <div 
      className={`
        flex flex-col bg-oxi-bg-02 shadow-2xl
        ${isMobile ? 'fixed bottom-0 left-0 right-0 rounded-t-lg' : 'rounded-lg w-[500px] mb-36'}
        p-6 transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-black text-lg">Swap settings</h2>
        <button 
          onClick={handleClose}
          className="flex items-center justify-center w-8 h-8"
        >
          <Image src="/close.svg" alt="closeWalletCard" width={24} height={24} />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-black">Slippage</span>
        <span className="text-sm text-gray-400">{isAuto ? 'Auto 1%' : slippage + '%'}</span>
      </div>
      <div className={`rounded-lg border border-gray-300 mt-2 ${isMobile ? 'grid grid-cols-3 gap-2 mb-8' : 'grid grid-cols-6'}`}>
        <SlippageButton value="Auto" onAction={() => handleSlippage("1", true)} isChecked={isSlippageSelected("1", true)}/>
        <SlippageButton value="0.1%" onAction={() => handleSlippage("0.1")} isChecked={isSlippageSelected("0.1")}/>
        <SlippageButton value="0.5%" onAction={() => handleSlippage("0.5")} isChecked={isSlippageSelected("0.5")}/>
        <SlippageButton value="1%" onAction={() => handleSlippage("1")} isChecked={isSlippageSelected("1")}/>
        <SlippageButton value="3%" onAction={() => handleSlippage("3")} isChecked={isSlippageSelected("3")}/>
        <input 
          type="text" 
          autoComplete="off" 
          autoCorrect="off" 
          placeholder="Custom" 
          value={isAuto ? '' : (Number(slippage) > 49 ? '49' : slippage)}
          className={`bg-oxi-bg-02 rounded-lg focus:border focus:border-blue-400 text-sm text-black text-center p-2 ${!isAuto && !["0.1", "0.5", "1", "3"].includes(slippage) ? 'bg-oxi-bg-02' : ''}`}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '') {
              handleSlippage("1", true);
            } else {
              handleSlippage(Number(value) > 49 ? '49' : value);
            }
          }}
        />
      </div>
    </div>
  );
});

export default SwapSetting;