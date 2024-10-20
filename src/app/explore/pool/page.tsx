import { Suspense } from "react";
import PoolPageServer from './PoolPageServer';
import PoolSkeleton from './PoolSkeleton';
import { Metadata } from 'next';

export const runtime = "edge";

export const metadata: Metadata = {
  title: 'Explore',
};

export default function PoolPage() {
  return (
    <Suspense fallback={<PoolSkeleton />}>
      <PoolPageServer />
    </Suspense>
  );
}