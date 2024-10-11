import { observer } from "mobx-react";
import { RemoveLiquidityProps } from "@utils/interface";
import Image from "next/image";
import { useStores } from "@stores/useStores";

const RemoveAssetDiv: React.FC<Pick<RemoveLiquidityProps, 'assets'>> = observer(({ assets }) => {
  const { poolStore } = useStores();

  return (
    <div className="flex flex-col w-full space-y-3 mt-2">
      {assets.map((asset, index) => (
        <div key={index} className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-row items-center">
            <Image src={asset.icon} alt={asset.name} width={16} height={16} className="mr-2" />
            <span className="text-xs text-text-500">{asset.name}</span>
          </div>
          <span className="text-xs font-medium">{Number(poolStore.removeLiquidityAmounts) === 0 ? '0' : poolStore.removeReceives[index]}</span>
        </div>
      ))}
    </div>
  );
});

export default RemoveAssetDiv;