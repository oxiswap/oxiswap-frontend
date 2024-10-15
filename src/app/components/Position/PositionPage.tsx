'use client'

import MyPosition from "@components/Pool/MyPosition";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStores } from "@stores/useStores";
import { observer } from "mobx-react";
import { Skeleton } from 'antd';
import { fetchUserPositions } from "@utils/api";
import AddIcon from "@assets/icons/AddIcon";

const PositionPage = observer(() => {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { positionStore, accountStore } = useStores();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const formattedData = await fetchUserPositions(accountStore.address || '');
        positionStore.setAssets(formattedData);
        positionStore.setAllInitialize();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [accountStore.address, positionStore]);

  return (
    <main className="w-full h-auto overflow-hidden text-black px-4 md:px-72 mx-auto font-basel-grotesk-book pt-16 md:pt-36">
      <div className="flex flex-col max-w-[870px] mx-auto">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center justify-center">
            <h1 className="text-3xl font-basel-grotesk-medium">My Positions</h1>
          </div>
          <button
            onClick={() => router.push("/pool/add")}
            className="py-2 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-white hover:to-white transition-all duration-300 text-sm flex flex-row items-center group"
          >
            <AddIcon width={20} height={20} className="mr-2 text-white group-hover:text-blue-700" />
            <span className="text-white group-hover:text-blue-700">New position</span>
          </button>
        </div>

        <div className="flex flex-col rounded-lg w-full h-auto p-4 mt-4 space-y-2 bg-white">
          <div className="py-2 px-2">
            <span className="text-xs text-black ">Your Positions ({positionStore.assets.length})</span>
          </div>
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : (
            positionStore.assets.length === 0 ? (
              <MyPosition 
                noPositionSpan1="No liquidity position found."
                hasPosition={false}
                assets={[]}
                type=""
                addLiquidityOpen={() => {}}
                removeLiquidityOpen={() => {}}
                cardClick={() => {}}
                isCardOpen={false}
                isExplore={false}
              />
            ) : (
              positionStore.assets.map((asset, index) => (
                <React.Fragment key={index}>
                  <MyPosition 
                    noPositionSpan1="No liquidity position found."
                    hasPosition={true} 
                    assets={asset.assets}
                    type={asset.type}
                    addLiquidityOpen={() => {}}
                    removeLiquidityOpen={() => {}}
                    cardClick={() => {}}
                    isCardOpen={false}
                    isExplore={false}
                  />
                </React.Fragment>
              ))
            )
          )}

        </div>
      </div>
    </main>
  );
});


export default PositionPage;