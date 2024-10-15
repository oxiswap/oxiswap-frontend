import { PoolPageContent } from './PoolPageContent';
import { fetchPools } from "@utils/api";

export default async function PoolPageServer() {
  const pools = await fetchPools();

  return <PoolPageContent initialPools={pools} />;
}