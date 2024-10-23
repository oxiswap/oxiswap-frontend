import { supabase, signInWithPassword } from '@utils/supabaseClient';
import assetConfig from '@src/app/test-config.json';
import { PoolButtonProps, Asset, FUEL_PROVIDER_URL, AssetConfig, ETH_ASSET_ID } from './interface';
import BN from "@utils/BN";
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
  const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT');
  return response.data.price;
}


async function fetchTxData(poolAssetId: string) {
  try {
    const currentDate = new Date(); 
    const previousDay = new Date(currentDate);
    previousDay.setDate(previousDay.getDate() - 1);
    const startOfPreviousDay = new Date(previousDay.setHours(0, 0, 0, 0)); 
    const endOfPreviousDay = new Date(previousDay.setHours(23, 59, 59, 999)); 
    const { data, error } = await supabase
      .from('oxiswap_transaction_info')
      .select()
      .eq('pool_assetId', poolAssetId)
      .gte('created_at', startOfPreviousDay.toISOString()) 
      .lte('created_at', endOfPreviousDay.toISOString()); 

    if (error) {
      throw error;
    }
    if (!data) {
      return [];
    }
    return data;
  } catch (error) {
      console.error('Error fetching txs:', error);
  }
}

function calculateDaysSinceCreatedAt(createdAt: string) {
const createdDate = new Date(createdAt);
const currentDate = new Date();
const timeDifference = Math.abs(currentDate.getTime() - createdDate.getTime());
const millisecondsInADay = 1000 * 60 * 60 * 24;
const daysDifference = Math.floor(timeDifference / millisecondsInADay);
return daysDifference;
}

async function getAssetPrice(one: string, two: string, ethPriceInUsd: number) {
  const assetPriceInEth = parseFloat(one) / parseFloat(two);
  const assetPriceInUsd = assetPriceInEth * ethPriceInUsd; 
  return assetPriceInUsd;
}

async function getAssetPriceAndTVl(one: string, two: string, poolAssetId: string, createdAt: string, ethPriceInUsd: number) {
  const assetPriceInUsd = await getAssetPrice(one, two, ethPriceInUsd); 
  const tvl = (parseFloat(one) * ethPriceInUsd) + (parseFloat(two) * assetPriceInUsd);
  let apr: number = 0;
  let volume: number = 0;

  let holdingDays = calculateDaysSinceCreatedAt(createdAt);
  const txData =await fetchTxData(poolAssetId);
  if (Array.isArray(txData) && txData.length > 0) {
    txData.map( tx => {
      if (tx.from_asset_id === ETH_ASSET_ID && tx.from_amount ) {
        volume += parseFloat(tx.from_amount) * 2 * ethPriceInUsd;
      } else if (tx.to_asset_id === ETH_ASSET_ID && tx.to_amount ) {
        volume += parseFloat(tx.to_amount) * 2 * ethPriceInUsd;
      }
    })
    apr = (volume * 0.003) / tvl * (365 / holdingDays) * 100;
  }
  return {tvl, apr, volume};
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

async function calculateTVLAndAPR(pool: any, decimals0: number, decimals1: number) {
  const ethPriceInUsd =await getEthPrice();
  // set tvl and apr
  let tvl: number = 0;
  let apr: number = 0;
  let volume: number = 0;

  if (pool.asset_0 === ETH_ASSET_ID) {
   const result = await getAssetPriceAndTVl(pool.asset_1_num, pool.asset_0_num, pool.pool_assetId, pool.created_at, ethPriceInUsd);
   tvl = result.tvl;
   apr = result.apr;
   volume = result.volume;
  } else if (pool.asset_1 === ETH_ASSET_ID) {
   const result = await getAssetPriceAndTVl(pool.asset_1_num, pool.asset_0_num, pool.pool_assetId, pool.created_at, ethPriceInUsd);
   tvl = result.tvl;
   apr = result.apr;
   volume = result.volume;
  } else {
    let asset0Price: number = 0;
    let asset1Price: number = 0;
    const provider = await Provider.create(FUEL_PROVIDER_URL);
    const factory = new CryptoFactory(provider);
    const asset0Rs = await factory.getPair(pool.asset_0, ETH_ASSET_ID);
    const asset1Rs = await factory.getPair(pool.asset_1, ETH_ASSET_ID);
    if (asset0Rs.isPair) {
      const reserves = await getAssetsReserves(asset0Rs.pair, pool.asset_0, ETH_ASSET_ID, decimals0, decimals1);
      asset0Price = await getAssetPrice(reserves.asset1num, reserves.asset0num, ethPriceInUsd);
    }
    if (asset1Rs.isPair) {
      const reserves = await getAssetsReserves(asset1Rs.pair, pool.asset_1, ETH_ASSET_ID, decimals0, decimals1);
      asset1Price = await getAssetPrice(reserves.asset1num, reserves.asset0num, ethPriceInUsd);
    }
    tvl = (parseFloat(pool.asset_0_num) * asset0Price) + (parseFloat(pool.asset_1_num) * asset1Price);
  }
  return {tvl, apr, volume};
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
    const {tvl, apr, volume} = await calculateTVLAndAPR(existingData[0], existingData[0].asset_0_decimals, existingData[0].asset__decimals);
    
    existingData[0].asset_0_num = resulet.asset0num;
    existingData[0].asset_1_num = resulet.asset1num;
    const updatedData = {
      ...existingData[0],
      tvl: `$${tvl.toFixed(2)}`,
      volume: `$${volume.toFixed(2)}`,
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

export async function addTransactionInfo(insertData: any) {
  // sign supabase with password
  await signInWithPassword();
  await supabase
    .from('oxiswap_transaction_info')
    .insert(insertData)
}