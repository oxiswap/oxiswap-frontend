'use client'

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Asset } from "@utils/interface";
import { useStores } from "@stores/useStores";
import { PoolDetailProps } from "@utils/interface";

const SwapButton = React.memo(({ name, icon }: Pick<Asset, 'name' | 'icon'>) => {
  const router = useRouter();
  const { swapStore, poolStore } = useStores();

  const handleSwap = () => {
    const assets = poolStore.pool.assets;
    if (assets && assets.length >= 2) {
      const fromAsset = assets[0];
      const toAsset = assets[1];
      swapStore.setFromAsset(fromAsset);
      swapStore.setToAsset(toAsset);
    }
    router.push('/swap');
  };

  return (
    <button 
      className="bg-white items-center justify-center rounded-xl text-text-200 text-base hover:opacity-70"
      onClick={handleSwap}
    >
      <div className="flex flex-row px-10 py-2 space-x-2">
        <Image src={icon} alt={name} width={16} height={16} className="rotate-90" />
        <span>{name}</span>
      </div>
    </button>
  );
});

export default SwapButton;