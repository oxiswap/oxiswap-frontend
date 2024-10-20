import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ClientSwapPage = dynamic(() => import('./ClientSwapPage'), { ssr: false });

export const runtime = "edge";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex">
        <ClientSwapPage />
      </div>
    </Suspense>
  );
}