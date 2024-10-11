import { fetchTestAssetConfig, fetchServerAssetConfig } from "@utils/api";
import { SwapPageContent } from "./SwapPageContent";
import { AssetConfig } from "@utils/interface";

export default async function SwapPageServer() {
  let assetConfig: AssetConfig;

  try {
    assetConfig = await fetchTestAssetConfig();
    // assetConfig = await fetchServerAssetConfig();
    // console.log(assetConfig);
  } catch (error) {
    console.error("Failed to fetch asset config:", error);
    assetConfig = { assets: [], popularAssets: [] }; 
  }

  return <SwapPageContent initialAssetConfig={assetConfig} />;
}