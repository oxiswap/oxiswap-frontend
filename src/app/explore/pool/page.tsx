import { Suspense } from "react";
import PoolPageServer from './PoolPageServer';
import PoolSkeleton from './PoolSkeleton';

export const runtime = "edge";

export default function PoolPage() {
  return (
    <Suspense fallback={<PoolSkeleton />}>
      <PoolPageServer />
    </Suspense>
  );
}