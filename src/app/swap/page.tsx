import { Suspense } from "react";
import { SwapSkeleton } from "./SwapSkeleton";
import SwapPageServer from './SwapPageServer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Swap',
};

export default function SwapPage() {
  return (
    <Suspense fallback={<SwapSkeleton />}>
      <SwapPageServer />
    </Suspense>
  );
}