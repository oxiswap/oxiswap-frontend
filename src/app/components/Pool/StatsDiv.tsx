import React from "react";
import { PoolDetailProps } from "@utils/interface";

const StatsDiv = React.memo(({ statsName, statsValue }: Pick<PoolDetailProps, 'statsName' | 'statsValue'>) => (
  <div className="flex flex-col items-start justify-start space-y-2">
    <span className="text-xs text-text-500">{statsName}</span>
    <span className="text-black text-xl">{statsValue}</span>
  </div>
));

export default StatsDiv;