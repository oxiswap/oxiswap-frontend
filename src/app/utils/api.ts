import { supabase, signInWithPassword } from '@utils/supabaseClient';
import assetConfig from '@src/app/test-config.json';
import { PoolButtonProps, Asset, FUEL_PROVIDER_URL } from './interface';
import BN from "@utils/BN";
import { AssetConfig, ETH_ASSET_ID } from "@utils/interface";
import { CryptoPair } from '@blockchain/CryptoPair';
import { Provider } from 'fuels';
import { sortAsset } from '@utils/helpers';
import axios from 'axios';
import { CryptoFactory } from '@blockchain/CryptoFactory';

interface PoolAsset {
  name: string;
  icon: string;
  symbol: string;
  assetId: string;
  balance: string;
  value: string;
  amount: string;
  decimals: number;
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
  asset_0_decimals: number;
  asset_1: string;
  asset_1_name: string;
  asset_1_icon: string;
  asset_1_num: string;
  asset_1_decimals: number;
  asset_2?: string;
  asset_2_name?: string;
  asset_2_icon?: string;
  asset_2_num?: string;
  asset_2_decimals?: number;
  pool_assetId: string;
  tvl?: string;
  apr?: string;
  type: 'StablePool' | 'VolatilePool';
  volume?: string;
}

function createAsset(name: string, assetId: string, num: string, icon?: string, decimals?: number): PoolAsset {
  const validNum = num ?? "0";
  return {
    name,
    icon: icon ?? '/stable.svg', 
    symbol: name,
    assetId,
    decimals: decimals ?? 9,
    balance: validNum,
    value: validNum,
    amount: validNum
  };
}

function convertPoolData(item: RawPoolData): Pool {
  const assets: PoolAsset[] = [
    createAsset(item.asset_0_name, item.asset_0, item.asset_0_num, item.asset_0_icon, item.asset_0_decimals),
    createAsset(item.asset_1_name, item.asset_1, item.asset_1_num, item.asset_1_icon, item.asset_1_decimals)
  ];

  if (item.type === 'StablePool' && item.asset_2 && item.asset_2_name && item.asset_2_num && item.asset_2_decimals) {
    assets.push(createAsset(item.asset_2_name, item.asset_2, item.asset_2_num, item.asset_2_icon, item.asset_2_decimals));
  }

  return {
    apr: item.apr || "-", 
    assets,
    poolAssetId: item.pool_assetId,
    tvl: item.tvl || "-",
    type: item.type,
    volume: item.volume || "-",
  };
}

export async function fetchPools(): Promise<Pool[]> {
  try {
    const { data, error } = await supabase.from('oxiswap_pools').select('*, updated_at').order('updated_at', { ascending: false });
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

export async function fetchPoolDetail(poolAssetId: string): Promise<Pool | null> {
  try {
    const { data, error } = await supabase.from('oxiswap_pools').select('*, updated_at').eq('pool_assetId', poolAssetId).order('updated_at', { ascending: false });
    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return convertPoolData(data[0]);
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
  const { data, error } = await supabase.from('fuel_verfied_assets').select('name, icon, symbol, assetId, decimals, contractId, popular').order('assetId', { ascending: false });
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
          value: '0',
          assetId: asset.assetId,
          decimals: asset.decimals,
          contractId: asset.contractId,
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

async function getEthPrice() {
  const response = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  );

  return response.data.ethereum.usd;
}

async function getAssetPriceAndTVl(one: string, two: string) {
  const assetPriceInEth = parseFloat(one) / parseFloat(two);
  // eth price
  const ethPriceInUsd =await getEthPrice();
  const assetPriceInUsd = assetPriceInEth * ethPriceInUsd; 
  const tvl = (parseFloat(one) * ethPriceInUsd) + (parseFloat(two) * assetPriceInUsd);
  // const dailyFees = 1000;
  // const annualFees = dailyFees * 365;
  // const apr = (annualFees / tvl) * 100;
  const apr = 0;

  return {tvl, apr, assetPriceInUsd};
}

async function getAssetsReserves(poolAssetId: string, asset0: string, asset1: string, decimals0: number, decimals1: number) {
  let asset0num: string = "";
  let asset1num: string = "";
  const provider = await Provider.create(FUEL_PROVIDER_URL);
  const pairContract = new CryptoPair(provider);
  const reserves = await pairContract.getReserves(poolAssetId);
  const asset0_bits = { bits: asset0 };
  const asset1_bits = { bits: asset1};
  const [new_asset0] = sortAsset(asset0_bits, asset1_bits);
  if (asset0 === new_asset0.bits) {
    asset0num = new BN(reserves.value[0].toString()).div(new BN(10).pow(decimals0) || 9).toString();
    asset1num = new BN(reserves.value[1].toString()).div(new BN(10).pow(decimals1) || 9).toString();
  } else {
    asset0num = new BN(reserves.value[1].toString()).div(new BN(10).pow(decimals1) || 9).toString();
    asset1num = new BN(reserves.value[0].toString()).div(new BN(10).pow(decimals0) || 9).toString();
  }
  return {asset0num, asset1num};
}

async function calculateTVLAndAPR(insertData: any, decimals0: number, decimals1: number) {
  // set tvl and apr
  let tvl: number = 0;
  let apr: number = 0;
  if (insertData.asset_0 === ETH_ASSET_ID) {
   const result = await getAssetPriceAndTVl(insertData.asset_0_num, insertData.asset_1_num);
   tvl = result.tvl;
   apr = result.apr;
  } else if (insertData.asset_1 === ETH_ASSET_ID) {
   const result = await getAssetPriceAndTVl(insertData.asset_1_num, insertData.asset_0_num);
   tvl = result.tvl;
   apr = result.apr;
  } else {
    let asset0Price: number = 0;
    let asset1Price: number = 0;
    const provider = await Provider.create(FUEL_PROVIDER_URL);
    const factory = new CryptoFactory(provider);
    const asset0Rs = await factory.getPair(insertData.asset_0, ETH_ASSET_ID);
    const asset1Rs = await factory.getPair(insertData.asset_1, ETH_ASSET_ID);
    if (asset0Rs.isPair) {
      const reserves = await getAssetsReserves(asset0Rs.pair, insertData.asset_0, ETH_ASSET_ID, decimals0, decimals1);
      const result = await getAssetPriceAndTVl(reserves.asset1num, reserves.asset0num);
      asset0Price = result.assetPriceInUsd;
    }
    if (asset1Rs.isPair) {
      const reserves = await getAssetsReserves(asset1Rs.pair, insertData.asset_1, ETH_ASSET_ID, decimals0, decimals1);
      const result = await getAssetPriceAndTVl(reserves.asset1num, reserves.asset0num);
      asset1Price = result.assetPriceInUsd;
    }
    tvl = (parseFloat(insertData.asset_0_num) * asset0Price) + (parseFloat(insertData.asset_1_num) * asset1Price);
    // const dailyFees = 1000;
    // const annualFees = dailyFees * 365;
    // apr = (annualFees / tvl) * 100;
  }
  return {tvl, apr};
}


export async function removeLiquidity(pool: PoolButtonProps, onlyKey: string, removeAllLiquidity: boolean, amounts: string[]) {
  // sign supabase with password
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
          asset_1_num: new BN(existingRecord.asset_1_num).sub(new BN(amounts[1])).toFixed(9),
          updated_at: new Date().toISOString()
        };
      } else {
        updatedData = {
          ...existingRecord,
          asset_0_num: new BN(existingRecord.asset_0_num).sub(new BN(amounts[1])).toFixed(9),
          asset_1_num: new BN(existingRecord.asset_1_num).sub(new BN(amounts[0])).toFixed(9),
          updated_at: new Date().toISOString()
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
  // sign supabase with password
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
          asset_1_num: new BN(existingRecord.asset_1_num).add(new BN(insertData.asset_1_num)).toFixed(9),
          updated_at: new Date().toISOString()
        };
      } else {
        updatedData = {
          ...existingRecord,
          asset_0_num: new BN(existingRecord.asset_0_num).add(new BN(insertData.asset_1_num)).toFixed(9),
          asset_1_num: new BN(existingRecord.asset_1_num).add(new BN(insertData.asset_0_num)).toFixed(9),
          updated_at: new Date().toISOString()
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
      .from('oxiswap_pool_info')
      .insert(insertData) 

    await supabase
      .from('oxiswap_pools')
      .insert(insertData)
  }
}

export async function updatePoolTvlAndApr(pair: string) {
  // sign supabase with password
  await signInWithPassword();
  const { data: existingData, error: selectError } = await supabase
    .from('oxiswap_pools')
    .select()
    .eq('pool_assetId', pair)
  
  if (selectError) {
    console.error("Error selecting data:", selectError);
    throw selectError; 
  }

  if (existingData && existingData.length > 0) {
    const resulet = await getAssetsReserves(pair, existingData[0].asset_0, existingData[0].asset_1, existingData[0].asset_0_decimals, existingData[0].asset_1_decimals);
    const {tvl, apr} = await calculateTVLAndAPR(existingData[0], existingData[0].asset_0_decimals, existingData[0].asset__decimals);
    
    existingData[0].asset_0_num = resulet.asset0num;
    existingData[0].asset_1_num = resulet.asset1num;
    const updatedData = {
      ...existingData[0],
      tvl: `$${tvl.toFixed(2)}`,
      apr: `${apr.toFixed(2)}%`,
      updated_at: new Date().toISOString()
    }
 
    const { error: updateError } = await supabase
      .from('oxiswap_pools')
      .update(updatedData)
      .eq('pool_assetId', pair);

    if (updateError) {
      console.error("Error updating data:", updateError);
      throw updateError; 
    }
  }
}

export async function addAsset(asset: Asset) {
  // sign supabase with password
  await signInWithPassword();

  const { data: existingData, error: selectError } = await supabase
    .from('fuel_verfied_assets')
    .select()
    .eq('assetId', asset.assetId) 

  if (selectError) {
    console.error("Error selecting data:", selectError);
    throw selectError; 
  }

  if (!existingData || existingData.length === 0) {
    await supabase
    .from('fuel_verfied_assets')
    .insert(asset)
  }
}