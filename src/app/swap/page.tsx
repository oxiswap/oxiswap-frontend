import { Suspense } from "react";
import { SwapSkeleton } from "./SwapSkeleton";
import SwapPageServer from './SwapPageServer';

export const runtime = "edge";

export default function SwapPage() {
  return (
    <Suspense fallback={<SwapSkeleton />}>
      <SwapPageServer />
    </Suspense>
  );
}