import { supabase, signInWithPassword } from '@utils/supabaseClient';
import assetConfig from '@src/app/test-config.json';
import { PoolButtonProps, Asset } from './interface';
import BN from "@utils/BN";
import { AssetConfig } from "@utils/interface";

interface PoolAsset {
  name: string;
  icon: string;
  symbol: string;
  assetId: string;
  balance: string;
  value: string;
  amount: string;
}

interface Pool {
  apr: string;
  assets: PoolAsset[];
  poolAssetId: string;
  tvl: string;
  type: string;
  volume: string;
}

interface RawPoolData {
  asset_0: string;
  asset_0_name: string;
  asset_0_icon: string;
  asset_0_num: string;
  asset_1: string;
  asset_1_name: string;
  asset_1_icon: string;
  asset_1_num: string;
  asset_2?: string;
  asset_2_name?: string;
  asset_2_icon?: string;
  asset_2_num?: string;
  pool_assetId: string;
  tvl?: string;
  type: 'StablePool' | 'VolatilePool';
  volume?: string;
}

function createAsset(name: string, assetId: string, num: string, icon?: string): PoolAsset {
  const validNum = num ?? "0";
  return {
    name,
    icon: icon ?? '/stable.svg', 
    symbol: name,
    assetId,
    balance: validNum,
    value: validNum,
    amount: validNum
  };
}

function convertPoolData(item: RawPoolData): Pool {
  const assets: PoolAsset[] = [
    createAsset(item.asset_0_name, item.asset_0, item.asset_0_num, item.asset_0_icon),
    createAsset(item.asset_1_name, item.asset_1, item.asset_1_num, item.asset_1_icon)
  ];

  if (item.type === 'StablePool' && item.asset_2 && item.asset_2_name && item.asset_2_num) {
    assets.push(createAsset(item.asset_2_name, item.asset_2, item.asset_2_num, item.asset_2_icon));
  }

  return {
    apr: "-", 
    assets,
    poolAssetId: item.pool_assetId,
    tvl: item.tvl || "-",
    type: item.type,
    volume: item.volume || "-",
  };
}

export async function fetchPools(): Promise<Pool[]> {
  try {
    const { data, error } = await supabase.from('oxiswap_pools').select();

    if (error) {
      throw error;
    }

    if (!data) {
      return [];
    }

    return data.map(convertPoolData);
  } catch (error) {
    console.error('Error fetching pools:', error);
    throw new Error('Failed to fetch pools');
  }
}

export async function fetchUserPositions(address: string) {
  const { data, error } = await supabase
    .from('oxiswap_pool_info')
    .select()
    .eq('address', address) 

  if (error) {
    console.error('Error fetching user positions:', error);
    return [];
  }

  return data.map(convertPoolData);
}

export async function fetchTestAssetConfig() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return assetConfig;
}

export const fetchServerAssetConfig = async (): Promise<AssetConfig> =>  {
  const { data, error } = await supabase.from('fuel_verfied_assets').select('name, icon, symbol, assetId, popular');
  if (error) {
    console.error('Error fetching pools:', error);
    return { assets: [], popularAssets: [] };
  }
  const formatAssets = transformAssets(data);
  return formatAssets;
}

const transformAssets = (data: any[]): AssetConfig  => {
  const assets: Asset[] = [];
  if (data.length === 0) {
      return { assets, popularAssets: [] };
  }
  data.forEach(asset => {
      assets.push({
          name: asset.name,
          symbol: asset.symbol,
          icon: asset.icon,
          balance: `0 ${asset.symbol}`,
          value: "0",
          assetId: asset.assetId,
          amount: "",
          popular: asset.popular
      });
  });
  const popularAssets = assets
    .filter(asset => asset.popular === "yes")
    .map(asset => asset.symbol);

  return {
      assets,
      popularAssets
  };
};

export async function removeLiquidity(pool: PoolButtonProps, onlyKey: string, removeAllLiquidity: boolean, amounts: string[]) {

  await signInWithPassword();

  const { data: existingData, error: selectError } = await supabase
    .from('oxiswap_pool_info')
    .select()
    .eq('only_key', onlyKey) 

  if (selectError) {
    console.error("Error selecting data:", selectError);
    throw selectError; 
  }

  if (existingData && existingData.length > 0) {
    if ( removeAllLiquidity ) {
      const { error: deleteError } = await supabase
        .from('oxiswap_pool_info')
        .delete()
        .eq('only_key', onlyKey);
          
      if (deleteError) {
        console.error("Error deleting data:", deleteError);
        throw deleteError; 
      }
    } else {
      const existingRecord = existingData[0];
      let updatedData;
      if ( existingRecord.asset0 === pool.assets[0].assetId ) {
        updatedData = {
          ...existingRecord,
          asset_0_num: new BN(existingRecord.asset_0_num).sub(new BN(amounts[0])).toFixed(9),
          asset0_1_num: new BN(existingRecord.asset_1_num).sub(new BN(amounts[1])).toFixed(9)
        };
      } else {
        updatedData = {
          ...existingRecord,
          asset_0_num: new BN(existingRecord.asset_0_num).sub(new BN(amounts[1])).toFixed(9),
          asset_1_num: new BN(existingRecord.asset_1_num).sub(new BN(amounts[0])).toFixed(9)
        };
      }
      const { error: updateError } = await supabase
        .from('oxiswap_pool_info')
        .update(updatedData)
        .eq('only_key', onlyKey);
          
      if (updateError) {
          console.error("Error updating data:", updateError);
        throw updateError; 
      }
    }
  }
}

export async function addLiquidity(assets: Asset[], insertData: any, isPair: boolean, onlyKey: string) {
  
  await signInWithPassword();
  if (isPair) {
    const { data: existingData, error: selectError } = await supabase
    .from('oxiswap_pool_info')
    .select()
    .eq('only_key', onlyKey) 

    if (selectError) {
      console.error("Error selecting data:", selectError);
      throw selectError; 
    }

    if (existingData && existingData.length > 0) {
      const existingRecord = existingData[0];
      let updatedData;
      if ( existingRecord.asset0 === assets[0].assetId ) {
        updatedData = {
          ...existingRecord,
          asset_0_num: new BN(existingRecord.asset_0_num).add(new BN(insertData.asset_0_num)).toFixed(9),
          asset_1_num: new BN(existingRecord.asset_1_num).add(new BN(insertData.asset_1_num)).toFixed(9)
        };
      } else {
        updatedData = {
          ...existingRecord,
          asset_0_num: new BN(existingRecord.asset_0_num).add(new BN(insertData.asset_1_num)).toFixed(9),
          asset_1_num: new BN(existingRecord.asset_1_num).add(new BN(insertData.asset_0_num)).toFixed(9)
        };
      }
      const { error: updateError } = await supabase
        .from('oxiswap_pool_info')
        .update(updatedData)
        .eq('only_key', onlyKey);
  
      if (updateError) {
        console.error("Error updating data:", updateError);
        throw updateError; 
      }

    } else {
      await supabase
        .from('oxiswap_pool_info')
        .insert(insertData)
    }
  } else{
    await supabase
      .from('oxiswap_pools')
      .insert(insertData)

    await supabase
      .from('oxiswap_pool_info')
      .insert(insertData) 
  }
}
