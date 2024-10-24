import Image from "next/image";
import React, { useState, useEffect } from "react";
import { SwapDetailProps } from "@utils/interface";
import { Skeleton } from "antd";
import { observer } from "mobx-react";
import { useStores } from "@stores/useStores";


const SwapDetailDiv: React.FC<Pick<SwapDetailProps, 'title' | 'value' | 'price'>> = observer(({ title, value, price }) => {
  return (
    <div className="flex items-center justify-between px-4">
      <span className="text-text-100 text-xs">{title}</span>
      <div className="text-black text-xs">{value} {price}</div>
    </div>
  );
});


const SwapDetail: React.FC<Pick<SwapDetailProps, 'isExpanded' | 'setIsExpanded'>> = observer(({ isExpanded, setIsExpanded }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { swapStore } = useStores();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-oxi-bg-02 mt-2 rounded-xl flex flex-col hover:border-black transition-all duration-300 ease-in-out">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 flex items-center justify-between hover:bg-oxi-bg-03 hover:rounded-xl transition-all duration-300 ease-in-out"
      >
        <div className="flex items-center justify-center text-xs md:text-xs">
          {isLoading ? (
            <Skeleton.Input style={{ width: '100%', height: '16px' }} active />
          ) : (
            swapStore.fromAsset.symbol && swapStore.toAsset.symbol ? (
              <>
                <span className="text-black">1 {swapStore.fromAsset.symbol}</span>
                <span className="text-[#8f9ba7] mx-1">=</span>
                <span className="text-black">{swapStore.swapRate !== "NaN" ? swapStore.swapRate : '0'} {swapStore.toAsset.symbol}</span>
                <span className="text-[#8f9ba7] mx-1">(~${swapStore.swapRateValue})</span>
              </>
            ) : (
              <span>-</span>
            )
          )}
        </div>
        <div className="flex flex-row items-center justify-center text-[10px] md:text-xs">
          <span className="text-text-500 mr-2">Details</span>
          <Image src="/right.svg" alt="openCard" width={16} height={16} className="rotate-90" />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="space-y-2 mb-2 transition-all duration-300 ease-in-out">
          {isLoading ? (
            <>
              <Skeleton.Input style={{ width: '100%', height: '16px' }} active />
              <Skeleton.Input style={{ width: '100%', height: '16px' }} active />
            </>
          ) : (
            swapStore.fromAsset.symbol && swapStore.toAsset.symbol ? (
              <>
                <SwapDetailDiv title="Price impact" value={`${swapStore.priceImpact}%`} price={''} />
                <SwapDetailDiv 
                  title="Max slippage" 
                  value={swapStore.maxSlippage === 'NaN' ? '' : swapStore.maxSlippage} 
                  price={`
                    (\$${(Number(swapStore.maxSlippage) * Number(swapStore.swapRateValue) / Number(swapStore.swapRate)).toFixed(2) === 'NaN' 
                      ? '-' 
                      : (Number(swapStore.maxSlippage) * Number(swapStore.swapRateValue) / Number(swapStore.swapRate)).toFixed(2)})
                  `} 
                />
                <SwapDetailDiv 
                  title="Min received" 
                  value={swapStore.minReceived === 'NaN' ? '' : swapStore.minReceived} 
                  price={swapStore.toAsset.symbol} 
                />
                <SwapDetailDiv title="Route" value={swapStore.routePath} price={''}/>
              </>
            ) : (
              <>
                <SwapDetailDiv title="Price impact" value="-" price=""/>
                <SwapDetailDiv title="Max slippage" value="-" price=""/>
                <SwapDetailDiv title="Min received" value="-" price=""/>
                <SwapDetailDiv title="Route" value="-" price=""/>
              </>
            )
          )}
        </div>
      </div>

    </div>

  );
});


export default SwapDetail;
