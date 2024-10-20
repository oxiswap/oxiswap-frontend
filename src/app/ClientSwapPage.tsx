import dynamic from 'next/dynamic';

const SwapPage = dynamic(() => import('./swap/page'), { ssr: false });

function ClientSwapPage() {
  return <SwapPage />;
}

export default ClientSwapPage;