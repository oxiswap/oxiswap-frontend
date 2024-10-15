'use client'

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { PoolButtonProps } from "@utils/interface";
import { observer } from "mobx-react";
import { useStores } from "@stores/useStores";
import { List } from 'antd';
import { PoolButton } from "./PoolButton";
import { fetchPools } from "@utils/api";

export const PoolPageContent = observer(({ initialPools }: { initialPools: PoolButtonProps[] }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { poolStore } = useStores();
  
  useEffect(() => {
    async function fetchPoolsData() {
      setIsLoading(true);
      const pools = await fetchPools();
      poolStore.setPoolButtonProps(pools);
      setIsLoading(false);
    }
    fetchPoolsData();
    // poolStore.setPoolButtonProps(initialPools);
  }, [initialPools, poolStore]);

  const handleOnClick = useCallback((pool: PoolButtonProps) => {
    poolStore.setPool(pool);
  }, [poolStore]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    poolStore.setSearchTerm(e.target.value);
  }, [poolStore]);

  return (
    <main className="w-full h-auto overflow-hidden text-black font-basel-grotesk-book pt-16 md:pt-20">
      <div className="flex flex-col max-w-[600px] mx-auto px-4 md:px-0 pb-24">
        <div className="flex flex-row items-center space-x-2">
          <h1 className="text-2xl font-basel-grotesk-medium">Liquidity Pools</h1>
        </div>
        <div className="relative flex items-center mt-4 mb-2">
          <Image
            src="/search-icon.svg"
            alt="Search"
            width={16}
            height={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
          />
          <input 
            className="w-full h-10 pl-9 pr-4 text-sm rounded-3xl border border-solid border-gray-1 bg-gray placeholder-[#909CAC] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Search by token or validator" 
            type="text" 
            value={poolStore.searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <List
          className="[&_.ant-pagination-item]:!bg-transparent [&_.ant-pagination-item-active]:!bg-transparent "
          itemLayout="vertical"
          dataSource={poolStore.poolButtonProps}
          split={false}
          loading={isLoading}
          pagination={{
            pageSize: 7,
            responsive: true,
            showSizeChanger: false,
            showQuickJumper: false,
            hideOnSinglePage: true,
          }}
          renderItem={(pool) => (
            <List.Item 
              key={pool.poolAssetId}
              style={{ padding: '8px 0' }}
              onClick={() => handleOnClick(pool)}
            >
              <PoolButton 
                assets={pool.assets} 
                type={pool.type} 
                tvl={pool.tvl} 
                apr={pool.apr} 
                poolAssetId={pool.poolAssetId}
              />
            </List.Item>
          )}
        />
      </div>
    </main>
  );
});

