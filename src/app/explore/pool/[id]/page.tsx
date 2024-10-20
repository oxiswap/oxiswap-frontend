import PoolDetail from "@components/Pool/PoolDetail";
import { fetchPools, fetchPoolDetail } from "@utils/api";
import { unstable_noStore as noStore } from 'next/cache';

export const runtime = "edge";

export async function generateStaticParams() {
  try {
    const pools = await fetchPools();
    return pools.filter(pool => pool && pool.poolAssetId).map((pool) => ({ id: pool.poolAssetId }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return []; 
  }
}

export default async function PoolDetailPage({ params }: { params: { id: string } }) {
  noStore();
  try {
    const poolData = await fetchPoolDetail(params.id);

    return <PoolDetail poolAssetId={params.id} initialData={poolData} />;
  } catch (error) {
    console.error('Error fetching pool ', error);
  }
}