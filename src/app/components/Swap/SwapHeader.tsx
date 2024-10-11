import Image from "next/image";
import React from "react";
import { ButtonProps } from "@utils/interface";
import { useStores } from "@stores/useStores";
import { observer } from "mobx-react";


const SwapHeader: React.FC<Pick<ButtonProps, 'onAction'>> = observer(({ onAction }) => {
  const { settingStore } = useStores();

  return (
    <div className="flex flex-row items-center justify-between text-black px-2 text-base">
      <span className="ml-2 font-basel-grotesk-medium">Swap</span>
      <button
        onClick={onAction}
        className="flex space-x-2 items-center justify-center"
      >
        <span className="text-gray-400 text-sm">{settingStore.slippage}%</span>
        <Image 
          src="/setting.svg"
          alt="setting"
          width={16}
          height={16}
          className="hover:rotate-90 transition-all duration-300"
        />
      </button>

    </div>
  );
});


export default SwapHeader;